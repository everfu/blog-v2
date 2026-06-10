'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, isSupabaseConfigured } from '@/lib/supabase/config'

export async function signInWithGitHub(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect('/login?error=missing-config')
  }

  const next = String(formData.get('next') || '/admin')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=oauth')
  }

  redirect(data.url)
}
