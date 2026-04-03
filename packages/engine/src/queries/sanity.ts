import { createClient } from 'next-sanity'

// Use hardcoded values to prevent build-time errors
// These are safe defaults that will work during SSG/build
const SANITY_PROJECT_ID = 'gqklz0p9'
const SANITY_DATASET = 'production'

// Only use env vars if they're valid (non-empty strings with correct format)
// ProjectId: lowercase alphanumeric and dashes
const envProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const projectId = (envProjectId && /^[a-z0-9-]+$/.test(envProjectId))
  ? envProjectId
  : SANITY_PROJECT_ID

// Dataset: lowercase alphanumeric, underscores, dashes, can start with tilde, max 64 chars
const envDataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const dataset = (envDataset && /^~?[a-z0-9_-]+$/.test(envDataset) && envDataset.length <= 64)
  ? envDataset
  : SANITY_DATASET

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production', // Use CDN in production for read operations (reduces metered API requests)
  // No token for reads — dataset is public and CDN does not accept session tokens
})

// Write client with token for mutations
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false, // Never use CDN for writes
  token: process.env.SANITY_API_TOKEN
})

/**
 * Serialize Sanity results to plain objects
 * This removes Sanity-specific prototypes and _type fields from nested objects
 */
function serializeSanityResult<T>(data: T): T {
  if (data === null || data === undefined) return data
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeSanityResult(item)) as T
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const result: any = {}
    
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = (data as any)[key]
        
        // Special handling for slug objects - remove _type
        if (key === 'slug' && value && typeof value === 'object' && value._type === 'slug') {
          result[key] = { current: value.current }
          continue
        }
        
        // Skip _type at root level of nested objects (but keep it on main documents)
        if (key === '_type' && typeof value === 'string' && value === 'slug') {
          continue
        }
        
        // Recursively serialize
        result[key] = serializeSanityResult(value)
      }
    }
    
    return result as T
  }
  
  // Primitives
  return data
}

// Fetch business listings with filters
export async function fetchBusinessListings(params?: {
  siteId?: string
  category?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const {
    category,
    search,
    limit = 50,
    offset = 0,
    sortBy = '_createdAt',
    sortOrder = 'desc'
  } = params || {}

  // Build query dynamically based on provided params
  const conditions = [`_type == "business"`]
    const queryParams: Record<string, any> = {}
    
    // CRITICAL: Filter by siteId for multi-tenant
    if (params?.siteId) {
      conditions.push(`siteId == $siteId`)
      queryParams.siteId = params.siteId
    }

  if (category) {
    conditions.push(`$category in categories[]`)
    queryParams.category = category
  }

  if (search) {
    conditions.push(`(title match $search || description match $search)`)
    queryParams.search = search
  }

  const whereClause = conditions.join(' && ')
  // If sorting by featured, add secondary sort by _createdAt
  const orderClause = sortBy === 'featured'
    ? 'featured desc, _createdAt desc'
    : (sortOrder === 'desc' ? `${sortBy} desc` : `${sortBy} asc`)
  const rangeClause = `[${offset}...${offset + limit}]`

  const query = `*[${whereClause}] | order(${orderClause}) ${rangeClause} {
    _id,
    _createdAt,
    title,
      "logoUrl": logo.asset->url,
      "imageUrl": featuredImage.asset->url,
      logo {
        asset -> {
          _id,
          url
        }
      },
    slug,
    description,
    category->{
      title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
      slug
    },
    address,
    phone,
    email,
    website,
    hours,
    "imageUrl": featuredImage.asset->url,
    featured
  }`

  console.log('Sanity Query:', query)
  console.log('Query Params:', queryParams)

  const results = await client.fetch(query, queryParams)
  console.log('Sanity Results Count:', results?.length || 0)

  return serializeSanityResult(results)
}

// Fetch single business/listing by slug
export async function fetchBusinessBySlug(slug: string) {
  const result = await client.fetch(`
    *[_type == "business" && slug.current == $slug][0] {
      _id,
      _createdAt,
      _updatedAt,
      title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
      slug,
      description,
      category->{
        title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
        slug,
        description
      },
      address,
      phone,
      email,
      website,
      hours,
      rating,
      reviewCount,
      publishedAt,
      "imageUrl": featuredImage.asset->url,
      featured
    }
  `, { slug })
  
  return serializeSanityResult(result)
}

// Fetch software listings with filters
export async function fetchSoftwareListings(params?: {
  siteId?: string

  category?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const {
    siteId,
    category,
    search,
    limit = 50,
    offset = 0,
    sortBy = '_createdAt',
    sortOrder = 'desc'
  } = params || {}

  const conditions = [`_type == "software"`]
  const queryParams: Record<string, any> = {}

  if (siteId) {
    conditions.push(`siteId == $siteId`)
    queryParams.siteId = siteId
  }

  if (category) {
    conditions.push(`category->slug.current == $category`)
    queryParams.category = category
  }

  if (search) {
    conditions.push(`(title match $search || description match $search)`)
    queryParams.search = search
  }

  const whereClause = conditions.join(' && ')
  // If sorting by featured, add secondary sort by _createdAt
  const orderClause = sortBy === 'featured'
    ? 'featured desc, _createdAt desc'
    : (sortOrder === 'desc' ? `${sortBy} desc` : `${sortBy} asc`)
  const rangeClause = `[${offset}...${offset + limit}]`

  const query = `*[${whereClause}] | order(${orderClause}) ${rangeClause} {
    _id,
    _createdAt,
    title,
      "logoUrl": logo.asset->url,
      "imageUrl": featuredImage.asset->url,
      logo {
        asset -> {
          _id,
          url
        }
      },
    slug,
    description,
    excerpt,
    category->{
      title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
      slug
    },    features,
    pricing,
    website,
    demo,
    github,
    documentation,
    featured
  }`

  const results = await client.fetch(query, queryParams)
  return serializeSanityResult(results)
}

// Fetch top rated listings (software or business)
export async function fetchTopRatedListings(params?: {
  siteId: string
  listingType: 'software' | 'business'
  limit?: number
}) {
  const { siteId, listingType, limit = 6 } = params || {}

  const query = `*[_type == $listingType && siteId == $siteId && rating > 0]
    | order(rating desc, reviewCount desc, _createdAt desc) [0...$limit] {
      _id,
      _createdAt,
      title,
      slug,
      description,
      excerpt,
      "logoUrl": logo.asset->url,
      "imageUrl": featuredImage.asset->url,
      logo { asset -> { _id, url } },
      category->{ title, slug },
      rating,
      reviewCount,
      featured,
      siteId
    }`

  const results = await client.fetch(query, {
    listingType,
    siteId,
    limit
  })

  return serializeSanityResult(results)
}

// Fetch single software by slug
export async function fetchSoftwareBySlug(slug: string) {
  const result = await client.fetch(`
    *[_type == "software" && slug.current == $slug][0] {
      _id,
      _createdAt,
      _updatedAt,
      title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
      slug,
      description,
      excerpt,
      category->{
        title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
        slug,
        description
      },
      features,
      pricing,
      website,
      demo,
      github,
      documentation,
      publishedAt,
      featured
    }
  `, { slug })
  
  return serializeSanityResult(result)
}

// Fetch categories
export async function fetchCategories(siteId?: string) {
    if (siteId) {
      const results = await client.fetch(
        `*[_type == "category" && siteId == $siteId] | order(title asc) {
          _id,
          title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
          slug,
          description
        }`,
        { siteId }
      )
      return serializeSanityResult(results)
    } else {
      const results = await client.fetch(
        `*[_type == "category"] | order(title asc) {
          _id,
          title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
          slug,
          description
        }`
      )
      return serializeSanityResult(results)
    }
  }

// Fetch articles with filters
export async function fetchArticles(params?: {
  siteId?: string  // ADD: Filter articles by site (multi-tenant support)
  category?: string
  limit?: number
  offset?: number
}) {
  const {
    siteId,  // ADD: Destructure siteId
    category,
    limit = 10,
    offset = 0
  } = params || {}

  const conditions = [`_type == "article"`]
  const queryParams: Record<string, any> = {}

  // CRITICAL: Filter by siteId for multi-tenant (same pattern as fetchBusinessListings)
  if (siteId) {
    conditions.push(`siteId == $siteId`)
    queryParams.siteId = siteId
  }

  if (category) {
    conditions.push(`$category in categories[]`)
    queryParams.category = category
  }

  const whereClause = conditions.join(' && ')
  const rangeClause = `[${offset}...${offset + limit}]`

  const query = `*[${whereClause}] | order(publishedAt desc) ${rangeClause} {
    _id,
    title,\n      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
    slug,
    excerpt,
    "imageUrl": featuredImage.asset->url,
    publishedAt,
    author->{
      name,
      "imageUrl": featuredImage.asset->url
    },
    categories[]->{
      title,
      logoUrl,
      logo {
        asset -> {
          _id,
          url
        }
      },
      slug
    }
  }`

  const results = await client.fetch(query, queryParams)
  return serializeSanityResult(results)
}

/// Fetch single article by slug (also checks pages for WTG region content)
export async function fetchArticleBySlug(slug: string) {
  // First try to find an article
  // Note: WTG articles use 'body' field, standard schema uses 'content'
  // We query both and alias to 'content' for consistency
  let result = await client.fetch(`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      "content": coalesce(body, content),
      "imageUrl": featuredImage.asset->url,
      publishedAt,
      categories,
      tags,
      author,
      published
    }
  `, { slug })

  // If no article found, check pages (for WTG region pages)
  if (!result) {
    result = await client.fetch(`
      *[_type == "page" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        "excerpt": seoDescription,
        "content": coalesce(body, content),
        "imageUrl": null,
        publishedAt,
        "categories": [],
        "tags": [],
        "author": null,
        "published": true
      }
    `, { slug })
  }

  return serializeSanityResult(result)
}

/**
 * Fetch a single category by slug
 */
export async function fetchCategoryBySlug(slug: string) {
  const query = `*[_type == "category" && slug.current == $slug][0] {
    _id,
    title,
    description,
    slug,
    _createdAt,
    _updatedAt
  }`

  return client.fetch(query, { slug })
}

/**
 * Fetch all categories with item counts (filtered by content type)
 */
export async function fetchAllCategories(isSoftware: boolean = true) {
  const contentType = isSoftware ? 'software' : 'business'
  
  const query = `*[_type == "category" && count(*[_type == $contentType && references(^._id)]) > 0] | order(title asc) {
    _id,
    title,
    description,
    slug,
    icon,
    "itemCount": count(*[_type == $contentType && references(^._id)])
  }`

  return client.fetch(query, { contentType })
}

/**
 * Fetch related items from the same category
 */
export async function fetchRelatedItems(params: {
  categorySlug: string
  currentItemId: string
  limit?: number
  isSoftware?: boolean
}) {
  const { categorySlug, currentItemId, limit = 3, isSoftware = true } = params
  const type = isSoftware ? 'software' : 'business'

  const query = `*[_type == "${type}" && category->slug.current == $categorySlug && _id != $currentItemId] | order(_createdAt desc) [0...$limit] {
    _id,
    title,
    slug,
    description,
    excerpt,
    logoUrl,
    logo {
      asset -> {
        _id,
        url
      }
    },
    category->{
      title,
      slug
    },
    featuredImage {
      asset -> {
        _id,
        url
      }
    }
  }`

  return client.fetch(query, { categorySlug, currentItemId, limit })
}




export async function fetchReviews(listingId: string) {
  return client.fetch(
    `*[_type == "review" && listing._ref == $listingId && status == "published"] | order(publishedAt desc) {
      _id,
      rating,
      title,
      text,
      authorName,
      publishedAt
    }`,
    { listingId }
  )
}

export async function getAverageRating(listingId: string) {
  const reviews = await fetchReviews(listingId)
  if (reviews.length === 0) return null
  const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0)
  return {
    average: (sum / reviews.length).toFixed(1),
    count: reviews.length
  }
}

// Fetch team members
export async function fetchTeamMembers(params?: {
  siteId?: string
  limit?: number
  offset?: number
}) {
  const { siteId, limit = 20, offset = 0 } = params || {}
  const conditions = [`_type == "teamMember"`]
  const queryParams: Record<string, any> = {}

  if (siteId) {
    conditions.push(`siteId == $siteId`)
    queryParams.siteId = siteId
  }

  const whereClause = conditions.join(' && ')
  const rangeClause = `[${offset}...${offset + limit}]`

  const query = `*[${whereClause}] | order(name asc) ${rangeClause} {
    _id,
    name,
    role,
    bio,
    "imageUrl": photo.asset->url,
      slug,
    email,
    socialLinks
  }`

  const results = await client.fetch(query, queryParams)
  return serializeSanityResult(results)
}

// Fetch single team member by slug
export async function fetchTeamMemberBySlug(slug: string) {
  const result = await client.fetch(`
    *[_type == "teamMember" && slug.current == $slug][0] {
      _id,
      name,
      role,
      bio,
      "imageUrl": photo.asset->url,
      slug,
      email,
      socialLinks,
      slug
    }
  `, { slug })
  
  return serializeSanityResult(result)
}

// Fetch events

export async function fetchAllListings(params?: {
  siteId?: string
  category?: string
  search?: string
  type?: 'all' | 'software' | 'business'
  limit?: number
  offset?: number
}) {
  const { siteId, category, search, type = 'all', limit = 12, offset = 0 } = params || {}
  
  if (type === 'software') {
    return fetchSoftwareListings({ siteId, category, search, limit, offset })
  }
  if (type === 'business') {
    return fetchBusinessListings({ siteId, category, search, limit, offset })
  }
  
  // Fetch both types
  const [software, business] = await Promise.all([
    fetchSoftwareListings({ siteId, category, search, limit: Math.ceil(limit / 2), offset: Math.floor(offset / 2) }),
    fetchBusinessListings({ siteId, category, search, limit: Math.ceil(limit / 2), offset: Math.floor(offset / 2) })
  ])
  
  // Tag items with type and merge
  const taggedSoftware = software.map((item: any) => ({ ...item, _type: 'software' }))
  const taggedBusiness = business.map((item: any) => ({ ...item, _type: 'business' }))
  
  return [...taggedSoftware, ...taggedBusiness]
}

export async function fetchEvents(params?: {
  siteId?: string
  upcoming?: boolean
  past?: boolean
  category?: string
  limit?: number
  offset?: number
}) {
  const { siteId, upcoming = true, past = false, category, limit = 20, offset = 0 } = params || {}
  const conditions = [`_type == "event"`]
  const queryParams: Record<string, any> = {}

  if (siteId) {
    conditions.push(`siteId == $siteId`)
    queryParams.siteId = siteId
  }

  if (upcoming && !past) {
    conditions.push(`dateTime(startDate) >= dateTime(now())`)
  } else if (past && !upcoming) {
    conditions.push(`dateTime(startDate) < dateTime(now())`)
  }

  if (category) {
    conditions.push(`$category in categories[]->slug.current`)
    queryParams.category = category
  }

  const whereClause = conditions.join(' && ')
  const rangeClause = `[${offset}...${offset + limit}]`
  const orderClause = upcoming ? 'startDate asc' : 'startDate desc'

  const query = `*[${whereClause}] | order(${orderClause}) ${rangeClause} {
    _id,
    title,
    slug,
    startDate,
    endDate,
    location,
    featuredImage {
      asset -> { url },
      alt
    },
    categories[]->{
      _id,
      title,
      slug
    },
    organizer->{
      _id,
      title,
      slug
    }
  }`

  const results = await client.fetch(query, queryParams)
  return serializeSanityResult(results)
}

// Fetch single event by slug
export async function fetchEventBySlug(slug: string) {
  const result = await client.fetch(`
    *[_type == "event" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      startDate,
      endDate,
      location,
      featuredImage {
        asset -> { url },
        alt
      },
      categories[]->{
        _id,
        title,
        slug
      },
      organizer->{
        _id,
        title,
        slug,
        "logoUrl": logo.asset->url
      }
    }
  `, { slug })

  return serializeSanityResult(result)
}














// =============================================================================
// PROVIDER FETCH FUNCTIONS
// =============================================================================

// Fetch providers with filters
export async function fetchProviders(params?: {
  siteId?: string
  specialty?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const { siteId, specialty, search, limit = 20, offset = 0 } = params || {}
  const conditions = [`_type == "provider"`]
  const queryParams: Record<string, any> = {}

  // CRITICAL: Filter by siteId for multi-tenant
  if (siteId) {
    conditions.push(`siteId == $siteId`)
    queryParams.siteId = siteId
  }

  if (specialty) {
    conditions.push(`$specialty in specialties[]`)
    queryParams.specialty = specialty
  }

  if (search) {
    conditions.push(`name match $search`)
    queryParams.search = `${search}*`
  }

  const whereClause = conditions.join(' && ')
  const rangeClause = `[${offset}...${offset + limit}]`

  const query = `*[${whereClause}] | order(featured desc, name asc) ${rangeClause} {
    _id,
    _type,
    name,
    slug,
    tagline,
    bio,
    "photoUrl": photo.asset->url,
    specialties,
    qualifications,
    yearsExperience,
    phone,
    email,
    website,
    linkedBusinesses[]->{
      _id,
      name,
      slug,
      "logoUrl": logo.asset->url
    },
    featured,
    verified,
    category->{
      _id,
      title,
      slug
    }
  }`

  const results = await client.fetch(query, queryParams)
  return serializeSanityResult(results)
}

// Fetch single provider by slug
export async function fetchProviderBySlug(slug: string) {
  const query = `*[_type == "provider" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    slug,
    tagline,
    bio,
    "photoUrl": photo.asset->url,
    specialties,
    qualifications,
    certifications,
    awards,
    yearsOfExperience,
    languages,
    "phone": contactInfo.phone,
    "email": contactInfo.email,
    website,
    bookingUrl,
    socialLinks,
    founded,
    employees,
    linkedBusinesses[]->{
      _id,
      name,
      slug,
      "logoUrl": logo.asset->url,
      address,
      city,
      state,
      "phone": contactInfo.phone,
      website
    },
    featured,
    verified,
    category->{
      _id,
      title,
      slug
    },
    seoTitle,
    seoDescription,
    siteId,
    publishedAt
  }`

  const result = await client.fetch(query, { slug })
  return serializeSanityResult(result)
}
// Fetch providers related to a business
export async function fetchRelatedProviders(businessId: string, limit: number = 4) {
  const query = `*[_type == "provider" && references($businessId)] | order(featured desc, name asc) [0...${limit}] {
    _id,
    name,
    slug,
    tagline,
    "photoUrl": photo.asset->url,
    specialties,
    verified,
    featured
  }`

  const results = await client.fetch(query, { businessId })
  return serializeSanityResult(results)
}

// =============================================================================
// SERVICE FETCH FUNCTIONS
// =============================================================================

// Fetch services with filters
export async function fetchServices(params?: {
  siteId?: string
  providerId?: string
  category?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const { siteId, providerId, category, search, limit = 20, offset = 0 } = params || {}
  const conditions = [`_type == "service"`, `published == true`]
  const queryParams: Record<string, any> = {}

  // CRITICAL: Filter by siteId for multi-tenant
  if (siteId) {
    conditions.push(`siteId == $siteId`)
    queryParams.siteId = siteId
  }

  if (providerId) {
    conditions.push(`provider._ref == $providerId`)
    queryParams.providerId = providerId
  }

  if (category) {
    conditions.push(`category->slug.current == $category`)
    queryParams.category = category
  }

  if (search) {
    conditions.push(`name match $search`)
    queryParams.search = `${search}*`
  }

  const whereClause = conditions.join(' && ')
  const rangeClause = `[${offset}...${offset + limit}]`

  const query = `*[${whereClause}] | order(featured desc, name asc) ${rangeClause} {
    _id,
    _type,
    name,
    slug,
    excerpt,
    "imageUrl": featuredImage.asset->url,
    provider->{
      _id,
      name,
      slug,
      "photoUrl": photo.asset->url
    },
    business->{
      _id,
      name,
      slug
    },
    pricing,
    duration,
    deliveryMode,
    featured,
    category->{
      _id,
      title,
      slug
    }
  }`

  const results = await client.fetch(query, queryParams)
  return serializeSanityResult(results)
}

// Fetch single service by slug
export async function fetchServiceBySlug(slug: string) {
  const query = `*[_type == "service" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    slug,
    description,
    excerpt,
    "imageUrl": featuredImage.asset->url,
    provider->{
      _id,
      name,
      slug,
      tagline,
      "photoUrl": photo.asset->url,
      specialties,
      phone,
      email,
      website,
      verified
    },
    business->{
      _id,
      name,
      slug,
      "logoUrl": logo.asset->url,
      address,
      city,
      state,
      phone,
      website
    },
    pricing,
    duration,
    deliveryMode,
    maxParticipants,
    minParticipants,
    bookingIntegration,
    requirements,
    targetAudience,
    featured,
    category->{
      _id,
      title,
      slug
    },
    seoTitle,
    seoDescription
  }`

  const result = await client.fetch(query, { slug })
  return serializeSanityResult(result)
}

// Fetch services related to a provider
export async function fetchRelatedServices(providerId: string, limit: number = 4) {
  const query = `*[_type == "service" && provider._ref == $providerId && published == true] | order(featured desc, name asc) [0...${limit}] {
    _id,
    name,
    slug,
    excerpt,
    "imageUrl": featuredImage.asset->url,
    pricing,
    duration,
    featured
  }`

  const results = await client.fetch(query, { providerId })
  return serializeSanityResult(results)
}

// =============================================================================
// SITE SETTINGS FETCH FUNCTION
// =============================================================================

// Fetch site settings (including contentTypes config)
export async function fetchSiteSettings(siteId: string) {
  const query = `*[_type == "siteSettings" && siteId == $siteId][0] {
    _id,
    siteId,
    siteName,
    tagline,
    logo,
    primaryColor,
    accentColor,
    contactEmail,
    socialLinks,
    contentTypes,
    enabledModules
  }`

  const result = await client.fetch(query, { siteId })
  return serializeSanityResult(result)
}

// Helper: Get content type config with fallback to defaults
export async function getContentTypeConfig(siteId: string) {
  const settings = await fetchSiteSettings(siteId)

  // Return contentTypes config or fallback to defaults
  return settings?.contentTypes || {
    software: { enabled: false, label: 'Software', singularLabel: 'Software', route: '/software' },
    business: { enabled: false, label: 'Businesses', singularLabel: 'Business', route: '/business' },
    provider: { enabled: false, label: 'Practitioners', singularLabel: 'Practitioner', route: '/practitioners', allowSelfSignup: false },
    service: { enabled: false, label: 'Services', singularLabel: 'Service', route: '/services' }
  }
}

/**
 * Detect site type by checking what content exists in Sanity
 * Returns 'directory' if site has business/software listings
 * Returns 'wordpress' if site has articles/pages
 * Returns 'unknown' if unclear
 */
export async function detectSiteType(siteId: string): Promise<'directory' | 'wordpress' | 'unknown'> {
  const query = `{
    "businessCount": count(*[_type == "business" && siteId == $siteId]),
    "softwareCount": count(*[_type == "software" && siteId == $siteId]),
    "articleCount": count(*[_type == "article" && siteId == $siteId])
  }`

  const result = await client.fetch(query, { siteId })

  // Directory site if it has business or software listings
  if (result.businessCount > 0 || result.softwareCount > 0) {
    return 'directory'
  }

  // WordPress site if it has articles
  if (result.articleCount > 0) {
    return 'wordpress'
  }

  // Unknown if no content found
  return 'unknown'
}

/**
 * Fetch homepage settings for a specific site
 *
 * Homepage settings control which sections appear on the homepage,
 * their order, limits, and display configuration.
 *
 * @param siteId - Site identifier (e.g., 'etomite-org')
 * @returns Homepage configuration or null if not found
 *
 * @example
 * const settings = await fetchHomepageSettings('etomite-org')
 * if (settings) {
 *   // Use custom settings
 *   renderHomepage(settings)
 * } else {
 *   // Use smart defaults
 *   renderHomepage(getDefaultHomepageConfig('etomite-org'))
 * }
 */
export async function fetchHomepageSettings(siteId: string) {
  try {
    const query = `*[_type == "homepageSettings" && siteId == $siteId][0] {
      _id,
      siteId,
      hero {
        title,
        subtitle,
        ctaText,
        ctaLink
      },
      sections[] {
        order,
        type,
        enabled,
        limit,
        sortBy,
        title,
        subtitle
      }
    }`

    const result = await client.fetch(query, { siteId })
    return result ? serializeSanityResult(result) : null
  } catch (error) {
    console.error('Failed to fetch homepage settings:', error)
    return null
  }
}

