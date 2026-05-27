'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const founderNav = [
  { label: 'Home', href: '/dashboard', icon: '⬛' },
  { label: '─── A1: FOOS', href: null, icon: null },
  { label: 'Document RAG', href: '/dashboard/rag', icon: '📄' },
  { label: 'Email Triage', href: '/dashboard/email-triage', icon: '📧' },
  { label: 'Meeting Notes', href: '/dashboard/meeting-notes', icon: '📝' },
  { label: 'Investor Update', href: '/dashboard/investor-update', icon: '📈' },
  { label: 'Competitive Intel', href: '/dashboard/competitive-intel', icon: '🔭' },
  { label: 'RAG Eval Suite', href: '/dashboard/eval', icon: '📊' },
  { label: '─── A2: Agentic Suite', href: null, icon: null },
  { label: 'Agentic Orchestrator', href: '/dashboard/a2', icon: '🤖' },
]

const internNav = [
  { label: 'Home', href: '/dashboard', icon: '⬛' },
  { label: '─── A1: FOOS', href: null, icon: null },
  { label: 'Document RAG', href: '/dashboard/rag', icon: '📄' },
  { label: 'Email Triage', href: '/dashboard/email-triage', icon: '📧' },
  { label: 'Meeting Notes', href: '/dashboard/meeting-notes', icon: '📝' },
  { label: 'Competitive Intel', href: '/dashboard/competitive-intel', icon: '🔭' },
  { label: '─── A2: Agentic Suite', href: null, icon: null },
  { label: 'Agentic Orchestrator', href: '/dashboard/a2', icon: '🤖' },
]

export default function Sidebar({ userEmail, role }: { userEmail: string; role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const nav = role === 'founder' ? founderNav : internNav

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">Q</div>
          <span className="font-semibold text-white text-sm">QOSMIC FOOS</span>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {nav.map((item, i) => {
          if (!item.href) {
            return (
              <div key={i} className="px-2 pt-4 pb-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {item.label}
              </div>
            )
          }
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-brand-500/15 text-brand-400 font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 truncate mb-1">{userEmail}</p>
        <p className="text-xs text-zinc-600 mb-2">{role === 'founder' ? 'Founder' : 'Intern'}</p>
        <button onClick={handleSignOut} className="text-xs text-zinc-500 hover:text-white transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  )
}
