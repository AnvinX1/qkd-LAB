#!/bin/bash
#
# QKD-Lab Complete Build Script
# =============================
#
# This script builds the complete QKD-Lab application as a single
# distributable package. The final product includes:
#   - Tauri desktop app (frontend)
#   - Bundled Python backend (runs automatically)
#
# Usage:
#   ./build.sh [--release]
#
# Output:
#   frontend/src-tauri/target/release/bundle/
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
TAURI_DIR="$FRONTEND_DIR/src-tauri"
VENV_DIR="$SCRIPT_DIR/.venv"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          QKD-Lab Complete Build System                    ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo

# Check prerequisites
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"

# Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo -e "${RED}Error: Python is not installed${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Python: $($PYTHON_CMD --version)"

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js: $(node --version)"

# pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} pnpm: $(pnpm --version)"

# Rust
if ! command -v rustc &> /dev/null; then
    echo -e "${RED}Error: Rust is not installed${NC}"
    exit 1
fi
echo -e "  ${GREEN}✓${NC} Rust: $(rustc --version | cut -d' ' -f2)"

# Get target triple
TARGET_TRIPLE=$(rustc -vV | grep host | awk '{print $2}')
echo -e "  ${GREEN}✓${NC} Target: $TARGET_TRIPLE"

# Step 2: Setup Python environment
echo
echo -e "${BLUE}[2/6] Setting up Python environment...${NC}"

if [ ! -d "$VENV_DIR" ]; then
    echo -e "  Creating virtual environment..."
    $PYTHON_CMD -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"
pip install --quiet --upgrade pip
pip install --quiet -r "$BACKEND_DIR/requirements.txt"
pip install --quiet pyinstaller
echo -e "  ${GREEN}✓${NC} Python environment ready"

# Step 3: Build backend executable
echo
echo -e "${BLUE}[3/6] Building backend executable...${NC}"

cd "$BACKEND_DIR"
pyinstaller qkd-backend.spec --clean --noconfirm --log-level WARN

BACKEND_EXE="$BACKEND_DIR/dist/qkd-backend"
if [ ! -f "$BACKEND_EXE" ]; then
    echo -e "${RED}Error: Backend build failed${NC}"
    exit 1
fi

BACKEND_SIZE=$(du -h "$BACKEND_EXE" | cut -f1)
echo -e "  ${GREEN}✓${NC} Backend built: $BACKEND_SIZE"

# Step 4: Copy backend to Tauri binaries
echo
echo -e "${BLUE}[4/6] Preparing Tauri sidecar...${NC}"

BINARIES_DIR="$TAURI_DIR/binaries"
mkdir -p "$BINARIES_DIR"

SIDECAR_NAME="qkd-backend-$TARGET_TRIPLE"
cp "$BACKEND_EXE" "$BINARIES_DIR/$SIDECAR_NAME"
chmod +x "$BINARIES_DIR/$SIDECAR_NAME"

echo -e "  ${GREEN}✓${NC} Sidecar ready: $SIDECAR_NAME"

# Step 5: Install frontend dependencies
echo
echo -e "${BLUE}[5/6] Building frontend...${NC}"

cd "$FRONTEND_DIR"
pnpm install --silent
echo -e "  ${GREEN}✓${NC} Dependencies installed"

# Step 6: Build Tauri app
echo
echo -e "${BLUE}[6/6] Building Tauri application...${NC}"

pnpm tauri build

echo
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    BUILD COMPLETE!                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo
echo -e "Output location:"
echo -e "  ${CYAN}$TAURI_DIR/target/release/bundle/${NC}"
echo
echo -e "The application is a standalone package that:"
echo -e "  • Runs without Python installation"
echo -e "  • Starts backend automatically"
echo -e "  • Works on any compatible system"
echo

# List the built bundles
if [ -d "$TAURI_DIR/target/release/bundle" ]; then
    echo -e "Built packages:"
    find "$TAURI_DIR/target/release/bundle" -maxdepth 2 -type f \( -name "*.deb" -o -name "*.AppImage" -o -name "*.dmg" -o -name "*.msi" -o -name "*.exe" \) 2>/dev/null | while read f; do
        SIZE=$(du -h "$f" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $(basename "$f") ($SIZE)"
    done
fi
