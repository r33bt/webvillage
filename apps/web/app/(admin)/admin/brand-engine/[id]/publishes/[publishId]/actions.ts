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

export async function cancelPublish(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const publishId = String(formData.get('publish_id') ?? '')
  const reason = String(formData.get('reason') ?? '').trim()

  if (!clientId || !publishId) throw new Error('Missing client_id or publish_id')

  const resp = await fetch(`${await baseUrl()}/api/be/publish/${publishId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: reason || undefined }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/publishes/${publishId}?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/publishes/${publishId}`)
  revalidatePath(`/admin/brand-engine/${clientId}/publishes`)
  redirect(`/admin/brand-engine/${clientId}/publishes/${publishId}?cancelled=1`)
}

export async function reschedulePublish(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const publishId = String(formData.get('publish_id') ?? '')
  const newScheduledFor = String(formData.get('scheduled_for') ?? '')

  if (!clientId || !publishId || !newScheduledFor) throw new Error('Missing required fields')

  const resp = await fetch(`${await baseUrl()}/api/be/publish/${publishId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduled_for: newScheduledFor }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/publishes/${publishId}?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/publishes/${publishId}`)
  redirect(`/admin/brand-engine/${clientId}/publishes/${publishId}?rescheduled=1`)
}

export async function retryPublish(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const publishId = String(formData.get('publish_id') ?? '')
  const draftId = String(formData.get('draft_id') ?? '')
  const platforms = String(formData.get('platforms') ?? 'linkedin').split(',')

  if (!clientId || !publishId || !draftId) throw new Error('Missing required fields')

  const resp = await fetch(`${await baseUrl()}/api/be/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      draft_id: draftId,
      platforms,
      parent_publish_id: publishId,
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/publishes/${publishId}?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  const result = await resp.json()
  redirect(`/admin/brand-engine/${clientId}/publishes/${result.publish_id}`)
}
