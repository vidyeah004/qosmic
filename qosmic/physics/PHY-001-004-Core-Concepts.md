# PHY-001 · Gaussian Beam Propagation

**Type:** Physics Concept  
**Relevant to:** [[SS-001-Beam-Acquisition-Tracking]], [[SS-002-Link-Budget-Atmospheric-Models]]

---

## Key Formula

Far-field beam divergence half-angle:
```
θ_div = λ / (π × w₀)
```
Where:
- λ = wavelength (1550 nm = 1.55×10⁻⁶ m)
- w₀ = beam waist radius at transmitter aperture

For QOSMIC 10 cm aperture (w₀ = 5 cm):
```
θ_div = 1.55e-6 / (π × 0.05) = 9.9 μrad ≈ 10 μrad
```

This 10 μrad divergence determines:
1. The minimum detectable acquisition cone during spiral scan
2. The pointing loss sensitivity (see [[PHY-004-Pointing-Loss-Formula]])
3. The beam spot diameter at the receiver (10 cm at 1000 km → 10 m spot — only fraction captured by receive aperture)

---

## Implication for Acquisition

The acquisition scan must cover the uncertainty cone (typically ±0.5° = ±8700 μrad) using a beam that is only 10 μrad wide. This means the scan must visit ~750,000 resolution cells — which is why fast MEMS scanning and optimised scan patterns matter (see [[DD-003]]).

---

**Tags:** #physics #beam-propagation #gaussian #optics

---

# PHY-002 · Atmospheric Turbulence

**Type:** Physics Concept  
**Relevant to:** [[SS-002-Link-Budget-Atmospheric-Models]]

---

## Kolmogorov Turbulence Model

Refractive index structure parameter Cn² characterises turbulence strength:
- Cn² = 10⁻¹⁷ m⁻²/³: weak (high altitude, LEO-LEO)
- Cn² = 10⁻¹⁴ m⁻²/³: strong (ground level)

For QOSMIC LEO-LEO links (both terminals > 400 km altitude): turbulence is negligible. Atmospheric loss budgeted at −2 dB conservatively.

For future LEO-Ground downlinks: Cn² can reach 10⁻¹⁴ near ground, causing:
- Scintillation index σᵢ² ≈ 0.5–2.0
- Beam wander: σ_wander ≈ 10 cm at ground
- Fade probability: P(fade > 10 dB) ≈ 15% without mitigation

Mitigation options for ground links: aperture averaging, adaptive optics, site diversity.

---

**Tags:** #physics #atmosphere #turbulence #scintillation

---

# PHY-003 · Doppler Shift in LEO FSO Links

**Type:** Physics Concept  
**Relevant to:** [[SS-001-Beam-Acquisition-Tracking]]

---

## Calculation

Relative velocity between two LEO satellites (worst case, head-on): ~15.6 km/s  
Doppler shift: Δf = v/c × f₀

At 1550 nm carrier (f₀ = 193 THz):
```
Δf = (15,600 / 3×10⁸) × 193×10¹² = ±10.1 GHz
```

## Implications

- Receiver must tolerate ±10 GHz frequency offset during acquisition
- Coherent detection (planned for future 100 Gbps upgrade) requires Doppler pre-compensation
- Current intensity-modulation direct-detection (IM-DD) scheme is Doppler-insensitive: ✅ no issue for Phase 1

---

**Tags:** #physics #doppler #leo #optical

---

# PHY-004 · Pointing Loss Formula

**Type:** Physics Concept  
**Relevant to:** [[SS-002-Link-Budget-Atmospheric-Models]], [[SS-003-Pointing-Error-Control]]

---

## Formula

For a Gaussian beam with RMS pointing error σ_point and half-angle divergence θ_div:
```
L_point (dB) = −4.34 × (σ_point / θ_div)²
```

For QOSMIC baseline:
- σ_point = 1.4 μrad RMS (from [[SS-003]] error budget)
- θ_div = 9.9 μrad (from [[PHY-001]])

```
L_point = −4.34 × (1.4 / 9.9)² = −4.34 × 0.02 = −0.087 dB
```

**Wait — link budget uses −3 dB for pointing loss. Why the discrepancy?**

The −3 dB is a worst-case allocation (2σ peak error, not RMS), includes manufacturing alignment error (0.5 μrad static bias), and adds margin for on-orbit calibration uncertainty. The RMS formula gives mean loss; peak loss drives the margin requirement.

---

**Tags:** #physics #pointing-loss #link-budget #gaussian
