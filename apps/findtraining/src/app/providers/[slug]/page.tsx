import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, MapPin, Sparkles, CheckCircle } from 'lucide-react'
import { getProviderBySlug, getCoursesByProvider, getTopicalRelatedProviders } from '@webvillage/engine/adapters/findtraining'
import type { FtCourse, FtProvider } from '@webvillage/engine/types/ft'
import { COUNTRY_CONFIGS } from '@/lib/countries'
import { ContactLinks } from './ContactLinks'
import { EnquiryForm } from '@/components/EnquiryForm'
import { ProviderMark } from '@/components/ProviderMark'
import { cohortAForCountry, isProviderIndexable } from '@/lib/indexing-cohorts'
import { buildProviderFacts, buildProviderSummary, countryName as countryNameOf, providerKindPhrase, stateLabel } from '@/lib/provider-facts'

interface Props {
  params: Promise<{ slug: string }>
}

const PAID_TIERS = new Set(['starter', 'pro', 'founding'])

// Map raw DB category values → actual ft_categories URL slugs
const CATEGORY_SLUG_MAP: Record<string, string> = {
  'it_technology': 'it-training',
  'it-training': 'it-training',
  'leadership_management': 'leadership-management',
  'leadership-management': 'leadership-management',
  'safety_health': 'safety-health',
  'safety-health': 'safety-health',
  'finance_accounting': 'finance-accounting',
  'finance-accounting': 'finance-accounting',
  'human_resources': 'human-resources',
  'human-resources': 'human-resources',
  'hr': 'human-resources',
  'soft_skills': 'soft-skills',
  'soft-skills': 'soft-skills',
  'sales_marketing': 'sales-marketing',
  'sales-marketing': 'sales-marketing',
  'sales_training': 'sales-marketing',
  'operations_logistics': 'operations-logistics',
  'operations-logistics': 'operations-logistics',
  'compliance_legal': 'compliance-legal',
  'compliance-legal': 'compliance-legal',
  'digital_marketing': 'digital-marketing',
  'digital-marketing': 'digital-marketing',
  'customer_service': 'customer-service',
  'customer-service': 'customer-service',
  'engineering_technical': 'engineering-technical',
  'engineering-technical': 'engineering-technical',
  'healthcare': 'healthcare',
}

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

  const countryName = countryNameOf(provider.country_code)
  const kind = providerKindPhrase(provider.categories)
  const place = stateLabel(provider.country_code, provider.state)
  const locationLabel = place ? `${place}, ${countryName}` : countryName

  return {
    title: provider.name,
    description: `Find and contact ${provider.name}, ${kind} in ${locationLabel}.`,
    openGraph: {
      title: `${provider.name} | FindTraining`,
      description: `${kind.charAt(0).toUpperCase()}${kind.slice(1)} in ${locationLabel}. Find courses and contact details.`,
      url: `https://findtraining.com/providers/${slug}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    alternates: { canonical: `https://findtraining.com/providers/${slug}` },
    // Indexing experiment: Cohort B pages are noindex,follow (src/config/indexing.ts).
    ...(isProviderIndexable(slug) ? {} : { robots: { index: false, follow: true } }),
  }
}

const DELIVERY_LABELS: Record<string, string> = {
  'in-person': 'In-Person',
  virtual: 'Virtual',
  'e-learning': 'E-Learning',
  hybrid: 'Hybrid',
}

const DELIVERY_COLORS: Record<string, string> = {
  'in-person': 'bg-blue-50 text-blue-700',
  virtual: 'bg-purple-50 text-purple-700',
  'e-learning': 'bg-teal-50 text-teal-700',
  hybrid: 'bg-orange-50 text-orange-700',
}

function formatPriceRange(course: FtCourse): string {
  const currency = course.currency_code ?? 'MYR'
  if (course.price_min !== null && course.price_max !== null) {
    if (course.price_min === course.price_max) {
      return `${currency} ${Number(course.price_min).toLocaleString()}`
    }
    return `${currency} ${Number(course.price_min).toLocaleString()} – ${Number(course.price_max).toLocaleString()}`
  }
  if (course.price_min !== null) return `From ${currency} ${Number(course.price_min).toLocaleString()}`
  if (course.price_max !== null) return `Up to ${currency} ${Number(course.price_max).toLocaleString()}`
  return 'Price on request'
}

export default async function ProviderPage({ params }: Props) {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)

  if (!provider || provider.profile_status === 'removed' || provider.profile_status === 'opted_out') {
    notFound()
  }

  let courses: FtCourse[] = []
  let related: FtProvider[] = []
  try {
    courses = await getCoursesByProvider(provider.id)
  } catch {
    courses = []
  }
  try {
    // Same country, category and region; strongest (Cohort A) listings first.
    related = await getTopicalRelatedProviders(provider, {
      limit: 6,
      preferSlugs: cohortAForCountry(provider.country_code)
        .filter((e) => e.state && e.state === (provider.state ?? provider.region))
        .map((e) => e.slug),
    })
  } catch {
    related = []
  }

  const isClaimedPaid = PAID_TIERS.has(provider.tier) && provider.claimed
  const showContactInfo = isClaimedPaid
  const showEnquiryForm = isClaimedPaid
  const showEnquiryTeaser = !PAID_TIERS.has(provider.tier) && provider.claimed
  const showUnclaimedEnquiryForm = !provider.claimed
  const tierBadge = TIER_BADGES[provider.tier] ?? TIER_BADGES.free
  const isVerified = provider.profile_status === 'claimed' || provider.profile_status === 'active'
  const facts = buildProviderFacts(provider)
  const aboutText = provider.description ?? buildProviderSummary(provider, provider.name)
  const currency = COUNTRY_CONFIGS[provider.country_code]?.currency ?? 'RM'
  const registryUrl = facts.find((f) => f.key.endsWith('-source'))?.href
  const identifiers = facts.filter((f) => f.identifier).map((f) => ({ '@type': 'PropertyValue', name: f.label, value: f.value }))
  const placeName = stateLabel(provider.country_code, provider.state) ?? provider.region

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://findtraining.com' },
      { '@type': 'ListItem', position: 2, name: 'Providers', item: 'https://findtraining.com/providers' },
      { '@type': 'ListItem', position: 3, name: provider.name },
    ],
  }

  // JSON-LD repeats only what the page shows: name, website, description/summary, location,
  // registry identifiers, the registry link, and contact details only where the page shows them.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: provider.name,
    ...(aboutText ? { description: aboutText } : {}),
    ...(showContactInfo && provider.email ? { email: provider.email } : {}),
    ...(showContactInfo && provider.phone ? { telephone: provider.phone } : {}),
    ...(provider.website ? { url: provider.website.startsWith('http') ? provider.website : `https://${provider.website}` } : {}),
    ...(placeName || provider.address || provider.city
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(provider.address ? { streetAddress: provider.address } : {}),
            ...(provider.city ? { addressLocality: provider.city } : {}),
            ...(placeName ? { addressRegion: placeName } : {}),
            addressCountry: provider.country_code,
          },
        }
      : {}),
    ...(identifiers.length > 0 ? { identifier: identifiers } : {}),
    ...(registryUrl ? { sameAs: [registryUrl] } : {}),
    ...(provider.logo_url ? { image: provider.logo_url } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <ProviderMark
            name={provider.name}
            logoUrl={provider.logo_url}
            variant="tile"
            className="w-full rounded-xl border border-gray-200 sm:w-64 sm:flex-shrink-0"
          />
          <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-ink leading-tight mb-3">{provider.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-3">
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
          </div>
        </header>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Verified facts: only fields the record holds */}
            {facts.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Provider details</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {facts.map((f) => (
                    <div key={f.key} className="min-w-0">
                      <dt className="text-xs font-medium text-gray-500">{f.label}</dt>
                      <dd className="text-gray-900 break-words">
                        {f.href ? (
                          <a href={f.href} target="_blank" rel="noopener noreferrer" className="text-[#0F6FEC] hover:underline">
                            {f.value}
                          </a>
                        ) : (
                          f.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* About */}
            {aboutText ? (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{aboutText}</p>
              </section>
            ) : null}

            {/* Categories */}
            {(() => {
              const visibleCategories = provider.categories?.filter((cat) => CATEGORY_SLUG_MAP[cat]) ?? []
              if (visibleCategories.length === 0) return null
              return (
                <section className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Training Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {visibleCategories.map((cat: string) => {
                      const urlSlug = CATEGORY_SLUG_MAP[cat]
                      const label = urlSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                      return (
                        <Link
                          key={cat}
                          href={`/categories/${urlSlug}`}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {label}
                        </Link>
                      )
                    })}
                  </div>
                </section>
              )
            })()}

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

            {/* Training Programmes */}
            {courses.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Training Programmes</h2>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 flex-1 min-w-0">{course.title}</h3>
                        {course.delivery_method && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${DELIVERY_COLORS[course.delivery_method] ?? 'bg-gray-100 text-gray-700'}`}>
                            {DELIVERY_LABELS[course.delivery_method] ?? course.delivery_method}
                          </span>
                        )}
                        {course.hrdf_claimable && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00C48C]/10 text-[#00C48C] flex-shrink-0">
                            HRDF Claimable
                          </span>
                        )}
                      </div>
                      {course.description && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">{course.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {course.duration_days !== null && (
                          <span>{course.duration_days} {course.duration_days === 1 ? 'day' : 'days'}</span>
                        )}
                        <span className="font-medium text-gray-700">{formatPriceRange(course)}</span>
                      </div>
                    </div>
                  ))}
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
                <div className="text-sm text-gray-500 space-y-3">
                  {provider.website && (
                    <a
                      href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-[#0F6FEC] hover:underline"
                    >
                      Visit Website <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                  <p className="text-xs text-gray-400">Full contact details visible after provider claims this listing.</p>
                  <Link href={`/claim/${provider.slug}`} className="inline-flex items-center gap-1 font-medium text-[#0F6FEC] hover:underline">
                    Claim this listing <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>


            {showEnquiryForm && (
              <EnquiryForm providerId={provider.id} providerName={provider.name} currency={currency} />
            )}

            {showUnclaimedEnquiryForm && (
              <EnquiryForm providerId={provider.id} providerName={provider.name} mode="unclaimed" currency={currency} />
            )}

            {showEnquiryTeaser && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-1">Send a training enquiry</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  Starter and Pro providers can receive direct enquiries from HR managers. Upgrade to enable this feature.
                </p>
                <a
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0F6FEC' }}
                >
                  Upgrade to receive enquiries <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            )}

            {!provider.claimed && (
              <div className="rounded-xl border-2 border-[#0F6FEC] bg-blue-50 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-1">Is this your company?</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  Claim this listing to add your contact details, courses, and logo — then get found by HR managers searching FindTraining.
                </p>
                <Link
                  href={`/claim/${provider.slug}`}
                  className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#0F6FEC' }}
                >
                  Claim this listing <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}
          </aside>
        </div>

        {/* Related Providers */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Also in this category</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((rel) => {
                const firstMappedCat = rel.categories?.find((c) => CATEGORY_SLUG_MAP[c])
                const catLabel = firstMappedCat
                  ? CATEGORY_SLUG_MAP[firstMappedCat].split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                  : null
                return (
                  <Link
                    key={rel.id}
                    href={`/providers/${rel.slug}`}
                    className="block overflow-hidden bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <ProviderMark name={rel.name} logoUrl={rel.logo_url} className="border-b border-gray-100" />
                    <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{rel.name}</p>
                    </div>
                    {rel.state && <p className="text-xs text-gray-400">{rel.state}</p>}
                    {catLabel && <p className="text-xs text-blue-600 mt-1">{catLabel}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
