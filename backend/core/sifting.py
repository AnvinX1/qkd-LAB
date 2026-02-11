"""
Basis reconciliation (key sifting) for the BB84 protocol.

After quantum transmission, Alice and Bob publicly announce their
measurement bases over an authenticated classical channel. They
discard all events where:
  - The photon was not detected (channel loss), OR
  - Their bases disagree (no useful correlation).

The surviving subset forms the **sifted key**. In an ideal
noiseless, eavesdropper-free scenario the sifted keys are identical.
"""

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class SiftResult:
    """Outcome of the key-sifting procedure."""

    alice_sifted: np.ndarray
    """Alice's bit values for sifted positions."""

    bob_sifted: np.ndarray
    """Bob's bit values for sifted positions."""

    sift_mask: np.ndarray
    """Boolean mask indicating which original positions survived sifting."""

    sifted_length: int
    """Number of bits in the sifted key."""


def sift_keys(
    alice_bits: np.ndarray,
    bob_bits: np.ndarray,
    alice_bases: np.ndarray,
    bob_bases: np.ndarray,
    detected: np.ndarray,
) -> SiftResult:
    """
    Perform basis reconciliation between Alice and Bob.

    A bit position is kept if and only if:
      1. The photon at that position was detected by Bob, AND
      2. Alice's encoding basis matches Bob's measurement basis.

    Args:
        alice_bits:  Alice's raw bit string.
        bob_bits:    Bob's measurement outcomes (full array, including
                     undetected positions — these are masked out).
        alice_bases: Alice's encoding bases.
        bob_bases:   Bob's measurement bases.
        detected:    Boolean array — True where a photon was detected.

    Returns:
        SiftResult with the sifted key pairs and metadata.
    """
    sift_mask = (alice_bases == bob_bases) & detected

    alice_sifted = alice_bits[sift_mask]
    bob_sifted = bob_bits[sift_mask]

    return SiftResult(
        alice_sifted=alice_sifted,
        bob_sifted=bob_sifted,
        sift_mask=sift_mask,
        sifted_length=int(np.sum(sift_mask)),
    )
