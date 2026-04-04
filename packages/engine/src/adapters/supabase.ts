// packages/engine/src/adapters/supabase.ts
// Supabase data adapter for @webvillage/engine
// Ported from 211-findtraining/apps/etomite-org/lib/ft/queries.ts
//
// Usage: import from '@webvillage/engine/adapters/supabase' in any Next.js app
// that uses the engine with a Supabase data backend.

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type {
  FtProvider,
  FtCategory,
  FtCourse,
  FtProviderWithCategories,
  SearchFilters,
} from '../types/ft'
import { PAGE_SIZE, TIER_ORDER } from '../types/ft'

// ---------------------------------------------------------------------------
// Supabase client factory
// ---------------------------------------------------------------------------

async function createFtClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            })
          } catch {
            // Called from Server Components — safe to ignore
          }
        },
      },
    }
  )
}

// ---------------------------------------------------------------------------
// Provider queries
// ---------------------------------------------------------------------------

export async function getProviderBySlug(slug: string): Promise<FtProvider | null> {
  const supabase = await createFtClient()

  const { data, error } = await supabase
    .from('ft_providers')
    .select('*')
    .eq('slug', slug)
    .not('profile_status', 'in', '("removed","opted_out")')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getProviderBySlug: ${error.message}`)
  }

  return data as FtProvider
}

export async function searchProviders(
  filters: SearchFilters
): Promise<{ providers: FtProviderWithCategories[]; total: number }> {
  const supabase = await createFtClient()
  const page = filters.page ?? 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const categoryJoin = filters.category
    ? 'ft_provider_categories!inner(ft_categories(name,slug))'
    : 'ft_provider_categories(ft_categories(name,slug))'

  let query = supabase
    .from('ft_providers')
    .select(`*, ${categoryJoin}`, { count: 'exact' })
    .not('profile_status', 'in', '("removed","opted_out")')

  if (filters.category) {
    query = query.eq('ft_provider_categories.ft_categories.slug', filters.category)
  }
  if (filters.state) {
    query = query.ilike('state', filters.state)
  }
  if (filters.delivery) {
    query = query.contains('delivery_methods', [filters.delivery])
  }
  if (filters.query) {
    query = query.ilike('name', `%${filters.query}%`)
  }

  query = query
    .order('featured', { ascending: false })
    .order('name', { ascending: true })
    .range(from, to)

  const { data, error, count } = await query

  if (error) throw new Error(`searchProviders: ${error.message}`)

  const providers = (data ?? []).map((row: Record<string, unknown>) => {
    const categoryRows =
      (row.ft_provider_categories as Array<{ ft_categories: { name: string } | null }>) ?? []
    const category_names = categoryRows
      .map((pc) => pc.ft_categories?.name)
      .filter((n): n is string => Boolean(n))

    const { ft_provider_categories: _ignored, ...rest } = row
    void _ignored
    return { ...rest, category_names } as FtProviderWithCategories
  })

  // Client-side tier sort: pro > founding > starter > free
  providers.sort((a, b) => {
    const ta = TIER_ORDER[a.tier] ?? 0
    const tb = TIER_ORDER[b.tier] ?? 0
    if (tb !== ta) return tb - ta
    if (b.featured !== a.featured) return b.featured ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  return { providers, total: count ?? 0 }
}

export async function getFeaturedProviders(limit = 6): Promise<FtProvider[]> {
  const supabase = await createFtClient()

  const { data, error } = await supabase
    .from('ft_providers')
    .select('*')
    .in('tier', ['pro', 'founding'])
    .eq('profile_status', 'claimed')
    .order('featured', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`getFeaturedProviders: ${error.message}`)

  return (data ?? []) as FtProvider[]
}

// ---------------------------------------------------------------------------
// Category queries
// ---------------------------------------------------------------------------

export async function getAllCategories(): Promise<FtCategory[]> {
  const supabase = await createFtClient()

  const { data, error } = await supabase
    .from('ft_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) throw new Error(`getAllCategories: ${error.message}`)

  return (data ?? []) as FtCategory[]
}

export async function getCategoryBySlug(slug: string): Promise<FtCategory | null> {
  const supabase = await createFtClient()

  const { data, error } = await supabase
    .from('ft_categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getCategoryBySlug: ${error.message}`)
  }

  return data as FtCategory
}

export async function getProvidersByCategory(
  categorySlug: string,
  filters: SearchFilters
): Promise<{ providers: FtProviderWithCategories[]; total: number }> {
  return searchProviders({ ...filters, category: categorySlug })
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function getProviderStats(): Promise<{
  total: number
  withEmail: number
  states: string[]
}> {
  const supabase = await createFtClient()

  const { count: total, error: totalError } = await supabase
    .from('ft_providers')
    .select('*', { count: 'exact', head: true })
    .not('profile_status', 'in', '("removed","opted_out")')

  if (totalError) throw new Error(`getProviderStats (total): ${totalError.message}`)

  const { count: withEmail, error: emailError } = await supabase
    .from('ft_providers')
    .select('*', { count: 'exact', head: true })
    .not('profile_status', 'in', '("removed","opted_out")')
    .not('email', 'is', null)

  if (emailError) throw new Error(`getProviderStats (email): ${emailError.message}`)

  const { data: stateRows, error: stateError } = await supabase
    .from('ft_providers')
    .select('state')
    .not('profile_status', 'in', '("removed","opted_out")')
    .not('state', 'is', null)

  if (stateError) throw new Error(`getProviderStats (states): ${stateError.message}`)

  const states = Array.from(
    new Set(
      (stateRows ?? [])
        .map((r: { state: string | null }) => r.state)
        .filter((s): s is string => Boolean(s))
    )
  ).sort()

  return { total: total ?? 0, withEmail: withEmail ?? 0, states }
}

// ---------------------------------------------------------------------------
// Course queries
// ---------------------------------------------------------------------------

export async function getCoursesByProvider(providerId: string): Promise<FtCourse[]> {
  const supabase = await createFtClient()

  const { data, error } = await supabase
    .from('ft_courses')
    .select('*')
    .eq('provider_id', providerId)
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`getCoursesByProvider: ${error.message}`)

  return (data ?? []) as FtCourse[]
}

// ---------------------------------------------------------------------------
// Contact click queries (dashboard/leads)
// ---------------------------------------------------------------------------

export interface ContactClick {
  id: string
  provider_id: string
  click_type: string
  clicked_at: string
  visitor_page: string | null
  country_code: string | null
}

/**
 * Fetch contact clicks for a given provider (used in /dashboard/leads).
 * Caller must ensure providerId belongs to the authenticated user.
 * Accepts any Supabase SSR client instance (anon key, service key, etc).
 */
export async function getContactClicksByProvider(
  supabaseClient: ReturnType<typeof createServerClient>,
  providerId: string,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}
): Promise<{ clicks: ContactClick[]; total: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabaseClient
    .from('ft_contact_clicks')
    .select('id, provider_id, click_type, clicked_at, visitor_page, country_code', {
      count: 'exact',
    })
    .eq('provider_id', providerId)
    .order('clicked_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`getContactClicksByProvider: ${error.message}`)

  return {
    clicks: (data ?? []) as ContactClick[],
    total: count ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Founding member helpers
// ---------------------------------------------------------------------------

const FOUNDING_TOTAL_SLOTS = 30

/**
 * Returns the number of taken founding slots and the total available.
 * Counts rows where status IN ('active', 'prospect', 'contacted', 'interested', 'paid', 'onboarded').
 * Used by /founding page to display dynamic slot counter.
 */
export async function getFoundingMemberCount(
  supabaseClient?: Awaited<ReturnType<typeof createFtClient>>
): Promise<{ taken: number; total: number }> {
  const client = supabaseClient ?? (await createFtClient())

  const { count, error } = await client
    .from('ft_founding_members')
    .select('id', { count: 'exact', head: true })
    .in('status', ['active', 'prospect', 'contacted', 'interested', 'paid', 'onboarded'])

  if (error) {
    console.error('[getFoundingMemberCount] error:', error.message)
    return { taken: 0, total: FOUNDING_TOTAL_SLOTS }
  }

  return { taken: count ?? 0, total: FOUNDING_TOTAL_SLOTS }
}

// ---------------------------------------------------------------------------
// Sitemap helpers
// ---------------------------------------------------------------------------

/**
 * Get all provider slugs for sitemap generation.
 */
export async function getAllProviderSlugs(): Promise<string[]> {
  const supabase = await createFtClient()

  const { data, error } = await supabase
    .from('ft_providers')
    .select('slug')
    .not('profile_status', 'in', '("removed","opted_out")')

  if (error) throw new Error(`getAllProviderSlugs: ${error.message}`)

  return (data ?? []).map((r: { slug: string }) => r.slug)
}
