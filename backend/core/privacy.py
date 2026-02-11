"""
Privacy amplification and secret-key-rate estimation for BB84.

After key sifting and error estimation, Alice and Bob apply privacy
amplification to distil a shorter key about which Eve has negligible
information. The achievable rate is bounded by the Shor–Preskill /
Devetak–Winter formula (one-way post-processing):

    SKR = R_sifted × [1 − 2 H(Q)]

where:
    R_sifted = (sifted key length) / (total photons sent)
    H(Q)     = −Q log₂ Q − (1−Q) log₂(1−Q)   (binary entropy)

When QBER Q exceeds ~11.0 %, the quantity 1 − 2H(Q) becomes negative,
meaning no secret key can be extracted — the channel is too noisy
(or too heavily eavesdropped) for BB84.
"""

from utils.entropy import binary_entropy


def secret_key_rate(
    sifted_fraction: float,
    qber: float,
    ec_efficiency: float = 1.0,
) -> float:
    """
    Asymptotic secret key rate per emitted photon (Shor–Preskill bound).

    SKR = R_sifted × max(0, 1 − H(Q) − f_EC · H(Q))

    When ec_efficiency (f_EC) = 1.0 (Shannon limit), this reduces to
    the standard formula: 1 − 2H(Q).

    Args:
        sifted_fraction: Ratio of sifted-key bits to total emitted photons.
        qber:            Quantum Bit Error Rate ∈ [0, 1].
        ec_efficiency:   Error correction efficiency factor f_EC ≥ 1.0.
                         1.0 = Shannon limit, ~1.16 = typical Cascade/LDPC.

    Returns:
        Secret key rate ≥ 0 (bits per photon sent).
    """
    h = binary_entropy(qber)
    secure_capacity = 1.0 - (1.0 + ec_efficiency) * h
    return max(0.0, sifted_fraction * secure_capacity)


def estimate_final_key_length(
    sifted_length: int,
    qber: float,
    ec_efficiency: float = 1.0,
) -> int:
    """
    Estimate the length of the final secure key after privacy amplification.

    final_key = sifted_length × max(0, 1 − H(Q) − f_EC · H(Q))

    Args:
        sifted_length:  Number of bits in the sifted key.
        qber:           Quantum Bit Error Rate.
        ec_efficiency:  Error correction efficiency factor f_EC ≥ 1.0.

    Returns:
        Estimated final secure key length (integer, ≥ 0).
    """
    h = binary_entropy(qber)
    secure_fraction = max(0.0, 1.0 - (1.0 + ec_efficiency) * h)
    return int(sifted_length * secure_fraction)


def evaluate_security(qber: float, threshold: float) -> str:
    """
    Classify the link security based on observed QBER.

    The standard BB84 theoretical threshold is ≈ 11 % (one-way
    post-processing). Practical deployments often use a lower
    operational threshold for safety margin.

    Args:
        qber:      Measured QBER.
        threshold: Maximum tolerable QBER for key extraction.

    Returns:
        ``"SECURE"`` if QBER ≤ threshold, else ``"COMPROMISED"``.
    """
    return "SECURE" if qber <= threshold else "COMPROMISED"
