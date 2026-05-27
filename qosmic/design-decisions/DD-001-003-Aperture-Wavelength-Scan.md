# DD-001 · Aperture Size Decision: 10 cm vs 15 cm

**Type:** Design Decision  
**Status:** Closed  
**Date:** 2024-09  
**Decision Maker:** CTO + Systems Lead  
**Supersedes:** —

---

## Context

Early link budget models showed 15 cm aperture achieves +6 dB additional gain, enabling 5000 km range. However, SWaP constraints from target satellite operators (6U CubeSat form factor) imposed mass and volume limits.

## Options Evaluated

| Option | Gain | Mass | Range | SWaP |
|---|---|---|---|---|
| 10 cm aperture | +108 dB | 420 g | 2000 km | ✅ Fits 6U |
| 15 cm aperture | +114 dB | 980 g | 5000 km | ❌ Requires 12U |

## Decision

**Chose 10 cm.** Target market (LEO mega-constellation operators) uses 6U-12U platforms; 15 cm forces operators to dedicate a larger bus. Competitive analysis shows no competitor offers 6U FSO terminal — this is the market entry wedge.

## Consequences

- Max range capped at 2000 km (covers 94% of LEO crosslink geometries)
- Link margin is 11 dB at 1000 km (see [[SS-002-Link-Budget]])
- Revisit at Series A if large-satellite operators become target market

---

**Tags:** #design-decision #aperture #swav #systems

---

# DD-002 · Wavelength Choice: 1550 nm vs 1064 nm

**Type:** Design Decision  
**Status:** Closed  
**Date:** 2024-08

## Decision

**Chose 1550 nm.**

Rationale:
1. **Eye safety:** 1550 nm is eye-safe at all operational power levels; 1064 nm requires hazard controls
2. **Component ecosystem:** Telecom-grade EDFA, APDs, and fiber components at 1550 nm are mature, cheap, high-volume — 1064 nm components are custom/military-grade, 10× cost
3. **Atmospheric window:** Both wavelengths have low absorption in LEO-LEO geometry; not a differentiator

Consequence: Locked into telecom supply chain — good for cost, slight risk if telecom market disruptions affect component availability.

---

**Tags:** #design-decision #wavelength #components

---

# DD-003 · Acquisition Scan Pattern: Archimedean Spiral vs. Raster

**Type:** Design Decision  
**Status:** Open (under evaluation)  
**Date:** 2025-01

## Context

During coarse acquisition, the MEMS mirror sweeps a search pattern to find the beacon. Two candidates: Archimedean spiral (continuous, uniform coverage) vs. raster scan (predictable, easy to implement).

## Analysis

| Criterion | Spiral | Raster |
|---|---|---|
| Coverage uniformity | High | Medium (corner gaps) |
| Implementation complexity | Medium | Low |
| Mean time to acquisition | ~6.2 s | ~8.1 s |
| Sensitivity to beacon drift | Low | High |

Preliminary simulation favors spiral by 23% faster mean acquisition. Pending hardware-in-loop validation.

## Consequences

Affects [[SS-001-Beam-Acquisition-Tracking]] acquisition time spec and [[REQ-005]] link availability.

---

**Tags:** #design-decision #acquisition #open
