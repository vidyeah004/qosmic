# A2 Meta-Orchestrator Routing Evaluation

## Test Set: 20 held-out requests
Designed after system was complete. Not seen during training.
Categories: competitive-intel (6), paper-triage (5), outreach (5), 
out-of-scope (2), multi-step (2)

## Results

| # | Input | Expected | Actual | Pass/Fail |
|---|-------|----------|--------|-----------|
| 1 | Mynaric latest announcements | competitive-intel | competitive-intel | Pass |
| 2 | Atmospheric turbulence papers | paper-triage | paper-triage | Pass |
| 3 | Outreach to Eutelsat | outreach | outreach | Pass |
| 4 | Mynaric terminal + outreach to Eutelsat | competitive-intel + outreach | Both handled | Pass |
| 5 | Lunch recommendation | reject/out-of-scope | outreach | Fail |
| 6 | What is Skyloom's current product roadmap | competitive-intel | competitive-intel | Pass |
| 7 | Find recent arXiv papers on adaptive optics for LEO | paper-triage | paper-triage | Pass |
| 8 | Draft outreach to Telesat for a ground station demo | outreach | outreach | Pass |
| 9 | BridgeComm funding news and technical specs | competitive-intel | competitive-intel | Pass |
| 10 | Summarize this paper: arxiv.org/abs/2301.04175 | paper-triage | paper-triage | Pass |
| 11 | Write a cold email to Intelsat BD team | outreach | outreach | Pass |
| 12 | CACI Atlas vs Mynaric terminal comparison | competitive-intel | competitive-intel | Pass |
| 13 | Latest research on photon-counting receivers | paper-triage | paper-triage | Pass |
| 14 | Personalize outreach for SES Networks | outreach | outreach | Pass |
| 15 | What is the weather in Bengaluru | reject/out-of-scope | outreach | Fail |
| 16 | Competitive brief on Laser Light Communications | competitive-intel | competitive-intel | Pass |
| 17 | arXiv papers on atmospheric turbulence Cn2 | paper-triage | paper-triage | Pass |
| 18 | Outreach package for Viasat partnership | outreach | outreach | Pass |
| 19 | What should QOSMIC price their service at | reject/out-of-scope | competitive-intel | Fail |
| 20 | Mynaric announcements AND relevant arXiv papers on FSOC | competitive-intel + paper-triage | Both handled | Pass |

## Score

| Category | Score |
|----------|-------|
| competitive-intel | 6/6 |
| paper-triage | 5/5 |
| outreach | 5/5 |
| multi-step | 2/2 |
| out-of-scope rejection | 0/3 |
| **Overall** | **17/20 = 85%** |

## Finding
Router is strong on domain requests: 18/17 correct on 
competitive-intel, paper-triage, outreach, and multi-step.
Known gap: out-of-scope requests are not rejected, they route 
to best-guess sub-system. All 3 out-of-scope failures share 
the same root cause: no confidence threshold implemented.

## Fix for v2
Add intent confidence score to router. If classifier confidence 
below 0.7, return: "This request is outside FOOS scope. Please 
submit a competitive, outreach, or research request."
Estimated implementation: 2 hours. Highest priority week-one fix.

## Test Set Design Note
The 5-request original set was a smoke test during build. 
This 20-request held-out set was designed after the system 
was complete. Cases 5, 15, and 19 are out-of-scope by design 
to surface the known rejection gap. Case 20 tests multi-step 
decomposition across two sub-systems. Everything except 
out-of-scope rejection works correctly and consistently.
