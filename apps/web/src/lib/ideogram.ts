// apps/web/src/lib/ideogram.ts
// Ideogram API v3 client. Per S215 Sweep 1 lock: Ideogram is the primary image-gen provider for Brand Engine.
// Docs: https://developer.ideogram.ai/api-reference/api-reference/generate-v3

export type RenderingSpeed = 'TURBO' | 'DEFAULT' | 'QUALITY'

export type AspectRatio = '1x1' | '16x9' | '9x16' | '4x3' | '3x4' | '3x2' | '2x3' | '5x4' | '4x5' | '16x10' | '10x16' | '1x3' | '3x1'

export interface IdeogramRequest {
  prompt: string
  aspect_ratio?: AspectRatio
  rendering_speed?: RenderingSpeed
  num_images?: number
  seed?: number
  style_reference_images?: string[]  // public URLs of reference images
  magic_prompt?: 'AUTO' | 'ON' | 'OFF'
  negative_prompt?: string
}

export interface IdeogramResponseImage {
  prompt: string
  resolution: string
  is_image_safe: boolean
  seed: number
  url: string
  style_type?: string
}

export interface IdeogramResponse {
  created: string
  data: IdeogramResponseImage[]
}

export class IdeogramAPIError extends Error {
  constructor(public status: number, public detail: string) {
    super(`Ideogram API error ${status}: ${detail}`)
    this.name = 'IdeogramAPIError'
  }
}

export async function generateImage(req: IdeogramRequest): Promise<IdeogramResponse> {
  const apiKey = process.env.IDEOGRAM_API_KEY
  if (!apiKey) {
    throw new Error(
      'IDEOGRAM_API_KEY not set. Set in Vercel env (production+preview) per S215 Slice 5 Q5-1 lock.'
    )
  }

  const formData = new FormData()
  formData.append('prompt', req.prompt)
  formData.append('aspect_ratio', req.aspect_ratio ?? '1x1')
  formData.append('rendering_speed', req.rendering_speed ?? 'TURBO')
  formData.append('num_images', String(req.num_images ?? 1))
  if (req.seed !== undefined) formData.append('seed', String(req.seed))
  if (req.magic_prompt) formData.append('magic_prompt', req.magic_prompt)
  if (req.negative_prompt) formData.append('negative_prompt', req.negative_prompt)
  if (req.style_reference_images && req.style_reference_images.length > 0) {
    for (const url of req.style_reference_images) {
      formData.append('style_reference_images', url)
    }
  }

  const resp = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
    method: 'POST',
    headers: { 'Api-Key': apiKey },
    body: formData,
  })

  if (!resp.ok) {
    const errText = await resp.text()
    throw new IdeogramAPIError(resp.status, errText.slice(0, 500))
  }

  return (await resp.json()) as IdeogramResponse
}

// Fetch the generated image bytes from Ideogram's temp URL (URL expires; download immediately on receipt)
export async function fetchImageBytes(url: string): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`Failed to fetch generated image: ${resp.status}`)
  }
  return {
    bytes: await resp.arrayBuffer(),
    contentType: resp.headers.get('content-type') ?? 'image/png',
  }
}
