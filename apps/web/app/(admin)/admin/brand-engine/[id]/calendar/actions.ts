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

export async function refreshCalendar(formData: FormData): Promise<void> {
  const clientId = String(formData.get('client_id') ?? '')
  if (!clientId) throw new Error('Missing client_id')

  const resp = await fetch(`${await baseUrl()}/api/be/calendar/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    redirect(`/admin/brand-engine/${clientId}/calendar?error=${encodeURIComponent(errText.slice(0, 500))}`)
  }

  revalidatePath(`/admin/brand-engine/${clientId}/calendar`)
  redirect(`/admin/brand-engine/${clientId}/calendar?refreshed=1`)
}
