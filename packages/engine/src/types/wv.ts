// packages/engine/src/types/wv.ts
// WebVillage Directory Network — TypeScript domain types
// Source of truth: supabase/migrations/20260405000000_wv_directory_schema.sql

// ============================================================================
// ENUMS / LITERALS
// ============================================================================

export type WvDirectoryType = 'chamber' | 'association' | 'trade_body' | 'other'
export type WvPlanTier = 'starter' | 'professional' | 'enterprise'
export type WvListingStatus = 'unclaimed' | 'claimed' | 'removed' | 'opted_out'
export type WvListingTier = 'free' | 'starter' | 'pro' | 'enterprise'
export type WvClickType = 'email' | 'phone' | 'website' | 'linkedin' | 'directions'
export type WvApiScope = 'read' | 'write' | 'admin'
export type WvSyncSource = 'glueup' | 'csv' | 'manual' | 'api'
export type WvSyncStatus = 'running' | 'completed' | 'failed'
export type WvIntroductionStatus = 'pending' | 'accepted' | 'declined' | 'expired'

// Normalised sector taxonomy — used for cross-chamber B2B matching
export const TRADE_SECTORS = [
  'Agriculture & Food',
  'Automotive',
  'Banking & Finance',
  'Construction & Real Estate',
  'Creative & Media',
  'Education & Training',
  'Energy & Environment',
  'Fashion & Retail',
  'Healthcare & Pharmaceuticals',
  'Hospitality & Tourism',
  'ICT & Technology',
  'Legal & Professional Services',
  'Logistics & Supply Chain',
  'Manufacturing & Engineering',
  'Maritime & Ports',
  'Mining & Resources',
  'Non-Profit & NGO',
  'Oil & Gas',
  'Other',
] as const

export type TradeSector = (typeof TRADE_SECTORS)[number]

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface WvDirectory {
  id: string
  slug: string
  name: string
  description: string | null
  country: string | null
  type: WvDirectoryType
  plan_tier: WvPlanTier
  white_label: boolean
  network_opt_in: boolean
  api_key_enabled: boolean
  owner_user_id: string | null
  logo_url: string | null
  accent_color: string | null
  domain: string | null
  glueup_org_id: string | null
  listing_count: number
  created_at: string
  updated_at: string
}

export interface WvCategory {
  id: string
  directory_id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  parent_id: string | null
  display_order: number
  active: boolean
  item_count: number
  created_at: string
}

export interface WvListing {
  id: string
  directory_id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  lat: number | null
  lng: number | null
  logo_url: string | null
  featured_image_url: string | null
  trade_sectors: string[]
  languages: string[]
  founded_year: number | null
  employee_range: string | null
  profile_status: WvListingStatus
  claimed_by: string | null
  claimed_at: string | null
  featured: boolean
  tier: WvListingTier
  social_links: WvSocialLinks
  custom_fields: Record<string, unknown>
  opted_in_email: boolean
  consent_timestamp: string | null
  consent_ip_hash: string | null
  consent_form_version: string | null
  created_at: string
  updated_at: string
}

export interface WvSocialLinks {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  youtube?: string
  [key: string]: string | undefined
}

export interface WvListingWithCategories extends WvListing {
  category_names: string[]
  category_slugs: string[]
}

export interface WvApiKey {
  id: string
  directory_id: string
  key_prefix: string
  label: string | null
  scopes: WvApiScope[]
  last_used_at: string | null
  created_at: string
  revoked_at: string | null
}

export interface WvSyncLog {
  id: string
  directory_id: string
  source: WvSyncSource
  status: WvSyncStatus
  records_processed: number
  records_created: number
  records_updated: number
  records_skipped: number
  error_message: string | null
  triggered_by: string | null
  started_at: string
  completed_at: string | null
}

export interface WvIntroduction {
  id: string
  from_listing_id: string | null
  to_listing_id: string | null
  from_directory_id: string
  to_directory_id: string
  message: string | null
  requester_name: string | null
  requester_email: string
  status: WvIntroductionStatus
  created_at: string
  updated_at: string
}

// ============================================================================
// API PAYLOADS
// ============================================================================

// Mode 3 REST API — query params for listing index
export interface WvListingSearchParams {
  q?: string           // full-text search
  category?: string    // category slug
  country?: string     // ISO 3166-1 alpha-2
  sector?: string      // trade sector
  status?: WvListingStatus
  featured?: boolean
  page?: number
  limit?: number       // max 100
}

// Mode 3 REST API — listing submission body
export interface WvListingSubmitBody {
  name: string
  tagline?: string
  description?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  trade_sectors?: string[]
  category_slugs?: string[]
  social_links?: WvSocialLinks
  consent: true        // required — must be explicitly true
}

// Mode 3 REST API — paginated response wrapper
export interface WvPaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// Glue Up API v2 — member shape (subset we care about)
export interface GlueUpMember {
  id: number
  name: string
  email: string | null
  phone: string | null
  website: string | null
  city: string | null
  country: string | null
  description: string | null
  logo: string | null
  membership_type: string | null
  status: string
}

// Glue Up sync result
export interface WvGlueUpSyncResult {
  directory_id: string
  source: 'glueup'
  records_processed: number
  records_created: number
  records_updated: number
  records_skipped: number
  errors: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const WV_PAGE_SIZE = 24
export const WV_MAX_PAGE_SIZE = 100

export const WV_LISTING_TIER_ORDER: Record<WvListingTier, number> = {
  enterprise: 4,
  pro: 3,
  starter: 2,
  free: 1,
}
