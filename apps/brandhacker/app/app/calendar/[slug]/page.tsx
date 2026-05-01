import { notFound } from 'next/navigation'
import { getServiceRoleClient } from '@/lib/supabase'
import { CalendarClient } from './CalendarClient'

export const dynamic = 'force-dynamic'

export type CalendarSlot = {
  id: string
  calendar_id: string
  client_id: string
  slot_index: number
  channel: string
  piece_type: string
  scheduled_for: string
  topic_brief: string | null
  status: string
  approval_state: string | null
  sla_state: string | null
  sla_target_at: string | null
  reschedule_count: number
  draft_id: string | null
  publish_id: string | null
}

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ view?: string; platform?: string; from?: string; key?: string }>
}

export default async function CalendarPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  // Internal token gate (fail-open in dev)
  const token = process.env.BH_INTERNAL_TOKEN
  if (token && sp.key !== token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-zinc-400 text-sm">Internal access required.</p>
          <p className="text-zinc-600 text-xs">Pass <code className="bg-zinc-900 px-1 rounded">?key=…</code> to continue.</p>
        </div>
      </div>
    )
  }

  const view = sp.view === '30d' ? '30d' : '7d'
  const platform = sp.platform ?? 'all'
  const fromParam = sp.from
  const internalKey = sp.key

  const sb = getServiceRoleClient()

  // Resolve slug → client
  const { data: client } = await sb
    .from('wv_be_clients')
    .select('id, display_name, current_tier')
    .eq('metadata->>slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (!client) notFound()

  // Compute window
  const fromDate = fromParam ? new Date(fromParam) : new Date()
  if (isNaN(fromDate.getTime())) fromDate.setTime(Date.now())
  fromDate.setHours(0, 0, 0, 0)

  const toDate = new Date(fromDate)
  toDate.setDate(toDate.getDate() + (view === '30d' ? 30 : 7))

  // Fetch slots
  let query = sb
    .from('wv_be_calendar_slots')
    .select(
      'id, calendar_id, client_id, slot_index, channel, piece_type, scheduled_for, topic_brief, status, approval_state, sla_state, sla_target_at, reschedule_count, draft_id, publish_id',
    )
    .eq('client_id', client.id)
    .gte('scheduled_for', fromDate.toISOString())
    .lt('scheduled_for', toDate.toISOString())
    .order('scheduled_for', { ascending: true })

  if (platform !== 'all') {
    query = query.eq('channel', platform)
  }

  const { data: slots } = await query

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Content calendar</p>
        <h1 className="text-2xl font-semibold text-zinc-50">{client.display_name}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {client.current_tier} · {slug}
        </p>
      </div>

      <CalendarClient
        slug={slug}
        view={view}
        platform={platform}
        fromISO={fromDate.toISOString()}
        slots={(slots ?? []) as CalendarSlot[]}
        internalKey={internalKey}
      />
    </div>
  )
}
