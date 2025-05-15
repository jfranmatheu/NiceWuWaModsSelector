from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os
from typing import Optional
import webview
import threading
from contextlib import asynccontextmanager
from pydantic import BaseModel

from models import Mod, ModCategory, GameBananaInstallRequest, Character, CharacterResponse, GameBananaCategory
from services.mod_service import ModService
from services.gamebanana_service import GameBananaService
from services.app_service import AppService
from services.character_list import get_characters_list
from services.categories import get_categories, get_character_categories, mount_character_subcategories

# Initialize services.
app_service = None
mod_service = None
gamebanana_service = None

class ModsDirRequest(BaseModel):
    mods_dir: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize data on startup and cleanup on shutdown"""
    # Startup
    await get_characters_list()
    await mount_character_subcategories()
    global app_service, mod_service, gamebanana_service
    app_service = AppService.get()
    mod_service = ModService.get()
    gamebanana_service = GameBananaService.get()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="NiceWuWaModsSelector API",
    description="API for managing Wuthering Waves mods.",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:3000",  # Next.js dev server
    "http://127.0.0.1:3000", # Next.js dev server
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173", # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Global window instance
window = None

def create_window():
    """Create the pywebview window"""
    global window
    window = webview.create_window(
        'NiceWuWaModsSelector',
        'http://localhost:3000',
        width=1280,
        height=720,
        resizable=True,
        min_size=(920, 640),
        frameless=True,
        easy_drag=False,
        background_color="#000000"
    )


@app.get("/")
async def read_root():
    return {"message": "Welcome to NiceWuWaModsSelector API"}

@app.get("/api/preview/{category}/{character}/{preview_path:path}")
async def get_preview(category: str, character: str, preview_path: str):
    """Get a mod preview image"""
    try:
        global app_service
        # Normalize the path to use the correct directory separator
        preview_path = preview_path.replace('/', os.sep).replace('\\', os.sep)
        # Construct the full path to the preview image
        preview_file = Path(app_service.mods_dir) / category / character / preview_path
        
        print("get_preview: ", str(preview_file))

        if not preview_file.exists():
            raise HTTPException(status_code=404, detail=f"Preview image not found: {preview_file}")
            
        return FileResponse(preview_file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mod Management Endpoints
@app.get("/api/mods")
async def get_mods(category: Optional[ModCategory] = None, character: Optional[str] = None):
    """Get all mods, optionally filtered by category and/or character"""
    global mod_service
    return await mod_service.get_mods(category, character)

@app.post("/api/mods")
async def create_mod(
    file: UploadFile = File(...),
    name: str = Form(...),
    category: ModCategory = Form(...),
    wuwa_version: str = Form(...),
    character: Optional[str] = Form(None),
    preview_image: Optional[UploadFile] = File(None)
):
    """Add a new mod"""
    global mod_service
    return await mod_service.add_mod(file, name, category, wuwa_version, character, preview_image)

@app.delete("/api/mods/{mod_id}")
async def delete_mod(mod_id: str):
    """Delete a mod"""
    global mod_service
    return await mod_service.delete_mod(mod_id)

@app.patch("/api/mods/{mod_id}/toggle")
async def toggle_mod(mod_id: str):
    """Enable/disable a mod"""
    global mod_service
    return await mod_service.toggle_mod(mod_id)

# GameBanana Integration
@app.post("/api/mods/gamebanana")
async def install_from_gamebanana(request: GameBananaInstallRequest):
    """Install selected files from a GameBanana mod"""
    ## print("install_from_gamebanana: mod_data: ", request.modData)
    ## print("install_from_gamebanana: selected_files: ", request.selectedFiles)
    global gamebanana_service
    return await gamebanana_service.install_from_url(request.modData, request.selectedFiles)

# Settings
@app.get("/api/settings")
async def get_settings() -> dict:
    """Get application settings"""
    global app_service
    return app_service.settings

# Verify Mods Directory
@app.post("/api/mods/verify-mods-dir")
async def verify_mods_dir(request: ModsDirRequest):
    """Check if the mods directory exists"""
    global app_service
    return {"isValid": app_service.verify_mods_dir(request.mods_dir)}

# Update Settings
@app.put("/api/settings")
async def update_settings(settings: dict):
    """Update application settings"""
    global app_service
    return app_service.update_settings(settings)

@app.post("/api/browse-folder")
async def browse_folder():
    """Open folder browser dialog"""
    if window is None:
        raise HTTPException(status_code=500, detail="Window not initialized")
    
    try:
        folder = window.create_file_dialog(
            webview.FOLDER_DIALOG,
            directory=os.path.expanduser("~"),
            allow_multiple=False
        )
        
        if folder and len(folder) > 0:
            return {"folder": folder[0]}
        return {"folder": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/image/{filepath:path}")
async def get_image(filepath: str):
    """Get an image from an arbitrary filepath"""
    try:
        global app_service
        # Normalize the path to use the correct directory separator
        filepath = filepath.replace('/', os.sep).replace('\\', os.sep)
        
        # Construct the full path by joining with mods_dir
        image_path = app_service.mods_dir / filepath

        # Security check: Ensure the file exists and is a file (not a directory)
        if not image_path.exists() or not image_path.is_file():
            raise HTTPException(status_code=404, detail=f"Image not found: {image_path}")
            
        # Security check: Ensure it's an image file
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
        if image_path.suffix.lower() not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")
        
        return FileResponse(str(image_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/characters", response_model=CharacterResponse)
async def get_characters():
    """Get character data from cache or fetch if not available"""
    return await get_characters_list()

def start_server():
    """Start the FastAPI server"""
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

if __name__ == "__main__":
    # Start the FastAPI server in a separate thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Create and start the window
    create_window()
    webview.start(debug=True)
