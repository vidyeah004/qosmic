'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email to confirm signup.')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white text-xl font-bold">Q</div>
          <h1 className="text-2xl font-semibold text-white">QOSMIC FOOS</h1>
          <p className="text-zinc-400 text-sm">Founder&apos;s Office Operating System</p>
        </div>

        {/* Form */}
        <div className="card space-y-4">
          <div className="flex rounded-lg bg-zinc-800 p-1 mb-2">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors font-medium ${mode === 'login' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 text-sm py-1.5 rounded-md transition-colors font-medium ${mode === 'signup' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              onKeyDown={e => e.key === 'Enter' && handleAuth()}
            />
          </div>

          {error && (
            <p className={`text-sm ${error.includes('Check') ? 'text-green-400' : 'text-red-400'}`}>
              {error}
            </p>
          )}

          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="btn-primary w-full"
          >
            {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-xs text-zinc-600">QOSMIC Internal Platform · Confidential</p>
      </div>
    </div>
  )
}
