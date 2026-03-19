/**
 * WebVillage pricing plans — canonical source of truth.
 * All prices in USD/month. Annual = monthly * 10 (2 months free).
 * Source: 78-webvillage/CANONICAL-SOURCES.md
 */

export type PlanId = 'free' | 'starter' | 'pro' | 'directory' | 'directory_pro' | 'enterprise'

export interface PlanFeatures {
  pages: number | 'unlimited'
  sites: number
  customDomain: boolean
  email: boolean
  booking: boolean
  analytics: boolean
  removesBranding: boolean
  prioritySupport: boolean
  whiteLabel: boolean
}

export interface Plan {
  id: PlanId
  name: string
  monthlyPrice: number
  features: PlanFeatures
  description: string
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    description: 'Perfect for getting started',
    features: {
      pages: 1,
      sites: 1,
      customDomain: false,
      email: false,
      booking: false,
      analytics: false,
      removesBranding: false,
      prioritySupport: false,
      whiteLabel: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9,
    description: 'For individuals & personal brands',
    features: {
      pages: 5,
      sites: 1,
      customDomain: true,
      email: false,
      booking: false,
      analytics: false,
      removesBranding: true,
      prioritySupport: false,
      whiteLabel: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 19,
    description: 'For freelancers & businesses',
    features: {
      pages: 'unlimited',
      sites: 3,
      customDomain: true,
      email: true,
      booking: true,
      analytics: true,
      removesBranding: true,
      prioritySupport: true,
      whiteLabel: false,
    },
  },
  directory: {
    id: 'directory',
    name: 'Directory',
    monthlyPrice: 49,
    description: 'For directories & marketplaces',
    features: {
      pages: 'unlimited',
      sites: 10,
      customDomain: true,
      email: true,
      booking: true,
      analytics: true,
      removesBranding: true,
      prioritySupport: true,
      whiteLabel: false,
    },
  },
  directory_pro: {
    id: 'directory_pro',
    name: 'Directory Pro',
    monthlyPrice: 99,
    description: 'For agencies & domain investors',
    features: {
      pages: 'unlimited',
      sites: 50,
      customDomain: true,
      email: true,
      booking: true,
      analytics: true,
      removesBranding: true,
      prioritySupport: true,
      whiteLabel: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 199,
    description: 'Custom solutions for large organisations',
    features: {
      pages: 'unlimited',
      sites: 'unlimited' as unknown as number,
      customDomain: true,
      email: true,
      booking: true,
      analytics: true,
      removesBranding: true,
      prioritySupport: true,
      whiteLabel: true,
    },
  },
}
