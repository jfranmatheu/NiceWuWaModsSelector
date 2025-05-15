import zipfile
import rarfile
import py7zr
import shutil
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
    def _check_unrar():
        """Check if unrar is installed"""
        unrar_path = shutil.which('unrar')
        if not unrar_path:
            print("unrar executable not found in PATH")
            raise HTTPException(
                status_code=500,
                detail="unrar executable not found. Please install unrar to extract RAR files. "
                       "On Windows, you can install it via: https://www.rarlab.com/rar_add.htm"
            )
        print(f"Found unrar at: {unrar_path}")

    @staticmethod
    def extract_archive(file_path: Path, extract_path: Path) -> bool:
        """Extract an archive file to the specified path"""
        try:
            print(f"Extracting {file_path} to {extract_path}")
            
            if file_path.suffix.lower() == '.zip':
                print("Detected ZIP archive")
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_path)
            elif file_path.suffix.lower() == '.7z':
                print("Detected 7Z archive")
                with py7zr.SevenZipFile(file_path, 'r') as sz:
                    sz.extractall(extract_path)
            elif file_path.suffix.lower() == '.rar':
                print("Detected RAR archive")
                FileUtils._check_unrar()
                with rarfile.RarFile(file_path, 'r') as rar:
                    rar.extractall(extract_path)
            else:
                print(f"Unsupported archive format: {file_path.suffix}")
                raise HTTPException(status_code=400, detail=f"Unsupported archive format: {file_path.suffix}")
            
            print("Extraction completed successfully")
            return True
        except HTTPException:
            raise
        except Exception as e:
            print(f"Failed to extract archive: {str(e)}")
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
            print(f"Validating archive: {file_path}")
            
            if file_path.suffix.lower() == '.zip':
                print("Validating ZIP archive")
                with zipfile.ZipFile(file_path, 'r') as _:
                    return True
            elif file_path.suffix.lower() == '.7z':
                print("Validating 7Z archive")
                with py7zr.SevenZipFile(file_path, 'r') as _:
                    return True
            elif file_path.suffix.lower() == '.rar':
                print("Validating RAR archive")
                FileUtils._check_unrar()
                with rarfile.RarFile(file_path, 'r') as _:
                    return True
            
            print(f"Unsupported archive format: {file_path.suffix}")
            return False
        except HTTPException:
            raise
        except Exception as e:
            print(f"Failed to validate archive: {str(e)}")
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
