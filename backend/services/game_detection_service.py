import win32gui
import win32con
import win32process
import psutil
import cv2
import numpy as np
import pyautogui
from typing import Optional, Tuple

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

    def detect_screen(self, template_path: str, threshold: float = 0.8) -> bool:
        """
        Detect if a specific screen is visible using template matching
        template_path: Path to the template image to match
        threshold: Matching threshold (0-1)
        """
        screen = self.capture_game_screen()
        if screen is None:
            return False

        template = cv2.imread(template_path)
        if template is None:
            return False

        result = cv2.matchTemplate(screen, template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, _ = cv2.minMaxLoc(result)
        
        return max_val >= threshold 

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
