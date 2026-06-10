import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

function parseList(value?: string) {
  return (value || '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminUser(user: User | null) {
  if (!user) return false

  const githubUsernames = parseList(process.env.ADMIN_GITHUB_USERNAMES)
  const adminEmails = parseList(process.env.ADMIN_EMAILS)
  const githubUsername = String(user.user_metadata?.user_name || '').toLowerCase()
  const email = (user.email || '').toLowerCase()

  return (
    (githubUsername && githubUsernames.includes(githubUsername)) ||
    (email && adminEmails.includes(email))
  )
}

export async function getCurrentAdmin() {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  return isAdminUser(data.user) ? data.user : null
}
