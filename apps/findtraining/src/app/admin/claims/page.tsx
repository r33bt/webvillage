// src/app/admin/claims/page.tsx
// Admin: Review and action provider claim requests.
// Protected by ADMIN_TOKEN env var — returns 404 if token not set or not matching.
// NOT publicly linked — internal tool for Patrick only.

import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { Inbox } from 'lucide-react'
import ClaimActions from './ClaimActions'

export const metadata: Metadata = {
  title: 'Claims | FindTraining Admin',
  robots: { index: false, follow: false },
}

// Disable caching so the page always reflects current DB state
export const dynamic = 'force-dynamic'

interface ClaimRow {
  id: string
  provider_id: string
  email: string
  status: string
  verification_method: string | null
  notes: string | null
  created_at: string
  provider_name: string | null
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Parse claimant name and phone from the notes field (set by /api/claim) */
function parseNotes(notes: string | null): { name: string | null; phone: string | null } {
  if (!notes) return { name: null, phone: null }
  const nameMatch = notes.match(/^Claimant name:\s*(.+)/m)
  const phoneMatch = notes.match(/^Claimant phone:\s*(.+)/m)
  return {
    name: nameMatch?.[1]?.trim() ?? null,
    phone: phoneMatch?.[1]?.trim() ?? null,
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    approved: 'bg-green-50 text-green-800 border border-green-200',
    rejected: 'bg-gray-100 text-gray-500 border border-gray-200',
  }
  const style = styles[status] ?? styles['rejected']
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${style}`}
    >
      {status}
    </span>
  )
}

export default async function AdminClaimsPage() {
  // ── Admin token guard ────────────────────────────────────────────────────────
  const adminToken = process.env.ADMIN_TOKEN
  if (!adminToken) {
    // ADMIN_TOKEN env var not set — fail safe
    redirect('/')
  }

  // ── Fetch all claims via service role ────────────────────────────────────────
  const supabase = getServiceClient()

  let claims: ClaimRow[] = []
  let fetchError: string | null = null

  try {
    const { data, error } = await supabase
      .from('ft_claims')
      .select(`
        id,
        provider_id,
        email,
        status,
        verification_method,
        notes,
        created_at,
        ft_providers ( name )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      fetchError = error.message
    } else {
      claims = (data ?? []).map((row: Record<string, unknown>) => {
        const providerRow = row.ft_providers as { name: string } | null
        return {
          id: row.id as string,
          provider_id: row.provider_id as string,
          email: row.email as string,
          status: row.status as string,
          verification_method: row.verification_method as string | null,
          notes: row.notes as string | null,
          created_at: row.created_at as string,
          provider_name: providerRow?.name ?? null,
        }
      })
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'Unknown error'
  }

  const pendingCount = claims.filter((c) => c.status === 'pending').length

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start gap-3 mb-8">
        <div
          className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: '#0F6FEC1A' }}
        >
          <Inbox className="w-6 h-6" style={{ color: '#0F6FEC' }} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Provider Claims</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and approve or reject incoming claim requests
          </p>
        </div>
        {pendingCount > 0 && (
          <span
            className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: '#0F6FEC' }}
          >
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 mb-6">
          <p className="text-sm font-semibold text-red-800 mb-1">Failed to load claims</p>
          <p className="text-xs text-red-700 font-mono">{fetchError}</p>
          <p className="text-xs text-red-600 mt-2">
            This may mean the ft_claims table does not exist yet. Submit a claim via the public
            /claim page first to trigger table creation, or check Supabase migrations.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!fetchError && claims.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-16 text-center">
          <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-gray-500 mb-1">No claims yet</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            When providers submit a claim via the /claim page, they will appear here for review.
          </p>
        </div>
      )}

      {/* Claims table */}
      {!fetchError && claims.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Stats bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {claims.length} claim{claims.length === 1 ? '' : 's'} total
            </p>
            <p className="text-xs text-gray-400">
              {pendingCount} pending · {claims.filter((c) => c.status === 'approved').length} approved ·{' '}
              {claims.filter((c) => c.status === 'rejected').length} rejected
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Provider
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Claimant
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Phone
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {claims.map((claim) => {
                  const { name, phone } = parseNotes(claim.notes)
                  return (
                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors align-middle">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-900">
                          {claim.provider_name ?? (
                            <span className="text-gray-400 italic text-xs">
                              {claim.provider_id.slice(0, 8)}…
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {name ?? <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs font-mono">
                        {claim.email}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        {phone ?? <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(claim.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <ClaimActions
                          claimId={claim.id}
                          currentStatus={claim.status}
                          adminToken={adminToken}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
