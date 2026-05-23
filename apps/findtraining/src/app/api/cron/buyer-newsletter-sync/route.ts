// GET /api/cron/buyer-newsletter-sync
// Syncs new ft_buyer_signups rows into a Resend audience for the HR-manager
// newsletter (REV-P5-1). Designed to run daily; idempotent — already-synced
// contacts are skipped silently.
//
// To enable:
//   1. Set RESEND_BUYER_AUDIENCE_ID in Vercel env vars (create the audience
//      first in the Resend dashboard).
//   2. Set CRON_SECRET in Vercel env vars.
//   3. Add to vercel.json:
//        { "path": "/api/cron/buyer-newsletter-sync", "schedule": "0 10 * * *" }
//      (Daily at 10:00 UTC.)
//
// This route does NOT send the newsletter itself. Audience members receive
// the newsletter when Patrick creates a broadcast in the Resend dashboard.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET
  if (!expectedSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const audienceId = process.env.RESEND_BUYER_AUDIENCE_ID
  if (!audienceId) {
    return NextResponse.json({ error: 'RESEND_BUYER_AUDIENCE_ID not configured' }, { status: 503 })
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 })
  }

  const supabase = getServiceClient()
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Pull all active (not unsubscribed) buyer signups from the last 90 days.
  // Resend's contacts.create is idempotent on (audience, email) — passing
  // an existing contact returns success without duplicating.
  const ninetyDaysAgoISO = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: signups, error } = await supabase
    .from('ft_buyer_signups')
    .select('email, country_code, category_slug, created_at')
    .is('unsubscribed_at', null)
    .gte('created_at', ninetyDaysAgoISO)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: `Query failed: ${error.message}` }, { status: 500 })
  }

  let synced = 0
  let skipped = 0
  const errors: Array<{ email: string; error: string }> = []

  for (const s of signups ?? []) {
    if (!s.email) continue
    try {
      await resend.contacts.create({
        email: s.email,
        audienceId,
        unsubscribed: false,
      })
      synced += 1
    } catch (err) {
      // Resend treats duplicate-contact as success in some SDK versions and
      // throws in others. Track but don't abort the batch.
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (msg.toLowerCase().includes('exist')) {
        skipped += 1
      } else {
        errors.push({ email: s.email, error: msg })
      }
    }
  }

  return NextResponse.json({
    candidates: signups?.length ?? 0,
    synced,
    skipped,
    errors: errors.length,
    error_samples: errors.slice(0, 5),
  })
}
