# QKD-Lab 🔐

<div align="center">

![QKD-Lab Banner](https://img.shields.io/badge/Quantum-Key%20Distribution-blueviolet?style=for-the-badge&logo=atom)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)
[![Build Status](https://img.shields.io/github/actions/workflow/status/AnvinX1/qkd-LAB/build.yml?style=for-the-badge)](https://github.com/AnvinX1/qkd-LAB/actions)
[![Release](https://img.shields.io/github/v/release/AnvinX1/qkd-LAB?style=for-the-badge)](https://github.com/AnvinX1/qkd-LAB/releases)

**A production-grade BB84 Quantum Key Distribution simulator with eavesdropper detection and real-time visualization.**

[Download](#-installation) • [Features](#-features) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### Simulation Engine
- **BB84 Protocol** — Complete implementation of the Bennett-Brassard 1984 quantum key distribution protocol
- **Eavesdropper Simulation** — Eve's intercept-resend attack with configurable interception probability
- **Realistic Physics** — Fiber attenuation, detector efficiency, and channel noise modeling
- **Shor-Preskill Security** — Asymptotic secret key rate calculation with proper entropy bounds

### Interactive Interface
- **Real-time Visualization** — Watch Alice and Bob's bit streams with mismatch highlighting
- **Parameter Controls** — Adjust photons, distance, noise, and attack parameters on the fly
- **QBER Analysis** — Quantum Bit Error Rate monitoring with security threshold alerts
- **Dark/Light Theme** — Modern UI with warm light mode and pitch-black dark mode

### Research Tools
- **Parameter Sweeps** — Analyze how any parameter affects QBER and key rate
- **Monte Carlo Analysis** — Statistical averaging over multiple trials
- **CSV Export** — Export simulation data for external analysis
- **Graph Visualization** — Interactive charts for distance vs QBER, noise impact, etc.

### Desktop Application
- **Cross-Platform** — Runs on Windows, macOS, and Linux
- **Self-Contained** — No Python or Node.js installation required
- **Automatic Backend** — Simulation server starts and stops with the app

---

## 📸 Screenshots

<div align="center">
<table>
<tr>
<td><img src="docs/screenshot-light.png" alt="Light Mode" width="400"/></td>
<td><img src="docs/screenshot-dark.png" alt="Dark Mode" width="400"/></td>
</tr>
<tr>
<td align="center"><em>Light Mode</em></td>
<td align="center"><em>Dark Mode</em></td>
</tr>
</table>
</div>

---

## 📥 Installation

### Option 1: Download Pre-built Release (Recommended)

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| **Windows** | [QKD-Lab_x64.msi](https://github.com/AnvinX1/qkd-LAB/releases/latest) |
| **macOS** | [QKD-Lab.dmg](https://github.com/AnvinX1/qkd-LAB/releases/latest) |
| **Linux (AppImage)** | [QKD-Lab.AppImage](https://github.com/AnvinX1/qkd-LAB/releases/latest) |
| **Linux (Debian)** | [QKD-Lab.deb](https://github.com/AnvinX1/qkd-LAB/releases/latest) |
| **Linux (Fedora)** | [QKD-Lab.rpm](https://github.com/AnvinX1/qkd-LAB/releases/latest) |

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/AnvinX1/qkd-LAB.git
cd qkd-LAB

# Build complete application (Linux/macOS)
./build.sh

# Build complete application (Windows)
build.bat
```

**Prerequisites for building:**
- Python 3.10+
- Node.js 18+
- Rust 1.77+
- pnpm (`npm install -g pnpm`)

---

## 🚀 Quick Start

### Running the Desktop App

Just download and run — the backend starts automatically!

### Development Mode

**Terminal 1 — Backend:**
```bash
./start-backend.sh   # Linux/macOS
start-backend.bat    # Windows
```

**Terminal 2 — Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

Open http://localhost:3000

---

## 🔬 The Physics

### BB84 Protocol Overview

```
Alice                    Quantum Channel                    Bob
  │                                                          │
  ├─── Generate random bits ──────────────────────────────►  │
  ├─── Choose random bases (⊕/⊗) ─────────────────────────►  │
  │                            │                             │
  │                      [Eve intercepts?]                   │
  │                            │                             │
  │    ◄─────────────────── Choose bases ────────────────────┤
  │    ◄─────────────────── Measure photons ─────────────────┤
  │                                                          │
  ├─── Announce bases ───────────────────────────────────────┤
  │    (public classical channel)                            │
  │                                                          │
  ├─── Sift matching bases ──────────────────────────────────┤
  ├─── Calculate QBER ───────────────────────────────────────┤
  ├─── Privacy amplification ────────────────────────────────┤
  │                                                          │
  └─── Secure shared key! ◄──────────────────────────────────┘
```

### Key Formulas

**Channel Transmittance:**
$$T(\alpha, L) = 10^{-\alpha L / 10}$$

**Secret Key Rate (Shor-Preskill):**
$$R = R_{sifted} \times [1 - 2H(Q)]$$

where $H(Q) = -Q\log_2(Q) - (1-Q)\log_2(1-Q)$ is the binary entropy.

**Security Threshold:**
$$Q_{max} \approx 11\%$$

Above this QBER, no secure key can be extracted.

---

## 📖 Documentation

- [Setup Guide](SETUP.md) — Detailed build and installation instructions
- [Backend API](backend/README.md) — REST API documentation with physics details
- [In-App Docs](frontend/components/DocumentationPanel.tsx) — Comprehensive protocol explanation

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/simulate` | POST | Run single BB84 simulation |
| `/sweep` | POST | Parameter sweep analysis |
| `/sweep/param` | POST | Generic single-parameter sweep |
| `/monte-carlo` | POST | Monte Carlo statistical analysis |
| `/health` | GET | Server health check |

---

## 🏗️ Architecture

```
qkd-LAB/
├── backend/                 # Python FastAPI simulation engine
│   ├── core/               # BB84 protocol implementation
│   │   ├── alice.py        # Sender (bit/basis generation)
│   │   ├── bob.py          # Receiver (measurement)
│   │   ├── eve.py          # Eavesdropper (intercept-resend)
│   │   ├── channel.py      # Quantum channel (attenuation)
│   │   ├── sifting.py      # Basis reconciliation
│   │   ├── metrics.py      # QBER calculation
│   │   └── privacy.py      # Secret key rate
│   └── utils/              # Entropy, RNG helpers
├── frontend/               # Next.js + Tauri desktop app
│   ├── app/               # Next.js app router
│   ├── components/        # React UI components
│   ├── lib/               # API client, utilities
│   └── src-tauri/         # Rust Tauri wrapper
├── build.sh               # One-click build script
└── .github/workflows/     # CI/CD pipeline
```

---

## 🔧 Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend type checking
cd frontend
pnpm typecheck
```

### Code Style

- **Python**: Black, isort, mypy
- **TypeScript**: ESLint, Prettier
- **Rust**: rustfmt, clippy

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

This means:
- ✅ You can use, modify, and distribute this software
- ✅ You must credit the original author
- ⚠️ Any modifications must be open-sourced under the same license
- ⚠️ Network use counts as distribution

---

## 🙏 Acknowledgments

- Bennett & Brassard for the BB84 protocol (1984)
- Shor & Preskill for the security proof (2000)
- The Tauri team for the amazing desktop framework
- shadcn/ui for beautiful React components

---

<div align="center">

**Made with ❤️ for quantum cryptography education**

[![GitHub stars](https://img.shields.io/github/stars/AnvinX1/qkd-LAB?style=social)](https://github.com/AnvinX1/qkd-LAB)

</div>
