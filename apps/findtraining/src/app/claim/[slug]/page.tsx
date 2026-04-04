import { notFound } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, ShieldCheck, Clock, Mail } from 'lucide-react'
import { getProviderBySlug } from '@webvillage/engine/adapters/supabase'
import { ClaimForm } from './ClaimForm'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)
  if (!provider) return {}
  return {
    title: `Claim ${provider.name} | FindTraining`,
    description: `Claim and manage the FindTraining listing for ${provider.name}.`,
    robots: { index: false },
    alternates: { canonical: `https://findtraining.com.my/claim/${slug}` },
  }
}

export default async function ClaimPage({ params }: Props) {
  const { slug } = await params
  const provider = await getProviderBySlug(slug)

  if (!provider) notFound()

  if (provider.profile_status === 'claimed') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5" style={{ backgroundColor: '#00C48C1A' }}>
            <ShieldCheck className="w-7 h-7" style={{ color: '#00C48C' }} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">This listing has been claimed</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            The listing for <span className="font-semibold">{provider.name}</span> has already been claimed.
            If you believe this is an error, contact{' '}
            <a href="mailto:hello@findtraining.com.my" className="underline" style={{ color: '#0F6FEC' }}>
              hello@findtraining.com.my
            </a>.
          </p>
          <Link href={`/providers/${provider.slug}`} className="text-sm font-medium" style={{ color: '#0F6FEC' }}>
            &larr; Back to profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-xl mx-auto">
        <nav className="text-xs text-gray-500 mb-8 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/providers/${provider.slug}`} className="hover:text-gray-700 truncate max-w-[200px]">{provider.name}</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">Claim</span>
        </nav>

        <div className="flex items-start gap-3 mb-8">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl" style={{ backgroundColor: '#0F6FEC1A' }}>
            <GraduationCap className="w-6 h-6" style={{ color: '#0F6FEC' }} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Is this your company?</p>
            <h1 className="text-xl font-bold text-gray-900">{provider.name}</h1>
            {provider.state && <p className="text-sm text-gray-500 mt-0.5">{provider.state}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Claim This Listing</h2>
          <p className="text-sm text-gray-500 mb-6">Verified listings can update contact details, add courses, and respond to enquiries.</p>
          <ClaimForm providerId={provider.id} providerName={provider.name} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">What happens next?</h2>
          <ol className="space-y-3">
            {[
              { icon: Mail, text: 'A verification email is sent to the address you provide within 24 hours.' },
              { icon: ShieldCheck, text: 'Our team manually reviews your claim to prevent abuse.' },
              { icon: GraduationCap, text: 'Once approved, your profile is unlocked — update contact info, add courses, and upload your logo.' },
              { icon: Clock, text: 'Review typically takes 1–2 business days.' },
            ].map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white mt-0.5" style={{ backgroundColor: '#0F6FEC' }} aria-hidden="true">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  {text}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
