import type { ProfileRole } from '@/types/supabase'

export interface AdminUser {
  id: string
  email: string | null
  githubUsername: string | null
  displayName: string | null
  avatarUrl: string | null
  role: ProfileRole
  createdAt: string | null
  lastSignInAt: string | null
}
