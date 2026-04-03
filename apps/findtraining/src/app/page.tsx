import Link from 'next/link'
import { fetchCategories, fetchAllListings } from '@webvillage/engine'
import { FeaturedCard, CategoryCard } from '@webvillage/engine'
import { SITE_ID } from '@/lib/site'

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    fetchCategories(SITE_ID),
    fetchAllListings({ siteId: SITE_ID, limit: 6 }),
  ])

  return (
    <main>
      <section className="bg-brand-dark text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find the Best Corporate Training in Malaysia
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Browse HRDF-claimable courses, certifications, and professional development programs.
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

      {categories.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: any) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Providers</h2>
              <Link href="/providers" className="text-brand-blue font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing: any) => (
                <FeaturedCard key={listing._id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4 bg-brand-blue text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Are You a Training Provider?</h2>
          <p className="text-blue-100 mb-8">
            List your training programs and reach thousands of HR professionals across Malaysia.
          </p>
          <Link
            href="/providers/claim"
            className="inline-block bg-white text-brand-blue font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            List Your Organisation
          </Link>
        </div>
      </section>
    </main>
  )
}
