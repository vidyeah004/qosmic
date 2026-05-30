# Failure Mode Register — QOSMIC FOOS

## Module: Document RAG

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable. Please try again." |
| Empty knowledge base | docs.length === 0 check | Early return | "No documents in knowledge base yet. Add some documents first." |
| Query too long | Groq token limit error | Caught in try/catch | Graceful error message |

Fixes Applied During Build:
1. LLM returned answers without citations on first prompt version. 
   Fixed by adding explicit citation instruction to system prompt. 
   Before: answers with no source grounding. 
   After: every answer includes [Source: filename].

2. Context window exceeded on large documents. 
   Fixed by slicing context to 16000 chars before passing to LLM. 
   Before: Groq token limit error on docs over 20k chars. 
   After: clean truncation with no crash.

3. Empty knowledge base caused unhandled error. 
   Fixed by adding docs.length === 0 check before LLM call. 
   Before: null reference error. 
   After: clean message to user.

## Module: Vendor Email Triage

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Empty input | Frontend button disabled | Never reaches API | Cannot submit |
| Malformed JSON from LLM | JSON.parse try/catch | Returns raw text | Partial results shown |

Fixes Applied During Build:
1. JSON.parse failed on LLM outputs with markdown fencing. 
   Fixed by stripping backtick code blocks before parsing. 
   Before: parse error on ~30% of responses. 
   After: clean parsing on all tested inputs.

2. Anomaly detection missed price changes expressed as percentages. 
   Fixed by expanding the anomaly detection prompt to include 
   percentage-based price changes, not just absolute values. 
   Before: "price increased 15%" not flagged. 
   After: flagged correctly.

3. Draft reply generation timed out on long email threads. 
   Fixed by truncating input to first 2000 chars before sending. 
   Before: timeout on emails over 3000 chars. 
   After: consistent sub-3s response.

## Module: Meeting Notes

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Empty transcript | Frontend validation | Never reaches API | Cannot submit |

Fixes Applied During Build:

1. Assignee detection failed when names appeared mid-sentence.
   Fixed by changing prompt from "extract assignee" to 
   "identify the person responsible, look for names followed 
   by action verbs like 'will', 'to', 'should', 'needs to'."
   Before: "Sreevidya will update the vendor" → no assignee extracted.
   After: assignee correctly identified as Sreevidya.

2. Deadlines expressed as relative dates not parsed correctly.
   Fixed by adding instruction to convert relative dates to 
   absolute using current date context injected into prompt.
   Before: "by next Friday" → returned as "next Friday".
   After: returned as explicit date.

3. Long transcripts caused incomplete action item extraction —
   items from the second half of the transcript were missed.
   Fixed by chunking transcripts over 3000 chars into segments,
   extracting action items per chunk, then deduplicating.
   Before: 60-minute transcript returned 3 items from first 10 mins only.
   After: full transcript coverage.
   

## Module: Investor Update

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Empty notes | Frontend validation | Never reaches API | Cannot submit |

Fixes Applied During Build:

1. Output included raw bullet points instead of prose paragraphs.
   Fixed by adding explicit format instruction: "write in 
   professional email prose, no bullet points, no headers."
   Before: output was a bulleted list, not an investor email.
   After: clean paragraph format suitable for sending.

2. Model hallucinated metrics not present in the input notes.
   Fixed by adding "use ONLY the numbers and facts provided. 
   If a metric is not in the notes, do not include it."
   Before: model invented revenue figures to fill gaps.
   After: output strictly grounded in provided notes.

3. Tone was inconsistent — mixed formal and casual register.
   Fixed by adding persona instruction: "write as a founder 
   updating early-stage investors: confident, specific, 
   no fluff, no excessive optimism."
   Before: "We're super excited about our amazing progress!"
   After: "Link acquisition time reached 8.2s in ground tests,
   against a 10s requirement."
   
## Module: Competitive Intel

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Scraping blocked | Axios error caught | Returns LLM knowledge only | Report generated without live data, noted in output |
| Invalid URL | URL validation | Returns error | "Please enter a valid URL." |

Fixes Applied During Build:

1. Three parallel LLM responses returned in inconsistent order,
   causing the judge to evaluate response B against response A's
   context.
   Fixed by tagging each response with its model name before 
   passing all three to the judge.
   Before: judge occasionally scored the wrong response.
   After: deterministic model-tagged evaluation.

2. Scraping blocked on some competitor domains (Cloudflare).
   Fixed by adding graceful fallback: if scrape returns empty 
   or blocked response, continue with LLM parametric knowledge
   only, and note in output: "Live data unavailable — 
   analysis based on model knowledge."
   Before: silent failure, empty brief returned.
   After: partial brief with honest data source note.

3. Judge prompt returned free text instead of structured JSON
   on first implementation.
   Fixed by adding strict JSON schema to judge system prompt
   and wrapping parse in try/catch with raw text fallback.
   Before: judge output was a paragraph, unparseable.
   After: consistent {"winner": "model_name", "reasoning": "..."}

## Module: Agentic Orchestrator

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Router misclassification | Confidence threshold check | Routes to most likely sub-system | Result may not match intent |
| Sub-system failure | Try/catch per sub-system | Returns partial results | Completed sub-systems shown, failed ones noted |

Fixes Applied During Build:

1. Orchestrator routed all ambiguous requests to competitive-intel
   as a default instead of rejecting them.
   Fixed by adding an explicit "out-of-scope" class to the 
   classification prompt with examples of what does not belong.
   Before: "what is the weather in Bengaluru" → routed to competitive-intel.
   After: routed to out-of-scope. Known remaining gap: no hard 
   reject yet, v2 adds confidence threshold below 0.7 → reject.

2. Multi-step requests decomposed incorrectly — only the first
   intent was handled, second was dropped silently.
   Fixed by changing prompt from "classify the primary intent"
   to "identify ALL intents present, return as array, handle each."
   Before: "Mynaric brief AND outreach to Eutelsat" → only 
   competitive-intel ran, outreach was dropped.
   After: both sub-systems triggered, both outputs returned.

3. Sub-system responses returned as raw JSON objects in the 
   final output instead of readable text.
   Fixed by adding a synthesis step after sub-system calls:
   pass all sub-system outputs to a final LLM call that 
   formats them into a single coherent response.
   Before: user saw {"intent": "competitive-intel", "output": {...}}
   After: user sees formatted brief with clear section headers.
