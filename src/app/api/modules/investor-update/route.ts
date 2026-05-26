import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/groq'
import { logSession } from '@/lib/logger'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { notes } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const system = `You are a startup communications expert. Convert raw weekly notes into a polished investor update email.
Structure it as:
## Week of [Date]

**Highlights** (2-3 bullets of wins)
**Metrics** (key numbers: revenue, burn, runway, team size)
**Challenges** (honest, 1-2 items)
**Next Week** (what you're focused on)

Keep it concise, factual, and confident. No fluff. Investors read hundreds of these.`

  try {
    const llmRes = await callLLM(system, `Raw Notes:\n${notes}`)

    await logSession({
      user_id: session?.user.id,
      module: 'investor-update',
      input: notes.slice(0, 500),
      output: llmRes.text,
      latency_ms: llmRes.latency_ms,
      cost_usd: llmRes.estimated_cost_usd,
      model: llmRes.model
    })

    return NextResponse.json({ update: llmRes.text })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate update' }, { status: 500 })
  }
}
