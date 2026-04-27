// apps/web/src/lib/resend-webhook-verify.ts
// Slice 10: Resend webhook signature verification (HMAC-SHA256, constant-time compare).
// Resend uses Svix for webhook delivery; signature header is svix-signature.

import crypto from 'crypto'

export function verifyResendWebhookSignature(
  rawBody: string,
  svixSignature: string | null,
  svixId: string | null,
  svixTimestamp: string | null
): boolean {
  if (!svixSignature || !svixId || !svixTimestamp) return false

  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.error('[resend-webhook-verify] RESEND_WEBHOOK_SECRET not set')
    return false
  }

  // Svix signs: msg_id.timestamp.body → HMAC-SHA256 with secret → base64
  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`

  // Strip "whsec_" prefix from secret if Resend issued it that way
  const secretBytes = secret.startsWith('whsec_')
    ? Buffer.from(secret.slice(7), 'base64')
    : Buffer.from(secret, 'utf-8')

  const expected = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64')

  // svix-signature header format: "v1,<base64>" or "v1,<base64> v1,<base64>" (multiple versions)
  const sigVersions = svixSignature.split(' ').map((v) => v.trim())
  for (const sigVersion of sigVersions) {
    const [version, sig] = sigVersion.split(',')
    if (version !== 'v1' || !sig) continue
    try {
      const sigBuf = Buffer.from(sig, 'base64')
      const expBuf = Buffer.from(expected, 'base64')
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return true
      }
    } catch {
      continue
    }
  }
  return false
}
