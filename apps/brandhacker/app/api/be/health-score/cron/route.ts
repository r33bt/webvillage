/**
 * POST /api/be/health-score/cron
 * Weekly Brand Health Score processor. Called by Vercel Cron on Mondays at 08:00 UTC.
 *
 * For each active tenant:
 *   1. Compute AEO coverage % + voice consistency from last 10 scored drafts
 *   2. Persist composite score to metadata.health_scores[weekKey]
 *   3. Send weekly email digest (fail-soft — skipped if RESEND_API_KEY not configured)
 *
 * Protected by CRON_SECRET env var (Vercel sets Authorization: Bearer <secret>).
 *
 * Env vars required:
 *   CRON_SECRET           — set in Vercel
 *   RESEND_API_KEY        — from resend.com (optional; email skipped if absent — BLK-4)
 *   RESEND_FROM_EMAIL     — defaults to hello@brandhacker.com
 *   NEXT_PUBLIC_SITE_URL  — defaults to https://app.brandhacker.com
 */

import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase-server'
import { getServiceRoleClient } from '@/lib/supabase'
import {
  computeHealthScore,
  getWeekKey,
  getPrevWeekKey,
  type StoredWeekScore,
} from '@/lib/health-score'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------

function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

// ---------------------------------------------------------------------------
// Resend client (lazy, fail-soft)
// ---------------------------------------------------------------------------

let _resend: Resend | null = null
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!_resend) _resend = new Resend(key)
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@brandhacker.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.brandhacker.com'

// ---------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------

function trendText(current: number, previous: number | undefined): string {
  if (previous === undefined) return ''
  const delta = current - previous
  if (delta > 0) return `+${delta} vs last week`
  if (delta < 0) return `${delta} vs last week`
  return 'no change vs last week'
}

function scoreEmailHtml(displayName: string, score: number, trend: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#e4e4e7;font-family:system-ui,-apple-system,sans-serif;margin:0;padding:32px 24px">
  <div style="max-width:480px;margin:0 auto">
    <p style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#52525b;margin:0 0 20px">BrandHacker · Weekly Score</p>
    <h1 style="font-size:18px;font-weight:600;color:#fafafa;margin:0 0 4px">${displayName}</h1>
    <p style="font-size:11px;color:#71717a;margin:0 0 20px">Brand Health Score — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:${trend ? '8px' : '24px'}">
      <span style="font-size:56px;font-weight:700;color:#fafafa;line-height:1">${score}</span>
      <span style="font-size:16px;color:#52525b;font-weight:400">/ 100</span>
    </div>
    ${trend ? `<p style="font-size:13px;color:#71717a;margin:0 0 24px">${trend}</p>` : ''}
    <hr style="border:none;border-top:1px solid #27272a;margin:0 0 20px">
    <p style="font-size:13px;color:#a1a1aa;margin:0 0 20px;line-height:1.6">A composite of your AEO surface freshness (are your /llms.txt and brand.json current?) and voice consistency across your last 10 scored drafts.</p>
    <a href="${SITE_URL}/app" style="display:inline-block;background:#fafafa;color:#0a0a0a;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none">View dashboard →</a>
    <p style="font-size:11px;color:#3f3f46;margin:28px 0 0">BrandHacker · <a href="${SITE_URL}" style="color:#3f3f46;text-decoration:none">app.brandhacker.com</a></p>
  </div>
</body></html>`
}

// ---------------------------------------------------------------------------
// POST /api/be/health-score/cron
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = getServiceRoleClient()
  const adminSb = createAdminClient()
  const resend = getResend()

  const { data: clients, error: clientsErr } = await sb
    .from('wv_be_clients')
    .select('id, display_name, metadata')
    .is('deleted_at', null)
    .neq('lifecycle_stage', 'cancelled')

  if (clientsErr || !clients) {
    console.error('[health-score/cron] clients fetch error', clientsErr?.message)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  const weekKey = getWeekKey()
  const prevWeekKey = getPrevWeekKey()

  let processed = 0
  let emailed = 0
  const errors: string[] = []

  for (const client of clients) {
    try {
      // 1. Fetch AEO artefacts + recent scores in parallel
      const [aeoRes, scoresRes] = await Promise.all([
        sb
          .from('wv_be_aeo_artefacts')
          .select('artefact_type, generated_at')
          .eq('client_id', client.id),
        sb
          .from('wv_be_scores')
          .select('scores')
          .eq('client_id', client.id)
          .order('scored_at', { ascending: false })
          .limit(10),
      ])

      const result = computeHealthScore(aeoRes.data ?? [], scoresRes.data ?? [])
      if (!result) continue

      const { score, aeoCoverage, voiceConsistency } = result
      const meta = (client.metadata ?? {}) as Record<string, unknown>
      const stored = (meta.health_scores ?? {}) as Record<string, StoredWeekScore>
      const prevScore = stored[prevWeekKey]?.score

      // 2. Persist this week's score
      const { error: updateErr } = await sb
        .from('wv_be_clients')
        .update({
          metadata: {
            ...meta,
            health_scores: {
              ...stored,
              [weekKey]: {
                score,
                aeo: aeoCoverage,
                voice: voiceConsistency,
                computed_at: new Date().toISOString(),
              } satisfies StoredWeekScore,
            },
          },
        })
        .eq('id', client.id)

      if (updateErr) {
        console.error('[health-score/cron] metadata update error', {
          client_id: client.id,
          error: updateErr.message,
        })
        errors.push(client.id)
        continue
      }

      processed++

      // 3. Send weekly email (fail-soft — BLK-4)
      if (!resend) continue

      const { data: linkRow } = await sb
        .from('wv_be_client_users')
        .select('user_id')
        .eq('client_id', client.id)
        .eq('role', 'admin')
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle()

      if (!linkRow?.user_id) continue

      const { data: authUser } = await adminSb.auth.admin.getUserById(linkRow.user_id)
      const email = authUser?.user?.email
      if (!email) continue

      const { error: sendErr } = await resend.emails.send({
        from: `BrandHacker <${FROM}>`,
        to: email,
        subject: `Your Brand Health Score this week: ${score}/100`,
        html: scoreEmailHtml(client.display_name, score, trendText(score, prevScore)),
      })

      if (sendErr) {
        console.error('[health-score/cron] email send error', {
          client_id: client.id,
          error: sendErr.message,
        })
      } else {
        emailed++
      }
    } catch (err) {
      console.error('[health-score/cron] unexpected error', {
        client_id: client.id,
        error: String(err),
      })
      errors.push(client.id)
    }
  }

  return Response.json({ weekKey, processed, emailed, errors })
}
