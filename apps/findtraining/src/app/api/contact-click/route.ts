// POST /api/contact-click
// Tracks when a visitor clicks a contact button on a provider profile.
// Never leaks errors to client — always returns 200.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const VALID_CLICK_TYPES = ['email', 'phone', 'website', 'whatsapp'] as const
type ClickType = (typeof VALID_CLICK_TYPES)[number]

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Fire-and-forget — does not block the response
function sendContactNotification(data: {
  provider_name: string
  provider_email: string
  click_type: string
  clicked_at: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)

  const clickedAtFormatted = new Date(data.clicked_at).toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  resend.emails
    .send({
      from: 'FindTraining <notifications@findtraining.com>',
      to: data.provider_email,
      subject: 'Someone viewed your contact details on FindTraining.com',
      text: [
        `Hi ${data.provider_name},`,
        '',
        'Good news — someone just viewed your contact details on FindTraining.com.',
        '',
        `Contact type viewed: ${data.click_type}`,
        `Time: ${clickedAtFormatted} (Malaysia time)`,
        '',
        'Log in to view your leads:',
        'https://findtraining.com/dashboard/leads',
        '',
        '— The FindTraining Team',
      ].join('\n'),
    })
    .catch((err: unknown) => {
      console.error('[contact-click] resend error:', err)
    })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { provider_id, click_type, session_id, search_query, visitor_page, referrer } = body as {
      provider_id?: string
      click_type?: string
      session_id?: string
      search_query?: string
      visitor_page?: string
      referrer?: string
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
      visitor_page: visitor_page ?? null,
      referrer: referrer ?? null,
    })

    if (error) {
      console.error('[contact-click] insert error:', error.message)
      // Still attempt notification even if insert fails
    }

    // Look up provider email — notify only if claimed and has email
    const { data: provider } = await supabase
      .from('ft_providers')
      .select('name, email, profile_status')
      .eq('id', provider_id)
      .maybeSingle()

    if (
      provider &&
      provider.email &&
      provider.profile_status === 'claimed'
    ) {
      sendContactNotification({
        provider_name: provider.name,
        provider_email: provider.email,
        click_type,
        clicked_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[contact-click] unexpected error:', err)
    return NextResponse.json({ ok: true }, { status: 200 })
  }
}
