// apps/web/src/lib/be-visual-prompt-assembly.ts
// Brand Engine Slice 5: assemble image-gen prompt from founder prompt + per-brand visual anchors
// (palette tokens + mood board references + optional logo + sanitized brand name for banners).

interface PaletteToken {
  name: string
  hex: string
  hsl?: string
  usage?: string
}

interface PaletteMetadata {
  tokens?: PaletteToken[]
  // legacy simple shape — fall through if no tokens key
  hex_primary?: string
  hex_accent?: string
  hex_neutral_bg?: string
  hex_neutral_text?: string
}

interface BrandAsset {
  id: string
  client_id: string
  asset_type: string
  storage_path: string | null
  metadata: Record<string, unknown>
}

interface AssemblyArgs {
  founderPrompt: string
  brandName: string
  assetType: string  // the asset_type being generated, drives whether to mention brand_name in prompt
  paletteAsset?: BrandAsset
  logoAsset?: BrandAsset
  moodBoardAssets?: BrandAsset[]  // already top-3 sliced by caller
  fontAsset?: BrandAsset
}

function paletteString(meta: PaletteMetadata): string | null {
  if (meta.tokens && meta.tokens.length > 0) {
    return meta.tokens
      .map((t) => `${t.name} ${t.hex}${t.usage ? ` for ${t.usage}` : ''}`)
      .join(', ')
  }
  // legacy fallback: 4 fixed slots
  if (meta.hex_primary || meta.hex_accent) {
    const parts: string[] = []
    if (meta.hex_primary) parts.push(`primary ${meta.hex_primary}`)
    if (meta.hex_accent) parts.push(`accent ${meta.hex_accent}`)
    if (meta.hex_neutral_bg) parts.push(`neutral background ${meta.hex_neutral_bg}`)
    if (meta.hex_neutral_text) parts.push(`text colour ${meta.hex_neutral_text}`)
    return parts.join(', ')
  }
  return null
}

export interface AssembledVisualPrompt {
  finalPrompt: string
  styleReferenceUrls: string[]  // mood board + logo URLs to pass to Ideogram style_reference_images
  paletteMentioned: boolean
}

export function assembleVisualPrompt(args: AssemblyArgs, signedUrls: Map<string, string>): AssembledVisualPrompt {
  const { founderPrompt, brandName, assetType, paletteAsset, logoAsset, moodBoardAssets, fontAsset } = args

  const lines: string[] = [founderPrompt.trim()]
  let paletteMentioned = false

  // Palette layer
  if (paletteAsset) {
    const palStr = paletteString(paletteAsset.metadata as PaletteMetadata)
    if (palStr) {
      lines.push(``)
      lines.push(`Brand visual style:`)
      lines.push(`- Palette: ${palStr}`)
      paletteMentioned = true
    }
  }

  // Font directive (only relevant for text-in-image asset_types)
  const isTextHeavy = ['banner_li', 'banner_x', 'banner_fb'].includes(assetType)
  if (isTextHeavy && fontAsset) {
    const fontMeta = fontAsset.metadata as { family?: string; weights?: string[] }
    if (fontMeta.family) {
      lines.push(`- Typography: ${fontMeta.family}${fontMeta.weights ? ` (weights: ${fontMeta.weights.join(', ')})` : ''}`)
    }
  }

  // Brand name reference for banners (sanitization rule applies — banners can name the brand internally)
  if (isTextHeavy && brandName) {
    lines.push(`- For: ${brandName}`)
  }

  // Mood board signal
  if ((moodBoardAssets?.length ?? 0) > 0) {
    lines.push(`- Mood board: ${moodBoardAssets!.length} reference image(s) provided`)
  }

  // Style reference URLs (logo + top mood-board images)
  const styleReferenceUrls: string[] = []
  if (logoAsset && logoAsset.storage_path) {
    const url = signedUrls.get(logoAsset.id)
    if (url) styleReferenceUrls.push(url)
  }
  for (const mb of moodBoardAssets ?? []) {
    if (mb.storage_path) {
      const url = signedUrls.get(mb.id)
      if (url) styleReferenceUrls.push(url)
    }
  }

  return {
    finalPrompt: lines.join('\n'),
    styleReferenceUrls: styleReferenceUrls.slice(0, 3),  // Ideogram caps at ~3 refs in practice
    paletteMentioned,
  }
}
