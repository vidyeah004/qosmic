'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const EXAMPLES = [
  { label: 'Competitive Intel', text: 'Analyze Mynaric and their recent product announcements' },
  { label: 'Outreach', text: 'Write outreach for Eutelsat, they just launched a new LEO constellation' },
  { label: 'Research Paper', text: 'Summarize this arXiv paper: https://arxiv.org/abs/2401.12345' },
]

type Step = { label: string; status: 'pending' | 'running' | 'done' }

export default function A2Page() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [route, setRoute] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(false)

  const handleRun = async () => {
    if (!input.trim()) return
    setLoading(true)
    setResult('')
    setRoute('')
    setSteps([
      { label: 'Classifying intent…', status: 'running' },
      { label: 'Routing to sub-system', status: 'pending' },
      { label: 'Running multi-LLM analysis', status: 'pending' },
      { label: 'Judging best response', status: 'pending' },
    ])

    try {
      // Simulate step progression
      setTimeout(() => setSteps(s => s.map((step, i) => i === 0 ? { ...step, status: 'done' } : i === 1 ? { ...step, status: 'running' } : step)), 800)
      setTimeout(() => setSteps(s => s.map((step, i) => i === 1 ? { ...step, status: 'done' } : i === 2 ? { ...step, status: 'running' } : step)), 1600)
      setTimeout(() => setSteps(s => s.map((step, i) => i === 2 ? { ...step, status: 'done' } : i === 3 ? { ...step, status: 'running' } : step)), 2400)

      const res = await fetch('/api/a2/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })
      const data = await res.json()

      setSteps(s => s.map(step => ({ ...step, status: 'done' })))
      setResult(data.output ?? data.error)
      setRoute(data.route ?? '')
    } finally {
      setLoading(false)
    }
  }

  const stepIcon = (status: Step['status']) =>
    status === 'done' ? '✓' : status === 'running' ? '⟳' : '○'

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">🤖 Agentic Suite</h1>
        <p className="text-zinc-400 text-sm mt-1">Meta-orchestrator routes your request to: competitive intel, outreach personalizer, or paper summarizer</p>
      </div>

      {/* Sub-systems */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: 'Competitive Intel', desc: 'Track Mynaric, Skyloom, etc.', icon: '🔭' },
          { name: 'Outreach Personalizer', desc: 'Personalized satellite operator emails', icon: '✉️' },
          { name: 'Paper Summarizer', desc: 'arXiv technical paper triage', icon: '📑' },
        ].map(s => (
          <div key={s.name} className="card py-3">
            <span className="text-xl">{s.icon}</span>
            <p className="text-sm font-medium text-white mt-2">{s.name}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => setInput(ex.text)}
              className="text-xs bg-zinc-800 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {ex.label} example
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            className="textarea h-20"
            placeholder="Ask anything — the orchestrator will route it to the right sub-system…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <button onClick={handleRun} disabled={loading || !input.trim()} className="btn-primary">
          {loading ? 'Running…' : 'Run Agent'}
        </button>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div className="card space-y-2">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-3 text-sm ${
              step.status === 'done' ? 'text-zinc-400' :
              step.status === 'running' ? 'text-brand-400' : 'text-zinc-600'
            }`}>
              <span className={`text-xs font-mono ${step.status === 'running' ? 'animate-spin' : ''}`}>
                {stepIcon(step.status)}
              </span>
              {step.label}
              {step.status === 'done' && step.label.includes('Routing') && route && (
                <span className="badge bg-brand-500/20 text-brand-400 ml-1">→ {route}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Output</p>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
