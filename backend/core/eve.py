"""
Eve's intercept-resend attack on the BB84 protocol.

In this attack Eve:
1. Intercepts each photon with probability `eve_probability`.
2. For each intercepted photon, chooses a uniformly random
   measurement basis and measures the qubit.
3. Prepares a new qubit in the state corresponding to her
   measurement outcome and resends it to Bob.

Information-theoretic consequences:
- If Eve's basis matches Alice's → Eve gets the correct bit and
  resends the correct state. No error is introduced.
- If Eve's basis differs (probability ½) → Eve's measurement
  collapses the state; she obtains a uniformly random bit and
  resends a state in the wrong basis. When Bob later measures
  in Alice's basis (sifted key), there is a 50 % error probability.

Expected QBER contribution from Eve:
    QBER_Eve = eve_probability × ½ × ½ = eve_probability / 4

For full interception (eve_probability = 1.0), QBER_Eve = 25 %,
which is the well-known BB84 intercept-resend bound.
"""

from dataclasses import dataclass

import numpy as np
from numpy.random import Generator


@dataclass(frozen=True)
class EveResult:
    """Encapsulates the outcome of Eve's intercept-resend attack."""

    effective_bits: np.ndarray
    """Bit values of photon states after Eve's intervention."""

    effective_bases: np.ndarray
    """Encoding bases of photon states after Eve's intervention."""

    intercepted_count: int
    """Number of photons Eve actually intercepted."""


def intercept_resend(
    alice_bits: np.ndarray,
    alice_bases: np.ndarray,
    eve_probability: float,
    rng: Generator,
) -> EveResult:
    """
    Execute Eve's intercept-resend attack on a photon stream.

    Args:
        alice_bits:      Alice's encoded bit values (0 or 1).
        alice_bases:     Alice's encoding bases (0 = Z, 1 = X).
        eve_probability: Probability that Eve intercepts any given photon.
        rng:             NumPy random generator instance.

    Returns:
        EveResult containing effective bits/bases after eavesdropping
        and the count of intercepted photons.
    """
    n = len(alice_bits)

    # --- determine which photons Eve intercepts ---
    intercepted = rng.random(n) < eve_probability
    intercepted_count = int(np.sum(intercepted))

    if intercepted_count == 0:
        return EveResult(
            effective_bits=alice_bits.copy(),
            effective_bases=alice_bases.copy(),
            intercepted_count=0,
        )

    # --- Eve's random measurement bases ---
    eve_bases = rng.integers(0, 2, size=n, dtype=np.int8)

    # --- Eve's measurement outcomes ---
    # Matching basis → correct bit; mismatching → random bit
    eve_basis_correct = eve_bases == alice_bases
    random_outcomes = rng.integers(0, 2, size=n, dtype=np.int8)
    eve_measured = np.where(
        eve_basis_correct, alice_bits, random_outcomes
    ).astype(np.int8)

    # --- Construct effective state after Eve ---
    # Non-intercepted photons retain Alice's original state
    effective_bits = np.where(intercepted, eve_measured, alice_bits).astype(np.int8)
    effective_bases = np.where(intercepted, eve_bases, alice_bases).astype(np.int8)

    return EveResult(
        effective_bits=effective_bits,
        effective_bases=effective_bases,
        intercepted_count=intercepted_count,
    )
