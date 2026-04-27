import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase'
import { getSignedUrlsBulk } from '@/lib/be-storage'
import { uploadAsset, generateImage, softDeleteAsset } from './actions'

export const dynamic = 'force-dynamic'

interface AssetRow {
  id: string
  client_id: string
  asset_type: string
  storage_path: string | null
  file_size_bytes: number | null
  mime_type: string | null
  metadata: Record<string, unknown>
  generated_for_draft_id: string | null
  created_at: string
}

const ASSET_TYPE_GROUPS: { label: string; types: string[] }[] = [
  { label: 'Logos', types: ['logo_primary', 'logo_secondary'] },
  { label: 'Palette', types: ['palette'] },
  { label: 'Fonts', types: ['font_primary', 'font_secondary'] },
  { label: 'Photos', types: ['photo_headshot', 'photo_lifestyle'] },
  { label: 'Banners', types: ['banner_li', 'banner_x', 'banner_fb'] },
  { label: 'Mood board', types: ['mood_board'] },
  { label: 'Generated images', types: ['generated_image'] },
  { label: 'Style guide', types: ['style_guide_pdf'] },
]

const SINGLETON = new Set(['logo_primary', 'logo_secondary', 'palette', 'font_primary', 'font_secondary', 'style_guide_pdf'])
const FILE_REQUIRED = new Set(
  ['logo_primary', 'logo_secondary', 'font_primary', 'font_secondary', 'photo_headshot', 'photo_lifestyle',
   'banner_li', 'banner_x', 'banner_fb', 'mood_board', 'lora_image', 'style_guide_pdf']
)

function bytesLabel(n: number | null): string {
  if (n === null) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

export default async function AssetsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error: errorParam } = await searchParams
  const sb = createSupabaseServiceClient()

  const [{ data: client }, { data: assets }] = await Promise.all([
    sb.from('wv_be_clients').select('id, display_name').eq('id', id).is('deleted_at', null).single(),
    sb
      .from('wv_be_brand_assets')
      .select('id, client_id, asset_type, storage_path, file_size_bytes, mime_type, metadata, generated_for_draft_id, created_at')
      .eq('client_id', id)
      .is('deleted_at', null)
      .order('asset_type', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(500),
  ])

  if (!client) notFound()

  const rows = (assets ?? []) as AssetRow[]
  const pathsToSign = rows.filter((r) => r.storage_path).map((r) => r.storage_path as string)
  const urlMap = await getSignedUrlsBulk(pathsToSign)

  // Group by asset_type for display
  const byType = new Map<string, AssetRow[]>()
  for (const r of rows) {
    if (!byType.has(r.asset_type)) byType.set(r.asset_type, [])
    byType.get(r.asset_type)!.push(r)
  }

  const totalAssets = rows.length
  const totalSizeBytes = rows.reduce((s, r) => s + (r.file_size_bytes ?? 0), 0)
  const totalGenCostCents = rows
    .filter((r) => r.asset_type === 'generated_image')
    .reduce((s, r) => s + ((r.metadata?.cost_cents as number | undefined) ?? 0), 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/admin/brand-engine/${id}`} className="mb-4 inline-block text-sm text-[#0F766E] hover:underline">
        &larr; Client overview
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#0F766E]">Visual assets</p>
        <h1 className="text-2xl font-bold text-[#1C2B28]">{client.display_name}</h1>
        <p className="text-sm text-[#6B7C79]">
          {totalAssets} asset{totalAssets === 1 ? '' : 's'} · {bytesLabel(totalSizeBytes)} stored ·
          gen cost ${(totalGenCostCents / 100).toFixed(2)}
        </p>
      </div>

      {errorParam && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="mb-1 font-semibold">Last action failed</p>
          <pre className="overflow-auto whitespace-pre-wrap font-mono text-xs">{decodeURIComponent(errorParam)}</pre>
        </div>
      )}

      {/* Generate image form */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-bold text-[#1C2B28]">Generate image (Ideogram v3)</h2>
        <form action={generateImage} className="space-y-3">
          <input type="hidden" name="client_id" value={id} />
          <textarea
            name="prompt"
            required
            rows={3}
            minLength={5}
            maxLength={2000}
            placeholder="Describe the image. Brand palette + mood board (if uploaded) auto-injected. e.g.: A flat illustration of a person planting a tree, soft colour palette, calm mood, no text."
            className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6B7C79]">Aspect ratio</label>
              <select name="aspect_ratio" defaultValue="1x1" className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="1x1">1×1 (square, generic + IG feed)</option>
                <option value="16x9">16×9 (wide, YouTube)</option>
                <option value="9x16">9×16 (vertical, Reels)</option>
                <option value="4x3">4×3</option>
                <option value="3x4">3×4 (portrait)</option>
                <option value="3x2">3×2 (LI post 1.91:1 closest)</option>
                <option value="4x5">4×5 (IG portrait)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6B7C79]">Speed (cost)</label>
              <select name="rendering_speed" defaultValue="TURBO" className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="TURBO">Turbo · ~$0.04 · ~5s</option>
                <option value="DEFAULT">Default · ~$0.07 · ~10s</option>
                <option value="QUALITY">Quality · ~$0.09 · ~15s</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6B7C79]">Asset type</label>
              <select name="asset_type" defaultValue="generated_image" className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="generated_image">Generated (default)</option>
                <option value="banner_li">Banner — LinkedIn</option>
                <option value="banner_x">Banner — X</option>
                <option value="banner_fb">Banner — Facebook</option>
                <option value="photo_lifestyle">Photo — lifestyle</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <p className="text-xs text-[#6B7C79]">Daily cap: 50 generations / client. Singletons (logo, palette, etc.) replace existing only if soft-deleted first.</p>
            <button type="submit" className="rounded-lg bg-[#0F766E] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d655d]">
              Generate
            </button>
          </div>
        </form>
      </section>

      {/* Upload asset form */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-lg font-bold text-[#1C2B28]">Upload asset</h2>
        <form action={uploadAsset} encType="multipart/form-data" className="space-y-3">
          <input type="hidden" name="client_id" value={id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6B7C79]">Asset type</label>
              <select name="asset_type" required defaultValue="" className="form-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="" disabled>— select —</option>
                {ASSET_TYPE_GROUPS.flatMap((g) =>
                  g.types
                    .filter((t) => t !== 'generated_image' && t !== 'lora_image')
                    .map((t) => <option key={t} value={t}>{t}{SINGLETON.has(t) ? ' (singleton)' : ''}</option>)
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6B7C79]">File (max 15 MB; not required for palette)</label>
              <input type="file" name="file" className="block w-full text-sm text-[#1C2B28]" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#6B7C79]">Metadata (JSON, optional — required for palette)</label>
            <textarea
              name="metadata"
              rows={3}
              placeholder='Palette example: {"tokens":[{"name":"primary","hex":"#0F766E","usage":"buttons, key links"},{"name":"accent","hex":"#D97706","usage":"highlights"}]}'
              className="form-textarea w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
            />
          </div>
          <div className="flex items-center justify-end border-t border-slate-200 pt-3">
            <button type="submit" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#1C2B28] hover:bg-slate-50">
              Upload
            </button>
          </div>
        </form>
      </section>

      {/* Asset list grouped by type */}
      {totalAssets === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="mb-2 font-semibold">No brand assets yet.</p>
          <p>Upload palette JSON first (no file) — recommended structure shown above. Then upload logo + mood board images. Generation will inject these into the Ideogram prompt.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ASSET_TYPE_GROUPS.map((g) => {
            const types = g.types.filter((t) => byType.has(t))
            if (types.length === 0) return null
            return (
              <section key={g.label} className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6B7C79]">{g.label}</h2>
                <div className="space-y-3">
                  {types.flatMap((t) => byType.get(t)!.map((a) => (
                    <AssetCard key={a.id} asset={a} signedUrl={a.storage_path ? urlMap.get(a.storage_path) ?? null : null} clientId={id} />
                  )))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AssetCard({ asset, signedUrl, clientId }: { asset: AssetRow; signedUrl: string | null; clientId: string }) {
  const isImage = asset.mime_type?.startsWith('image/') ?? false
  const isPalette = asset.asset_type === 'palette'

  return (
    <div className="flex gap-4 rounded-lg border border-slate-200 bg-slate-50/30 p-3">
      <div className="flex-shrink-0">
        {isImage && signedUrl ? (
          <img src={signedUrl} alt={asset.asset_type} className="h-24 w-24 rounded border border-slate-200 object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded border border-dashed border-slate-300 bg-white text-xs text-[#6B7C79]">
            {isPalette ? 'palette' : asset.mime_type?.split('/')[1] ?? 'no-file'}
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-mono text-xs text-[#6B7C79]">{asset.asset_type}</span>
          <span className="text-xs text-[#6B7C79]">{new Date(asset.created_at).toISOString().slice(0, 16).replace('T', ' ')}</span>
        </div>
        {isPalette && asset.metadata.tokens ? (
          <div className="flex flex-wrap gap-2">
            {(asset.metadata.tokens as { name: string; hex: string; usage?: string }[]).map((tok, i) => (
              <div key={i} className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: tok.hex }} />
                <span className="font-mono">{tok.name}</span>
                <span className="text-[#6B7C79]">{tok.hex}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="line-clamp-2 text-xs text-[#1C2B28]">
            {asset.metadata.final_prompt ? (
              <>prompt: {String(asset.metadata.final_prompt).slice(0, 200)}</>
            ) : asset.metadata.original_filename ? (
              <>{String(asset.metadata.original_filename)}</>
            ) : (
              <span className="text-[#6B7C79]">{bytesLabel(asset.file_size_bytes)} · {asset.mime_type ?? '—'}</span>
            )}
          </p>
        )}
        {asset.metadata.cost_cents !== undefined && (
          <p className="mt-1 text-xs text-[#6B7C79]">
            Ideogram {String(asset.metadata.model ?? '?')} · ${((asset.metadata.cost_cents as number) / 100).toFixed(3)} · {String(asset.metadata.latency_ms ?? '?')}ms
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <form action={softDeleteAsset}>
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="asset_id" value={asset.id} />
          <button type="submit" className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-[#6B7C79] hover:border-red-300 hover:text-red-700">
            Delete
          </button>
        </form>
      </div>
    </div>
  )
}
