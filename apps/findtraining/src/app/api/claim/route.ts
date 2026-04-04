// POST /api/claim
// Submits a claim for a scraped provider listing.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
      .select('id, profile_status, name')
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

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[claim] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
