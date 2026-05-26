'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const SAMPLE = `Week of Nov 18:
- Closed $450k in new contracts from two satellite operators
- Antenna prototype passed thermal vacuum test (big milestone)
- Lost one enterprise deal to Mynaric (they offered 18mo warranty vs our 12)
- Hired two new RF engineers, starting Jan
- Burn this month: $180k
- Cash runway: 14 months
- Next: Demo to ESA on Dec 5, need slides done by Nov 28`

export default function InvestorUpdatePage() {
  const [notes, setNotes] = useState('')
  const [update, setUpdate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!notes.trim()) return
    setLoading(true)
    setUpdate('')
    try {
      const res = await fetch('/api/modules/investor-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      const data = await res.json()
      setUpdate(data.update ?? data.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">📈 Investor Update Generator</h1>
        <p className="text-zinc-400 text-sm mt-1">Paste raw weekly notes → get a polished investor update</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-zinc-400">Raw weekly notes</label>
          <button onClick={() => setNotes(SAMPLE)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Load sample
          </button>
        </div>
        <textarea
          className="textarea h-40"
          placeholder="Paste your raw notes, bullet points, anything…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button onClick={handleGenerate} disabled={loading || !notes.trim()} className="btn-primary">
          {loading ? 'Generating…' : 'Generate Investor Update'}
        </button>
      </div>

      {update && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Investor Update</p>
            <button
              onClick={() => navigator.clipboard.writeText(update)}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Copy
            </button>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{update}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
