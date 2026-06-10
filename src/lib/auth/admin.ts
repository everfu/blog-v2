import type { SupabaseClient, User } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/supabase/config'
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
  if (profile.role !== 'admin') return null

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
  supabase: SupabaseClient<Database>,
  user: User | null
) {
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, github_username, display_name, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) return null

  return toCurrentAdmin(user, profile)
}

export async function getCurrentAdmin() {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) return null

  return getAdminFromUser(supabase, data.user)
}
