@echo off
REM QKD-Lab Backend Startup Script (Windows)
REM =========================================
REM
REM This script sets up and starts the Python backend server.
REM It will create a virtual environment if one doesn't exist.
REM

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%backend
set VENV_DIR=%SCRIPT_DIR%.venv

echo ========================================
echo    QKD-Lab Backend Server Launcher
echo ========================================
echo.

REM Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=*" %%i in ('python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"') do set PYTHON_VERSION=%%i
for /f "tokens=*" %%i in ('python -c "import sys; print(sys.version_info.major)"') do set PYTHON_MAJOR=%%i
for /f "tokens=*" %%i in ('python -c "import sys; print(sys.version_info.minor)"') do set PYTHON_MINOR=%%i

if %PYTHON_MAJOR% lss 3 (
    echo ERROR: Python 3.10+ is required ^(found %PYTHON_VERSION%^)
    pause
    exit /b 1
)
if %PYTHON_MAJOR% equ 3 if %PYTHON_MINOR% lss 10 (
    echo ERROR: Python 3.10+ is required ^(found %PYTHON_VERSION%^)
    pause
    exit /b 1
)

echo [OK] Python %PYTHON_VERSION% detected

REM Create virtual environment if needed
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv "%VENV_DIR%"
    echo [OK] Virtual environment created
)

REM Activate virtual environment
call "%VENV_DIR%\Scripts\activate.bat"
echo [OK] Virtual environment activated

REM Install dependencies
echo Installing dependencies...
pip install --quiet --upgrade pip
pip install --quiet -r "%BACKEND_DIR%\requirements.txt"
echo [OK] Dependencies installed

REM Start the server
echo.
echo Starting server...
cd /d "%BACKEND_DIR%"
python run_server.py %*

pause
