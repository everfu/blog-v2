'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, isSupabaseConfigured } from '@/lib/supabase/config'

async function getRequestOrigin() {
  const headersList = await headers()
  const origin = headersList.get('origin')

  if (origin) return origin

  const host = headersList.get('x-forwarded-host') || headersList.get('host')

  if (!host) return getSiteUrl()

  const protocol = headersList.get('x-forwarded-proto') || (
    host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'
  )

  return `${protocol}://${host}`
}

export async function signInWithGitHub(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect('/login?error=missing-config')
  }

  const next = getAdminRedirectPath(formData.get('next'))
  const origin = await getRequestOrigin()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=oauth')
  }

  redirect(data.url)
}
