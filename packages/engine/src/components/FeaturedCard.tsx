'use client'

/**
 * FeaturedCard Component
 * @product directory
 * @category listing
 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, TrendingUp, Zap } from 'lucide-react'
import { SafeLogo } from './SafeImage'

interface FeaturedCardProps {
  listing: {
    _id: string
    _type?: 'software' | 'business' | 'provider' | 'service'
    title: string
    description?: string
    slug?: {
      current: string
    }
    logo?: {
      asset?: {
        url: string
      }
    }
    logoUrl?: string
    category?: {
      title: string
      slug?: {
        current: string
      }
    }
    rating?: number
    tags?: string[]
    featured?: boolean
    trending?: boolean
  }
}

export function FeaturedCard({ listing }: FeaturedCardProps) {
  const router = useRouter()
  const imageUrl = listing.logo?.asset?.url || listing.logoUrl
  const categorySlug = listing.category?.slug?.current || ''
  
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/categories/${categorySlug}`)
  }

  const getDetailRoute = () => {
    const slug = listing.slug?.current || listing._id
    switch (listing._type) {
      case 'provider': return `/practitioners/${slug}`
      case 'service': return `/services/${slug}`
      case 'business': return `/business/${slug}`
      case 'software': return `/software/${slug}`
      default: return `/directory/${slug}`
    }
  }

  return (
    <Link
      href={getDetailRoute()}
      className="group relative bg-card rounded-xl border-2 border-border hover:border-primary/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Gradient border effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
           style={{ padding: '2px' }} />

      <div className="relative bg-card rounded-xl p-6 h-full">
        {/* Header with logo and badges */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-muted to-muted/80 p-2 group-hover:scale-110 transition-transform duration-300 overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <SafeLogo
                src={imageUrl}
                name={listing.title}
                size={48}
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {listing.title.charAt(0)}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {listing.title}
              </h3>

              {listing.trending && (
                <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-destructive text-white text-xs font-semibold rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Hot
                </div>
              )}
            </div>

            {/* Category badge - using button instead of Link */}
            {listing.category && (
              <button
                onClick={handleCategoryClick}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full hover:bg-primary/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Zap className="w-3 h-3" />
                {listing.category.title}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
            {listing.description}
          </p>
        )}

        {/* Footer - Rating and tags */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {/* Rating */}
          {listing.rating && listing.rating > 0 ? (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(listing.rating!)
                      ? 'fill-amber-400 dark:fill-amber-500 text-amber-400 dark:text-amber-500'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
              <span className="ml-1 text-sm font-medium text-foreground">
                {listing.rating.toFixed(1)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Star className="w-4 h-4" />
              <span>No ratings yet</span>
            </div>
          )}

          {/* View arrow */}
          <span className="text-sm text-primary group-hover:text-primary/90 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            View Details
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>

        {/* Tags (if available) */}
        {listing.tags && listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {listing.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
             style={{ opacity: 0.2 }} />
      </div>
    </Link>
  )
}