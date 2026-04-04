// GET /api/d/[slug]/listings
// Returns a paginated, searchable list of listings for a directory.
// Public read (no auth needed for public directories).
// Write scope required for POST (submit a new listing).

import { NextResponse } from 'next/server'
import { getDirectory, searchListings } from '@webvillage/engine'
import type { WvListingSearchParams } from '@webvillage/engine'
import { apiError } from '@/lib/api-auth'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)

  const directory = await getDirectory(slug)
  if (!directory) {
    return apiError(`Directory '${slug}' not found`, 404)
  }

  const filters: WvListingSearchParams = {
    q:        searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    country:  searchParams.get('country') ?? undefined,
    sector:   searchParams.get('sector') ?? undefined,
    featured: searchParams.get('featured') === 'true' ? true
            : searchParams.get('featured') === 'false' ? false
            : undefined,
    page:  parseInt(searchParams.get('page') ?? '1', 10),
    limit: parseInt(searchParams.get('limit') ?? '24', 10),
  }

  try {
    const result = await searchListings(directory.id, filters)
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Directory': slug,
      },
    })
  } catch (err) {
    console.error('[GET /api/d/[slug]/listings]', err)
    return apiError('Failed to fetch listings', 500)
  }
}
