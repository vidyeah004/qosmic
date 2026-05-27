# C-001 · Fast Steering Mirror (FSM)

**Type:** Component  
**Supplier:** Physik Instrumente (PI) S-330  
**Status:** Qualified (proto), procurement lead 14 weeks  
**Relevant to:** [[SS-001-Beam-Acquisition-Tracking]], [[SS-003-Pointing-Error-Control]]

---

## Specs (Operational)

| Parameter | Value |
|---|---|
| Axes | 2 (tip/tilt) |
| Range | ±5 mrad mechanical |
| Bandwidth (−3 dB) | 1.0 kHz (structural resonance) |
| Closed-loop BW | 800 Hz (see [[DD-007-FSM-Bandwidth-Tradeoff]]) |
| Resolution | 0.1 μrad |
| Power | 2.1 W |
| Mass | 85 g |

## Why This Component

Evaluated PI S-330, Mirrorcle MEMS, and Optics in Motion OIM101. PI S-330 chosen for:
- Best bandwidth-to-mass ratio
- Proven space heritage (TRL 7 on 3 missions)
- Piezo actuator more radiation-tolerant than MEMS electrostatic drive

---

**Tags:** #component #fsm #actuator #pointing

---

# C-002 · MEMS Mirror (Coarse Scan)

**Type:** Component  
**Supplier:** Mirrorcle Technologies A7M20  
**Status:** Prototype testing  
**Relevant to:** [[SS-001-Beam-Acquisition-Tracking]]

---

## Role

Used only during acquisition phase for wide-angle spiral scan. Once locked, FSM takes over. MEMS is not in the tracking loop.

| Parameter | Value |
|---|---|
| Scan range | ±7° optical |
| Scan speed | 500°/s |
| Mass | 8 g |
| Power | 0.3 W |

---

**Tags:** #component #mems #acquisition

---

# C-003 · Avalanche Photodiode (APD)

**Type:** Component  
**Supplier:** Excelitas C30902  
**Status:** Qualified  
**Relevant to:** [[SS-001-Beam-Acquisition-Tracking]], [[SS-002-Link-Budget-Atmospheric-Models]]

---

## Key Specs

| Parameter | Value |
|---|---|
| Wavelength | 1550 nm |
| Sensitivity (min detectable) | −50 dBm |
| Gain | 10–100× (adjustable) |
| Dark current | 5 nA at M=10 |
| Bandwidth | 1 GHz |

Sensitivity of −50 dBm gives 11 dB link margin against −39 dBm received power (see [[SS-002-Link-Budget-Atmospheric-Models]]).

---

**Tags:** #component #apd #receiver #detector

---

# C-004 · Star Tracker

**Type:** Component  
**Supplier:** Berlin Space Technologies ST-400  
**Status:** Heritage (used in 12 missions)  
**Relevant to:** [[SS-001-Beam-Acquisition-Tracking]], [[SS-003-Pointing-Error-Control]]

---

## Key Specs

| Parameter | Value |
|---|---|
| Accuracy | 10 arcsec (36 μrad) |
| Update rate | 4 Hz |
| Mass | 270 g |
| Power | 1.8 W |

10 arcsec accuracy defines the initial coarse pointing uncertainty that the acquisition spiral must cover. At 4 Hz update rate, feed-forward prediction uses ephemeris to bridge between measurements.

---

**Tags:** #component #star-tracker #attitude #gnc

---

# C-005 · EDFA (Erbium-Doped Fiber Amplifier)

**Type:** Component  
**Supplier:** Keopsys CEFA-C-PB  
**Status:** Under qualification  
**Relevant to:** [[SS-002-Link-Budget-Atmospheric-Models]]

---

## Role

Boosts laser output to 2W (+33 dBm) before transmission. This is the primary TX power source in the link budget.

| Parameter | Value |
|---|---|
| Output power | 2 W (+33 dBm) |
| Noise figure | 4.5 dB |
| Power draw | 8 W |
| Mass | 120 g |

Risk: highest power-consuming component. Drives thermal dissipation design.

---

**Tags:** #component #edfa #laser #transmitter

---

# C-006 · Quad-Cell Detector

**Type:** Component  
**Supplier:** First Sensor QP50-6SD  
**Status:** Integrated in prototype  
**Relevant to:** [[SS-003-Pointing-Error-Control]]

---

## Role

Provides centroid error signal to the FSM control loop. Four quadrants measure differential intensity to compute beam position on detector.

| Parameter | Value |
|---|---|
| Sample rate | 10 kHz |
| Position resolution | 0.05 μrad |
| Active area | 5 mm × 5 mm |
| Noise equivalent angle | 0.02 μrad/√Hz |

---

**Tags:** #component #quad-cell #sensing #control
