// POST /api/admin/migrate-founding
// Manual admin trigger — run at Month 4 to convert founding members → Starter tier.
// Protected by ADMIN_SECRET header. NOT automated.
//
// For each ft_founding_members row where:
//   status IN ('active', 'paid', 'onboarded') AND migrated_at IS NULL AND provider_id IS NOT NULL
// This route:
//   1. Sets ft_providers.tier = 'starter' for the linked provider
//   2. Marks the founding member as migrated (migrated_at, status='migrated')
//   3. Sends a Resend transactional email to the member
//
// Returns: { migrated: N, errors: string[] }

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// ---------------------------------------------------------------------------
// Supabase service client (bypasses RLS)
// ---------------------------------------------------------------------------
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FoundingRow {
  id: string
  email: string
  name: string
  company_name: string | null
  provider_id: string
  status: string
}

// ---------------------------------------------------------------------------
// Email helper
// ---------------------------------------------------------------------------
async function sendMigrationEmail(member: FoundingRow): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'FindTraining <hello@findtraining.com>',
      to: member.email,
      subject: 'Your FindTraining founding membership is converting to Starter',
      text: [
        `Hi ${member.name},`,
        '',
        'Thank you for being a founding member of FindTraining.',
        '',
        'As promised, your founding period has now ended and your listing has been',
        'converted to the Starter plan.',
        '',
        'What this means:',
        '  - Your listing remains active and visible',
        '  - Your founding badge stays permanently on your profile',
        '  - Your account is now on the Starter tier (RM 300/mo)',
        '',
        'If you have any questions, reply to this email and we will help.',
        '',
        'Thank you for being with us from the start.',
        '',
        'The FindTraining Team',
        'https://findtraining.com',
      ].join('\n'),
    })
  } catch (err) {
    // Log but don't throw — migration still succeeds even if email fails
    console.error(`[migrate-founding] email failed for ${member.email}:`, err)
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth check ────────────────────────────────────────────────────────────
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET env var not set.' },
      { status: 500 }
    )
  }

  const providedSecret = request.headers.get('ADMIN_SECRET')
  if (!providedSecret || providedSecret !== adminSecret) {
    return NextResponse.json(
      { error: 'Unauthorized. Provide a valid ADMIN_SECRET header.' },
      { status: 401 }
    )
  }

  // ── Fetch founding members eligible for migration ─────────────────────────
  const supabase = getServiceClient()

  const { data: members, error: fetchError } = await supabase
    .from('ft_founding_members')
    .select('id, email, name, company_name, provider_id, status')
    .in('status', ['active', 'paid', 'onboarded'])
    .is('migrated_at', null)
    .not('provider_id', 'is', null)

  if (fetchError) {
    console.error('[migrate-founding] fetch error:', fetchError.message)
    return NextResponse.json(
      { error: `Failed to fetch founding members: ${fetchError.message}` },
      { status: 500 }
    )
  }

  const rows = (members ?? []) as FoundingRow[]

  if (rows.length === 0) {
    return NextResponse.json(
      { migrated: 0, errors: [], message: 'No eligible founding members found.' },
      { status: 200 }
    )
  }

  // ── Process each member ───────────────────────────────────────────────────
  let migratedCount = 0
  const errors: string[] = []

  for (const member of rows) {
    try {
      // 1. Upgrade provider tier to 'starter'
      const { error: providerError } = await supabase
        .from('ft_providers')
        .update({ tier: 'starter', updated_at: new Date().toISOString() })
        .eq('id', member.provider_id)

      if (providerError) {
        errors.push(
          `[${member.email}] provider update failed: ${providerError.message}`
        )
        continue
      }

      // 2. Mark founding member as migrated
      const now = new Date().toISOString()
      const { error: memberError } = await supabase
        .from('ft_founding_members')
        .update({
          status: 'migrated',
          migrated_at: now,
          updated_at: now,
        })
        .eq('id', member.id)

      if (memberError) {
        errors.push(
          `[${member.email}] founding member update failed: ${memberError.message}`
        )
        continue
      }

      // 3. Send migration email (fire-and-forget — errors logged, not blocking)
      await sendMigrationEmail(member)

      // 4. Record email sent timestamp (best-effort)
      await supabase
        .from('ft_founding_members')
        .update({ migration_email_sent_at: new Date().toISOString() })
        .eq('id', member.id)

      migratedCount++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`[${member.email}] unexpected error: ${msg}`)
    }
  }

  console.log(
    `[migrate-founding] Done. migrated=${migratedCount}, errors=${errors.length}`
  )

  return NextResponse.json(
    { migrated: migratedCount, errors },
    { status: 200 }
  )
}
