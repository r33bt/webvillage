/**
 * WebVillage pricing plans — canonical source of truth.
 * All prices in USD. Annual = per month when paid annually.
 * Source: 78-webvillage/CANONICAL-SOURCES.md
 */

export type PlanId = 'free' | 'starter' | 'pro' | 'directory' | 'directory_pro' | 'enterprise'
export type BillingInterval = 'monthly' | 'annual'

export interface PlanFeature {
  name: string
  included: boolean
  value?: string | number
}

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
  tagline: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: PlanFeature[]
  limits: {
    pages: number | 'unlimited'
    storage: string
    bandwidth: string
    formSubmissions: number | 'unlimited'
    sites: number
  }
  recommended?: boolean
  ctaText: string
  ctaSubtext?: string
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Perfect for getting started',
    description: 'Try WebVillage with no commitment',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: '1 page website', included: true },
      { name: 'WebVillage subdomain', included: true, value: 'you.webvillage.com' },
      { name: 'HTTPS security', included: true },
      { name: 'Mobile responsive', included: true },
      { name: 'Basic templates', included: true },
      { name: 'WebVillage branding', included: true },
      { name: 'Custom domain', included: false },
      { name: 'Contact forms', included: false },
      { name: 'Analytics', included: false },
    ],
    limits: {
      pages: 1,
      storage: '50 MB',
      bandwidth: '10 GB/month',
      formSubmissions: 0,
      sites: 1,
    },
    ctaText: 'Start Free',
    ctaSubtext: 'No credit card required',
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For individuals & personal brands',
    description: 'Everything you need to build your online presence',
    monthlyPrice: 9,
    annualPrice: 7,
    features: [
      { name: '5 pages', included: true },
      { name: 'Custom domain', included: true },
      { name: 'Remove WebVillage branding', included: true },
      { name: 'Custom favicon', included: true },
      { name: 'Basic SEO settings', included: true },
      { name: 'Email support', included: true },
      { name: 'Contact forms', included: false },
      { name: 'Analytics dashboard', included: false },
    ],
    limits: {
      pages: 5,
      storage: '1 GB',
      bandwidth: '100 GB/month',
      formSubmissions: 0,
      sites: 1,
    },
    ctaText: 'Get Started',
    ctaSubtext: '14-day money-back guarantee',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For freelancers & small businesses',
    description: 'Professional features to grow your business',
    monthlyPrice: 19,
    annualPrice: 15,
    recommended: true,
    features: [
      { name: 'Unlimited pages', included: true },
      { name: 'Contact forms', included: true, value: '100/month' },
      { name: 'Analytics dashboard', included: true },
      { name: 'Google Analytics integration', included: true },
      { name: 'Custom code injection', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Password-protected pages', included: true },
      { name: 'Scheduled publishing', included: true },
    ],
    limits: {
      pages: 'unlimited',
      storage: '5 GB',
      bandwidth: '500 GB/month',
      formSubmissions: 100,
      sites: 3,
    },
    ctaText: 'Get Started',
    ctaSubtext: 'Most popular for professionals',
  },
  directory: {
    id: 'directory',
    name: 'Directory',
    tagline: 'Build a directory or marketplace',
    description: 'Full directory platform with listings and reviews',
    monthlyPrice: 49,
    annualPrice: 39,
    features: [
      { name: 'Unlimited listings', included: true },
      { name: 'Listing submissions', included: true },
      { name: 'Review & rating system', included: true },
      { name: 'Category management', included: true },
      { name: 'Search & filtering', included: true },
      { name: 'Basic booking system', included: true },
      { name: 'Member management', included: true },
      { name: 'Listing analytics', included: true },
      { name: 'Custom listing fields', included: true },
      { name: 'SEO-optimized listing pages', included: true },
    ],
    limits: {
      pages: 'unlimited',
      storage: '20 GB',
      bandwidth: '1 TB/month',
      formSubmissions: 500,
      sites: 5,
    },
    ctaText: 'Start Directory',
    ctaSubtext: 'Perfect for associations & networks',
  },
  directory_pro: {
    id: 'directory_pro',
    name: 'Directory Pro',
    tagline: 'Full-featured marketplace platform',
    description: 'Advanced features for professional marketplaces',
    monthlyPrice: 99,
    annualPrice: 79,
    features: [
      { name: 'Payment processing', included: true, value: 'Stripe' },
      { name: 'Commission management', included: true },
      { name: 'Advanced booking with calendar', included: true },
      { name: 'Gamification', included: true, value: 'badges, points' },
      { name: 'Email automation', included: true },
      { name: 'Custom email templates', included: true },
      { name: 'Webhooks & integrations', included: true },
      { name: 'API access', included: true, value: 'read-only' },
      { name: 'White-label option', included: true },
      { name: 'Dedicated support', included: true },
    ],
    limits: {
      pages: 'unlimited',
      storage: '50 GB',
      bandwidth: '2 TB/month',
      formSubmissions: 2000,
      sites: 10,
    },
    ctaText: 'Start Directory Pro',
    ctaSubtext: 'Ideal for professional networks',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For large organizations',
    description: 'Custom solutions with dedicated support',
    monthlyPrice: 199,
    annualPrice: 199,
    features: [
      { name: 'Multi-admin accounts', included: true },
      { name: 'Role-based permissions', included: true },
      { name: 'Full API access', included: true, value: 'read/write' },
      { name: 'Custom integrations', included: true },
      { name: 'SLA guarantee', included: true, value: '99.9% uptime' },
      { name: 'Dedicated account manager', included: true },
      { name: 'Custom development hours', included: true },
      { name: 'Data export tools', included: true },
      { name: 'SAML SSO', included: true },
      { name: 'Priority phone support', included: true },
    ],
    limits: {
      pages: 'unlimited',
      storage: '100 GB',
      bandwidth: '5 TB/month',
      formSubmissions: 'unlimited',
      sites: 999,
    },
    ctaText: 'Contact Sales',
    ctaSubtext: 'Custom solutions available',
  },
}

export function getVisiblePlans(): Plan[] {
  return [PLANS.free, PLANS.starter, PLANS.pro]
}

export function getDirectoryPlans(): Plan[] {
  return [PLANS.directory, PLANS.directory_pro, PLANS.enterprise]
}

export const MYR_PRICES: Record<PlanId, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  starter: { monthly: 40, annual: 32 },
  pro: { monthly: 80, annual: 64 },
  directory: { monthly: 200, annual: 160 },
  directory_pro: { monthly: 400, annual: 320 },
  enterprise: { monthly: 800, annual: 800 },
}

export const PLAN_REPLACEMENT_MESSAGES: Record<PlanId, string> = {
  free: 'Try before you buy',
  starter: 'Replaces Linktree ($9) — plus you get a real website',
  pro: 'Replaces Linktree + Wix + Calendly ($35) — save $16/mo',
  directory: 'For businesses that need booking + directory listing',
  directory_pro: 'For domain investors & agencies managing multiple sites',
  enterprise: 'Custom solutions for large organizations',
}

export interface AddOn {
  id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'yearly' | 'one-time'
}

export const ADDONS: AddOn[] = [
  {
    id: 'domain',
    name: 'Domain Registration',
    description: 'Register your perfect domain name',
    price: 12,
    interval: 'yearly',
  },
  {
    id: 'email',
    name: 'Professional Email',
    description: 'Custom domain email via MXroute',
    price: 3,
    interval: 'monthly',
  },
  {
    id: 'storage',
    name: 'Extra Storage',
    description: '10 GB additional storage',
    price: 2,
    interval: 'monthly',
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: '4-hour response time, screen sharing',
    price: 10,
    interval: 'monthly',
  },
]

export const FEATURE_COMPARISON = {
  'Website Basics': [
    { name: 'Pages', free: '1', starter: '5', pro: 'Unlimited', directory: 'Unlimited', directory_pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Custom domain', free: false, starter: true, pro: true, directory: true, directory_pro: true, enterprise: true },
    { name: 'Remove branding', free: false, starter: true, pro: true, directory: true, directory_pro: true, enterprise: true },
    { name: 'SSL/HTTPS', free: true, starter: true, pro: true, directory: true, directory_pro: true, enterprise: true },
    { name: 'Mobile responsive', free: true, starter: true, pro: true, directory: true, directory_pro: true, enterprise: true },
  ],
  'Storage & Bandwidth': [
    { name: 'Storage', free: '50 MB', starter: '1 GB', pro: '5 GB', directory: '20 GB', directory_pro: '50 GB', enterprise: '100 GB' },
    { name: 'Bandwidth/month', free: '10 GB', starter: '100 GB', pro: '500 GB', directory: '1 TB', directory_pro: '2 TB', enterprise: '5 TB' },
  ],
  'Forms & Analytics': [
    { name: 'Contact forms', free: false, starter: false, pro: true, directory: true, directory_pro: true, enterprise: true },
    { name: 'Form submissions/month', free: '-', starter: '-', pro: '100', directory: '500', directory_pro: '2,000', enterprise: 'Unlimited' },
    { name: 'Analytics dashboard', free: false, starter: false, pro: true, directory: true, directory_pro: true, enterprise: true },
    { name: 'Google Analytics', free: false, starter: false, pro: true, directory: true, directory_pro: true, enterprise: true },
  ],
  'Directory Features': [
    { name: 'Listings', free: false, starter: false, pro: false, directory: 'Unlimited', directory_pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Reviews & ratings', free: false, starter: false, pro: false, directory: true, directory_pro: true, enterprise: true },
    { name: 'Categories & filtering', free: false, starter: false, pro: false, directory: true, directory_pro: true, enterprise: true },
    { name: 'Booking system', free: false, starter: false, pro: false, directory: 'Basic', directory_pro: 'Advanced', enterprise: 'Advanced' },
    { name: 'Payments', free: false, starter: false, pro: false, directory: false, directory_pro: true, enterprise: true },
    { name: 'Gamification', free: false, starter: false, pro: false, directory: false, directory_pro: true, enterprise: true },
  ],
  Advanced: [
    { name: 'Custom code', free: false, starter: false, pro: true, directory: true, directory_pro: true, enterprise: true },
    { name: 'API access', free: false, starter: false, pro: false, directory: false, directory_pro: 'Read', enterprise: 'Read/Write' },
    { name: 'Multi-admin', free: false, starter: false, pro: false, directory: false, directory_pro: false, enterprise: true },
    { name: 'SSO/SAML', free: false, starter: false, pro: false, directory: false, directory_pro: false, enterprise: true },
  ],
  Support: [
    { name: 'Help center', free: true, starter: true, pro: true, directory: true, directory_pro: true, enterprise: true },
    { name: 'Email support', free: false, starter: true, pro: 'Priority', directory: 'Priority', directory_pro: 'Dedicated', enterprise: 'Dedicated' },
    { name: 'Phone support', free: false, starter: false, pro: false, directory: false, directory_pro: false, enterprise: true },
    { name: 'Dedicated manager', free: false, starter: false, pro: false, directory: false, directory_pro: false, enterprise: true },
  ],
} as const
