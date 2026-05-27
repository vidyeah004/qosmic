'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

type Doc = {
  id: string
  title: string
  preview: string
  visibility: 'shared' | 'private'
  own: boolean
}

export default function RAGPage() {
  const [docText, setDocText] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [visibility, setVisibility] = useState<'shared' | 'private'>('shared')
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [tab, setTab] = useState<'add' | 'query'>('add')
  const [role, setRole] = useState<'founder' | 'intern'>('intern')

  useEffect(() => {
    fetch('/api/modules/rag/list')
      .then(r => r.json())
      .then(d => {
        setDocs(d.docs ?? [])
        setRole(d.role ?? 'intern')
      })
      .finally(() => setLoadingDocs(false))
  }, [])

  const handleAddDoc = async () => {
    if (!docText.trim() || !docTitle.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/modules/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', title: docTitle, content: docText, visibility })
      })
      const data = await res.json()
      if (data.success) {
        setDocs(prev => [{
          id: data.id,
          title: docTitle,
          preview: docText.slice(0, 80) + '…',
          visibility: role === 'founder' ? visibility : 'private',
          own: true
        }, ...prev])
        setDocText('')
        setDocTitle('')
        setTab('query')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/modules/rag/list', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    setDocs(prev => prev.filter(d => d.id !== id))
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

      <div className="flex gap-2 border-b border-zinc-800">
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

          {role === 'founder' && (
            <div className="flex gap-3">
              {(['shared', 'private'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setVisibility(v)}
                  className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${
                    visibility === v
                      ? 'border-brand-500 text-brand-400 bg-brand-500/10'
                      : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {v === 'shared' ? '🌐 Shared' : '🔒 Private'}
                </button>
              ))}
            </div>
          )}

          <button onClick={handleAddDoc} disabled={loading || !docText || !docTitle} className="btn-primary">
            {loading ? 'Adding…' : 'Add to Knowledge Base'}
          </button>

          <div className="space-y-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">
              Knowledge Base {loadingDocs ? '(loading…)' : `(${docs.length} docs)`}
            </p>
            {docs.length === 0 && !loadingDocs && (
              <p className="text-zinc-600 text-sm">No documents yet.</p>
            )}
            {docs.map(d => (
              <div key={d.id} className="card py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{d.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      d.visibility === 'shared'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}>
                      {d.visibility === 'shared' ? '🌐 shared' : '🔒 private'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{d.preview}</p>
                </div>
                {(d.own || role === 'founder') && (
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-xs text-red-500 hover:text-red-400 shrink-0"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
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

          {loading && (
            <div className="text-zinc-400 text-sm animate-pulse">Searching knowledge base…</div>
          )}

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
