// GET /api/d/[slug]/categories
// Returns the full category tree for a directory.
// Public read — no auth required.

import { NextResponse } from 'next/server'
import { getDirectory, getCategories } from '@webvillage/engine'
import { apiError } from '@/lib/api-auth'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const directory = await getDirectory(slug)
  if (!directory) {
    return apiError(`Directory '${slug}' not found`, 404)
  }

  try {
    const categories = await getCategories(directory.id)

    // Build a tree from the flat list
    const byId = new Map(categories.map((c) => ({ ...c, children: [] as typeof categories })).map((c) => [c.id, c]))
    const roots: typeof categories = []

    for (const cat of byId.values()) {
      if (cat.parent_id && byId.has(cat.parent_id)) {
        byId.get(cat.parent_id)!.children.push(cat)
      } else {
        roots.push(cat)
      }
    }

    return NextResponse.json(
      { data: roots, total: categories.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-Directory': slug,
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/d/[slug]/categories]', err)
    return apiError('Failed to fetch categories', 500)
  }
}
