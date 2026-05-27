# A2 Meta-Orchestrator Routing Evaluation

## Test Results

| # | Input | Expected Route | Actual Route | Pass/Fail |
|---|---|---|---|---|
| 1 | Mynaric latest announcements | competitive-intel | competitive-intel | Pass |
| 2 | Atmospheric turbulence papers | paper-triage | paper-triage | Pass |
| 3 | Outreach to Eutelsat | outreach | outreach | Pass |
| 4 | Mynaric terminal + outreach | competitive-intel + outreach | Both handled | Pass |
| 5 | Lunch recommendation | Reject out of scope | outreach | Fail |

## Score
4/5 correct. 80% routing accuracy.

## Finding
Out-of-scope requests are not rejected. In production, add a confidence 
threshold. If classifier confidence is below 0.7, return: "This request 
is outside FOOS scope. Please submit a competitive, outreach, or 
research request."

## Fix for v2
Add intent confidence score to router. Reject low-confidence requests 
with clear user message instead of routing to best guess.
