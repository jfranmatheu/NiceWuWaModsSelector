import os
import zipfile
import py7zr
import rarfile
import json
import shutil
from pathlib import Path
from typing import Optional
from fastapi import HTTPException
import appdirs

# Get user data directory
APP_NAME = "NiceWuWaModsSelector"
USER_DATA_DIR = Path(appdirs.user_data_dir(APP_NAME))
SETTINGS_FILE = USER_DATA_DIR / "settings.json"
MODS_DIR = None  # user defined, use get_mods_dir() to get the directory


def get_mods_dir() -> Path:
    """Get the directory for a mod"""
    global MODS_DIR
    if MODS_DIR is None:
        load_settings()
    return MODS_DIR

def get_user_data_dir() -> Path:
    """Get the user data directory"""
    global USER_DATA_DIR
    if not USER_DATA_DIR.exists():
        USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
    return USER_DATA_DIR


def ensure_user_dirs():
    """Create necessary user directories if they don't exist"""
    USER_DATA_DIR.mkdir(parents=True, exist_ok=True)

def get_default_settings():
    """Get default settings"""
    return {
        "mods_folder": str(get_mods_dir()),
        "default_category": "Characters",
        "default_wuwa_version": "1.0.0"
    }

def load_settings() -> dict:
    """Load settings from user data directory"""
    ensure_user_dirs()
    
    if not SETTINGS_FILE.exists():
        # Create default settings
        settings = get_default_settings()
        save_settings(settings)
        return settings

    try:
        with open(SETTINGS_FILE, 'r') as f:
            settings = json.load(f)
            global MODS_DIR
            MODS_DIR = Path(settings["mods_folder"]) / "NiceWuWaModsSelector"
            # Ensure the mods folder exists
            MODS_DIR.mkdir(parents=True, exist_ok=True)
            return settings
    except Exception as e:
        print(f"Error loading settings: {e}")
        return get_default_settings()

def save_settings(settings: dict):
    """Save settings to user data directory"""
    ensure_user_dirs()
    
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=2)
    except Exception as e:
        print(f"Error saving settings: {e}")
        raise

class FileService:
    _instance = None
    
    @staticmethod
    def get_instance():
        if FileService._instance is None:
            FileService._instance = FileService()
        return FileService._instance

    @staticmethod
    def extract_archive(file_path: Path, extract_path: Path) -> bool:
        """Extract an archive file to the specified path"""
        try:
            if file_path.suffix.lower() == '.zip':
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_path)
            elif file_path.suffix.lower() == '.7z':
                with py7zr.SevenZipFile(file_path, 'r') as sz:
                    sz.extractall(extract_path)
            elif file_path.suffix.lower() == '.rar':
                with rarfile.RarFile(file_path, 'r') as rar:
                    rar.extractall(extract_path)
            else:
                raise HTTPException(status_code=400, detail="Unsupported archive format")
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to extract archive: {str(e)}")

    @staticmethod
    def find_preview_image(directory: Path) -> Optional[Path]:
        """Find a preview image in the directory"""
        image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
        
        # First try to find a file named 'preview'
        for ext in image_extensions:
            preview = directory / f"preview{ext}"
            if preview.exists():
                return preview

        # Then look for any image file
        for file in directory.iterdir():
            if file.suffix.lower() in image_extensions:
                return file

        return None

    @staticmethod
    def ensure_directory(path: Path) -> None:
        """Ensure a directory exists, create if it doesn't"""
        os.makedirs(path, exist_ok=True)

    @staticmethod
    def is_valid_archive(file_path: Path) -> bool:
        """Check if a file is a valid archive"""
        try:
            if file_path.suffix.lower() == '.zip':
                with zipfile.ZipFile(file_path, 'r') as _:
                    return True
            elif file_path.suffix.lower() == '.7z':
                with py7zr.SevenZipFile(file_path, 'r') as _:
                    return True
            elif file_path.suffix.lower() == '.rar':
                with rarfile.RarFile(file_path, 'r') as _:
                    return True
            return False
        except:
            return False
