import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Clock, ChevronRight } from 'lucide-react'
import { articles, getArticleBySlug, getAllSlugs, type Section } from '@/lib/resources'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getArticleBySlug(params.slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `https://findtraining.com/resources/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
    },
  }
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

function renderSection(section: Section, index: number) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          {section.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-2">
          {section.text}
        </h3>
      )
    case 'p':
      return (
        <p key={index} className="text-gray-600 leading-relaxed mb-4">
          {section.text}
        </p>
      )
    case 'ul':
      return (
        <ul key={index} className="list-disc list-inside space-y-1 mb-4 text-gray-600">
          {section.items?.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )
    case 'callout':
      return (
        <div
          key={index}
          className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm text-gray-700 leading-relaxed"
        >
          {section.text}
        </div>
      )
    default:
      return null
  }
}

// Determine the right CTA link per article slug
const ctaLinks: Record<string, { href: string; label: string }> = {
  'what-is-hrd-corp-levy': {
    href: '/providers',
    label: 'Browse HRDF-registered training providers',
  },
  'how-to-find-hrdf-training-provider': {
    href: '/providers',
    label: 'Browse all HRDF-registered training providers',
  },
  'best-it-training-providers-malaysia-2026': {
    href: '/categories/it-training',
    label: 'Find IT training providers in Malaysia',
  },
  'how-to-submit-hrdf-claim-etris': {
    href: '/providers',
    label: 'Find HRDF-registered training providers',
  },
  'hrdf-approved-soft-skills-training-malaysia': {
    href: '/categories/soft-skills',
    label: 'Browse soft skills training providers',
  },
  'sales-training-providers-malaysia': {
    href: '/categories/sales-marketing',
    label: 'Find sales training providers in Malaysia',
  },
  'hrdf-levy-vs-hrd-corp-explained': {
    href: '/providers',
    label: 'Browse all HRD Corp registered providers',
  },
  'training-budget-planning-malaysia': {
    href: '/tools/hrdf-calculator',
    label: 'Calculate your HRDF levy amount',
  },
}

export default function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug)
  if (!article) notFound()

  const cta = ctaLinks[article.slug] ?? { href: '/providers', label: 'Browse training providers' }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    url: `https://findtraining.com/resources/${article.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'FindTraining.com',
      url: 'https://findtraining.com',
    },
    author: {
      '@type': 'Organization',
      name: 'FindTraining.com Editorial',
    },
  }

  return (
    <div className="py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav
          className="text-xs text-gray-500 mb-8 flex items-center gap-1.5 flex-wrap"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <Link href="/resources" className="hover:text-gray-700 transition-colors">
            Resources
          </Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <span className="text-gray-700 truncate max-w-[200px] sm:max-w-none">{article.title}</span>
        </nav>

        {/* Article header */}
        <div className="mb-8">
          <span
            className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 ${categoryClass(article.category)}`}
          >
            {article.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
          <p className="text-base text-gray-500 leading-relaxed mb-4">{article.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>{article.readingTimeMinutes} min read</span>
            </div>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100 mb-8" />

        {/* Article body */}
        <article className="prose-none">
          {article.content.map((section, index) => renderSection(section, index))}
        </article>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-xl bg-blue-50 border border-blue-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">{cta.label}</h2>
          <p className="text-sm text-gray-600 mb-4">
            FindTraining.com lists every HRDF-registered training provider in Malaysia — searchable
            by category, state, and delivery method.
          </p>
          <Link
            href={cta.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0F6FEC' }}
          >
            {cta.label}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Back to resources */}
        <div className="mt-8">
          <Link
            href="/resources"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            ← Back to all resources
          </Link>
        </div>
      </div>
    </div>
  )
}
