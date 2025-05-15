# NiceWuWaModsSelector Backend

## Overview
The backend is built with Python 3.11 and FastAPI, providing a RESTful API for the frontend application. It handles mod management, file operations, and GameBanana integration.

## API Endpoints

### Mods
- `GET /api/mods` - Get all mods
  - Query params: `category`, `character`
- `POST /api/mods` - Add new mod
  - Body: FormData with mod file and metadata
- `DELETE /api/mods/{mod_id}` - Delete mod
- `PATCH /api/mods/{mod_id}/toggle` - Toggle mod enabled/disabled state
- `POST /api/mods/gamebanana` - Install mod from GameBanana URL
  - Body: `{ url: string }`

### Settings
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings
  - Body: `{ mods_dir: string}`
- `POST /api/browse-folder` - Open folder browser dialog
  - Returns: `{ folder: string }`

## Data Models

### Mod
```python
class Mod(BaseModel):
    id: str
    name: str
    filename: str
    category: str
    character: Optional[str]
    wuwa_version: str
    preview_image: Optional[str]
    created_at: datetime
    updated_at: datetime
    source_url: Optional[str]
    archive_type: str
    enabled: bool
```

### Settings
```python
class Settings(BaseModel):
    mods_dir: str
```

## File Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── mods.py
│   │   └── settings.py
│   └── services/
│       ├── __init__.py
│       ├── mod_service.py
│       ├── gamebanana_service.py
│       └── app_service.py
├── requirements.txt
└── README.md
```

## Dependencies
- FastAPI
- uvicorn
- python-multipart
- aiofiles
- requests
- Pillow
- py7zr
- rarfile

## Setup
1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Features
- Mod file management (zip/7z/rar)
- GameBanana integration
- File system operations
- Settings management
- Error handling and logging
- CORS support for frontend
- File upload handling
- Image processing

## Error Handling
- Custom exception classes
- HTTP status codes
- Error messages
- Logging

## Security
- Input validation
- File type checking
- Path traversal prevention
- CORS configuration

## Next Steps
1. Implement mod versioning
2. Add mod update checking
3. Implement mod backup/restore
4. Add user authentication
5. Implement cloud sync
6. Add mod conflict detection
7. Implement mod dependencies 