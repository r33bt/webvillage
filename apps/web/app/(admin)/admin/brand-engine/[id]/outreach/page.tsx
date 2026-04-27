import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface SeqRow {
  id: string
  name: string
  channel: string
  status: string
  cadence_days: number[]
  template_ids: string[]
  created_at: string
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-700 border-slate-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-slate-50 text-slate-500 border-slate-200',
}

export default async function OutreachListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { id } = await params
  const { status } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: seqs }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name, reply_to_email, physical_address').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_outreach_sequences')
      .select('id, name, channel, status, cadence_days, template_ids, created_at')
      .eq('client_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  if (!client) notFound()

  let rows = (seqs ?? []) as SeqRow[]
  if (status && ['draft', 'active', 'paused', 'completed', 'archived'].includes(status)) {
    rows = rows.filter((r) => r.status === status)
  }

  const counts = {
    total: (seqs ?? []).length,
    draft: (seqs ?? []).filter((r) => r.status === 'draft').length,
    active: (seqs ?? []).filter((r) => r.status === 'active').length,
    paused: (seqs ?? []).filter((r) => r.status === 'paused').length,
    completed: (seqs ?? []).filter((r) => r.status === 'completed').length,
  }

  const ready = !!client.reply_to_email && !!client.physical_address

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Outreach sequences</p>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
          <p className="text-sm text-[#6B7C79]">
            Multi-touch email sequences via Resend. {counts.total} total · {counts.active} active · {counts.paused} paused.
          </p>
        </div>
        <Link
          href={`/admin/brand-engine/${id}/outreach/new`}
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
        >
          + New sequence
        </Link>
      </div>

      {!ready && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="mb-1 font-semibold">Brand not ready for outreach.</p>
          <ul className="list-disc pl-5 text-xs">
            {!client.reply_to_email && <li>Reply-To email is not set on this client. Add via wv_be_clients.reply_to_email.</li>}
            {!client.physical_address && <li>Physical address is not set (CAN-SPAM requires it in the footer).</li>}
          </ul>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip label="All" count={counts.total} active={!status} href={`/admin/brand-engine/${id}/outreach`} />
        <FilterChip label="Draft" count={counts.draft} active={status === 'draft'} href={`/admin/brand-engine/${id}/outreach?status=draft`} />
        <FilterChip label="Active" count={counts.active} active={status === 'active'} href={`/admin/brand-engine/${id}/outreach?status=active`} />
        <FilterChip label="Paused" count={counts.paused} active={status === 'paused'} href={`/admin/brand-engine/${id}/outreach?status=paused`} />
        <FilterChip label="Completed" count={counts.completed} active={status === 'completed'} href={`/admin/brand-engine/${id}/outreach?status=completed`} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-[#6B7C79]">
          No sequences yet. Create one above to start cold outreach.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((s) => (
            <Link
              key={s.id}
              href={`/admin/brand-engine/${id}/outreach/${s.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#0F766E]/40 hover:bg-slate-50"
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[s.status] ?? 'bg-slate-50'}`}>{s.status}</span>
                  <span className="font-semibold text-[#1C2B28]">{s.name}</span>
                  <span className="font-mono text-xs text-[#6B7C79]">{s.channel}</span>
                </div>
                <span className="text-xs text-[#6B7C79]">
                  {s.template_ids.length} touches · cadence {s.cadence_days.join('/')}d
                </span>
              </div>
              <p className="font-mono text-xs text-[#6B7C79]">id: {s.id.slice(0, 8)} · created {new Date(s.created_at).toISOString().slice(0, 10)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, count, active, href }: { label: string; count: number; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? 'border-[#0F766E] bg-[#0F766E] text-white' : 'border-slate-300 bg-white text-[#6B7C79] hover:border-slate-400'
      }`}
    >
      {label} <span className={active ? 'text-white/80' : 'text-[#6B7C79]'}>({count})</span>
    </Link>
  )
}
