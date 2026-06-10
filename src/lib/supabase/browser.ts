'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { requireSupabaseConfig } from './config'

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabaseConfig()

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
