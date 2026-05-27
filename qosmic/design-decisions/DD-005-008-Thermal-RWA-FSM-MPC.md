# DD-005 · Thermal Isolation Decision

**Type:** Design Decision  
**Status:** Closed  
**Date:** 2024-11

## Context

In LEO, the terminal cycles through eclipse and sunlight every ~45 minutes, causing thermal gradients of 40°C across the optical bench. This causes structural flex — a primary contributor to pointing error (see [[SS-003-Pointing-Error-Control]] error budget: 0.6 μrad RMS from thermal flex).

## Options

| Approach | Flex Reduction | Mass | Cost |
|---|---|---|---|
| Invar optical bench | 60% | +350 g | +$8k |
| Active thermal control (heaters + sensors) | 75% | +120 g | +$15k |
| Passive MLI + titanium flexures | 45% | +80 g | +$3k |

## Decision

**Passive MLI + titanium flexures.** Active control adds embedded software complexity (failure mode in software) and power draw. Invar adds excessive mass. Passive approach keeps flex within pointing budget with margin.

Consequence: thermal flex remains the largest single uncertainty in pointing error budget. If on-orbit data shows flex > 0.8 μrad, active control must be added in v2.

---

**Tags:** #design-decision #thermal #pointing #structural

---

# DD-006 · RWA Vibration Isolation: Passive vs. Active

**Type:** Design Decision  
**Status:** Closed  
**Date:** 2024-12

## Context

Reaction wheel assembly creates micro-vibration at 20–120 Hz that directly excites the optical bench, causing pointing jitter exceeding FSM correction bandwidth at resonance peaks.

## Decision

**Passive isolator (wire rope isolator, 15 Hz corner frequency).**

Active isolation requires force actuators and sensors collocated with RWA — this adds mass, power, and software control loops that interact with the ACS. At current TRL, passive isolation achieves 35 dB attenuation above 50 Hz, sufficient to keep RWA contribution to 0.9 μrad RMS.

Revisit for v2 if RWA imbalance measurements on orbit exceed prediction.

---

**Tags:** #design-decision #vibration #rwa #control

---

# DD-007 · FSM Bandwidth Tradeoff

**Type:** Design Decision  
**Status:** Closed  
**Date:** 2024-10

## Context

Higher FSM bandwidth improves disturbance rejection but requires higher voltage drive (power) and approaches piezo resonance (instability risk). 

## Decision

**800 Hz closed-loop bandwidth** (1 kHz structural resonance, 20% margin below resonance per stability requirement).

At 800 Hz:
- RWA harmonics up to 80 Hz attenuated >40 dB ✅
- Power draw: 2.1 W (within 5W subsystem budget) ✅
- Phase margin: 45° at crossover ✅

Pointing loss from residual FSM error: 0.5 μrad, contributing −0.5 dB to link budget.

---

**Tags:** #design-decision #fsm #bandwidth #control

---

# DD-008 · MPC Feasibility for Pointing Control

**Type:** Design Decision  
**Status:** Open  
**Date:** 2025-01

## Context

Model-Predictive Control using ephemeris feed-forward could anticipate orbital geometry changes and pre-position the FSM, reducing tracking error. However, MPC requires an onboard dynamics model and is computationally heavier than PID.

## Open Questions

- Does the flight computer (Xilinx Kintex FPGA) have sufficient headroom for MPC at 2 kHz?
- What is the model uncertainty tolerance before MPC degrades below PID performance?

Status: simulation study ongoing. Decision deferred to Q2 2025.

---

**Tags:** #design-decision #mpc #control #open
