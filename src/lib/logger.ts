import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface LogEntry {
  user_id?: string
  module: string
  input: string
  output: string
  latency_ms: number
  cost_usd: number
  model: string
  status?: string
}

export async function logSession(entry: LogEntry) {
  try {
    const supabase = createServerComponentClient({ cookies })
    await supabase.from('sessions').insert([{
      user_id: entry.user_id ?? null,
      module: entry.module,
      input: entry.input.slice(0, 2000),
      output: entry.output.slice(0, 5000),
      latency_ms: entry.latency_ms,
      cost_usd: entry.cost_usd,
      model: entry.model,
      status: entry.status ?? 'success'
    }])
  } catch (e) {
    // Non-fatal — don't let logging break the module
    console.error('Logger error:', e)
  }
}
