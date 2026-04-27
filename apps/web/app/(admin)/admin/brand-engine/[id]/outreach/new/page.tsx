import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface TemplateRow {
  id: string
  name: string
  template_type: string
  platform: string | null
  subject_template: string | null
  client_id: string | null
}

async function createSequence(formData: FormData) {
  'use server'
  const clientId = formData.get('client_id') as string
  const name = (formData.get('name') as string)?.trim()
  const reply_to_email_override = (formData.get('reply_to_email_override') as string)?.trim() || null
  const per_domain_daily_cap = parseInt(formData.get('per_domain_daily_cap') as string, 10) || 50
  const cadence_str = (formData.get('cadence_days') as string)?.trim() || ''
  const template_str = (formData.get('template_ids') as string)?.trim() || ''

  const cadence_days = cadence_str.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n >= 0)
  const template_ids = template_str.split(',').map((s) => s.trim()).filter((s) => s.length > 0)

  if (!name || cadence_days.length === 0 || template_ids.length === 0 || cadence_days.length !== template_ids.length) {
    redirect(`/admin/brand-engine/${clientId}/outreach/new?error=${encodeURIComponent('Name, cadence, and templates are required, and lengths must match.')}`)
  }

  const sb = createSupabaseServiceClient()
  const { data: created, error } = await sb
    .from('wv_be_outreach_sequences')
    .insert({
      client_id: clientId,
      name,
      channel: 'email',
      cadence_days,
      template_ids,
      reply_to_email_override,
      per_domain_daily_cap,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error || !created) {
    redirect(`/admin/brand-engine/${clientId}/outreach/new?error=${encodeURIComponent(error?.message ?? 'create_failed')}`)
  }

  redirect(`/admin/brand-engine/${clientId}/outreach/${created.id}`)
}

export default async function NewSequencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: templates }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name, reply_to_email').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_templates')
      .select('id, name, template_type, platform, subject_template, client_id')
      .or(`client_id.eq.${id},client_id.is.null`)
      .is('deleted_at', null)
      .order('client_id', { ascending: false, nullsFirst: false })
      .order('name', { ascending: true }),
  ])

  if (!client) notFound()
  const tmpls = (templates ?? []) as TemplateRow[]
  // Outreach-suitable templates have a subject_template OR are explicitly typed for outreach
  const outreachTmpls = tmpls.filter((t) => t.subject_template !== null || t.template_type.includes('outreach') || t.template_type === 'email')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/outreach`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Outreach
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-[#1C2B28]">New outreach sequence</h1>
      <p className="mb-8 text-sm text-[#6B7C79]">Multi-touch email — cadence in days from kickoff (Touch 1 = day 0).</p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>
      )}

      <form action={createSequence} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
        <input type="hidden" name="client_id" value={id} />

        <Field label="Sequence name" name="name" placeholder="Q2 Chamber outreach" required />

        <Field
          label="Cadence (comma-separated days from kickoff)"
          name="cadence_days"
          placeholder="0, 3, 7, 14"
          help="One number per touch. Touch 1 = day 0 means 'send immediately'."
          required
        />

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">
            Template IDs (comma-separated, in cadence order)
          </label>
          <input
            type="text"
            name="template_ids"
            placeholder="uuid1, uuid2, uuid3, uuid4"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-[#1C2B28] focus:border-[#0F766E] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[#6B7C79]">Must match cadence length. Use the IDs from the list below.</p>
        </div>

        <Field
          label="Reply-To email (override)"
          name="reply_to_email_override"
          placeholder={client.reply_to_email ?? 'optional — falls back to client.reply_to_email'}
          help={`Default: ${client.reply_to_email ?? 'NOT SET on this client'}`}
        />

        <Field
          label="Per-domain daily cap"
          name="per_domain_daily_cap"
          type="number"
          defaultValue="50"
          help="Max sends per recipient domain per 24h window (Q10-11)."
        />

        <button
          type="submit"
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
        >
          Create sequence
        </button>
      </form>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-bold text-[#1C2B28]">Available outreach templates</h2>
        {outreachTmpls.length === 0 ? (
          <p className="text-sm text-[#6B7C79]">
            No outreach templates yet. Add templates with a <span className="font-mono">subject_template</span> set, or with{' '}
            <span className="font-mono">template_type</span> containing <span className="font-mono">outreach</span> or equal to{' '}
            <span className="font-mono">email</span>.
          </p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {outreachTmpls.map((t) => (
              <li key={t.id} className="flex items-baseline gap-2">
                <span className="font-mono text-[#6B7C79]">{t.id}</span>
                <span className="text-[#1C2B28]">{t.name}</span>
                <span className="text-[#6B7C79]">[{t.template_type}{t.platform ? `/${t.platform}` : ''}]</span>
                {t.client_id && <span className="rounded-full bg-amber-50 px-1.5 text-[10px] text-amber-700 border border-amber-200">brand</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Field({
  label, name, placeholder, help, type = 'text', defaultValue, required,
}: { label: string; name: string; placeholder?: string; help?: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-[#1C2B28]">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#1C2B28] focus:border-[#0F766E] focus:outline-none"
      />
      {help && <p className="mt-1 text-xs text-[#6B7C79]">{help}</p>}
    </div>
  )
}
