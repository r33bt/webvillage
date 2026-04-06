// POST /api/founding
// Saves a founding member prospect to ft_founding_members.
// Duplicate emails return 200 with success message — don't leak existence.

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

async function sendFoundingNotification(data: {
  company_name: string
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
      subject: `New Founding Member Interest — ${data.company_name}`,
      text: [
        'New founding member inquiry received via /founding',
        '',
        `Company: ${data.company_name}`,
        `Name:    ${data.name}`,
        `Email:   ${data.email}`,
        `Phone:   ${data.phone ?? '—'}`,
        '',
        'Log in to Supabase to view: ft_founding_members',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[founding] resend error:', err)
  }
}

async function sendFoundingConfirmation(data: {
  company_name: string
  name: string
  email: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    await resend.emails.send({
      from: 'FindTraining <hello@findtraining.com>',
      to: data.email,
      subject: `Your founding slot is reserved — ${data.company_name}`,
      text: [
        `Hi ${data.name},`,
        '',
        `Thank you for reserving a founding member slot for ${data.company_name} on FindTraining.`,
        '',
        "Here's what happens next:",
        '',
        '1. We will personally review your application within 48 hours.',
        '2. Once confirmed, we will send you a payment link for RM 100/mo.',
        '3. No payment is taken until we confirm your slot.',
        '',
        'Your founding rate of RM 100/mo is locked for life — it will never increase.',
        '',
        'If you have any questions in the meantime, reply to this email.',
        '',
        'The FindTraining Team',
        'https://findtraining.com',
      ].join('\n'),
    })
  } catch (err) {
    console.error('[founding] provider confirmation email error:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { company_name, name, email, phone } = body as {
      company_name?: string
      name?: string
      email?: string
      phone?: string
    }

    if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabase = getServiceClient()

    const { data: existing } = await supabase
      .from('ft_founding_members')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: true, message: 'We have your details and will be in touch shortly.' },
        { status: 200 }
      )
    }

    const { error } = await supabase.from('ft_founding_members').insert({
      email: normalizedEmail,
      company_name: company_name.trim(),
      name: name.trim(),
      phone: phone?.trim() ?? null,
      status: 'prospect',
      source: 'founding_page',
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true }, { status: 200 })
      }
      console.error('[founding] insert error:', error.message)
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      )
    }

    // Fire-and-forget — do not await, does not block response
    sendFoundingNotification({
      company_name: company_name.trim(),
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim(),
    })
    sendFoundingConfirmation({
      company_name: company_name.trim(),
      name: name.trim(),
      email: normalizedEmail,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[founding] unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
