# Failure Mode Register — QOSMIC FOOS

## Module: Document RAG

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable. Please try again." |
| Empty knowledge base | docs.length === 0 check | Early return | "No documents in knowledge base yet. Add some documents first." |
| Query too long | Groq token limit error | Caught in try/catch | Graceful error message |

## Module: Vendor Email Triage

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Empty input | Frontend button disabled | Never reaches API | Cannot submit |
| Malformed JSON from LLM | JSON.parse try/catch | Returns raw text | Partial results shown |

## Module: Meeting Notes

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Empty transcript | Frontend validation | Never reaches API | Cannot submit |

## Module: Investor Update

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Empty notes | Frontend validation | Never reaches API | Cannot submit |

## Module: Competitive Intel

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Scraping blocked | Axios error caught | Returns LLM knowledge only | Report generated without live data, noted in output |
| Invalid URL | URL validation | Returns error | "Please enter a valid URL." |

## Module: Agentic Orchestrator

| Failure | Detection | Fallback | User sees |
|---|---|---|---|
| Groq API down | Error caught in callLLM | Fallback to llama-3.1-8b-instant | "Service temporarily unavailable." |
| Router misclassification | Confidence threshold check | Routes to most likely sub-system | Result may not match intent |
| Sub-system failure | Try/catch per sub-system | Returns partial results | Completed sub-systems shown, failed ones noted |
