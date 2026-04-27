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

export async function generateCluster(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const clusterId = String(formData.get('cluster_id') ?? '')
  const startFromSlot = formData.get('start_from_slot_index')
  const confirmCost = formData.get('confirm_cost_cents')
  const force = formData.get('force')

  const body: Record<string, unknown> = {}
  if (startFromSlot) body.start_from_slot_index = Number(startFromSlot)
  if (confirmCost) body.confirm_cost_cents = Number(confirmCost)
  if (force === 'true') body.force = true

  const resp = await fetch(`${await baseUrl()}/api/be/clusters/${clusterId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/clusters/${clusterId}?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/clusters/${clusterId}`)
  redirect(`/admin/brand-engine/${clientId}/clusters/${clusterId}`)
}
