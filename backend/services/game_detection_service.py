import win32gui
import win32con
import win32process
import win32api
import ctypes
import psutil
import cv2
import numpy as np
import pyautogui
from typing import Optional, Tuple
import time

class GameDetectionService:
    _instance = None
    
    @staticmethod
    def get():
        if GameDetectionService._instance is None:
            GameDetectionService._instance = GameDetectionService()
        return GameDetectionService._instance

    def __init__(self):
        self.game_window_title = "Wuthering Waves"  # Adjust this to match your game's window title
        self.game_window_handle = None
        self.game_process_name = "Client-Win64-Shipping.exe"  # Updated to match the actual process name

    def find_game_window(self) -> Optional[int]:
        """Find the game window handle"""
        def callback(hwnd, extra):
            if win32gui.IsWindowVisible(hwnd):
                window_title = win32gui.GetWindowText(hwnd)
                if self.game_window_title in window_title:
                    self.game_window_handle = hwnd
                    return False
            return True

        win32gui.EnumWindows(callback, None)
        return self.game_window_handle

    def is_game_running(self) -> bool:
        """Check if the game process is running"""
        for proc in psutil.process_iter(['name']):
            if proc.info['name'] == self.game_process_name:
                return True
        return False

    def is_game_window_active(self) -> bool:
        """Check if the game window is the active window"""
        if not self.game_window_handle:
            self.find_game_window()
        
        if not self.game_window_handle:
            return False

        try:
            return win32gui.GetForegroundWindow() == self.game_window_handle
        except:
            self.game_window_handle = None
            return False

    def get_game_window_rect(self) -> Optional[Tuple[int, int, int, int]]:
        """Get the game window position and size"""
        if not self.game_window_handle:
            self.find_game_window()
        
        if not self.game_window_handle:
            return None

        try:
            return win32gui.GetWindowRect(self.game_window_handle)
        except:
            self.game_window_handle = None
            return None

    def capture_game_screen(self) -> Optional[np.ndarray]:
        """Capture the game window screen"""
        rect = self.get_game_window_rect()
        if not rect:
            return None

        try:
            x, y, width, height = rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]
            screenshot = pyautogui.screenshot(region=(x, y, width, height))
            return cv2.cvtColor(np.array(screenshot), cv2.COLOR_RGB2BGR)
        except:
            return None

    def detect_screen(self, template_path: str, threshold: float = 0.8, return_match_value: bool = False) -> bool | tuple[bool, float]:
        """
        Detect if a specific screen is visible using template matching.
        
        Args:
            template_path: Path to the template image
            threshold: Minimum similarity threshold (0-1)
            return_match_value: If True, returns tuple of (detected, match_value)
            
        Returns:
            bool: True if screen is detected
            tuple[bool, float]: If return_match_value is True, returns (detected, match_value)
        """
        try:
            # Capture the game window
            screenshot = self.capture_game_screen()
            if screenshot is None:
                return (False, 0.0) if return_match_value else False

            # Load and preprocess the template
            template = cv2.imread(template_path)
            if template is None:
                print(f"Error: Could not load template image from {template_path}")
                return (False, 0.0) if return_match_value else False

            # Convert both images to grayscale
            screenshot_gray = cv2.cvtColor(screenshot, cv2.COLOR_BGR2GRAY)
            template_gray = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)

            # Perform template matching
            result = cv2.matchTemplate(screenshot_gray, template_gray, cv2.TM_CCOEFF_NORMED)
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
            
            if return_match_value:
                return max_val >= threshold, max_val
            return max_val >= threshold

        except Exception as e:
            print(f"Error in detect_screen: {e}")
            return (False, 0.0) if return_match_value else False

    def detect_screen_in_game(self, template_path: str, threshold: float = 0.8) -> bool:
        """
        Detect if a specific screen is visible in the game window
        template_path: Path to the template image to match
        threshold: Matching threshold (0-1)
        """
        if not self.game_window_handle:
            self.find_game_window()

        if not self.game_window_handle:
            return False

        try:
            x, y, width, height = win32gui.GetWindowRect(self.game_window_handle)
            screenshot = pyautogui.screenshot(region=(x, y, width, height))
            template = cv2.imread(template_path)
            if template is None:
                return False

            result = cv2.matchTemplate(screenshot, template, cv2.TM_CCOEFF_NORMED)
            _, max_val, _, _ = cv2.minMaxLoc(result)
            
            return max_val >= threshold
        except:
            return False

    def send_f10_to_game(self) -> bool:
        """Send F10 key to the game window to refresh mods"""
        try:
            # Send F10 key using keybd_event
            win32api.keybd_event(win32con.VK_F10, 0, 0, 0)  # Key down
            time.sleep(0.1)
            win32api.keybd_event(win32con.VK_F10, 0, win32con.KEYEVENTF_KEYUP, 0)  # Key up
            return True
        except Exception as e:
            print(f"Error sending F10 to game: {e}")
            return False
