'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const TARGETS = ['Mynaric', 'Skyloom', 'BridgeComm', 'Airbus Defence', 'SA Photonics']

export default function CompetitiveIntelPage() {
  const [selected, setSelected] = useState('Mynaric')
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [customCompany, setCustomCompany] = useState('')

  const handleAnalyze = async () => {
    const company = customCompany.trim() || selected
    setLoading(true)
    setReport('')
    try {
      const res = await fetch('/api/modules/competitive-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company })
      })
      const data = await res.json()
      setReport(data.report ?? data.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">🔭 Competitive Intelligence</h1>
        <p className="text-zinc-400 text-sm mt-1">Track competitors in the satellite communication space</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-zinc-400 mb-2">Quick targets</p>
          <div className="flex flex-wrap gap-2">
            {TARGETS.map(t => (
              <button
                key={t}
                onClick={() => { setSelected(t); setCustomCompany('') }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selected === t && !customCompany
                    ? 'bg-brand-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Or type any company name…"
            value={customCompany}
            onChange={e => setCustomCompany(e.target.value)}
          />
          <button onClick={handleAnalyze} disabled={loading} className="btn-primary shrink-0">
            {loading ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      </div>

      {report && (
        <div className="card">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
