/**
 * WebVillage tier definitions.
 *
 * Two product lines — tiers are NOT shared:
 *   - Self-serve (embed/plugin): free → pro → business
 *   - Managed service (done-for-you B2B): starter → professional → enterprise
 *
 * Source of truth: CANONICAL-SOURCES.md (78-webvillage)
 */

export type SelfServeTierId = 'free' | 'pro' | 'business'
export type ManagedTierId = 'starter' | 'professional' | 'enterprise'
export type TierId = SelfServeTierId | ManagedTierId

export interface SelfServeTier {
  id: SelfServeTierId
  label: string
  priceMonthly: number   // USD
  maxListings: number | null  // null = unlimited
  customDomain: boolean
  customStyling: boolean
  multiDirectory: boolean
  apiAccess: boolean
}

export interface ManagedTier {
  id: ManagedTierId
  label: string
  setupFee: number        // USD one-time
  priceMonthly: number    // USD
  maxListings: number | null
  emailMailboxes: number  // included in setup
  emailTier: 'mxroute' | 'google_workspace'
  seoContent: boolean
  whiteLabel: boolean
  dedicatedSupport: boolean
  supportSlaHours: number | null
}

// ── Self-serve tiers ────────────────────────────────────────────────────────

export const SELF_SERVE_TIERS: Record<SelfServeTierId, SelfServeTier> = {
  free: {
    id: 'free',
    label: 'Free',
    priceMonthly: 0,
    maxListings: 50,
    customDomain: false,
    customStyling: false,
    multiDirectory: false,
    apiAccess: false,
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    priceMonthly: 29,
    maxListings: null,
    customDomain: true,
    customStyling: true,
    multiDirectory: false,
    apiAccess: false,
  },
  business: {
    id: 'business',
    label: 'Business',
    priceMonthly: 79,
    maxListings: null,
    customDomain: true,
    customStyling: true,
    multiDirectory: true,
    apiAccess: true,
  },
}

// ── Managed service tiers ───────────────────────────────────────────────────

export const MANAGED_TIERS: Record<ManagedTierId, ManagedTier> = {
  starter: {
    id: 'starter',
    label: 'Starter',
    setupFee: 2500,
    priceMonthly: 299,
    maxListings: 500,
    emailMailboxes: 3,
    emailTier: 'mxroute',
    seoContent: false,
    whiteLabel: false,
    dedicatedSupport: false,
    supportSlaHours: null,
  },
  professional: {
    id: 'professional',
    label: 'Professional',
    setupFee: 5000,
    priceMonthly: 599,
    maxListings: 2000,
    emailMailboxes: 5,
    emailTier: 'google_workspace',
    seoContent: true,
    whiteLabel: false,
    dedicatedSupport: true,
    supportSlaHours: 48,
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    setupFee: 10000,
    priceMonthly: 999,
    maxListings: null,
    emailMailboxes: 10,
    emailTier: 'google_workspace',
    seoContent: true,
    whiteLabel: true,
    dedicatedSupport: true,
    supportSlaHours: 24,
  },
}
