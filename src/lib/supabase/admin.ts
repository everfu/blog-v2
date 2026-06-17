import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { requireSupabaseAdminConfig } from './config'

export function createAdminClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = requireSupabaseAdminConfig()

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      experimental: { passkey: true },
    },
  })
}
