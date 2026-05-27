# Q2 Adversarial Email Test Results

| # | Type | Expected | Result | Pass/Fail |
|---|---|---|---|---|
| 1 | Ambiguous intent | general_inquiry, no PO | Correct | Pass |
| 2 | Multiple POs | Both POs extracted | Only one extracted | Partial |
| 3 | Hidden price change | Anomaly flagged | $6,200 increase caught | Pass |
| 4 | Duplicate PO same reference | Duplicate flagged | Not flagged | Partial |
| 5 | Compliance threat | compliance_risk intent | general_inquiry | Partial |
| 6 | Mixed language | Delay extracted | Correct despite French | Pass |
| 7 | Fake PO | Unrecognized PO flagged | Accepted without flag | Fail |

## Findings
- Strong on delay and price change detection
- Weak on PO validation against known list
- Compliance risk not a defined intent class
- In production: connect to procurement DB to validate PO numbers
