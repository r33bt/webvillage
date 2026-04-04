// packages/engine/src/adapters/findtraining.ts
// FindTraining-specific Supabase adapter (ft_ prefixed tables).
// Ported from 211-findtraining/apps/etomite-org/lib/ft/queries.ts
// Re-exported via supabase.ts for backwards compatibility.

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type {
  FtProvider,
  FtCategory,
  FtCourse,
  FtProviderWithCategories,
  FtClaim,
  SearchFilters,
} from '../types/ft'
import { PAGE_SIZE, TIER_ORDER } from '../types/ft'

// ── Service client (bypasses RLS) ─────────────────────────────────────────────
function createFtServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

async function createFtClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            )
          } catch { /* Server Components — safe to ignore */ }
        },
      },
    }
  )
}

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

  if (filters.category)    query = query.eq('ft_provider_categories.ft_categories.slug', filters.category)
  if (filters.state)       query = query.ilike('state', filters.state)
  if (filters.delivery)    query = query.contains('delivery_methods', [filters.delivery])
  if (filters.query)       query = query.ilike('name', `%${filters.query}%`)
  if (filters.country_code) query = query.eq('country_code', filters.country_code)

  query = query
    .order('featured', { ascending: false })
    .order('name', { ascending: true })
    .range(from, to)

  const { data, error, count } = await query
  if (error) throw new Error(`searchProviders: ${error.message}`)

  const providers = (data ?? []).map((row: Record<string, unknown>) => {
    const categoryRows = (row.ft_provider_categories as Array<{ ft_categories: { name: string } | null }>) ?? []
    const category_names = categoryRows.map((pc) => pc.ft_categories?.name).filter((n): n is string => Boolean(n))
    const { ft_provider_categories: _ignored, ...rest } = row
    void _ignored
    return { ...rest, category_names } as FtProviderWithCategories
  })

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

export async function getProviderStats(): Promise<{ total: number; withEmail: number; states: string[] }> {
  const supabase = await createFtClient()
  const { count: total, error: e1 } = await supabase
    .from('ft_providers').select('*', { count: 'exact', head: true })
    .not('profile_status', 'in', '("removed","opted_out")')
  if (e1) throw new Error(`getProviderStats: ${e1.message}`)

  const { count: withEmail, error: e2 } = await supabase
    .from('ft_providers').select('*', { count: 'exact', head: true })
    .not('profile_status', 'in', '("removed","opted_out")')
    .not('email', 'is', null)
  if (e2) throw new Error(`getProviderStats (email): ${e2.message}`)

  const { data: stateRows, error: e3 } = await supabase
    .from('ft_providers').select('state')
    .not('profile_status', 'in', '("removed","opted_out")')
    .not('state', 'is', null)
  if (e3) throw new Error(`getProviderStats (states): ${e3.message}`)

  const states = Array.from(new Set(
    (stateRows ?? []).map((r: { state: string | null }) => r.state).filter((s): s is string => Boolean(s))
  )).sort()

  return { total: total ?? 0, withEmail: withEmail ?? 0, states }
}

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

export interface ContactClick {
  id: string; provider_id: string; click_type: string; clicked_at: string
  visitor_page: string | null; country_code: string | null
}

export async function getContactClicksByProvider(
  supabaseClient: Awaited<ReturnType<typeof createFtClient>>,
  providerId: string,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}
): Promise<{ clicks: ContactClick[]; total: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabaseClient
    .from('ft_contact_clicks')
    .select('id, provider_id, click_type, clicked_at, visitor_page, country_code', { count: 'exact' })
    .eq('provider_id', providerId)
    .order('clicked_at', { ascending: false })
    .range(from, to)
  if (error) throw new Error(`getContactClicksByProvider: ${error.message}`)
  return { clicks: (data ?? []) as ContactClick[], total: count ?? 0 }
}

const FOUNDING_TOTAL_SLOTS = 30

export async function getFoundingMemberCount(
  supabaseClient?: Awaited<ReturnType<typeof createFtClient>>
): Promise<{ taken: number; total: number }> {
  const client = supabaseClient ?? (await createFtClient())
  const { count, error } = await client
    .from('ft_founding_members')
    .select('id', { count: 'exact', head: true })
    .in('status', ['active', 'prospect', 'contacted', 'interested', 'paid', 'onboarded'])
  if (error) {
    console.error('[getFoundingMemberCount]', error.message)
    return { taken: 0, total: FOUNDING_TOTAL_SLOTS }
  }
  return { taken: count ?? 0, total: FOUNDING_TOTAL_SLOTS }
}

export async function getAllProviderSlugs(): Promise<string[]> {
  const supabase = await createFtClient()
  const { data, error } = await supabase
    .from('ft_providers')
    .select('slug')
    .not('profile_status', 'in', '("removed","opted_out")')
  if (error) throw new Error(`getAllProviderSlugs: ${error.message}`)
  return (data ?? []).map((r: { slug: string }) => r.slug)
}

// ============================================================================
// PROVIDER ANALYTICS
// ============================================================================

export interface ProviderAnalytics {
  totalViews: number
  monthViews: number
  weekViews: number
  topClickType: string | null
  recentClicks: ContactClick[]
}

/**
 * Returns aggregated analytics for a single provider from ft_contact_clicks.
 * Accepts an already-authenticated supabase client so RLS is respected.
 */
export async function getProviderAnalytics(
  supabaseClient: Awaited<ReturnType<typeof createFtClient>>,
  providerId: string
): Promise<ProviderAnalytics> {
  // Fetch all clicks for this provider ordered newest first
  const { data: allClicks, error } = await supabaseClient
    .from('ft_contact_clicks')
    .select('id, provider_id, click_type, clicked_at, visitor_page, country_code')
    .eq('provider_id', providerId)
    .order('clicked_at', { ascending: false })

  if (error) throw new Error(`getProviderAnalytics: ${error.message}`)

  const clicks = (allClicks ?? []) as ContactClick[]
  const totalViews = clicks.length

  // Month views — start of current month in UTC
  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const monthViews = clicks.filter((c) => c.clicked_at >= startOfMonth).length

  // Week views — last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const weekViews = clicks.filter((c) => c.clicked_at >= sevenDaysAgo).length

  // Most common click type (mode)
  const freq: Record<string, number> = {}
  for (const c of clicks) {
    if (c.click_type) freq[c.click_type] = (freq[c.click_type] ?? 0) + 1
  }
  const topClickType =
    Object.keys(freq).length > 0
      ? (Object.entries(freq).sort(([, a], [, b]) => b - a)[0]![0] ?? null)
      : null

  // Recent 20 clicks for the activity table
  const recentClicks = clicks.slice(0, 20)

  return { totalViews, monthViews, weekViews, topClickType, recentClicks }
}

export async function getDistinctCountries(): Promise<string[]> {
  const supabase = await createFtClient()
  const { data, error } = await supabase
    .from('ft_providers')
    .select('country_code')
    .not('profile_status', 'in', '("removed","opted_out")')
    .not('country_code', 'is', null)
  if (error) throw new Error(`getDistinctCountries: ${error.message}`)
  const countries = Array.from(
    new Set((data ?? []).map((r: { country_code: string }) => r.country_code).filter(Boolean))
  ).sort() as string[]
  return countries
}

// ── Claims (admin) ────────────────────────────────────────────────────────────

/**
 * getAllClaims — returns all ft_claims with provider name, ordered by created_at DESC.
 * Uses service role key to bypass RLS.
 */
export async function getAllClaims(): Promise<FtClaim[]> {
  const supabase = createFtServiceClient()

  // Supabase JS client doesn't support raw JOIN queries, so we do a nested select
  const { data, error } = await supabase
    .from('ft_claims')
    .select(`
      id,
      provider_id,
      email,
      status,
      verification_method,
      notes,
      created_at,
      ft_providers (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getAllClaims: ${error.message}`)

  return (data ?? []).map((row: Record<string, unknown>) => {
    const providerRow = row.ft_providers as { name: string } | null
    const { ft_providers: _ignored, ...rest } = row
    void _ignored
    return {
      ...rest,
      provider_name: providerRow?.name ?? null,
    } as FtClaim
  })
}
