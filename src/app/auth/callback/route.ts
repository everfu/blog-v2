import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, isSupabaseConfigured } from '@/lib/supabase/config'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/admin'

  if (!isSupabaseConfigured || !code) {
    return NextResponse.redirect(`${getSiteUrl()}/login?error=callback`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${getSiteUrl()}/login?error=callback`)
  }

  return NextResponse.redirect(`${getSiteUrl()}${next}`)
}
