// apps/web/app/api/be/publishes/route.ts
// Slice 8: GET list of publishes for a client.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const clientId = url.searchParams.get('client_id')
  const status = url.searchParams.get('status')
  const platform = url.searchParams.get('platform')
  const limit = Math.min(200, parseInt(url.searchParams.get('limit') ?? '50', 10) || 50)

  if (!clientId || !z.string().uuid().safeParse(clientId).success) {
    return NextResponse.json({ error: 'invalid_client_id' }, { status: 400 })
  }

  const sb = createSupabaseServiceClient()
  let q = sb
    .from('wv_be_publishes')
    .select('id, draft_id, platforms, status, ayrshare_post_id, scheduled_for, published_at, cancelled_at, failure_reason, parent_publish_id, metadata, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status && ['queued', 'pending', 'scheduled', 'published', 'failed', 'cancelled'].includes(status)) {
    q = q.eq('status', status)
  }
  if (platform) {
    q = q.contains('platforms', [platform])
  }

  const { data: publishes, error } = await q
  if (error) {
    return NextResponse.json({ error: 'fetch_failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ publishes: publishes ?? [] })
}
