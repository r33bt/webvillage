/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for BrandHacker subscription.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY  -- Stripe secret key (sk_live_* or sk_test_*)
 *
 * Request body:
 *   client_id    uuid    -- BrandHacker tenant UUID
 *   price_id     string  -- Stripe Price ID (e.g. price_xxx)
 *   success_url  string  -- Redirect URL on successful payment
 *   cancel_url   string  -- Redirect URL on cancelled checkout
 *
 * Response (200):
 *   { checkout_url: string }
 */

import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { z } from 'zod'
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
// Auth check (matches drafts route pattern)
// ---------------------------------------------------------------------------

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.BH_INTERNAL_TOKEN
  if (!token) return true // dev mode: no token configured -- allow all
  const header = req.headers.get('x-bh-internal')
  return header === token || header === 'true'
}

// ---------------------------------------------------------------------------
// Request validation
// ---------------------------------------------------------------------------

const RequestSchema = z.object({
  client_id: z.string().uuid({ message: 'client_id must be a valid UUID' }),
  price_id: z.string().min(1, 'price_id is required'),
  success_url: z.string().url({ message: 'success_url must be a valid URL' }),
  cancel_url: z.string().url({ message: 'cancel_url must be a valid URL' }),
})

type ValidatedRequest = z.infer<typeof RequestSchema>

// ---------------------------------------------------------------------------
// POST /api/stripe/checkout
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Auth check
  if (!isAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse + Zod validate
  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { client_id, price_id, success_url, cancel_url }: ValidatedRequest = parsed.data

  const sb = getServiceRoleClient()

  // 3. Load tenant -- 404 if missing
  const { data: client, error: clientErr } = await sb
    .from('wv_be_clients')
    .select('id, display_name, metadata')
    .eq('id', client_id)
    .is('deleted_at', null)
    .maybeSingle<{ id: string; display_name: string; metadata: Record<string, unknown> | null }>()

  if (clientErr) {
    console.error('[stripe/checkout] client lookup error', { client_id, error: clientErr.message })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
  if (!client) {
    return Response.json({ error: 'Client not found' }, { status: 404 })
  }

  const customerMeta = client.metadata ?? {}
  const existingCustomerId =
    typeof customerMeta.stripe_customer_id === 'string'
      ? customerMeta.stripe_customer_id
      : undefined

  // 4. Create Stripe Checkout session
  let session: Stripe.Checkout.Session
  try {
    session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      subscription_data: { trial_period_days: 14 },
      automatic_tax: { enabled: true },
      success_url,
      cancel_url,
      metadata: { client_id },
      ...(existingCustomerId ? { customer: existingCustomerId } : {}),
    })
  } catch (err) {
    console.error('[stripe/checkout] session creation failed', {
      client_id,
      price_id,
      error: String(err),
    })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  // 5. Return checkout URL
  if (!session.url) {
    console.error('[stripe/checkout] session created but url is null', { sessionId: session.id })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }

  return Response.json({ checkout_url: session.url })
}
