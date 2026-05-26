import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/groq'
import { logSession } from '@/lib/logger'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const INTENTS = ['shipment_delay', 'invoice', 'po_confirmation', 'quality_issue', 'price_change', 'general_inquiry', 'cancellation']

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const system = `You are an expert procurement analyst for QOSMIC, a satellite startup.
Analyze vendor emails and return ONLY a valid JSON object with these fields:
{
  "intent": one of [${INTENTS.join(', ')}],
  "vendor": "company name or null",
  "po_number": "PO number if mentioned or null",
  "summary": "1-2 sentence factual summary",
  "anomalies": ["list of concerning items like delays >2 weeks, price increases, etc. Empty array if none"],
  "draft_reply": "professional reply email acknowledging and responding appropriately"
}
Return ONLY the JSON object. No markdown, no preamble.`

  const start = Date.now()
  let result

  try {
    const llmRes = await callLLM(system, `Vendor Email:\n${email}`)
    
    // Clean and parse JSON
    const clean = llmRes.text.replace(/```json|```/g, '').trim()
    result = JSON.parse(clean)

    await logSession({
      user_id: session?.user.id,
      module: 'email-triage',
      input: email.slice(0, 500),
      output: JSON.stringify(result),
      latency_ms: llmRes.latency_ms,
      cost_usd: llmRes.estimated_cost_usd,
      model: llmRes.model
    })

    // Save to vendor_emails table
    await supabase.from('vendor_emails').insert([{
      user_id: session?.user.id,
      vendor_name: result.vendor,
      po_number: result.po_number,
      intent: result.intent,
      summary: result.summary,
      raw_email: email,
      draft_reply: result.draft_reply,
      anomaly_flags: result.anomalies
    }])

  } catch (e) {
    console.error('Email triage error:', e)
    return NextResponse.json({ error: 'Failed to analyze email' }, { status: 500 })
  }

  return NextResponse.json({ ...result, latency_ms: Date.now() - start })
}
