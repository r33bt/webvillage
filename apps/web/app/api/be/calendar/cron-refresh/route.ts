// apps/web/app/api/be/calendar/cron-refresh/route.ts
// Slice 9: Vercel cron handler — runs REFRESH MATERIALIZED VIEW CONCURRENTLY every 15 min.
// pg_cron is not enabled on this Supabase instance, so this route substitutes.

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(_req: NextRequest) {
  // Cron auth check — Vercel sends Authorization: Bearer ${CRON_SECRET}
  const h = await headers()
  const auth = h.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const sb = createSupabaseServiceClient()
  const t0 = Date.now()
  const { error } = await sb.rpc('refresh_wv_be_mv_editorial_calendar')
  const durationMs = Date.now() - t0

  if (error) {
    console.error('[calendar cron-refresh] failed:', error)
    return NextResponse.json({ error: 'refresh_failed', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ refreshed_at: new Date().toISOString(), duration_ms: durationMs })
}

// Allow GET for Vercel cron dashboard testing
export async function GET(req: NextRequest) {
  return POST(req)
}
