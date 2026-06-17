import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { isSupabaseConfigured, requireSupabaseConfig } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { syncAuthCallbackProfile } from '@/server/users/application/auth-callback'

function redirectToLoginError(origin: string, error: string, details?: URLSearchParams) {
  const url = new URL('/login', origin)
  url.searchParams.set('error', error)

  details?.forEach((value, key) => {
    if (key.startsWith('error_')) url.searchParams.set(key, value)
  })

  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getAdminRedirectPath(requestUrl.searchParams.get('next'))
  const origin = requestUrl.origin

  if (requestUrl.searchParams.has('error')) {
    return redirectToLoginError(origin, 'provider', requestUrl.searchParams)
  }

  if (!isSupabaseConfigured || !code) {
    return redirectToLoginError(origin, 'callback')
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
    return redirectToLoginError(origin, 'callback')
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return redirectToLoginError(origin, 'profile')
  }

  const profileResult = await syncAuthCallbackProfile(userData.user)
  if (!profileResult.ok) {
    return redirectToLoginError(origin, profileResult.error)
  }

  return response
}
