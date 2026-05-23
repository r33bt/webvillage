// POST /api/enquiry
// Saves an HR manager enquiry to ft_enquiries and notifies the provider.
// Claimed + paid tier: notify the provider directly.
// Unclaimed or free tier: notify hello@findtraining.com so the FindTraining team
// can pass the lead on — captures buyer demand even before the provider claims.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { submitEnquiry } from '@webvillage/engine/adapters/findtraining'

const PAID_TIERS = new Set(['starter', 'pro', 'founding'])

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function notifyProvider(opts: {
  providerName: string
  providerEmail: string
  enquirerName: string
  enquirerEmail: string
  enquirerCompany: string | null
  trainingNeed: string
  headcount: number | null
  budgetRange: string | null
  preferredDates: string | null
  message: string | null
  unclaimed: boolean
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  const header = opts.unclaimed
    ? `New training enquiry for ${opts.providerName} (UNCLAIMED — pass to provider)`
    : `New training enquiry from ${opts.enquirerName}`
  const lines = [
    header,
    '',
    `Name:     ${opts.enquirerName}`,
    `Email:    ${opts.enquirerEmail}`,
    `Company:  ${opts.enquirerCompany ?? '—'}`,
    '',
    ...(opts.unclaimed ? [`Provider:      ${opts.providerName}`, ''] : []),
    `Training need: ${opts.trainingNeed}`,
    `Headcount:     ${opts.headcount ?? '—'}`,
    `Budget:        ${opts.budgetRange ?? '—'}`,
    `Dates:         ${opts.preferredDates ?? '—'}`,
    ...(opts.message ? ['', `Additional notes: ${opts.message}`] : []),
    '',
    'Reply directly to this email to respond to the enquiry.',
    '',
    '— FindTraining.com',
  ]
  const subject = opts.unclaimed
    ? `[UNCLAIMED] Enquiry for ${opts.providerName} from ${opts.enquirerName}${opts.enquirerCompany ? ` (${opts.enquirerCompany})` : ''}`
    : `New enquiry from ${opts.enquirerName}${opts.enquirerCompany ? ` (${opts.enquirerCompany})` : ''}`
  try {
    await resend.emails.send({
      from: 'FindTraining <notifications@findtraining.com>',
      to: opts.providerEmail,
      reply_to: opts.enquirerEmail,
      subject,
      text: lines.join('\n'),
    })
  } catch (err) {
    console.error('[enquiry] provider notify error:', err)
  }
}

async function confirmEnquirer(opts: {
  enquirerName: string
  enquirerEmail: string
  providerName: string
  unclaimed: boolean
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = opts.unclaimed
    ? `Your request about ${opts.providerName} has been received`
    : `Your enquiry to ${opts.providerName} has been sent`
  const body = opts.unclaimed
    ? [
        `Hi ${opts.enquirerName},`,
        '',
        `Thanks for your enquiry about ${opts.providerName}.`,
        '',
        `${opts.providerName} hasn't claimed their listing on FindTraining yet, so we'll pass your request to them directly and get back to you within 2 business days.`,
        '',
        'The FindTraining Team',
        'https://findtraining.com',
      ]
    : [
        `Hi ${opts.enquirerName},`,
        '',
        `Your training enquiry has been sent to ${opts.providerName}.`,
        '',
        'They typically respond within 2 business days. If you need a faster response, you can also contact them directly via their profile on FindTraining.',
        '',
        'The FindTraining Team',
        'https://findtraining.com',
      ]
  try {
    await resend.emails.send({
      from: 'FindTraining <hello@findtraining.com>',
      to: opts.enquirerEmail,
      subject,
      text: body.join('\n'),
    })
  } catch (err) {
    console.error('[enquiry] enquirer confirm error:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      provider_id,
      enquirer_name,
      enquirer_email,
      enquirer_company,
      training_need,
      headcount,
      budget_range,
      preferred_dates,
      message,
    } = body as Record<string, unknown>

    // Validate required fields
    if (!provider_id || typeof provider_id !== 'string') {
      return NextResponse.json({ error: 'Invalid provider.' }, { status: 400 })
    }
    if (!enquirer_name || typeof enquirer_name !== 'string' || !enquirer_name.trim()) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!enquirer_email || typeof enquirer_email !== 'string' || !isValidEmail(enquirer_email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }
    if (!training_need || typeof training_need !== 'string' || !training_need.trim()) {
      return NextResponse.json({ error: 'Please describe your training need.' }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Verify provider exists, is claimed, and is on a paid tier
    const { data: provider, error: providerErr } = await supabase
      .from('ft_providers')
      .select('id, name, email, tier, claimed, profile_status')
      .eq('id', provider_id)
      .maybeSingle()

    if (providerErr || !provider) {
      return NextResponse.json({ error: 'Provider not found.' }, { status: 404 })
    }
    // Removed/opted_out providers cannot receive enquiries.
    if (provider.profile_status === 'removed' || provider.profile_status === 'opted_out') {
      return NextResponse.json({ error: 'This provider cannot receive enquiries.' }, { status: 403 })
    }
    const isClaimedPaid = provider.claimed && PAID_TIERS.has(provider.tier)
    const unclaimed = !isClaimedPaid

    // Write enquiry
    await submitEnquiry({
      provider_id: provider.id,
      enquirer_name: String(enquirer_name).trim(),
      enquirer_email: String(enquirer_email).trim().toLowerCase(),
      enquirer_company: enquirer_company ? String(enquirer_company).trim() : undefined,
      training_need: String(training_need).trim(),
      headcount: headcount && !isNaN(Number(headcount)) ? Number(headcount) : undefined,
      budget_range: budget_range ? String(budget_range) : undefined,
      preferred_dates: preferred_dates ? String(preferred_dates).trim() : undefined,
      message: message ? String(message).trim() : undefined,
    })

    // Unclaimed or free-tier providers: route to hello@ so the team can pass it on.
    // Claimed paid: notify the provider directly (fallback to hello@ if no email on file).
    const notifyEmail = unclaimed
      ? 'hello@findtraining.com'
      : (provider.email ?? 'hello@findtraining.com')

    // Fire-and-forget — do not await
    notifyProvider({
      providerName: provider.name,
      providerEmail: notifyEmail,
      enquirerName: String(enquirer_name).trim(),
      enquirerEmail: String(enquirer_email).trim().toLowerCase(),
      enquirerCompany: enquirer_company ? String(enquirer_company).trim() : null,
      trainingNeed: String(training_need).trim(),
      headcount: headcount && !isNaN(Number(headcount)) ? Number(headcount) : null,
      budgetRange: budget_range ? String(budget_range) : null,
      preferredDates: preferred_dates ? String(preferred_dates).trim() : null,
      message: message ? String(message).trim() : null,
      unclaimed,
    })
    confirmEnquirer({
      enquirerName: String(enquirer_name).trim(),
      enquirerEmail: String(enquirer_email).trim().toLowerCase(),
      providerName: provider.name,
      unclaimed,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[enquiry] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
