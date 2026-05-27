import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/groq'
import { logSession } from '@/lib/logger'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const role = profile?.role ?? 'intern'

  if (body.action === 'add') {
    const { title, content, visibility = 'shared' } = body

    // interns can only add private docs
    const finalVisibility = role === 'founder' ? visibility : 'private'

    const { data } = await supabase.from('documents').insert([{
      user_id: user?.id,
      title,
      content,
      module: 'rag',
      visibility: finalVisibility
    }]).select('id').single()

    return NextResponse.json({ success: true, id: data?.id })
  }

  if (body.action === 'query') {
    const { query } = body

    // founders see all docs; interns see shared + their own private
    let q = supabase
      .from('documents')
      .select('title, content')
      .eq('module', 'rag')

    if (role !== 'founder') {
      q = q.or(`visibility.eq.shared,and(visibility.eq.private,user_id.eq.${user?.id})`)
    }

    const { data: docs } = await q.limit(20)

    const context = (docs ?? [])
      .map((d: { title: string; content: string }) => `[${d.title}]\n${d.content}`)
      .join('\n\n---\n\n')
      .slice(0, 6000)

    if (!context) {
      return NextResponse.json({ answer: 'No documents in knowledge base yet. Add some documents first.' })
    }

    const system = `You are a technical assistant for QOSMIC Space, a satellite laser communication startup based at IISc Bengaluru.
Answer questions using ONLY the provided context documents.
Always cite which document(s) you used like this: [Source: Document Title].
If the answer is not in the context, say "Insufficient evidence in knowledge base." Do not hallucinate.`

    const userPrompt = `Context:\n${context}\n\nQuestion: ${query}`
    const start = Date.now()
    const result = await callLLM(system, userPrompt)

    await logSession({
      user_id: user?.id,
      module: 'rag',
      input: query,
      output: result.text,
      latency_ms: result.latency_ms,
      cost_usd: result.estimated_cost_usd,
      model: result.model
    })

    return NextResponse.json({ answer: result.text, latency_ms: Date.now() - start })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
