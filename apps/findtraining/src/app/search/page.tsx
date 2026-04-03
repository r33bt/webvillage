import { fetchAllListings, fetchCategories } from '@webvillage/engine'
import { DirectoryGrid, DirectoryFilters } from '@webvillage/engine'
import { SITE_ID } from '@/lib/site'

export const metadata = {
  title: 'Search Training',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const { q, category, page: pageStr } = params
  const page = Number(pageStr ?? 1)
  const limit = 24
  const offset = (page - 1) * limit

  const [listings, categories] = await Promise.all([
    q || category
      ? fetchAllListings({ siteId: SITE_ID, search: q, category, limit, offset })
      : Promise.resolve([]),
    fetchCategories(SITE_ID),
  ])

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {q ? 'Results for "' + q + '"' : 'Search Training'}
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <DirectoryFilters categories={categories} basePath="/search" />
        </aside>
        <div className="flex-1">
          {listings.length > 0 ? (
            <DirectoryGrid businesses={listings} />
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">Try a different keyword or browse by category.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
