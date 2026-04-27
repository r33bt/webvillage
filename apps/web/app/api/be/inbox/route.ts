// apps/web/app/api/be/inbox/route.ts
// Slice 7: GET inbox events for a client.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const clientId = url.searchParams.get('client_id')
  const unread = url.searchParams.get('unread') === 'true'
  const eventType = url.searchParams.get('event_type')
  const hasReply = url.searchParams.get('has_reply')
  const limit = Math.min(200, parseInt(url.searchParams.get('limit') ?? '50', 10) || 50)

  if (!clientId || !z.string().uuid().safeParse(clientId).success) {
    return NextResponse.json({ error: 'invalid_client_id' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()
  let q = sb
    .from('wv_be_inbox_events')
    .select('id, vista_event_id, event_type, source_handle, source_display_name, source_excerpt, received_at, occurred_at, reply_sent_at, dismissed_at, reply_draft_id, send_failure_reason')
    .eq('client_id', clientId)
    .order('received_at', { ascending: false })
    .limit(limit)

  if (unread) {
    q = q.is('reply_sent_at', null).is('dismissed_at', null)
  }
  if (eventType && ['mention', 'dm', 'comment', 'reaction'].includes(eventType)) {
    q = q.eq('event_type', eventType)
  }
  if (hasReply === 'true') {
    q = q.not('reply_sent_at', 'is', null)
  }

  const { data: events, error } = await q
  if (error) {
    return NextResponse.json({ error: 'fetch_failed', detail: error.message }, { status: 500 })
  }

  // For each event, also surface count of existing reply drafts (useful for "has_drafted_variants")
  const eventIds = (events ?? []).map((e) => e.id as string)
  const draftedSet = new Set<string>()
  if (eventIds.length > 0) {
    const { data: drafts } = await sb
      .from('wv_be_drafts')
      .select('inbox_event_id')
      .in('inbox_event_id', eventIds)
      .eq('source_type', 'reply')
    for (const d of drafts ?? []) {
      if (d.inbox_event_id) draftedSet.add(d.inbox_event_id as string)
    }
  }

  return NextResponse.json({
    events: (events ?? []).map((e) => ({
      ...e,
      has_drafted_variants: draftedSet.has(e.id as string),
    })),
  })
}
