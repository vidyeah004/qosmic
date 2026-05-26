# QOSMIC FOOS — Founder's Office Operating System

A1 + A2 submission for the QOSMIC Founder's Office Internship technical interview.

## What's Built

### A1 — Founder's Office Operating System (5 modules)
| Module | What it does |
|---|---|
| Document RAG | Upload docs → ask questions → get cited answers |
| Vendor Email Triage | Paste email → classify intent + extract PO details + draft reply |
| Meeting Notes | Paste transcript → assignee-tagged action items with deadlines |
| Investor Update | Raw weekly notes → polished investor update email |
| Competitive Intel | Track Mynaric, Skyloom, BridgeComm and any other company |

### A2 — Agentic Suite (meta-orchestrator + 3 sub-systems)
- **Meta-orchestrator**: classifies intent, routes to the right sub-system
- **Competitive Intel Engine**: shared with A1, runs multi-LLM in parallel
- **Outreach Personalizer**: personalized emails for satellite operators
- **Paper Summarizer**: arXiv paper triage with QOSMIC relevance analysis

### Infrastructure
- Multi-LLM: 3 Groq models run in parallel, LLM-as-judge picks best output
- Observability: every LLM call logged to Supabase (module, latency, cost, user)
- Auth: Supabase Auth with email/password
- Database: PostgreSQL on Supabase

---

## Setup (10 minutes)

### 1. Accounts needed (all free)
- [Supabase](https://supabase.com) — database + auth
- [Groq](https://console.groq.com) — LLM API (free tier)
- [Vercel](https://vercel.com) — deployment (free tier)
- [GitHub](https://github.com) — code hosting

### 2. Supabase setup
1. Create a new project at supabase.com
2. Go to SQL Editor → paste the entire contents of `schema.sql` → Run
3. Go to Settings → API → copy your Project URL and anon key

### 3. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_your_key_here
```

### 4. Local development
```bash
npm install
npm run dev
```
Open http://localhost:3000

### 5. Deploy to Vercel
```bash
# Push to GitHub first, then:
# 1. Go to vercel.com → New Project → Import your GitHub repo
# 2. Add environment variables (same as .env.local)
# 3. Deploy
```

---

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **LLM**: Groq API (llama-3.3-70b-versatile) — free tier
- **Multi-LLM**: 3 Groq models in parallel with LLM-as-judge
- **Deployment**: Vercel

## Observability
Every module run writes to `sessions` table:
- module name
- input/output (truncated)
- latency_ms
- estimated_cost_usd
- model used

Dashboard home shows aggregate stats.

---

## Evaluation Metrics (A1)

| Module | Metric | Target |
|---|---|---|
| RAG | Answer relevance (manual 25 Q&A eval) | >80% correct citations |
| Email Triage | Intent classification accuracy | >90% on 15 test emails |
| Meeting Notes | Action item extraction recall | >85% of items captured |
| Investor Update | Output coherence (manual review) | Usable without editing |
| Competitive Intel | Information accuracy | Factually grounded |

## Evaluation Metrics (A2)
- Route classification accuracy: target >95%
- Multi-LLM judge consistency: test 10 queries, judge correct >80%
- End-to-end latency: <8s for most requests

---

Built by Sreevidya for QOSMIC Founder's Office Internship - June 2026
