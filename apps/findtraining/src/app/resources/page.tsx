import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, BookOpen } from 'lucide-react'
import { articles } from '@/lib/resources'

export const metadata: Metadata = {
  title: 'Resources — HRDF & HRD Corp Training Guides',
  description:
    'Guides, calculators, and insights for HR managers and training buyers in Malaysia. Everything you need to know about HRDF levy, HRD Corp, and finding the right training providers.',
  alternates: { canonical: 'https://findtraining.com/resources' },
  openGraph: {
    title: 'Resources — HRDF & HRD Corp Training Guides',
    description:
      'Guides and insights for HR managers and training buyers in Malaysia.',
    type: 'website',
  },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const categoryColours: Record<string, string> = {
  'HR Compliance': 'bg-purple-100 text-purple-700',
  'Training Guide': 'bg-blue-100 text-blue-700',
}

function categoryClass(cat: string): string {
  return categoryColours[cat] ?? 'bg-gray-100 text-gray-700'
}

export default function ResourcesPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'HRDF & HRD Corp Training Guides',
    url: 'https://findtraining.com/resources',
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://findtraining.com/resources/${article.slug}`,
      name: article.title,
    })),
  }

  return (
    <div className="py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Resources</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">HRDF &amp; Training Resources</h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Guides, calculators, and insights for HR managers and training buyers in Malaysia.
            Everything you need to navigate the HRD Corp levy and find the right training providers.
          </p>
        </div>

        {/* Article cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="group block rounded-xl border border-gray-100 bg-white p-5 hover:border-blue-200 hover:shadow-md transition-all"
            >
              {/* Category badge */}
              <span
                className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 ${categoryClass(article.category)}`}
              >
                {article.category}
              </span>

              {/* Title */}
              <h2 className="text-base font-semibold text-gray-900 leading-snug mb-2 group-hover:text-[#0F6FEC] transition-colors">
                {article.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                {article.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{article.readingTimeMinutes} min read</span>
                </div>
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
              </div>

              {/* Read link */}
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#0F6FEC]">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>Read article</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Ready to find HRDF-registered training providers?
            </h2>
            <p className="text-sm text-gray-600">
              Browse Malaysia&apos;s most complete directory of HRD Corp-approved training companies.
            </p>
          </div>
          <Link
            href="/providers"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: '#0F6FEC' }}
          >
            Browse providers
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}
