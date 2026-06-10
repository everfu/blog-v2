import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { isSupabaseConfigured, requireSupabaseConfig } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'

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

  return response
}
