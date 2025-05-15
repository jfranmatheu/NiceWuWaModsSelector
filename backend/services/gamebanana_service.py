import re
import httpx
from pathlib import Path
from typing import Dict, List, Optional
from fastapi import HTTPException
import json
import uuid
from datetime import datetime

from .app_service import AppService
from .utils import FileUtils


class GameBananaService:
    _instance = None
    
    @staticmethod
    def get():
        if GameBananaService._instance is None:
            GameBananaService._instance = GameBananaService()
        return GameBananaService._instance

    def __init__(self):
        self.base_url = "https://gamebanana.com"
        self.api_base_url = f"{self.base_url}/apiv11"
        self.headers = {
            "User-Agent": "NiceWuWaModsSelector/1.0"
        }
        self.download_dir = AppService.get().appdata_dir / 'downloaded_mods'
        FileUtils.ensure_directory(self.download_dir, parents=False)

    async def install_from_url(self, mod_data: Dict, selected_files: List[int]) -> Dict:
        """Install selected files from a GameBanana mod"""
        try:
            # Map category names
            category = mod_data['_aSuperCategory']['_sName']
            if category == "Skins":
                category = "Characters"

            character = mod_data['_aCategory']['_sName']
            mod_name = mod_data['_sName']

            print(f"Installing mod: {mod_name} (Category: {category}, Character: {character})")

            # Create mod directory
            mod_dir = AppService.get().mods_dir / category
            if category == "Characters":
                mod_dir = mod_dir / character
            mod_dir = mod_dir / mod_name
            mod_dir.mkdir(parents=True, exist_ok=True)

            print(f"Created mod directory: {mod_dir}")

            # Download and install selected files
            installed_versions = []
            for file_id in selected_files:
                file_data = next((f for f in mod_data['_aFiles'] if f['_idRow'] == file_id), None)
                if not file_data:
                    print(f"File not found: {file_id}")
                    continue

                print(f"Processing file: {file_data['_sFile']}")

                # Download file
                download_path = self.download_dir / file_data['_sFile']
                try:
                    await self.download_file(file_data['_sDownloadUrl'], download_path)
                    print(f"Downloaded file to: {download_path}")
                except Exception as e:
                    print(f"Failed to download file: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")

                # Extract file
                try:
                    if FileUtils.is_valid_archive(download_path):
                        print(f"Extracting archive: {download_path}")
                        FileUtils.extract_archive(download_path, mod_dir)
                        print(f"Extracted to: {mod_dir}")
                        installed_versions.append({
                            "id": file_data['_idRow'],
                            "date": file_data['_tsDateAdded'],
                            "name": file_data['_sFile'],
                            "url": file_data['_sDownloadUrl'],
                            "description": file_data['_sDescription'],
                            "size": file_data['_nFilesize']
                        })
                    else:
                        print(f"Invalid archive: {download_path}")
                        raise HTTPException(status_code=400, detail=f"Invalid archive format: {file_data['_sFile']}")
                except Exception as e:
                    print(f"Failed to extract archive: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Failed to extract archive: {str(e)}")
                finally:
                    # Clean up downloaded file
                    try:
                        download_path.unlink()
                        print(f"Cleaned up downloaded file: {download_path}")
                    except Exception as e:
                        print(f"Failed to clean up downloaded file: {str(e)}")

            # Process images from GameBanana
            images = []
            if mod_data['_aPreviewMedia'] and mod_data['_aPreviewMedia']['_aImages']:
                for img in mod_data['_aPreviewMedia']['_aImages']:
                    images.append({
                        "local": False,
                        "filename": img['_sFile'],
                        # "filename_100": img.get('_sFile100', img['_sFile']),
                        "caption": img.get('_sCaption', '')
                    })

            # Create metadata.json
            metadata = {
                "id": str(uuid.uuid4()),
                "name": mod_name,
                "category": category,
                "character": character if category == "Characters" else None,
                "images": images,
                "created_at": mod_data['_tsDateAdded'],
                "updated_at": mod_data['_tsDateModified'],
                "enabled": True,
                "installed_versions": installed_versions,
                "gamebanana": {
                    "id": mod_data['_idRow'],
                    "page_url": mod_data['_sProfileUrl'],
                    "author_id": mod_data['_aSubmitter']['_idRow']
                }
            }

            # Save metadata
            try:
                with open(mod_dir / "metadata.json", 'w') as f:
                    json.dump(metadata, f, indent=2)
                print(f"Saved metadata to: {mod_dir / 'metadata.json'}")
            except Exception as e:
                print(f"Failed to save metadata: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to save metadata: {str(e)}")

            # Reload mods
            try:
                from .mod_service import ModService
                ModService.get().add_mod_metadata(metadata)
                print("Updated mods metadata")
            except Exception as e:
                print(f"Failed to update mods metadata: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to update mods metadata: {str(e)}")

            return metadata

        except HTTPException:
            raise
        except Exception as e:
            print(f"Failed to install mod: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to install mod: {str(e)}")

    async def download_file(self, download_url: str, save_path: Path) -> bool:
        """Download a file from GameBanana"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(download_url, headers=self.headers, follow_redirects=True)
                response.raise_for_status()
                
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                return True
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
