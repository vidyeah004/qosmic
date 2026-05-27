# 🚀 Conversion Memo: Intern to Full-Time Technical Operations
### Sreevidya Jayachandran

---

## 📌 Part B1: The Strongest Thing I Built

Of everything in this submission, the **FOOS platform** makes the strongest case. Not because it is the most technically complex. Because it is the most operationally honest.

You said new joiners take 4 to 6 weeks to gain enough context to contribute because engineering rationale lives in individual heads and scattered documents. I built the system that fixes that.

| Module | What it replaces |
|---|---|
| 📄 Document RAG | Engineers asking the founder "where is the spec for X" |
| 📧 Vendor Email Triage | Procurement threads living in the CEO's inbox |
| 📝 Meeting Notes | Manual action item tracking after every call |
| 📈 Investor Update | 2 hour writing exercise every week |
| 🔭 Competitive Intel | Manual Mynaric/Skyloom monitoring |

**What is functional today:** All five modules live behind real auth, persistent Supabase state, shared observability dashboard tracking cost and latency per module.

**What is intentionally cut down:** The RAG eval score is 18% on synthetic QOSMIC technical specs because the knowledge base needs real engineering documents to perform. The eval infrastructure works. The data does not exist yet. That is a day two problem, not a day two hundred problem.

---

## 📅 Part B2: First 30 Days

> Week one: I do not touch the platform.

I sit with whoever is feeling the most operational pain and watch what they actually do. Vendor emails, meeting follow ups, competitive monitoring, new joiner onboarding. I find the one workflow burning the most time and I own it.

> Week two: I wire that workflow into the platform.

Not a demo. A thing the team actually uses daily.

> Weeks three and four: I instrument it.

How many requests. What latency. What errors. I bring the numbers to a check in and we decide what to fix next.

**Pass/fail test at day 30:** At least one module the team uses without being asked to. That is the only metric that matters.

**Resource asks:**
- 30 min weekly with the founder to align on what is actually hurting
- 2 hours one time with whoever manages vendor procurement to map the current workflow

That is it. I do not need hand holding. I need access to the real problems.

---

## 📊 Part B3: The Numbers

### Vendor Email Triage
QOSMIC has 15 to 25 active POs across 8 to 12 vendors. If the CEO spends 30 minutes a day on vendor email threads that is **2.5 hours a week**. The triage module reduces that to a 2 minute review of classified and summarised emails.

**Conservative estimate: 2 hours saved per week for the founder.**

### New Joiner Ramp
You said 4 to 6 weeks. A properly loaded RAG knowledge base cuts that to **2 weeks conservatively**.

```
10 new joiners over next 12 months (team 15 to 25)
x 2 weeks saved per joiner
= 20 engineer weeks of productive time recovered
x $1,500 blended cost per engineer week
= $30,000 in recovered productivity
```

### The Counterfactual

At 25 engineers the operational overhead does not scale linearly. **It compounds.** Every founder minute spent on vendor follow up, meeting notes, and onboarding is a minute not spent on the technical and commercial problems that actually move the company forward. The platform exists to protect that time.

---

## 🎯 Part B4: The Honest Conversion Argument

### The case against converting me

It is real and I will not pretend otherwise.

I am not from a CS background. I did not sit in a classroom and learn to build systems. I figured it out. Every time. Daimler, SellerIQ, this platform. The question is whether figuring it out is enough when the stakes are higher and the systems are more critical.

My answer: it has been enough every time so far and I have gotten better at it each time. But I understand why that is not a guaranteed argument. **It is a bet on a pattern holding.**

### What I would do to invalidate the case against me

Ship one thing in week two that the team did not ask for but immediately starts using.

That is the only evidence that matters. Not my CV, not this memo, not my PINN paper. **One unsolicited thing that works.**

### What technical ops at QOSMIC means to me

Managing the whole operational infrastructure of a company building something genuinely hard. Not just automating tasks. Understanding how the company runs well enough to eventually own that function. I want to grow into the person who knows where every operational bottleneck is **before it becomes a crisis**. More like a technical COO than a PM.

### If the internship does not convert

I walk away happy.

I am 21, I have an aerospace obsession and a habit of building things nobody asked me to build. Twelve weeks at a company working on lasers in space, sitting next to people who surpassed DRDO's 10km optical link record, is not a consolation prize by any definition.

I will walk out knowing more about optical systems, technical operations, and what it actually takes to build a deep tech company from the inside than any classroom or online course could have given me.

I will take that, update everything I know, and go find the next hard problem worth solving.

---

*Built with Claude, Cursor, and a lot of coffee. Thanks!*
