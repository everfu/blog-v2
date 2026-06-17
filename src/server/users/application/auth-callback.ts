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

export async function syncAuthCallbackProfile(user: User) {
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
    github_username: readMetadataString(metadata, ['user_name', 'preferred_username', 'nickname']),
    display_name: readMetadataString(metadata, ['full_name', 'name', 'user_name']),
    avatar_url: readMetadataString(metadata, ['avatar_url', 'picture']),
  }

  if (!existingProfile && user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL) {
    profilePayload.role = 'admin'
  }

  const { error: profileError } = await admin.from('profiles').upsert(profilePayload, { onConflict: 'id' })

  if (profileError) {
    return { ok: false, error: 'profile' as const }
  }

  return { ok: true as const }
}

