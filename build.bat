@echo off
REM QKD-Lab Complete Build Script (Windows)
REM ========================================
REM
REM This script builds the complete QKD-Lab application as a single
REM distributable package for Windows.
REM

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%backend
set FRONTEND_DIR=%SCRIPT_DIR%frontend
set TAURI_DIR=%FRONTEND_DIR%\src-tauri
set VENV_DIR=%SCRIPT_DIR%.venv

echo ===============================================================
echo           QKD-Lab Complete Build System (Windows)
echo ===============================================================
echo.

REM Check prerequisites
echo [1/6] Checking prerequisites...

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do echo   OK Python: %%i

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo   OK Node.js: %%i

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: pnpm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('pnpm --version') do echo   OK pnpm: %%i

where rustc >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Rust is not installed
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('rustc --version') do echo   OK Rust: %%i

REM Get target triple
for /f "tokens=2" %%i in ('rustc -vV ^| findstr host') do set TARGET_TRIPLE=%%i
echo   OK Target: %TARGET_TRIPLE%

REM Setup Python environment
echo.
echo [2/6] Setting up Python environment...

if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo   Creating virtual environment...
    python -m venv "%VENV_DIR%"
)

call "%VENV_DIR%\Scripts\activate.bat"
pip install --quiet --upgrade pip
pip install --quiet -r "%BACKEND_DIR%\requirements.txt"
pip install --quiet pyinstaller
echo   OK Python environment ready

REM Build backend executable
echo.
echo [3/6] Building backend executable...

cd /d "%BACKEND_DIR%"
pyinstaller qkd-backend.spec --clean --noconfirm --log-level WARN

set BACKEND_EXE=%BACKEND_DIR%\dist\qkd-backend.exe
if not exist "%BACKEND_EXE%" (
    echo ERROR: Backend build failed
    pause
    exit /b 1
)
echo   OK Backend built

REM Copy backend to Tauri binaries
echo.
echo [4/6] Preparing Tauri sidecar...

set BINARIES_DIR=%TAURI_DIR%\binaries
if not exist "%BINARIES_DIR%" mkdir "%BINARIES_DIR%"

set SIDECAR_NAME=qkd-backend-%TARGET_TRIPLE%.exe
copy /Y "%BACKEND_EXE%" "%BINARIES_DIR%\%SIDECAR_NAME%" >nul
echo   OK Sidecar ready: %SIDECAR_NAME%

REM Install frontend dependencies
echo.
echo [5/6] Building frontend...

cd /d "%FRONTEND_DIR%"
call pnpm install --silent
echo   OK Dependencies installed

REM Build Tauri app
echo.
echo [6/6] Building Tauri application...

call pnpm tauri build

echo.
echo ===============================================================
echo                      BUILD COMPLETE!
echo ===============================================================
echo.
echo Output location:
echo   %TAURI_DIR%\target\release\bundle\
echo.
echo The application is a standalone package that:
echo   - Runs without Python installation
echo   - Starts backend automatically
echo   - Works on any Windows system
echo.

pause
