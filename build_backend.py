#!/usr/bin/env python3
"""
Build script to create a standalone Python backend executable.
Uses PyInstaller to bundle the backend into a single executable.

Usage:
    python build_backend.py

Output:
    dist/qkd-backend (or qkd-backend.exe on Windows)
"""

import subprocess
import sys
import platform
from pathlib import Path

BACKEND_DIR = Path(__file__).parent / "backend"
DIST_DIR = Path(__file__).parent / "dist"


def main():
    # Ensure PyInstaller is installed
    try:
        import PyInstaller  # type: ignore  # noqa: F401
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    print("Building QKD-Lab backend executable...")
    
    # Determine the output name based on platform
    exe_name = "qkd-backend"
    if platform.system() == "Windows":
        exe_name = "qkd-backend.exe"

    # PyInstaller command
    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--onefile",
        "--name", "qkd-backend",
        "--distpath", str(DIST_DIR),
        "--workpath", str(Path(__file__).parent / "build"),
        "--specpath", str(Path(__file__).parent / "build"),
        "--add-data", f"{BACKEND_DIR / 'core'}:core",
        "--add-data", f"{BACKEND_DIR / 'utils'}:utils",
        "--hidden-import", "uvicorn.logging",
        "--hidden-import", "uvicorn.protocols.http",
        "--hidden-import", "uvicorn.protocols.http.auto",
        "--hidden-import", "uvicorn.protocols.websockets",
        "--hidden-import", "uvicorn.protocols.websockets.auto",
        "--hidden-import", "uvicorn.lifespan",
        "--hidden-import", "uvicorn.lifespan.on",
        "--hidden-import", "uvicorn.lifespan.off",
        str(BACKEND_DIR / "run_server.py"),
    ]

    print("Running:", " ".join(cmd))
    subprocess.check_call(cmd)

    output_path = DIST_DIR / exe_name
    if output_path.exists():
        print(f"\n✓ Build successful!")
        print(f"  Output: {output_path}")
        print(f"  Size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")
    else:
        print("\n✗ Build failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
