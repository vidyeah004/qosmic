import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/groq'
import { logSession } from '@/lib/logger'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { transcript } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const system = `You extract action items from meeting transcripts. Return ONLY a valid JSON object:
{
  "action_items": [
    {
      "assignee": "Person's name",
      "task": "Clear description of what they need to do",
      "deadline": "Deadline if mentioned, or 'Not specified'",
      "priority": "high|medium|low"
    }
  ]
}
Priority rules: high = blocking/urgent, medium = this week, low = no urgency.
Return ONLY valid JSON, no markdown.`

  try {
    const llmRes = await callLLM(system, `Meeting Transcript:\n${transcript}`)
    const clean = llmRes.text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    await logSession({
      user_id: session?.user.id,
      module: 'meeting-notes',
      input: transcript.slice(0, 500),
      output: JSON.stringify(result),
      latency_ms: llmRes.latency_ms,
      cost_usd: llmRes.estimated_cost_usd,
      model: llmRes.model
    })

    return NextResponse.json(result)
  } catch (e) {
    console.error('Meeting notes error:', e)
    return NextResponse.json({ error: 'Failed to process transcript' }, { status: 500 })
  }
}
