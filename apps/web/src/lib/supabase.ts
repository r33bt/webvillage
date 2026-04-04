// apps/web/src/lib/supabase.ts
// Supabase SSR client factory for webvillage.com (Next.js 15 App Router)

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@webvillage/db'

/**
 * Server Component / Route Handler client (respects RLS via user cookies)
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch { /* Server Components — safe to ignore */ }
        },
      },
    }
  )
}

/**
 * Service role client — bypasses RLS.
 * Use ONLY in Route Handlers that have verified auth (API key or session).
 */
export function createSupabaseServiceClient() {
  // Uses untyped client until wv_* tables are added to @webvillage/db schema
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
