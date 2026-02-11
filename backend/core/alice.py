"""
Alice's operations in the BB84 quantum key distribution protocol.

Alice is the sender. She:
1. Generates a random bit string (the raw key).
2. Chooses a random basis for each bit (rectilinear Z or diagonal X).
3. Encodes each bit into a qubit state according to the chosen basis:
   - Z basis, bit 0 → |0⟩
   - Z basis, bit 1 → |1⟩
   - X basis, bit 0 → |+⟩ = (|0⟩ + |1⟩)/√2
   - X basis, bit 1 → |−⟩ = (|0⟩ − |1⟩)/√2
"""

import numpy as np
from numpy.random import Generator


def generate_bits(n: int, rng: Generator) -> np.ndarray:
    """
    Generate n uniformly random classical bits for Alice's raw key.

    Args:
        n: Number of bits to generate.
        rng: NumPy random generator instance.

    Returns:
        1-D int8 array of shape (n,) with values in {0, 1}.
    """
    return rng.integers(0, 2, size=n, dtype=np.int8)


def generate_bases(n: int, rng: Generator) -> np.ndarray:
    """
    Generate n uniformly random measurement bases for Alice.

    Encoding:
        0 → Rectilinear (Z) basis: {|0⟩, |1⟩}
        1 → Diagonal    (X) basis: {|+⟩, |−⟩}

    Args:
        n: Number of bases to generate.
        rng: NumPy random generator instance.

    Returns:
        1-D int8 array of shape (n,) with values in {0, 1}.
    """
    return rng.integers(0, 2, size=n, dtype=np.int8)
