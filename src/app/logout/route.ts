import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, isSupabaseConfigured } from '@/lib/supabase/config'

// POST-only: a GET logout can be triggered by Next.js <Link> prefetch or any
// crawler, which would silently sign the user out moments after login.
export async function POST() {
  if (isSupabaseConfigured) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  // 303 forces the follow-up request to be a GET to the homepage.
  return NextResponse.redirect(`${getSiteUrl()}/`, 303)
}
