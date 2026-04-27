// apps/web/app/api/be/outreach/sequences/[id]/recipients/route.ts
// Slice 10: CSV recipient import. Multipart/form-data. Strict consent validation per Q10-9.

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { parseRecipientCsv } from '@/lib/outreach-csv'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  const formData = await req.formData()
  const csvFile = formData.get('csv') as File | null
  const forcePartial = formData.get('force_partial') === 'true'

  if (!csvFile) {
    return NextResponse.json({ error: 'missing_csv_file' }, { status: 400 })
  }

  let csvText: string
  try {
    csvText = await csvFile.text()
  } catch {
    return NextResponse.json({ error: 'csv_not_utf8' }, { status: 415 })
  }

  const sb = createSupabaseServiceClient()
  const { data: seq } = await sb.from('wv_be_outreach_sequences').select('id, client_id, status').eq('id', id).is('deleted_at', null).maybeSingle()
  if (!seq) return NextResponse.json({ error: 'sequence_not_found' }, { status: 404 })

  if (!['draft', 'paused'].includes(seq.status as string)) {
    return NextResponse.json({ error: 'sequence_not_in_draftable_state', current_state: seq.status }, { status: 409 })
  }

  const parsed = parseRecipientCsv(csvText)

  if (parsed.errors.length > 0 && !forcePartial) {
    return NextResponse.json(
      {
        error: 'validation_failed',
        rejected_rows: parsed.errors,
        total_rows: parsed.total_rows,
        valid_count: parsed.rows.length,
        hint: 'Add force_partial=true to import only valid rows',
      },
      { status: 422 }
    )
  }

  if (parsed.rows.length === 0) {
    return NextResponse.json({ error: 'no_valid_rows', rejected_rows: parsed.errors }, { status: 422 })
  }

  // Check for emails already in this sequence (dedup)
  const emails = parsed.rows.map((r) => r.email)
  const { data: existing } = await sb
    .from('wv_be_outreach_recipients')
    .select('email')
    .eq('sequence_id', id)
    .in('email', emails)
    .is('deleted_at', null)
  const existingSet = new Set((existing ?? []).map((r) => (r.email as string).toLowerCase()))
  const newRows = parsed.rows.filter((r) => !existingSet.has(r.email.toLowerCase()))
  const dupesInSequence = parsed.rows.filter((r) => existingSet.has(r.email.toLowerCase())).map((r) => r.email)

  if (newRows.length === 0) {
    return NextResponse.json({
      sequence_id: id,
      imported_count: 0,
      rejected_rows: parsed.errors,
      duplicate_emails_in_file: parsed.duplicate_emails_in_file,
      duplicate_emails_in_sequence: dupesInSequence,
      detail: 'all rows already in sequence',
    })
  }

  // Insert
  const inserts = newRows.map((r) => ({
    client_id: seq.client_id,
    sequence_id: id,
    email: r.email,
    first_name: r.first_name,
    last_name: r.last_name,
    organization: r.organization,
    recipient_consent: r.recipient_consent,
    recipient_source: r.recipient_source,
    vars: r.vars,
    imported_via: 'csv',
    status: 'pending',
  }))

  const { error: insertErr } = await sb.from('wv_be_outreach_recipients').insert(inserts)
  if (insertErr) {
    return NextResponse.json({ error: 'recipients_persist_failed', detail: insertErr.message }, { status: 500 })
  }

  await sb.from('wv_be_audit_log').insert({
    client_id: seq.client_id,
    actor_user_id: null,
    actor_type: 'user',
    action: 'recipients_imported',
    target_table: 'wv_be_outreach_sequences',
    target_id: id,
    after_state: { imported_count: newRows.length, rejected_count: parsed.errors.length, duplicates_in_file: parsed.duplicate_emails_in_file.length, duplicates_in_sequence: dupesInSequence.length },
  })

  return NextResponse.json({
    sequence_id: id,
    imported_count: newRows.length,
    rejected_rows: parsed.errors,
    duplicate_emails_in_file: parsed.duplicate_emails_in_file,
    duplicate_emails_in_sequence: dupesInSequence,
  })
}
