import { NextRequest, NextResponse } from 'next/server'
import { callLLM, callMultiLLM, judgeResponses } from '@/lib/groq'
import { logSession } from '@/lib/logger'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'

type Route = 'competitive_intel' | 'outreach' | 'paper_summary' | 'out_of_scope'

async function classify(input: string): Promise<Route> {
  const system = `Classify the user request into ONE of these categories:
- competitive_intel: asking about competitor companies, market analysis, tracking companies
- outreach: writing emails, personalizing messages, reaching out to potential customers
- paper_summary: summarizing research papers, arXiv links, technical documents
- out_of_scope: anything unrelated to the above three categories

Return ONLY the category name, nothing else.`
  const res = await callLLM(system, input)
  const text = res.text.trim().toLowerCase()
  if (text.includes('out_of_scope')) return 'out_of_scope'
  if (text.includes('outreach')) return 'outreach'
  if (text.includes('paper')) return 'paper_summary'
  if (text.includes('competitive')) return 'competitive_intel'
  return 'out_of_scope'
}

async function runCompetitiveIntel(input: string): Promise<string> {
  const system = `You are a competitive intelligence analyst for QOSMIC, a free-space optical communication satellite company.
Provide detailed competitive analysis. Include: company overview, recent news, products, QOSMIC differentiation, and strategic implications.`
  const responses = await callMultiLLM(system, input)
  const best = await judgeResponses(input, responses)
  return best.text
}

async function runOutreach(input: string): Promise<string> {
  const system = `You write highly personalized outreach emails for QOSMIC targeting satellite operators.
QOSMIC offers: free-space optical inter-satellite links, high bandwidth, low latency, patent-pending beam acquisition tech.
Personalize the email based on context given. Include: subject line, opening hook, QOSMIC value prop, CTA.`
  const responses = await callMultiLLM(system, input)
  const best = await judgeResponses(input, responses)
  return best.text
}

async function runPaperSummary(input: string): Promise<string> {
  let paperContext = ''
  const arxivMatch = input.match(/arxiv\.org\/abs\/(\d+\.\d+)/)
  if (arxivMatch) {
    try {
      const res = await axios.get(`https://export.arxiv.org/abs/${arxivMatch[1]}`, { timeout: 6000 })
      paperContext = res.data?.slice(0, 3000) ?? ''
    } catch {
      paperContext = ''
    }
  }
  const system = `You are a technical paper analyst for QOSMIC. Summarize research papers for an engineering team.
Structure as:
## Paper Summary
**TL;DR** (1 sentence)
**Key Findings** (3-5 bullets)
**Technical Details** (brief)
**Relevance to QOSMIC** (how does this apply to FSO comms / satellite tech?)
**Action Items** (if any)`
  const userPrompt = `${input}\n${paperContext ? `\nPaper content:\n${paperContext}` : ''}`
  const responses = await callMultiLLM(system, userPrompt)
  const best = await judgeResponses(input, responses)
  return best.text
}

export async function POST(req: NextRequest) {
  const { input } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  const start = Date.now()

  try {
    const route = await classify(input)

    if (route === 'out_of_scope') {
      return NextResponse.json({
        output: 'This request is outside FOOS scope. Please submit a competitive intelligence, outreach, or research paper request.',
        route: 'out_of_scope',
        latency_ms: Date.now() - start
      })
    }

    let output = ''
    if (route === 'competitive_intel') output = await runCompetitiveIntel(input)
    else if (route === 'outreach') output = await runOutreach(input)
    else output = await runPaperSummary(input)

    await logSession({
      user_id: session?.user.id,
      module: `a2-${route}`,
      input: input.slice(0, 500),
      output: output.slice(0, 2000),
      latency_ms: Date.now() - start,
      cost_usd: 0,
      model: 'multi-llm-judge'
    })

    return NextResponse.json({ output, route, latency_ms: Date.now() - start })

  } catch (e) {
    console.error('A2 orchestrator error:', e)
    return NextResponse.json({ error: 'Orchestrator failed' }, { status: 500 })
  }
}
