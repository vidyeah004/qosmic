# Requirements — QOSMIC Terminal v1.0

**Type:** Requirements  
**Status:** Baselined 2024-10  
**Owner:** Systems Engineering  

---

## System-Level Requirements

| ID | Requirement | Rationale | Verification |
|---|---|---|---|
| REQ-001 | Link margin ≥ 6 dB at 1000 km, nominal conditions | Industry standard for LEO optical links | Analysis (link budget) |
| REQ-002 | Data rate ≥ 10 Gbps at 1000 km | Customer requirement (constellation operator RFI responses) | Test |
| REQ-003 | Terminal mass ≤ 1.2 kg (excl. interface) | 6U CubeSat mass budget | Weigh |
| REQ-004 | Power draw ≤ 15 W average | CubeSat EPS budget | Test |
| REQ-005 | Link availability ≥ 95% over 24-hour period | Customer SLA target | Analysis + simulation |
| REQ-006 | Acquisition time ≤ 10 s (99th percentile) | Derived from link availability; >10 s degrades REQ-005 | Test |
| REQ-007 | Pointing error ≤ 2 μrad RMS in steady state | Derived from link margin allocation (see [[SS-003-Pointing-Error-Control]]) | Test |
| REQ-008 | Operating temperature: −40°C to +80°C | LEO thermal environment (eclipse to sunlight) | Test |
| REQ-009 | Radiation tolerance: 30 krad TID | 5-year LEO mission at 550 km | Analysis + parts screening |
| REQ-010 | MTBF ≥ 50,000 hours | Customer reliability requirement | Analysis |

---

## Requirement Derivation Tree

```
Customer SLA (REQ-005: 95% availability)
    ↓
REQ-006 (acquisition ≤ 10 s) + REQ-007 (pointing ≤ 2 μrad)
    ↓                              ↓
SS-001 (BAT subsystem)      SS-003 (Pointing control)
    ↓                              ↓
DD-003 (scan pattern)       DD-007 (FSM bandwidth)
    ↓                              ↓
C-002 (MEMS mirror)         C-001 (FSM spec)
```

---

## Open Requirements Issues

| ID | Issue | Impact | Owner |
|---|---|---|---|
| RQI-001 | REQ-006 (10 s) not yet verified on proto — current best: 12 s | High | BAT team |
| RQI-002 | REQ-009 radiation tolerance: MEMS mirror not screened to 30 krad | Medium | Procurement |
| RQI-003 | REQ-010 MTBF not yet analysed — depends on EDFA reliability data | Low | Systems |

---

**Tags:** #requirements #system-level #verification #derived
