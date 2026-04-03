/**
 * DirectoryCard Component
 * @product directory
 * @category listing
 *
 * Displays a business/software listing card with image, rating, location, and verification badge.
 * Used in directory product listing pages (etomite.org, tcm.my).
 */
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, TrendingUp } from 'lucide-react'
import { VerificationBadge } from './VerificationBadge'
import { SafeLogo } from './SafeImage'

interface DirectoryCardProps {
  business: {
    _id: string
    _type?: 'software' | 'business' | 'provider' | 'service'
    slug: { current: string }
    title?: string
    name?: string
    excerpt?: string
    description?: string
    logoUrl?: string
    logo?: {
      asset?: {
        url: string
      }
    }
    photo?: {
      asset?: {
        url: string
      }
    }
    featuredImage?: {
      asset?: {
        url: string
      }
      alt?: string
    }
    category?: {
      title: string
      slug: { current: string }
    }
    city?: string
    state?: string
    priceRange?: string
    rating?: number
    reviewCount?: number
    featured?: boolean
    trending?: boolean
    tags?: string[]
    tagline?: string
    specialties?: string[]
    yearsExperience?: number
    lastVerifiedAt?: string
    verifiedBy?: 'editor' | 'owner' | 'community'
  }
}

export function DirectoryCard({ business }: DirectoryCardProps) {
  // Detect route based on content type
  const getDetailRoute = () => {
    switch(business._type) {
      case 'software':
        return `/software/${business.slug.current}`
      case 'business':
        return `/business/${business.slug.current}`
      case 'provider':
        return `/practitioners/${business.slug.current}`
      case 'service':
        return `/services/${business.slug.current}`
      default:
        // Fallback to directory for backward compatibility
        return `/directory/${business.slug.current}`
    }
  }

  const logoUrl = business.logoUrl || business.logo?.asset?.url || business.photo?.asset?.url
  const imageUrl = business.featuredImage?.asset?.url
  const displayName = business.name || business.title || 'Untitled'

  return (
    <Link
      href={getDetailRoute()}
      className="block bg-card rounded-lg shadow-md hover:shadow-xl transition-all hover:scale-105 overflow-hidden group border border-border"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/20">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={business.featuredImage?.alt || displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl font-bold text-primary/20">
              {displayName.charAt(0) || '?'}
            </div>
          </div>
        )}

        {/* Type Badge */}
        {business._type && (
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              business._type === 'software'
                ? 'bg-primary text-primary-foreground'
                : business._type === 'business'
                ? 'bg-green-600 dark:bg-green-700 text-white'
                : business._type === 'provider'
                ? 'bg-primary text-primary-foreground'
                : 'bg-orange-600 dark:bg-orange-700 text-white'
            }`}>
              {business._type === 'software' ? 'Software'
                : business._type === 'business' ? 'Business'
                : business._type === 'provider' ? 'Provider'
                : 'Service'}
            </span>
          </div>
        )}

        {/* Featured/Trending Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          {business.featured && (
            <span className="bg-amber-400 dark:bg-amber-500 text-amber-900 dark:text-amber-950 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              Featured
            </span>
          )}
          {business.trending && (
            <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
          {business.lastVerifiedAt && (
            <VerificationBadge
              lastVerifiedAt={business.lastVerifiedAt}
              verifiedBy={business.verifiedBy}
            />
          )}
        </div>

        {/* Logo Overlay */}
        {logoUrl && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="w-16 h-16 bg-card rounded-lg p-2 shadow-lg">
              <SafeLogo
                src={logoUrl}
                name={displayName}
                size={48}
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition line-clamp-1">
            {displayName}
          </h3>
        </div>

        {business.category && (
          <div className="mb-3">
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
              {business.category.title}
            </span>
          </div>
        )}

        {(business.tagline || business.excerpt || business.description) && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {business.tagline || business.excerpt || business.description}
          </p>
        )}

        {/* Location or Price Range */}
        <div className="flex items-center justify-between text-sm">
          {(business.city || business.state) && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {business.city}
                {business.city && business.state && ', '}
                {business.state}
              </span>
            </div>
          )}
          {business.priceRange && (
            <span className="text-foreground font-medium">{business.priceRange}</span>
          )}
          {business.yearsExperience && (
            <span className="text-muted-foreground text-xs">
              {business.yearsExperience}+ years exp
            </span>
          )}
        </div>

        {/* Rating */}
        {business.rating && (
          <div className="flex items-center mt-3 pt-3 border-t border-border">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500" />
              <span className="ml-1 font-semibold text-foreground">{business.rating}</span>
            </div>
            {business.reviewCount && (
              <span className="ml-2 text-muted-foreground text-sm">
                ({business.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Tags or Specialties */}
        {((business.tags && business.tags.length > 0) || (business.specialties && business.specialties.length > 0)) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(business.specialties || business.tags)?.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
