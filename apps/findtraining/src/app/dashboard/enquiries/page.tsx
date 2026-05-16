// app/dashboard/enquiries/page.tsx
// Server Component — Training enquiries received by this provider.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getEnquiriesByProvider } from '@webvillage/engine/adapters/findtraining'

export const metadata: Metadata = {
  title: 'Enquiries | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

const PAGE_SIZE = 20

const BUDGET_LABEL: Record<string, string> = {
  'Under RM 5,000': '< RM 5k',
  'RM 5,000 – 20,000': 'RM 5–20k',
  'RM 20,000 – 50,000': 'RM 20–50k',
  'RM 50,000+': 'RM 50k+',
  'To be discussed': 'TBD',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function DashboardEnquiriesPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: provider, error: providerError } = await supabase
    .from('ft_providers')
    .select('id, name, tier, profile_status')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/enquiries] provider fetch error:', providerError.message)
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  const PAID_TIERS = new Set(['starter', 'pro', 'founding'])
  const canReceiveEnquiries = provider && PAID_TIERS.has(provider.tier)

  let enquiries: Awaited<ReturnType<typeof getEnquiriesByProvider>>['enquiries'] = []
  let total = 0

  if (canReceiveEnquiries) {
    try {
      const result = await getEnquiriesByProvider(supabase, provider.id, { page, pageSize: PAGE_SIZE })
      enquiries = result.enquiries
      total = result.total
    } catch (err) {
      console.error('[dashboard/enquiries] fetch error:', err)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Enquiries</span>
        </nav>

        <div className="flex items-start gap-3 mb-8">
          <div
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: '#0F6FEC1A' }}
          >
            <MessageSquare className="w-6 h-6" style={{ color: '#0F6FEC' }} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Enquiries</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {provider
                ? `Training enquiries received for ${provider.name}`
                : 'Training enquiries sent directly to your profile'}
            </p>
          </div>
        </div>

        {/* No provider claimed */}
        {!provider && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-amber-900 mb-1">No profile claimed yet</h2>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  Claim your provider listing to start receiving training enquiries from HR managers.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0F6FEC' }}
                >
                  Find your listing
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Free tier upsell */}
        {provider && !canReceiveEnquiries && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-[#0F6FEC] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Upgrade to receive enquiries</h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  HR managers can send training enquiries directly to Starter and Pro providers. Upgrade your plan to enable this feature.
                </p>
                <Link
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0F6FEC' }}
                >
                  View upgrade options
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Enquiries table */}
        {canReceiveEnquiries && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {total === 0
                  ? 'No enquiries yet'
                  : `${total} enquir${total === 1 ? 'y' : 'ies'} received`}
              </p>
              {total > 0 && (
                <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
              )}
            </div>

            {total === 0 && (
              <div className="px-6 py-16 text-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-500 mb-1">No enquiries yet</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  When HR managers submit an enquiry from your profile, it will appear here.
                </p>
              </div>
            )}

            {total > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Enquirer</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Training need</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Headcount</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {enquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-gray-50 transition-colors align-top">
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap text-xs">
                          {formatDate(enq.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900 text-xs">{enq.enquirer_name}</p>
                          {enq.enquirer_company && (
                            <p className="text-gray-400 text-xs">{enq.enquirer_company}</p>
                          )}
                          <a
                            href={`mailto:${enq.enquirer_email}`}
                            className="text-[#0F6FEC] hover:underline text-xs"
                          >
                            {enq.enquirer_email}
                          </a>
                        </td>
                        <td className="px-5 py-4 max-w-[220px]">
                          <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">
                            {enq.training_need}
                          </p>
                          {enq.preferred_dates && (
                            <p className="text-gray-400 text-xs mt-1">Dates: {enq.preferred_dates}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                          {enq.headcount ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                          {enq.budget_range ? (BUDGET_LABEL[enq.budget_range] ?? enq.budget_range) : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={[
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            enq.status === 'new'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-100 text-gray-600',
                          ].join(' ')}>
                            {enq.status === 'new' ? 'New' : enq.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={hasPrev ? `/dashboard/enquiries?page=${page - 1}` : '#'}
                  aria-disabled={!hasPrev}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    hasPrev ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 pointer-events-none',
                  ].join(' ')}
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Previous
                </Link>
                <span className="text-xs text-gray-400">{page} / {totalPages}</span>
                <Link
                  href={hasNext ? `/dashboard/enquiries?page=${page + 1}` : '#'}
                  aria-disabled={!hasNext}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    hasNext ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 pointer-events-none',
                  ].join(' ')}
                >
                  Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
