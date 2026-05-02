'use client'

import { useState } from 'react'
import type { ContentPillar, ContentPillarsMetadata, TopicStub } from '@/api/be/strategy/generate/route'

const CHANNEL_DOT: Record<string, string> = {
  linkedin:  'bg-blue-400',
  instagram: 'bg-pink-400',
  x:         'bg-zinc-400',
  tiktok:    'bg-violet-400',
  facebook:  'bg-indigo-400',
  email:     'bg-amber-400',
  blog:      'bg-emerald-400',
}

const PIECE_LABEL: Record<string, string> = {
  post: 'Post',
  long_form_article: 'Article',
  newsletter: 'Newsletter',
}

function PillarCard({ pillar, topics }: { pillar: ContentPillar; topics: TopicStub[] }) {
  const pillarTopics = topics.filter((t) => t.pillar_id === pillar.id)
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-50">{pillar.name}</h3>
          <span className="text-xs text-zinc-500">{pillar.monthly_posts}/mo</span>
        </div>
        <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{pillar.description}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {pillar.channels.map((ch) => (
          <span key={ch} className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 rounded px-2 py-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${CHANNEL_DOT[ch] ?? 'bg-zinc-400'}`} />
            {ch}
          </span>
        ))}
      </div>
      {pillarTopics.length > 0 && (
        <ul className="space-y-1.5 pt-1 border-t border-zinc-800">
          {pillarTopics.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full ${CHANNEL_DOT[t.channel] ?? 'bg-zinc-400'}`} />
              <span className="text-zinc-300 leading-snug flex-1">{t.title}</span>
              <span className="shrink-0 text-xs text-zinc-500 uppercase tracking-wide mt-0.5">
                W{t.scheduled_week} · {PIECE_LABEL[t.piece_type] ?? t.piece_type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type GenerateResult = {
  pillars: ContentPillar[]
  topics: TopicStub[]
  slots_seeded: number
  calendar_id: string
  target_month: string
}

type Props = {
  slug: string
  clientId: string
  existing: ContentPillarsMetadata | null
}

export function StrategyClient({ slug, clientId, existing }: Props) {
  const [strategy, setStrategy] = useState<GenerateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayed = strategy
    ? { pillars: strategy.pillars, topics: strategy.topics, generated_at: new Date().toISOString(), target_month: strategy.target_month }
    : existing

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/be/strategy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError((body as { error?: string }).error ?? 'Generation failed')
        return
      }
      setStrategy(body as GenerateResult)
    } catch {
      setError('Network error — check connection and retry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-zinc-950 animate-spin" />
              Generating…
            </>
          ) : (
            'Generate pillars & seed calendar'
          )}
        </button>
        <a
          href={`/app/calendar/${slug}`}
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          View calendar →
        </a>
        {displayed && (
          <span className="text-xs text-zinc-600 ml-auto">
            Generated {new Date(displayed.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 ml-4">✕</button>
        </div>
      )}

      {/* Result banner after generation */}
      {strategy && (
        <div className="rounded-md bg-emerald-950/60 border border-emerald-800/60 px-4 py-3 text-sm text-emerald-300">
          {strategy.slots_seeded} topic{strategy.slots_seeded !== 1 ? 's' : ''} added to calendar for {strategy.target_month}.{' '}
          <a href={`/app/calendar/${slug}`} className="underline hover:text-emerald-200">
            View calendar
          </a>
        </div>
      )}

      {/* Pillars + topics */}
      {displayed ? (
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-sm font-medium text-zinc-300 uppercase tracking-widest">
              Content pillars
            </h2>
            <span className="text-xs text-zinc-600">{displayed.pillars.length} pillars · {displayed.topics.length} topics</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.pillars.map((p) => (
              <PillarCard key={p.id} pillar={p} topics={displayed.topics} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-zinc-400 text-sm">No strategy generated yet.</p>
          <p className="text-zinc-600 text-xs mt-1">Click the button above to generate pillars and seed your calendar.</p>
        </div>
      )}
    </div>
  )
}
