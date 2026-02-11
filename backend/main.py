"""
QKD-Lab — BB84 Deployment & Attack Simulator
=============================================

FastAPI application exposing a single POST /simulate endpoint that
runs the full BB84 quantum key distribution pipeline:

    Alice → (Eve?) → Channel → Bob → Sifting → QBER → SKR

All simulation logic lives in the ``core/`` package; this module
orchestrates the pipeline and serves the HTTP API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas import (
    SimulationRequest,
    SimulationResponse,
    SweepRequest,
    SweepResponse,
    SweepPoint,
    MonteCarloRequest,
    MonteCarloResponse,
    MonteCarloStats,
    GenericSweepRequest,
    GenericSweepResponse,
)

from core.alice import generate_bits as alice_generate_bits
from core.alice import generate_bases as alice_generate_bases
from core.bob import generate_bases as bob_generate_bases
from core.bob import measure as bob_measure
from core.channel import simulate_detection
from core.eve import intercept_resend
from core.sifting import sift_keys
from core.metrics import calculate_qber
from core.privacy import secret_key_rate, estimate_final_key_length, evaluate_security

from utils.helpers import create_rng, sample_bits

# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="QKD-Lab BB84 Simulator",
    description=(
        "Production-grade BB84 quantum key distribution simulation engine "
        "with intercept-resend attack modeling, channel attenuation, and "
        "Shor–Preskill secret-key-rate estimation."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Simulation pipeline
# ---------------------------------------------------------------------------


def run_simulation(params: SimulationRequest) -> SimulationResponse:
    """
    Execute the complete BB84 simulation pipeline.

    Stages:
        1. Alice generates random bits and bases.
        2. (Optional) Eve performs intercept-resend attack.
        3. Photons traverse the lossy channel (attenuation + detector η).
        4. Bob chooses random bases and measures arriving photons.
        5. Alice and Bob sift their keys (basis reconciliation).
        6. QBER is computed from the sifted keys.
        7. Secret key rate and security status are evaluated.

    Args:
        params: Validated simulation parameters.

    Returns:
        SimulationResponse with all computed metrics.
    """
    rng = create_rng(params.seed)
    n = params.photons

    # ── Stage 1: Alice prepares qubits ────────────────────────────────────
    alice_bits = alice_generate_bits(n, rng)
    alice_bases = alice_generate_bases(n, rng)

    # ── Stage 2: Eve's intercept-resend (optional) ────────────────────────
    if params.eve_enabled and params.eve_probability > 0.0:
        eve_result = intercept_resend(
            alice_bits, alice_bases, params.eve_probability, rng
        )
        effective_bits = eve_result.effective_bits
        effective_bases = eve_result.effective_bases
    else:
        effective_bits = alice_bits
        effective_bases = alice_bases

    # ── Stage 3: Channel attenuation & detection ──────────────────────────
    detected = simulate_detection(
        n, params.attenuation, params.distance, params.detector_efficiency, rng
    )

    # ── Stage 4: Bob measures ─────────────────────────────────────────────
    bob_bases = bob_generate_bases(n, rng)
    bob_bits = bob_measure(effective_bits, effective_bases, bob_bases, params.noise, rng)

    # ── Stage 5: Basis reconciliation (sifting) ───────────────────────────
    sift = sift_keys(alice_bits, bob_bits, alice_bases, bob_bases, detected)

    # Guard: no sifted bits means we cannot extract any key
    if sift.sifted_length == 0:
        return SimulationResponse(
            qber=0.0,
            skr=0.0,
            total_photons=n,
            sifted_key_length=0,
            final_key_length=0,
            raw_bits_sample=sample_bits(alice_bits),
            bob_bits_sample=[],
            mismatches=0,
            security_status="COMPROMISED",
        )

    # ── Stage 6: QBER ────────────────────────────────────────────────────
    qber, mismatches = calculate_qber(sift.alice_sifted, sift.bob_sifted)

    # ── Stage 7: Secret key rate & security verdict ──────────────────────
    sifted_fraction = sift.sifted_length / n
    ec_eff = getattr(params, "ec_efficiency", 1.0)
    skr = secret_key_rate(sifted_fraction, qber, ec_eff)
    final_key_len = estimate_final_key_length(sift.sifted_length, qber, ec_eff)
    status = evaluate_security(qber, params.qber_threshold)

    return SimulationResponse(
        qber=round(qber, 6),
        skr=round(skr, 6),
        total_photons=n,
        sifted_key_length=sift.sifted_length,
        final_key_length=final_key_len,
        raw_bits_sample=sample_bits(alice_bits),
        bob_bits_sample=sample_bits(sift.bob_sifted),
        mismatches=mismatches,
        security_status=status,
    )


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(request: SimulationRequest) -> SimulationResponse:
    """
    Run a full BB84 QKD simulation.

    Accepts channel, detector, and eavesdropper parameters and returns
    QBER, secret key rate, key lengths, bit samples, and a security verdict.
    """
    try:
        return run_simulation(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Sweep pipeline
# ---------------------------------------------------------------------------

import numpy as _np  # noqa: E402


def run_sweep(params: SweepRequest) -> SweepResponse:
    """Run parameter sweeps over distance and noise."""
    base_seed = params.seed

    # ── Distance sweep (fix noise, vary distance) ─────────────────────────
    distances = _np.linspace(
        params.distance_min, params.distance_max, params.distance_steps
    ).tolist()
    distance_points: list[SweepPoint] = []
    for i, d in enumerate(distances):
        req = SimulationRequest(
            photons=params.photons,
            distance=d,
            attenuation=params.attenuation,
            noise=params.noise,
            detector_efficiency=params.detector_efficiency,
            eve_enabled=params.eve_enabled,
            eve_probability=params.eve_probability,
            qber_threshold=params.qber_threshold,
            ec_efficiency=params.ec_efficiency,
            seed=(base_seed + i) if base_seed is not None else None,
        )
        res = run_simulation(req)
        distance_points.append(
            SweepPoint(
                x=round(d, 2),
                qber=res.qber,
                skr=res.skr,
                sifted_key_length=res.sifted_key_length,
                final_key_length=res.final_key_length,
            )
        )

    # ── Noise sweep (fix distance at midpoint, vary noise) ────────────────
    mid_distance = (params.distance_min + params.distance_max) / 2.0
    noises = _np.linspace(
        params.noise_min, params.noise_max, params.noise_steps
    ).tolist()
    noise_points: list[SweepPoint] = []
    for i, n in enumerate(noises):
        req = SimulationRequest(
            photons=params.photons,
            distance=mid_distance,
            attenuation=params.attenuation,
            noise=n,
            detector_efficiency=params.detector_efficiency,
            eve_enabled=params.eve_enabled,
            eve_probability=params.eve_probability,
            qber_threshold=params.qber_threshold,
            ec_efficiency=params.ec_efficiency,
            seed=(base_seed + 1000 + i) if base_seed is not None else None,
        )
        res = run_simulation(req)
        noise_points.append(
            SweepPoint(
                x=round(n, 4),
                qber=res.qber,
                skr=res.skr,
                sifted_key_length=res.sifted_key_length,
                final_key_length=res.final_key_length,
            )
        )

    return SweepResponse(
        distance_sweep=distance_points,
        noise_sweep=noise_points,
    )


@app.post("/sweep", response_model=SweepResponse)
async def sweep(request: SweepRequest) -> SweepResponse:
    """Run parameter sweeps to generate graph data."""
    try:
        return run_sweep(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Monte Carlo pipeline
# ---------------------------------------------------------------------------


def run_monte_carlo(params: MonteCarloRequest) -> MonteCarloResponse:
    """Run multiple simulation trials and aggregate statistics."""
    qbers: list[float] = []
    skrs: list[float] = []
    sifted_lens: list[int] = []
    final_lens: list[int] = []

    for i in range(params.trials):
        seed = (params.base_seed + i) if params.base_seed is not None else None
        req = SimulationRequest(
            photons=params.photons,
            distance=params.distance,
            attenuation=params.attenuation,
            noise=params.noise,
            detector_efficiency=params.detector_efficiency,
            eve_enabled=params.eve_enabled,
            eve_probability=params.eve_probability,
            qber_threshold=params.qber_threshold,
            ec_efficiency=params.ec_efficiency,
            seed=seed,
        )
        res = run_simulation(req)
        qbers.append(res.qber)
        skrs.append(res.skr)
        sifted_lens.append(res.sifted_key_length)
        final_lens.append(res.final_key_length)

    def _stats(values: list[float]) -> MonteCarloStats:
        arr = _np.array(values)
        return MonteCarloStats(
            mean=round(float(arr.mean()), 6),
            std=round(float(arr.std()), 6),
            min_val=round(float(arr.min()), 6),
            max_val=round(float(arr.max()), 6),
        )

    return MonteCarloResponse(
        trials=params.trials,
        qber=_stats([float(v) for v in qbers]),
        skr=_stats([float(v) for v in skrs]),
        sifted_key_length=_stats([float(v) for v in sifted_lens]),
        final_key_length=_stats([float(v) for v in final_lens]),
    )


@app.post("/monte-carlo", response_model=MonteCarloResponse)
async def monte_carlo(request: MonteCarloRequest) -> MonteCarloResponse:
    """Run Monte Carlo simulation with multiple trials."""
    try:
        return run_monte_carlo(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Generic parameter sweep
# ---------------------------------------------------------------------------


def run_generic_sweep(params: GenericSweepRequest) -> GenericSweepResponse:
    """Sweep a single parameter while holding others fixed."""
    values = _np.linspace(
        params.sweep_min, params.sweep_max, params.sweep_steps
    ).tolist()
    points: list[SweepPoint] = []

    base = dict(
        photons=params.photons,
        distance=params.distance,
        attenuation=params.attenuation,
        noise=params.noise,
        detector_efficiency=params.detector_efficiency,
        eve_enabled=params.eve_enabled,
        eve_probability=params.eve_probability,
        qber_threshold=params.qber_threshold,
        ec_efficiency=params.ec_efficiency,
    )

    for i, v in enumerate(values):
        req_dict = {**base, params.sweep_param: v}
        req_dict["seed"] = (
            (params.seed + 2000 + i) if params.seed is not None else None
        )
        req = SimulationRequest(**req_dict)
        res = run_simulation(req)
        points.append(
            SweepPoint(
                x=round(v, 6),
                qber=res.qber,
                skr=res.skr,
                sifted_key_length=res.sifted_key_length,
                final_key_length=res.final_key_length,
            )
        )

    return GenericSweepResponse(sweep_param=params.sweep_param, points=points)


@app.post("/sweep/param", response_model=GenericSweepResponse)
async def sweep_param(request: GenericSweepRequest) -> GenericSweepResponse:
    """Sweep any single parameter."""
    try:
        return run_generic_sweep(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
async def health() -> dict[str, str]:
    """Simple liveness probe."""
    return {"status": "ok"}
