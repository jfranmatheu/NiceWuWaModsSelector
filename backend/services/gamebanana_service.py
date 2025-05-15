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

            # Create mod directory
            mod_dir = AppService.get().mods_dir / category
            if category == "Characters":
                mod_dir = mod_dir / character
            mod_dir = mod_dir / mod_name
            mod_dir.mkdir(parents=True, exist_ok=True)

            # Download and install selected files
            installed_files = []
            for file_id in selected_files:
                file_data = next((f for f in mod_data['_aFiles'] if f['_idRow'] == file_id), None)
                if not file_data:
                    continue

                # Download file
                download_path = self.download_dir / file_data['_sFile']
                await self.download_file(file_data['_sDownloadUrl'], download_path)

                # Extract file
                if FileUtils.is_valid_archive(download_path):
                    FileUtils.extract_archive(download_path, mod_dir)
                    installed_files.append(file_data['_sFile'])

                # Clean up downloaded file
                download_path.unlink()

            # Create metadata.json
            preview_image = None
            if mod_data['_aPreviewMedia'] and mod_data['_aPreviewMedia']['_aImages']:
                first_image = mod_data['_aPreviewMedia']['_aImages'][0]
                preview_image = f"{first_image['_sBaseUrl']}/{first_image['_sFile530'] or first_image['_sFile']}"

            metadata = {
                "id": str(uuid.uuid4()),
                "name": mod_name,
                "filename": mod_name,
                "category": category,
                "character": character if category == "Characters" else None,
                "wuwa_version": mod_data.get('_sVersion', '1.0'),
                "enabled": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "preview_image": preview_image,
                "source_url": mod_data['_sProfileUrl'],
                "author": mod_data['_aSubmitter']['_sName'],
                "installed_files": installed_files
            }

            # Save metadata
            with open(mod_dir / "metadata.json", 'w') as f:
                json.dump(metadata, f, indent=2)

            # Reload mods
            from .mod_service import ModService
            ModService.get_instance()._init_mods_file()

            return metadata

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
