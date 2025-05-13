from enum import Enum
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List, Dict

class ModCategory(str, Enum):
    CHARACTERS = "Characters"
    NPCS = "NPCs"
    WEAPONS = "Weapons"
    UI = "UI"
    OTHER = "Other"

class ArchiveType(str, Enum):
    ZIP = "zip"
    SEVEN_ZIP = "7z"
    RAR = "rar"

class ModMetadata(BaseModel):
    name: str
    filename: str
    category: ModCategory
    character: Optional[str] = None
    wuwa_version: str
    preview_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    source_url: Optional[str] = None
    archive_type: ArchiveType
    enabled: bool = True

class Mod(BaseModel):
    id: str
    name: str
    filename: str
    category: ModCategory
    character: Optional[str] = None
    wuwa_version: str
    preview_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    source_url: Optional[str] = None
    enabled: bool = True

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class Settings(BaseModel):
    mods_folder: str
    default_category: ModCategory = ModCategory.CHARACTERS
    default_wuwa_version: str = "2.1.0"

class GameBananaInstallRequest(BaseModel):
    modData: Dict
    selectedFiles: List[int]

    class Config:
        validate_by_name = True

    @validator('selectedFiles', pre=True)
    def validate_selected_files(cls, v):
        if not isinstance(v, list):
            raise ValueError('selectedFiles must be a list')
        
        # Filter out None values and convert to integers
        valid_ids = []
        for x in v:
            if x is not None:
                try:
                    valid_ids.append(int(x))
                except (ValueError, TypeError):
                    continue
        
        if not valid_ids:
            raise ValueError('No valid file IDs provided')
            
        return valid_ids
