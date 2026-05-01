import { redirect } from 'next/navigation'
import { getRequiredSession, getCurrentTenant } from '../../lib/auth'
import OnboardingWizard from './OnboardingWizard'

export const metadata = {
  title: 'Set up your brand — BrandHacker',
  robots: { index: false },
}

export default async function OnboardingPage() {
  const user = await getRequiredSession('/app/onboarding')
  const tenant = await getCurrentTenant(user.id)

  if (!tenant) redirect('/login?error=no_tenant')

  // Already completed — skip wizard
  if (tenant.metadata?.brand_facts && (tenant.metadata.brand_facts as { name?: string }).name) {
    redirect('/app')
  }

  const slug = (tenant.metadata?.slug as string | undefined) ?? tenant.id

  return (
    <div className="min-h-[calc(100vh-49px)] bg-zinc-950 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-50">Set up {tenant.display_name}</h1>
          <p className="mt-1 text-sm text-zinc-400">
            5 steps · under 5 minutes · your brand stays consistent everywhere after this.
          </p>
        </div>
        <OnboardingWizard tenantId={tenant.id} slug={slug} displayName={tenant.display_name} />
      </div>
    </div>
  )
}
