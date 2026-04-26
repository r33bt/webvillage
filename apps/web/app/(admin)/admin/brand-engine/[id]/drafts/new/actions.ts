'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function createDraft(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  const templateId = String(formData.get('template_id') ?? '')
  const prompt = String(formData.get('prompt') ?? '').trim()

  if (!clientId) throw new Error('Missing client_id')
  if (!templateId) throw new Error('Missing template_id')
  if (prompt.length < 10) throw new Error('Prompt must be at least 10 characters')

  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const baseUrl = `${proto}://${host}`

  const resp = await fetch(`${baseUrl}/api/be/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, template_id: templateId, prompt }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    // Surface the error in the URL for the new page to show
    const errParam = encodeURIComponent(errText.slice(0, 500))
    redirect(`/admin/brand-engine/${clientId}/drafts/new?error=${errParam}`)
  }

  const result = await resp.json()
  redirect(`/admin/brand-engine/${clientId}/drafts/${result.draft_id}`)
}
