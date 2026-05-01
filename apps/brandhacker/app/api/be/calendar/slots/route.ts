/**
 * GET /api/be/calendar/slots
 *
 * Query params:
 *   slug     — tenant slug (required)
 *   view     — '7d' | '30d' (default '7d')
 *   from     — ISO date string for window start (default: today)
 *   platform — channel filter: 'all' | 'linkedin' | 'instagram' | 'x' | 'tiktok' | 'facebook' | 'email' | 'blog'
 *
 * Auth: BH_INTERNAL_TOKEN (x-bh-internal header). Fail-open in dev.
 */

import type { NextRequest } from 'next/server'
import { getServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const VALID_PLATFORMS = ['all', 'linkedin', 'instagram', 'x', 'tiktok', 'facebook', 'email', 'blog'] as const
type Platform = (typeof VALID_PLATFORMS)[number]

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.BH_INTERNAL_TOKEN
  if (!token) return true
  return req.headers.get('x-bh-internal') === token
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const slug = searchParams.get('slug')?.trim()
  const view = searchParams.get('view') === '30d' ? '30d' : '7d'
  const fromParam = searchParams.get('from')
  const platformParam = (searchParams.get('platform') ?? 'all') as Platform

  if (!slug) {
    return Response.json({ error: 'slug is required' }, { status: 400 })
  }

  if (!VALID_PLATFORMS.includes(platformParam)) {
    return Response.json({ error: 'invalid platform' }, { status: 400 })
  }

  const fromDate = fromParam ? new Date(fromParam) : new Date()
  if (isNaN(fromDate.getTime())) {
    return Response.json({ error: 'invalid from date' }, { status: 400 })
  }

  // Align to day start
  fromDate.setHours(0, 0, 0, 0)
  const toDate = new Date(fromDate)
  toDate.setDate(toDate.getDate() + (view === '30d' ? 30 : 7))

  const sb = getServiceRoleClient()

  // Resolve slug → client
  const { data: client, error: clientErr } = await sb
    .from('wv_be_clients')
    .select('id, display_name, current_tier, metadata')
    .eq('metadata->>slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (clientErr) {
    console.error('[calendar/slots] client lookup error', { slug, error: clientErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!client) {
    return Response.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // Fetch slots in window
  let query = sb
    .from('wv_be_calendar_slots')
    .select(`
      id, calendar_id, client_id, slot_index, channel, piece_type,
      scheduled_for, topic_brief, status, approval_state,
      sla_state, sla_target_at, reschedule_count,
      draft_id, publish_id, created_at, updated_at
    `)
    .eq('client_id', client.id)
    .gte('scheduled_for', fromDate.toISOString())
    .lt('scheduled_for', toDate.toISOString())
    .order('scheduled_for', { ascending: true })

  if (platformParam !== 'all') {
    query = query.eq('channel', platformParam)
  }

  const { data: slots, error: slotsErr } = await query

  if (slotsErr) {
    console.error('[calendar/slots] slots query error', { slug, error: slotsErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  return Response.json({
    client: {
      id: client.id,
      display_name: client.display_name,
      tier: client.current_tier,
      slug,
    },
    window: {
      view,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      platform: platformParam,
    },
    slots: slots ?? [],
  })
}
