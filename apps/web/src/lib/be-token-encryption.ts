// apps/web/src/lib/be-token-encryption.ts
// Slice 7+8: Node-side AES-256-GCM encryption for OAuth tokens.
// Deviation from spec §2.2 (which calls for pgcrypto pgp_sym_encrypt) — we use Node-side
// to avoid per-session SET app.token_key configuration. Same security guarantees.
//
// Format of ciphertext stored in DB: base64(iv ‖ authTag ‖ encrypted)
// IV: 12 bytes (GCM standard); authTag: 16 bytes; encrypted: variable.

import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12
const AUTH_TAG_LEN = 16

function getKey(): Buffer {
  const hex = process.env.VISTA_TOKEN_ENCRYPTION_KEY
  if (!hex) {
    throw new Error('VISTA_TOKEN_ENCRYPTION_KEY not set in env. Required for OAuth token encryption.')
  }
  if (hex.length !== 64) {
    throw new Error(`VISTA_TOKEN_ENCRYPTION_KEY must be 64 hex chars (32 bytes); got ${hex.length}`)
  }
  return Buffer.from(hex, 'hex')
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LEN)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decryptToken(ciphertextB64: string): string {
  const key = getKey()
  const buf = Buffer.from(ciphertextB64, 'base64')
  if (buf.length < IV_LEN + AUTH_TAG_LEN + 1) {
    throw new Error('Encrypted token too short — corrupt ciphertext')
  }
  const iv = buf.subarray(0, IV_LEN)
  const authTag = buf.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN)
  const encrypted = buf.subarray(IV_LEN + AUTH_TAG_LEN)
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(authTag)
  const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return plaintext.toString('utf8')
}
