import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllCategories, getFeaturedProviders, getProviderStats } from '@webvillage/engine/adapters/findtraining'
import type { FtCategory, FtProvider } from '@webvillage/engine/types/ft'

export const metadata: Metadata = {
  title: 'Find HRDF-Registered Training Providers in Malaysia',
  description:
    'Find HRDF-registered training providers in Malaysia. Search thousands of providers by category and state. Calculate your HRD Corp levy and find levy-claimable training courses.',
  alternates: {
    canonical: 'https://findtraining.com',
  },
}

export default async function HomePage() {
  const [categories, featured, stats] = await Promise.all([
    getAllCategories(),
    getFeaturedProviders(6),
    getProviderStats(),
  ])

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FindTraining.com',
    url: 'https://findtraining.com',
    description: 'Find HRDF-registered training providers in Malaysia',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://findtraining.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is HRD Corp and the HRDF levy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "HRD Corp (formerly HRDF) is Malaysia's Human Resources Development Corporation. Malaysian employers in covered sectors pay a monthly levy of 1% of their employees' wages into the HRD Corp fund. This fund can be claimed back to pay for HRDF-registered training and development programmes.",
        },
      },
      {
        '@type': 'Question',
        name: 'How do I find HRDF-registered training providers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can search FindTraining.com by category, state, or keyword to find all HRD Corp registered training providers in Malaysia. Every listing is cross-referenced against the official HRD Corp registry.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are all providers on FindTraining.com HRDF-registered?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All Malaysian providers on FindTraining.com are sourced from the official HRD Corp registry. International providers (Singapore, UK, Australia) are listed for reference and may not be eligible for Malaysian HRDF levy claims.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I claim my HRD Corp levy for training?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Log in to eTRiS (HRD Corp's portal), select your training provider and course, and submit a claim before the training starts. Your provider will need to confirm the booking. Claims must be submitted before the course begins — retrospective claims are not accepted.",
        },
      },
      {
        '@type': 'Question',
        name: 'Can I list my training company on FindTraining.com?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. If your company is registered with HRD Corp, you are already listed. You can claim your profile to add contact details, courses, and a company description. Visit our founding member page to learn about early access pricing.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero */}
      <section className="bg-brand-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find the Best Corporate Training in Malaysia
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Browse HRDF-claimable courses, certifications, and professional development programs.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            {stats.total.toLocaleString()} providers across {stats.states.length} states
          </p>
          <form action="/search" method="GET" className="flex gap-2 max-w-xl mx-auto">
            <input
              name="q"
              type="search"
              placeholder="Search training providers, courses..."
              className="flex-1 rounded-lg px-4 py-3 text-gray-900 text-base"
            />
            <button
              type="submit"
              className="bg-brand-blue hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: FtCategory) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-brand-blue hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 flex-shrink-0"
                style={{ backgroundColor: '#0F6FEC' }}
              >
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Search Providers</h3>
              <p className="text-sm text-gray-600">
                Find HRDF-registered providers that match your training needs by category, state, or keyword.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 flex-shrink-0"
                style={{ backgroundColor: '#0F6FEC' }}
              >
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Review Profiles</h3>
              <p className="text-sm text-gray-600">
                See contact details, courses offered, delivery methods, and HRDF registration status.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 flex-shrink-0"
                style={{ backgroundColor: '#0F6FEC' }}
              >
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Claim Your Levy</h3>
              <p className="text-sm text-gray-600">
                Submit your HRD Corp grant application on eTRiS before training starts and recover your levy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HRDF Resources Teaser */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">New to HRDF? Start here.</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Learn how the HRD Corp levy works, how to submit a claim on eTRiS, and what training is eligible.
          </p>
          <Link
            href="/resources"
            className="inline-block text-sm font-semibold text-white px-6 py-2.5 rounded-lg transition-colors"
            style={{ backgroundColor: '#0F6FEC' }}
          >
            Browse HRDF Guides &amp; Resources →
          </Link>
        </div>
      </section>

      {/* Featured Providers */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Providers</h2>
              <Link href="/providers" className="text-brand-blue font-medium hover:underline text-sm">
                View all {stats.total.toLocaleString()} providers →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((provider: FtProvider) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.slug}`}
                  className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {provider.logo_url && (
                      <img src={provider.logo_url} alt="" className="w-12 h-12 rounded object-contain flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{provider.name}</h3>
                      {provider.state && (
                        <p className="text-sm text-gray-500 mt-0.5">{provider.state}</p>
                      )}
                      {provider.hrdf_status === 'registered' && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          HRDF Registered
                        </span>
                      )}
                    </div>
                  </div>
                  {provider.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{provider.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Provider CTA */}
      <section className="py-16 px-4 bg-brand-blue text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Are You a Training Provider?</h2>
          <p className="text-blue-100 mb-8">
            List your training programs and reach thousands of HR professionals across Malaysia.
          </p>
          <Link
            href="/founding"
            className="inline-block bg-white text-brand-blue font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Become a Founding Member
          </Link>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-14 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats.total.toLocaleString()}+</p>
              <p className="font-semibold text-gray-700 mb-1">Training Providers</p>
              <p className="text-sm text-gray-500">Malaysia&apos;s most complete HRDF directory</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">13</p>
              <p className="font-semibold text-gray-700 mb-1">Training Categories</p>
              <p className="text-sm text-gray-500">From IT to soft skills, sales to compliance</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">16</p>
              <p className="font-semibold text-gray-700 mb-1">States Covered</p>
              <p className="text-sm text-gray-500">Providers across all Malaysian states and territories</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
