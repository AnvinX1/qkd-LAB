# QKD-Lab — BB84 Deployment & Attack Simulator (Backend)

Production-grade BB84 quantum key distribution simulation engine with
intercept-resend attack modeling, lossy-channel physics, and
Shor–Preskill secret-key-rate estimation.

---

## Architecture

```
backend/
├── main.py              # FastAPI app & simulation pipeline orchestration
├── schemas.py           # Pydantic request / response models
├── requirements.txt
├── README.md
├── core/
│   ├── alice.py         # Random bit & basis generation (sender)
│   ├── bob.py           # Measurement simulation (receiver)
│   ├── channel.py       # Fiber attenuation & stochastic detection
│   ├── eve.py           # Intercept-resend eavesdropper
│   ├── sifting.py       # Basis reconciliation
│   ├── metrics.py       # QBER calculation
│   └── privacy.py       # Secret key rate & security evaluation
└── utils/
    ├── entropy.py       # Binary Shannon entropy H(p)
    └── helpers.py       # RNG factory, bit sampling, utilities
```

## Physics Model

### Channel Transmittance

$$T(\alpha, L) = 10^{-\alpha L / 10}$$

| Symbol | Meaning | Typical value |
|--------|---------|---------------|
| α      | Fiber attenuation (dB/km) | 0.2 (telecom SMF-28 @ 1550 nm) |
| L      | Link distance (km) | 0 – 1000 |

### Detection Probability

$$P_{\text{detect}} = T \cdot \eta_{\text{detector}}$$

### Eve's Intercept-Resend Attack

For each intercepted photon Eve measures in a random basis and resends.
Expected QBER contribution:

$$\text{QBER}_{\text{Eve}} = \frac{p_{\text{eve}}}{4}$$

Full interception ($p_{\text{eve}} = 1$) yields QBER = 25 %.

### Binary Entropy

$$H(Q) = -Q \log_2 Q - (1 - Q) \log_2(1 - Q)$$

### Asymptotic Secret Key Rate (Shor–Preskill)

$$\text{SKR} = R_{\text{sifted}} \times \bigl(1 - 2\,H(Q)\bigr)$$

Positive key extraction requires $Q \lesssim 11\%$.

---

## Quick Start

### 1. Create virtual environment

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the server

```bash
uvicorn main:app --reload
```

The API is now live at **http://127.0.0.1:8000**.

Interactive docs: **http://127.0.0.1:8000/docs**

---

## API Reference

### `POST /simulate`

#### Request Body

```json
{
  "photons": 10000,
  "distance": 50.0,
  "attenuation": 0.2,
  "noise": 0.01,
  "detector_efficiency": 0.8,
  "eve_enabled": true,
  "eve_probability": 0.5,
  "qber_threshold": 0.11,
  "seed": 42
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `photons` | `int` | *required* | Number of photons (100 – 10 000 000) |
| `distance` | `float` | *required* | Fiber distance in km (0 – 1000) |
| `attenuation` | `float` | 0.2 | dB/km attenuation coefficient |
| `noise` | `float` | 0.0 | Bit-flip probability per photon |
| `detector_efficiency` | `float` | 1.0 | Detector efficiency η ∈ (0, 1] |
| `eve_enabled` | `bool` | false | Toggle eavesdropper |
| `eve_probability` | `float` | 0.0 | Per-photon intercept probability |
| `qber_threshold` | `float` | 0.11 | Security threshold |
| `seed` | `int \| null` | null | RNG seed for reproducibility |

#### Response

```json
{
  "qber": 0.0102,
  "skr": 0.0421,
  "total_photons": 10000,
  "sifted_key_length": 512,
  "final_key_length": 467,
  "raw_bits_sample": [1, 0, 1, 1, 0, ...],
  "bob_bits_sample": [1, 0, 1, 1, 0, ...],
  "mismatches": 5,
  "security_status": "SECURE"
}
```

### `GET /health`

Returns `{"status": "ok"}`.

---

## Design Principles

- **Pure functions** — core modules are stateless and side-effect-free.
- **Type hints everywhere** — full `mypy`-compatible annotations.
- **Deterministic** — provide a `seed` for bit-exact reproducibility.
- **No global state** — every run creates its own RNG instance.
- **Real physics** — no toy approximations; faithful BB84 modeling.

---

## Testing (example curl)

```bash
curl -X POST http://127.0.0.1:8000/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "photons": 10000,
    "distance": 20,
    "attenuation": 0.2,
    "noise": 0.01,
    "detector_efficiency": 0.9,
    "eve_enabled": false,
    "eve_probability": 0.0,
    "qber_threshold": 0.11,
    "seed": 42
  }'
```
