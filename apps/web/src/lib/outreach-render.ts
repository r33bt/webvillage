// apps/web/src/lib/outreach-render.ts
// Slice 10: render outreach email body + subject + footer.

const UNSUBSCRIBE_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://webvillage.com'

interface RecipientForRender {
  email: string
  first_name: string | null
  last_name: string | null
  organization: string | null
  recipient_source: string
  unsubscribe_token: string
  vars: Record<string, string>
}

interface BrandForRender {
  display_name: string
  physical_address: string | null
}

export function substituteOutreachVars(template: string, recipient: RecipientForRender, brand: BrandForRender, extras: Record<string, string> = {}): string {
  const map: Record<string, string> = {
    'recipient.email': recipient.email,
    'recipient.first_name': recipient.first_name ?? '',
    'recipient.last_name': recipient.last_name ?? '',
    'recipient.organization': recipient.organization ?? '',
    'recipient.source': recipient.recipient_source,
    'brand_name': brand.display_name,
    ...extras,
  }
  for (const [k, v] of Object.entries(recipient.vars)) {
    map[`var.${k}`] = v
  }

  let out = template
  for (const [key, value] of Object.entries(map)) {
    out = out.split(`{${key}}`).join(value)
  }
  return out
}

export interface RenderedOutreachEmail {
  subject: string
  body: string  // plain-text version
  html: string
}

export function renderOutreachEmail(args: {
  subjectTemplate: string
  bodyText: string
  recipient: RecipientForRender
  brand: BrandForRender
  extras?: Record<string, string>
}): RenderedOutreachEmail {
  const subject = substituteOutreachVars(args.subjectTemplate || `A note from ${args.brand.display_name}`, args.recipient, args.brand, args.extras)

  const unsubscribeUrl = `${UNSUBSCRIBE_BASE}/api/be/outreach/unsubscribe?token=${args.recipient.unsubscribe_token}`
  const footer = `

---
You received this because: ${args.recipient.recipient_source}
Unsubscribe (one click, no login): ${unsubscribeUrl}
${args.brand.display_name}${args.brand.physical_address ? ' · ' + args.brand.physical_address : ''}`

  const body = args.bodyText.trim() + footer

  // Minimal HTML rendering — preserve newlines as <br> + clickable links
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, '<br>')

  const html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.5; color: #1C2B28; max-width: 600px;">${escaped}</div>`

  return { subject, body, html }
}
