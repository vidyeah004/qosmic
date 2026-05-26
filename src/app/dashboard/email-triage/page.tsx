'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const SAMPLE_EMAIL = `From: procurement@antenna-systems.com
Subject: RE: PO-2024-089 — Shipment Delay Notice

Hi Team,

Unfortunately we need to inform you that PO-2024-089 for 12x Ka-band feed horns 
is delayed. Our supplier in Taiwan had a production issue. New ETA is December 15th, 
2024 (original was November 30th).

We can offer a 3% discount on this order as compensation for the delay.

Please confirm if you'd like to proceed or cancel.

Best,
Chen Wei
Antenna Systems Ltd.`

export default function EmailTriagePage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<{
    intent: string
    vendor: string
    po_number: string
    summary: string
    anomalies: string[]
    draft_reply: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTriage = async () => {
    if (!email.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/modules/email-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">📧 Vendor Email Triage</h1>
        <p className="text-zinc-400 text-sm mt-1">Classify intent, extract PO details, detect anomalies, draft reply</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-zinc-400">Paste email</label>
          <button
            onClick={() => setEmail(SAMPLE_EMAIL)}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Load sample email
          </button>
        </div>
        <textarea
          className="textarea h-48 font-mono text-sm"
          placeholder="Paste vendor email here…"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button onClick={handleTriage} disabled={loading || !email.trim()} className="btn-primary">
          {loading ? 'Analyzing…' : 'Triage Email'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Classification */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Intent', value: result.intent, color: 'text-blue-400' },
              { label: 'Vendor', value: result.vendor || 'Unknown', color: 'text-zinc-300' },
              { label: 'PO Number', value: result.po_number || 'N/A', color: 'text-zinc-300' },
            ].map(item => (
              <div key={item.label} className="card py-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{item.label}</p>
                <p className={`text-sm font-semibold mt-1 ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Summary</p>
            <p className="text-sm text-zinc-200">{result.summary}</p>
          </div>

          {/* Anomalies */}
          {result.anomalies?.length > 0 && (
            <div className="card border-yellow-800/50">
              <p className="text-xs text-yellow-500 uppercase tracking-wider mb-2">⚠️ Anomalies Detected</p>
              <ul className="space-y-1">
                {result.anomalies.map((a, i) => (
                  <li key={i} className="text-sm text-yellow-300">• {a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Draft Reply */}
          <div className="card">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Draft Reply</p>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result.draft_reply}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
