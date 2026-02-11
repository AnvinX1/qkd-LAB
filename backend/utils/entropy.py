"""
Information-theoretic entropy functions used in QKD security analysis.
"""

import numpy as np


def binary_entropy(p: float) -> float:
    """
    Binary (Shannon) entropy function.

        H(p) = −p log₂(p) − (1 − p) log₂(1 − p)

    Conventions:
        H(0) = H(1) = 0   (by continuity / 0·log0 = 0).

    Args:
        p: Probability value in [0, 1].

    Returns:
        Binary entropy in bits ∈ [0, 1].

    Raises:
        ValueError: If p is outside [0, 1].
    """
    if not (0.0 <= p <= 1.0):
        raise ValueError(f"Probability p must be in [0, 1], got {p}")

    if p <= 0.0 or p >= 1.0:
        return 0.0

    return float(-p * np.log2(p) - (1.0 - p) * np.log2(1.0 - p))
