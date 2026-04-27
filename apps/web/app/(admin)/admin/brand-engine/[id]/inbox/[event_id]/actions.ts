'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function baseUrl(): Promise<string> {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  return `${proto}://${host}`
}

export async function generateVariants(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const eventId = String(formData.get('event_id') ?? '')
  const founderHint = String(formData.get('founder_hint') ?? '').trim()
  const variantCount = Number(formData.get('variant_count') ?? 3)

  if (!clientId || !eventId) throw new Error('Missing client_id or event_id')

  const resp = await fetch(`${await baseUrl()}/api/be/inbox/${eventId}/draft-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      variant_count: variantCount,
      founder_hint: founderHint || undefined,
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/inbox/${eventId}?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/inbox/${eventId}`)
  redirect(`/admin/brand-engine/${clientId}/inbox/${eventId}`)
}

export async function sendReply(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const eventId = String(formData.get('event_id') ?? '')
  const draftId = String(formData.get('draft_id') ?? '')
  const replyBodyFinal = String(formData.get('reply_body_final') ?? '').trim()
  const replyToExternalId = String(formData.get('reply_to_external_id') ?? '')

  if (!clientId || !eventId || !draftId || !replyBodyFinal || !replyToExternalId) {
    throw new Error('Missing required fields')
  }

  const resp = await fetch(`${await baseUrl()}/api/be/inbox/${eventId}/send-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draft_id: draftId,
      reply_body_final: replyBodyFinal,
      reply_to_external_id: replyToExternalId,
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/inbox/${eventId}?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/inbox/${eventId}`)
  revalidatePath(`/admin/brand-engine/${clientId}/inbox`)
  redirect(`/admin/brand-engine/${clientId}/inbox?filter=unread&sent=1`)
}

export async function dismissEvent(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const eventId = String(formData.get('event_id') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()

  if (!clientId || !eventId) throw new Error('Missing client_id or event_id')

  const resp = await fetch(`${await baseUrl()}/api/be/inbox/${eventId}/dismiss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: reason || undefined }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/inbox/${eventId}?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/inbox`)
  redirect(`/admin/brand-engine/${clientId}/inbox?filter=unread&dismissed=1`)
}
