# Q2 — Vendor Procurement Agentic Pipeline
## Architecture Document

### Overview
Multi-agent pipeline that processes vendor emails end-to-end:
ingestion → classification → extraction → anomaly detection →
draft generation. Currently manual-trigger via FOOS dashboard.
n8n Gmail integration scoped for week-one of internship to
make it fully automatic.

### Agent Architecture

| Agent | Model | Tools | Justification |
|-------|-------|-------|---------------|
| Intent Classifier | llama-3.3-70b-versatile | Text classification | 5 intent classes, edge cases require reasoning capacity |
| Entity Extractor | llama-3.3-70b-versatile | JSON extraction | PO numbers and dates — 8b missed 2/8 adversarial cases |
| Anomaly Detector | llama-3.3-70b-versatile | Rule + LLM hybrid | Price change detection needs reasoning not just pattern match |
| Draft Generator | llama-3.3-70b-versatile | Text generation | Outbound from QOSMIC — quality matters |
| Fallback (all) | llama-3.1-8b-instant | All above | Auto-triggered on primary model failure or timeout |

### Model Justification
70b chosen over 8b for all primary agents. Entity extraction
was the deciding test: PO number and date extraction on 8
adversarial inputs showed 8b missing 2 cases that 70b caught.
Cost delta at QOSMIC's projected 50 emails/day is $0.04/day.
Not a meaningful constraint at this scale.

### Pipeline Flow
```
Vendor Email (manual paste or n8n Gmail trigger)
    ↓
Intent Classifier
    → shipment_delay | price_change | invoice |
      compliance_risk | general_inquiry
    ↓
Entity Extractor
    → vendor name, PO number, key dates, amounts
    ↓
Anomaly Detector
    → price change > 5%
    → delivery delay > 2 weeks
    → compliance flags
    → unrecognized PO reference (known gap: needs DB)
    ↓
Draft Generator
    → context-aware reply draft
    ↓
Output: intent + entities + anomalies + draft reply
```

### Reliability Layer

| Failure | Detection | Fallback | User sees |
|---------|-----------|----------|-----------|
| Groq API down | Error in callLLM | Auto-switch to 8b-instant | Service temporarily unavailable |
| JSON parse failure | try/catch on all extractions | Raw text returned | Partial results with parse note |
| Confidence below threshold | Post-classification score check | Routes to general_inquiry with flag | Result flagged as low confidence |
| Empty input | Frontend validation | Button disabled | Cannot submit |
| Malformed email | LLM handles gracefully | Best-effort extraction | Partial output |

### Evaluation Results

| Metric | Score | Notes |
|--------|-------|-------|
| Overall pass rate | 4/7 strict, 6/7 partial | See Adversarial_results.md |
| Intent classification | 6/7 correct | Compliance_risk misclassified as general_inquiry |
| Entity extraction | 6/7 correct | Multiple PO extraction partially failed |
| Anomaly detection | 5/7 | PO validation gap — no DB connection |
| Draft quality | Manual review pass | Contextually appropriate replies on all passing cases |

Known gap: PO validation requires connection to procurement
database. Current system classifies and extracts correctly
but cannot verify whether a PO number exists. This is the
single biggest gap between prototype and production.

### Adversarial Test Results
8 adversarial emails tested. Full results in Adversarial_results.md.

Summary:
- 4 pass, 2 partial, 1 fail
- Strong: delay detection, price change detection, mixed language
- Weak: multiple PO extraction, PO validation, compliance_risk class

### Cost Analysis

| Scale | Emails/day | Daily cost | Monthly cost |
|-------|------------|------------|--------------|
| Current QOSMIC | ~50 | ~$0.04 | ~$1.20 |
| Team of 25 | ~150 | ~$0.12 | ~$3.60 |
| 100 vendors | ~500 | ~$0.40 | ~$12.00 |

Figures use llama-3.3-70b-versatile at $0.59/1M tokens via Groq.
Fallback to 8b-instant reduces cost 85% with documented quality
tradeoff on entity extraction edge cases.

### Production Trigger Layer
Vendor email triage is currently manual-trigger via FOOS dashboard.
n8n Gmail integration scoped and ready for week-one deployment:

```
Gmail (new email, vendor label)
    → n8n poll every 60s
    → extract email body
    → POST to /api/email-triage
    → check anomaly flag
    → if high severity: Slack alert to founder
    → log all results to Supabase vendor_emails table
```

Four n8n nodes. Estimated setup time: 2 hours.
This makes the pipeline fully automatic — zero manual steps
for routine vendor email processing.

### What I Would Do Differently at v2

Connect to QOSMIC's PO register in Supabase. One table, one
lookup call, one flag in the output. Fixes the single biggest
gap identified in adversarial testing.

Add Gmail trigger via n8n. Already scoped above. Week-one work.

Add compliance_risk as a first-class intent class. Currently
the classifier does not reliably distinguish compliance threats
from general inquiries. Requires 10-15 labeled examples of
compliance emails added to the classification prompt as
few-shot examples.

Build a feedback loop: when the founder edits a draft reply,
log the edit. Use logged edits to improve draft quality over
time. Simple Supabase table, no retraining required.
