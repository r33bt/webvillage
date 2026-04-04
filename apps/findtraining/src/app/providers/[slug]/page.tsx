import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, MapPin, Sparkles, CheckCircle } from 'lucide-react'
import { getProviderBySlug } from '@webvillage/engine/adapters/supabase'
import { ContactLinks } from './ContactLinks'

interface Props {
  params: Promise<{ slug: string }>
}

const PAID_TIERS = new Set(['starter', 'pro', 'founding'])

const TIER_BADGES: Record<string, { label: string; className: string }> = {
  pro: { label: 'Pro', className: 'bg-[#0F6FEC] text-white' },
  founding: { label: 'Founding Member', className: 'bg-amber-500 text-white' },
  starter: { label: 'Starter', className: 'bg-gray-100 text-gray-700' },
  free: { label: 'Free Listing', className: 'bg-gray-100 text-gray-500' },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)
  if (!provider) return { title: 'Provider Not Found' }

  const catLabel = provider.categories?.[0]
    ? provider.categories[0].split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : null

  return {
    title: provider.name,
    description: [
      `Find and contact ${provider.name},`,
      catLabel ? `a ${catLabel} training provider` : 'an HRDF-registered training provider',
      provider.state ? `in ${provider.state}, Malaysia.` : 'in Malaysia.',
    ].join(' '),
    openGraph: {
      title: `${provider.name} | FindTraining Malaysia`,
      description: `${catLabel ?? 'HRDF-registered training provider'}${provider.state ? ` in ${provider.state}` : ''}. Find courses and contact details.`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    alternates: { canonical: `https://findtraining.com.my/providers/${slug}` },
  }
}

export default async function ProviderPage({ params }: Props) {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)

  if (!provider || provider.profile_status === 'removed' || provider.profile_status === 'opted_out') {
    notFound()
  }

  const showContactInfo = PAID_TIERS.has(provider.tier) && provider.claimed
  const tierBadge = TIER_BADGES[provider.tier] ?? TIER_BADGES.free
  const isVerified = provider.profile_status === 'claimed' || provider.profile_status === 'active'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.name,
    description: provider.description ?? 'HRDF-registered training provider in Malaysia.',
    ...(showContactInfo && provider.email ? { email: provider.email } : {}),
    ...(showContactInfo && provider.phone ? { telephone: provider.phone } : {}),
    ...(provider.website ? { url: provider.website.startsWith('http') ? provider.website : `https://${provider.website}` } : {}),
    ...(provider.state ? { address: { '@type': 'PostalAddress', addressRegion: provider.state, addressCountry: 'MY' } } : {}),
    ...(provider.logo_url ? { image: provider.logo_url } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-gray-700">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/providers" className="hover:text-gray-700">Providers</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">{provider.name}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">{provider.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {provider.hrdf_status === 'registered' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#00C48C]/10 text-[#00C48C]">
                <CheckCircle className="w-3 h-3" aria-hidden="true" /> HRDF Registered
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tierBadge.className}`}>
              {provider.tier === 'pro' && <Sparkles className="w-3 h-3" aria-hidden="true" />}
              {tierBadge.label}
            </span>
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Verified
              </span>
            )}
            {provider.state && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> {provider.state}
              </span>
            )}
          </div>
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {provider.description ?? 'HRDF-registered training provider in Malaysia.'}
              </p>
            </section>

            {/* Categories */}
            {provider.categories?.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Training Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.categories.map((cat: string) => (
                    <Link
                      key={cat}
                      href={`/categories/${cat}`}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {cat.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Delivery methods */}
            {provider.delivery_methods?.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Delivery Methods</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.delivery_methods.map((method: string) => (
                    <span key={method} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize">
                      {method}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Location */}
            {(provider.state || provider.region) && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Location</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.state && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{provider.state}</span>
                  )}
                  {provider.region && provider.region !== provider.state && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{provider.region}</span>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Contact</h2>
              {showContactInfo ? (
                <ContactLinks
                  providerId={provider.id}
                  email={provider.email}
                  phone={provider.phone}
                  website={provider.website}
                />
              ) : (
                <div className="text-sm text-gray-500 space-y-2">
                  <p>Contact info available for listed providers.</p>
                  <Link href={`/claim/${provider.slug}`} className="inline-flex items-center gap-1 font-medium text-[#0F6FEC] hover:underline">
                    Claim this listing <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>

            {provider.regulatory_body_id && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-1">HRDF Registration No.</h2>
                <p className="text-sm font-mono text-gray-600">{provider.regulatory_body_id}</p>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-500 mb-2">Is this your listing?</p>
              <Link href={`/claim/${provider.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-[#0F6FEC] hover:underline">
                Claim & manage it <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
