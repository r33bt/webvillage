import Link from 'next/link'
import { getAllCategories, getFeaturedProviders, getProviderStats } from '@webvillage/engine/adapters/supabase'
import type { FtCategory, FtProvider } from '@webvillage/engine/types/ft'

export default async function HomePage() {
  const [categories, featured, stats] = await Promise.all([
    getAllCategories(),
    getFeaturedProviders(6),
    getProviderStats(),
  ])

  return (
    <main>
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
    </main>
  )
}
