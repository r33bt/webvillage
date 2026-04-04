// app/dashboard/analytics/page.tsx
// Provider Analytics — profile views and contact activity for a claimed provider.
// Server Component. Auth guard duplicated here (layout also guards).

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarChart2, AlertCircle, TrendingUp, CreditCard, Activity } from 'lucide-react'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getProviderAnalytics } from '@webvillage/engine/adapters/findtraining'
import type { ContactClick } from '@webvillage/engine/adapters/findtraining'

export const metadata: Metadata = {
  title: 'Analytics | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatClickType(type: string): string {
  const map: Record<string, string> = {
    email: 'Email',
    phone: 'Phone',
    website: 'Website',
    whatsapp: 'WhatsApp',
    contact_view: 'Contact page',
  }
  return map[type] ?? type
}

function truncate(str: string | null | undefined, max: number): string {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: string | number
  note?: string
}

function StatCard({ label, value, note }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-0.5">{value}</p>
      {note && <p className="text-xs text-gray-400">{note}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardAnalyticsPage() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch the provider claimed by this user
  const { data: provider, error: providerError } = await supabase
    .from('ft_providers')
    .select('id, name, slug, tier, subscription_status')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/analytics] provider fetch error:', providerError.message)
  }

  // Fetch analytics if provider exists
  let analytics: Awaited<ReturnType<typeof getProviderAnalytics>> | null = null

  if (provider) {
    try {
      analytics = await getProviderAnalytics(supabase, provider.id)
    } catch (err) {
      console.error('[dashboard/analytics] fetch error:', err)
    }
  }

  // Determine if on free tier (show upgrade prompt)
  const tier = (provider as { tier?: string } | null)?.tier
  const subscriptionStatus = (provider as { subscription_status?: string } | null)?.subscription_status
  const isFreeTier = !provider || !subscriptionStatus || subscriptionStatus === 'free' || tier === 'free'

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Analytics</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-3 mb-8">
          <div
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: '#0F6FEC1A' }}
          >
            <BarChart2 className="w-6 h-6" style={{ color: '#0F6FEC' }} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {provider
                ? `Profile views and contact activity for ${provider.name}`
                : 'Track your profile views and visitor activity'}
            </p>
          </div>
        </div>

        {/* No provider claimed */}
        {!provider && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-amber-900 mb-1">
                  No profile claimed yet
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  {"You haven't claimed a provider profile. Once you claim a listing, analytics will appear here."}
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0F6FEC' }}
                >
                  Browse providers
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Analytics content */}
        {provider && analytics && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total profile views"
                value={analytics.totalViews}
                note="All-time contact clicks"
              />
              <StatCard
                label="Views this month"
                value={analytics.monthViews}
                note="Current calendar month"
              />
              <StatCard
                label="Views this week"
                value={analytics.weekViews}
                note="Last 7 days"
              />
              <StatCard
                label="Top click type"
                value={analytics.topClickType ? formatClickType(analytics.topClickType) : '—'}
                note="Most common action"
              />
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              {/* Section header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
                {analytics.totalViews > 0 && (
                  <span className="ml-auto text-xs text-gray-400">
                    Showing last {analytics.recentClicks.length} of {analytics.totalViews} total
                  </span>
                )}
              </div>

              {/* Empty state */}
              {analytics.recentClicks.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-500 mb-1">No activity yet</p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Your profile views will appear here once visitors start finding you.
                  </p>
                </div>
              )}

              {/* Table */}
              {analytics.recentClicks.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Time (MY)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Click type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Visitor page
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {analytics.recentClicks.map((click) => (
                        <tr key={click.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3.5 text-gray-900 whitespace-nowrap">
                            {formatDate(click.clicked_at)}
                          </td>
                          <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                            {formatTime(click.clicked_at)}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {formatClickType(click.click_type)}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-400 text-xs max-w-xs">
                            {click.visitor_page ? (
                              <span
                                title={click.visitor_page}
                                className="font-mono truncate block max-w-[200px]"
                              >
                                {truncate(
                                  click.visitor_page.replace(/^https?:\/\/[^/]+/, '') || '/',
                                  40
                                )}
                              </span>
                            ) : (
                              <span className="italic">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Upgrade prompt for free / no-subscription tier */}
        {provider && isFreeTier && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <TrendingUp
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Unlock detailed analytics and featured placement
                </p>
                <p className="text-sm text-blue-700 mt-0.5 leading-relaxed">
                  Upgrade to Starter (RM&nbsp;300/mo) to see deeper visitor insights and get
                  priority placement in search results.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0F6FEC' }}
            >
              <CreditCard className="w-4 h-4" aria-hidden="true" />
              Upgrade
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
