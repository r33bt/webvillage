// POST /api/contact-click
// Tracks when a visitor clicks a contact button on a provider profile.
// Never leaks errors to client — always returns 200.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const VALID_CLICK_TYPES = ['email', 'phone', 'website', 'whatsapp'] as const
type ClickType = (typeof VALID_CLICK_TYPES)[number]

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { provider_id, click_type, session_id, search_query } = body as {
      provider_id?: string
      click_type?: string
      session_id?: string
      search_query?: string
    }

    if (
      !provider_id ||
      typeof provider_id !== 'string' ||
      !click_type ||
      !VALID_CLICK_TYPES.includes(click_type as ClickType)
    ) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const country = request.headers.get('CF-IPCountry') ?? null
    const supabase = getServiceClient()

    const { error } = await supabase.from('ft_contact_clicks').insert({
      provider_id,
      click_type: click_type as ClickType,
      country_code: country,
      session_id: session_id ?? null,
      search_query: search_query ?? null,
    })

    if (error) {
      console.error('[contact-click] insert error:', error.message)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[contact-click] unexpected error:', err)
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
