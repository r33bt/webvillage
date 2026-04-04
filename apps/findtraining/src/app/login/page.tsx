import Link from 'next/link'
import { GraduationCap, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { sendMagicLink } from './actions'

export const metadata: Metadata = {
  title: 'Log In | FindTraining',
  description: 'Log in to your FindTraining provider dashboard.',
  robots: { index: false },
}

interface PageProps {
  searchParams: Promise<{ sent?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const sent = params.sent === '1'
  const error = params.error

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <GraduationCap className="w-8 h-8" style={{ color: '#0F6FEC' }} aria-hidden="true" />
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#0F6FEC' }}>
            FindTraining
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {sent ? (
            /* ── Success state ─────────────────────────────────── */
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{ backgroundColor: '#00C48C1A' }}
              >
                <CheckCircle className="w-7 h-7" style={{ color: '#00C48C' }} aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                We sent a magic link to your inbox. Click the link to log in — no password needed.
              </p>
              <p className="text-xs text-gray-400">
                Didn't get it?{' '}
                <Link href="/login" className="underline" style={{ color: '#0F6FEC' }}>
                  Try again
                </Link>
              </p>
            </div>
          ) : (
            /* ── Login form ────────────────────────────────────── */
            <>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Provider login</h1>
                <p className="text-sm text-gray-500">
                  Enter your email to receive a secure magic link.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3 mb-5">
                  <AlertCircle
                    className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-red-700">
                    {error === 'invalid-email'
                      ? 'Please enter a valid email address.'
                      : 'Something went wrong. Please try again.'}
                  </p>
                </div>
              )}

              <form action={sendMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@yourcompany.com"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                      style={{ '--tw-ring-color': '#0F6FEC' } as React.CSSProperties}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: '#0F6FEC', outlineColor: '#0F6FEC' }}
                >
                  Send magic link
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-5">
                Not a registered provider?{' '}
                <Link href="/founding" className="underline" style={{ color: '#0F6FEC' }}>
                  List your company
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>{' '}
          ·{' '}
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
        </p>
      </div>
    </div>
  )
}
