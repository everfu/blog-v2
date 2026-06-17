import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { ensureAuthUserProfile } from '@/server/auth/application/profile'

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'missing-config' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const result = await ensureAuthUserProfile(data.user)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
