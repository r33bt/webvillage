import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Database, MapPin, ShieldCheck } from 'lucide-react'
import { getProviderStats } from '@webvillage/engine/adapters/findtraining'

export const metadata: Metadata = {
  title: 'About FindTraining — Malaysia\'s HRDF Training Directory',
  description:
    'FindTraining.com is Malaysia\'s most complete directory of HRDF-registered training providers — built to make finding and comparing accredited trainers fast and simple.',
  alternates: { canonical: 'https://findtraining.com/about' },
}

export default async function AboutPage() {
  const stats = await getProviderStats()

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">About</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">About FindTraining</h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Malaysia&apos;s most complete directory of HRDF-registered training providers — built
            to make finding and comparing accredited trainers fast and simple.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What we do</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            FindTraining.com is a directory for HR managers, L&amp;D teams, and employers across
            Malaysia. We index every training provider registered with HRD Corp — the national
            body that administers the Human Resources Development (HRD) levy — and surface them
            in a searchable, filterable format that the official eTRiS portal does not offer.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Every listing is cross-referenced against HRD Corp&apos;s public registry. When you
            find a provider on FindTraining, you can be confident they are legitimate and
            registered for HRDF levy claims.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-[#0F6FEC]" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}+</span>
            </div>
            <p className="text-sm text-gray-500">HRDF-registered providers</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-[#0F6FEC]" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900">13</span>
            </div>
            <p className="text-sm text-gray-500">training categories</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#0F6FEC]" aria-hidden="true" />
              <span className="text-2xl font-bold text-gray-900">16</span>
            </div>
            <p className="text-sm text-gray-500">states &amp; territories covered</p>
          </div>
        </section>

        {/* For providers */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">For training providers</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Your company is already listed if you are registered with HRD Corp. Claim your
            profile to update your description, add contact details, and gain priority placement
            in search results.
          </p>
          <Link
            href="/founding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#00C48C' }}
          >
            Claim your listing
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>

        {/* Data & accuracy */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Data &amp; accuracy</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            Provider data is sourced from HRD Corp&apos;s public registry and supplemented with
            publicly available information. We make reasonable efforts to keep listings accurate,
            but details may change between updates.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If your company information is incorrect, or you wish to be removed from the
            directory, email{' '}
            <a
              href="mailto:hello@findtraining.com"
              className="text-[#0F6FEC] hover:underline"
            >
              hello@findtraining.com
            </a>{' '}
            and we will action it within 5 working days.
          </p>
        </section>

        {/* Contact CTA */}
        <section className="rounded-xl bg-blue-50 border border-blue-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Get in touch</h2>
          <p className="text-gray-600 text-sm mb-3">
            Questions, partnerships, data corrections, or provider opt-outs — we respond within
            2 business days.
          </p>
          <a
            href="mailto:hello@findtraining.com"
            className="text-[#0F6FEC] font-medium text-sm hover:underline"
          >
            hello@findtraining.com
          </a>
        </section>
      </div>
    </div>
  )
}
