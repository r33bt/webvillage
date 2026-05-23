// GET /api/cron/welcome-followup
// Daily cron that sends Day-3 and Day-7 welcome follow-ups to paid founding members.
//
// Not yet wired to a Vercel cron schedule. To enable:
//   1. Add an entry to vercel.json:
//        {
//          "crons": [
//            { "path": "/api/cron/welcome-followup", "schedule": "0 9 * * *" }
//          ]
//        }
//      (Daily at 09:00 UTC.)
//   2. Set CRON_SECRET in Vercel env vars.
//   3. (Optional but recommended) Add `welcome_day3_sent_at` and
//      `welcome_day7_sent_at` columns to `ft_founding_members` to prevent
//      double-send on cron retries. Without those columns this route relies
//      on the daily-cron window and may double-send if Vercel retries the
//      cron within the same UTC day.
//
// Auth: Bearer CRON_SECRET (matches Vercel cron secret pattern).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildDay3, buildDay7, sendWelcomeEmail } from '@/lib/email/welcome-sequence'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function isWithinHours(timestampISO: string, lowerHours: number, upperHours: number): boolean {
  const ageMs = Date.now() - new Date(timestampISO).getTime()
  const ageHours = ageMs / 3_600_000
  return ageHours >= lowerHours && ageHours < upperHours
}

export async function GET(request: NextRequest) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.CRON_SECRET
  if (!expectedSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  // Pull paid founding members whose payment was within the last 8 days.
  // 7 to 8 days = Day 7 candidates; 3 to 4 days = Day 3 candidates.
  const eightDaysAgoISO = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  const { data: members, error } = await supabase
    .from('ft_founding_members')
    .select('id, email, name, company_name, updated_at, status')
    .eq('status', 'paid')
    .gte('updated_at', eightDaysAgoISO)

  if (error) {
    return NextResponse.json({ error: `Query failed: ${error.message}` }, { status: 500 })
  }

  const results: Array<{ id: string; touch: string; ok: boolean; error?: string }> = []

  for (const m of members ?? []) {
    if (!m.email || !m.name || !m.company_name || !m.updated_at) continue

    const recipient = {
      email: m.email,
      name: m.name,
      company_name: m.company_name,
      tier: 'founding' as const,
    }

    // Day 3 window: 72h–96h after payment timestamp.
    if (isWithinHours(m.updated_at, 72, 96)) {
      const res = await sendWelcomeEmail(m.email, buildDay3(recipient))
      results.push({ id: m.id, touch: 'day3', ...res })
      continue
    }

    // Day 7 window: 168h–192h after payment timestamp.
    if (isWithinHours(m.updated_at, 168, 192)) {
      const res = await sendWelcomeEmail(m.email, buildDay7(recipient))
      results.push({ id: m.id, touch: 'day7', ...res })
      continue
    }
  }

  return NextResponse.json({
    processed: results.length,
    candidates_scanned: members?.length ?? 0,
    results,
  })
}
