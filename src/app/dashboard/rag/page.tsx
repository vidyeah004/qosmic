'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function RAGPage() {
  const [docText, setDocText] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [uploadedDocs, setUploadedDocs] = useState<{ title: string; preview: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'add' | 'query'>('add')

  const handleAddDoc = async () => {
    if (!docText.trim() || !docTitle.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/modules/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', title: docTitle, content: docText })
      })
      const data = await res.json()
      if (data.success) {
        setUploadedDocs(prev => [...prev, { title: docTitle, preview: docText.slice(0, 80) + '…' }])
        setDocText('')
        setDocTitle('')
        setTab('query')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuery = async () => {
    if (!query.trim()) return
    setLoading(true)
    setAnswer('')
    try {
      const res = await fetch('/api/modules/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'query', query })
      })
      const data = await res.json()
      setAnswer(data.answer ?? data.error ?? 'No answer returned.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">📄 Document RAG</h1>
        <p className="text-zinc-400 text-sm mt-1">Add documents, then query them with cited answers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-0">
        {(['add', 'query'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? 'border-brand-500 text-white' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'add' ? 'Add Document' : 'Query'}
          </button>
        ))}
      </div>

      {tab === 'add' && (
        <div className="space-y-4">
          <input
            className="input"
            placeholder="Document title (e.g. QOSMIC System Architecture v2)"
            value={docTitle}
            onChange={e => setDocTitle(e.target.value)}
          />
          <textarea
            className="textarea h-48"
            placeholder="Paste document content here…"
            value={docText}
            onChange={e => setDocText(e.target.value)}
          />
          <button onClick={handleAddDoc} disabled={loading || !docText || !docTitle} className="btn-primary">
            {loading ? 'Adding…' : 'Add to Knowledge Base'}
          </button>

          {uploadedDocs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Indexed this session</p>
              {uploadedDocs.map((d, i) => (
                <div key={i} className="card py-3">
                  <p className="text-sm font-medium text-white">{d.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{d.preview}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'query' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Ask a question about your documents…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuery()}
            />
            <button onClick={handleQuery} disabled={loading || !query} className="btn-primary shrink-0">
              {loading ? '…' : 'Ask'}
            </button>
          </div>

          {answer && (
            <div className="card">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Answer</p>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
