'use client'

// src/app/admin/claims/ClaimActions.tsx
// Client component — Approve / Reject buttons for each claim row.
// adminToken is passed from the server component (env var) so it never
// appears in the public JS bundle as a literal string.

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Props {
  claimId: string
  currentStatus: string
  adminToken: string
}

export default function ClaimActions({ claimId, currentStatus, adminToken }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState<'approve' | 'reject' | null>(null)

  if (currentStatus !== 'pending') {
    return (
      <span className="text-xs text-gray-400 italic">
        {currentStatus === 'approved' ? 'Approved' : 'Rejected'}
      </span>
    )
  }

  if (done) {
    return (
      <span className="text-xs text-gray-400 italic">
        {done === 'approve' ? 'Approved ✓' : 'Rejected ✓'}
      </span>
    )
  }

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      const res = await fetch('/api/admin/claim-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ claimId, action }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        alert(`Error: ${body.error ?? res.statusText}`)
        setLoading(null)
        return
      }

      setDone(action)
      // Reload page so the table reflects the new status
      window.location.reload()
    } catch (err) {
      alert(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`)
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#00C48C' }}
        title="Approve this claim"
      >
        {loading === 'approve' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5" />
        )}
        Approve
      </button>

      <button
        onClick={() => handleAction('reject')}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 bg-gray-400 hover:bg-gray-500"
        title="Reject this claim"
      >
        {loading === 'reject' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <XCircle className="w-3.5 h-3.5" />
        )}
        Reject
      </button>
    </div>
  )
}
