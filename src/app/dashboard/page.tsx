import { createServerSupabase } from '@/lib/supabase-server'

const modules = [
  { id: 'rag', name: 'Document RAG', desc: 'Upload docs, query with cited answers', icon: '📄', href: '/dashboard/rag', tag: 'A1' },
  { id: 'email-triage', name: 'Vendor Email Triage', desc: 'Classify intent, extract PO details, draft replies', icon: '📧', href: '/dashboard/email-triage', tag: 'A1' },
  { id: 'meeting-notes', name: 'Meeting Notes', desc: 'Paste transcript → tagged action items', icon: '📝', href: '/dashboard/meeting-notes', tag: 'A1' },
  { id: 'investor-update', name: 'Investor Update', desc: 'Raw notes → formatted investor email', icon: '📈', href: '/dashboard/investor-update', tag: 'A1' },
  { id: 'competitive-intel', name: 'Competitive Intel', desc: 'Track Mynaric, Skyloom, BridgeComm', icon: '🔭', href: '/dashboard/competitive-intel', tag: 'A1/A2' },
  { id: 'a2-suite', name: 'Agentic Suite', desc: 'Meta-orchestrator: CI + Outreach + Papers', icon: '🤖', href: '/dashboard/a2', tag: 'A2' },
  { id: 'eval', name: 'RAG Eval Suite', desc: 'Run 25 questions, scored by LLM judge', icon: '📊', href: '/dashboard/eval', tag: 'A1' },
]

export default async function DashboardPage() {
  const supabase = createServerSupabase()
  const { data: sessions } = await supabase
    .from('sessions')
    .select('module, latency_ms, cost_usd, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalSessions = sessions?.length ?? 0
  const totalCost = sessions?.reduce((a, s) => a + (s.cost_usd ?? 0), 0) ?? 0
  const avgLatency = sessions?.length
    ? Math.round(sessions.reduce((a, s) => a + (s.latency_ms ?? 0), 0) / sessions.length)
    : 0

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">QOSMIC FOOS</h1>
        <p className="text-zinc-400 mt-1">Founder&apos;s Office Operating System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Runs', value: totalSessions },
          { label: 'Avg Latency', value: `${avgLatency}ms` },
          { label: 'Est. Cost', value: `$${totalCost.toFixed(4)}` },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-zinc-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(mod => (
            <a
              key={mod.id}
              href={mod.href}
              className="card hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{mod.icon}</span>
                <span className="badge bg-brand-500/20 text-brand-500">{mod.tag}</span>
              </div>
              <h3 className="font-medium text-white group-hover:text-brand-500 transition-colors">{mod.name}</h3>
              <p className="text-zinc-400 text-sm mt-1">{mod.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
