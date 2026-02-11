"""
General-purpose utility functions for the QKD simulation engine.
"""

import numpy as np
from numpy.random import Generator


def create_rng(seed: int | None = None) -> Generator:
    """
    Create a NumPy random number generator.

    When a seed is provided the simulation becomes fully deterministic
    and reproducible, which is essential for regression testing and
    debugging.

    Args:
        seed: Optional integer seed. ``None`` → non-deterministic.

    Returns:
        A ``numpy.random.Generator`` instance (PCG-64 algorithm).
    """
    return np.random.default_rng(seed)


def sample_bits(bits: np.ndarray, max_samples: int = 64) -> list[int]:
    """
    Extract a bounded sample of bits for API response / UI display.

    Args:
        bits:        Source bit array.
        max_samples: Maximum number of bits to return.

    Returns:
        Python list of ints (0 or 1), length ≤ max_samples.
    """
    return bits[:max_samples].tolist()


def clamp(value: float, lo: float, hi: float) -> float:
    """Clamp *value* into the closed interval [lo, hi]."""
    return max(lo, min(hi, value))
