'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ClientRow } from '../lib/supabase'

const TIER_LABELS: Record<string, string> = {
  free_trial: 'Trial',
  tool_starter: 'Starter',
  tool_pro: 'Pro',
  editorial_brand: 'Brand',
  editorial_enterprise: 'Enterprise',
}

export default function NavClient({
  tenant,
  allTenants,
  slug,
}: {
  tenant: ClientRow & { current_tier: string }
  allTenants: (ClientRow & { current_tier: string })[]
  slug: string
}) {
  const [open, setOpen] = useState(false)
  const tierLabel = TIER_LABELS[tenant.current_tier] ?? tenant.current_tier

  return (
    <nav className="border-b border-zinc-900 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-50 shrink-0">
          BrandHacker
        </Link>

        {/* Tenant switcher */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 hover:border-zinc-700 hover:text-zinc-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
          >
            <span className="font-medium truncate max-w-[140px]">{tenant.display_name}</span>
            <span className="shrink-0 rounded-full bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400 uppercase tracking-widest">
              {tierLabel}
            </span>
            <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 w-56 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                <div className="p-1">
                  {allTenants.map((t) => (
                    <form key={t.id} action="/api/tenant/switch" method="POST">
                      <input type="hidden" name="tenant_id" value={t.id} />
                      <button
                        type="submit"
                        className={`w-full text-left flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          t.id === tenant.id
                            ? 'bg-zinc-800 text-zinc-50'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50'
                        }`}
                      >
                        <span className="flex-1 truncate">{t.display_name}</span>
                        {t.id === tenant.id && (
                          <svg className="h-3.5 w-3.5 shrink-0 text-zinc-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </form>
                  ))}
                </div>
                <div className="border-t border-zinc-900 p-1">
                  <Link
                    href="/app/switch"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
                  >
                    Manage brands →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/app" className="hover:text-zinc-200 transition-colors">
            Dashboard
          </Link>
          <Link href={`/app/drafts`} className="hover:text-zinc-200 transition-colors">
            Drafts
          </Link>
          <Link href={`/app/calendar/${slug}`} className="hover:text-zinc-200 transition-colors">
            Calendar
          </Link>
          <Link href={`/app/strategy/${slug}`} className="hover:text-zinc-200 transition-colors">
            Strategy
          </Link>
        </div>
      </div>

      {/* Sign out */}
      <form action="/auth/signout" method="POST">
        <button
          type="submit"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 rounded"
        >
          Sign out
        </button>
      </form>
    </nav>
  )
}
