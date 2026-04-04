import Link from 'next/link'
import { searchProviders, getAllCategories } from '@webvillage/engine/adapters/supabase'
import type { FtProviderWithCategories, FtCategory } from '@webvillage/engine/types/ft'

function cleanName(name: string): string {
  const m = name.match(/^\*\*(.*?)\*\*/)
  return m ? m[1].trim() : name
}

export const metadata = {
  title: 'Search Training Providers | FindTraining Malaysia',
  robots: { index: false },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; state?: string; page?: string }>
}) {
  const params = await searchParams
  const { q, category, state, page: pageStr } = params
  const page = Number(pageStr ?? 1)
  const hasFilters = Boolean(q || category || state)

  const [result, categories] = await Promise.all([
    hasFilters
      ? searchProviders({ query: q, category, state, page })
      : Promise.resolve({ providers: [], total: 0 }),
    getAllCategories(),
  ])

  const { providers, total } = result

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {q ? `Results for "${q}"` : 'Search Training Providers'}
      </h1>

      {/* Search form */}
      <form method="GET" action="/search" className="flex gap-2 mb-8 max-w-xl">
        <input
          name="q"
          type="search"
          defaultValue={q ?? ''}
          placeholder="Search providers, courses..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-brand-blue text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="md:w-56 flex-shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Category</h3>
            <div className="space-y-1">
              <Link
                href={`/search?q=${q ?? ''}`}
                className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 ${!category ? 'text-brand-blue font-medium' : 'text-gray-600'}`}
              >
                All categories
              </Link>
              {categories.map((cat: FtCategory) => (
                <Link
                  key={cat.id}
                  href={`/search?q=${q ?? ''}&category=${cat.slug}`}
                  className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 truncate ${category === cat.slug ? 'text-brand-blue font-medium' : 'text-gray-600'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {hasFilters && total > 0 && (
            <p className="text-sm text-gray-500 mb-4">{total.toLocaleString()} results</p>
          )}
          {providers.length > 0 ? (
            <div className="grid gap-4">
              {providers.map((provider: FtProviderWithCategories) => (
                <Link
                  key={provider.id}
                  href={`/providers/${provider.slug}`}
                  className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {provider.logo_url && (
                      <img src={provider.logo_url} alt="" className="w-10 h-10 rounded object-contain flex-shrink-0" />
                    )}
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm">{cleanName(provider.name)}</h2>
                      <p className="text-xs text-gray-500">{provider.state}</p>
                    </div>
                    {provider.hrdf_status === 'registered' && (
                      <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        HRDF
                      </span>
                    )}
                  </div>
                  {provider.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{provider.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : hasFilters ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">Try a different keyword or browse by category.</p>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">Enter a search term or select a category to find training providers.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
