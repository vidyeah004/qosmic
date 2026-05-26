import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/groq'
import { logSession } from '@/lib/logger'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// In-memory doc store (session-level; swap for Supabase + embeddings in prod)
const docStore: { title: string; content: string }[] = []

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (body.action === 'add') {
    const { title, content } = body
    docStore.push({ title, content })

    // Also save to Supabase for persistence
    await supabase.from('documents').insert([{
      user_id: session?.user.id,
      title,
      content,
      module: 'rag'
    }])

    return NextResponse.json({ success: true, count: docStore.length })
  }

  if (body.action === 'query') {
    const { query } = body

    // Retrieve all docs (simple keyword matching; replace with vector search later)
    const context = docStore
      .map(d => `[${d.title}]\n${d.content}`)
      .join('\n\n---\n\n')
      .slice(0, 6000)

    if (!context) {
      // Try fetching from Supabase
      const { data: docs } = await supabase
        .from('documents')
        .select('title, content')
        .eq('module', 'rag')
        .limit(10)

      const dbContext = (docs ?? [])
        .map((d: { title: string; content: string }) => `[${d.title}]\n${d.content}`)
        .join('\n\n---\n\n')
        .slice(0, 6000)

      if (!dbContext) {
        return NextResponse.json({ answer: 'No documents in knowledge base yet. Add some documents first.' })
      }
    }

    const system = `You are a technical assistant for QOSMIC, a satellite communication startup. 
Answer questions using ONLY the provided context documents.
Always cite which document(s) you used like this: [Source: Document Title].
If the answer is not in the context, say so explicitly.`

    const userPrompt = `Context:\n${context}\n\nQuestion: ${query}`

    const start = Date.now()
    const result = await callLLM(system, userPrompt)

    await logSession({
      user_id: session?.user.id,
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
