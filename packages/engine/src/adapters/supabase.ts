// packages/engine/src/adapters/supabase.ts
// Generic wv_ Supabase adapter for the WebVillage directory network.
// All queries are scoped by directory_id — this is the multi-tenancy key.
//
// Usage (in any Next.js app or API route):
//   import { createWvClient, getDirectory, searchListings } from '@webvillage/engine/adapters/supabase'

import { createClient } from '@supabase/supabase-js'
import type {
  WvDirectory,
  WvCategory,
  WvListing,
  WvListingWithCategories,
  WvListingSearchParams,
  WvPaginatedResponse,
  WvSyncLog,
} from '../types/wv'
import { WV_PAGE_SIZE, WV_MAX_PAGE_SIZE, WV_LISTING_TIER_ORDER } from '../types/wv'

// ============================================================================
// CLIENT FACTORY
// ============================================================================

/**
 * Creates an anonymous Supabase client using env vars.
 * For server-side use — never expose the service key client to the browser.
 */
export function createWvClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, key)
}

/**
 * Creates a service-role Supabase client (bypasses RLS).
 * Use ONLY in server-side API routes that have already verified auth.
 */
export function createWvServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ============================================================================
// DIRECTORY QUERIES
// ============================================================================

export async function getDirectory(slug: string): Promise<WvDirectory | null> {
  const supabase = createWvClient()
  const { data, error } = await supabase
    .from('wv_directories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getDirectory: ${error.message}`)
  }
  return data as WvDirectory
}

export async function getDirectoryById(id: string): Promise<WvDirectory | null> {
  const supabase = createWvClient()
  const { data, error } = await supabase
    .from('wv_directories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getDirectoryById: ${error.message}`)
  }
  return data as WvDirectory
}

export async function getAllDirectories(networkOnly = true): Promise<WvDirectory[]> {
  const supabase = createWvClient()
  let query = supabase.from('wv_directories').select('*')
  if (networkOnly) query = query.eq('network_opt_in', true)
  const { data, error } = await query.order('name', { ascending: true })
  if (error) throw new Error(`getAllDirectories: ${error.message}`)
  return (data ?? []) as WvDirectory[]
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export async function getCategories(directoryId: string): Promise<WvCategory[]> {
  const supabase = createWvClient()
  const { data, error } = await supabase
    .from('wv_categories')
    .select('*')
    .eq('directory_id', directoryId)
    .eq('active', true)
    .order('display_order', { ascending: true })

  if (error) throw new Error(`getCategories: ${error.message}`)
  return (data ?? []) as WvCategory[]
}

export async function getCategoryBySlug(
  directoryId: string,
  slug: string
): Promise<WvCategory | null> {
  const supabase = createWvClient()
  const { data, error } = await supabase
    .from('wv_categories')
    .select('*')
    .eq('directory_id', directoryId)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getCategoryBySlug: ${error.message}`)
  }
  return data as WvCategory
}

// ============================================================================
// LISTING QUERIES
// ============================================================================

export async function getListingBySlug(
  directoryId: string,
  slug: string
): Promise<WvListingWithCategories | null> {
  const supabase = createWvClient()

  const { data, error } = await supabase
    .from('wv_listings')
    .select(`
      *,
      wv_listing_categories (
        wv_categories ( name, slug )
      )
    `)
    .eq('directory_id', directoryId)
    .eq('slug', slug)
    .not('profile_status', 'in', '("removed","opted_out")')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getListingBySlug: ${error.message}`)
  }

  return normaliseListingWithCategories(data)
}

export async function getListingById(id: string): Promise<WvListingWithCategories | null> {
  const supabase = createWvClient()

  const { data, error } = await supabase
    .from('wv_listings')
    .select(`
      *,
      wv_listing_categories (
        wv_categories ( name, slug )
      )
    `)
    .eq('id', id)
    .not('profile_status', 'in', '("removed","opted_out")')
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getListingById: ${error.message}`)
  }

  return normaliseListingWithCategories(data)
}

export async function searchListings(
  directoryId: string,
  params: WvListingSearchParams
): Promise<WvPaginatedResponse<WvListingWithCategories>> {
  const supabase = createWvClient()

  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(params.limit ?? WV_PAGE_SIZE, WV_MAX_PAGE_SIZE)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const hasCategory = Boolean(params.category)
  const categoryJoin = hasCategory
    ? 'wv_listing_categories!inner ( wv_categories ( name, slug ) )'
    : 'wv_listing_categories ( wv_categories ( name, slug ) )'

  let query = supabase
    .from('wv_listings')
    .select(`*, ${categoryJoin}`, { count: 'exact' })
    .eq('directory_id', directoryId)
    .not('profile_status', 'in', '("removed","opted_out")')

  if (params.category) {
    query = query.eq('wv_listing_categories.wv_categories.slug', params.category)
  }
  if (params.country) {
    query = query.eq('country', params.country)
  }
  if (params.sector) {
    query = query.contains('trade_sectors', [params.sector])
  }
  if (params.featured !== undefined) {
    query = query.eq('featured', params.featured)
  }
  if (params.q) {
    // Postgres full-text search on name + tagline + description
    query = query.textSearch(
      'name',  // Supabase textSearch works on a column — use ilike for multi-field
      params.q,
      { type: 'plain', config: 'english' }
    )
  }

  query = query
    .order('featured', { ascending: false })
    .order('name', { ascending: true })
    .range(from, to)

  const { data, error, count } = await query
  if (error) throw new Error(`searchListings: ${error.message}`)

  const listings = (data ?? []).map(normaliseListingWithCategories)

  // Client-side tier sort within each page
  listings.sort((a: WvListingWithCategories, b: WvListingWithCategories) => {
    const ta = WV_LISTING_TIER_ORDER[a.tier] ?? 0
    const tb = WV_LISTING_TIER_ORDER[b.tier] ?? 0
    if (tb !== ta) return tb - ta
    if (b.featured !== a.featured) return b.featured ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  const total = count ?? 0
  return {
    data: listings,
    total,
    page,
    limit,
    has_more: from + listings.length < total,
  }
}

export async function getFeaturedListings(
  directoryId: string,
  limit = 6
): Promise<WvListingWithCategories[]> {
  const supabase = createWvClient()

  const { data, error } = await supabase
    .from('wv_listings')
    .select(`
      *,
      wv_listing_categories ( wv_categories ( name, slug ) )
    `)
    .eq('directory_id', directoryId)
    .eq('featured', true)
    .not('profile_status', 'in', '("removed","opted_out")')
    .order('name', { ascending: true })
    .limit(limit)

  if (error) throw new Error(`getFeaturedListings: ${error.message}`)
  return (data ?? []).map(normaliseListingWithCategories)
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function recordContactClick(
  listingId: string,
  directoryId: string,
  clickType: string,
  meta: { visitor_page?: string; country_code?: string } = {}
): Promise<void> {
  const supabase = createWvClient()
  await supabase.from('wv_contact_clicks').insert({
    listing_id: listingId,
    directory_id: directoryId,
    click_type: clickType as 'email' | 'phone' | 'website' | 'linkedin' | 'directions',
    visitor_page: meta.visitor_page ?? null,
    country_code: meta.country_code ?? null,
  })
}

// ============================================================================
// DIRECTORY STATS
// ============================================================================

export interface WvDirectoryStats {
  listing_count: number
  category_count: number
  claimed_count: number
  featured_count: number
  countries: string[]
  top_sectors: string[]
}

export async function getDirectoryStats(directoryId: string): Promise<WvDirectoryStats> {
  const supabase = createWvClient()

  const [dirResult, catResult, claimedResult, featuredResult, countryResult, sectorResult] =
    await Promise.all([
      supabase
        .from('wv_directories')
        .select('listing_count')
        .eq('id', directoryId)
        .single(),
      supabase
        .from('wv_categories')
        .select('id', { count: 'exact', head: true })
        .eq('directory_id', directoryId)
        .eq('active', true),
      supabase
        .from('wv_listings')
        .select('id', { count: 'exact', head: true })
        .eq('directory_id', directoryId)
        .eq('profile_status', 'claimed'),
      supabase
        .from('wv_listings')
        .select('id', { count: 'exact', head: true })
        .eq('directory_id', directoryId)
        .eq('featured', true)
        .not('profile_status', 'in', '("removed","opted_out")'),
      supabase
        .from('wv_listings')
        .select('country')
        .eq('directory_id', directoryId)
        .not('profile_status', 'in', '("removed","opted_out")')
        .not('country', 'is', null),
      supabase
        .from('wv_listings')
        .select('trade_sectors')
        .eq('directory_id', directoryId)
        .not('profile_status', 'in', '("removed","opted_out")')
        .not('trade_sectors', 'eq', '{}'),
    ])

  // Unique countries
  const countries: string[] = Array.from(
    new Set(
      (countryResult.data ?? [])
        .map((r: { country: string | null }) => r.country)
        .filter((c: string | null): c is string => Boolean(c))
    )
  ).sort()

  // Top sectors by frequency
  const sectorFreq: Record<string, number> = {}
  for (const row of sectorResult.data ?? []) {
    const sectors = (row as { trade_sectors: unknown }).trade_sectors
    if (Array.isArray(sectors)) {
      for (const s of sectors as string[]) {
        sectorFreq[s] = (sectorFreq[s] ?? 0) + 1
      }
    }
  }
  const top_sectors: string[] = Object.entries(sectorFreq)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 10)
    .map(([s]) => s)

  return {
    listing_count: (dirResult.data as { listing_count: number } | null)?.listing_count ?? 0,
    category_count: catResult.count ?? 0,
    claimed_count: claimedResult.count ?? 0,
    featured_count: featuredResult.count ?? 0,
    countries,
    top_sectors,
  }
}

// ============================================================================
// SYNC LOGS (for dashboard)
// ============================================================================

export async function getRecentSyncLogs(
  directoryId: string,
  limit = 10
): Promise<WvSyncLog[]> {
  const supabase = createWvClient()
  const { data, error } = await supabase
    .from('wv_sync_logs')
    .select('*')
    .eq('directory_id', directoryId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`getRecentSyncLogs: ${error.message}`)
  return (data ?? []) as WvSyncLog[]
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

type RawListingRow = Record<string, unknown> & {
  wv_listing_categories?: Array<{
    wv_categories: { name: string; slug: string } | null
  }>
}

function normaliseListingWithCategories(row: RawListingRow): WvListingWithCategories {
  const categoryRows = row.wv_listing_categories ?? []
  const category_names = categoryRows
    .map((lc) => lc.wv_categories?.name)
    .filter((n): n is string => Boolean(n))
  const category_slugs = categoryRows
    .map((lc) => lc.wv_categories?.slug)
    .filter((s): s is string => Boolean(s))

  const { wv_listing_categories: _ignored, ...rest } = row
  void _ignored

  return { ...rest, category_names, category_slugs } as WvListingWithCategories
}

// ============================================================================
// FT_ ADAPTER RE-EXPORTS (FindTraining — kept for backwards compat)
// Separate module: packages/engine/src/adapters/findtraining.ts
// ============================================================================
export {
  getProviderBySlug,
  searchProviders,
  getFeaturedProviders,
  getAllCategories as getFtCategories,
  getCategoryBySlug as getFtCategoryBySlug,
  getProvidersByCategory,
  getProviderStats,
  getCoursesByProvider,
  getContactClicksByProvider,
  getFoundingMemberCount,
  getAllProviderSlugs,
  getDistinctCountries,
  getAllClaims,
  getProviderAnalytics,
} from './findtraining'
export type { ContactClick, ProviderAnalytics } from './findtraining'
