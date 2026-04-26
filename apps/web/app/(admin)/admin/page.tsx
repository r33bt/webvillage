import Link from 'next/link'

export default function AdminIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-[#1C2B28]">Admin</h1>
      <p className="mb-8 text-[#6B7C79]">Internal control surface for WebVillage.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/brand-engine"
          className="block rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-[#0F766E]"
        >
          <h2 className="mb-2 font-bold text-[#1C2B28]">Brand Engine</h2>
          <p className="text-sm text-[#6B7C79]">
            Per-client substrate — voice profiles, banned phrases, brand assets, draft history.
          </p>
        </Link>
      </div>
    </div>
  )
}
