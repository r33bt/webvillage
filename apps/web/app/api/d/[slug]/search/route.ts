// GET /api/d/[slug]/search
// Full-text + filter search across a directory's listings.
// Alias of /listings with q param — kept as a distinct endpoint for clarity.
// Public read — no auth required.

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

  const q = searchParams.get('q')
  if (!q || q.trim().length < 2) {
    return apiError("Query param 'q' must be at least 2 characters", 400)
  }

  const directory = await getDirectory(slug)
  if (!directory) {
    return apiError(`Directory '${slug}' not found`, 404)
  }

  const filters: WvListingSearchParams = {
    q:        q.trim(),
    category: searchParams.get('cat') ?? searchParams.get('category') ?? undefined,
    country:  searchParams.get('country') ?? undefined,
    sector:   searchParams.get('sector') ?? undefined,
    page:     parseInt(searchParams.get('page') ?? '1', 10),
    limit:    parseInt(searchParams.get('limit') ?? '24', 10),
  }

  try {
    const result = await searchListings(directory.id, filters)
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Directory': slug,
        'X-Query': q,
      },
    })
  } catch (err) {
    console.error('[GET /api/d/[slug]/search]', err)
    return apiError('Search failed', 500)
  }
}
