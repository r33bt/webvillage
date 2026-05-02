/**
 * POST /api/lifecycle/cron
 * Daily lifecycle email processor. Called by Vercel Cron at 08:00 UTC.
 *
 * For each active tenant:
 *   1. Calculate days since created_at
 *   2. Find emails due (day <= days_since, not already sent)
 *   3. Fetch user email via Supabase admin
 *   4. Send via Resend
 *   5. Mark sent in metadata.lifecycle.emails_sent
 *
 * Protected by CRON_SECRET env var (Vercel sets Authorization: Bearer <secret>).
 *
 * Env vars required:
 *   CRON_SECRET           — set in Vercel; auto-passed by Vercel Cron
 *   RESEND_API_KEY        — from resend.com dashboard
 *   RESEND_FROM_EMAIL     — defaults to hello@brandhacker.com
 *   NEXT_PUBLIC_SITE_URL  — defaults to https://app.brandhacker.com
 */

import type { NextRequest } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase-server'
import { getServiceRoleClient } from '@/lib/supabase'
import {
  SEQUENCE,
  getEmailData,
  getDaysSinceCreation,
  getEmailsSentMap,
  buildMetadataWithEmailSent,
} from '@/lib/lifecycle-emails'

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
// Resend client (lazy)
// ---------------------------------------------------------------------------

let _resend: Resend | null = null
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!_resend) _resend = new Resend(key)
  return _resend
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'hello@brandhacker.com'

// ---------------------------------------------------------------------------
// POST /api/lifecycle/cron
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = getResend()
  if (!resend) {
    return Response.json(
      { error: 'RESEND_API_KEY not configured', sent: 0, skipped: 0 },
      { status: 500 },
    )
  }

  const sb = getServiceRoleClient()
  const adminSb = createAdminClient()

  // Fetch all active tenants with lifecycle data
  const { data: clients, error: clientsErr } = await sb
    .from('wv_be_clients')
    .select('id, display_name, created_at, trial_ends_at, lifecycle_stage, metadata')
    .is('deleted_at', null)
    .neq('lifecycle_stage', 'cancelled')

  if (clientsErr || !clients) {
    console.error('[lifecycle/cron] clients fetch error', clientsErr?.message)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const client of clients) {
    try {
      const createdAt = client.created_at as string
      if (!createdAt) continue

      const daysSince = getDaysSinceCreation(createdAt)
      const metadata = (client.metadata ?? {}) as Record<string, unknown>
      const emailsSent = getEmailsSentMap(metadata)

      // Find all emails due for this tenant
      const due = SEQUENCE.filter(
        (e) => e.day > 0 && e.day <= daysSince && !emailsSent[e.key],
      )

      if (!due.length) {
        skipped++
        continue
      }

      // Get the tenant's admin user email
      const { data: linkRow } = await sb
        .from('wv_be_client_users')
        .select('user_id')
        .eq('client_id', client.id)
        .eq('role', 'admin')
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle()

      if (!linkRow?.user_id) {
        skipped++
        continue
      }

      const { data: authUser } = await adminSb.auth.admin.getUserById(linkRow.user_id)
      const email = authUser?.user?.email
      if (!email) {
        skipped++
        continue
      }

      // Get tenant slug from metadata
      const slug =
        ((client.metadata as Record<string, unknown>)?.slug as string) ?? client.id

      const emailData = getEmailData(slug, client.display_name, client.trial_ends_at ?? undefined)

      // Send each due email (oldest first) and mark sent
      let updatedMeta = metadata
      for (const emailDef of due.sort((a, b) => a.day - b.day)) {
        const subject = emailDef.subject(client.display_name)
        const html = emailDef.html(emailData)

        const { error: sendErr } = await resend.emails.send({
          from: `BrandHacker <${FROM}>`,
          to: email,
          subject,
          html,
        })

        if (sendErr) {
          console.error('[lifecycle/cron] send error', {
            client_id: client.id,
            key: emailDef.key,
            error: sendErr.message,
          })
          errors.push(`${client.id}:${emailDef.key}`)
          continue
        }

        updatedMeta = buildMetadataWithEmailSent(updatedMeta, emailDef.key)
        sent++
      }

      // Persist updated metadata (only if at least one email sent)
      if (updatedMeta !== metadata) {
        const { error: updateErr } = await sb
          .from('wv_be_clients')
          .update({ metadata: updatedMeta })
          .eq('id', client.id)

        if (updateErr) {
          console.error('[lifecycle/cron] metadata update error', {
            client_id: client.id,
            error: updateErr.message,
          })
        }
      }
    } catch (err) {
      console.error('[lifecycle/cron] unexpected error for client', {
        client_id: client.id,
        error: String(err),
      })
      errors.push(client.id)
    }
  }

  return Response.json({ sent, skipped, errors })
}
