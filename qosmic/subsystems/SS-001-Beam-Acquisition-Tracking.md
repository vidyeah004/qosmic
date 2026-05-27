# SS-001 · Beam Acquisition & Tracking (BAT)

**Type:** Subsystem  
**Status:** Active Development  
**Owner:** Propulsion + Opto-Mech team  
**Last Updated:** 2025-01

---

## Purpose

The Beam Acquisition & Tracking subsystem establishes and maintains the optical link between two terminals on LEO satellites moving at ~7.8 km/s relative to each other. It is QOSMIC's primary technical differentiator — faster acquisition time at lower SWaP than competing systems (Mynaric CONDOR, Skyloom GlobalX).

---

## Acquisition Sequence

```
1. Coarse Pointing (star tracker + ephemeris)  →  ~1° uncertainty cone
2. Spiral Scan (MEMS mirror sweep)             →  beacon detection
3. Closed-loop Fine Pointing (FSM)             →  lock on signal centroid
4. Link Handshake (comm channel established)   →  data flow begins
```

**Target acquisition time:** < 8 seconds (see [[DD-003-Acquisition-Time-Budget]])  
**Competitor baseline:** Mynaric CONDOR ≈ 30s; Skyloom GlobalX ≈ 20s

---

## Key Components

- [[C-001-Fast-Steering-Mirror]] — fine pointing actuator, 2-axis, bandwidth >1 kHz
- [[C-002-MEMS-Mirror]] — coarse scan during acquisition spiral
- [[C-003-Avalanche-Photodiode]] — beacon detection, sensitivity −50 dBm
- [[C-004-Star-Tracker]] — initial attitude reference, 10 arcsec accuracy

---

## Link to Other Subsystems

- Depends on [[SS-002-Link-Budget]] for minimum detectable signal threshold
- Feeds into [[SS-003-Pointing-Error-Control]] for steady-state tracking
- Acquisition success rate affects overall link availability metric (see [[REQ-005]])

---

## Known Failure Modes

| Failure | Root Cause | Mitigation |
|---|---|---|
| Missed acquisition | Ephemeris error > pointing FOV | Widen scan cone, tighten TLE update cadence |
| False lock | Stray sunlight reflection | Spectral filtering at 1550 nm ±0.5 nm |
| Link dropout | Vibration spike exceeding FSM bandwidth | See [[DD-007-FSM-Bandwidth-Tradeoff]] |

---

## Physics Concepts

- [[PHY-001-Gaussian-Beam-Propagation]] — far-field divergence determines acquisition cone minimum
- [[PHY-003-Doppler-Shift]] — relative velocity causes ±11 GHz frequency shift at 1550 nm

---

## Open Design Questions

- [ ] Whether to use single-aperture or dual-aperture for simultaneous TX/RX during acquisition
- [ ] Optimal spiral scan pattern: Archimedean vs. raster (see [[DD-003]])

---

**Tags:** #subsystem #bat #acquisition #tracking #core-ip
