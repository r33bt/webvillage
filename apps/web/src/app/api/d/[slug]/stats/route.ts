// GET /api/d/[slug]/stats
// Returns public statistics for a directory node.
// Public read — no auth required.

import { NextResponse } from 'next/server'
import { getDirectory, getDirectoryStats } from '@webvillage/engine'
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
    const stats = await getDirectoryStats(directory.id)

    return NextResponse.json(
      {
        data: {
          directory: {
            id: directory.id,
            slug: directory.slug,
            name: directory.name,
            type: directory.type,
            country: directory.country,
          },
          ...stats,
          last_updated: directory.updated_at,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          'X-Directory': slug,
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/d/[slug]/stats]', err)
    return apiError('Failed to fetch stats', 500)
  }
}
