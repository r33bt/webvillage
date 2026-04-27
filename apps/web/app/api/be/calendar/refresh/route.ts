// apps/web/app/api/be/calendar/refresh/route.ts
// Slice 9: manual REFRESH MATERIALIZED VIEW CONCURRENTLY trigger. Rate-limited 1/min/client.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 30

const RequestSchema = z.object({
  client_id: z.string().uuid(),
})

// In-memory rate limiter — keyed by client_id, last call timestamp
const lastCallByClient = new Map<string, number>()
const COOLDOWN_MS = 60_000  // 60 sec between manual refreshes per client

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RequestSchema>
  try {
    body = RequestSchema.parse(await req.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation_failed', details: err.flatten() }, { status: 400 })
    }
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Rate limit
  const lastCall = lastCallByClient.get(body.client_id)
  if (lastCall && Date.now() - lastCall < COOLDOWN_MS) {
    const remainingSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastCall)) / 1000)
    return NextResponse.json(
      { error: 'rate_limited', cooldown_remaining_sec: remainingSec },
      { status: 429, headers: { 'Retry-After': String(remainingSec) } }
    )
  }

  const sb = createSupabaseServiceClient()

  // Run REFRESH via SECURITY DEFINER function (Migration 0009 created refresh_wv_be_mv_editorial_calendar)
  const t0 = Date.now()
  const { error: refreshErr } = await sb.rpc('refresh_wv_be_mv_editorial_calendar')
  if (refreshErr) {
    return NextResponse.json(
      { error: 'refresh_failed', detail: refreshErr.message },
      { status: 500 }
    )
  }
  const durationMs = Date.now() - t0

  // Count rows for this client
  const { count } = await sb
    .from('wv_be_mv_editorial_calendar')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', body.client_id)

  // Update rate limiter
  lastCallByClient.set(body.client_id, Date.now())

  // Audit
  await sb.from('wv_be_audit_log').insert({
    client_id: body.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'calendar_refresh_triggered',
    target_table: 'wv_be_mv_editorial_calendar',
    target_id: null,
    after_state: {
      refreshed_at: new Date().toISOString(),
      duration_ms: durationMs,
      rows_in_view: count ?? 0,
      trigger_source: 'manual',
    },
  })

  return NextResponse.json({
    refreshed_at: new Date().toISOString(),
    duration_ms: durationMs,
    rows_in_view: count ?? 0,
  })
}
