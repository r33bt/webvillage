// packages/engine/src/config/sites.ts
// WebVillage network site registry — only WebVillage-owned nodes live here.
// EVA client sites (40+ WordPress sites) have been removed — this is the network engine,
// not a multi-tenant CMS config.

export interface SiteConfig {
  id: string
  name: string
  domain: string
  email: string
  type?: 'directory' | 'marketplace' | 'other'
  theme?: {
    primaryColor?: string
    secondaryColor?: string
  }
  features?: {
    reviews?: boolean
    claimListing?: boolean
    founding?: boolean
    [key: string]: boolean | undefined
  }
  seo?: {
    title?: string
    description?: string
  }
}

export const SITES: Record<string, SiteConfig> = {
  // ============================================================================
  // FINDTRAINING — Founding node #1 (Malaysia corporate training)
  // Data: Supabase EVA instance (ft_providers, ft_categories)
  // ============================================================================
  'findtraining': {
    id: 'findtraining',
    name: 'FindTraining',
    domain: 'findtraining.com',
    email: 'hello@findtraining.com',
    type: 'directory',
    theme: {
      primaryColor: '#0F6FEC',
      secondaryColor: '#00C48C',
    },
    features: {
      reviews: true,
      claimListing: true,
      founding: true,
    },
    seo: {
      title: 'FindTraining — Corporate Training Providers in Malaysia',
      description: 'Find the best HRDF-claimable corporate training providers, courses, and certifications in Malaysia.',
    },
  },

  // ============================================================================
  // COOPERATIVES — Founding node #2 (Malaysian cooperative societies)
  // Data: Supabase EVA instance (pending schema design)
  // ============================================================================
  'cooperatives': {
    id: 'cooperatives',
    name: 'Cooperatives Malaysia',
    domain: 'cooperatives.my',
    email: 'hello@cooperatives.my',
    type: 'directory',
    theme: {
      primaryColor: '#16A34A',
      secondaryColor: '#CA8A04',
    },
    features: {
      claimListing: true,
    },
    seo: {
      title: 'Cooperatives Malaysia — Directory of Malaysian Cooperative Societies',
      description: 'Find and connect with Malaysian cooperative societies. Browse by sector, state, and type.',
    },
  },

  // ============================================================================
  // WEBVILLAGE.COM — Main product marketing site + meta-directory
  // ============================================================================
  'webvillage-com': {
    id: 'webvillage-com',
    name: 'WebVillage',
    domain: 'webvillage.com',
    email: 'hello@webvillage.com',
    type: 'other',
    theme: {
      primaryColor: '#0F766E',   // Deep Teal
      secondaryColor: '#D97706', // Warm Amber
    },
    seo: {
      title: 'WebVillage — Global Managed Directory Network',
      description: 'Done-for-you directory service for associations, chambers of commerce, and industry bodies worldwide.',
    },
  },

  // ============================================================================
  // PLATFORM FALLBACK — Neutral demo. Used when no site matches hostname.
  // ============================================================================
  'platform-demo': {
    id: 'platform-demo',
    name: 'WebVillage Demo',
    domain: 'demo.webvillage.com',
    email: 'hello@webvillage.com',
    type: 'other',
    theme: {
      primaryColor: '#0F766E',
      secondaryColor: '#D97706',
    },
    seo: {
      title: 'WebVillage — Directory Engine Demo',
      description: 'WebVillage powers managed directories for associations and industry bodies.',
    },
  },
}

export const DEFAULT_SITE_ID = 'platform-demo'

export function getSiteConfig(siteId: string): SiteConfig {
  const site = SITES[siteId]
  if (!site) {
    console.warn('Unknown siteId:', siteId, '— falling back to', DEFAULT_SITE_ID)
    return SITES[DEFAULT_SITE_ID]!
  }
  return site
}

export function getSiteId(): string {
  if (process.env.NEXT_PUBLIC_SITE_ID) {
    return process.env.NEXT_PUBLIC_SITE_ID
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    for (const [siteId, config] of Object.entries(SITES)) {
      if (hostname === config.domain || hostname.includes(config.domain)) {
        return siteId
      }
    }
  }

  return DEFAULT_SITE_ID
}

export function getSiteIdFromHeaders(headers: Headers): string {
  const host = headers.get('host') || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')

  // Dev override via env var
  if (isLocalhost && (process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID)) {
    const devSiteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID
    if (devSiteId && SITES[devSiteId]) return devSiteId
  }

  // Match by hostname
  for (const [siteId, config] of Object.entries(SITES)) {
    if (host === config.domain || host.includes(config.domain)) {
      return siteId
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_ID) return process.env.NEXT_PUBLIC_SITE_ID

  return DEFAULT_SITE_ID
}
