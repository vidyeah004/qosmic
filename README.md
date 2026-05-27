# 🛸 QOSMIC FOOS — Founder's Office Operating System

> A1 + A2 + A3 submission for the QOSMIC Founder's Office Internship technical interview.

**Live app:** [qosmic-two.vercel.app](https://qosmic-two.vercel.app)

---

## 📂 Where to Find Everything

| Document | What it is |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full system architecture, stack, DB schema, role access |
| [CONVERSION_MEMO.md](./CONVERSION_MEMO.md) | Part B: intern to full-time conversion case |
| [A3_TECHNICAL_BRIEF.md](./A3_TECHNICAL_BRIEF.md) | Cloud segmentation research prototype and cost projection |
| [failure_modes.md](./failure_modes.md) | Failure mode register for all 5 modules |
| [a2_orchestrator_eval.md](./a2_orchestrator_eval.md) | A2 meta-orchestrator routing accuracy results |
| [Adversarial_results.md](./Adversarial_results.md) | Q2 adversarial email test suite results |
| [schema.sql](./schema.sql) | Full Supabase database schema |
| [`qosmic/`](./qosmic) | Q1 Obsidian knowledge graph vault (20+ interconnected notes) |

---

## 🧩 What's Built

### A1 — Founder's Office Operating System (5 modules)

| Module | What it does |
|---|---|
| 📄 Document RAG | Upload docs → ask questions → get cited answers. 3 visibility modes: private, selective, shared |
| 📧 Vendor Email Triage | Paste email → classify intent + extract PO details + detect anomalies + draft reply |
| 📝 Meeting Notes | Paste transcript → assignee-tagged action items with deadlines |
| 📈 Investor Update | Raw weekly notes → polished investor update email |
| 🔭 Competitive Intel | Track Mynaric, Skyloom, BridgeComm — multi-LLM in parallel, judge picks best |

### A2 — Agentic Suite

- **Meta-orchestrator**: classifies intent, routes to correct sub-system, handles multi-step requests
- **Competitive Intel Engine**: shared with A1, 3 models in parallel, LLM-as-judge
- **Outreach Personalizer**: personalized emails for satellite operators
- **Paper Summarizer**: arXiv paper triage with QOSMIC relevance analysis

### A3 — Cloud Segmentation Research

Random Forest classifier for cloud cover prediction at optical ground stations. F1 0.9873, IoU 0.9749. Monthly cost at 50 ground stations: $1.56. Full brief in [A3_TECHNICAL_BRIEF.md](./A3_TECHNICAL_BRIEF.md).

### Q1 — Obsidian Knowledge Graph

20+ interconnected notes across 3 subsystems. RAG layer on top. Contribution workflow and templates included. See `obsidian-vault/`.

### Q2 — Vendor Email Adversarial Results

8 adversarial emails tested. 5 pass, 2 partial, 1 fail (unrecognized PO not flagged). Full results in [Adversarial_results.md](./Adversarial_results.md).

---

## 🏗 Infrastructure

- **Multi-LLM**: 3 Groq models in parallel, LLM-as-judge picks best output
- **Graceful degradation**: primary model fails, auto-fallback to llama-3.1-8b-instant. Both fail, clean user message
- **Observability**: every LLM call logged to Supabase (module, latency, cost, model, user)
- **Auth**: Supabase Auth with Founder / Intern roles
- **Database**: PostgreSQL on Supabase with RLS on all tables

---

## 🚀 Setup (10 minutes)

### 1. Accounts needed (all free)
- [Supabase](https://supabase.com) — database + auth
- [Groq](https://console.groq.com) — LLM API
- [Vercel](https://vercel.com) — deployment

### 2. Supabase setup
1. Create a new project at supabase.com
2. SQL Editor → paste entire `schema.sql` → Run
3. Settings → API → copy Project URL and anon key

### 3. Environment variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_your_key_here
```

### 4. Local development
```bash
npm install
npm run dev
```

### 5. Set your account as founder
After signing up, run this in Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'founder' WHERE email = 'your@email.com';
```

---

## 🧪 Evaluation Results

### A1 Modules

| Module | Metric | Score |
|---|---|---|
| RAG | Answer correctness (25 Q eval, LLM-as-judge) | 18% on synthetic data, eval infra working |
| Email Triage | Adversarial test suite (8 emails) | 5/8 pass, 2 partial, 1 fail |
| Competitive Intel | Factual grounding | Manual review, passes on known competitors |
| Meeting Notes | Action item extraction | Manual review |
| Investor Update | Output usability | Manual review |

### A2 Orchestrator

| Metric | Score |
|---|---|
| Routing accuracy | 4/5 = 80% on test set |
| Known gap | Out of scope requests not rejected |
| Fix for v2 | Confidence threshold with reject fallback |

Full eval methodology in [a2_orchestrator_eval.md](./a2_orchestrator_eval.md).

---

## 💻 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **LLM**: Groq API — llama-3.3-70b-versatile primary, llama-3.1-8b-instant fallback and judge
- **Deployment**: Vercel

---

## 🎥 Screen Recordings

- A1 platform walkthrough: *[link]*
- A2 agentic suite walkthrough: *[link]*
- A3 research prototype walkthrough: *[link]*

---

*Built by Sreevidya Jayachandran for QOSMIC Founder's Office Internship — June 2026*  
*I have a caffeine addiction, a lot of dark circles, and a habit of building things because that seemed cool to me.*
