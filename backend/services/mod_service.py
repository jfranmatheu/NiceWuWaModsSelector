import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile, HTTPException
import json
import uuid

from models import Mod, ModCategory, Settings, ArchiveType, Image, InstalledVersion, GameBananaData
from .categories import get_categories, get_character_categories
from .character_list import get_characters_list
from .app_service import AppService
from .utils import FileUtils

def _find_mode_images(mode_dirpath: Path) -> List[Image]:
    """Find all images for a mod"""
    images = []
    for file in mode_dirpath.iterdir():
        if file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp', '.gif']:
            # Store the path relative to the mods directory
            relative_path = file.relative_to(AppService.get().mods_dir)
            images.append(Image(
                local=True,
                filename=str(relative_path),
                caption=None
            ))
    return images

class ModService:
    _instance = None

    @staticmethod
    def get():
        if ModService._instance is None:
            ModService._instance = ModService()
        return ModService._instance

    def __init__(self):
        self.init()

    def init(self):
        self.mods_file = AppService.get().mods_dir / "mods.json"
        self.mods_metadata = {}
        self.mods_metadata_id: dict[str, dict] = {}
        self.load_mods_metadata()

    def get_mod_metadata_by_id(self, mod_id: str) -> dict:
        return self.mods_metadata_id.get(mod_id, None)

    def get_mods_metadata(self, category: ModCategory, character: Optional[str] = None) -> List[dict]:
        if category == "Characters":
            return self.mods_metadata.get(category, {}).get(character, [])
        else:
            return self.mods_metadata.get(category, [])

    def load_mods_metadata(self, force_reload: bool = False):
        """Ensure mods.json exists and contains all mods from the filesystem"""
        if self.mods_file.exists() and not force_reload:
            # Load mods metadata from mods.json.
            with open(self.mods_file, 'r') as f:
                self.mods_metadata = json.load(f)
            # Fill up self.mods_metadata_id.
            for category, mods in self.mods_metadata.items():
                if category == "Characters":
                    for character, char_mods in mods.items():
                        for mod in char_mods:
                            self.mods_metadata_id[mod["id"]] = mod
                else:
                    for mod in mods:
                        self.mods_metadata_id[mod["id"]] = mod
        else:
            # Scan mods directory and create mods.json if it doesn't exist or if force_reload is True.
            all_mods_metadata = {}  # by category.
            all_mods_dir = AppService.get().mods_dir

            # Initialize the nested structure
            for category in get_categories():
                if category == "Characters":
                    all_mods_metadata[category] = {}
                    for character in get_character_categories():
                        all_mods_metadata[category][character] = []
                else:
                    all_mods_metadata[category] = []

            # Ensure base directories exist
            self.mods_file.parent.mkdir(parents=True, exist_ok=True)

            # Scan through all categories
            for category in get_categories():
                dirpath: Path = all_mods_dir / category
                if not dirpath.exists():
                    dirpath.mkdir()

                if category == "Characters":
                    for character in get_character_categories():
                        char_dirpath = dirpath / character
                        if not char_dirpath.exists():
                            char_dirpath.mkdir()

                        for mod_dir in char_dirpath.iterdir():
                            if not mod_dir.is_dir():
                                continue
                            
                            enabled = not mod_dir.name.startswith("DISABLED_")
                            metadata_filepath = mod_dir / "metadata.json"
                            if metadata_filepath.exists():
                                with open(metadata_filepath, 'r') as f:
                                    metadata = json.load(f)
                                if metadata["enabled"] != enabled:
                                    # FIX!
                                    metadata["enabled"] = enabled
                                    metadata["updated_at"] = int(datetime.now().timestamp())
                                    with open(metadata_filepath, 'w') as f:
                                        json.dump(metadata, f, indent=2)
                            else:
                                # New mod! Possibly added manually.
                                name = mod_dir.name if enabled else mod_dir.name[9:]
                                images = _find_mode_images(mod_dir)
                                current_time = int(datetime.now().timestamp())
                                metadata = {
                                    "id": uuid.uuid4().hex,
                                    "name": name,
                                    "category": category,
                                    "character": character,
                                    "images": [img.model_dump() for img in images],
                                    "created_at": current_time,
                                    "updated_at": current_time,
                                    "enabled": enabled,
                                    "installed_versions": [],
                                    "gamebanana": None,
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
                        
                        enabled = not mod_dir.name.startswith("DISABLED_")
                        metadata_filepath = mod_dir / "metadata.json"
                        if metadata_filepath.exists():
                            with open(metadata_filepath, 'r') as f:
                                metadata = json.load(f)
                            if metadata["enabled"] != enabled:
                                # FIX!
                                metadata["enabled"] = enabled
                                metadata["updated_at"] = int(datetime.now().timestamp())
                                with open(metadata_filepath, 'w') as f:
                                    json.dump(metadata, f, indent=2)
                        else:
                            # New mod! Possibly added manually.
                            name = mod_dir.name if enabled else mod_dir.name[9:]
                            images = _find_mode_images(mod_dir)
                            current_time = int(datetime.now().timestamp())
                            metadata = {
                                "id": uuid.uuid4().hex,
                                "name": name,
                                "category": category,
                                "character": None,
                                "images": [img.model_dump() for img in images],
                                "created_at": current_time,
                                "updated_at": current_time,
                                "enabled": enabled,
                                "installed_versions": [],
                                "gamebanana": None,
                            }
                            # Write the metadata to the metadata.json file.
                            with open(metadata_filepath, 'w') as f:
                                json.dump(metadata, f, indent=2)
                        
                        all_mods_metadata[category].append(metadata)
                        self.mods_metadata_id[metadata["id"]] = metadata

            # Write all mods to mods.json
            FileUtils.write_json(self.mods_file, all_mods_metadata)

            self.mods_metadata = all_mods_metadata

    def add_mod_metadata(self, metadata: dict):
        """Add a new mod metadata to the mods.json file"""
        self.mods_metadata_id[metadata["id"]] = metadata
        if metadata["category"] == "Characters":
            self.mods_metadata[metadata["category"]][metadata["character"]].append(metadata)
        else:
            self.mods_metadata[metadata["category"]].append(metadata)

    async def get_mods(self, category: Optional[ModCategory] = None, character: Optional[str] = None) -> List[Mod]:
        """Get all mods, optionally filtered by category and/or character"""
        print(f"Getting mods for category: {category}, character: {character}")
        try:
            if category is None:
                mods = []
            elif category not in get_categories():
                raise HTTPException(status_code=400, detail="Invalid category")
            elif category == "Characters":
                if character is None:
                    mods = []
                elif character not in get_character_categories():
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
        character: Optional[str] = None,
        preview_image: Optional[UploadFile] = None
    ) -> Mod:
        """Add a new mod"""
        app_service = AppService.get()
        try:
            # Get mod directory path and create it if it doesn't exist.
            mod_dirpath = app_service.mods_dir / category
            if character:
                mod_dirpath = mod_dirpath / character
            mod_dirpath = mod_dirpath / name
            FileUtils.ensure_directory(mod_dirpath, parents=False)

            # Save mod file
            await app_service.save_upload_file(file, mod_dirpath)

            # Save preview image if provided
            images = []
            if preview_image:
                preview_filename = f"preview{Path(preview_image.filename).suffix}"
                preview_path = mod_dirpath / preview_filename
                await app_service.save_upload_file(preview_image, preview_path)
                images.append(Image(
                    local=True,
                    filename=str(preview_path.relative_to(app_service.mods_dir)),
                    caption=None
                ))

            # Fill metadata and create Mod object
            current_time = int(datetime.now().timestamp())
            mod_metadata = {
                "id": str(uuid.uuid4()),
                "name": name,
                "category": category,
                "character": character,
                "images": [img.model_dump() for img in images],
                "created_at": current_time,
                "updated_at": current_time,
                "enabled": False,
                "installed_versions": [],
                "gamebanana": None,
            }
            mod = Mod(**mod_metadata)

            # Write metadata.json
            FileUtils.write_json(mod_dirpath / "metadata.json", mod_metadata)

            # Update mods metadata.
            if character:
                self.mods_metadata[category][character].append(mod_metadata)
            else:
                self.mods_metadata[category].append(mod_metadata)
            self.mods_metadata_id[mod_metadata["id"]] = mod_metadata

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
            mod_path = AppService.get().mods_dir / mod['category']
            if mod['character']:
                mod_path = mod_path / mod['character']
            mod_path = mod_path / mod['name']
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

    async def toggle_mod(self, mod_id: str, exclusive: bool = False) -> list[Mod]:
        """Toggle mod enabled/disabled state. If exclusive is True, disable all other mods for the same character.
        Returns a list of all affected mods when exclusive is True, or just the toggled mod when exclusive is False."""
        try:
            # Find mod
            mod = self.mods_metadata_id.get(mod_id, None)
            if not mod:
                print(f"Mod not found: {mod_id}")
                raise HTTPException(status_code=404, detail="Mod not found")

            affected_mods = [mod]  # List to track all mods that were affected

            # If we're enabling the mod and exclusive is True, disable all other mods for the same character
            if exclusive and not mod['enabled'] and mod['character']:
                # Get all mods for the same character
                character_mods = self.mods_metadata.get("Characters", {}).get(mod['character'], [])
                for other_mod in character_mods:
                    if other_mod['id'] != mod_id and other_mod['enabled']:
                        # Disable the other mod
                        other_mod['enabled'] = False
                        other_mod['updated_at'] = int(datetime.now().timestamp())
                        affected_mods.append(other_mod)
                        
                        # Rename the directory
                        other_mod_dirpath = AppService.get().mods_dir / other_mod['category'] / other_mod['character']
                        if other_mod_dirpath.exists():
                            os.rename(
                                other_mod_dirpath / other_mod['name'],
                                other_mod_dirpath / ('DISABLED_' + other_mod['name'])
                            )
                            
                            # Update metadata file
                            with open(other_mod_dirpath / "metadata.json", 'w') as f:
                                json.dump(other_mod, f, indent=2)

            # Toggle enabled state
            mod['enabled'] = not mod['enabled']
            mod['updated_at'] = int(datetime.now().timestamp())
            
            if mod['character']:
                mod_dirpath = AppService.get().mods_dir / mod['category'] / mod['character']
            else:
                mod_dirpath = AppService.get().mods_dir / mod['category']

            if not mod_dirpath.exists():
                print(f"Mod directory not found: {mod_dirpath}")
                raise HTTPException(status_code=404, detail="Mod directory not found")

            # Add/Remove 'DISABLED_' prefix if enabled state changed.
            if mod['enabled']:
                os.rename(mod_dirpath / ('DISABLED_' + mod['name']), mod_dirpath / mod['name'])
            else:
                os.rename(mod_dirpath / mod['name'], mod_dirpath / ('DISABLED_' + mod['name']))

            with open(mod_dirpath / "metadata.json", 'w') as f:
                json.dump(mod, f, indent=2)

            print(f"Toggled mod: {mod_id}")

            # If we're in game mode (exclusive toggle), request a mod refresh
            if exclusive:
                from services.game_state_monitor import GameStateMonitor
                GameStateMonitor.get().request_mod_refresh()

            # Return all affected mods if exclusive, otherwise just the toggled mod
            if exclusive:
                return [Mod(**mod) for mod in affected_mods]
            return Mod(**mod)
        except Exception as e:
            print(f"Error toggling mod: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error toggling mod: {str(e)}")
