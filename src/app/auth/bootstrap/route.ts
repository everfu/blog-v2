import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isAdminEmailConfigured,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  requireAdminEmail,
  requireSupabaseConfig,
} from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'
import { ensureAuthUserProfile, getAdminPasskeyState } from '@/server/auth/application/profile'

/**
 * One-time bootstrap: mint a session for the admin account so the first
 * passkey can be registered (registerPasskey requires an active session).
 *
 * Only works while the admin owns zero passkeys. Once any passkey exists,
 * this endpoint is permanently closed (403) and login must use a passkey.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured || !isSupabaseAdminConfigured) {
    return NextResponse.json({ error: 'missing-config' }, { status: 500 })
  }

  if (!isAdminEmailConfigured) {
    return NextResponse.json({ error: 'admin-email' }, { status: 500 })
  }

  const stateResult = await getAdminPasskeyState()

  if (!stateResult.ok) {
    return NextResponse.json({ error: stateResult.error }, { status: 500 })
  }

  if (stateResult.state.passkeyCount > 0) {
    // Bootstrap is closed: a passkey already exists, so sign in with it.
    return NextResponse.json({ error: 'bootstrap-closed' }, { status: 403 })
  }

  const adminEmail = requireAdminEmail()
  const admin = createAdminClient()

  // generateLink creates the user for magiclink if it does not exist yet.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: adminEmail,
  })

  if (linkError || !linkData.properties?.hashed_token) {
    return NextResponse.json({ error: 'bootstrap-link' }, { status: 500 })
  }

  const { supabaseUrl, supabaseAnonKey } = requireSupabaseConfig()
  const response = NextResponse.json({ ok: true })
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

  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  })

  if (verifyError || !verifyData.user) {
    return NextResponse.json({ error: 'bootstrap-verify' }, { status: 500 })
  }

  const profileResult = await ensureAuthUserProfile(verifyData.user)

  if (!profileResult.ok) {
    return NextResponse.json({ error: profileResult.error }, { status: 500 })
  }

  return response
}
