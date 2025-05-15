from operator import is_
import threading
import time
from typing import Optional
from string import Template
import os
from pathlib import Path
import webview

from services.game_detection_service import GameDetectionService


change_game_indicator_color = Template("""
const gameIndicator = document.querySelector('[data-game-indicator]');
const activeIndicator = document.querySelector('[data-active-indicator]');

if (gameIndicator) {
    gameIndicator.style.color = "$running_indicator_color";
}

if (activeIndicator) {
    activeIndicator.style.color = "$active_indicator_color";
}
""")


class GameStateMonitor:
    _instance = None
    
    @staticmethod
    def get():
        if GameStateMonitor._instance is None:
            GameStateMonitor._instance = GameStateMonitor()
        return GameStateMonitor._instance

    def __init__(self):
        self.game_detection = GameDetectionService.get()
        self.window = None
        self.monitor_thread: Optional[threading.Thread] = None
        self.is_running = False
        self.check_interval = .65  # seconds
        self.last_game_running = False
        self.last_game_active = False
        self.last_in_skins_screen = False
        self.skins_icon_path = os.path.join(Path(__file__).parent.parent, "static", "skins_icon_ingame_screen.png")
        self.original_window_size = None
        self.original_window_position = None
        self.detection_threshold = 0.867  # Threshold for template matching
        self.pending_mod_refresh = False  # Flag to indicate if we need to refresh mods

    def request_mod_refresh(self):
        """Request a mod refresh in the game"""
        self.pending_mod_refresh = True

    def _get_screen_for_window(self, x: int, y: int) -> Optional[webview.Screen]:
        """Get the screen that contains the given coordinates"""
        for screen in webview.screens:
            if (screen.x <= x <= screen.x + screen.width and 
                screen.y <= y <= screen.y + screen.height):
                return screen
        return None

    def start_monitoring(self, window):
        """Start monitoring the game state"""
        if self.monitor_thread is not None:
            return

        self.window = window
        self.is_running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()

    def stop_monitoring(self):
        """Stop monitoring the game state"""
        self.is_running = False
        if self.monitor_thread is not None:
            self.monitor_thread.join()
            self.monitor_thread = None

    def _enter_ingame_mode(self):
        """Enter in-game mode UI"""
        if not self.window:
            return

        # Store original window state
        if not self.original_window_size:
            self.original_window_size = self.window.width, self.window.height
            self.original_window_position = self.window.x, self.window.y

        # Get game window dimensions
        game_rect = self.game_detection.get_game_window_rect()
        if not game_rect:
            return

        # Get the screen where the game window is located
        game_screen = self._get_screen_for_window(game_rect[0], game_rect[1])
        if not game_screen:
            print("Could not determine game screen")
            return
        
        print(f"Game screen: {game_screen.x}, {game_screen.y}, {game_screen.width}, {game_screen.height}")

        # Calculate new window size and position
        game_width = game_rect[2] - game_rect[0]
        game_height = game_rect[3] - game_rect[1]
        new_width = int(game_width * 0.15)  # 15% of game width
        new_height = game_height
        new_x = game_rect[2]  # Right edge of game window
        new_y = game_rect[1]  # Same top position as game

        # Ensure the new position is within the game screen bounds
        screen_right = game_screen.x + game_screen.width
        screen_bottom = game_screen.y + game_screen.height
        
        # Adjust X position to ensure window stays within screen
        if new_x + new_width > screen_right:
            new_x = screen_right - new_width - 1
        # If window would be too far left, align with left edge of screen
        if new_x < game_screen.x:
            new_x = game_screen.x
            
        # Adjust Y position to ensure window stays within screen
        if new_y + new_height > screen_bottom:
            new_y = screen_bottom - new_height
        # If window would be too high, align with top edge of screen
        if new_y < game_screen.y:
            new_y = game_screen.y

        # Move and resize the window
        self.window.resize(new_width, new_height)
        time.sleep(0.33)
        self.window.on_top = True
        self.window.transparent = True

        # Update frontend state
        js_code = """
            window.isInGameMode = true;
            document.body.classList.add('in-game-mode');
            // Force React to update
            window.dispatchEvent(new CustomEvent('ingame-mode-change', { detail: { isInGameMode: true } }));
        """
        self.window.evaluate_js(js_code)

        self.window.move(game_screen.x + game_screen.width * .1, game_screen.y)

    def _exit_ingame_mode(self):
        """Exit in-game mode UI"""
        if not self.window or not self.original_window_size:
            return

        # Restore original window state
        self.window.resize(*self.original_window_size)
        self.window.move(*self.original_window_position)
        self.window.on_top = False

        # Update frontend state
        js_code = """
            window.isInGameMode = false;
            document.body.classList.remove('in-game-mode');
            // Force React to update
            window.dispatchEvent(new CustomEvent('ingame-mode-change', { detail: { isInGameMode: false } }));
        """
        self.window.evaluate_js(js_code)

    def _monitor_loop(self):
        """Main monitoring loop"""
        skins_check_counter = 0
        while self.is_running:
            try:
                is_running = self.game_detection.is_game_running()
                is_active = self.game_detection.is_game_window_active()

                if not is_active and self.window.on_top:
                    self.window.on_top = False

                if not is_active and self.last_game_active and self.window.focus:
                    is_active = True

                # Only update UI if states have changed
                if is_running != self.last_game_running or is_active != self.last_game_active:
                    self._update_ui(is_running, is_active)

                # Check for skins screen every 2 seconds when game is running and active
                if is_running and is_active:
                    # Handle pending mod refresh
                    if self.pending_mod_refresh:
                        print("🔄 Refreshing mods in game...")
                        self.window.on_top = False
                        if self.game_detection.send_f10_to_game():
                            print("✅ F10 sent successfully")
                        else:
                            print("❌ Failed to send F10")
                        self.window.on_top = True
                        self.pending_mod_refresh = False

                    skins_check_counter += 1
                    if skins_check_counter >= 2:  # Every 2 seconds (since check_interval is 1 second)
                        skins_check_counter = 0

                        # Get the match value from template matching
                        detected, match_value = self.game_detection.detect_screen(self.skins_icon_path, self.detection_threshold, return_match_value=True)

                        if detected and not self.last_in_skins_screen:
                            print(f"🎮 Detected Skins Screen! (Match: {match_value:.3f})")
                            self._enter_ingame_mode()
                            self.last_in_skins_screen = True
                        elif not detected and self.last_in_skins_screen:
                            print(f"👋 Left Skins Screen! (Match: {match_value:.3f})")
                            self._exit_ingame_mode()
                            self.last_in_skins_screen = False

                else:
                    if self.last_in_skins_screen:
                        self._exit_ingame_mode()
                        self.last_in_skins_screen = False

                time.sleep(self.check_interval)
            except Exception as e:
                print(f"Error in game state monitor: {e}")
                # If we get a Windows API error, wait a bit longer before retrying
                if "EnumWindows" in str(e):
                    time.sleep(5.0)  # Wait 5 seconds before retrying
                else:
                    time.sleep(self.check_interval)

    def _update_ui(self, is_running: bool, is_active: bool):
        """Update the UI with the current game state"""
        if not self.window:
            return

        try:
            print("Updating UI with game state: running={}, active={}".format(is_running, is_active))

            # Update the game state indicators using JavaScript
            red_color = "#ef4444"
            green_color = "#22c55e"
            yellow_color = "#eab308"
            running_indicator_color = green_color if is_running else red_color
            active_indicator_color = green_color if is_active else yellow_color

            js_code = change_game_indicator_color.substitute(running_indicator_color=running_indicator_color, active_indicator_color=active_indicator_color)
            self.window.evaluate_js(js_code)

            self.last_game_running = is_running
            self.last_game_active = is_active
        except Exception as e:
            print(f"Error updating UI: {e}")
