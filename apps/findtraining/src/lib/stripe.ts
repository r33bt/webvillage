// src/lib/stripe.ts
// Stripe client singleton — server-side only.
// Import this only in Route Handlers and Server Actions, never in Client Components.

import Stripe from 'stripe'

// Prices in MYR cents (100 = RM 1.00)
export const STRIPE_PRICES = {
  starter: {
    amount: 30000,  // RM 300.00
    currency: 'myr',
    interval: 'month' as const,
    name: 'FindTraining Starter',
  },
  pro: {
    amount: 80000,  // RM 800.00
    currency: 'myr',
    interval: 'month' as const,
    name: 'FindTraining Pro',
  },
} as const

export type StripePlan = keyof typeof STRIPE_PRICES

// Tier map: Stripe plan → ft_providers.tier
export const PLAN_TO_TIER: Record<StripePlan, 'starter' | 'pro'> = {
  starter: 'starter',
  pro: 'pro',
}

let _stripe: Stripe | null = null

/**
 * Returns a Stripe client singleton.
 * Returns null if STRIPE_SECRET_KEY is not set (graceful degradation).
 */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[stripe] STRIPE_SECRET_KEY not set — Stripe features disabled')
    return null
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia',
      typescript: true,
    })
  }
  return _stripe
}
