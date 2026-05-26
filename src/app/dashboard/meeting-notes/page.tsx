'use client'

import { useState } from 'react'

const SAMPLE = `[Team sync - Nov 18]
Attendees: Priya (CEO), Marcus (Eng), Leila (Ops)

Priya: We need to finalize the antenna specs by end of week. Marcus can you own that?
Marcus: Yes, I'll have a draft by Thursday EOD.
Leila: I still need the shipping address for the Taiwan vendor. Priya said she'd send it last week.
Priya: Sorry, I'll send that today. Also Leila, can you get the freight quote from 3 vendors by Friday?
Marcus: The integration test is blocked until we get the updated firmware from BridgeComm.
Priya: I'll follow up with BridgeComm today. Target is to unblock Marcus by Wednesday.`

type ActionItem = {
  assignee: string
  task: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

export default function MeetingNotesPage() {
  const [transcript, setTranscript] = useState('')
  const [items, setItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleProcess = async () => {
    if (!transcript.trim()) return
    setLoading(true)
    setItems([])
    try {
      const res = await fetch('/api/modules/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })
      const data = await res.json()
      setItems(data.action_items ?? [])
    } finally {
      setLoading(false)
    }
  }

  const priorityColor = { high: 'bg-red-500/20 text-red-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-zinc-700 text-zinc-400' }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">📝 Meeting Notes → Action Items</h1>
        <p className="text-zinc-400 text-sm mt-1">Paste a meeting transcript, get tagged action items with deadlines</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-zinc-400">Meeting transcript</label>
          <button onClick={() => setTranscript(SAMPLE)} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Load sample
          </button>
        </div>
        <textarea
          className="textarea h-48"
          placeholder="Paste meeting notes or transcript here…"
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
        />
        <button onClick={handleProcess} disabled={loading || !transcript.trim()} className="btn-primary">
          {loading ? 'Processing…' : 'Extract Action Items'}
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">{items.length} action items found</p>
          {items.map((item, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
                {item.assignee?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{item.assignee}</span>
                  <span className={`badge ${priorityColor[item.priority] ?? priorityColor.low}`}>
                    {item.priority}
                  </span>
                  {item.deadline && (
                    <span className="text-xs text-zinc-500">Due: {item.deadline}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-300 mt-1">{item.task}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
