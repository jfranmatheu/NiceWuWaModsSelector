import threading
import time
from typing import Optional
from string import Template
import os
from pathlib import Path

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
        self.check_interval = 1.0  # seconds
        self.last_game_running = False
        self.last_game_active = False
        self.last_in_skins_screen = False
        self.skins_icon_path = os.path.join(Path(__file__).parent.parent, "static", "skins_icon_ingame_screen.png")

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

    def _monitor_loop(self):
        """Main monitoring loop"""
        skins_check_counter = 0
        while self.is_running:
            try:
                is_running = self.game_detection.is_game_running()
                is_active = self.game_detection.is_game_window_active()

                # Only update UI if states have changed
                if is_running != self.last_game_running or is_active != self.last_game_active:
                    self._update_ui(is_running, is_active)

                # Check for skins screen every 2 seconds when game is running and active
                if is_running and is_active:
                    skins_check_counter += 1
                    if skins_check_counter >= 2:  # Every 2 seconds (since check_interval is 1 second)
                        skins_check_counter = 0
                        in_skins_screen = self.game_detection.detect_screen(self.skins_icon_path)
                        if in_skins_screen != self.last_in_skins_screen:
                            if in_skins_screen:
                                print("🎮 Detected Skins Screen!")
                            else:
                                print("👋 Left Skins Screen")
                            self.last_in_skins_screen = in_skins_screen
                
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
