@echo off
SETLOCAL

echo Activating Python virtual environment...
call backend\.venv\Scripts\activate
IF ERRORLEVEL 1 (
    echo ERROR: Failed to activate virtual environment.
    exit /b 1
)

echo Launching GUI application...
python backend\main.py

ENDLOCAL
exit /b 0