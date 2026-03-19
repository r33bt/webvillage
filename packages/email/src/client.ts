import { Resend } from 'resend'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

const DEFAULT_FROM = 'WebVillage <noreply@webvillage.com>'

/**
 * Send an email via Resend.
 * Requires RESEND_API_KEY env var.
 */
export async function sendEmail(options: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set, skipping email send')
    return null
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: options.from ?? DEFAULT_FROM,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
  })

  if (error) {
    console.error('[email] Failed to send:', error)
    throw new Error(`Email send failed: ${error.message}`)
  }

  return data
}
