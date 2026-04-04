// POST /api/d/[slug]/submit
// Submit a new listing to a directory.
// Requires API key with 'write' scope OR is rate-limited to public submissions.
//
// Public submission (no API key): listing goes into moderation queue (profile_status = 'unclaimed')
// Authenticated submission (write key): listing is published immediately

import { NextResponse } from 'next/server'
import { getDirectory } from '@webvillage/engine'
import type { WvListingSubmitBody } from '@webvillage/engine'
import { verifyApiKey, apiError } from '@/lib/api-auth'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function makeUniqueSlug(directoryId: string, base: string): Promise<string> {
  const supabase = createSupabaseServiceClient()
  const slug = slugify(base)
  let attempts = 0

  while (attempts < 10) {
    const { data } = await supabase
      .from('wv_listings')
      .select('id')
      .eq('directory_id', directoryId)
      .eq('slug', attempts === 0 ? slug : `${slug}-${attempts}`)
      .single()

    if (!data) return attempts === 0 ? slug : `${slug}-${attempts}`
    attempts++
  }

  // Fallback: append timestamp
  return `${slug}-${Date.now()}`
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const directory = await getDirectory(slug)
  if (!directory) {
    return apiError(`Directory '${slug}' not found`, 404)
  }

  // Determine if this is an authenticated or public submission
  const authHeader = request.headers.get('Authorization')
  let isAuthenticated = false

  if (authHeader?.startsWith('Bearer ')) {
    const auth = await verifyApiKey(request, slug, 'write')
    if (!auth.ok) return auth.error
    isAuthenticated = true
  }

  // Parse and validate body
  let body: WvListingSubmitBody
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  if (!body.name?.trim()) {
    return apiError("'name' is required", 400)
  }
  if (!body.consent) {
    return apiError("'consent' must be true — explicit consent is required", 400)
  }

  // Build listing slug
  const listingSlug = await makeUniqueSlug(directory.id, body.name)

  // Capture consent metadata
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const ipHash = ip
    ? Buffer.from(ip).toString('base64').slice(0, 32)
    : null

  const supabase = createSupabaseServiceClient()

  const { data: listing, error } = await supabase
    .from('wv_listings')
    .insert({
      directory_id:         directory.id,
      slug:                 listingSlug,
      name:                 body.name.trim(),
      tagline:              body.tagline?.trim() ?? null,
      description:          body.description?.trim() ?? null,
      website:              body.website?.trim() ?? null,
      email:                body.email?.trim().toLowerCase() ?? null,
      phone:                body.phone?.trim() ?? null,
      address:              body.address?.trim() ?? null,
      city:                 body.city?.trim() ?? null,
      country:              body.country?.trim().toUpperCase() ?? null,
      trade_sectors:        body.trade_sectors ?? [],
      social_links:         (body.social_links ?? {}) as Record<string, string>,
      profile_status:       isAuthenticated ? 'unclaimed' : 'unclaimed',
      // Both paths start unclaimed — authenticated write keys queue for admin review too.
      // Use the Supabase dashboard or admin API to set profile_status = 'claimed' after review.
      consent_timestamp:    new Date().toISOString(),
      consent_ip_hash:      ipHash,
      consent_form_version: 'v1',
    })
    .select('id, slug, name, profile_status')
    .single()

  if (error) {
    console.error('[POST /api/d/[slug]/submit]', error)
    return apiError('Failed to create listing', 500)
  }

  // Attach category links if provided
  if (body.category_slugs?.length) {
    const { data: cats } = await supabase
      .from('wv_categories')
      .select('id, slug')
      .eq('directory_id', directory.id)
      .in('slug', body.category_slugs)

    if (cats?.length) {
      await supabase
        .from('wv_listing_categories')
        .insert(cats.map((c: { id: string }) => ({ listing_id: listing.id, category_id: c.id })))
    }
  }

  return NextResponse.json(
    {
      data: listing,
      message: 'Listing submitted and pending review.',
    },
    { status: 201 }
  )
}
