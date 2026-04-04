// POST /api/claim
// Submits a claim for a scraped provider listing.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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

async function sendClaimNotification(data: {
  provider_name: string
  provider_id: string
  provider_slug: string
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
      subject: `New Claim — ${data.provider_name}`,
      text: [
        'New provider claim submitted via /claim',
        '',
        `Provider:     ${data.provider_name}`,
        `Provider ID:  ${data.provider_id}`,
        `Profile page: https://findtraining.com/providers/${data.provider_slug}`,
        '',
        `Claimant:     ${data.name}`,
        `Email:        ${data.email}`,
        `Phone:        ${data.phone ?? '—'}`,
        '',
        'ACTION REQUIRED: Review and approve or reject the claim.',
        'Supabase → ft_claims → filter status = pending',
        `https://supabase.com/dashboard/project/hzqbsixlintiairmabbg/editor?filter=ft_claims`,
      ].join('\n'),
    })
  } catch (err) {
    console.error('[claim] resend error:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { provider_id, name, email, phone } = body as {
      provider_id?: string
      name?: string
      email?: string
      phone?: string
    }

    if (!provider_id || typeof provider_id !== 'string' || provider_id.trim().length === 0) {
      return NextResponse.json({ error: 'Provider ID is required.' }, { status: 400 })
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabase = getServiceClient()

    const { data: provider, error: providerError } = await supabase
      .from('ft_providers')
      .select('id, profile_status, name, slug')
      .eq('id', provider_id.trim())
      .maybeSingle()

    if (providerError) {
      console.error('[claim] provider lookup error:', providerError.message)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found.' }, { status: 404 })
    }

    if (provider.profile_status === 'claimed') {
      return NextResponse.json(
        {
          error:
            'This listing has already been claimed. If you believe this is an error, contact hello@findtraining.com.',
        },
        { status: 409 }
      )
    }

    if (provider.profile_status === 'removed' || provider.profile_status === 'opted_out') {
      return NextResponse.json(
        { error: 'This listing is no longer available.' },
        { status: 410 }
      )
    }

    const { data: existingClaim } = await supabase
      .from('ft_claims')
      .select('id')
      .eq('provider_id', provider_id.trim())
      .eq('status', 'pending')
      .maybeSingle()

    if (existingClaim) {
      return NextResponse.json(
        {
          error:
            'There is already a pending claim for this listing. If this is yours, contact hello@findtraining.com.',
        },
        { status: 409 }
      )
    }

    const notesLines = [`Claimant name: ${name.trim()}`]
    if (phone?.trim()) notesLines.push(`Claimant phone: ${phone.trim()}`)
    const notes = notesLines.join('\n')

    const { error: insertError } = await supabase.from('ft_claims').insert({
      provider_id: provider_id.trim(),
      email: normalizedEmail,
      status: 'pending',
      verification_method: 'email',
      notes,
    })

    if (insertError) {
      console.error('[claim] insert error:', insertError.message)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    // Fire-and-forget notification — do not await, does not block response
    sendClaimNotification({
      provider_name: provider.name,
      provider_id: provider_id.trim(),
      provider_slug: provider.slug,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim(),
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[claim] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
