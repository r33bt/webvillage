// POST /api/stripe/checkout
// Creates a Stripe Checkout Session for a provider to upgrade their tier.
// Auth required: provider must be claimed by the authenticated user.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe, STRIPE_PRICES, StripePlan } from '@/lib/stripe'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  // Guard: Stripe not configured
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json(
      { error: 'Billing is not configured. Please contact support.' },
      { status: 503 }
    )
  }

  let body: { plan?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { plan } = body

  if (!plan || !['starter', 'pro'].includes(plan)) {
    return NextResponse.json(
      { error: 'Invalid plan. Must be "starter" or "pro".' },
      { status: 400 }
    )
  }

  const planKey = plan as StripePlan
  const priceConfig = STRIPE_PRICES[planKey]

  // Authenticate: get the user from the auth header (JWT)
  // We pull the Authorization header and verify via Supabase
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')

  // Verify token with Supabase anon client
  const { createClient: createAnonClient } = await import('@supabase/supabase-js')
  const anonClient = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: authError } = await anonClient.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const supabase = getServiceClient()

  // Fetch the provider claimed by this user
  const { data: provider, error: providerError } = await supabase
    .from('ft_providers')
    .select('id, name, stripe_customer_id, tier, subscription_status')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[checkout] provider lookup error:', providerError.message)
    return NextResponse.json({ error: 'Could not load your provider profile.' }, { status: 500 })
  }

  if (!provider) {
    return NextResponse.json(
      { error: 'No claimed provider found for your account.' },
      { status: 404 }
    )
  }

  // Determine the base URL for redirect URLs
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://findtraining.com'

  try {
    // Create or retrieve Stripe customer
    let customerId = provider.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: provider.name,
        metadata: {
          provider_id: provider.id,
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Persist customer ID immediately
      await supabase
        .from('ft_providers')
        .update({ stripe_customer_id: customerId })
        .eq('id', provider.id)
    }

    // Create the Checkout Session with an inline price
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
              metadata: {
                plan: planKey,
                provider_id: provider.id,
              },
            },
            unit_amount: priceConfig.amount,
            recurring: {
              interval: priceConfig.interval,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        provider_id: provider.id,
        plan: planKey,
        supabase_user_id: user.id,
      },
      success_url: `${origin}/dashboard/billing?success=1`,
      cancel_url: `${origin}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[checkout] Stripe error:', message)
    return NextResponse.json({ error: 'Could not create checkout session.' }, { status: 500 })
  }
}
