// POST /api/stripe/webhook
// Handles Stripe webhook events to keep ft_providers in sync with billing state.
// Verifies Stripe signature before processing.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getStripe, PLAN_TO_TIER, StripePlan } from '@/lib/stripe'

// Next.js App Router: body parsing is not applicable — route handlers
// read raw body via request.text() directly.

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceClient>
) {
  const providerId = session.metadata?.provider_id
  const plan = session.metadata?.plan as StripePlan | undefined
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

  if (!providerId || !plan || !customerId || !subscriptionId) {
    console.error('[webhook] checkout.session.completed: missing metadata', {
      providerId,
      plan,
      customerId,
      subscriptionId,
    })
    return
  }

  const tier = PLAN_TO_TIER[plan]
  if (!tier) {
    console.error('[webhook] Unknown plan in metadata:', plan)
    return
  }

  const { error } = await supabase
    .from('ft_providers')
    .update({
      tier,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
    })
    .eq('id', providerId)

  if (error) {
    console.error('[webhook] DB update error (checkout.completed):', error.message)
  } else {
    console.log(`[webhook] Provider ${providerId} upgraded to ${tier} (sub: ${subscriptionId})`)
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  // current_period_end was removed from Stripe SDK types in v17+ but is still returned at runtime
  const periodEnd = new Date(
    ((subscription as unknown as Record<string, number>).current_period_end ?? 0) * 1000
  ).toISOString()
  const status = subscription.status as string

  // Map to our allowed statuses; default to 'incomplete' for unknown
  const allowed = ['active', 'canceled', 'past_due', 'trialing', 'incomplete']
  const mappedStatus = allowed.includes(status) ? status : 'incomplete'

  const { error } = await supabase
    .from('ft_providers')
    .update({
      subscription_status: mappedStatus,
      subscription_period_end: periodEnd,
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[webhook] DB update error (subscription.updated):', error.message)
  } else {
    console.log(`[webhook] Subscription updated for customer ${customerId}: ${mappedStatus}`)
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

  const { error } = await supabase
    .from('ft_providers')
    .update({
      tier: 'free',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
      subscription_period_end: null,
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('[webhook] DB update error (subscription.deleted):', error.message)
  } else {
    console.log(`[webhook] Subscription cancelled for customer ${customerId} — tier reset to free`)
  }
}

export async function POST(request: NextRequest) {
  // Guard: Stripe not configured
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured.' }, { status: 503 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 503 })
  }

  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  // Read raw body for signature verification
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] Signature verification failed:', message)
    return NextResponse.json({ error: `Webhook signature invalid: ${message}` }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase)
        break

      default:
        // Unhandled event — return 200 to acknowledge receipt
        console.log(`[webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[webhook] Handler error:', message)
    // Return 500 so Stripe retries the event
    return NextResponse.json({ error: 'Internal handler error.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
