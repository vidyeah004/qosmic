 QOSMIC FOOS — Architecture Document

## Overview

QOSMIC Founder's Office Operating System (FOOS) is a multi-module 
internal platform built to remove repetitive operational work from 
the founder's plate. One login, five tools, shared state, full 
observability.

**Live URL:** qosmic-two.vercel.app  
**Stack:** Next.js 14, TypeScript, Supabase, Groq, Vercel  
**Auth:** Supabase Auth with role-based access (Founder / Intern)

---

## System Architecture
User Browser
│
▼
Vercel Edge (Next.js 14 App Router)
│
├── /dashboard          → Server components, reads Supabase directly
├── /dashboard/rag      → Client component + API route
├── /dashboard/email-triage
├── /dashboard/meeting-notes
├── /dashboard/investor-update
├── /dashboard/competitive-intel
├── /dashboard/a2       → Meta-orchestrator
└── /dashboard/eval     → RAG evaluation suite
│
▼
API Routes (/app/api/*)
│
├── callLLM()           → Groq primary (llama-3.3-70b-versatile)
│                          Fallback (llama-3.1-8b-instant)
├── logSession()        → Supabase sessions table
└── Supabase client     → documents, vendor_emails, profiles
│
▼
Supabase (PostgreSQL + Auth)
│
├── profiles            → users + roles
├── documents           → RAG knowledge base
├── sessions            → observability logs
├── vendor_emails       → triage history
└── document_permissions→ selective sharing

---

## Database Schema

| Table | Purpose |
|---|---|
| profiles | Extends auth.users, stores role (founder/intern) |
| documents | RAG knowledge base, supports private/shared/selective visibility |
| sessions | Every LLM call logged with latency, cost, model, module |
| vendor_emails | Triage history per user |
| document_permissions | Selective sharing between users |

Row Level Security enabled on all tables. Users can only read their 
own data unless visibility is set to shared.

---

## Module Architecture

### A1: FOOS Modules

**Document RAG**
- Add documents with 3 visibility modes: private, selective, shared
- Query against knowledge base, answers cited by source
- Eval suite: 25 questions scored by LLM-as-judge (llama-3.1-8b-instant)

**Vendor Email Triage**
- Intent classification: shipment_delay, price_change, invoice, 
  compliance_risk, general_inquiry
- Entity extraction: vendor name, PO number, key dates
- Anomaly detection: price changes, delays over 2 weeks
- Draft reply generation

**Meeting Notes**
- Paste transcript, get tagged action items with assignee and deadline

**Investor Update**
- Raw weekly notes in, formatted investor email out

**Competitive Intel**
- Enter competitor name or URL
- Multi-LLM analysis (3 models in parallel)
- LLM-as-judge picks best response
- Structured brief output

### A2: Agentic Suite

**Meta-Orchestrator**
- Accepts natural language input
- Classifies intent: competitive-intel, outreach, paper-triage
- Routes to correct sub-system
- Multi-step: handles combined requests across sub-systems
- Failure: low confidence requests routed to best guess (v2 will reject)

---

## LLM Layer

```typescript
Primary:  llama-3.3-70b-versatile  (Groq)
Fallback: llama-3.1-8b-instant     (Groq, auto on primary failure)
Judge:    llama-3.1-8b-instant     (eval scoring)
Multi:    3 models in parallel     (competitive intel, A2)
```

**Graceful degradation:** If primary model fails, automatically retries 
on fallback. If both fail, returns clean user-facing message. No crashes.

**Cost tracking:** Every call logs estimated_cost_usd to sessions table. 
Dashboard shows real-time spend.

---

## Observability

Platform dashboard shows:
- Total runs across all modules
- Average latency per call
- Estimated total cost
- Per-module usage (visible to founder role only)

Every LLM call writes to sessions table:
- module, input, output, latency_ms, cost_usd, model, status

---

## Role-Based Access

| Feature | Founder | Intern |
|---|---|---|
| All A1 modules | Yes | Yes (except Investor Update) |
| A2 Agentic Suite | Yes | Yes |
| RAG Eval Suite | Yes | No |
| Dashboard cost stats | Yes | No |
| Role management | Via Supabase SQL | No |

---

## Failure Mode Summary

| Failure | Handling |
|---|---|
| Groq API down | Auto-fallback to llama-3.1-8b-instant |
| Both models down | Clean user message, no crash |
| Empty input | Frontend validation, button disabled |
| Malformed LLM JSON | try/catch, raw text returned |
| Scraping blocked | Falls back to LLM knowledge only |
| Out-of-scope request | Routes to best guess (known gap, v2 fix) |

Full failure mode register: see `failure_modes.md`

---

## Cost Structure

| Item | Cost |
|---|---|
| Groq API | Free tier, ~$0.80/1M tokens at scale |
| Supabase | Free tier (500MB, 50k MAU) |
| Vercel | Free tier (hobby) |
| Total current | $0.00/month |
| Projected at 25 engineers, 100 req/day | ~$2-4/month |
