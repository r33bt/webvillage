import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { startSequence, pauseSequence } from './actions'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-50 text-slate-700 border-slate-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-slate-50 text-slate-500 border-slate-200',
}

const RCP_BADGE: Record<string, string> = {
  pending: 'bg-slate-50 text-slate-600 border-slate-200',
  sending: 'bg-blue-50 text-blue-700 border-blue-200',
  replied: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  opted_out: 'bg-amber-50 text-amber-700 border-amber-200',
  bounced: 'bg-red-50 text-red-700 border-red-200',
  spam: 'bg-red-50 text-red-800 border-red-300',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

export default async function SequenceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sequenceId: string }>
  searchParams: Promise<{ error?: string; started?: string; paused?: string }>
}) {
  const { id, sequenceId } = await params
  const { error, started, paused } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: seqData }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name, reply_to_email, physical_address').eq('id', id).is('deleted_at', null).single(),
    sb.from('wv_be_outreach_sequences').select('*').eq('id', sequenceId).is('deleted_at', null).maybeSingle(),
  ])

  if (!client || !seqData) notFound()

  const seq = seqData as {
    id: string; name: string; channel: string; status: string
    cadence_days: number[]; template_ids: string[]
    reply_to_email_override: string | null; per_domain_daily_cap: number
    created_at: string; updated_at: string
  }

  // Fetch recipients (up to 200)
  const { data: rcps } = await sb
    .from('wv_be_outreach_recipients')
    .select('id, email, first_name, last_name, organization, status, opted_out_at, replied_at, bounced_at, created_at')
    .eq('sequence_id', sequenceId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  // Fetch per-touch stats from messages
  const { data: msgs } = await sb
    .from('wv_be_outreach_messages')
    .select('step_index, sent_at, delivered_at, open_count, reply_received_at, send_failure_reason')
    .eq('sequence_id', sequenceId)
    .limit(5000)

  const totalTouches = seq.template_ids.length
  const touches = Array.from({ length: totalTouches }).map((_, i) => {
    const ti = i + 1
    const m = (msgs ?? []).filter((x) => x.step_index === ti)
    return {
      touch: ti,
      day: seq.cadence_days[i] ?? '?',
      template_id: seq.template_ids[i],
      sent: m.filter((x) => x.sent_at).length,
      delivered: m.filter((x) => x.delivered_at).length,
      opens: m.reduce((s, x) => s + ((x.open_count as number) ?? 0), 0),
      replies: m.filter((x) => x.reply_received_at).length,
      bounces: m.filter((x) => x.send_failure_reason).length,
    }
  })

  const rcpList = rcps ?? []
  const totalRcps = rcpList.length
  const eligible = rcpList.filter((r) => r.status === 'pending').length
  const sending = rcpList.filter((r) => r.status === 'sending').length

  const totalSent = (msgs ?? []).filter((m) => m.sent_at).length
  const totalDelivered = (msgs ?? []).filter((m) => m.delivered_at).length
  const totalOpens = (msgs ?? []).reduce((s, m) => s + ((m.open_count as number) ?? 0), 0)
  const totalReplies = rcpList.filter((r) => r.replied_at).length

  const canSend = ['draft', 'paused'].includes(seq.status) && totalRcps > 0 && !!client.reply_to_email && !!client.physical_address
  const canPause = seq.status === 'active'

  // Cost estimate for confirmation
  const estCents = eligible * totalTouches * 5

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}/outreach`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Outreach
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[seq.status] ?? ''}`}>
              {seq.status}
            </span>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0F766E]">{seq.channel}</p>
          </div>
          <h1 className="text-2xl font-bold text-[#1C2B28]">{seq.name}</h1>
          <p className="text-sm text-[#6B7C79]">
            {totalTouches} touches · cadence {seq.cadence_days.join('/')}d · cap {seq.per_domain_daily_cap}/domain/day
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canSend && (
            <form action={startSequence}>
              <input type="hidden" name="client_id" value={id} />
              <input type="hidden" name="sequence_id" value={sequenceId} />
              {estCents > 50 && <input type="hidden" name="confirm_estimate_cost_cents" value={estCents} />}
              <button
                type="submit"
                className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0d655d]"
              >
                {seq.status === 'paused' ? 'Resume' : 'Send now'}
                {estCents > 0 && <span className="ml-1 text-xs opacity-80">(est. ${(estCents / 100).toFixed(2)})</span>}
              </button>
            </form>
          )}
          {canPause && (
            <form action={pauseSequence}>
              <input type="hidden" name="client_id" value={id} />
              <input type="hidden" name="sequence_id" value={sequenceId} />
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#1C2B28] hover:bg-slate-50"
              >
                Pause
              </button>
            </form>
          )}
          <Link
            href={`/admin/brand-engine/${id}/outreach/${sequenceId}/recipients`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#1C2B28] hover:bg-slate-50"
          >
            Import recipients
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <p className="mb-1 font-semibold">Error</p>
          <pre className="overflow-auto text-xs whitespace-pre-wrap">{decodeURIComponent(error)}</pre>
        </div>
      )}
      {started && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Sequence started — touch 1 jobs enqueued and will fire within one cron tick.
        </div>
      )}
      {paused && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sequence paused — pending send jobs cancelled.
        </div>
      )}

      {/* Per-touch stats */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#1C2B28]">Per-touch</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-[#1C2B28]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[#6B7C79]">
                <th className="pb-2 pr-3 font-semibold">Touch</th>
                <th className="pb-2 pr-3 font-semibold">Day</th>
                <th className="pb-2 pr-3 font-semibold">Template</th>
                <th className="pb-2 pr-3 font-semibold">Sent</th>
                <th className="pb-2 pr-3 font-semibold">Delivered</th>
                <th className="pb-2 pr-3 font-semibold">Opens</th>
                <th className="pb-2 pr-3 font-semibold">Replies</th>
                <th className="pb-2 font-semibold">Bounces</th>
              </tr>
            </thead>
            <tbody>
              {touches.map((t) => (
                <tr key={t.touch} className="border-b border-slate-50">
                  <td className="py-1.5 pr-3 font-semibold">T{t.touch}</td>
                  <td className="py-1.5 pr-3 text-[#6B7C79]">+{t.day}d</td>
                  <td className="py-1.5 pr-3 font-mono text-[#6B7C79]">{(t.template_id as string).slice(0, 8)}</td>
                  <td className="py-1.5 pr-3">{t.sent}</td>
                  <td className="py-1.5 pr-3">{t.delivered}</td>
                  <td className="py-1.5 pr-3">{t.opens}</td>
                  <td className="py-1.5 pr-3">{t.replies}</td>
                  <td className="py-1.5">{t.bounces > 0 ? <span className="text-red-600">{t.bounces}</span> : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rollup */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Recipients" value={totalRcps} />
        <Stat label="Eligible" value={eligible} />
        <Stat label="Sending" value={sending} />
        <Stat label="Total sent" value={totalSent} />
        <Stat label="Delivered" value={totalDelivered} />
        <Stat label="Opens" value={totalOpens} />
        <Stat label="Replies" value={totalReplies} />
        <Stat label="Open rate" value={totalDelivered > 0 ? `${((totalOpens / totalDelivered) * 100).toFixed(1)}%` : '—'} />
      </div>

      {/* Recipients table */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1C2B28]">
            Recipients <span className="font-normal text-[#6B7C79]">({totalRcps})</span>
          </h2>
          <Link
            href={`/admin/brand-engine/${id}/outreach/${sequenceId}/recipients`}
            className="text-xs font-semibold text-[#0F766E] hover:underline"
          >
            + Import CSV
          </Link>
        </div>

        {rcpList.length === 0 ? (
          <p className="text-sm text-[#6B7C79]">No recipients yet. Import a CSV to add them.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-[#1C2B28]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[#6B7C79]">
                  <th className="pb-2 pr-3 font-semibold">Email</th>
                  <th className="pb-2 pr-3 font-semibold">Name</th>
                  <th className="pb-2 pr-3 font-semibold">Org</th>
                  <th className="pb-2 pr-3 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Added</th>
                </tr>
              </thead>
              <tbody>
                {rcpList.slice(0, 100).map((r) => (
                  <tr key={r.id as string} className="border-b border-slate-50">
                    <td className="py-1.5 pr-3 font-mono">{r.email as string}</td>
                    <td className="py-1.5 pr-3">{[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}</td>
                    <td className="py-1.5 pr-3">{(r.organization as string | null) ?? '—'}</td>
                    <td className="py-1.5 pr-3">
                      <span className={`rounded-full border px-2 py-0.5 font-semibold ${RCP_BADGE[r.status as string] ?? ''}`}>
                        {r.status as string}
                      </span>
                    </td>
                    <td className="py-1.5 text-[#6B7C79]">{new Date(r.created_at as string).toISOString().slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rcpList.length > 100 && (
              <p className="mt-2 text-center text-xs text-[#6B7C79]">Showing 100 of {rcpList.length}.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-[#6B7C79]">{label}</p>
      <p className="text-2xl font-bold text-[#1C2B28]">{value}</p>
    </div>
  )
}
