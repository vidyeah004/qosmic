import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile'
export const FALLBACK_MODEL = 'llama-3.1-8b-instant'

export interface LLMResponse {
  text: string
  model: string
  latency_ms: number
  estimated_cost_usd: number
  fallback?: boolean
  error?: string
}

export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  model = DEFAULT_MODEL
): Promise<LLMResponse> {
  const start = Date.now()

  try {
    const res = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const latency_ms = Date.now() - start
    const text = res.choices[0]?.message?.content ?? ''
    const tokens = res.usage?.total_tokens ?? 0
    const estimated_cost_usd = tokens * 0.0000008

    return { text, model, latency_ms, estimated_cost_usd }

  } catch (err: unknown) {
    // Primary model failed, try fallback
    if (model !== FALLBACK_MODEL) {
      try {
        const res = await groq.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })

        const latency_ms = Date.now() - start
        const text = res.choices[0]?.message?.content ?? ''
        const tokens = res.usage?.total_tokens ?? 0
        const estimated_cost_usd = tokens * 0.0000008

        return { text, model: FALLBACK_MODEL, latency_ms, estimated_cost_usd, fallback: true }

      } catch {
        // Fallback also failed
      }
    }

    const latency_ms = Date.now() - start
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      text: 'Service temporarily unavailable. Please try again in a moment.',
      model,
      latency_ms,
      estimated_cost_usd: 0,
      error: message
    }
  }
}

export async function callMultiLLM(
  systemPrompt: string,
  userPrompt: string
): Promise<LLMResponse[]> {
  const models = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768'
  ]

  const results = await Promise.allSettled(
    models.map(m => callLLM(systemPrompt, userPrompt, m))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<LLMResponse> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(r => !r.error)
}

export async function judgeResponses(
  question: string,
  responses: LLMResponse[]
): Promise<LLMResponse> {
  if (responses.length === 0) throw new Error('No responses to judge')
  if (responses.length === 1) return responses[0]

  const prompt = `You are a judge. Given a question and multiple AI responses, pick the BEST one.
Return ONLY a JSON object: { "winner_index": <number>, "reason": "<brief reason>" }
Question: ${question}
${responses.map((r, i) => `Response ${i} (${r.model}):\n${r.text}`).join('\n\n---\n\n')}`

  const judgment = await callLLM(
    'You are a response quality judge. Return only valid JSON.',
    prompt
  )

  try {
    const parsed = JSON.parse(judgment.text)
    return responses[parsed.winner_index] ?? responses[0]
  } catch {
    return responses[0]
  }
}
