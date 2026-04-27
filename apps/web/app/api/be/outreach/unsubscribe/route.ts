// apps/web/app/api/be/outreach/unsubscribe/route.ts
// Slice 10: public one-click unsubscribe handler. No auth (token = the auth). Idempotent.
// Both GET and POST per RFC 8058 (Gmail/Outlook one-click POST).

import { NextRequest } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const runtime = 'nodejs'

function htmlResponse(status: number, message: string, sub?: string): Response {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribe</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 80px auto; padding: 0 20px; color: #1C2B28; line-height: 1.5; }
    h1 { font-size: 22px; margin-bottom: 12px; color: #0F766E; }
    p { color: #6B7C79; }
    .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>${message}</h1>
  ${sub ? `<p>${sub}</p>` : ''}
  <p class="footer">WebVillage · webvillage.com</p>
</body>
</html>`
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

async function handle(req: NextRequest): Promise<Response> {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (!token) {
    return htmlResponse(400, 'Invalid unsubscribe link', 'The link is missing its token.')
  }

  const sb = createSupabaseServiceClient()
  const { data: recipient } = await sb
    .from('wv_be_outreach_recipients')
    .select('id, client_id, email, opted_out_at')
    .eq('unsubscribe_token', token)
    .maybeSingle()

  if (!recipient) {
    return htmlResponse(404, 'Unsubscribe link not recognised', 'This link may have expired or been mistyped.')
  }

  if (recipient.opted_out_at) {
    return htmlResponse(200, "You're already unsubscribed.", `${recipient.email} won't receive further messages from us.`)
  }

  // Opt out
  await sb.from('wv_be_outreach_recipients').update({ status: 'opted_out', opted_out_at: new Date().toISOString() }).eq('id', recipient.id)

  // Cancel future jobs for this recipient
  await sb.from('wv_be_jobs').update({ status: 'failed', last_error: 'recipient_opted_out', completed_at: new Date().toISOString() }).eq('job_type', 'outreach_touch_send').eq('status', 'pending').filter('payload->>recipient_id', 'eq', recipient.id)

  await sb.from('wv_be_audit_log').insert({
    client_id: recipient.client_id,
    actor_user_id: null,
    actor_type: 'recipient',
    action: 'recipient_opted_out',
    target_table: 'wv_be_outreach_recipients',
    target_id: recipient.id,
    after_state: { email: recipient.email, source: 'unsubscribe_link' },
  })

  return htmlResponse(200, 'Unsubscribed.', `${recipient.email} won't receive further messages from us. Sorry to see you go.`)
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
