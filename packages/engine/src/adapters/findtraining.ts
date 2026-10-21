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
import { PAGE_SIZE } from '../types/ft'

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

type SearchResult = { providers: FtProviderWithCategories[]; total: number }
type FtClient = Awaited<ReturnType<typeof createFtClient>>

function toProviderWithCategories(row: Record<string, unknown>): FtProviderWithCategories {
  const categoryRows = (row.ft_provider_categories as Array<{ ft_categories: { name: string } | null }>) ?? []
  const category_names = categoryRows.map((pc) => pc.ft_categories?.name).filter((n): n is string => Boolean(n))
  const { ft_provider_categories: _ignored, ...rest } = row
  void _ignored
  return { ...rest, category_names } as FtProviderWithCategories
}

// Block PostgREST or() syntax chars: , . ( ) * %  (% is our wildcard)
function searchTokens(raw: string | undefined): { clean: string; tokens: string[] } {
  const clean = (raw ?? '').trim().replace(/[,.()*%]/g, ' ').trim()
  return { clean, tokens: clean.split(/\s+/).filter((t) => t.length >= 2) }
}

/**
 * FT-GAP-25 ranked search via the ft_search_providers_ranked RPC
 * (supabase/migrations/20261021000002_ft_search_providers_ranked.sql): name matches first,
 * then description/state matches, then a category fallback when no name matched.
 * Returns null when the RPC errors (e.g. migration not applied) so the caller falls back
 * to the name-sorted query.
 */
async function rankedSearch(
  supabase: FtClient,
  filters: SearchFilters,
  query: string,
  from: number,
): Promise<SearchResult | null> {
  const args = {
    p_query: query,
    p_country_code: filters.country_code ? filters.country_code.trim().toUpperCase() : null,
    p_state: filters.state ?? null,
    p_delivery: filters.delivery ?? null,
    p_category: filters.category ?? null,
  }
  try {
    const { data, error } = await supabase.rpc('ft_search_providers_ranked', {
      ...args,
      p_limit: PAGE_SIZE,
      p_offset: from,
    })
    if (error) {
      console.warn(`searchProviders: ranked search unavailable, using name order (${error.message})`)
      return null
    }
    const hits = (data ?? []) as Array<{ provider_id: string; search_rank: number; total_count: number }>

    if (hits.length === 0) {
      if (from === 0) return { providers: [], total: 0 }
      // Past the last page: still report the real total.
      const { data: first, error: firstError } = await supabase.rpc('ft_search_providers_ranked', {
        ...args,
        p_limit: 1,
        p_offset: 0,
      })
      if (firstError) return null
      const total = Number((first as Array<{ total_count: number }> | null)?.[0]?.total_count ?? 0)
      return { providers: [], total }
    }

    const ids = hits.map((h) => h.provider_id)
    const { data: rows, error: rowsError } = await supabase
      .from('ft_providers')
      .select('*, ft_provider_categories(ft_categories(name,slug))')
      .in('id', ids)
      .not('profile_status', 'in', '("removed","opted_out")')
    if (rowsError) {
      console.warn(`searchProviders: ranked rows fetch failed, using name order (${rowsError.message})`)
      return null
    }
    const byId = new Map((rows ?? []).map((row: Record<string, unknown>) => [row.id as string, row]))
    const providers = ids
      .map((id) => byId.get(id))
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map(toProviderWithCategories)
    return { providers, total: Number(hits[0].total_count) }
  } catch (err) {
    console.warn(`searchProviders: ranked search threw, using name order (${err instanceof Error ? err.message : String(err)})`)
    return null
  }
}

export async function searchProviders(
  filters: SearchFilters
): Promise<SearchResult> {
  const supabase = await createFtClient()
  const page = filters.page ?? 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { clean: cleanQuery, tokens } = searchTokens(filters.query)
  // The ranked RPC takes one state value, so a multi-form region filter uses the name-sorted query.
  if (tokens.length > 0 && !filters.stateIn?.length) {
    const ranked = await rankedSearch(supabase, filters, cleanQuery, from)
    if (ranked) return ranked
  }

  const categoryJoin = filters.category
    ? 'ft_provider_categories!inner(ft_categories(name,slug))'
    : 'ft_provider_categories(ft_categories(name,slug))'

  let query = supabase
    .from('ft_providers')
    .select(`*, ${categoryJoin}`, { count: 'exact' })
    .not('profile_status', 'in', '("removed","opted_out")')

  if (filters.category)    query = query.eq('ft_provider_categories.ft_categories.slug', filters.category)
  if (filters.state)       query = query.ilike('state', filters.state)
  if (filters.stateIn?.length) {
    // Case-insensitive exact match on any form. Forms with LIKE wildcards or quotes are dropped;
    // the rest are double-quoted so dots, commas and brackets do not break the or() syntax.
    const forms = filters.stateIn.filter((f) => f.trim() && !/[%_*"\\]/.test(f))
    query = forms.length
      ? query.or(forms.map((f) => `state.ilike."${f}"`).join(','))
      : query.is('id', null) // no usable form: match nothing (id is never null)
  }
  if (filters.delivery)    query = query.contains('delivery_methods', [filters.delivery])
  // Fallback / no-query path: the original name-sorted match.
  if (tokens.length > 0) {
    if (tokens.length === 1) {
      // Single-token: name OR state OR description
      const t = tokens[0]
      query = query.or(`name.ilike.%${t}%,state.ilike.%${t}%,description.ilike.%${t}%`)
    } else if (tokens.length > 1) {
      // Multi-token: every token must appear in name OR state OR description
      // (AND of per-token ORs — Supabase chains .or() as AND)
      for (const t of tokens) {
        query = query.or(`name.ilike.%${t}%,state.ilike.%${t}%,description.ilike.%${t}%`)
      }
    }
  }
  // country_code is stored upper case (MY, AU); ?country=au must match too
  if (filters.country_code) query = query.eq('country_code', filters.country_code.trim().toUpperCase())

  // Fallback order is by name only (the ranked RPC orders by match quality, then name).
  // Paid tier and the featured flag never change
  // the order of search results; paid placements are shown separately and
  // labelled "Sponsored" (see getFeaturedProviders / CountryPage).
  query = query
    .order('name', { ascending: true })
    .range(from, to)

  const { data, error, count } = await query
  if (error) throw new Error(`searchProviders: ${error.message}`)

  const providers = (data ?? []).map((row: Record<string, unknown>) => toProviderWithCategories(row))

  return { providers, total: count ?? 0 }
}

export async function getFeaturedProviders(limit = 6, countryCode?: string): Promise<FtProvider[]> {
  const supabase = await createFtClient()
  let query = supabase
    .from('ft_providers')
    .select('*')
    .in('tier', ['pro', 'founding'])
    .eq('profile_status', 'claimed')
    .order('featured', { ascending: false })
    .limit(limit)
  if (countryCode) query = query.eq('country_code', countryCode)
  const { data, error } = await query
  if (error) throw new Error(`getFeaturedProviders: ${error.message}`)
  return (data ?? []) as FtProvider[]
}

export async function getCountryStats(countryCode: string): Promise<{ total: number; states: string[] }> {
  const supabase = await createFtClient()
  const [countRes, stateRes] = await Promise.all([
    supabase
      .from('ft_providers')
      .select('*', { count: 'exact', head: true })
      .eq('country_code', countryCode)
      .not('profile_status', 'in', '("removed","opted_out")'),
    // FT-GAP-6: paged, so states held only by rows past the first 1,000 are not dropped.
    (async () => {
      const PAGE = 1000
      const rows: Array<{ state: string | null }> = []
      for (let from = 0; ; from += PAGE) {
        const { data, error } = await supabase
          .from('ft_providers')
          .select('state')
          .eq('country_code', countryCode)
          .not('profile_status', 'in', '("removed","opted_out")')
          .not('state', 'is', null)
          .order('id', { ascending: true })
          .range(from, from + PAGE - 1)
        if (error) return { data: null, error }
        rows.push(...((data ?? []) as Array<{ state: string | null }>))
        if (!data || data.length < PAGE) return { data: rows, error: null }
      }
    })(),
  ])
  if (countRes.error) throw new Error(`getCountryStats(total): ${countRes.error.message}`)
  if (stateRes.error) throw new Error(`getCountryStats(states): ${stateRes.error.message}`)
  const states = Array.from(new Set(
    (stateRes.data ?? []).map((r: { state: string | null }) => r.state).filter((s): s is string => Boolean(s))
  )).sort()
  return { total: countRes.count ?? 0, states }
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

// ============================================================================
// ENQUIRIES
// ============================================================================

export interface FtEnquiry {
  id: string
  provider_id: string
  enquirer_name: string
  enquirer_email: string
  enquirer_company: string | null
  training_need: string
  headcount: number | null
  budget_range: string | null
  preferred_dates: string | null
  message: string | null
  status: string
  created_at: string
}

export async function submitEnquiry(data: {
  provider_id: string
  enquirer_name: string
  enquirer_email: string
  enquirer_company?: string
  training_need: string
  headcount?: number
  budget_range?: string
  preferred_dates?: string
  message?: string
}): Promise<{ id: string }> {
  const supabase = createFtServiceClient()
  const { data: row, error } = await supabase
    .from('ft_enquiries')
    .insert({
      provider_id: data.provider_id,
      enquirer_name: data.enquirer_name,
      enquirer_email: data.enquirer_email,
      enquirer_company: data.enquirer_company ?? null,
      training_need: data.training_need,
      headcount: data.headcount ?? null,
      budget_range: data.budget_range ?? null,
      preferred_dates: data.preferred_dates ?? null,
      message: data.message ?? null,
    })
    .select('id')
    .single()
  if (error) throw new Error(`submitEnquiry: ${error.message}`)
  return { id: (row as { id: string }).id }
}

export async function getEnquiriesByProvider(
  supabaseClient: Awaited<ReturnType<typeof createFtClient>>,
  providerId: string,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {}
): Promise<{ enquiries: FtEnquiry[]; total: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabaseClient
    .from('ft_enquiries')
    .select('*', { count: 'exact' })
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw new Error(`getEnquiriesByProvider: ${error.message}`)
  return { enquiries: (data ?? []) as FtEnquiry[], total: count ?? 0 }
}

export async function getCategoryCountsByCountry(
  countryCode: string
): Promise<Record<string, number>> {
  const supabase = await createFtClient()
  // !inner join filters to only rows where the provider is in this country.
  // profile_status excluded from filter — removed/opted_out are <1% of rows,
  // and the count is a trust signal (approximate is fine).
  const { data, error } = await supabase
    .from('ft_provider_categories')
    .select('category_id, ft_providers!inner(country_code)')
    .eq('ft_providers.country_code', countryCode)
  if (error) {
    console.error('[getCategoryCountsByCountry]', error.message)
    return {} // graceful fallback — category cards render without counts
  }
  const counts: Record<string, number> = {}
  for (const row of (data ?? []) as { category_id: string }[]) {
    counts[row.category_id] = (counts[row.category_id] ?? 0) + 1
  }
  return counts
}

export async function getRelatedProviders(
  providerId: string,
  categories: string[],
  limit = 4
): Promise<FtProvider[]> {
  if (categories.length === 0) return []
  const supabase = await createFtClient()
  const { data, error } = await supabase
    .from('ft_providers')
    .select('*')
    .overlaps('categories', categories)
    .neq('id', providerId)
    .not('profile_status', 'in', '("removed","opted_out")')
    .order('name', { ascending: true })
    .limit(limit)
  if (error) {
    console.error('[getRelatedProviders]', error.message)
    return []
  }
  return (data ?? []) as FtProvider[]
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
