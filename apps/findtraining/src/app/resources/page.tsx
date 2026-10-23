import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, BookOpen } from 'lucide-react'
import { articles } from '@/lib/resources'
import { GuideCover } from '@/components/resources/GuideCover'

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
    <div className="py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="ft-container">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700 transition-colors">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Resources</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="ft-blocks font-display text-4xl font-bold tracking-tight text-brand-ink sm:text-5xl">HRDF &amp; Training Resources</h1>
          <p className="mt-5 max-w-3xl text-lg text-gray-700 leading-relaxed">
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
              className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-brand-blue hover:shadow-md transition-all"
            >
              <GuideCover slug={article.slug} category={article.category} />
              <div className="flex flex-1 flex-col p-5">

              {/* Title */}
              <h2 className="font-display text-xl font-bold text-brand-ink leading-snug mb-2 group-hover:text-brand-blue transition-colors">
                {article.title}
              </h2>

              {/* Description */}
              <p className="text-base text-gray-700 leading-relaxed mb-4 line-clamp-3">
                {article.description}
              </p>

              {/* Meta row */}
              <div className="mt-auto flex items-center justify-between text-sm text-gray-600">
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
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Ready to find training providers?
            </h2>
            <p className="text-sm text-gray-600">
              Browse training companies in Malaysia by category and state.
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
