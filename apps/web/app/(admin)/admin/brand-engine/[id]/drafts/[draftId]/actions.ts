'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createSupabaseServiceClient } from '@/lib/supabase'

export async function regenerateDraft(formData: FormData): Promise<void> {
  const draftId = String(formData.get('draft_id') ?? '')
  if (!draftId) throw new Error('Missing draft_id')

  const sb = createSupabaseServiceClient()
  const { data: parent, error } = await sb
    .from('wv_be_drafts')
    .select('id, client_id, template_id, prompt_text, source_type')
    .eq('id', draftId)
    .single()
  if (error || !parent) throw new Error(`Parent draft not found: ${error?.message}`)
  if (!parent.template_id) throw new Error('Parent draft has no template_id; cannot regenerate')

  // Determine origin for absolute URL (Next 15 server actions)
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const baseUrl = `${proto}://${host}`

  const resp = await fetch(`${baseUrl}/api/be/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: parent.client_id,
      template_id: parent.template_id,
      prompt: parent.prompt_text,
      parent_draft_id: parent.id,
      source_type: parent.source_type,
    }),
  })
  if (!resp.ok) {
    const errText = await resp.text()
    throw new Error(`Regenerate failed (${resp.status}): ${errText.slice(0, 200)}`)
  }
  const result = await resp.json()

  revalidatePath(`/admin/brand-engine/${parent.client_id}/drafts`)
  revalidatePath(`/admin/brand-engine/${parent.client_id}/drafts/${draftId}`)
  redirect(`/admin/brand-engine/${parent.client_id}/drafts/${result.draft_id}`)
}

export async function updateDraftStatus(formData: FormData): Promise<void> {
  const draftId = String(formData.get('draft_id') ?? '')
  const newStatus = String(formData.get('new_status') ?? '')
  const validStatuses = ['generated', 'edited', 'approved', 'rejected', 'published', 'archived']
  if (!draftId) throw new Error('Missing draft_id')
  if (!validStatuses.includes(newStatus)) throw new Error(`Invalid status: ${newStatus}`)

  const sb = createSupabaseServiceClient()
  const { data: existing, error: fErr } = await sb.from('wv_be_drafts').select('id, client_id').eq('id', draftId).single()
  if (fErr || !existing) throw new Error(`Draft not found: ${fErr?.message}`)

  const { error } = await sb.from('wv_be_drafts').update({ status: newStatus }).eq('id', draftId)
  if (error) throw new Error(`Status update failed: ${error.message}`)

  // Audit log: founder status override
  await sb.from('wv_be_audit_log').insert({
    client_id: existing.client_id,
    actor_user_id: null,
    actor_type: 'founder',
    action: 'draft_status_override',
    target_table: 'wv_be_drafts',
    target_id: draftId,
    after_state: { new_status: newStatus, source: 'admin_ui' },
  })

  revalidatePath(`/admin/brand-engine/${existing.client_id}/drafts`)
  revalidatePath(`/admin/brand-engine/${existing.client_id}/drafts/${draftId}`)
}
