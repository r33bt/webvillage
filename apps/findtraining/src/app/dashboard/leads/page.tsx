// app/dashboard/leads/page.tsx
// Server Component — Contact-click leads view for claimed providers.
// Shows every time a visitor viewed this provider's contact details.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Inbox, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getContactClicksByProvider } from '@webvillage/engine/adapters/findtraining'

export const metadata: Metadata = {
  title: 'Leads | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

const PAGE_SIZE = 20

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

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function DashboardLeadsPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient()

  // Auth guard
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
    .select('id, name, profile_status')
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/leads] provider fetch error:', providerError.message)
  }

  // Parse page param
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)

  // Fetch leads if provider exists
  let clicks: Awaited<ReturnType<typeof getContactClicksByProvider>>['clicks'] = []
  let total = 0

  if (provider) {
    try {
      const result = await getContactClicksByProvider(supabase, provider.id, {
        page,
        pageSize: PAGE_SIZE,
      })
      clicks = result.clicks
      total = result.total
    } catch (err) {
      console.error('[dashboard/leads] fetch error:', err)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Leads</span>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-3 mb-8">
          <div
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: '#0F6FEC1A' }}
          >
            <Inbox className="w-6 h-6" style={{ color: '#0F6FEC' }} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Contact Views</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {provider
                ? `Visitors who viewed contact details for ${provider.name}`
                : 'Track who has viewed your contact details'}
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
                  {`You haven't claimed a profile yet. Once you claim a listing, contact views will appear here.`}
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

        {/* Leads table */}
        {provider && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Stats bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {total === 0
                  ? 'No contact views yet'
                  : `${total} contact view${total === 1 ? '' : 's'} total`}
              </p>
              {total > 0 && (
                <p className="text-xs text-gray-400">
                  Page {page} of {totalPages}
                </p>
              )}
            </div>

            {/* Empty state */}
            {total === 0 && (
              <div className="px-6 py-16 text-center">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-500 mb-1">No contact views yet</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Once visitors view your contact details on FindTraining.com, they will appear here.
                </p>
              </div>
            )}

            {/* Table */}
            {total > 0 && (
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
                        Contact type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Page
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {clicks.map((click) => (
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
                        <td className="px-6 py-3.5 text-gray-400 text-xs max-w-xs truncate">
                          {click.visitor_page ? (
                            <span title={click.visitor_page} className="font-mono">
                              {click.visitor_page.replace(/^https?:\/\/[^/]+/, '') || '/'}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={hasPrev ? `/dashboard/leads?page=${page - 1}` : '#'}
                  aria-disabled={!hasPrev}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    hasPrev
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 pointer-events-none',
                  ].join(' ')}
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Previous
                </Link>

                <span className="text-xs text-gray-400">
                  {page} / {totalPages}
                </span>

                <Link
                  href={hasNext ? `/dashboard/leads?page=${page + 1}` : '#'}
                  aria-disabled={!hasNext}
                  className={[
                    'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    hasNext
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 pointer-events-none',
                  ].join(' ')}
                >
                  Next
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
