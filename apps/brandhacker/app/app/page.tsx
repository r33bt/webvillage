import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getAuthClient } from '@/lib/supabase-server'
import { getServiceRoleClient } from '@/lib/supabase'
import { computeHealthScore, getPrevWeekKey, type StoredWeekScore } from '@/lib/health-score'

export const dynamic = 'force-dynamic'

function TierBadge({ tier }: { tier: string }) {
  const labels: Record<string, string> = {
    free: 'Free',
    free_trial: 'Trial',
    tool_starter: 'Starter',
    tool_pro: 'Pro',
    editorial_brand: 'Brand',
  }
  return (
    <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
      {labels[tier] ?? tier}
    </span>
  )
}

export default async function AppDashboard() {
  const supabase = await getAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const currentTenantId = cookieStore.get('bh_current_tenant_id')?.value

  if (!currentTenantId) redirect('/login')

  const sb = getServiceRoleClient()

  const [clientRes, draftsRes, crawlRes, calendarRes, artefactsRes, scoresRes] = await Promise.all([
    sb
      .from('wv_be_clients')
      .select('id, display_name, current_tier, trial_ends_at, metadata')
      .eq('id', currentTenantId)
      .is('deleted_at', null)
      .single(),
    sb
      .from('wv_be_drafts')
      .select('id, title, status, created_at')
      .eq('client_id', currentTenantId)
      .order('created_at', { ascending: false })
      .limit(5),
    sb
      .from('wv_be_aeo_crawl_log')
      .select('user_agent')
      .eq('client_id', currentTenantId)
      .gte('occurred_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100),
    sb
      .from('wv_be_calendar_slots')
      .select('id, channel, scheduled_for, topic_brief, status')
      .eq('client_id', currentTenantId)
      .gte('scheduled_for', new Date().toISOString())
      .in('status', ['briefed', 'draft_ready', 'approved'])
      .order('scheduled_for', { ascending: true })
      .limit(3),
    sb
      .from('wv_be_aeo_artefacts')
      .select('artefact_type, generated_at, hosting_mode')
      .eq('client_id', currentTenantId),
    sb
      .from('wv_be_scores')
      .select('scores, scored_at')
      .eq('client_id', currentTenantId)
      .order('scored_at', { ascending: false })
      .limit(10),
  ])

  const client = clientRes.data
  if (!client) redirect('/login')

  const meta = client.metadata as Record<string, unknown>
  const slug = (meta?.slug as string) ?? ''
  const recentDrafts = draftsRes.data ?? []
  const crawlRows = crawlRes.data ?? []
  const crawlCount = crawlRows.length
  const upcomingSlots = calendarRes.data ?? []
  const aeoArtefacts = artefactsRes.data ?? []
  const aeoArtefact = aeoArtefacts[0] ?? null
  const recentScores = scoresRes.data ?? []

  // --- Brand Health Score v0 ---
  const healthResult = computeHealthScore(aeoArtefacts, recentScores)
  const healthScore = healthResult?.score ?? null
  const aeoCoverage = healthResult?.aeoCoverage ?? 0
  const voiceConsistency = healthResult?.voiceConsistency ?? 0

  // Trend: compare to last week's stored score in metadata
  const storedScores = (meta?.health_scores ?? {}) as Record<string, StoredWeekScore>
  const prevWeekScore = storedScores[getPrevWeekKey()]?.score
  const scoreDelta = healthScore !== null && prevWeekScore !== undefined
    ? healthScore - prevWeekScore
    : null

  const isProTier =
    client.current_tier === 'tool_pro' || client.current_tier === 'editorial_brand'

  // Group crawl events by bot identity (for Pro breakdown)
  function classifyBot(ua: string): string {
    const lower = ua.toLowerCase()
    if (lower.includes('gptbot') || lower.includes('openai')) return 'GPTBot'
    if (lower.includes('claudebot') || lower.includes('anthropic-ai')) return 'ClaudeBot'
    if (lower.includes('perplexitybot')) return 'PerplexityBot'
    if (lower.includes('bingbot') || lower.includes('msnbot')) return 'BingBot'
    if (lower.includes('googlebot')) return 'Googlebot'
    return 'Other'
  }

  const botBreakdown = crawlRows.reduce<Record<string, number>>((acc, row) => {
    const bot = classifyBot((row as { user_agent?: string }).user_agent ?? '')
    acc[bot] = (acc[bot] ?? 0) + 1
    return acc
  }, {})

  const isOnboarding = recentDrafts.length === 0 && !aeoArtefact
  const trialEndsAt = client.trial_ends_at ? new Date(client.trial_ends_at) : null
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Dashboard</p>
          <h1 className="text-2xl font-semibold text-zinc-50">{client.display_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <TierBadge tier={client.current_tier} />
            {daysLeft !== null && (
              <span className="text-xs text-zinc-600">· {daysLeft} days left in trial</span>
            )}
            {client.current_tier === 'free' && (
              <Link href="/waitlist" className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors">· Upgrade</Link>
            )}
          </div>
        </div>
        {slug && (
          <Link href={`/${slug}/llms.txt`} className="text-xs text-zinc-600 hover:text-zinc-400 underline" target="_blank">
            View /llms.txt ↗
          </Link>
        )}
      </div>

      {/* Hero card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        {isOnboarding ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-200">Draft your first post</p>
            <p className="text-sm text-zinc-400">
              Complete onboarding to set up your voice profile — then generate content on-brand.
            </p>
            <Link
              href="/app/onboarding"
              className="inline-flex items-center text-sm font-medium text-zinc-50 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-2 transition-colors"
            >
              Complete onboarding →
            </Link>
          </div>
        ) : !aeoArtefact ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-200">Publish your AEO factsheet</p>
            <p className="text-sm text-zinc-400">
              ChatGPT and Perplexity read this when asked about your brand.
            </p>
            <Link
              href={`/${slug}/llms.txt`}
              target="_blank"
              className="inline-flex items-center text-sm font-medium text-zinc-50 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-4 py-2 transition-colors"
            >
              View AEO surface ↗
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-zinc-200 mb-1">AI crawl activity</p>
            <p className="text-sm text-zinc-400">
              {crawlCount > 0
                ? `Your /llms.txt was fetched ${crawlCount} ${crawlCount === 1 ? 'time' : 'times'} this week.`
                : 'No AI crawler hits yet this week. Check back after robots.txt lifts.'}
            </p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {([
          { label: 'Calendar', href: `/app/calendar/${slug}` },
          { label: 'Strategy', href: `/app/strategy/${slug}` },
          { label: 'AEO surface', href: `/${slug}/llms.txt`, external: true },
        ] as { label: string; href: string; external?: boolean }[]).map(({ label, href, external }) => (
          <Link
            key={href}
            href={href}
            target={external ? '_blank' : undefined}
            className="text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-4 py-2 transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Below-fold cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Brand Health Score */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 md:col-span-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Brand Health Score</p>
          {healthScore === null ? (
            <p className="text-sm text-zinc-500">
              Not enough data yet — set up your AEO surface and run your first draft to see your score.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-semibold text-zinc-50 tabular-nums leading-none">{healthScore}</p>
                  {scoreDelta !== null && (
                    <span className={`text-sm font-medium tabular-nums ${scoreDelta > 0 ? 'text-emerald-400' : scoreDelta < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta === 0 ? '±0' : scoreDelta}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-1">{scoreDelta !== null ? 'vs last week' : 'out of 100'}</p>
              </div>
              <div className="flex flex-col gap-2 pb-0.5 flex-1 min-w-[200px]">
                {([
                  { label: 'AEO coverage', value: aeoCoverage },
                  { label: 'Voice consistency', value: voiceConsistency },
                ] as { label: string; value: number }[]).map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-500 w-32 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 rounded-full transition-all"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-zinc-300 tabular-nums w-8 text-right">{value}</span>
                  </div>
                ))}
              </div>
              {recentScores.length > 0 && (
                <p className="text-xs text-zinc-600 self-end pb-0.5">
                  voice: {recentScores.length} draft{recentScores.length !== 1 ? 's' : ''} scored
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent drafts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Recent drafts</p>
          {recentDrafts.length === 0 ? (
            <p className="text-sm text-zinc-500">No drafts yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentDrafts.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-zinc-300 truncate">{d.title ?? 'Untitled'}</span>
                  <span className="text-xs uppercase tracking-wider text-zinc-600 shrink-0">{d.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Calendar peek */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Up next</p>
          {upcomingSlots.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-zinc-500">No scheduled posts yet.</p>
              <Link href={`/app/strategy/${slug}`} className="text-xs text-zinc-400 underline hover:text-zinc-200">
                Generate strategy →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingSlots.map((slot) => (
                <li key={slot.id} className="flex items-start gap-3">
                  <span className="text-xs text-zinc-600 shrink-0 mt-0.5">
                    {new Date(slot.scheduled_for).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <div>
                    <p className="text-sm text-zinc-300 leading-tight">{slot.topic_brief ?? '(no brief)'}</p>
                    <p className="text-xs uppercase tracking-wider text-zinc-600 mt-0.5">{slot.channel}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Surfaces status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Surfaces</p>
          <ul className="space-y-2">
            {([
              { label: 'AEO /llms.txt', href: slug ? `/${slug}/llms.txt` : null, active: !!slug },
              { label: 'AEO /brand.json', href: slug ? `/${slug}/.well-known/brand.json` : null, active: !!slug },
              { label: 'Social publishing', href: null, active: false, note: 'needs Ayrshare key' },
            ] as { label: string; href: string | null; active: boolean; note?: string }[]).map(({ label, href, active, note }) => (
              <li key={label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                  {href ? (
                    <Link href={href} target="_blank" className="text-sm text-zinc-300 hover:text-zinc-100 transition-colors">{label}</Link>
                  ) : (
                    <span className="text-sm text-zinc-500">{label}</span>
                  )}
                </div>
                {note && <span className="text-xs text-zinc-600">{note}</span>}
              </li>
            ))}
          </ul>
        </div>

        {/* AEO crawl signal */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">AEO signal (7 days)</p>
          {crawlCount === 0 ? (
            <div className="space-y-1">
              <p className="text-sm text-zinc-500">No crawl activity yet.</p>
              <p className="text-xs text-zinc-600">AI crawlers will hit /llms.txt once robots.txt lifts.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold text-zinc-50 mb-0.5">{crawlCount}</p>
                <p className="text-sm text-zinc-400">
                  {crawlCount === 1 ? 'request' : 'requests'} on your /llms.txt this week
                </p>
              </div>
              {/* Source breakdown — Pro only */}
              <div className="relative">
                <ul className={`space-y-1.5 ${isProTier ? '' : 'blur-sm select-none pointer-events-none'}`}>
                  {Object.entries(botBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([bot, count]) => (
                      <li key={bot} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{bot}</span>
                        <span className="text-zinc-300 font-medium tabular-nums">{count}</span>
                      </li>
                    ))}
                </ul>
                {!isProTier && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link
                      href="/waitlist"
                      className="text-xs font-medium text-zinc-950 bg-zinc-50 hover:bg-zinc-200 rounded-md px-3 py-1.5 transition-colors"
                    >
                      Pro — see which crawlers
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}