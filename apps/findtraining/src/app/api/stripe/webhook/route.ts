// POST /api/stripe/webhook
// Handles Stripe webhook events to keep ft_providers in sync with billing state.
// Verifies Stripe signature before processing.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getStripe, PLAN_TO_TIER, StripePlan } from '@/lib/stripe'
import { buildDay0, sendWelcomeEmail } from '@/lib/email/welcome-sequence'

// Next.js App Router: body parsing is not applicable — route handlers
// read raw body via request.text() directly.

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

async function handleFoundingCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceClient>
) {
  const foundingMemberId = session.metadata?.founding_member_id
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

  if (!foundingMemberId || !customerId || !subscriptionId) {
    console.error('[webhook] founding checkout.completed: missing metadata', {
      foundingMemberId,
      customerId,
      subscriptionId,
    })
    return
  }

  const { data: member, error } = await supabase
    .from('ft_founding_members')
    .update({
      status: 'paid',
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', foundingMemberId)
    .select('email, name, company_name')
    .maybeSingle()

  if (error) {
    console.error('[webhook] DB update error (founding checkout.completed):', error.message)
    return
  }

  console.log(`[webhook] Founding member ${foundingMemberId} paid (sub: ${subscriptionId})`)

  if (member?.email && member?.name && member?.company_name) {
    const day0 = buildDay0({
      email: member.email,
      name: member.name,
      company_name: member.company_name,
      tier: 'founding',
    })
    const result = await sendWelcomeEmail(member.email, day0)
    if (!result.ok) {
      console.error('[webhook] Day-0 welcome send failed:', result.error)
    }
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceClient>
) {
  // Route founding member payments separately
  if (session.metadata?.plan === 'founding' || session.metadata?.founding_member_id) {
    return handleFoundingCheckoutCompleted(session, supabase)
  }

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

  const { data: provider, error } = await supabase
    .from('ft_providers')
    .update({
      tier,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
    })
    .eq('id', providerId)
    .select('name')
    .maybeSingle()

  if (error) {
    console.error('[webhook] DB update error (checkout.completed):', error.message)
    return
  }

  console.log(`[webhook] Provider ${providerId} upgraded to ${tier} (sub: ${subscriptionId})`)

  const recipientEmail = session.customer_details?.email
  const recipientName = session.customer_details?.name?.split(' ')[0] ?? 'there'
  const companyName = provider?.name
  if (recipientEmail && companyName && (tier === 'starter' || tier === 'pro')) {
    const day0 = buildDay0({
      email: recipientEmail,
      name: recipientName,
      company_name: companyName,
      tier,
    })
    const result = await sendWelcomeEmail(recipientEmail, day0)
    if (!result.ok) {
      console.error('[webhook] Day-0 welcome send failed:', result.error)
    }
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
