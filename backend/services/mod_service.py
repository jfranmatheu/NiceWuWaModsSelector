import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile, HTTPException
import shutil
import json
import uuid

from models import Mod, ModCategory, ModMetadata, Settings, ArchiveType
from .file_service import FileService, load_settings, save_settings, get_mods_dir


categories = {
    "Characters",
    "NPCs",
    "Weapons",
    "UI",
    "Other"
}

characters = {
  'Alto',
  'Baizhi',
  'Brant',
  'Calcharo',
  'Camellya',
  'Cantarella',
  'Carlotta',
  'Changli',
  'Chixia',
  'Danjin',
  'Encore',
  'Jianxin',
  'Jinhsi',
  'Jiyan',
  'Lingyang',
  'Lumi',
  'Mortefi',
  'Pheobe',
  'Roccia',
  'Rover(F)',
  'Rover(M)',
  'Sanhua',
  'Shorekeeper',
  'Taoqi',
  'Verina',
  'Xiangli Yao',
  'Yangyang',
  'Yinlin',
  'Youhu',
  'Yuanwu',
  'Zani',
  'Zhezhi',
}


class ModService:
    _instance = None

    @staticmethod
    def get_instance():
        if ModService._instance is None:
            ModService._instance = ModService()
        return ModService._instance

    def __init__(self):
        self.file_service = FileService.get_instance()
        self.settings = load_settings()
        self.mods_file = Path(get_mods_dir()) / "mods.json"
        self.mods_metadata = {}
        self.mods_metadata_id: dict[str, dict] = {}
        self._init_mods_file()

    def _init_mods_file(self):
        """Ensure mods.json exists and contains all mods from the filesystem"""
        try:
            all_mods_metadata = {}  # by category.
            all_mods_dir = get_mods_dir()
            
            # Initialize the nested structure
            for category in categories:
                if category == "Characters":
                    all_mods_metadata[category] = {}
                    for character in characters:
                        all_mods_metadata[category][character] = []
                else:
                    all_mods_metadata[category] = []

            def _find_mode_preview(mode_dirpath: Path) -> Optional[str]:
                """Find the preview image for a mod"""
                # First check if its name is "preview" followed by an image extension.
                for file in mode_dirpath.iterdir():
                    if file.name.lower().startswith("preview") and file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp', '.gif']:
                        return str(file.relative_to(all_mods_dir))
                # If none is found, check if there is a file in the same directory with an image extension.
                for file in mode_dirpath.iterdir():
                    if file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp', '.gif']:
                        return str(file.relative_to(all_mods_dir))
                return None

            # Ensure base directories exist
            self.mods_file.parent.mkdir(parents=True, exist_ok=True)
            
            ## print("Scanning for mods...", all_mods_dir)
            
            # Scan through all categories
            for category in categories:
                dirpath: Path = all_mods_dir / category
                if not dirpath.exists():
                    dirpath.mkdir()

                if category == "Characters":
                    for character in characters:
                        char_dirpath = dirpath / character
                        if not char_dirpath.exists():
                            char_dirpath.mkdir()

                        for mod_dir in char_dirpath.iterdir():
                            if not mod_dir.is_dir():
                                continue

                            metadata_filepath = mod_dir / "metadata.json"
                            if metadata_filepath.exists():
                                with open(metadata_filepath, 'r') as f:
                                    metadata = json.load(f)
                            else:
                                # New mod! Possibly added manually.
                                enabled = not mod_dir.name.startswith("DISABLED_")
                                name = mod_dir.name if enabled else mod_dir.name[9:]
                                preview_image = _find_mode_preview(mod_dir)
                                metadata = {
                                    "id": uuid.uuid4().hex,
                                    "name": name,
                                    "filename": name,
                                    "wuwa_version": "2.1.0", # use wuwa_version from user settings or latest one?
                                    "category": category,
                                    "character": character,
                                    "enabled": enabled,
                                    "created_at": datetime.now().isoformat(),
                                    "updated_at": datetime.now().isoformat(),
                                    "preview_image": preview_image,
                                }
                                # Write the metadata to the metadata.json file.
                                with open(metadata_filepath, 'w') as f:
                                    json.dump(metadata, f, indent=2)
                            
                            all_mods_metadata[category][character].append(metadata)
                            self.mods_metadata_id[metadata["id"]] = metadata

                else:
                    for mod_dir in dirpath.iterdir():
                        if not mod_dir.is_dir():
                            continue

                        metadata_filepath = mod_dir / "metadata.json"
                        if metadata_filepath.exists():
                            with open(metadata_filepath, 'r') as f:
                                metadata = json.load(f)
                        else:
                            # New mod! Possibly added manually.
                            enabled = not mod_dir.name.startswith("DISABLED_")
                            name = mod_dir.name if enabled else mod_dir.name[9:]
                            preview_image = _find_mode_preview(mod_dir)
                            metadata = {
                                "id": uuid.uuid4().hex,
                                "name": name,
                                "filename": name,
                                "category": category,
                                "character": None,
                                "enabled": enabled,
                                "created_at": datetime.now().isoformat(),
                                "updated_at": datetime.now().isoformat(),
                                "preview_image": preview_image,
                            }
                            # Write the metadata to the metadata.json file.
                            with open(metadata_filepath, 'w') as f:
                                json.dump(metadata, f, indent=2)
                        
                        all_mods_metadata[category].append(metadata)
                        self.mods_metadata_id[metadata["id"]] = metadata

            # Write all mods to mods.json
            with open(self.mods_file, 'w') as f:
                json.dump(all_mods_metadata, f, indent=2)
                
            self.mods_metadata = all_mods_metadata
            
            ## print(f"Initialized mods file with {len(all_mods_metadata)} categories")
            for category, mods in all_mods_metadata.items():
                if category == "Characters":
                    for character, char_mods in mods.items():
                        print(f"  {category}/{character}: {len(char_mods)} mods")
                else:
                    print(f"  {category}: {len(mods)} mods")

        except Exception as e:
            print(f"Error initializing mods file: {str(e)}")
            # Create an empty mods.json if there was an error
            with open(self.mods_file, 'w') as f:
                json.dump({}, f)

    async def get_mods(self, category: Optional[ModCategory] = None, character: Optional[str] = None) -> List[Mod]:
        """Get all mods, optionally filtered by category and/or character"""
        print(f"Getting mods for category: {category}, character: {character}")
        try:
            if category is None:
                mods = []
            elif category not in categories:
                raise HTTPException(status_code=400, detail="Invalid category")
            elif category == "Characters":
                if character is None:
                    mods = []
                elif character not in characters:
                    raise HTTPException(status_code=400, detail="Invalid character")
                else:
                    if category not in self.mods_metadata:
                        raise HTTPException(status_code=400, detail="Category not found")
                    category_metadata = self.mods_metadata[category]
                    if character not in category_metadata:
                        raise HTTPException(status_code=400, detail="Character not found")
                    mods = category_metadata[character]
            else:
                if category not in self.mods_metadata:
                    raise HTTPException(status_code=400, detail="Category not found")
                mods = self.mods_metadata[category]

            # Convert to Mod objects
            mods = [Mod(**mod) for mod in mods]

            return mods
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error loading mods: {str(e)}")

    async def add_mod(
        self,
        file: UploadFile,
        name: str,
        category: ModCategory,
        wuwa_version: str,
        character: Optional[str] = None,
        preview_image: Optional[UploadFile] = None
    ) -> Mod:
        """Add a new mod"""
        file_service = FileService.get_instance()
        try:
            # Save mod file
            mod_path = get_mods_dir() / file.filename
            await file_service.save_upload_file(file, mod_path)

            # Save preview image if provided (in mods folder)
            preview_path = None
            if preview_image:
                preview_filename = f"preview{Path(preview_image.filename).suffix}"
                preview_path = mod_path / preview_filename
                await file_service.save_upload_file(preview_image, preview_path)

            # Create mod object
            mod = Mod(
                id=str(datetime.now().timestamp()),
                name=name,
                filename=file.filename,
                category=category,
                character=character,
                wuwa_version=wuwa_version,
                preview_image=str(preview_path) if preview_path else None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                enabled=True
            )
            
            # Save to mods.json
            with open(self.mods_file, 'r') as f:
                mods = json.load(f)
            
            mods.append(mod.dict())
            
            with open(self.mods_file, 'w') as f:
                json.dump(mods, f, indent=2, default=str)
            
            return mod
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error adding mod: {str(e)}")

    async def delete_mod(self, mod_id: str) -> bool:
        """Delete a mod"""
        try:
            with open(self.mods_file, 'r') as f:
                mods = json.load(f)
            
            # Find mod
            mod = next((m for m in mods if m['id'] == mod_id), None)
            if not mod:
                raise HTTPException(status_code=404, detail="Mod not found")
            
            # Delete files
            mod_path = get_mods_dir() / mod['filename']
            if mod_path.exists():
                mod_path.unlink()
            
            if mod['preview_image']:
                preview_path = Path(mod['preview_image'])
                if preview_path.exists():
                    preview_path.unlink()
            
            # Remove from mods.json
            mods = [m for m in mods if m['id'] != mod_id]
            
            with open(self.mods_file, 'w') as f:
                json.dump(mods, f, indent=2, default=str)
            
            return True
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting mod: {str(e)}")

    async def toggle_mod(self, mod_id: str) -> Mod:
        """Toggle mod enabled/disabled state"""
        try:
            # Find mod
            mod = self.mods_metadata_id.get(mod_id, None)
            if not mod:
                print(f"Mod not found: {mod_id}")
                raise HTTPException(status_code=404, detail="Mod not found")
            
            ## print(f"Mod found: {mod}")

            # Toggle enabled state
            mod['enabled'] = not mod['enabled']
            mod['updated_at'] = datetime.now().isoformat()
            
            if mod['character']:
                mod_dirpath = get_mods_dir() / mod['category'] / mod['character']
            else:
                mod_dirpath = get_mods_dir() / mod['category']

            if not mod_dirpath.exists():
                print(f"Mod directory not found: {mod_dirpath}")
                raise HTTPException(status_code=404, detail="Mod directory not found")
            
            ## print(f"Mod directory found: {mod_dirpath}")

            # Add/Remove 'DISABLED_' prefix if enabled state changed.
            # NOTE: mod['filename'] DOES NOT include the 'DISABLED_' prefix.
            if mod['enabled']:
                os.rename(mod_dirpath / ('DISABLED_' + mod['filename']), mod_dirpath / mod['filename'])
            else:
                os.rename(mod_dirpath / mod['filename'], mod_dirpath / ('DISABLED_' + mod['filename']))

            with open(mod_dirpath / "metadata.json", 'w') as f:
                json.dump(mod, f, indent=2, default=str)

            print(f"Toggled mod: {mod_id}")

            return Mod(**mod)
        except Exception as e:
            print(f"Error toggling mod: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error toggling mod: {str(e)}")

    async def get_settings(self) -> dict:
        """Get application settings"""
        return load_settings()

    async def update_settings(self, settings: dict) -> dict:
        """Update application settings"""
        try:
            save_settings(settings)
            self.settings = settings
            return settings
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error updating settings: {str(e)}")
