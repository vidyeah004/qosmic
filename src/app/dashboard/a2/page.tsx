'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

type EvalResult = {
  id: string
  category: string
  question: string
  ground_truth: string
  answer: string
  score: number
  reasoning: string
  docs_retrieved: number
  latency_ms: number
  recall_at_3: number
  recall_at_5: number
}

type EvalSummary = {
  total_questions: number
  overall_score: number
  factual_score: number
  multi_note_score: number
  insufficient_evidence_score: number
  recall_at_3: number
  recall_at_5: number
  avg_latency_ms: number
}

const CATEGORY_LABELS: Record<string, string> = {
  factual: 'Factual Retrieval',
  multi_note: 'Multi-Note Reasoning',
  insufficient: 'Insufficient Evidence',
}

const CATEGORY_COLORS: Record<string, string> = {
  factual: '#3b82f6',
  multi_note: '#8b5cf6',
  insufficient: '#f59e0b',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 0.8 ? '#22c55e' : score >= 0.5 ? '#f59e0b' : '#ef4444'
  const label = score >= 1.0 ? 'Full' : score >= 0.5 ? 'Partial' : 'Fail'
  return (
    <span style={{
      background: color + '20',
      color,
      border: `1px solid ${color}40`,
      borderRadius: '6px',
      padding: '2px 10px',
      fontSize: '12px',
      fontWeight: 500,
      whiteSpace: 'nowrap'
    }}>{label} ({score})</span>
  )
}

function MetricCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div style={{
      background: 'var(--color-background-secondary)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '1rem 1.25rem',
      border: '0.5px solid var(--color-border-tertiary)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}>{value}</p>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
  )
}

export default function EvalPage() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState<EvalSummary | null>(null)
  const [results, setResults] = useState<EvalResult[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState('')

  const runEval = async () => {
    setRunning(true)
    setError('')
    setSummary(null)
    setResults([])
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 92))
    }, 1200)

    try {
      const res = await fetch('/api/modules/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_eval' })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSummary(data.summary)
      setResults(data.results)
      setProgress(100)
    } catch (e) {
      setError('Eval run failed. Make sure documents are loaded in the RAG module first.')
    } finally {
      clearInterval(progressInterval)
      setRunning(false)
    }
  }

  const filtered = filter === 'all' ? results : results.filter(r => r.category === filter)
  const passCount = results.filter(r => r.score >= 1.0).length
  const partialCount = results.filter(r => r.score === 0.5).length
  const failCount = results.filter(r => r.score === 0).length

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
          📊 RAG Evaluation Suite
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
          25 questions across factual retrieval, multi-note reasoning, and insufficient evidence cases. Scored by LLM-as-judge (llama-3.1-8b).
        </p>
      </div>

      {!summary && !running && (
        <div style={{
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'var(--color-background-secondary)'
        }}>
          <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
            Make sure documents are loaded in the RAG module before running. The eval will run all 25 questions and score answers automatically.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { cat: 'Factual Retrieval', n: 10, color: '#3b82f6' },
              { cat: 'Multi-Note Reasoning', n: 10, color: '#8b5cf6' },
              { cat: 'Insufficient Evidence', n: 5, color: '#f59e0b' },
            ].map(c => (
              <span key={c.cat} style={{
                background: c.color + '15',
                color: c.color,
                border: `1px solid ${c.color}30`,
                borderRadius: 8,
                padding: '4px 12px',
                fontSize: 13
              }}>{c.n} × {c.cat}</span>
            ))}
          </div>
          <button
            onClick={runEval}
            style={{
              background: 'var(--color-text-primary)',
              color: 'var(--color-background-primary)',
              border: 'none',
              borderRadius: 'var(--border-radius-md)',
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Run Full Eval Suite
          </button>
          {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
      )}

      {running && (
        <div style={{
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem',
          marginBottom: '2rem',
          background: 'var(--color-background-secondary)'
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, color: 'var(--color-text-primary)' }}>
            Running eval... {progress}%
          </p>
          <div style={{ background: 'var(--color-border-tertiary)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--color-text-primary)',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.5s ease',
              borderRadius: 4
            }} />
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 12 }}>
            Querying RAG for each question, then running LLM-as-judge scoring. This takes ~60-90 seconds.
          </p>
        </div>
      )}

      {summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: '2rem' }}>
            <MetricCard label="Overall Score" value={`${Math.round(summary.overall_score * 100)}%`} subtitle={`${passCount} pass · ${partialCount} partial · ${failCount} fail`} />
            <MetricCard label="Factual Retrieval" value={`${Math.round(summary.factual_score * 100)}%`} subtitle="10 questions" />
            <MetricCard label="Multi-Note Reasoning" value={`${Math.round(summary.multi_note_score * 100)}%`} subtitle="10 questions" />
            <MetricCard label="Insuff. Evidence" value={`${Math.round(summary.insufficient_evidence_score * 100)}%`} subtitle="5 questions" />
            <MetricCard label="Recall@3" value={summary.recall_at_3.toFixed(2)} subtitle="docs retrieved" />
            <MetricCard label="Recall@5" value={summary.recall_at_5.toFixed(2)} subtitle="docs retrieved" />
            <MetricCard label="Avg Latency" value={`${summary.avg_latency_ms}ms`} subtitle="per question" />
          </div>

          <div style={{
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6
          }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Eval methodology:</strong> Each question is sent to the RAG system (llama-3.3-70b-versatile, top-10 docs retrieved). Answer is scored 0/0.5/1.0 by an independent LLM judge (llama-3.1-8b-instant) against ground truth. Insufficient-evidence questions are scored on whether the model correctly abstains vs. hallucinates. Recall@k measures whether ≥k documents were retrieved (proxy for context coverage).
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {['all', 'factual', 'multi_note', 'insufficient'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--border-radius-md)',
                  border: '0.5px solid var(--color-border-secondary)',
                  background: filter === f ? 'var(--color-text-primary)' : 'transparent',
                  color: filter === f ? 'var(--color-background-primary)' : 'var(--color-text-secondary)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: filter === f ? 500 : 400
                }}
              >
                {f === 'all' ? `All (${results.length})` : CATEGORY_LABELS[f]}
              </button>
            ))}
            <button
              onClick={runEval}
              disabled={running}
              style={{
                marginLeft: 'auto',
                padding: '6px 14px',
                borderRadius: 'var(--border-radius-md)',
                border: '0.5px solid var(--color-border-secondary)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              ↺ Re-run
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(r => (
              <div
                key={r.id}
                style={{
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)',
                  overflow: 'hidden',
                  background: 'var(--color-background-primary)'
                }}
              >
                <div
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    minWidth: 30
                  }}>{r.id}</span>
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: CATEGORY_COLORS[r.category] + '15',
                    color: CATEGORY_COLORS[r.category],
                    whiteSpace: 'nowrap'
                  }}>
                    {r.category === 'factual' ? 'Factual' : r.category === 'multi_note' ? 'Multi-note' : 'Insuff.'}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--color-text-primary)' }}>{r.question}</span>
                  <ScoreBadge score={r.score} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', minWidth: 20 }}>
                    {expandedId === r.id ? '▲' : '▼'}
                  </span>
                </div>

                {expandedId === r.id && (
                  <div style={{
                    borderTop: '0.5px solid var(--color-border-tertiary)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Ground Truth</p>
                      <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.5 }}>{r.ground_truth}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>RAG Answer</p>
                      <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                        <ReactMarkdown>{r.answer}</ReactMarkdown>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Judge Reasoning</p>
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, fontStyle: 'italic' }}>{r.reasoning}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        <span>Docs retrieved: {r.docs_retrieved}</span>
                        <span>Latency: {r.latency_ms}ms</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
