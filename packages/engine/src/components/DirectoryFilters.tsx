/**
 * DirectoryFilters Component
 * @product directory
 * @category search
 *
 * Filter UI for directory listings (category, price range, rating, etc.).
 */
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'

interface DirectoryFiltersProps {
  categories: Array<{
    _id: string
    title: string
    slug: { current: string }
  }>
  supportsBoth?: boolean
  /** Base path for filter URL updates. Defaults to current pathname. */
  basePath?: string
}

export function DirectoryFilters({ categories, supportsBoth = false, basePath }: DirectoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const filterBase = basePath ?? pathname ?? '/directory'

  const activeCategory = searchParams.get('category')
  const activeType = searchParams.get('type') || 'all'
  const activeFilters = Array.from(searchParams.entries()).filter(
    ([key]) => !['q', 'page'].includes(key)
  )

  const handleCategoryFilter = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (activeCategory === categorySlug) {
      params.delete('category')
    } else {
      params.set('category', categorySlug)
    }
    params.delete('page')
    router.push(`${filterBase}?${params.toString()}`)
  }

  const handleTypeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    params.delete('page')
    router.push(`${filterBase}?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/directory')
  }

  return (
    <div className="space-y-6">
      {/* Type Filter (only show if site supports both) */}
      {supportsBoth && (
        <div className="bg-card border border-border rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-foreground mb-4">Type</h3>
          <div className="space-y-2">
            {['all', 'software', 'business'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeFilter(type)}
                className={`block w-full text-left px-4 py-2 rounded-lg transition focus-visible:ring-2 focus-visible:ring-ring ${
                  activeType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {type === 'all' ? 'All Listings' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-card border border-border rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-foreground mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryFilter(category.slug.current)}
              className={`block w-full text-left px-4 py-2 rounded-lg transition focus-visible:ring-2 focus-visible:ring-ring ${
                activeCategory === category.slug.current
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="bg-card border border-border rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Active Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary/90 focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {activeFilters.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between bg-primary/10 px-3 py-2 rounded-lg"
              >
                <span className="text-sm text-foreground capitalize">
                  {key}: {value}
                </span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete(key)
                    router.push(`${filterBase}?${params.toString()}`)
                  }}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
