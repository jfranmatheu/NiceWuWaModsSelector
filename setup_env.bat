@echo off
SETLOCAL

REM --- Create Virtual Environment ---
echo Setting up Python virtual environment...
call backend\.venv\Scripts\activate
IF ERRORLEVEL 1 (
    echo Creating virtual environment.
    virtualenv backend\.venv --python=3.11
    IF ERRORLEVEL 1 (
        echo ERROR: Failed to create virtual environment.
        exit /b 1
    )
    call backend\.venv\Scripts\activate
)

echo Virtual environment activated.

REM --- Install Dependencies ---
call pip install --upgrade pip
call pip install -r backend\requirements.txt
IF ERRORLEVEL 1 (
    echo ERROR: Failed to install dependencies.
    exit /b 1
)

echo Python environment setup complete.
ENDLOCAL
exit /b 0