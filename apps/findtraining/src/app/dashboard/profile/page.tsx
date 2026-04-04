// app/dashboard/profile/page.tsx
// Server Component — Provider profile editor.
// Only reachable by authenticated users who have claimed a listing.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, AlertCircle } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProfileForm } from './ProfileForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit Profile | FindTraining Dashboard',
  robots: { index: false, follow: false },
}

export default async function DashboardProfilePage() {
  const supabase = await createSupabaseServerClient()

  // Auth guard — redirect to /login if not signed in
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch provider claimed by this user
  const { data: provider, error: providerError } = await supabase
    .from('ft_providers')
    .select(
      'id, name, description, logo_url, website, email, phone, address, state, delivery_methods, profile_status, slug'
    )
    .eq('claimed_by', user.id)
    .maybeSingle()

  if (providerError) {
    console.error('[dashboard/profile] provider fetch error:', providerError.message)
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <nav
          className="text-xs text-gray-500 mb-8 flex items-center gap-1.5"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-gray-700">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Dashboard</span>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Profile</span>
        </nav>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 mb-8">
          <div
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: '#0F6FEC1A' }}
          >
            <GraduationCap
              className="w-6 h-6"
              style={{ color: '#0F6FEC' }}
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {provider
                ? `Managing listing for ${provider.name}`
                : 'Manage your training provider listing'}
            </p>
          </div>
        </div>

        {/* ── No claimed provider ─────────────────────────────────── */}
        {!provider && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-base font-semibold text-amber-900 mb-1">
                  No profile claimed yet
                </h2>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  {`You haven't claimed a profile yet. Browse providers to find yours, then click "Is this your company?" to submit a claim.`}
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

        {/* ── Profile form ─────────────────────────────────────────── */}
        {provider && (
          <>
            {/* Public listing link */}
            <div className="mb-6 text-sm text-gray-500">
              <span>Public listing: </span>
              <Link
                href={`/providers/${provider.slug}`}
                className="font-medium hover:underline"
                style={{ color: '#0F6FEC' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                /providers/{provider.slug}
              </Link>
              {provider.profile_status === 'claimed' && (
                <span className="ml-2 inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full border border-green-200">
                  Verified
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <h2 className="text-base font-semibold text-gray-900 mb-6">
                Provider Information
              </h2>
              <ProfileForm provider={provider} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
