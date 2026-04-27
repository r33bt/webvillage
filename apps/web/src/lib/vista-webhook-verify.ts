// apps/web/src/lib/vista-webhook-verify.ts
// Slice 7: HMAC-SHA256 webhook signature verification with constant-time compare.

import crypto from 'crypto'

export function verifyVistaWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false

  const secret = process.env.VISTA_WEBHOOK_SECRET
  if (!secret) {
    console.error('[vista-webhook-verify] VISTA_WEBHOOK_SECRET not set')
    return false
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

  // Strip "sha256=" prefix if present (some providers prefix; safe to handle either)
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
