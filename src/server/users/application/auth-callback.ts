import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import type { Database } from '@/types/supabase'

const BOOTSTRAP_ADMIN_EMAIL = 'o@everfu.org'

function readMetadataString(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return null
}

function assignIfPresent<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | null
) {
  if (value !== null) target[key] = value
}

export async function ensureAuthUserProfile(user: User) {
  if (!isSupabaseAdminConfigured) {
    return { ok: false, error: 'profile-config' as const }
  }

  const metadata = user.user_metadata ?? {}
  const admin = createAdminClient()
  const { data: existingProfile, error: existingProfileError } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existingProfileError) {
    return { ok: false, error: 'profile' as const }
  }

  const profilePayload: Database['public']['Tables']['profiles']['Insert'] = {
    id: user.id,
  }

  assignIfPresent(profilePayload, 'github_username', readMetadataString(metadata, ['user_name', 'preferred_username', 'nickname']))
  assignIfPresent(profilePayload, 'display_name', readMetadataString(metadata, ['full_name', 'name', 'user_name']))
  assignIfPresent(profilePayload, 'avatar_url', readMetadataString(metadata, ['avatar_url', 'picture']))

  if (user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL) {
    profilePayload.role = 'admin'
  }

  const { error: profileError } = await admin.from('profiles').upsert(profilePayload, { onConflict: 'id' })

  if (profileError) {
    return { ok: false, error: 'profile' as const }
  }

  return { ok: true as const }
}

export async function syncAuthCallbackProfile(user: User) {
  return ensureAuthUserProfile(user)
}
