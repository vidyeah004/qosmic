# SS-003 · Pointing Error & Control Systems

**Type:** Subsystem  
**Status:** Active Development  
**Owner:** GNC + Embedded Systems  
**Last Updated:** 2025-01

---

## Purpose

After acquisition ([[SS-001-Beam-Acquisition-Tracking]]), the control system must hold the beam on target continuously. A 1 μrad pointing error at 1000 km range = 1 mm beam wander. The link budget allocates 3 dB for pointing loss, which corresponds to a **2 μrad RMS pointing error budget** (see derivation in [[PHY-004-Pointing-Loss-Formula]]).

---

## Error Budget Breakdown

| Source | Contribution (μrad RMS) |
|---|---|
| Star tracker noise | 0.8 |
| Structural thermal flex | 0.6 |
| Reaction wheel microvibration | 0.9 |
| FSM residual error | 0.5 |
| **Total RSS** | **1.4 μrad** |

**Margin vs. 2 μrad budget: 0.6 μrad** — tight but acceptable.  
Thermal flex is the largest uncertainty. See [[DD-005-Thermal-Isolation-Decision]].

---

## Control Architecture

```
Disturbance Input
      ↓
[Satellite ACS]  →  coarse (arcsec level)
      ↓
[FSM Controller] →  fine (μrad level), bandwidth 800 Hz
      ↓
[Centroid Estimator] ← APD quad-cell signal
      ↓
[Error → FSM command loop]  (closed at 2 kHz)
```

**Control law:** PID with feed-forward from ephemeris angular rate prediction.  
**Loop bandwidth:** 800 Hz (limited by FSM resonance, see [[C-001-Fast-Steering-Mirror]])  
**Latency budget:** < 500 μs end-to-end (ADC → compute → DAC → FSM)

---

## Vibration Environment

Primary disturbance: reaction wheel assembly (RWA) imbalance.
- Dominant frequencies: 20–120 Hz (wheel speed harmonics)
- FSM control loop must attenuate >40 dB at these frequencies
- See [[DD-006-RWA-Isolation-Approach]] — passive isolator chosen over active

---

## Key Components

- [[C-001-Fast-Steering-Mirror]] — 2-axis piezo, ±5 mrad range, 1 kHz bandwidth
- [[C-004-Star-Tracker]] — attitude reference for feed-forward
- [[C-006-Quad-Cell-Detector]] — centroid estimation, 10 kHz sample rate

---

## Link to Link Budget

Pointing loss formula:  
`L_point = −4.34 × (σ_point / θ_div)²` dB

Where:
- σ_point = 1.4 μrad RMS (our budget)
- θ_div = beam divergence from [[SS-002-Link-Budget]]

Any change to FSM performance directly changes the link margin calculation. These two subsystems must be co-designed.

---

## Open Design Questions

- [ ] Whether notch filters at RWA harmonics are needed (adds latency, see [[DD-006]])
- [ ] Moving to model-predictive control (MPC) for better ephemeris feed-forward — [[DD-008-MPC-Feasibility]]

---

**Tags:** #subsystem #pointing #control #gnc #fso
