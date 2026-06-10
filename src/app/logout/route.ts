import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, isSupabaseConfigured } from '@/lib/supabase/config'

export async function GET() {
  if (isSupabaseConfigured) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return NextResponse.redirect(`${getSiteUrl()}/`)
}
