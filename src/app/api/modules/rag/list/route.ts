import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const role = profile?.role ?? 'intern'

  let q = supabase
    .from('documents')
    .select('id, title, content, visibility, user_id')
    .eq('module', 'rag')
    .order('created_at', { ascending: false })

  if (role !== 'founder') {
    q = q.or(`visibility.eq.shared,and(visibility.eq.private,user_id.eq.${user?.id})`)
  }

  const { data: docs } = await q

  return NextResponse.json({
    docs: (docs ?? []).map(d => ({
      id: d.id,
      title: d.title,
      preview: d.content.slice(0, 80) + '…',
      visibility: d.visibility,
      own: d.user_id === user?.id
    }))
  })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const role = profile?.role ?? 'intern'

  // founders can delete any doc; interns only their own
  let q = supabase.from('documents').delete().eq('id', id)
  if (role !== 'founder') q = q.eq('user_id', user?.id)

  await q

  return NextResponse.json({ success: true })
}
