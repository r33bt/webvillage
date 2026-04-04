import Link from 'next/link'
import { MapPin, ArrowRight, Star, Sparkles } from 'lucide-react'
import type { FtProviderWithCategories } from '@webvillage/engine/types/ft'
import { HRDFBadge } from './HRDFBadge'

interface ProviderCardProps {
  provider: FtProviderWithCategories
}

const TIER_LABELS: Record<string, { label: string; className: string } | undefined> = {
  pro: { label: 'Pro', className: 'bg-[#0F6FEC] text-white' },
  founding: { label: 'Founding', className: 'bg-amber-500 text-white' },
  starter: { label: 'Starter', className: 'bg-gray-100 text-gray-700' },
}

const COUNTRY_FLAGS: Record<string, string> = {
  SG: '🇸🇬',
  GB: '🇬🇧',
  AU: '🇦🇺',
  US: '🇺🇸',
  ZZ: '🌍',
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const { name, slug, state, region, hrdf_status, tier, featured, category_names, country_code } = provider
  const tierBadge = TIER_LABELS[tier]
  const displayCategories = (category_names ?? []).slice(0, 3)
  const isHrdf = hrdf_status === 'registered'
  const countryFlag = country_code && country_code !== 'MY' ? COUNTRY_FLAGS[country_code] : null

  return (
    <article className="flex flex-col bg-white border border-gray-200 rounded-xl p-5 hover:border-[#0F6FEC] hover:shadow-md transition-all duration-150">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">
          {name}
        </h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {countryFlag && (
            <span className="text-xs text-gray-500 whitespace-nowrap" title={country_code}>
              {countryFlag} {country_code}
            </span>
          )}
          {featured && (
            <span title="Featured">
              <Star
                className="w-4 h-4 text-amber-400 fill-amber-400"
                aria-label="Featured provider"
              />
            </span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {isHrdf && <HRDFBadge />}
        {tierBadge && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tierBadge.className}`}
          >
            {tier === 'pro' && <Sparkles className="w-3 h-3" aria-hidden="true" />}
            {tierBadge.label}
          </span>
        )}
      </div>

      {/* Location */}
      {(state || region) && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          <span>{[state, region].filter(Boolean).join(', ')}</span>
        </div>
      )}

      {/* Categories */}
      {displayCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {displayCategories.map((cat) => (
            <span key={cat} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
              {cat}
            </span>
          ))}
          {(category_names?.length ?? 0) > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{(category_names?.length ?? 0) - 3} more
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        <Link
          href={`/providers/${slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#0F6FEC] hover:underline"
        >
          View Profile
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
