// POST /api/admin/claim-action
// Admin endpoint to approve or reject a provider claim.
// Protected by x-admin-token header matching ADMIN_TOKEN env var.
//
// Body: { claimId: string, action: 'approve' | 'reject', providerSlug?: string }
//
// On approve:
//   1. Update ft_claims.status = 'approved'
//   2. Update ft_providers.claimed_by = claimant email (placeholder until full auth)
//   3. Send Resend email to claimant
//
// On reject:
//   1. Update ft_claims.status = 'rejected'
//   2. Send Resend email to claimant

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// ── Supabase service client (bypasses RLS) ────────────────────────────────────
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ── Auth check ────────────────────────────────────────────────────────────────
function isAuthorized(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) return false
  const provided = request.headers.get('x-admin-token')
  return provided === adminToken
}

// ── Email helpers ─────────────────────────────────────────────────────────────
async function sendApprovalEmail(email: string, providerName: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'FindTraining <hello@findtraining.com>',
      to: email,
      subject: `Your claim for ${providerName} has been approved`,
      text: [
        `Hi,`,
        '',
        `Great news — your claim for ${providerName} on FindTraining has been approved.`,
        '',
        'You can now log in to manage your listing:',
        `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://findtraining.com'}/login`,
        '',
        'If you have any questions, reply to this email and we will help.',
        '',
        'The FindTraining Team',
        'https://findtraining.com',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[claim-action] approval email failed:', err)
  }
}

async function sendRejectionEmail(email: string, providerName: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'FindTraining <hello@findtraining.com>',
      to: email,
      subject: `Your claim for ${providerName} has been reviewed`,
      text: [
        `Hi,`,
        '',
        `Thank you for submitting a claim for ${providerName} on FindTraining.`,
        '',
        'Unfortunately, we were unable to verify your connection to this listing.',
        '',
        'If you believe this is an error or would like to appeal, please email us at:',
        'hello@findtraining.com',
        '',
        'The FindTraining Team',
        'https://findtraining.com',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[claim-action] rejection email failed:', err)
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  // Parse body
  let body: { claimId?: unknown; action?: unknown; providerSlug?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { claimId, action } = body

  if (!claimId || typeof claimId !== 'string') {
    return NextResponse.json({ error: 'claimId is required.' }, { status: 400 })
  }
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json(
      { error: 'action must be "approve" or "reject".' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()

  // Fetch the claim
  const { data: claim, error: claimError } = await supabase
    .from('ft_claims')
    .select('id, provider_id, email, status')
    .eq('id', claimId)
    .maybeSingle()

  if (claimError) {
    console.error('[claim-action] fetch claim error:', claimError.message)
    return NextResponse.json({ error: 'Failed to fetch claim.' }, { status: 500 })
  }
  if (!claim) {
    return NextResponse.json({ error: 'Claim not found.' }, { status: 404 })
  }
  if (claim.status !== 'pending') {
    return NextResponse.json(
      { error: `Claim is already ${claim.status}.` },
      { status: 409 }
    )
  }

  // Fetch provider name for emails
  const { data: provider } = await supabase
    .from('ft_providers')
    .select('id, name, slug')
    .eq('id', claim.provider_id)
    .maybeSingle()

  const providerName = (provider as { name?: string } | null)?.name ?? 'your listing'

  if (action === 'approve') {
    // 1. Update claim status
    const { error: claimUpdateError } = await supabase
      .from('ft_claims')
      .update({ status: 'approved' })
      .eq('id', claimId)

    if (claimUpdateError) {
      console.error('[claim-action] claim update error:', claimUpdateError.message)
      return NextResponse.json({ error: 'Failed to update claim status.' }, { status: 500 })
    }

    // 2. Update provider claimed_by with claimant email (placeholder until full auth)
    const { error: providerUpdateError } = await supabase
      .from('ft_providers')
      .update({
        claimed_by: claim.email,
        profile_status: 'claimed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', claim.provider_id)

    if (providerUpdateError) {
      console.error('[claim-action] provider update error:', providerUpdateError.message)
      // Non-fatal — claim is approved even if provider update fails
    }

    // 3. Send approval email (fire-and-forget)
    sendApprovalEmail(claim.email, providerName).catch(() => {})

    return NextResponse.json({ success: true, action: 'approved' }, { status: 200 })
  }

  // action === 'reject'
  // 1. Update claim status
  const { error: rejectError } = await supabase
    .from('ft_claims')
    .update({ status: 'rejected' })
    .eq('id', claimId)

  if (rejectError) {
    console.error('[claim-action] claim reject error:', rejectError.message)
    return NextResponse.json({ error: 'Failed to update claim status.' }, { status: 500 })
  }

  // 2. Send rejection email (fire-and-forget)
  sendRejectionEmail(claim.email, providerName).catch(() => {})

  return NextResponse.json({ success: true, action: 'rejected' }, { status: 200 })
}
