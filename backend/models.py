from enum import Enum
from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List, Dict, Union, Any

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

class Image(BaseModel):
    local: bool
    filename: str
    caption: Optional[str] = None

class InstalledVersion(BaseModel):
    id: int
    date: int
    name: str
    url: str
    description: str
    size: int

class GameBananaData(BaseModel):
    id: int
    page_url: str
    author_id: int

class Mod(BaseModel):
    id: str
    name: str
    category: ModCategory
    character: Optional[str] = None
    images: List[Image] = []
    created_at: int
    updated_at: int
    enabled: bool = False
    installed_versions: List[InstalledVersion] = []
    gamebanana: Optional[GameBananaData] = None

    @validator('created_at', 'updated_at', pre=True)
    def parse_datetime(cls, v):
        if isinstance(v, int):
            return v
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v)
            except ValueError:
                return v
        return v

class Settings(BaseModel):
    mods_dir: str

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

class GameBananaCategory(BaseModel):
    cat_id: int
    cat_url: str
    cat_mod_count: int

class Character(BaseModel):
    name: str
    icon: str
    cardImage: str
    weapon: str
    element: str
    rarity: str
    unitId: str
    id: str
    isNew: bool
    upcoming: bool
    gamebanana: Optional[GameBananaCategory] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class CharacterResponse(BaseModel):
    characters: List[Character]
