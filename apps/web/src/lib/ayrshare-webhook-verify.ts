// apps/web/src/lib/ayrshare-webhook-verify.ts
// Slice 8: Ayrshare webhook signature verification (HMAC-SHA256, constant-time compare).
// Mirrors Slice 7's vista-webhook-verify pattern.

import crypto from 'crypto'

export function verifyAyrshareWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false

  const secret = process.env.AYRSHARE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[ayrshare-webhook-verify] AYRSHARE_WEBHOOK_SECRET not set')
    return false
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const normalized = signature.startsWith('sha256=') ? signature.slice(7) : signature

  let sigBuf: Buffer
  let expBuf: Buffer
  try {
    sigBuf = Buffer.from(normalized, 'hex')
    expBuf = Buffer.from(expected, 'hex')
  } catch {
    return false
  }
  if (sigBuf.length !== expBuf.length) return false
  return crypto.timingSafeEqual(sigBuf, expBuf)
}
