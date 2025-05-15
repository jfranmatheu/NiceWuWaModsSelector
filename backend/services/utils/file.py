
import zipfile
import rarfile
import py7zr
from pathlib import Path
from typing import Optional
from fastapi import HTTPException
import json
import os


class FileUtils:
    """
    This class is used to manage files and directories.
    """

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
    def ensure_directory(path: Path, parents: bool = True) -> None:
        """Ensure a directory exists, create if it doesn't"""
        if isinstance(path, str):
            path = Path(path)
        if not path.exists():
            path.mkdir(parents=parents)

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
        
    @staticmethod
    def read_json(file_path: Path) -> dict:
        """Read a JSON file"""
        with open(file_path, 'r') as f:
            return json.load(f)
        
    @staticmethod
    def write_json(file_path: Path, data: dict):
        """Write a JSON file"""
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
