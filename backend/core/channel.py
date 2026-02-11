"""
Quantum optical channel model for BB84 QKD.

Models photon propagation through an optical fiber including:
- Exponential attenuation (Beer–Lambert law in dB scale).
- Finite detector efficiency.
- Stochastic detection events.

The combined detection probability per photon is:
    P_detect = T(α, L) × η_detector

where the transmittance is:
    T(α, L) = 10^(−α · L / 10)

with α the fiber attenuation coefficient (dB/km) and L the link distance (km).
"""

import numpy as np
from numpy.random import Generator


def transmittance(alpha: float, distance: float) -> float:
    """
    Compute the channel transmittance.

    T = 10^(−α · L / 10)

    For typical telecom fiber at 1550 nm, α ≈ 0.2 dB/km.

    Args:
        alpha:    Attenuation coefficient in dB/km (≥ 0).
        distance: Fiber link length in km (≥ 0).

    Returns:
        Channel transmittance T ∈ (0, 1].
    """
    return 10.0 ** (-alpha * distance / 10.0)


def detection_probability(
    alpha: float,
    distance: float,
    detector_efficiency: float,
) -> float:
    """
    Compute the overall per-photon detection probability.

    P_detect = T(α, L) × η_detector

    Args:
        alpha:               Attenuation coefficient (dB/km).
        distance:            Link distance (km).
        detector_efficiency: Single-photon detector efficiency η ∈ (0, 1].

    Returns:
        Detection probability per emitted photon.
    """
    t = transmittance(alpha, distance)
    return t * detector_efficiency


def simulate_detection(
    n: int,
    alpha: float,
    distance: float,
    detector_efficiency: float,
    rng: Generator,
) -> np.ndarray:
    """
    Simulate stochastic photon detection through a lossy channel.

    Each of the n emitted photons independently survives with
    probability P_detect = T × η_detector.

    Args:
        n:                   Number of emitted photons.
        alpha:               Attenuation coefficient (dB/km).
        distance:            Link distance (km).
        detector_efficiency: Detector efficiency η ∈ (0, 1].
        rng:                 NumPy random generator instance.

    Returns:
        Boolean array of shape (n,): True if photon detected by Bob.
    """
    p_detect = detection_probability(alpha, distance, detector_efficiency)
    return rng.random(n) < p_detect
