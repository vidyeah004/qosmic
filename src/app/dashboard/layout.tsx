import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase-server'
import Sidebar from '@/components/ui/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const role = profile?.role ?? 'intern'

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar userEmail={session.user.email ?? ''} role={role} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
