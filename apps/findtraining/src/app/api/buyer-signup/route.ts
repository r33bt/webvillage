// POST /api/buyer-signup
// Captures buyer-side email signups from category pages, country hubs, or
// the homepage. Writes to ft_buyer_signups (PostgREST upsert on unique
// (email, country_code, category_slug)). No email confirmation send yet —
// REV-P5-1 will wire that to Resend once an audience is provisioned.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface BuyerSignupPayload {
  email?: unknown
  country_code?: unknown
  category_slug?: unknown
  state_slug?: unknown
  source_url?: unknown
  source_label?: unknown
}

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

function asTrimmedString(v: unknown, maxLen = 200): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (!t) return null
  return t.length > maxLen ? t.slice(0, maxLen) : t
}

export async function POST(request: NextRequest) {
  let body: BuyerSignupPayload
  try {
    body = (await request.json()) as BuyerSignupPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const email = asTrimmedString(body.email, 254)
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }
  const lowerEmail = email.toLowerCase()

  const country_code = asTrimmedString(body.country_code, 4)
  const category_slug = asTrimmedString(body.category_slug, 100)
  const state_slug = asTrimmedString(body.state_slug, 100)
  const source_url = asTrimmedString(body.source_url, 500)
  const source_label = asTrimmedString(body.source_label, 100)
  const user_agent = asTrimmedString(request.headers.get('user-agent') ?? null, 300)

  const supabase = getServiceClient()

  // Upsert on (email, country_code, category_slug). If the buyer signs up
  // again from the same page we silently treat as success. They get on the
  // list once. Different category from the same buyer = a new row.
  const { error } = await supabase
    .from('ft_buyer_signups')
    .upsert(
      {
        email: lowerEmail,
        country_code,
        category_slug,
        state_slug,
        source_url,
        source_label,
        user_agent,
      },
      { onConflict: 'email,country_code,category_slug', ignoreDuplicates: true }
    )

  if (error) {
    console.error('[buyer-signup] insert error:', error.message)
    return NextResponse.json({ error: 'Could not save signup.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
