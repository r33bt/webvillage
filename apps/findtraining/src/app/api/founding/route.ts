// POST /api/founding
// Saves a founding member prospect to ft_founding_members AND immediately
// creates a Stripe Checkout session for self-serve payment.
//
// Self-serve flow (replaces 7-step manual Patrick-sends-link flow):
//   1. Form submits -> this endpoint
//   2. Insert/lookup lead in ft_founding_members
//   3. Create Stripe Checkout session (metadata.founding_member_id, plan=founding)
//   4. Return { url } to the client
//   5. Client redirects window.location to the Stripe URL
//   6. On payment, Stripe webhook (api/stripe/webhook) marks status='paid'
//
// Duplicate emails: existing leads are looked up and re-issued a fresh checkout
// URL (so people who bounced can come back). Already-paid members get a 409.
//
// Stripe is in test mode until KYC clears — when live keys are added (REV-P0-1),
// only the env var STRIPE_SECRET_KEY changes; no code change here.

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function sendFoundingNotification(data: {
  company_name: string
  name: string
  email: string
  phone?: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'FindTraining <notifications@findtraining.com>',
      to: 'hello@findtraining.com',
      subject: `New Founding Member Checkout Started — ${data.company_name}`,
      text: [
        'New founding member started self-serve checkout via /founding',
        '',
        `Company: ${data.company_name}`,
        `Name:    ${data.name}`,
        `Email:   ${data.email}`,
        `Phone:   ${data.phone ?? '—'}`,
        '',
        'They have been redirected to Stripe Checkout.',
        'Watch ft_founding_members for status -> paid (set by webhook).',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[founding] resend error:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { company_name, name, email, phone } = body as {
      company_name?: string
      name?: string
      email?: string
      phone?: string
    }

    if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedCompany = company_name.trim()
    const trimmedName = name.trim()
    const trimmedPhone = phone?.trim() || null

    const stripe = getStripe()
    if (!stripe) {
      console.error('[founding] Stripe not configured — STRIPE_SECRET_KEY missing')
      return NextResponse.json(
        { error: 'Payments are temporarily unavailable. Please email hello@findtraining.com.' },
        { status: 503 }
      )
    }

    const supabase = getServiceClient()

    // Look up or insert the lead so we have an ft_founding_members.id to put in Stripe metadata
    const { data: existing, error: lookupError } = await supabase
      .from('ft_founding_members')
      .select('id, email, name, company_name, status, stripe_customer_id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (lookupError) {
      console.error('[founding] lookup error:', lookupError.message)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    // Reject already-paid members so we don't double-charge
    if (
      existing &&
      (existing.status === 'paid' ||
        existing.status === 'active' ||
        existing.status === 'onboarded')
    ) {
      return NextResponse.json(
        {
          error:
            'You are already a founding member. Check your inbox for your dashboard link, or email hello@findtraining.com.',
        },
        { status: 409 }
      )
    }

    let memberId: string
    let stripeCustomerId: string | undefined

    if (existing) {
      memberId = existing.id
      stripeCustomerId = existing.stripe_customer_id ?? undefined
      // Refresh name/company/phone with latest submission so checkout reflects what they just typed
      await supabase
        .from('ft_founding_members')
        .update({
          company_name: trimmedCompany,
          name: trimmedName,
          phone: trimmedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId)
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('ft_founding_members')
        .insert({
          email: normalizedEmail,
          company_name: trimmedCompany,
          name: trimmedName,
          phone: trimmedPhone,
          status: 'prospect',
          source: 'founding_page',
        })
        .select('id')
        .single()

      if (insertError || !inserted) {
        // Race condition: another request inserted between our lookup and insert.
        // Try one more lookup to recover.
        if (insertError?.code === '23505') {
          const { data: raceRow } = await supabase
            .from('ft_founding_members')
            .select('id, stripe_customer_id')
            .eq('email', normalizedEmail)
            .maybeSingle()
          if (!raceRow) {
            console.error('[founding] insert+recovery failed:', insertError?.message)
            return NextResponse.json(
              { error: 'Something went wrong. Please try again.' },
              { status: 500 }
            )
          }
          memberId = raceRow.id
          stripeCustomerId = raceRow.stripe_customer_id ?? undefined
        } else {
          console.error('[founding] insert error:', insertError?.message)
          return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
          )
        }
      } else {
        memberId = inserted.id
      }
    }

    // Create or reuse Stripe customer (so customer_email + name are pre-filled in Checkout)
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: normalizedEmail,
        name: trimmedCompany,
        metadata: { founding_member_id: memberId },
      })
      stripeCustomerId = customer.id
      await supabase
        .from('ft_founding_members')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', memberId)
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://findtraining.com'
    const priceConfig = STRIPE_PRICES.founding

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: priceConfig.currency,
            product_data: {
              name: priceConfig.name,
              description: 'Founding Member — RM 100/mo locked for life',
              metadata: { founding_member_id: memberId },
            },
            unit_amount: priceConfig.amount,
            recurring: { interval: priceConfig.interval },
          },
          quantity: 1,
        },
      ],
      metadata: {
        founding_member_id: memberId,
        plan: 'founding',
        contact_name: trimmedName,
        company_name: trimmedCompany,
      },
      success_url: `${origin}/founding/payment-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/founding`,
      expires_at: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    })

    if (!session.url) {
      console.error('[founding] Stripe returned no checkout URL')
      return NextResponse.json(
        { error: 'Could not start checkout. Please try again.' },
        { status: 500 }
      )
    }

    // Mark as contacted so the admin path knows a link is outstanding
    await supabase
      .from('ft_founding_members')
      .update({ status: 'contacted', updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .in('status', ['prospect', 'interested'])

    // Notify Patrick (fire-and-forget) — useful while in test mode to see drop-off
    sendFoundingNotification({
      company_name: trimmedCompany,
      name: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone ?? undefined,
    })

    return NextResponse.json({ success: true, url: session.url }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[founding] unexpected error:', message)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
