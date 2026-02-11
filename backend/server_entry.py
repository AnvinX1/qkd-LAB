#!/usr/bin/env python3
"""
QKD-Lab Backend - Bundled Entry Point
=====================================

This is the main entry point for the PyInstaller-bundled backend.
It starts the uvicorn server with the FastAPI application.
"""

import os
import sys
import signal

# When running as a PyInstaller bundle, we need to set up paths correctly
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    bundle_dir = sys._MEIPASS
    os.chdir(bundle_dir)
    sys.path.insert(0, bundle_dir)


def main():
    """Start the QKD-Lab backend server."""
    import uvicorn
    from main import app
    
    # Get configuration from environment or use defaults
    host = os.environ.get("QKD_HOST", "127.0.0.1")
    port = int(os.environ.get("QKD_PORT", "8000"))
    
    # Handle shutdown gracefully
    def signal_handler(signum, frame):
        print("\nShutting down QKD-Lab backend...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print(f"🔬 QKD-Lab Backend Server")
    print(f"   Listening on: http://{host}:{port}")
    print(f"   API Docs: http://{host}:{port}/docs")
    print()
    
    # Run the server
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info",
        access_log=True,
    )


if __name__ == "__main__":
    main()
