/**
 * POST /api/stripe/webhook
 * Stripe webhook handler for BrandHacker billing events.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY      -- Stripe secret key (sk_live_* or sk_test_*)
 *   STRIPE_WEBHOOK_SECRET  -- Stripe webhook signing secret (whsec_*)
 *
 * Handles:
 *   checkout.session.completed
 *   customer.subscription.updated
 *   customer.subscription.deleted
 *   invoice.payment_succeeded
 *   invoice.payment_failed
 *   customer.subscription.trial_will_end
 */

import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Stripe client (lazy singleton)
// ---------------------------------------------------------------------------

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' })
  }
  return _stripe
}

// ---------------------------------------------------------------------------
// Subscription status mapping
// ---------------------------------------------------------------------------

type BhSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'
  | 'incomplete'

function mapStripeStatus(status: Stripe.Subscription.Status): BhSubscriptionStatus {
  switch (status) {
    case 'trialing':
      return 'trialing'
    case 'active':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled':
      return 'canceled'
    case 'unpaid':
      return 'unpaid'
    case 'paused':
      return 'paused'
    case 'incomplete':
    case 'incomplete_expired':
    default:
      return 'incomplete'
  }
}

// ---------------------------------------------------------------------------
// Client lookup by stripe_customer_id stored in metadata
// ---------------------------------------------------------------------------

async function findClientByCustomerId(customerId: string): Promise<string | null> {
  const sb = getServiceRoleClient()
  const { data, error } = await sb
    .from('wv_be_clients')
    .select('id')
    .filter('metadata->>stripe_customer_id', 'eq', customerId)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle<{ id: string }>()

  if (error) {
    console.error('[stripe/webhook] client lookup by customer_id failed', {
      customerId,
      error: error.message,
    })
    return null
  }
  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// Patch client metadata (merge, not replace)
// ---------------------------------------------------------------------------

async function patchClientMeta(
  clientId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const sb = getServiceRoleClient()

  // Fetch current metadata first so we can merge safely
  const { data, error: fetchErr } = await sb
    .from('wv_be_clients')
    .select('metadata')
    .eq('id', clientId)
    .maybeSingle<{ metadata: Record<string, unknown> | null }>()

  if (fetchErr) {
    console.error('[stripe/webhook] metadata fetch failed', { clientId, error: fetchErr.message })
    return
  }

  const current = data?.metadata ?? {}
  const merged = { ...current, ...patch }

  const { error: updateErr } = await sb
    .from('wv_be_clients')
    .update({ metadata: merged })
    .eq('id', clientId)

  if (updateErr) {
    console.error('[stripe/webhook] metadata update failed', {
      clientId,
      error: updateErr.message,
    })
  }
}

// ---------------------------------------------------------------------------
// Reset drafts usage counter for a new billing period
// ---------------------------------------------------------------------------

async function resetDraftsCounter(
  clientId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<void> {
  const sb = getServiceRoleClient()
  const { error } = await sb.from('bh_usage_counters').upsert(
    {
      client_id: clientId,
      metric: 'drafts',
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      count: 0,
      cap: null,
    },
    { onConflict: 'client_id,metric,period_start' },
  )

  if (error) {
    console.error('[stripe/webhook] drafts counter reset failed', {
      clientId,
      error: error.message,
    })
  }
}

// ---------------------------------------------------------------------------
// POST /api/stripe/webhook
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Raw body as text (required for signature verification)
  const rawBody = await req.text()

  // 2. Stripe signature header
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // 3. Verify signature + construct event
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed', { error: String(err) })
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const sb = getServiceRoleClient()

  // 4. Idempotency check
  const { data: existingEvent } = await sb
    .from('bh_stripe_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle<{ id: string }>()

  if (existingEvent) {
    // Already processed — return 200 immediately
    return Response.json({ received: true, duplicate: true })
  }

  // 5. Resolve client_id early where possible (not all events carry session metadata)
  let resolvedClientId: string | null = null

  // 6. Insert event record (before processing — idempotency guard)
  // We'll update client_id after resolving it if needed
  const { error: insertErr } = await sb.from('bh_stripe_events').insert({
    id: event.id,
    type: event.type,
    client_id: null, // updated below after resolution where applicable
  })

  if (insertErr) {
    // If unique conflict, another request already inserted — treat as duplicate
    if (insertErr.code === '23505') {
      return Response.json({ received: true, duplicate: true })
    }
    console.error('[stripe/webhook] event insert failed', { eventId: event.id, error: insertErr.message })
    // Continue processing anyway — logging failure is non-fatal
  }

  // ---------------------------------------------------------------------------
  // 7. Event dispatch
  // ---------------------------------------------------------------------------

  switch (event.type) {
    // -----------------------------------------------------------------------
    // checkout.session.completed
    // -----------------------------------------------------------------------
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : (session.customer?.id ?? null)

      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription?.id ?? null)

      // client_id is set in session metadata at checkout creation time
      const clientId = session.metadata?.client_id ?? null

      if (clientId) {
        resolvedClientId = clientId

        // Determine trial end from subscription if available
        let trialEndsAt: string | null = null
        if (subscriptionId) {
          try {
            const sub = await getStripe().subscriptions.retrieve(subscriptionId)
            trialEndsAt = sub.trial_end
              ? new Date(sub.trial_end * 1000).toISOString()
              : null
          } catch (err) {
            console.error('[stripe/webhook] subscription retrieve failed', {
              subscriptionId,
              error: String(err),
            })
          }
        }

        await patchClientMeta(clientId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt,
        })

        // Update event record with resolved client_id
        await sb.from('bh_stripe_events').update({ client_id: clientId }).eq('id', event.id)
      } else {
        console.error('[stripe/webhook] checkout.session.completed missing client_id in metadata', {
          sessionId: session.id,
        })
      }
      break
    }

    // -----------------------------------------------------------------------
    // customer.subscription.updated
    // -----------------------------------------------------------------------
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription

      const customerId =
        typeof sub.customer === 'string' ? sub.customer : (sub.customer?.id ?? null)

      if (!customerId) break

      resolvedClientId = await findClientByCustomerId(customerId)
      if (!resolvedClientId) {
        console.error('[stripe/webhook] no client found for customer', { customerId })
        break
      }

      const firstItem = sub.items.data[0]
      const priceId = firstItem?.price?.id ?? null
      // current_period_start/end live on SubscriptionItem in Stripe API v2025-04-30
      const periodStart = firstItem?.current_period_start ?? null
      const periodEnd = firstItem?.current_period_end ?? null

      await patchClientMeta(resolvedClientId, {
        subscription_status: mapStripeStatus(sub.status),
        stripe_price_id: priceId,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
      })

      await sb.from('bh_stripe_events').update({ client_id: resolvedClientId }).eq('id', event.id)
      break
    }

    // -----------------------------------------------------------------------
    // customer.subscription.deleted
    // -----------------------------------------------------------------------
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      const customerId =
        typeof sub.customer === 'string' ? sub.customer : (sub.customer?.id ?? null)

      if (!customerId) break

      resolvedClientId = await findClientByCustomerId(customerId)
      if (!resolvedClientId) {
        console.error('[stripe/webhook] no client found for customer on delete', { customerId })
        break
      }

      await patchClientMeta(resolvedClientId, {
        subscription_status: 'canceled',
        cancel_at_period_end: true,
      })

      await sb.from('bh_stripe_events').update({ client_id: resolvedClientId }).eq('id', event.id)
      break
    }

    // -----------------------------------------------------------------------
    // invoice.payment_succeeded
    // -----------------------------------------------------------------------
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice

      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : (invoice.customer?.id ?? null)

      if (!customerId) break

      console.log(`[stripe/webhook] payment_succeeded for ${customerId}`)

      resolvedClientId = await findClientByCustomerId(customerId)
      if (!resolvedClientId) break

      // Reset drafts counter for new billing period
      // invoice.period_start and .period_end cover the billing period
      const periodStart = new Date((invoice.period_start ?? 0) * 1000)
      const periodEnd = new Date((invoice.period_end ?? 0) * 1000)

      if (invoice.period_start && invoice.period_end) {
        await resetDraftsCounter(resolvedClientId, periodStart, periodEnd)
      }

      await sb.from('bh_stripe_events').update({ client_id: resolvedClientId }).eq('id', event.id)
      break
    }

    // -----------------------------------------------------------------------
    // invoice.payment_failed
    // -----------------------------------------------------------------------
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice

      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : (invoice.customer?.id ?? null)

      if (!customerId) {
        console.error('[stripe/webhook] invoice.payment_failed missing customer')
        break
      }

      console.error(`[stripe/webhook] invoice.payment_failed for ${customerId}`)

      resolvedClientId = await findClientByCustomerId(customerId)
      if (!resolvedClientId) break

      await patchClientMeta(resolvedClientId, { subscription_status: 'past_due' })
      await sb.from('bh_stripe_events').update({ client_id: resolvedClientId }).eq('id', event.id)
      break
    }

    // -----------------------------------------------------------------------
    // customer.subscription.trial_will_end
    // -----------------------------------------------------------------------
    case 'customer.subscription.trial_will_end': {
      const sub = event.data.object as Stripe.Subscription

      const customerId =
        typeof sub.customer === 'string' ? sub.customer : (sub.customer?.id ?? null)

      console.log(`[stripe/webhook] trial ending soon for customer ${customerId ?? 'unknown'}`)
      break
    }

    // -----------------------------------------------------------------------
    // All other events -- 200 required by Stripe
    // -----------------------------------------------------------------------
    default:
      break
  }

  return Response.json({ received: true })
}
