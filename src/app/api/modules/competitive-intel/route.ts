import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/groq'
import { logSession } from '@/lib/logger'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import axios from 'axios'

async function scrapeCompanyInfo(company: string): Promise<string> {
  try {
    // Search for recent news via a simple web scrape
    const query = encodeURIComponent(`${company} satellite communication 2024 news product`)
    const res = await axios.get(`https://news.ycombinator.com/search?q=${query}`, { timeout: 5000 })
    return res.data?.slice(0, 2000) ?? ''
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const { company } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  // Attempt web context (best effort)
  const webContext = await scrapeCompanyInfo(company)

  const system = `You are a competitive intelligence analyst for QOSMIC, a free-space optical satellite communication company.
Produce a structured competitive analysis report for the given company.
Format as markdown with sections:
## [Company Name] — Competitive Analysis

### Company Overview
### Products & Technology
### Market Position
### Recent Developments  
### QOSMIC vs [Company] — Key Differences
### Strategic Implications for QOSMIC

Be specific, technical, and honest. If you don't have recent data, say so clearly.`

  const userPrompt = `Analyze: ${company}
${webContext ? `\nContext from web:\n${webContext}` : ''}`

  try {
    const llmRes = await callLLM(system, userPrompt)

    await logSession({
      user_id: session?.user.id,
      module: 'competitive-intel',
      input: company,
      output: llmRes.text,
      latency_ms: llmRes.latency_ms,
      cost_usd: llmRes.estimated_cost_usd,
      model: llmRes.model
    })

    return NextResponse.json({ report: llmRes.text })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
