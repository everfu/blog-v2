import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'github_username' | 'display_name' | 'avatar_url' | 'role'
>

export interface CurrentAdmin {
  id: string
  email: string | null
  githubUsername: string | null
  displayName: string | null
  avatarUrl: string | null
  user: User
  profile: ProfileRow
}

export function toCurrentAdmin(user: User, profile: ProfileRow): CurrentAdmin | null {
  return {
    id: user.id,
    email: user.email ?? null,
    githubUsername: profile.github_username,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    user,
    profile,
  }
}

export async function getAdminFromUser(
  user: User | null
) {
  if (!user) return null
  if (!isSupabaseAdminConfigured) return null

  // The database is the source of truth: an account is admin iff it owns a
  // profile row with role='admin'. ADMIN_EMAIL only gates who can be promoted
  // (see ensureAuthUserProfile), so a missing/changed env var can never lock
  // an already-provisioned admin out.
  const admin = createAdminClient()
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, github_username, display_name, avatar_url, role')
    .eq('id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (error || !profile) return null

  return toCurrentAdmin(user, profile)
}

export async function getCurrentAdmin() {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) return null

  return getAdminFromUser(data.user)
}
