import { createClient as supabaseCreateClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Create a Supabase client for browser/public usage.
 * Uses the anon key — respects RLS policies.
 */
export function createClient(url: string, anonKey: string) {
  return supabaseCreateClient<Database>(url, anonKey)
}

/**
 * Create a Supabase admin client for server-side usage.
 * Uses the service role key — bypasses RLS.
 * NEVER expose this to the client.
 */
export function createAdminClient(url: string, serviceRoleKey: string) {
  return supabaseCreateClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
