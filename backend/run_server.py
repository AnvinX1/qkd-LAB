#!/usr/bin/env python3
"""
QKD-Lab Backend Server Launcher
===============================

Cross-platform script to start the FastAPI backend server.
Can be run standalone or bundled with the Tauri application.

Usage:
    python run_server.py [--host HOST] [--port PORT] [--reload]

Environment Variables:
    QKD_HOST    - Server host (default: 127.0.0.1)
    QKD_PORT    - Server port (default: 8000)
    QKD_RELOAD  - Enable auto-reload (default: false)
"""

import argparse
import os
import sys
from pathlib import Path

# Ensure the backend directory is in the path
BACKEND_DIR = Path(__file__).parent.absolute()
sys.path.insert(0, str(BACKEND_DIR))


def main():
    parser = argparse.ArgumentParser(
        description="QKD-Lab BB84 Simulation Backend Server"
    )
    parser.add_argument(
        "--host",
        type=str,
        default=os.environ.get("QKD_HOST", "127.0.0.1"),
        help="Host to bind the server to (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("QKD_PORT", "8000")),
        help="Port to bind the server to (default: 8000)",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=os.environ.get("QKD_RELOAD", "").lower() in ("true", "1", "yes"),
        help="Enable auto-reload for development",
    )
    args = parser.parse_args()

    try:
        import uvicorn
    except ImportError:
        print("Error: uvicorn is not installed.")
        print("Please run: pip install -r requirements.txt")
        sys.exit(1)

    print(f"🔬 Starting QKD-Lab Backend Server...")
    print(f"   Host: {args.host}")
    print(f"   Port: {args.port}")
    print(f"   Reload: {args.reload}")
    print(f"   API Docs: http://{args.host}:{args.port}/docs")
    print()

    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        log_level="info",
    )


if __name__ == "__main__":
    main()
