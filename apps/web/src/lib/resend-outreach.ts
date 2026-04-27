// apps/web/src/lib/resend-outreach.ts
// Slice 10: Resend client wrapper for outreach. Reuses RESEND_API_KEY from S214.

const API_BASE = 'https://api.resend.com'

export class ResendAPIError extends Error {
  constructor(public status: number, public detail: string) {
    super(`Resend API ${status}: ${detail}`)
    this.name = 'ResendAPIError'
  }
}

export interface ResendSendArgs {
  from: string
  to: string
  replyTo?: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
  tags?: Array<{ name: string; value: string }>
}

export interface ResendSendResult {
  id: string  // Resend message ID
}

export async function resendSend(args: ResendSendArgs): Promise<ResendSendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new ResendAPIError(500, 'RESEND_API_KEY not set')
  }

  const body: Record<string, unknown> = {
    from: args.from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  }
  if (args.replyTo) body.reply_to = args.replyTo
  if (args.headers) body.headers = args.headers
  if (args.tags) body.tags = args.tags

  const resp = await fetch(`${API_BASE}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => '')
    throw new ResendAPIError(resp.status, errBody.slice(0, 500))
  }

  const data = (await resp.json()) as { id?: string }
  if (!data.id) {
    throw new ResendAPIError(500, 'Resend returned no message id')
  }
  return { id: data.id }
}
