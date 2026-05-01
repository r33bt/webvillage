'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import type { CalendarSlot } from './page'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Props = {
  slug: string
  view: '7d' | '30d'
  platform: string
  fromISO: string
  slots: CalendarSlot[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PLATFORMS = [
  { id: 'all', label: 'All' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'x', label: 'X' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'email', label: 'Email' },
  { id: 'blog', label: 'Blog' },
]

const CHANNEL_COLORS: Record<string, string> = {
  linkedin:  'bg-blue-900/60 border-blue-700/50 text-blue-200',
  instagram: 'bg-pink-900/60 border-pink-700/50 text-pink-200',
  x:         'bg-zinc-800 border-zinc-700 text-zinc-200',
  tiktok:    'bg-violet-900/60 border-violet-700/50 text-violet-200',
  facebook:  'bg-indigo-900/60 border-indigo-700/50 text-indigo-200',
  email:     'bg-amber-900/60 border-amber-700/50 text-amber-200',
  blog:      'bg-emerald-900/60 border-emerald-700/50 text-emerald-200',
}

const CHANNEL_DOTS: Record<string, string> = {
  linkedin:  'bg-blue-400',
  instagram: 'bg-pink-400',
  x:         'bg-zinc-400',
  tiktok:    'bg-violet-400',
  facebook:  'bg-indigo-400',
  email:     'bg-amber-400',
  blog:      'bg-emerald-400',
}

const STATUS_BADGE: Record<string, string> = {
  planned:           'bg-zinc-800 text-zinc-400',
  briefed:           'bg-zinc-700 text-zinc-300',
  in_production:     'bg-blue-900/80 text-blue-300',
  awaiting_approval: 'bg-amber-900/80 text-amber-300',
  approved:          'bg-emerald-900/80 text-emerald-300',
  scheduled:         'bg-teal-900/80 text-teal-300',
  published:         'bg-green-900/80 text-green-300',
  cancelled:         'bg-zinc-900 text-zinc-600 line-through',
  failed:            'bg-red-900/80 text-red-300',
}

const SLA_RING: Record<string, string> = {
  green:   '',
  amber:   'ring-1 ring-amber-500/60',
  red:     'ring-1 ring-red-500/80',
  breached:'ring-2 ring-red-600',
  na:      '',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date())
}

function fmtDayHeader(d: Date): string {
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function fmtMonthHeader(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function buildHref(slug: string, params: Record<string, string>): string {
  const p = new URLSearchParams(params)
  return `/app/calendar/${slug}?${p.toString()}`
}

// ---------------------------------------------------------------------------
// SlotCard
// ---------------------------------------------------------------------------

function SlotCard({
  slot,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  slot: CalendarSlot
  dragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
}) {
  const colors = CHANNEL_COLORS[slot.channel] ?? 'bg-zinc-800 border-zinc-700 text-zinc-300'
  const badge = STATUS_BADGE[slot.status] ?? 'bg-zinc-800 text-zinc-400'
  const ring = SLA_RING[slot.sla_state ?? 'na'] ?? ''

  return (
    <div
      draggable
      onDragStart={() => onDragStart(slot.id)}
      onDragEnd={onDragEnd}
      className={`
        border rounded-md p-2 cursor-grab active:cursor-grabbing select-none
        transition-opacity
        ${colors} ${ring}
        ${dragging ? 'opacity-40' : 'opacity-100'}
      `}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CHANNEL_DOTS[slot.channel] ?? 'bg-zinc-400'}`} />
        <span className="text-[10px] uppercase tracking-widest opacity-70">{slot.channel}</span>
        <span className={`ml-auto text-[10px] rounded px-1 py-0.5 ${badge}`}>
          {slot.status.replace('_', ' ')}
        </span>
      </div>
      {slot.topic_brief && (
        <p className="text-xs leading-snug line-clamp-2 opacity-90">{slot.topic_brief}</p>
      )}
      <p className="text-[10px] opacity-50 mt-1">{fmtTime(slot.scheduled_for)}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DayCell (drop target for drag-to-reschedule)
// ---------------------------------------------------------------------------

function DayCell({
  date,
  slots,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  date: Date
  slots: CalendarSlot[]
  draggingId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (slotId: string, targetDate: Date) => void
}) {
  const [over, setOver] = useState(false)
  const today = isToday(date)

  return (
    <div
      className={`
        min-h-[120px] rounded-lg border p-2 flex flex-col gap-1.5 transition-colors
        ${today ? 'border-zinc-600' : 'border-zinc-800'}
        ${over && draggingId ? 'bg-zinc-800/60 border-zinc-600' : 'bg-zinc-950'}
      `}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        if (draggingId) onDrop(draggingId, date)
      }}
    >
      <div className={`text-xs mb-1 ${today ? 'text-zinc-200 font-semibold' : 'text-zinc-500'}`}>
        {today ? 'Today' : fmtDayHeader(date)}
      </div>
      {slots.map((s) => (
        <SlotCard
          key={s.id}
          slot={s}
          dragging={draggingId === s.id}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
      {over && draggingId && (
        <div className="border border-dashed border-zinc-600 rounded-md h-10 flex items-center justify-center">
          <span className="text-xs text-zinc-500">Drop here</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 7-day view
// ---------------------------------------------------------------------------

function SevenDayView({
  from,
  slots,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  from: Date
  slots: CalendarSlot[]
  draggingId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (slotId: string, targetDate: Date) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i))

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const daySlots = slots.filter((s) => isSameDay(new Date(s.scheduled_for), day))
        return (
          <DayCell
            key={day.toISOString()}
            date={day}
            slots={daySlots}
            draggingId={draggingId}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
          />
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// 30-day view
// ---------------------------------------------------------------------------

function ThirtyDayView({
  from,
  slots,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  from: Date
  slots: CalendarSlot[]
  draggingId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (slotId: string, targetDate: Date) => void
}) {
  // Calendar grid: start from the Monday of the week containing `from`
  const startOfGrid = new Date(from)
  const dayOfWeek = startOfGrid.getDay() // 0=Sun
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // shift to Mon-start
  startOfGrid.setDate(startOfGrid.getDate() - offset)

  // Build 5 weeks (35 days) grid
  const weeks: Date[][] = []
  let cursor = new Date(startOfGrid)
  for (let w = 0; w < 5; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor = addDays(cursor, 1)
    }
    weeks.push(week)
  }

  const endDate = addDays(from, 30)

  return (
    <div className="space-y-1">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1">
        {([...DAY_LABELS.slice(1), DAY_LABELS[0] ?? 'Sun']).map((d) => (
          <div key={d} className="text-center text-[10px] uppercase tracking-widest text-zinc-600 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1">
          {week.map((day) => {
            const inWindow = day >= from && day < endDate
            const daySlots = inWindow
              ? slots.filter((s) => isSameDay(new Date(s.scheduled_for), day))
              : []

            return (
              <DayCell
                key={day.toISOString()}
                date={day}
                slots={daySlots}
                draggingId={draggingId}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CalendarClient (main)
// ---------------------------------------------------------------------------

export function CalendarClient({ slug, view, platform, fromISO, slots: initialSlots }: Props) {
  const router = useRouter()
  const [slots, setSlots] = useState<CalendarSlot[]>(initialSlots)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const reschedulingRef = useRef(false)

  const from = new Date(fromISO)

  // Navigation helpers
  const navigate = useCallback(
    (params: Record<string, string>) => {
      router.push(buildHref(slug, params))
    },
    [slug, router],
  )

  const prevWindow = () => {
    const d = addDays(from, view === '30d' ? -30 : -7)
    navigate({ view, platform, from: d.toISOString().slice(0, 10) })
  }

  const nextWindow = () => {
    const d = addDays(from, view === '30d' ? 30 : 7)
    navigate({ view, platform, from: d.toISOString().slice(0, 10) })
  }

  const goToday = () => {
    navigate({ view, platform, from: new Date().toISOString().slice(0, 10) })
  }

  const setView = (v: '7d' | '30d') => navigate({ view: v, platform, from: from.toISOString().slice(0, 10) })

  const setPlatform = (p: string) => navigate({ view, platform: p, from: from.toISOString().slice(0, 10) })

  // Drag-to-reschedule
  const handleDrop = useCallback(
    async (slotId: string, targetDate: Date) => {
      if (reschedulingRef.current) return
      const slot = slots.find((s) => s.id === slotId)
      if (!slot) return

      const originalTime = new Date(slot.scheduled_for)
      targetDate.setHours(originalTime.getHours(), originalTime.getMinutes(), 0, 0)
      if (isSameDay(originalTime, targetDate)) return

      reschedulingRef.current = true
      setError(null)

      // Optimistic update
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, scheduled_for: targetDate.toISOString(), reschedule_count: s.reschedule_count + 1 }
            : s,
        ),
      )

      try {
        const res = await fetch(`/api/be/calendar/slots/${slotId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scheduled_for: targetDate.toISOString() }),
        })

        if (!res.ok) {
          // Rollback
          setSlots((prev) =>
            prev.map((s) => (s.id === slotId ? { ...s, scheduled_for: slot.scheduled_for, reschedule_count: slot.reschedule_count } : s)),
          )
          const body = await res.json().catch(() => ({}))
          setError((body as { error?: string }).error ?? 'Reschedule failed')
        }
      } catch {
        setSlots((prev) =>
          prev.map((s) => (s.id === slotId ? { ...s, scheduled_for: slot.scheduled_for, reschedule_count: slot.reschedule_count } : s)),
        )
        setError('Network error — reschedule not saved')
      } finally {
        reschedulingRef.current = false
      }
    },
    [slots],
  )

  // Window label
  const windowLabel =
    view === '30d'
      ? fmtMonthHeader(from)
      : `${fmtDayHeader(from)} – ${fmtDayHeader(addDays(from, 6))}`

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View toggle */}
        <div className="flex rounded-md overflow-hidden border border-zinc-800">
          {(['7d', '30d'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v ? 'bg-zinc-700 text-zinc-50' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {v === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>

        {/* Nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevWindow}
            className="px-2 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded text-sm transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextWindow}
            className="px-2 py-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded text-sm transition-colors"
          >
            →
          </button>
        </div>

        <span className="text-sm text-zinc-400 font-medium">{windowLabel}</span>

        <div className="ml-auto flex items-center gap-1 text-xs text-zinc-600">
          <span>{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Platform filter */}
      <div className="flex flex-wrap gap-1">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlatform(p.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              platform === p.id
                ? 'bg-zinc-700 text-zinc-50'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Error toast */}
      {error && (
        <div className="rounded-md bg-red-950 border border-red-800 px-4 py-2 text-sm text-red-300 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 ml-4">✕</button>
        </div>
      )}

      {/* Calendar grid */}
      {view === '7d' ? (
        <SevenDayView
          from={from}
          slots={slots}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onDrop={handleDrop}
        />
      ) : (
        <ThirtyDayView
          from={from}
          slots={slots}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onDrop={handleDrop}
        />
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-zinc-900">
        {Object.entries(CHANNEL_DOTS).map(([ch, dot]) => (
          <div key={ch} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-[11px] text-zinc-500 capitalize">{ch}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
