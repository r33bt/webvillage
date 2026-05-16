import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Payment Received — FindTraining',
  robots: { index: false },
}

export default function FoundingPaymentCompletePage() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
          style={{ backgroundColor: '#00C48C1A' }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: '#00C48C' }} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You&apos;re a founding member.
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          Payment received. We&apos;ll set up your provider dashboard and send you a login link within 24 hours.
        </p>
        <div className="bg-blue-50 rounded-xl border border-blue-100 px-5 py-4 mb-6 text-left">
          <p className="text-xs font-semibold text-blue-700 mb-1">What happens next</p>
          <ol className="text-xs text-blue-800 space-y-1 leading-relaxed list-decimal list-inside">
            <li>We claim your existing profile and link it to your account</li>
            <li>You receive a magic link to log in and edit your listing</li>
            <li>Add your logo, description, HRDF number, and courses</li>
            <li>Your Founding Member badge goes live</li>
          </ol>
        </div>
        <Link
          href="/"
          className="inline-block text-sm font-medium text-blue-700 hover:underline"
        >
          Go to FindTraining →
        </Link>
      </div>
    </section>
  )
}
