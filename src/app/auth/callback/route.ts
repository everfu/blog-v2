import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { isSupabaseAdminConfigured, isSupabaseConfigured, requireSupabaseConfig } from '@/lib/supabase/config'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/supabase'

function readMetadataString(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return null
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getAdminRedirectPath(requestUrl.searchParams.get('next'))
  const origin = requestUrl.origin

  if (!isSupabaseConfigured || !code) {
    return NextResponse.redirect(`${origin}/login?error=callback`)
  }

  const { supabaseUrl, supabaseAnonKey } = requireSupabaseConfig()
  const response = NextResponse.redirect(`${origin}${next}`)
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=callback`)
  }

  if (!isSupabaseAdminConfigured) {
    return NextResponse.redirect(`${origin}/login?error=profile-config`)
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return NextResponse.redirect(`${origin}/login?error=profile`)
  }

  const metadata = userData.user.user_metadata ?? {}
  const admin = createAdminClient()
  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: userData.user.id,
      github_username: readMetadataString(metadata, ['user_name', 'preferred_username', 'nickname']),
      display_name: readMetadataString(metadata, ['full_name', 'name', 'user_name']),
      avatar_url: readMetadataString(metadata, ['avatar_url', 'picture']),
    },
    { onConflict: 'id' }
  )

  if (profileError) {
    return NextResponse.redirect(`${origin}/login?error=profile`)
  }

  return response
}
