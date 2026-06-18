export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && supabaseServiceRoleKey
)

export function normalizeAdminEmail(value: string | null | undefined) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return email || null
}

export const adminEmail = normalizeAdminEmail(process.env.ADMIN_EMAIL)
export const isAdminEmailConfigured = Boolean(adminEmail)

export function isAdminEmail(value: string | null | undefined) {
  if (!adminEmail) return false
  return normalizeAdminEmail(value) === adminEmail
}

export function requireAdminEmail() {
  if (!adminEmail) {
    throw new Error('Missing ADMIN_EMAIL')
  }

  return adminEmail
}

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export function requireSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}

export function requireSupabaseAdminConfig() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return {
    supabaseUrl,
    supabaseServiceRoleKey,
  }
}
