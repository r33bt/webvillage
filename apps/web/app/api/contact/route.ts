import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@webvillage/email'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ContactPayload {
  name: string
  organisation: string
  email: string
  message?: string
}

// ─── Email validation ─────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── POST /api/contact ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ContactPayload

  try {
    body = (await req.json()) as ContactPayload
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, organisation, email, message } = body

  // Validate required fields
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!organisation?.trim()) {
    return NextResponse.json({ error: 'Organisation is required' }, { status: 400 })
  }
  if (!email?.trim() || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1C2B28;">
      <h2 style="color: #0F766E; border-bottom: 2px solid #0F766E; padding-bottom: 8px; margin-bottom: 24px;">
        New Discovery Call Request
      </h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; font-weight: 600; width: 140px; vertical-align: top; color: #6B7C79;">Name</td>
          <td style="padding: 10px 0;">${escapeHtml(name.trim())}</td>
        </tr>
        <tr style="background: #F0FAF9;">
          <td style="padding: 10px 8px; font-weight: 600; width: 140px; vertical-align: top; color: #6B7C79;">Organisation</td>
          <td style="padding: 10px 8px;">${escapeHtml(organisation.trim())}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-weight: 600; width: 140px; vertical-align: top; color: #6B7C79;">Email</td>
          <td style="padding: 10px 0;">
            <a href="mailto:${escapeHtml(email.trim())}" style="color: #D97706;">${escapeHtml(email.trim())}</a>
          </td>
        </tr>
        ${
          message?.trim()
            ? `<tr style="background: #F0FAF9;">
                <td style="padding: 10px 8px; font-weight: 600; vertical-align: top; color: #6B7C79;">Message</td>
                <td style="padding: 10px 8px; white-space: pre-wrap;">${escapeHtml(message.trim())}</td>
              </tr>`
            : ''
        }
      </table>

      <p style="margin-top: 32px; padding: 16px; background: #FEF3C7; border-radius: 8px; font-size: 14px; color: #92400E;">
        <strong>Reply-to:</strong> ${escapeHtml(email.trim())} — you can reply directly to this email to reach ${escapeHtml(name.trim())}.
      </p>
    </div>
  `

  try {
    await sendEmail({
      to: 'hello@webvillage.com',
      from: 'WebVillage <hello@webvillage.com>',
      replyTo: email.trim(),
      subject: `[WebVillage Demo] ${organisation.trim()} — ${name.trim()}`,
      html,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[contact] Failed to send email:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
