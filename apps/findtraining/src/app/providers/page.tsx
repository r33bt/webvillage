import { fetchProviders } from '@webvillage/engine'
import { DirectoryGrid } from '@webvillage/engine'
import { SITE_ID } from '@/lib/site'

export const metadata = {
  title: 'Training Providers',
  description: 'Browse all corporate training providers in Malaysia.',
}

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const limit = 24
  const offset = (page - 1) * limit

  const providers = await fetchProviders({
    siteId: SITE_ID,
    specialty: params.specialty,
    limit,
    offset,
  })

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Providers</h1>
      <p className="text-gray-500 mb-8">
        Find HRDF-registered and certified corporate training organisations in Malaysia.
      </p>
      <DirectoryGrid businesses={providers} emptyMessage="No training providers found yet." />
    </main>
  )
}
