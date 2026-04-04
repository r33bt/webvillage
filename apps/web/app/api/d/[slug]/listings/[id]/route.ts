// GET /api/d/[slug]/listings/[id]
// Returns a single listing by slug or UUID.
// Public read — no auth required.

import { NextResponse } from 'next/server'
import { getDirectory, getListingBySlug, getListingById } from '@webvillage/engine'
import { apiError } from '@/lib/api-auth'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params

  const directory = await getDirectory(slug)
  if (!directory) {
    return apiError(`Directory '${slug}' not found`, 404)
  }

  try {
    // id can be either a UUID or a listing slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const listing = isUuid
      ? await getListingById(id)
      : await getListingBySlug(directory.id, id)

    if (!listing) {
      return apiError(`Listing '${id}' not found`, 404)
    }

    // Ensure listing belongs to this directory
    if (listing.directory_id !== directory.id) {
      return apiError(`Listing '${id}' not found`, 404)
    }

    return NextResponse.json({ data: listing }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Directory': slug,
      },
    })
  } catch (err) {
    console.error('[GET /api/d/[slug]/listings/[id]]', err)
    return apiError('Failed to fetch listing', 500)
  }
}
