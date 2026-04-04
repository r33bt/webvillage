import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | FindTraining Malaysia',
  description: 'How FindTraining.com.my collects, uses, and protects data. Compliant with PDPA Malaysia 2010.',
  alternates: { canonical: 'https://findtraining.com.my/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Privacy Policy</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-500"><strong>Effective date:</strong> April 2026 &middot; <strong>Last updated:</strong> April 2026</p>
        </div>

        <div className="prose prose-gray prose-sm sm:prose-base max-w-none">
          <h2>1. Who We Are</h2>
          <p>FindTraining.com.my is a directory of HRDF-registered training providers in Malaysia. Our purpose is to make it easier for employers and individuals to find, compare, and contact accredited training providers.</p>

          <h2>2. Data We Hold</h2>
          <h3>2.1 Training Provider Listings</h3>
          <p>We maintain a database of HRDF-registered training providers sourced from HRD Corp&apos;s public registry. For each provider we hold: company name, state, contact details (where publicly available), HRDF registration number, and training categories. This data is held under legitimate interest (public registry information) and the right to list public business information.</p>

          <h3>2.2 Claim Submissions</h3>
          <p>When a provider representative submits a claim form, we collect: name, business email, phone (optional). This data is used solely for verification and is not shared with third parties.</p>

          <h3>2.3 Founding Member Applications</h3>
          <p>Applications submitted via the founding member form are stored securely and used only to process your application.</p>

          <h3>2.4 Analytics</h3>
          <p>We collect anonymised usage data (page views, search queries) to improve the directory. No personally identifiable information is included in analytics.</p>

          <h2>3. Your Rights (PDPA 2010)</h2>
          <p>Under Malaysia&apos;s Personal Data Protection Act 2010, you have the right to: access your data, correct inaccurate data, withdraw consent, and request removal of your listing.</p>
          <p>To exercise these rights, email <a href="mailto:hello@findtraining.com.my">hello@findtraining.com.my</a>. We will respond within 14 working days.</p>

          <h2>4. Opt-Out for Providers</h2>
          <p>Any provider wishing to be removed from our directory may email <a href="mailto:hello@findtraining.com.my">hello@findtraining.com.my</a> with &quot;Opt-Out Request&quot; in the subject line. We will remove the listing within 5 working days.</p>

          <h2>5. Cookies</h2>
          <p>We use only functional cookies required for site operation. No advertising or tracking cookies are set.</p>

          <h2>6. Contact</h2>
          <p>Data queries: <a href="mailto:hello@findtraining.com.my">hello@findtraining.com.my</a></p>
        </div>
      </div>
    </div>
  )
}
