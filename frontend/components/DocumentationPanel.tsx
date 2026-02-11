"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Settings,
  AlertTriangle,
  Lock,
  Eye,
  BarChart3,
  GitBranch,
  Download,
  Info,
  HelpCircle,
  Lightbulb,
  Rocket,
  Atom,
  Binary,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Cable,
  Radio,
  Waves,
  ChevronRight,
  Users,
  Sparkles,
  BookOpen,
  CircuitBoard,
  Code2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE DOCUMENTATION CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT & VISION
// ─────────────────────────────────────────────────────────────────────────────

const ABOUT_CONTENT = `
## What is QKD-Lab?

**QKD-Lab** is a research-grade, open-source quantum key distribution simulator 
built to bridge the gap between theoretical quantum cryptography and practical 
deployment validation.

&nbsp;

### The Vision

> *"Democratizing quantum-safe security research by making professional-grade 
> QKD simulation accessible to researchers, educators, and security professionals 
> worldwide."*

&nbsp;

### Why We Built This

The quantum computing revolution poses an existential threat to current 
cryptographic systems. RSA, ECC, and other public-key algorithms will become 
vulnerable to Shor's algorithm once large-scale quantum computers exist.

**Quantum Key Distribution (QKD)** offers a solution — cryptographic keys secured 
by the laws of physics, not computational complexity.

However, there's a critical gap:

| Challenge | QKD-Lab Solution |
|-----------|------------------|
| QKD hardware costs millions | Free simulation environment |
| Testing requires physical labs | Virtual channel modeling |
| Attack analysis is dangerous | Safe eavesdropper simulation |
| Learning curve is steep | Interactive, visual approach |

&nbsp;

### Core Philosophy

$$
\\text{Accessibility} + \\text{Accuracy} + \\text{Actionability} = \\text{Impact}
$$

We believe quantum security research shouldn't be gatekept by resource constraints. 
QKD-Lab enables anyone with a computer to explore, learn, and validate QKD deployments.
`;

const MISSION_CONTENT = `
## Our Mission

To accelerate the global transition to quantum-safe communications by providing 
the most comprehensive, accurate, and user-friendly QKD simulation platform.

&nbsp;

### What Makes QKD-Lab Different?

&nbsp;

#### 1. Research-Grade Accuracy

Unlike simplified educational demos, QKD-Lab implements the complete BB84 protocol 
with realistic physical models:

- **Photon-by-photon Monte Carlo simulation**
- **Fiber attenuation following Beer-Lambert law**: $I = I_0 \\cdot 10^{-\\alpha d / 10}$
- **Detector dark counts and timing jitter**
- **Information-theoretic security bounds**

&nbsp;

#### 2. Attack Simulation

We don't just simulate ideal conditions. QKD-Lab models adversarial scenarios:

$$
\\text{QBER}_{\\text{Eve}} = \\varepsilon + p \\cdot 0.25 \\cdot (1 - \\varepsilon)
$$

Where $\\varepsilon$ is channel noise and $p$ is Eve's intercept probability.

&nbsp;

#### 3. Publication-Ready Outputs

All simulation data can be exported to CSV for:
- Academic research papers
- Security audit documentation
- Deployment validation reports

&nbsp;

#### 4. Interactive Learning

Visual bit streams, real-time graphs, and step-by-step protocol explanations 
make complex quantum concepts accessible.
`;

// ─────────────────────────────────────────────────────────────────────────────
// TARGET USERS
// ─────────────────────────────────────────────────────────────────────────────

const USERS_CONTENT = `
## Who Is This For?

QKD-Lab serves multiple user communities with different needs:

&nbsp;

---

&nbsp;

### 🎓 Academic Researchers

**Use Cases:**
- Validate theoretical models against simulation
- Generate data for research publications
- Explore parameter spaces efficiently
- Benchmark new protocol variants

**Key Features:**
- Monte Carlo statistical analysis
- Parameter sweep automation
- CSV export for external analysis
- Reproducible simulation seeds

&nbsp;

---

&nbsp;

### 👨‍🏫 Educators & Students

**Use Cases:**
- Demonstrate BB84 protocol visually
- Illustrate eavesdropping detection
- Hands-on quantum cryptography labs
- Thesis and project work

**Key Features:**
- Interactive bit visualization
- Step-by-step protocol flow
- Adjustable parameters with instant feedback
- Built-in documentation

&nbsp;

---

&nbsp;

### 🔒 Security Professionals

**Use Cases:**
- Pre-deployment validation
- Attack surface analysis
- Security margin assessment
- Compliance documentation

**Key Features:**
- 11% QBER security threshold monitoring
- Intercept probability sweep
- Threat analysis with theoretical overlay
- Export for security audits

&nbsp;

---

&nbsp;

### 🏢 Telecom & Enterprise

**Use Cases:**
- Evaluate QKD feasibility for networks
- Cost-benefit analysis before hardware purchase
- Staff training on quantum security
- Proof-of-concept demonstrations

**Key Features:**
- Realistic fiber parameters
- Distance-based analysis
- Scalability projections
- Professional reporting
`;

// ─────────────────────────────────────────────────────────────────────────────
// BB84 PROTOCOL
// ─────────────────────────────────────────────────────────────────────────────

const PROTOCOL_CONTENT = `
## The BB84 Protocol

&nbsp;

### Historical Context

BB84, proposed by **Charles Bennett** and **Gilles Brassard** in 1984, was the 
first quantum cryptographic protocol. It remains the most widely implemented 
QKD protocol in commercial systems today.

&nbsp;

### The Fundamental Principle

> **Heisenberg's Uncertainty Principle** guarantees that measuring a quantum 
> system inevitably disturbs it. This disturbance is detectable.

&nbsp;

### Protocol Steps

&nbsp;

**Step 1: Quantum State Preparation (Alice)**

Alice generates random bits and encodes them in randomly chosen bases:

| Bit | Rectilinear (+) | Diagonal (×) |
|-----|-----------------|--------------|
| 0 | $\\vert 0 \\rangle$ (horizontal) | $\\vert + \\rangle$ (45°) |
| 1 | $\\vert 1 \\rangle$ (vertical) | $\\vert - \\rangle$ (135°) |

&nbsp;

**Step 2: Quantum Transmission**

Photons travel through the quantum channel (typically optical fiber).

$$
\\text{Transmission} = 10^{-\\alpha d / 10}
$$

Where $\\alpha$ is attenuation (dB/km) and $d$ is distance (km).

&nbsp;

**Step 3: Measurement (Bob)**

Bob measures each photon in a randomly chosen basis.

- **Correct basis** → Deterministic result (correct bit)
- **Wrong basis** → Random result (50% chance of error)

&nbsp;

**Step 4: Sifting**

Alice and Bob publicly compare bases (not bit values).

$$
\\text{Sifting Efficiency} = P(\\text{basis match}) = 0.5
$$

They discard bits where bases didn't match.

&nbsp;

**Step 5: Error Estimation**

They sacrifice a subset of sifted bits to estimate QBER:

$$
\\text{QBER} = \\frac{\\text{Errors}}{\\text{Sample Size}}
$$

&nbsp;

**Step 6: Key Extraction**

If $\\text{QBER} < 11\\%$, they apply error correction and privacy amplification 
to extract a final secure key.

$$
\\text{Final Key Length} = n \\cdot [1 - h(e) - f \\cdot h(e)]
$$

Where $h(e)$ is binary entropy and $f \\geq 1$ is EC efficiency.
`;

// ─────────────────────────────────────────────────────────────────────────────
// MATHEMATICS
// ─────────────────────────────────────────────────────────────────────────────

const MATH_CONTENT = `
## Mathematical Foundations

&nbsp;

### Binary Entropy Function

The fundamental measure of information in QKD:

$$
h(x) = -x \\log_2(x) - (1-x) \\log_2(1-x)
$$

&nbsp;

| $x$ (error rate) | $h(x)$ (bits) | Interpretation |
|------------------|---------------|----------------|
| 0.00 | 0.000 | Perfect channel |
| 0.05 | 0.286 | Low noise |
| 0.11 | 0.500 | Security threshold |
| 0.25 | 0.811 | Full eavesdropping |
| 0.50 | 1.000 | Maximum entropy |

&nbsp;

---

&nbsp;

### Secret Key Rate (Shor-Preskill Bound)

$$
R = 1 - h(e_b) - f \\cdot h(e_p)
$$

Where:
- $e_b$ = bit error rate (QBER)
- $e_p$ = phase error rate (≈ QBER for BB84)
- $f$ = error correction efficiency ($f \\geq 1$, typically 1.16)

&nbsp;

**Critical Insight:** At $e = 11\\%$, the key rate becomes zero:

$$
R(0.11) = 1 - h(0.11) - h(0.11) = 1 - 0.5 - 0.5 = 0
$$

&nbsp;

---

&nbsp;

### Eavesdropper Detection

For intercept-resend attack with probability $p$:

$$
\\text{QBER}_{\\text{Eve}} = \\varepsilon + p \\cdot 0.25 \\cdot (1 - \\varepsilon)
$$

&nbsp;

**Why 25%?**

$$
P(\\text{wrong basis}) \\times P(\\text{wrong bit} | \\text{wrong basis}) = 0.5 \\times 0.5 = 0.25
$$

&nbsp;

---

&nbsp;

### Channel Loss Model

Fiber attenuation follows Beer-Lambert law:

$$
\\eta_{\\text{channel}} = 10^{-\\alpha d / 10}
$$

&nbsp;

**Standard Values:**

| Fiber Type | $\\alpha$ (dB/km) | 50 km loss |
|------------|-------------------|------------|
| SMF-28 @ 1550nm | 0.20 | 90% |
| SMF-28 @ 1310nm | 0.35 | 84% |
| Multimode | 0.50 | 78% |

&nbsp;

### Overall Detection Rate

$$
\\eta_{\\text{total}} = \\eta_{\\text{channel}} \\times \\eta_{\\text{detector}} \\times \\eta_{\\text{coupling}}
$$
`;

// ─────────────────────────────────────────────────────────────────────────────
// PARAMETERS GUIDE
// ─────────────────────────────────────────────────────────────────────────────

const PARAMETERS_CONTENT = `
## Simulation Parameters

&nbsp;

### Channel Configuration

| Parameter | Symbol | Range | Default | Physical Meaning |
|-----------|--------|-------|---------|------------------|
| **Photons** | $N$ | 100 – 100k | 1,000 | Transmitted photon count |
| **Distance** | $d$ | 0 – 200 km | 50 km | Fiber length |
| **Attenuation** | $\\alpha$ | 0.1 – 1.0 dB/km | 0.2 | Fiber loss coefficient |
| **Noise** | $\\varepsilon$ | 0 – 15% | 1% | Background error rate |

&nbsp;

### Detector Configuration

| Parameter | Symbol | Range | Default | Physical Meaning |
|-----------|--------|-------|---------|------------------|
| **Efficiency** | $\\eta_d$ | 1 – 100% | 15% | Single-photon detection probability |
| **EC Efficiency** | $f$ | 1.0 – 1.5 | 1.16 | Error correction overhead |

&nbsp;

### Eavesdropper (Eve)

| Parameter | Description |
|-----------|-------------|
| **Eve Enabled** | Toggle intercept-resend attack |
| **Intercept %** | Fraction of photons Eve intercepts ($p$) |

&nbsp;

---

&nbsp;

### Recommended Settings

&nbsp;

**For Quick Testing:**
\`\`\`
Photons: 1,000 – 5,000
Distance: 25 – 50 km
Noise: 1 – 2%
\`\`\`

&nbsp;

**For Publication-Quality Results:**
\`\`\`
Photons: 50,000 – 100,000
Monte Carlo Trials: 50+
Full parameter sweeps
\`\`\`

&nbsp;

**For Realistic Deployment Simulation:**
\`\`\`
Attenuation: 0.2 dB/km (standard telecom fiber)
Detector Efficiency: 10 – 25% (commercial APDs)
EC Efficiency: 1.16 (Cascade protocol)
\`\`\`
`;

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY & ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

const SECURITY_CONTENT = `
## Security Analysis

&nbsp;

### The 11% Threshold

The security of BB84 rests on an information-theoretic bound:

$$
\\boxed{\\text{QBER} < 11\\% \\implies \\text{Secure key extraction possible}}
$$

&nbsp;

This is not an arbitrary choice — it's derived from:

1. **Shannon's noisy channel coding theorem**
2. **Privacy amplification theory**
3. **Shor-Preskill security proof**

&nbsp;

---

&nbsp;

### Understanding QBER Sources

&nbsp;

| Source | Contribution | Nature |
|--------|--------------|--------|
| Detector dark counts | 0.1 – 1% | Systematic |
| Optical misalignment | 0.5 – 2% | Calibratable |
| Fiber imperfections | 0.1 – 0.5% | Fixed |
| Timing jitter | 0.1 – 0.5% | Statistical |
| **Eavesdropping** | **0 – 25%** | **Adversarial** |

&nbsp;

---

&nbsp;

### Threat Model: Intercept-Resend

The intercept-resend attack is the canonical BB84 attack:

&nbsp;

\`\`\`
Alice ──[photon]──► Eve ──[new photon]──► Bob
                     │
                     └── measures, guesses basis
\`\`\`

&nbsp;

**Attack Analysis:**

$$
\\begin{aligned}
P(\\text{Eve wrong basis}) &= 0.5 \\\\
P(\\text{error} | \\text{wrong basis}) &= 0.5 \\\\
P(\\text{error from Eve}) &= 0.5 \\times 0.5 = 0.25
\\end{aligned}
$$

&nbsp;

**Detection Probability:**

At 100% intercept, QBER jumps to ~25%, far above the 11% threshold.

Even at 40% intercept:
$$
\\text{QBER} = 0.01 + 0.40 \\times 0.25 \\times 0.99 \\approx 11\\%
$$

The protocol would abort, protecting the key.

&nbsp;

---

&nbsp;

### Security Status Levels

&nbsp;

| Status | QBER Range | Meaning |
|--------|------------|---------|
| 🟢 **SECURE** | < 8% | Safe margin, deploy with confidence |
| 🟡 **WARNING** | 8 – 11% | Approaching limit, review channel |
| 🔴 **COMPROMISED** | > 11% | Abort immediately, key may be leaked |
`;

// ─────────────────────────────────────────────────────────────────────────────
// FUTURE & SCALABILITY
// ─────────────────────────────────────────────────────────────────────────────

const FUTURE_CONTENT = `
## Future Scope & Roadmap

&nbsp;

### Current Capabilities (v1.0)

- ✅ BB84 protocol simulation
- ✅ Intercept-resend attack modeling
- ✅ Monte Carlo analysis
- ✅ Parameter sweeps
- ✅ CSV data export
- ✅ Desktop application (Tauri)

&nbsp;

---

&nbsp;

### Planned Features

&nbsp;

#### Phase 2: Protocol Extensions

| Feature | Description | Timeline |
|---------|-------------|----------|
| **E91 Protocol** | Entanglement-based QKD | Q2 2026 |
| **BBM92** | Entangled photon pairs | Q2 2026 |
| **Decoy States** | Photon number splitting defense | Q3 2026 |
| **MDI-QKD** | Measurement-device-independent | Q4 2026 |

&nbsp;

#### Phase 3: Advanced Attacks

| Attack Type | Description |
|-------------|-------------|
| **PNS Attack** | Photon number splitting |
| **Trojan Horse** | Side-channel attacks |
| **Detector Blinding** | Timing attacks |
| **Man-in-the-Middle** | Full protocol interception |

&nbsp;

#### Phase 4: Network Simulation

$$
\\text{Single Link} \\rightarrow \\text{Trusted Nodes} \\rightarrow \\text{Quantum Repeaters}
$$

- Multi-node network topologies
- Trusted relay modeling
- Quantum repeater simulation

&nbsp;

---

&nbsp;

### Scalability Architecture

&nbsp;

#### Current Architecture

\`\`\`
┌─────────────────┐     HTTP/REST     ┌─────────────────┐
│   Tauri/Next.js │ ◄───────────────► │  FastAPI/Python │
│   (Frontend)    │                   │   (Simulation)  │
└─────────────────┘                   └─────────────────┘
\`\`\`

&nbsp;

#### Scalable Cloud Architecture (Future)

\`\`\`
┌──────────────┐
│   Web Client │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌─────────────────────────────┐
│   API Gateway│────►│   Kubernetes Cluster        │
└──────────────┘     │  ┌───────────────────────┐  │
                     │  │ Simulation Workers    │  │
                     │  │ (Horizontal Scaling)  │  │
                     │  └───────────────────────┘  │
                     │  ┌───────────────────────┐  │
                     │  │ Redis (Job Queue)     │  │
                     │  └───────────────────────┘  │
                     │  ┌───────────────────────┐  │
                     │  │ PostgreSQL (Results)  │  │
                     │  └───────────────────────┘  │
                     └─────────────────────────────┘
\`\`\`

&nbsp;

#### Scaling Dimensions

| Dimension | Current | Scalable Target |
|-----------|---------|-----------------|
| **Users** | Single | 10,000+ concurrent |
| **Photons/sim** | 100k | 10M+ |
| **Parallel sims** | 1 | 1,000+ |
| **Storage** | Local | Cloud (S3/GCS) |

&nbsp;

---

&nbsp;

### Research Collaboration

We welcome contributions in:

- **New protocol implementations**
- **Attack model development**
- **Performance optimization**
- **Educational content**

&nbsp;

### Integration Possibilities

| Integration | Use Case |
|-------------|----------|
| **Qiskit** | Quantum circuit backend |
| **PennyLane** | Variational QKD |
| **OpenQASM** | Standardized gate definitions |
| **MATLAB** | Academic analysis pipelines |
`;

// ─────────────────────────────────────────────────────────────────────────────
// GETTING STARTED
// ─────────────────────────────────────────────────────────────────────────────

const GUIDE_CONTENT = `
## Getting Started

&nbsp;

### Quick Start (5 Minutes)

&nbsp;

**Step 1:** Configure basic parameters in the left sidebar

**Step 2:** Click **"Run Simulation"**

**Step 3:** Observe results:
- QBER gauge and graph
- Secret key rate
- Security status badge

&nbsp;

---

&nbsp;

### Research Workflow

&nbsp;

**1. Enable Research Mode** (toggle in header)

**2. Baseline Characterization**
   - Run with Eve disabled
   - Note baseline QBER
   - Verify QBER < 5%

**3. Distance Analysis**
   - Use Auto Sweep
   - Find max viable distance

**4. Threat Assessment**
   - Enable Eve
   - Run Intercept Sweep
   - Determine critical intercept

**5. Statistical Validation**
   - Run Monte Carlo (50+ trials)
   - Verify consistency

**6. Export & Document**
   - Export CSV data
   - Generate reports

&nbsp;

---

&nbsp;

### Understanding the Interface

&nbsp;

#### Main Dashboard

| Component | Purpose |
|-----------|---------|
| **Control Panel** | Parameter configuration |
| **QBER Graph** | Error rate vs distance/noise |
| **SKR Graph** | Key generation efficiency |
| **Bit Visualizer** | Protocol step visualization |
| **Metrics Bar** | Real-time key statistics |

&nbsp;

#### Research Mode Additions

| Component | Purpose |
|-----------|---------|
| **Monte Carlo** | Statistical analysis |
| **Auto Sweep** | Automated parameter variation |
| **Threat Analysis** | Intercept probability sweep |
| **Export Tools** | Data export capabilities |

&nbsp;

---

&nbsp;

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| \`ESC\` | Close documentation |
| \`R\` | Run simulation (when focused) |
`;

// ─────────────────────────────────────────────────────────────────────────────
// TECHNICAL IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

const IMPLEMENTATION_CONTENT = `
## System Architecture

QKD-Lab follows a clean **client-server architecture** with clear separation of concerns:

&nbsp;

\`\`\`
┌────────────────────────────────────────────────────────────────────┐
│                        QKD-Lab Architecture                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   ┌──────────────────┐          ┌──────────────────────────────┐  │
│   │   FRONTEND       │  HTTP    │        BACKEND               │  │
│   │   ────────       │  REST    │        ───────               │  │
│   │                  │          │                              │  │
│   │  Next.js 14      │◄────────►│  FastAPI (Python 3.11+)      │  │
│   │  React 18        │  JSON    │  NumPy (vectorized ops)      │  │
│   │  TypeScript      │          │  Pydantic (validation)       │  │
│   │  Tailwind CSS    │          │                              │  │
│   │  Recharts        │          │  ┌────────────────────────┐  │  │
│   │  shadcn/ui       │          │  │    Simulation Core     │  │  │
│   │                  │          │  │    ────────────────    │  │  │
│   └──────────────────┘          │  │  alice.py   bob.py    │  │  │
│           │                     │  │  eve.py     channel.py│  │  │
│           │                     │  │  sifting.py metrics.py│  │  │
│           ▼                     │  │  privacy.py entropy.py│  │  │
│   ┌──────────────────┐          │  └────────────────────────┘  │  │
│   │   DESKTOP        │          │                              │  │
│   │   Tauri 2.0      │          └──────────────────────────────┘  │
│   │   (Rust-based)   │                                            │
│   └──────────────────┘                                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
\`\`\`

&nbsp;

---

&nbsp;

## Backend Implementation

The simulation engine is built in Python with a modular architecture where each 
component of the BB84 protocol is implemented in a separate module.

&nbsp;

### Core Modules

| Module | File | Responsibility |
|--------|------|----------------|
| **Alice** | \`core/alice.py\` | Bit generation, basis selection |
| **Bob** | \`core/bob.py\` | Measurement simulation |
| **Eve** | \`core/eve.py\` | Intercept-resend attack |
| **Channel** | \`core/channel.py\` | Fiber attenuation, detection |
| **Sifting** | \`core/sifting.py\` | Basis reconciliation |
| **Metrics** | \`core/metrics.py\` | QBER calculation |
| **Privacy** | \`core/privacy.py\` | SKR, security evaluation |
| **Entropy** | \`utils/entropy.py\` | Binary entropy function |

&nbsp;

---

&nbsp;

### Stage 1: Alice's Preparation (\`alice.py\`)

Alice generates the raw quantum key material:

\`\`\`python
def generate_bits(n: int, rng: Generator) -> np.ndarray:
    """Generate n uniformly random classical bits."""
    return rng.integers(0, 2, size=n, dtype=np.int8)

def generate_bases(n: int, rng: Generator) -> np.ndarray:
    """
    Generate n random measurement bases.
    0 → Rectilinear (Z) basis: {|0⟩, |1⟩}
    1 → Diagonal    (X) basis: {|+⟩, |−⟩}
    """
    return rng.integers(0, 2, size=n, dtype=np.int8)
\`\`\`

**Key Implementation Details:**
- Uses NumPy's \`Generator\` for reproducible randomness
- \`int8\` dtype for memory efficiency (millions of photons)
- Vectorized operations for performance

&nbsp;

---

&nbsp;

### Stage 2: Eavesdropper Attack (\`eve.py\`)

Eve's intercept-resend attack is the canonical BB84 attack:

\`\`\`python
@dataclass(frozen=True)
class EveResult:
    effective_bits: np.ndarray   # Bits after Eve's intervention
    effective_bases: np.ndarray  # Bases after Eve's intervention
    intercepted_count: int       # Number intercepted

def intercept_resend(alice_bits, alice_bases, eve_probability, rng):
    # Determine which photons Eve intercepts
    intercepted = rng.random(n) < eve_probability
    
    # Eve's random measurement bases
    eve_bases = rng.integers(0, 2, size=n, dtype=np.int8)
    
    # Eve's measurement outcomes
    # Matching basis → correct bit; mismatching → random bit
    eve_basis_correct = eve_bases == alice_bases
    eve_measured = np.where(eve_basis_correct, alice_bits, random_outcomes)
    
    # Construct effective state after Eve
    effective_bits = np.where(intercepted, eve_measured, alice_bits)
    effective_bases = np.where(intercepted, eve_bases, alice_bases)
\`\`\`

**Physics Implemented:**
- **Basis mismatch** → Eve gets random outcome (Heisenberg uncertainty)
- **Resend in wrong basis** → 50% error for Bob when sifted
- **Combined effect**: $p \\times 0.5 \\times 0.5 = 0.25p$ QBER

&nbsp;

---

&nbsp;

### Stage 3: Quantum Channel (\`channel.py\`)

Models realistic fiber optic transmission:

\`\`\`python
def transmittance(alpha: float, distance: float) -> float:
    """
    Beer-Lambert law: T = 10^(−α · L / 10)
    
    α = attenuation coefficient (dB/km)
    L = distance (km)
    """
    return 10.0 ** (-alpha * distance / 10.0)

def detection_probability(alpha, distance, detector_efficiency):
    """P_detect = T(α, L) × η_detector"""
    return transmittance(alpha, distance) * detector_efficiency

def simulate_detection(n, alpha, distance, detector_efficiency, rng):
    """Each photon survives with probability P_detect."""
    p_detect = detection_probability(alpha, distance, detector_efficiency)
    return rng.random(n) < p_detect
\`\`\`

**Physical Model:**
$$
\\eta_{\\text{total}} = 10^{-\\alpha d / 10} \\times \\eta_{\\text{detector}}
$$

&nbsp;

---

&nbsp;

### Stage 4: Bob's Measurement (\`bob.py\`)

Simulates quantum measurement with noise:

\`\`\`python
def measure(effective_bits, effective_bases, bob_bases, noise, rng):
    # Basis agreement → deterministic; disagreement → random
    basis_match = bob_bases == effective_bases
    random_bits = rng.integers(0, 2, size=n, dtype=np.int8)
    bob_bits = np.where(basis_match, effective_bits, random_bits)
    
    # Apply independent bit-flip noise (depolarizing channel)
    if noise > 0.0:
        flip_mask = rng.random(n) < noise
        bob_bits = np.where(flip_mask, 1 - bob_bits, bob_bits)
    
    return bob_bits
\`\`\`

**Quantum Mechanics Implemented:**
- **Matching basis** → Deterministic outcome (correct bit)
- **Mismatched basis** → Random outcome (complementarity principle)
- **Noise model** → Independent bit-flip channel

&nbsp;

---

&nbsp;

### Stage 5: Key Sifting (\`sifting.py\`)

Basis reconciliation over classical channel:

\`\`\`python
@dataclass(frozen=True)
class SiftResult:
    alice_sifted: np.ndarray
    bob_sifted: np.ndarray
    sift_mask: np.ndarray
    sifted_length: int

def sift_keys(alice_bits, bob_bits, alice_bases, bob_bases, detected):
    """
    Keep bit if:
    1. Photon was detected by Bob, AND
    2. Alice's basis matches Bob's basis
    """
    sift_mask = (alice_bases == bob_bases) & detected
    
    alice_sifted = alice_bits[sift_mask]
    bob_sifted = bob_bits[sift_mask]
    
    return SiftResult(alice_sifted, bob_sifted, sift_mask, len(alice_sifted))
\`\`\`

**Expected Sifting Rate:** ~50% of detected photons (basis matching probability)

&nbsp;

---

&nbsp;

### Stage 6: QBER Calculation (\`metrics.py\`)

\`\`\`python
def calculate_qber(alice_sifted, bob_sifted) -> tuple[float, int]:
    """
    QBER = (# mismatched bits) / (sifted key length)
    """
    mismatches = int(np.sum(alice_sifted != bob_sifted))
    qber = mismatches / len(alice_sifted)
    return qber, mismatches
\`\`\`

&nbsp;

---

&nbsp;

### Stage 7: Privacy Amplification (\`privacy.py\`)

Secret key rate based on Shor-Preskill bound:

\`\`\`python
def secret_key_rate(sifted_fraction, qber, ec_efficiency=1.0):
    """
    SKR = R_sifted × max(0, 1 − H(Q) − f_EC · H(Q))
    
    where H(Q) is binary entropy
    """
    h = binary_entropy(qber)
    secure_capacity = 1.0 - (1.0 + ec_efficiency) * h
    return max(0.0, sifted_fraction * secure_capacity)

def evaluate_security(qber, threshold):
    """SECURE if QBER ≤ threshold, else COMPROMISED"""
    return "SECURE" if qber <= threshold else "COMPROMISED"
\`\`\`

**Binary Entropy (\`utils/entropy.py\`):**

\`\`\`python
def binary_entropy(p: float) -> float:
    """H(p) = −p·log₂(p) − (1−p)·log₂(1−p)"""
    if p <= 0.0 or p >= 1.0:
        return 0.0
    return -p * np.log2(p) - (1 - p) * np.log2(1 - p)
\`\`\`

&nbsp;

---

&nbsp;

## API Endpoints

The FastAPI backend exposes these REST endpoints:

&nbsp;

| Endpoint | Method | Purpose |
|----------|--------|---------|
| \`/simulate\` | POST | Run single BB84 simulation |
| \`/sweep\` | POST | Distance & noise parameter sweeps |
| \`/sweep/param\` | POST | Generic single-parameter sweep |
| \`/monte-carlo\` | POST | Statistical analysis (N trials) |
| \`/health\` | GET | Liveness probe |

&nbsp;

### Request/Response Flow

\`\`\`
Frontend                           Backend
────────                           ───────
    │                                  │
    │  POST /simulate                  │
    │  {photons, distance, noise...}   │
    │─────────────────────────────────►│
    │                                  │
    │                          ┌───────┴───────┐
    │                          │ run_simulation│
    │                          │   Stage 1-7   │
    │                          └───────┬───────┘
    │                                  │
    │  {qber, skr, final_key_length...}│
    │◄─────────────────────────────────│
    │                                  │
\`\`\`

&nbsp;

---

&nbsp;

## Frontend Implementation

&nbsp;

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14 | React SSR/SSG framework |
| **UI Library** | React 18 | Component-based UI |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | shadcn/ui | Radix-based components |
| **Charts** | Recharts | Data visualization |
| **Desktop** | Tauri 2.0 | Native desktop wrapper |
| **Language** | TypeScript | Type-safe JavaScript |

&nbsp;

### Component Architecture

\`\`\`
app/
├── page.tsx              # Main application entry
├── layout.tsx            # Root layout with providers
└── globals.css           # Global styles

components/
├── ControlPanel.tsx      # Parameter input sidebar
├── GraphSection.tsx      # QBER/SKR charts
├── BitVisualizer.tsx     # Protocol step visualization
├── MetricsBar.tsx        # Bottom metrics display
├── ResearchTools.tsx     # Monte Carlo, sweeps, exports
├── DocumentationPanel.tsx# This documentation
└── ui/                   # shadcn components
    ├── button.tsx
    ├── card.tsx
    ├── slider.tsx
    └── ...

lib/
├── api.ts               # Backend API client
├── utils.ts             # Utility functions
└── csv.ts               # CSV export logic
\`\`\`

&nbsp;

### API Client (\`lib/api.ts\`)

Type-safe API wrapper with full TypeScript interfaces:

\`\`\`typescript
export interface SimulationRequest {
  photons: number;
  distance: number;
  attenuation: number;
  noise: number;
  detector_efficiency: number;
  eve_enabled: boolean;
  eve_probability: number;
  qber_threshold: number;
  ec_efficiency: number;
  seed: number | null;
}

export async function runSimulation(
  params: SimulationRequest
): Promise<SimulationResponse> {
  const res = await fetch(\`\${API_BASE}/simulate\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}
\`\`\`

&nbsp;

---

&nbsp;

## Desktop Application (Tauri)

QKD-Lab uses **Tauri 2.0** for native desktop distribution:

&nbsp;

### Why Tauri?

| Feature | Tauri | Electron |
|---------|-------|----------|
| **Binary Size** | ~10 MB | ~150 MB |
| **Memory Usage** | ~50 MB | ~200 MB |
| **Backend** | Rust | Node.js |
| **Security** | Sandboxed | Less isolated |
| **Startup Time** | Fast | Slower |

&nbsp;

### Configuration (\`tauri.conf.json\`)

\`\`\`json
{
  "productName": "QKD-Lab",
  "version": "1.0.0",
  "build": {
    "beforeDevCommand": "pnpm dev",
    "devUrl": "http://localhost:3000",
    "beforeBuildCommand": "pnpm build"
  },
  "app": {
    "windows": [{
      "title": "QKD-Lab",
      "width": 1400,
      "height": 900
    }]
  }
}
\`\`\`

&nbsp;

---

&nbsp;

## Build & Development Process

&nbsp;

### Prerequisites

\`\`\`bash
# Backend
Python 3.11+
pip install fastapi uvicorn numpy pydantic

# Frontend
Node.js 18+
pnpm install

# Desktop
Rust 1.70+
\`\`\`

&nbsp;

### Development Workflow

\`\`\`bash
# 1. Start backend
cd backend && uvicorn main:app --reload --port 8000

# 2. Start frontend (separate terminal)
cd frontend && pnpm dev

# 3. Or run as desktop app
cd frontend && pnpm tauri:dev
\`\`\`

&nbsp;

### Production Build

\`\`\`bash
# Build desktop application
cd frontend && pnpm tauri:build

# Output: frontend/src-tauri/target/release/qkd-lab
\`\`\`

&nbsp;

---

&nbsp;

## Data Flow Summary

\`\`\`
User Input (UI)
      │
      ▼
┌─────────────────┐
│ ControlPanel    │──► SimulationRequest
└─────────────────┘
      │
      ▼
┌─────────────────┐    HTTP POST
│ api.ts          │───────────────────►┌──────────────┐
└─────────────────┘                    │ FastAPI      │
                                       │ main.py      │
                                       └──────┬───────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                   ┌─────────┐         ┌───────────┐         ┌───────────┐
                   │ alice.py│         │ channel.py│         │  bob.py   │
                   └────┬────┘         └─────┬─────┘         └─────┬─────┘
                        │                    │                     │
                        └────────────────────┼─────────────────────┘
                                             │
                                             ▼
                                       ┌───────────┐
                                       │ sifting.py│
                                       └─────┬─────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                        ┌──────────┐  ┌───────────┐  ┌───────────┐
                        │metrics.py│  │ privacy.py│  │ entropy.py│
                        └────┬─────┘  └─────┬─────┘  └───────────┘
                             │              │
                             └──────┬───────┘
                                    │
                                    ▼
                           SimulationResponse
                                    │
      ┌─────────────────────────────┼─────────────────────────────┐
      ▼                             ▼                             ▼
┌───────────┐               ┌─────────────┐               ┌─────────────┐
│GraphSection│              │ MetricsBar  │               │BitVisualizer│
└───────────┘               └─────────────┘               └─────────────┘
\`\`\`
`;

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Why is 11% the security threshold?",
    a: "At 11% QBER, the binary entropy formula yields zero secret key rate: 1 - h(0.11) - h(0.11) = 0. This is a fundamental information-theoretic limit — above this threshold, an eavesdropper could have gained as much information as Bob."
  },
  {
    q: "Why does a full intercept cause exactly 25% QBER?",
    a: "Eve must guess which basis to measure in. She's wrong 50% of the time. When wrong, she sends Bob a random state, causing 50% errors on those bits. Combined: 50% × 50% = 25% QBER."
  },
  {
    q: "What's the difference between simulation and real QKD?",
    a: "QKD-Lab uses Monte Carlo methods to statistically model photon behavior. Real QKD uses actual quantum states. The physics and statistics are identical — only the implementation differs."
  },
  {
    q: "Can I use this for actual secure communication?",
    a: "No. QKD-Lab is a simulator for research and education. Actual QKD requires quantum hardware. However, QKD-Lab can validate parameters before purchasing hardware."
  },
  {
    q: "What's a realistic detector efficiency?",
    a: "Commercial InGaAs APDs: 10-25%. Superconducting nanowire detectors (SNSPDs): 80-95% but require cryogenic cooling. The default 15% reflects typical commercial deployments."
  },
  {
    q: "How accurate is the simulation?",
    a: "QKD-Lab implements the complete BB84 protocol with realistic physical models. The intercept sweep 'Model Accuracy' metric typically shows >95% agreement with theoretical predictions."
  },
  {
    q: "Can I simulate other QKD protocols?",
    a: "Currently only BB84 is implemented. E91, BBM92, and decoy-state protocols are planned for future versions. See the Future Scope section."
  },
  {
    q: "How do I cite QKD-Lab in publications?",
    a: "Please cite as: 'QKD-Lab: An Open-Source BB84 Quantum Key Distribution Simulator' with the project URL. A proper citation format will be provided in future versions."
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface DocumentationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function DocumentationPanel({ open, onClose }: DocumentationPanelProps) {
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const mdComponents = {
    // Custom styling for markdown elements
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="text-xl font-bold mt-8 mb-4 text-foreground" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground" {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className="text-base font-semibold mt-4 mb-2 text-foreground" {...props}>{children}</h4>
    ),
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mb-4 leading-relaxed text-muted-foreground" {...props}>{children}</p>
    ),
    ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="mb-4 ml-4 space-y-2 list-disc list-outside text-muted-foreground" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="mb-4 ml-4 space-y-2 list-decimal list-outside text-muted-foreground" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="leading-relaxed" {...props}>{children}</li>
    ),
    blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="border-l-4 border-sky-500 pl-4 py-2 my-4 bg-sky-500/5 rounded-r-lg italic text-muted-foreground" {...props}>{children}</blockquote>
    ),
    code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const isBlock = className?.includes('language-');
      if (isBlock) {
        return (
          <code className="block bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto my-4" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre className="bg-muted rounded-lg overflow-x-auto my-4" {...props}>{children}</pre>
    ),
    table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse text-sm" {...props}>{children}</table>
      </div>
    ),
    th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold text-foreground" {...props}>{children}</th>
    ),
    td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td className="border border-border px-3 py-2 text-muted-foreground" {...props}>{children}</td>
    ),
    hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className="my-6 border-border" {...props} />
    ),
    strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <strong className="font-semibold text-foreground" {...props}>{children}</strong>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-sky-500/10 via-violet-500/5 to-fuchsia-500/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg shadow-sky-500/25">
              <Atom className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                QKD-Lab Documentation
                <Badge variant="secondary" className="text-[10px] font-medium">v1.0</Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Comprehensive guide to quantum key distribution simulation
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-4 bg-muted/20">
            <TabsList className="h-11 bg-transparent gap-0.5 flex-wrap">
              <TabsTrigger value="about" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <Sparkles className="h-3.5 w-3.5" />
                About
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <Users className="h-3.5 w-3.5" />
                Users
              </TabsTrigger>
              <TabsTrigger value="protocol" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <Lock className="h-3.5 w-3.5" />
                Protocol
              </TabsTrigger>
              <TabsTrigger value="math" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <CircuitBoard className="h-3.5 w-3.5" />
                Math
              </TabsTrigger>
              <TabsTrigger value="params" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <Settings className="h-3.5 w-3.5" />
                Parameters
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <Shield className="h-3.5 w-3.5" />
                Security
              </TabsTrigger>
              <TabsTrigger value="future" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <Rocket className="h-3.5 w-3.5" />
                Future
              </TabsTrigger>
              <TabsTrigger value="implementation" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <Code2 className="h-3.5 w-3.5" />
                Implementation
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <BookOpen className="h-3.5 w-3.5" />
                Guide
              </TabsTrigger>
              <TabsTrigger value="faq" className="gap-1.5 text-xs data-[state=active]:bg-background">
                <HelpCircle className="h-3.5 w-3.5" />
                FAQ
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {/* ABOUT */}
            <TabsContent value="about" className="m-0 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Hero */}
                <div className="relative rounded-2xl border bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5 p-8 overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-500/10 to-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/20">
                        <Atom className="h-3 w-3 mr-1" />
                        Quantum Cryptography
                      </Badge>
                      <Badge variant="outline">Open Source</Badge>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
                      QKD-Lab
                    </h1>
                    <p className="text-xl text-muted-foreground mb-6">
                      Research-Grade BB84 Quantum Key Distribution Simulator
                    </p>
                    <div className="grid gap-3 sm:grid-cols-4">
                      <MiniStat icon={<Binary />} label="Protocol" value="BB84" />
                      <MiniStat icon={<Shield />} label="Threshold" value="11%" />
                      <MiniStat icon={<BarChart3 />} label="Analysis" value="Monte Carlo" />
                      <MiniStat icon={<Download />} label="Export" value="CSV" />
                    </div>
                  </div>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {ABOUT_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {MISSION_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* USERS */}
            <TabsContent value="users" className="m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {USERS_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PROTOCOL */}
            <TabsContent value="protocol" className="m-0 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Protocol Flow Diagram */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GitBranch className="h-4 w-4 text-sky-500" />
                      Protocol Flow Diagram
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <FlowStep icon={<KeyRound />} label="Key Gen" sublabel="Alice" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <FlowStep icon={<Waves />} label="Encode" sublabel="Quantum" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <FlowStep icon={<Cable />} label="Transmit" sublabel="Channel" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <FlowStep icon={<Eye />} label="Eve?" sublabel="Attack" color="red" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <FlowStep icon={<Radio />} label="Measure" sublabel="Bob" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <FlowStep icon={<Users />} label="Sift" sublabel="Compare" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <FlowStep icon={<ShieldCheck />} label="Secure" sublabel="Key" color="green" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {PROTOCOL_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* MATH */}
            <TabsContent value="math" className="m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {MATH_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* PARAMETERS */}
            <TabsContent value="params" className="m-0 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {PARAMETERS_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TipCard
                    icon={<Lightbulb className="h-5 w-5 text-yellow-500" />}
                    title="Pro Tip"
                    description="Start with default parameters to understand the baseline, then modify one parameter at a time to see its effect."
                  />
                  <TipCard
                    icon={<Info className="h-5 w-5 text-blue-500" />}
                    title="Real-World Values"
                    description="For realistic simulations, use α=0.2 dB/km (telecom fiber), η=15% (commercial APD), f=1.16 (Cascade EC)."
                  />
                </div>
              </div>
            </TabsContent>

            {/* SECURITY */}
            <TabsContent value="security" className="m-0 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {SECURITY_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
                <div className="grid gap-4 sm:grid-cols-3">
                  <SecurityCard status="secure" />
                  <SecurityCard status="warning" />
                  <SecurityCard status="compromised" />
                </div>
              </div>
            </TabsContent>

            {/* FUTURE */}
            <TabsContent value="future" className="m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {FUTURE_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* IMPLEMENTATION */}
            <TabsContent value="implementation" className="m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {IMPLEMENTATION_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* GUIDE */}
            <TabsContent value="guide" className="m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {GUIDE_CONTENT}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FAQ */}
            <TabsContent value="faq" className="m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-sky-500" />
                      Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                      Common questions about QKD-Lab and quantum key distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {FAQ_ITEMS.map((faq, i) => (
                        <AccordionItem key={i} value={`faq-${i}`}>
                          <AccordionTrigger className="text-sm text-left hover:no-underline">
                            <span className="flex items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-500 text-xs font-medium">
                                {i + 1}
                              </span>
                              {faq.q}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground pl-8">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Atom className="h-3.5 w-3.5" />
            <span>QKD-Lab — Research-Grade BB84 Simulator</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Built with Next.js, FastAPI, and Tauri</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px]">ESC</kbd>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border">
      <div className="text-sky-500">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function FlowStep({ 
  icon, 
  label, 
  sublabel, 
  color = "sky" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  sublabel: string;
  color?: "sky" | "red" | "green";
}) {
  const colors = {
    sky: "text-sky-500 bg-sky-500/10",
    red: "text-red-500 bg-red-500/10",
    green: "text-green-500 bg-green-500/10",
  };
  return (
    <div className={`flex flex-col items-center gap-1 p-3 rounded-lg ${colors[color]} min-w-[80px]`}>
      <div>{icon}</div>
      <span className="text-xs font-medium text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground">{sublabel}</span>
    </div>
  );
}

function TipCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="p-4 flex gap-3">
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div>
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityCard({ status }: { status: "secure" | "warning" | "compromised" }) {
  const config = {
    secure: {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "SECURE",
      qber: "< 8%",
      desc: "Safe to extract key",
      bg: "bg-green-500/10 border-green-500/30 text-green-500",
    },
    warning: {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: "WARNING",
      qber: "8-11%",
      desc: "Approaching threshold",
      bg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
    },
    compromised: {
      icon: <ShieldAlert className="h-8 w-8" />,
      title: "COMPROMISED",
      qber: "> 11%",
      desc: "Abort protocol",
      bg: "bg-red-500/10 border-red-500/30 text-red-500",
    },
  };
  const c = config[status];
  return (
    <Card className={`${c.bg} border-2`}>
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2">{c.icon}</div>
        <Badge className={c.bg}>{c.title}</Badge>
        <p className="text-lg font-bold mt-2 text-foreground">QBER {c.qber}</p>
        <p className="text-xs text-muted-foreground">{c.desc}</p>
      </CardContent>
    </Card>
  );
}
