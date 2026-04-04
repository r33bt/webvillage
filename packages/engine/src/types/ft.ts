// packages/engine/src/types/ft.ts
// TypeScript types for FindTraining Supabase tables (ft_ prefix)
// Schema source: 211-findtraining/supabase/migrations/

export type ProfileStatus = 'pending' | 'active' | 'claimed' | 'suspended' | 'removed' | 'opted_out'
export type Tier = 'free' | 'starter' | 'founding' | 'pro'
export type DeliveryMethod = 'in-person' | 'virtual' | 'e-learning' | 'hybrid'
export type HrdfStatus = 'registered' | 'unregistered' | 'exempt' | 'unknown'

export interface FtProvider {
  id: string
  slug: string
  name: string
  email: string | null
  phone: string | null
  website: string | null
  state: string | null
  region: string | null
  categories: string[]
  delivery_methods: DeliveryMethod[]
  hrdf_status: HrdfStatus
  profile_status: ProfileStatus
  tier: Tier
  featured: boolean
  country_code: string
  description: string | null
  logo_url: string | null
  claimed: boolean
  regulatory_body_id: string | null
  site_id?: number | null
  created_at: string
  updated_at: string
}

export interface FtCategory {
  id: string
  slug: string
  name: string
  description: string | null
  display_order: number
  active: boolean
  created_at: string
}

export interface FtProviderWithCategories extends FtProvider {
  category_names: string[]
}

export interface FtContactClick {
  id: string
  provider_id: string
  click_type: 'email' | 'phone' | 'website' | 'whatsapp'
  visitor_fingerprint: string | null
  created_at: string
}

export interface FtFoundingMember {
  id: string
  email: string
  company_name: string | null
  contact_name: string | null
  phone: string | null
  state: string | null
  status: 'prospect' | 'contacted' | 'interested' | 'paid' | 'onboarded' | 'churned' | 'declined'
  notes: string | null
  created_at: string
  updated_at: string
}

export type DeliveryMethodCourse = 'in-person' | 'virtual' | 'e-learning' | 'hybrid'

export interface FtCourse {
  id: string
  provider_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  delivery_method: DeliveryMethodCourse | null
  duration_days: number | null
  price_min: number | null
  price_max: number | null
  currency_code: string
  hrdf_claimable: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface SearchFilters {
  category?: string
  state?: string
  delivery?: string
  query?: string
  page?: number
}

export const PAGE_SIZE = 24

// Tier display priority (higher = better placement)
export const TIER_ORDER: Record<string, number> = {
  pro: 4,
  founding: 3,
  starter: 2,
  free: 1,
}
