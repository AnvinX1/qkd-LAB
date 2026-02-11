"""
Bob's operations in the BB84 quantum key distribution protocol.

Bob is the receiver. He:
1. Chooses a random measurement basis for each incoming photon.
2. Measures each photon in his chosen basis:
   - If Bob's basis matches the effective sending basis, he obtains
     the correct bit value (barring noise).
   - If the bases differ, quantum complementarity yields a uniformly
     random outcome — no information is gained.
3. Noise (modeled as an independent bit-flip channel) may corrupt
   the measurement result.
"""

import numpy as np
from numpy.random import Generator


def generate_bases(n: int, rng: Generator) -> np.ndarray:
    """
    Generate n uniformly random measurement bases for Bob.

    Encoding:
        0 → Rectilinear (Z) basis
        1 → Diagonal    (X) basis

    Args:
        n: Number of bases to generate.
        rng: NumPy random generator instance.

    Returns:
        1-D int8 array of shape (n,) with values in {0, 1}.
    """
    return rng.integers(0, 2, size=n, dtype=np.int8)


def measure(
    effective_bits: np.ndarray,
    effective_bases: np.ndarray,
    bob_bases: np.ndarray,
    noise: float,
    rng: Generator,
) -> np.ndarray:
    """
    Simulate Bob's quantum measurement of incoming photon states.

    The "effective" bits and bases represent the state of each photon
    *after* any eavesdropping. If Eve has not intervened, these are
    identical to Alice's originals.

    Measurement model:
        - Matching bases  → deterministic outcome (correct bit value).
        - Mismatched bases → uniformly random outcome (complementarity).
        - After measurement, each bit is independently flipped with
          probability `noise` (depolarizing / bit-flip channel).

    Args:
        effective_bits:  Bit values of the incoming photon states.
        effective_bases: Encoding bases of the incoming photon states.
        bob_bases:       Bob's randomly chosen measurement bases.
        noise:           Bit-flip probability per detected photon.
        rng:             NumPy random generator instance.

    Returns:
        1-D int8 array of Bob's measurement outcomes.
    """
    n = len(effective_bits)

    # Basis agreement → deterministic; disagreement → random
    basis_match = bob_bases == effective_bases
    random_bits = rng.integers(0, 2, size=n, dtype=np.int8)
    bob_bits = np.where(basis_match, effective_bits, random_bits).astype(np.int8)

    # Apply independent bit-flip noise
    if noise > 0.0:
        flip_mask = rng.random(n) < noise
        bob_bits = np.where(flip_mask, 1 - bob_bits, bob_bits).astype(np.int8)

    return bob_bits
