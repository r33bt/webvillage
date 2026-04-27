'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function baseUrl(): Promise<string> {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  return `${proto}://${host}`
}

export async function createCluster(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const theme = String(formData.get('theme') ?? '').trim()
  const targetAudience = String(formData.get('target_audience') ?? '').trim()
  const arcType = String(formData.get('arc_type') ?? '') as 'linear' | 'episodic' | 'evergreen' | ''
  const clusterTemplateId = String(formData.get('cluster_template_id') ?? '')

  // Slot rows — encoded as parallel arrays from form (slot_topic[i], slot_brief[i], slot_arc_role[i])
  const slotTopics = formData.getAll('slot_topic[]').map((v) => String(v).trim())
  const slotBriefs = formData.getAll('slot_brief[]').map((v) => String(v).trim())
  const slotArcRoles = formData.getAll('slot_arc_role[]').map((v) => String(v).trim())
  const slotTemplateIds = formData.getAll('slot_template_id[]').map((v) => String(v).trim())

  const slots = slotTopics
    .map((topic, i) => ({
      slot_index: i + 1,
      slot_topic: topic,
      slot_brief: slotBriefs[i] ?? '',
      slot_arc_role: (slotArcRoles[i] || null) as 'setup' | 'development' | 'payoff' | 'evergreen' | null,
      template_id: slotTemplateIds[i] || null,
    }))
    .filter((s) => s.slot_topic && s.slot_brief)

  if (slots.length === 0) {
    redirect(`/admin/brand-engine/${clientId}/clusters/new?error=${encodeURIComponent('At least one slot required')}`)
  }

  const resp = await fetch(`${await baseUrl()}/api/be/clusters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      name,
      theme,
      target_audience: targetAudience,
      arc_type: arcType || null,
      cluster_template_id: clusterTemplateId || null,
      total_slots: slots.length,
      slots,
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/clusters/new?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  const result = await resp.json()
  redirect(`/admin/brand-engine/${clientId}/clusters/${result.cluster_id}`)
}
