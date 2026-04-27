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

export async function startSequence(formData: FormData) {
  const clientId = formData.get('client_id') as string
  const sequenceId = formData.get('sequence_id') as string
  const confirm = formData.get('confirm_estimate_cost_cents')

  const body: Record<string, unknown> = {}
  if (confirm) body.confirm_estimate_cost_cents = Number(confirm)

  const url = `${await baseUrl()}/api/be/outreach/sequences/${sequenceId}/send`
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({ error: 'unknown' }))
    redirect(`/admin/brand-engine/${clientId}/outreach/${sequenceId}?error=${encodeURIComponent(JSON.stringify(errBody))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/outreach/${sequenceId}`)
  redirect(`/admin/brand-engine/${clientId}/outreach/${sequenceId}?started=1`)
}

export async function pauseSequence(formData: FormData) {
  const clientId = formData.get('client_id') as string
  const sequenceId = formData.get('sequence_id') as string

  const url = `${await baseUrl()}/api/be/outreach/sequences/${sequenceId}/pause`
  const resp = await fetch(url, { method: 'POST' })

  if (!resp.ok) {
    const errBody = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/outreach/${sequenceId}?error=${encodeURIComponent(errBody.slice(0, 200))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/outreach/${sequenceId}`)
  redirect(`/admin/brand-engine/${clientId}/outreach/${sequenceId}?paused=1`)
}
