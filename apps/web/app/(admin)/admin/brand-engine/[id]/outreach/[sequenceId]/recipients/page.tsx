import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function importRecipients(formData: FormData) {
  'use server'
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const baseUrl = `${proto}://${host}`

  const clientId = formData.get('client_id') as string
  const sequenceId = formData.get('sequence_id') as string
  const csv = (formData.get('csv') as string)?.trim()
  const source = ((formData.get('recipient_source') as string) || 'manual_import').trim()

  if (!csv) {
    redirect(`/admin/brand-engine/${clientId}/outreach/${sequenceId}/recipients?error=${encodeURIComponent('CSV content is required.')}`)
  }

  const resp = await fetch(`${baseUrl}/api/be/outreach/sequences/${sequenceId}/recipients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv, recipient_source: source }),
  })

  const body = await resp.json().catch(() => ({ error: 'parse_failed' }))

  if (!resp.ok) {
    redirect(`/admin/brand-engine/${clientId}/outreach/${sequenceId}/recipients?error=${encodeURIComponent(JSON.stringify(body))}`)
  }

  redirect(`/admin/brand-engine/${clientId}/outreach/${sequenceId}?started=0#recipients`)
}

export default async function RecipientsImportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sequenceId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id, sequenceId } = await params
  const { error } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: seq }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb.from('wv_be_outreach_sequences').select('id, name, status').eq('id', sequenceId).is('deleted_at', null).maybeSingle(),
  ])

  if (!client || !seq) notFound()

  const { count: existing } = await sb
    .from('wv_be_outreach_recipients')
    .select('id', { count: 'exact', head: true })
    .eq('sequence_id', sequenceId)
    .is('deleted_at', null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/outreach/${sequenceId}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; {seq.name as string}
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-[#1C2B28]">Import recipients</h1>
      <p className="mb-8 text-sm text-[#6B7C79]">
        {existing ?? 0} already imported. Duplicates (same email) are silently skipped.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <p className="mb-1 font-semibold">Import failed</p>
          <pre className="overflow-auto text-xs whitespace-pre-wrap">{decodeURIComponent(error)}</pre>
        </div>
      )}

      <form action={importRecipients} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <input type="hidden" name="client_id" value={id} />
        <input type="hidden" name="sequence_id" value={sequenceId} />

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">Recipient source <span className="font-normal text-[#6B7C79]">(consent basis)</span></label>
          <input
            type="text"
            name="recipient_source"
            defaultValue="manual_import"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#1C2B28] focus:border-[#0F766E] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[#6B7C79]">Stored as consent basis (CAN-SPAM Q10-9). Examples: &quot;chamber_directory&quot;, &quot;linkedin_connection&quot;, &quot;conference_2026&quot;.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">CSV data</label>
          <p className="mb-2 text-xs text-[#6B7C79]">
            Required columns: <span className="font-mono">email</span>. Optional: <span className="font-mono">first_name, last_name, organization</span> + any custom columns (stored as <span className="font-mono">vars</span>).
          </p>
          <textarea
            name="csv"
            rows={14}
            required
            placeholder={`email,first_name,last_name,organization\njane@example.com,Jane,Smith,Acme Corp\njohn@example.com,John,Doe,`}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-[#1C2B28] focus:border-[#0F766E] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
        >
          Import recipients
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-[#6B7C79]">
        <p className="mb-1 font-semibold text-[#1C2B28]">Consent note (CAN-SPAM / GDPR)</p>
        <p>Every recipient is stored with <span className="font-mono">recipient_consent = true</span> and the source you enter above. Ensure you have a lawful basis for contacting each address before importing. Unsubscribes are processed one-click via RFC 8058 List-Unsubscribe headers included in every email.</p>
      </div>
    </div>
  )
}
