# SS-002 · Link Budget & Atmospheric Models

**Type:** Subsystem  
**Status:** Baselined (v2.1)  
**Owner:** Systems Engineering  
**Last Updated:** 2025-01

---

## Purpose

The link budget is the master accounting of signal power from transmitter to receiver. Every hardware spec, aperture size, and data rate claim derives from this document. It is the single source of truth for what is physically achievable on a given orbital geometry.

---

## Friis Transmission Equation (Space Optical)

```
P_rx = P_tx + G_tx − L_fs − L_atm − L_point + G_rx
```

| Term | Value | Notes |
|---|---|---|
| P_tx | +33 dBm (2W) | EDFA output, see [[C-005-EDFA]] |
| G_tx | +108 dB | 10 cm aperture at 1550 nm, diffraction limited |
| L_fs | −285 dB | 1000 km range, free-space path loss |
| L_atm | −2 dB | LEO-LEO: minimal, see [[PHY-002-Atmospheric-Turbulence]] |
| L_point | −3 dB | 2 μrad pointing error budget (see [[SS-003-Pointing-Error-Control]]) |
| G_rx | +108 dB | Matched receive aperture |
| **P_rx** | **−39 dBm** | Received power |
| Sensitivity | −50 dBm | APD threshold, see [[C-003-Avalanche-Photodiode]] |
| **Margin** | **+11 dB** | Link margin (design target: >6 dB) |

---

## Margin Policy

**Minimum acceptable link margin: 6 dB** (see [[REQ-001]])  
Current baseline: 11 dB → 5 dB contingency for degradation cases.

Margin drivers by priority:
1. Pointing loss (largest variable — depends on [[SS-003]])
2. Atmospheric scintillation (LEO-LEO low, but non-zero)
3. Optical component aging (2 dB over 5-year mission life)

---

## Range vs. Data Rate Tradeoff

| Range (km) | Max Data Rate | Link Margin |
|---|---|---|
| 500 | 100 Gbps | +17 dB |
| 1000 | 10 Gbps | +11 dB |
| 2000 | 1 Gbps | +5 dB |
| 5000 | 100 Mbps | −1 dB ❌ |

5000 km range is not achievable with current aperture. See [[DD-001-Aperture-Size-Decision]] for why we chose 10 cm over 15 cm.

---

## Atmospheric Model

For LEO-LEO links (satellite-to-satellite, no ground passage):
- Atmospheric loss ≈ 0 (above 400 km)
- Scintillation from residual upper atmosphere: modelled as log-normal fading, σ = 0.1 dB
- See [[PHY-002-Atmospheric-Turbulence]] for full Kolmogorov model

For LEO-Ground links (future roadmap):
- Cn² = 1×10⁻¹⁴ m⁻²/³ (strong turbulence)
- Effective fading: up to −15 dB in worst case
- Requires adaptive optics or aperture averaging (not in current scope)

---

## Related Design Decisions

- [[DD-001-Aperture-Size-Decision]] — why 10 cm, not 15 cm
- [[DD-002-Wavelength-Choice]] — why 1550 nm over 1064 nm
- [[DD-007-FSM-Bandwidth-Tradeoff]] — pointing loss sensitivity

---

**Tags:** #subsystem #link-budget #systems-engineering #margin #friis
