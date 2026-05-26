import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const EVAL_QUESTIONS = [
  { id: 'Q01', category: 'factual', question: "What is QOSMIC's target acquisition time for beam acquisition?", ground_truth: "Less than 8 seconds", required_notes: ["SS-001"] },
  { id: 'Q02', category: 'factual', question: "What is the minimum acceptable link margin and what is the current baseline?", ground_truth: "Minimum 6 dB, current baseline 11 dB", required_notes: ["SS-002"] },
  { id: 'Q03', category: 'factual', question: "What is the RMS pointing error budget and what is the main contributor?", ground_truth: "2 μrad total budget, reaction wheel microvibration (0.9 μrad) is the largest contributor", required_notes: ["SS-003"] },
  { id: 'Q04', category: 'factual', question: "Why did QOSMIC choose a 10 cm aperture instead of 15 cm?", ground_truth: "SWaP constraints: 15 cm requires 12U form factor, target market uses 6U CubeSats. 10 cm is the only 6U FSO terminal in the market.", required_notes: ["DD-001"] },
  { id: 'Q05', category: 'factual', question: "What wavelength does QOSMIC use and what are the two main reasons?", ground_truth: "1550 nm. Eye safety at operational powers, and mature telecom-grade component ecosystem at lower cost than 1064 nm.", required_notes: ["DD-002"] },
  { id: 'Q06', category: 'factual', question: "What is the closed-loop bandwidth of the Fast Steering Mirror and why is it limited?", ground_truth: "800 Hz, limited to 20% margin below the 1 kHz structural resonance for stability.", required_notes: ["C-001", "DD-007"] },
  { id: 'Q07', category: 'factual', question: "What are the mass and power requirements for the QOSMIC terminal?", ground_truth: "Mass ≤ 1.2 kg, Power ≤ 15 W average", required_notes: ["REQ"] },
  { id: 'Q08', category: 'factual', question: "What is the Doppler frequency shift at 1550 nm for two LEO satellites in worst-case geometry?", ground_truth: "Approximately ±10.1 GHz", required_notes: ["PHY-003"] },
  { id: 'Q09', category: 'factual', question: "What is the APD sensitivity and what link margin does it provide?", ground_truth: "−50 dBm sensitivity, providing 11 dB margin against −39 dBm received power", required_notes: ["C-003", "SS-002"] },
  { id: 'Q10', category: 'factual', question: "What is the beam divergence angle for QOSMIC's 10 cm aperture at 1550 nm?", ground_truth: "Approximately 10 μrad (9.9 μrad)", required_notes: ["PHY-001"] },
  { id: 'Q11', category: 'multi_note', question: "If an engineer proposes increasing the aperture to 15 cm, what are all the downstream consequences across the system?", ground_truth: "Mass exceeds 6U budget (DD-001), acquisition scan needs more cells because beam is narrower (PHY-001, SS-001), requires 12U platform, threatens REQ-006 acquisition time limit.", required_notes: ["DD-001", "PHY-001", "SS-001", "REQ"] },
  { id: 'Q12', category: 'multi_note', question: "How does a 50% degradation in FSM performance affect the link budget?", ground_truth: "FSM residual increases from 0.5 to ~1.0 μrad, total pointing RSS increases from 1.4 to ~1.6 μrad, additional pointing loss ~0.2 dB, must check against 6 dB minimum margin.", required_notes: ["SS-003", "PHY-004", "SS-002"] },
  { id: 'Q13', category: 'multi_note', question: "Why does the scan pattern choice matter for acquisition time, and what is the physics behind it?", ground_truth: "Beam is only 10 μrad wide but must search ~0.5° cone. Spiral gives uniform coverage, 23% faster than raster (6.2s vs 8.1s). Each position must dwell for APD detection.", required_notes: ["PHY-001", "SS-001", "DD-003"] },
  { id: 'Q14', category: 'multi_note', question: "REQ-006 requires acquisition ≤ 10 seconds but prototype achieves 12 seconds. What design options exist?", ground_truth: "Switch to Archimedean spiral scan (DD-003 shows 23% improvement), increase MEMS scan speed (C-002), improve star tracker accuracy to reduce search cone. DD-003 is the primary open path.", required_notes: ["REQ", "SS-001", "DD-003", "C-002"] },
  { id: 'Q15', category: 'multi_note', question: "What happens to the link budget if QOSMIC adds a ground station downlink?", ground_truth: "Atmospheric turbulence becomes major factor. Cn² at ground ~10⁻¹⁴, fades >10 dB at 15% probability. Current 11 dB margin insufficient. Adaptive optics or aperture averaging required.", required_notes: ["SS-002", "PHY-002"] },
  { id: 'Q16', category: 'multi_note', question: "What are the three main sources of pointing error and what mitigation was chosen for each?", ground_truth: "Thermal flex (0.6 μrad) → passive MLI + titanium flexures; RWA vibration (0.9 μrad) → passive wire rope isolator; Star tracker noise (0.8 μrad) → ephemeris feed-forward.", required_notes: ["SS-003", "DD-005", "DD-006"] },
  { id: 'Q17', category: 'multi_note', question: "Why was the PI S-330 FSM chosen over Mirrorcle MEMS, and what would change if MEMS were used?", ground_truth: "PI S-330: space heritage TRL 7, radiation-tolerant piezo, better bandwidth-to-mass. MEMS would mean lower bandwidth, unknown radiation qualification for 30 krad, need to re-evaluate DD-007.", required_notes: ["C-001", "DD-007", "REQ"] },
  { id: 'Q18', category: 'multi_note', question: "Does Doppler shift affect the current system and would it affect a future 100 Gbps coherent upgrade?", ground_truth: "Current IM-DD system is Doppler-insensitive — no issue now. Coherent upgrade would require Doppler pre-compensation because ±10.1 GHz offset destroys phase-sensitive detection.", required_notes: ["PHY-003"] },
  { id: 'Q19', category: 'multi_note', question: "What is the power breakdown and which component drives thermal management?", ground_truth: "EDFA draws 8W — dominant consumer. FSM 2.1W, star tracker 1.8W, MEMS 0.3W. EDFA drives thermal design, explicitly flagged as primary thermal risk.", required_notes: ["C-005", "C-001", "C-002", "C-004", "REQ"] },
  { id: 'Q20', category: 'multi_note', question: "Trace the dependency chain from customer availability SLA (95%) to the FSM bandwidth specification.", ground_truth: "REQ-005 (95% availability) → REQ-006 (acquisition ≤10s) + REQ-007 (pointing ≤2 μrad) → SS-003 error budget → FSM residual ≤0.5 μrad → 800 Hz bandwidth (DD-007) → PI S-330 (C-001).", required_notes: ["REQ", "SS-003", "DD-007", "C-001"] },
  { id: 'Q21', category: 'insufficient', question: "What is the current on-orbit test data showing for acquisition time performance?", ground_truth: "INSUFFICIENT EVIDENCE — no on-orbit data exists. Only ground prototype data (12s) is documented.", required_notes: [] },
  { id: 'Q22', category: 'insufficient', question: "What is the unit price of the PI S-330 Fast Steering Mirror?", ground_truth: "INSUFFICIENT EVIDENCE — pricing is not documented in the knowledge base.", required_notes: [] },
  { id: 'Q23', category: 'insufficient', question: "What programming language is the FSM control loop implemented in?", ground_truth: "INSUFFICIENT EVIDENCE — software implementation language is not in the vault. Only architecture and latency budget are documented.", required_notes: [] },
  { id: 'Q24', category: 'insufficient', question: "Has QOSMIC filed patents on the beam acquisition algorithm?", ground_truth: "INSUFFICIENT EVIDENCE — SS-001 mentions patent-pending status but no patent numbers or filing dates are in the vault.", required_notes: [] },
  { id: 'Q25', category: 'insufficient', question: "What is the bill of materials cost for a single terminal unit?", ground_truth: "INSUFFICIENT EVIDENCE — no BOM cost data exists. Only partial cost deltas in design decision trades.", required_notes: [] },
]

async function queryRAG(question: string, supabase: any): Promise<{ answer: string; docs_retrieved: number; latency_ms: number }> {
  const start = Date.now()
  const { data: docs } = await supabase
    .from('documents')
    .select('title, content')
    .eq('module', 'rag')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!docs || docs.length === 0) {
    return { answer: 'No documents in knowledge base.', docs_retrieved: 0, latency_ms: Date.now() - start }
  }

  const context = docs
    .map((d: any) => `[${d.title}]\n${d.content}`)
    .join('\n\n---\n\n')
    .slice(0, 8000)

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a technical assistant for QOSMIC, a satellite FSO communication company. 
Answer questions using ONLY the provided context documents.
Always cite which document(s) you used like this: [Source: Document Title].
If the answer is not in the context, explicitly say: "INSUFFICIENT EVIDENCE — this information is not documented in the knowledge base." Do not guess or hallucinate.`
      },
      { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
    ],
    max_tokens: 500,
    temperature: 0.1
  })

  const answer = response.choices[0]?.message?.content ?? ''
  return { answer, docs_retrieved: docs.length, latency_ms: Date.now() - start }
}

async function judgeAnswer(question: string, ground_truth: string, answer: string, category: string): Promise<{ score: number; reasoning: string }> {
  const rubric = category === 'insufficient'
    ? 'Score 1.0 if the model correctly says the evidence is insufficient and does NOT hallucinate an answer. Score 0.5 if it hedges but still guesses. Score 0.0 if it hallucinates a confident answer.'
    : 'Score 1.0 if the key facts match ground truth and sources are cited. Score 0.5 if partially correct or missing key detail. Score 0.0 if wrong or hallucinated.'

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are an evaluation judge. Score the answer against the ground truth using this rubric: ${rubric}
Respond with ONLY valid JSON: {"score": 0.0|0.5|1.0, "reasoning": "one sentence"}`
      },
      {
        role: 'user',
        content: `Question: ${question}\nGround truth: ${ground_truth}\nAnswer to evaluate: ${answer}`
      }
    ],
    max_tokens: 150,
    temperature: 0
  })

  try {
    const text = response.choices[0]?.message?.content ?? '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return { score: parsed.score ?? 0, reasoning: parsed.reasoning ?? '' }
  } catch {
    return { score: 0, reasoning: 'Parse error in judge response' }
  }
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (body.action === 'run_eval') {
    const results = []
    let totalScore = 0
    let factualScore = 0; let factualCount = 0
    let multiScore = 0; let multiCount = 0
    let insufficientScore = 0; let insufficientCount = 0

    for (const q of EVAL_QUESTIONS) {
      const { answer, docs_retrieved, latency_ms } = await queryRAG(q.question, supabase)
      const { score, reasoning } = await judgeAnswer(q.question, q.ground_truth, answer, q.category)

      const result = {
        id: q.id,
        category: q.category,
        question: q.question,
        ground_truth: q.ground_truth,
        answer,
        score,
        reasoning,
        docs_retrieved,
        latency_ms,
        recall_at_3: docs_retrieved >= 3 ? 1 : 0,
        recall_at_5: docs_retrieved >= 5 ? 1 : 0,
      }

      results.push(result)
      totalScore += score

      if (q.category === 'factual') { factualScore += score; factualCount++ }
      if (q.category === 'multi_note') { multiScore += score; multiCount++ }
      if (q.category === 'insufficient') { insufficientScore += score; insufficientCount++ }
    }

    const summary = {
      total_questions: EVAL_QUESTIONS.length,
      overall_score: Number((totalScore / EVAL_QUESTIONS.length).toFixed(2)),
      factual_score: Number((factualScore / factualCount).toFixed(2)),
      multi_note_score: Number((multiScore / multiCount).toFixed(2)),
      insufficient_evidence_score: Number((insufficientScore / insufficientCount).toFixed(2)),
      recall_at_3: Number((results.reduce((s, r) => s + r.recall_at_3, 0) / results.length).toFixed(2)),
      recall_at_5: Number((results.reduce((s, r) => s + r.recall_at_5, 0) / results.length).toFixed(2)),
      avg_latency_ms: Number((results.reduce((s, r) => s + r.latency_ms, 0) / results.length).toFixed(0)),
    }

    await supabase.from('documents').insert([{
      user_id: session.user.id,
      title: `Eval Run ${new Date().toISOString()}`,
      content: JSON.stringify({ summary, results }),
      module: 'eval_log',
      visibility: 'private'
    }])

    return NextResponse.json({ summary, results })
  }

  if (body.action === 'get_questions') {
    return NextResponse.json({ questions: EVAL_QUESTIONS })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
