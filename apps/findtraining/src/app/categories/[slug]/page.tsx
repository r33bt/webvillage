import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getProvidersByCategory } from '@webvillage/engine/adapters/findtraining'
import type { FtProviderWithCategories } from '@webvillage/engine/types/ft'

function cleanName(name: string): string {
  const m = name.match(/^\*\*(.*?)\*\*/)
  return m ? m[1].trim() : name
}

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ state?: string; delivery?: string; page?: string }>
}

const MY_STATES = [
  'Kuala Lumpur', 'Selangor', 'Johor', 'Penang', 'Sabah', 'Sarawak',
  'Perak', 'Negeri Sembilan', 'Melaka', 'Pahang', 'Kelantan', 'Terengganu',
  'Kedah', 'Perlis', 'Putrajaya', 'Labuan',
]

const DELIVERY_METHODS = [
  { value: 'in-person', label: 'In-Person' },
  { value: 'virtual', label: 'Virtual' },
  { value: 'e-learning', label: 'E-Learning' },
  { value: 'hybrid', label: 'Hybrid' },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }

  return {
    title: `${category.name} Training Providers Malaysia | HRDF Claimable`,
    description: `Browse HRDF-registered ${category.name} training providers in Malaysia. All courses HRDF levy claimable.`,
    alternates: { canonical: `https://findtraining.com/categories/${slug}` },
    openGraph: {
      title: `${category.name} Training Providers Malaysia | HRDF Claimable`,
      description: `Browse HRDF-registered ${category.name} training providers in Malaysia. All courses HRDF levy claimable.`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams
  const state = sp.state ?? ''
  const delivery = sp.delivery ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  const [category, { providers, total }] = await Promise.all([
    getCategoryBySlug(slug),
    getProvidersByCategory(slug, {
      state: state || undefined,
      delivery: delivery || undefined,
      page,
    }),
  ])

  if (!category) notFound()

  const totalPages = Math.ceil(total / 24)

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    if (state) p.set('state', state)
    if (delivery) p.set('delivery', delivery)
    if (page > 1) p.set('page', String(page))
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k)
    })
    const s = p.toString()
    return `/categories/${slug}${s ? '?' + s : ''}`
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://findtraining.com' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://findtraining.com/categories' },
      { '@type': 'ListItem', position: 3, name: category.name },
    ],
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} Training Providers in Malaysia`,
    numberOfItems: total,
    itemListElement: providers.slice(0, 10).map((provider: FtProviderWithCategories, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://findtraining.com/providers/${provider.slug}`,
      name: cleanName(provider.name),
    })),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-gray-700">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/categories" className="hover:text-gray-700">Categories</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-900 font-medium">{category.name}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{category.name} Training Providers</h1>
        <p className="text-gray-600">
          {total.toLocaleString()} HRDF-registered {category.name.toLowerCase()} providers in Malaysia.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-2">State</h3>
            <div className="space-y-1">
              <Link href={buildUrl({ state: undefined, page: undefined })} className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 ${!state ? 'text-[#0F6FEC] font-medium' : 'text-gray-600'}`}>
                All states
              </Link>
              {MY_STATES.map((s) => (
                <Link key={s} href={buildUrl({ state: s, page: undefined })} className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 ${state === s ? 'text-[#0F6FEC] font-medium' : 'text-gray-600'}`}>
                  {s}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-2">Delivery</h3>
            <div className="space-y-1">
              <Link href={buildUrl({ delivery: undefined, page: undefined })} className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 ${!delivery ? 'text-[#0F6FEC] font-medium' : 'text-gray-600'}`}>
                All methods
              </Link>
              {DELIVERY_METHODS.map((m) => (
                <Link key={m.value} href={buildUrl({ delivery: m.value, page: undefined })} className={`block text-sm px-2 py-1 rounded hover:bg-gray-100 ${delivery === m.value ? 'text-[#0F6FEC] font-medium' : 'text-gray-600'}`}>
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {providers.length > 0 ? (
            <>
              <div className="grid gap-4 mb-8">
                {providers.map((provider: FtProviderWithCategories) => (
                  <Link
                    key={provider.id}
                    href={`/providers/${provider.slug}`}
                    className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0F6FEC] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {provider.logo_url && (
                        <img src={provider.logo_url} alt="" className="w-12 h-12 rounded object-contain flex-shrink-0" />
                      )}
                      <div>
                        <h2 className="font-semibold text-gray-900">{cleanName(provider.name)}</h2>
                        {provider.state && <p className="text-sm text-gray-500">{provider.state}</p>}
                      </div>
                    </div>
                    {provider.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{provider.description}</p>
                    )}
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex gap-2 justify-center">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">← Previous</Link>
                  )}
                  <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {totalPages}</span>
                  {page < totalPages && (
                    <Link href={buildUrl({ page: String(page + 1) })} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Next →</Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium mb-2">No providers found</p>
              <p className="text-sm">Try removing some filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
