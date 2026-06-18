import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  adminEmail,
  isAdminEmail,
  isSupabaseAdminConfigured,
} from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'

export type AdminPasskeyState = {
  userId: string | null
  passkeyCount: number
}

/**
 * Look up the single admin account (by ADMIN_EMAIL) and how many passkeys it
 * has. Reads auth schema via a SECURITY DEFINER function, so it needs the
 * service role. Returns { userId: null } when the user does not exist yet.
 */
export async function getAdminPasskeyState(): Promise<
  | { ok: true, state: AdminPasskeyState }
  | { ok: false, error: 'profile-config' | 'admin-email' | 'state' }
> {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, error: 'profile-config' }
  }

  if (!adminEmail) {
    return { ok: false, error: 'admin-email' }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('admin_passkey_state', { p_email: adminEmail })

  if (error) {
    return { ok: false, error: 'state' }
  }

  const row = Array.isArray(data) ? data[0] : null

  return {
    ok: true,
    state: {
      userId: row?.user_id ?? null,
      passkeyCount: Number(row?.passkey_count ?? 0),
    },
  }
}

/**
 * Ensure the authenticated user is the configured admin and owns an
 * admin profile row. Only the ADMIN_EMAIL account is ever promoted.
 */
export async function ensureAuthUserProfile(user: User) {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, error: 'profile-config' as const }
  }

  if (!isAdminEmail(user.email)) {
    return { ok: false, error: 'forbidden' as const }
  }

  const admin = createAdminClient()
  const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
    id: user.id,
    role: 'admin',
  }

  const { error: profileError } = await admin
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' })

  if (profileError) {
    return { ok: false, error: 'profile' as const }
  }

  return { ok: true as const }
}
