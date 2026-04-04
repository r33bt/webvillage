import Link from 'next/link'
import { searchProviders } from '@webvillage/engine/adapters/supabase'
import type { FtProviderWithCategories } from '@webvillage/engine/types/ft'

export const metadata = {
  title: 'Training Providers | FindTraining Malaysia',
  description: 'Browse all corporate training providers in Malaysia. HRDF-claimable courses and certifications.',
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; state?: string; delivery?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  const { providers, total } = await searchProviders({
    page,
    state: params.state,
    delivery: params.delivery,
  })

  const totalPages = Math.ceil(total / 24)

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Providers</h1>
      <p className="text-gray-500 mb-8">
        {total.toLocaleString()} HRDF-registered and certified corporate training organisations in Malaysia.
      </p>

      {providers.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {providers.map((provider: FtProviderWithCategories) => (
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
                    <h2 className="font-semibold text-gray-900 truncate text-sm">{provider.name}</h2>
                    {provider.state && (
                      <p className="text-xs text-gray-500 mt-0.5">{provider.state}</p>
                    )}
                  </div>
                </div>
                {provider.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{provider.description}</p>
                )}
                {provider.category_names.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {provider.category_names.slice(0, 3).map((cat) => (
                      <span key={cat} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center">
              {page > 1 && (
                <Link href={`/providers?page=${page - 1}`} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  ← Previous
                </Link>
              )}
              <span className="px-4 py-2 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link href={`/providers?page=${page + 1}`} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                  Next →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium mb-2">No providers found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}
    </main>
  )
}
