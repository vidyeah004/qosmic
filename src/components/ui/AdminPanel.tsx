'use client'
import { useState } from 'react'

type User = {
  id: string
  email: string
  role: string
  created_at: string
}

export default function AdminPanel({ users }: { users: User[] }) {
  const [list, setList] = useState(users)
  const [loading, setLoading] = useState<string | null>(null)

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'founder' ? 'intern' : 'founder'
    setLoading(userId)

    const res = await fetch('/api/admin/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })

    if (res.ok) {
      setList(list.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
    setLoading(null)
  }

  return (
    <div className="card space-y-3">
      {list.map(user => (
        <div key={user.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
          <div>
            <p className="text-sm text-white">{user.email}</p>
            <p className="text-xs text-zinc-500">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => toggleRole(user.id, user.role)}
            disabled={loading === user.id}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              user.role === 'founder'
                ? 'border-brand-500 text-brand-400 hover:bg-brand-500/10'
                : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {loading === user.id ? '...' : user.role === 'founder' ? 'Founder' : 'Intern'}
          </button>
        </div>
      ))}
      {list.length === 0 && (
        <p className="text-zinc-500 text-sm">No users yet.</p>
      )}
    </div>
  )
}
