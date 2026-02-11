"""
Pydantic request / response schemas for the BB84 simulation API.
"""

from typing import Literal

from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    """Parameters for a single BB84 QKD simulation run."""

    photons: int = Field(
        ...,
        ge=100,
        le=10_000_000,
        description="Total number of photons Alice emits.",
    )
    distance: float = Field(
        ...,
        ge=0.0,
        le=1000.0,
        description="Fiber link distance in km.",
    )
    attenuation: float = Field(
        0.2,
        ge=0.0,
        le=10.0,
        description="Fiber attenuation coefficient α (dB/km). Typical telecom: 0.2.",
    )
    noise: float = Field(
        0.0,
        ge=0.0,
        le=0.5,
        description="Independent bit-flip probability per detected photon.",
    )
    detector_efficiency: float = Field(
        1.0,
        gt=0.0,
        le=1.0,
        description="Single-photon detector efficiency η.",
    )
    eve_enabled: bool = Field(
        False,
        description="If True, Eve performs an intercept-resend attack.",
    )
    eve_probability: float = Field(
        0.0,
        ge=0.0,
        le=1.0,
        description="Probability that Eve intercepts any given photon.",
    )
    qber_threshold: float = Field(
        0.11,
        gt=0.0,
        le=0.5,
        description="QBER threshold for declaring the channel compromised.",
    )
    ec_efficiency: float = Field(
        1.0,
        ge=1.0,
        le=2.0,
        description="Error correction efficiency f_EC (1.0 = Shannon limit, ~1.16 = Cascade).",
    )
    seed: int | None = Field(
        None,
        description="Random seed for deterministic reproducibility. None → random.",
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "photons": 10000,
                    "distance": 50.0,
                    "attenuation": 0.2,
                    "noise": 0.01,
                    "detector_efficiency": 0.8,
                    "eve_enabled": False,
                    "eve_probability": 0.0,
                    "qber_threshold": 0.11,
                    "ec_efficiency": 1.0,
                    "seed": 42,
                }
            ]
        }
    }


class SweepRequest(BaseModel):
    """Parameters for a parameter-sweep across distance or noise."""

    photons: int = Field(10_000, ge=100, le=10_000_000)
    attenuation: float = Field(0.2, ge=0.0, le=10.0)
    noise: float = Field(0.01, ge=0.0, le=0.5)
    detector_efficiency: float = Field(0.9, gt=0.0, le=1.0)
    eve_enabled: bool = Field(False)
    eve_probability: float = Field(0.0, ge=0.0, le=1.0)
    qber_threshold: float = Field(0.11, gt=0.0, le=0.5)
    ec_efficiency: float = Field(1.0, ge=1.0, le=2.0)
    seed: int | None = Field(None)

    # Sweep ranges
    distance_min: float = Field(0.0, ge=0.0)
    distance_max: float = Field(100.0, ge=0.0, le=1000.0)
    distance_steps: int = Field(20, ge=2, le=100)

    noise_min: float = Field(0.0, ge=0.0)
    noise_max: float = Field(0.15, ge=0.0, le=0.5)
    noise_steps: int = Field(20, ge=2, le=100)


class SweepPoint(BaseModel):
    """A single data point from a parameter sweep."""

    x: float
    qber: float
    skr: float
    sifted_key_length: int
    final_key_length: int


class SweepResponse(BaseModel):
    """Results from a parameter sweep."""

    distance_sweep: list[SweepPoint] = Field(
        ..., description="QBER & SKR at each distance step."
    )
    noise_sweep: list[SweepPoint] = Field(
        ..., description="QBER & SKR at each noise step."
    )


# ---------------------------------------------------------------------------
# Phase 4 — Advanced Mode schemas
# ---------------------------------------------------------------------------


class MonteCarloRequest(BaseModel):
    """Parameters for Monte Carlo averaging over multiple simulation runs."""

    photons: int = Field(10_000, ge=100, le=10_000_000)
    distance: float = Field(50.0, ge=0.0, le=1000.0)
    attenuation: float = Field(0.2, ge=0.0, le=10.0)
    noise: float = Field(0.01, ge=0.0, le=0.5)
    detector_efficiency: float = Field(0.9, gt=0.0, le=1.0)
    eve_enabled: bool = Field(False)
    eve_probability: float = Field(0.0, ge=0.0, le=1.0)
    qber_threshold: float = Field(0.11, gt=0.0, le=0.5)
    ec_efficiency: float = Field(1.0, ge=1.0, le=2.0)
    trials: int = Field(10, ge=2, le=100)
    base_seed: int | None = Field(None)


class MonteCarloStats(BaseModel):
    """Descriptive statistics for a metric across Monte Carlo trials."""

    mean: float
    std: float
    min_val: float
    max_val: float


class MonteCarloResponse(BaseModel):
    """Aggregated results from Monte Carlo simulation runs."""

    trials: int
    qber: MonteCarloStats
    skr: MonteCarloStats
    sifted_key_length: MonteCarloStats
    final_key_length: MonteCarloStats


class GenericSweepRequest(BaseModel):
    """Sweep any single parameter while holding others fixed."""

    photons: int = Field(10_000, ge=100, le=10_000_000)
    distance: float = Field(50.0, ge=0.0, le=1000.0)
    attenuation: float = Field(0.2, ge=0.0, le=10.0)
    noise: float = Field(0.01, ge=0.0, le=0.5)
    detector_efficiency: float = Field(0.9, gt=0.0, le=1.0)
    eve_enabled: bool = Field(False)
    eve_probability: float = Field(0.0, ge=0.0, le=1.0)
    qber_threshold: float = Field(0.11, gt=0.0, le=0.5)
    ec_efficiency: float = Field(1.0, ge=1.0, le=2.0)
    seed: int | None = Field(None)

    sweep_param: Literal[
        "distance", "noise", "attenuation", "detector_efficiency", "eve_probability"
    ] = Field(..., description="Which parameter to sweep.")
    sweep_min: float = Field(..., ge=0.0)
    sweep_max: float = Field(...)
    sweep_steps: int = Field(25, ge=2, le=100)


class GenericSweepResponse(BaseModel):
    """Results from sweeping a single parameter."""

    sweep_param: str
    points: list[SweepPoint]


class SimulationResponse(BaseModel):
    """Results returned from a BB84 simulation run."""

    qber: float = Field(
        ..., description="Quantum Bit Error Rate (fraction of mismatched sifted bits)."
    )
    skr: float = Field(
        ..., description="Secret Key Rate (secure bits per photon sent)."
    )
    total_photons: int = Field(
        ..., description="Total number of photons Alice emitted."
    )
    sifted_key_length: int = Field(
        ..., description="Number of bits surviving basis reconciliation."
    )
    final_key_length: int = Field(
        ..., description="Estimated secure key length after privacy amplification."
    )
    raw_bits_sample: list[int] = Field(
        ..., description="Sample of Alice's raw bit string (up to 64 bits)."
    )
    bob_bits_sample: list[int] = Field(
        ..., description="Sample of Bob's sifted key bits (up to 64 bits)."
    )
    mismatches: int = Field(
        ..., description="Absolute number of bit mismatches in the sifted key."
    )
    security_status: Literal["SECURE", "COMPROMISED"] = Field(
        ..., description="Security classification based on QBER threshold."
    )
