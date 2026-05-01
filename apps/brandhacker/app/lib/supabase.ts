import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getServiceRoleClient(): SupabaseClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL not set')
  if (!srk) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')

  cached = createClient(url, srk, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

export type BrandFacts = {
  name?: string
  founded?: string
  founders?: string[]
  mission?: string
  primary_outputs?: string[]
  geographies?: string[]
  industries?: string[]
  key_claims?: string[]
  career_anchors?: string[]
  current_role?: string
  links?: Record<string, string>
  faq?: Array<{ q: string; a: string }>
}

export type ClientMetadata = {
  slug?: string
  internal_only?: boolean
  brand_facts?: BrandFacts
  assigned_reviewer_id?: string
  design_tokens?: Record<string, unknown>
  content_pillars?: Record<string, unknown>
}

export type ClientRow = {
  id: string
  display_name: string
  industry: string | null
  metadata: ClientMetadata
  updated_at: string
  current_tier: string
}

export type VoiceProfileRow = {
  audience: string | null
  one_word_tone: string | null
  register: string | null
  do_list: string[] | null
  dont_list: string[] | null
  signature_phrases: string[] | null
  never_sound_like: string[] | null
  forbidden_register: string[] | null
  version: number
}

export function isPublicSlug(slug: string): boolean {
  const list = (process.env.BH_PUBLIC_SLUGS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.includes(slug)
}
