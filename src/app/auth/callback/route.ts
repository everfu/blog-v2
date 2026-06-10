import { NextRequest, NextResponse } from 'next/server'
import { getAdminRedirectPath } from '@/lib/auth/redirect'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = getAdminRedirectPath(requestUrl.searchParams.get('next'))
  const origin = requestUrl.origin

  if (!isSupabaseConfigured || !code) {
    return NextResponse.redirect(`${origin}/login?error=callback`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=callback`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
