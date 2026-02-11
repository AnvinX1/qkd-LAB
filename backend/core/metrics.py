"""
Key-quality metrics for BB84 QKD.

The primary metric is the Quantum Bit Error Rate (QBER), defined as
the fraction of sifted-key positions where Alice's and Bob's bits
disagree:

    QBER = (# mismatched bits) / (sifted key length)

QBER sources include:
- Detector dark counts and timing jitter
- Optical misalignment (modeled as bit-flip noise)
- Eavesdropper-induced disturbance
"""

import numpy as np


def calculate_qber(
    alice_sifted: np.ndarray,
    bob_sifted: np.ndarray,
) -> tuple[float, int]:
    """
    Compute the Quantum Bit Error Rate from sifted keys.

    Args:
        alice_sifted: Alice's sifted key bits.
        bob_sifted:   Bob's sifted key bits (same length).

    Returns:
        (qber, mismatch_count):
            qber           — error rate ∈ [0, 1]  (0.0 if sifted key is empty).
            mismatch_count — absolute number of disagreeing positions.
    """
    if len(alice_sifted) == 0:
        return 0.0, 0

    mismatches = int(np.sum(alice_sifted != bob_sifted))
    qber = mismatches / len(alice_sifted)

    return qber, mismatches
