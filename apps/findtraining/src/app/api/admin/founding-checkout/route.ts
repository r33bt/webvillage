// POST /api/admin/founding-checkout
// Admin-only: generates a Stripe Checkout session for an approved founding member
// and sends them the payment link via Resend.
//
// Usage (curl):
//   curl -X POST https://findtraining.com/api/admin/founding-checkout \
//     -H "ADMIN_SECRET: <secret>" \
//     -H "Content-Type: application/json" \
//     -d '{"email":"provider@example.com"}'
//
// Returns: { url, email } — the Stripe Checkout URL and the member's email.
// Dependency: Stripe KYC must be active (REV-P0-1) before this generates live sessions.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getStripe, STRIPE_PRICES } from '@/lib/stripe'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

async function sendPaymentLinkEmail(params: {
  email: string
  name: string
  company_name: string
  checkoutUrl: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'FindTraining <hello@findtraining.com>',
      to: params.email,
      subject: `Your founding slot is confirmed — complete payment to go live`,
      text: [
        `Hi ${params.name},`,
        '',
        `Your founding member slot for ${params.company_name} on FindTraining has been confirmed.`,
        '',
        'Complete your payment to activate your listing:',
        '',
        params.checkoutUrl,
        '',
        'What you get:',
        '  - RM 100/mo locked for life (never increases)',
        '  - Top placement in your category and state',
        '  - Founding Member badge on your public profile',
        '  - Leads inbox — HR managers contact you directly',
        '  - Up to 5 course listings',
        '  - Priority support',
        '',
        'The payment link is valid for 24 hours. If it expires, reply to this email and we will send a new one.',
        '',
        'The FindTraining Team',
        'https://findtraining.com',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[founding-checkout] email send error:', err)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth check
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json({ error: 'ADMIN_SECRET env var not set.' }, { status: 500 })
  }
  const provided = request.headers.get('ADMIN_SECRET')
  if (!provided || provided !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured. Complete Stripe KYC (REV-P0-1) first.' },
      { status: 503 }
    )
  }

  let body: { email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'email is required.' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // Look up the founding member
  const { data: member, error: lookupError } = await supabase
    .from('ft_founding_members')
    .select('id, email, name, company_name, status, stripe_customer_id')
    .eq('email', email)
    .maybeSingle()

  if (lookupError) {
    console.error('[founding-checkout] lookup error:', lookupError.message)
    return NextResponse.json({ error: 'Database error.' }, { status: 500 })
  }

  if (!member) {
    return NextResponse.json({ error: `No founding member found with email: ${email}` }, { status: 404 })
  }

  if (member.status === 'paid' || member.status === 'active' || member.status === 'onboarded') {
    return NextResponse.json({ error: `${email} has already paid (status: ${member.status}).` }, { status: 409 })
  }

  if (member.status === 'declined' || member.status === 'churned') {
    return NextResponse.json({ error: `${email} is not eligible (status: ${member.status}).` }, { status: 409 })
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://findtraining.com'
  const priceConfig = STRIPE_PRICES.founding

  try {
    // Create or retrieve Stripe customer
    let customerId = member.stripe_customer_id as string | undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: member.email,
        name: member.company_name ?? member.name,
        metadata: { founding_member_id: member.id },
      })
      customerId = customer.id

      await supabase
        .from('ft_founding_members')
        .update({ stripe_customer_id: customerId })
        .eq('id', member.id)
    }

    // Create Checkout session
    // FPX will activate automatically once Stripe approves the FPX application (REV-P0-1 parallel track)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: priceConfig.currency,
            product_data: {
              name: priceConfig.name,
              description: 'Founding Member — RM 100/mo locked for life',
              metadata: { founding_member_id: member.id },
            },
            unit_amount: priceConfig.amount,
            recurring: { interval: priceConfig.interval },
          },
          quantity: 1,
        },
      ],
      metadata: {
        founding_member_id: member.id,
        plan: 'founding',
      },
      success_url: `${origin}/founding/payment-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/founding`,
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 500 })
    }

    // Mark member as contacted (approved) so we know the link was sent
    await supabase
      .from('ft_founding_members')
      .update({ status: 'contacted', updated_at: new Date().toISOString() })
      .eq('id', member.id)
      .in('status', ['prospect', 'interested'])

    // Send payment email (fire-and-forget)
    sendPaymentLinkEmail({
      email: member.email,
      name: member.name,
      company_name: member.company_name ?? member.name,
      checkoutUrl: session.url,
    })

    console.log(`[founding-checkout] Payment link sent to ${email} — session ${session.id}`)

    return NextResponse.json({ url: session.url, email: member.email })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[founding-checkout] Stripe error:', message)
    return NextResponse.json({ error: 'Could not create checkout session.' }, { status: 500 })
  }
}
