# QKD-Lab Setup Guide

Complete instructions for building and distributing QKD-Lab.

---

## 🚀 One-Click Build (Recommended)

Build the complete standalone application with a single command:

```bash
# Linux/macOS
./build.sh

# Windows
build.bat
```

This creates ready-to-distribute packages in:
```
frontend/src-tauri/target/release/bundle/
├── appimage/QKD-Lab_0.1.0_amd64.AppImage  (Linux - portable)
├── deb/QKD-Lab_0.1.0_amd64.deb            (Debian/Ubuntu)
├── rpm/QKD-Lab-0.1.0-1.x86_64.rpm         (Fedora/RHEL)
└── msi/QKD-Lab_0.1.0_x64.msi              (Windows)
```

**Users just download and run - no Python or setup needed!**

---

## Prerequisites (for building)

| Software | Version | Download |
|----------|---------|----------|
| **Python** | 3.10+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 8+ | `npm install -g pnpm` |
| **Rust** | 1.77+ | [rustup.rs](https://rustup.rs/) |

### Linux Additional Dependencies

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget \
    libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget \
    libappindicator-gtk3 librsvg2-devel
```

---

## Distribution

### For End Users

Just give them the appropriate package:

| Platform | File | Installation |
|----------|------|--------------|
| **Linux (Any)** | `QKD-Lab_0.1.0_amd64.AppImage` | Make executable and run |
| **Ubuntu/Debian** | `QKD-Lab_0.1.0_amd64.deb` | `sudo dpkg -i QKD-Lab*.deb` |
| **Fedora/RHEL** | `QKD-Lab-0.1.0-1.x86_64.rpm` | `sudo rpm -i QKD-Lab*.rpm` |
| **Windows** | `QKD-Lab_0.1.0_x64.msi` | Double-click to install |
| **macOS** | `QKD-Lab_0.1.0.dmg` | Drag to Applications |

### What's Included

The built application is **completely self-contained**:
- ✅ Frontend (Next.js web app)
- ✅ Backend (Python FastAPI server - bundled as executable)
- ✅ No Python installation required
- ✅ No Node.js required
- ✅ Backend starts automatically on app launch
- ✅ Backend stops automatically on app close

---

## Troubleshooting

### Backend won't start

1. **Check Python version:** `python3 --version` (needs 3.10+)
2. **Check virtual environment:** Is it activated?
3. **Check dependencies:** `pip install -r backend/requirements.txt`
4. **Check port:** Is port 8000 already in use?
   ```bash
   # Check what's using port 8000
   lsof -i :8000  # Linux/macOS
   netstat -ano | findstr :8000  # Windows
   ```

### Frontend can't connect to backend

1. **Check backend is running:** Open http://localhost:8000/health
2. **Check environment variable:** Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. **Check CORS:** Backend allows all origins by default

### Tauri build fails

1. **Check Rust:** `rustc --version`
2. **Check Tauri CLI:** `cargo install tauri-cli`
3. **Check dependencies:**
   - Linux: `sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`
   - macOS: Xcode Command Line Tools
   - Windows: Visual Studio Build Tools

---

## Project Structure

```
QKD-lab/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # API endpoints
│   ├── run_server.py       # Server launcher
│   ├── requirements.txt    # Python dependencies
│   ├── core/               # Simulation logic
│   └── utils/              # Helper utilities
├── frontend/               # Next.js + Tauri frontend
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # API client & utilities
│   └── src-tauri/          # Tauri configuration
├── start-backend.sh        # Linux/macOS backend launcher
├── start-backend.bat       # Windows backend launcher
├── build_backend.py        # PyInstaller build script
└── SETUP.md               # This file
```

---

## API Reference

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/simulate` | POST | Run BB84 simulation |
| `/sweep` | POST | Parameter sweep (distance/noise) |
| `/sweep/param` | POST | Generic single-parameter sweep |
| `/monte-carlo` | POST | Monte Carlo trials |
| `/health` | GET | Health check |

---

## Support

For issues or questions, check:
1. The [API documentation](http://localhost:8000/docs) (when backend is running)
2. The in-app Documentation panel
3. The `backend/README.md` for physics details
