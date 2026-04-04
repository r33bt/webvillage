import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | FindTraining Malaysia',
  description: "Terms of Service for FindTraining.com — Malaysia's HRDF training provider directory.",
  alternates: { canonical: 'https://findtraining.com/terms' },
}

export default function TermsPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Terms of Service</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-500"><strong>Effective date:</strong> April 2026 &middot; <strong>Last updated:</strong> April 2026</p>
        </div>

        <div className="prose prose-gray prose-sm sm:prose-base max-w-none">
          <h2>1. Acceptance</h2>
          <p>By accessing FindTraining.com you agree to these terms. If you do not agree, do not use the site.</p>

          <h2>2. Directory Listings</h2>
          <p>Listings on FindTraining.com are sourced from HRD Corp&apos;s public registry. We make reasonable efforts to keep information accurate but do not guarantee completeness. Providers may request correction or removal at any time.</p>

          <h2>3. Claiming a Listing</h2>
          <p>By submitting a claim, you confirm you are authorised to represent the listed organisation. Fraudulent claims will result in immediate removal and may be reported to relevant authorities.</p>

          <h2>4. Founding Member Programme</h2>
          <p>Founding member subscriptions are at RM 100/mo for the first 3 months, transitioning to Starter tier pricing thereafter. Full refund within 7 days of first payment. Slots are limited and allocated at our discretion.</p>

          <h2>5. Acceptable Use</h2>
          <p>You may not: scrape the directory without permission, submit false claims, use the site to distribute spam, or circumvent any security measures.</p>

          <h2>6. Intellectual Property</h2>
          <p>The FindTraining brand, design, and software are owned by the operator. Provider names, logos, and descriptions remain the property of the respective providers.</p>

          <h2>7. Limitation of Liability</h2>
          <p>FindTraining.com is provided &quot;as is&quot;. We are not liable for any direct or indirect damages arising from use of the directory, including inaccurate provider information.</p>

          <h2>8. Governing Law</h2>
          <p>These terms are governed by the laws of Malaysia. Disputes shall be subject to the jurisdiction of Malaysian courts.</p>

          <h2>9. Contact</h2>
          <p>Terms queries: <a href="mailto:hello@findtraining.com">hello@findtraining.com</a></p>
        </div>
      </div>
    </div>
  )
}
