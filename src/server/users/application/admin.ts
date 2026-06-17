import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseAdminConfigured } from '@/lib/supabase/config'
import type { Database, ProfileRole } from '@/types/supabase'
import type { AdminUser } from '../contracts/types'

type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'github_username' | 'display_name' | 'avatar_url' | 'role'
>

function readMetadataString(metadata: User['user_metadata'], keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return null
}

function mapAdminUser(user: User, profile?: ProfileRow): AdminUser {
  return {
    id: user.id,
    email: user.email ?? null,
    githubUsername: profile?.github_username ?? readMetadataString(user.user_metadata, ['user_name', 'preferred_username', 'nickname']),
    displayName: profile?.display_name ?? readMetadataString(user.user_metadata, ['full_name', 'name', 'user_name']),
    avatarUrl: profile?.avatar_url ?? readMetadataString(user.user_metadata, ['avatar_url', 'picture']),
    role: profile?.role ?? 'user',
    createdAt: user.created_at ?? null,
    lastSignInAt: user.last_sign_in_at ?? null,
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  if (!isSupabaseAdminConfigured) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  })

  if (error || !data?.users.length) return []

  const ids = data.users.map(user => user.id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, github_username, display_name, avatar_url, role')
    .in('id', ids)

  const profilesById = new Map((profiles || []).map(profile => [profile.id, profile]))

  return data.users
    .map(user => mapAdminUser(user, profilesById.get(user.id)))
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === 'admin' ? -1 : 1
      return (a.email || a.githubUsername || a.id).localeCompare(b.email || b.githubUsername || b.id)
    })
}

export const profileRoles = ['admin', 'user'] as const satisfies readonly ProfileRole[]
