import crypto from 'crypto'
import { sql } from '@/utils/db'

const OWNER_EMAIL_ENV = 'JEV_PLATFORM_OWNER_EMAIL'
const OWNER_USER_ID_ENV = 'JEV_PLATFORM_OWNER_USER_ID'
const CREDENTIAL_KEY_ENV = 'JEV_CREDENTIAL_ENCRYPTION_KEY'
const CREDENTIAL_KEY_VERSION = 1

export type JevAccessSource = 'platform_owner' | 'user_managed' | 'disabled'

export interface JevAccess {
  enabled: boolean
  source: JevAccessSource
  apiKey?: string
}

interface EncryptedCredentialRow {
  api_key_ciphertext: string
  encryption_iv: string
  encryption_tag: string
  key_version: number
}

function normalizedOwnerEmail(): string {
  return (process.env[OWNER_EMAIL_ENV] || '').trim().toLowerCase()
}

function isPlatformOwner(user: { id: string, email?: string | null }): boolean {
  const ownerEmail = normalizedOwnerEmail()
  const configuredOwnerId = (process.env[OWNER_USER_ID_ENV] || '').trim()
  const hasRequiredEmail = Boolean(ownerEmail && user.email && ownerEmail === user.email.trim().toLowerCase())
  return hasRequiredEmail && (!configuredOwnerId || configuredOwnerId === user.id)
}

function encryptionKey(): Buffer {
  const encoded = process.env[CREDENTIAL_KEY_ENV]
  if (!encoded) throw new Error(`${CREDENTIAL_KEY_ENV} não configurada.`)
  const key = Buffer.from(encoded, 'base64')
  if (key.length !== 32) throw new Error(`${CREDENTIAL_KEY_ENV} deve conter uma chave base64 de 32 bytes.`)
  return key
}

function encryptApiKey(apiKey: string, userId: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  cipher.setAAD(Buffer.from(`${userId}|typesafe|${CREDENTIAL_KEY_VERSION}`, 'utf8'))
  const ciphertext = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()])
  return {
    api_key_ciphertext: ciphertext.toString('base64'),
    encryption_iv: iv.toString('base64'),
    encryption_tag: cipher.getAuthTag().toString('base64'),
    key_fingerprint: crypto.createHash('sha256').update(apiKey).digest('hex'),
    key_version: CREDENTIAL_KEY_VERSION
  }
}

function decryptApiKey(row: EncryptedCredentialRow, userId: string): string {
  if (row.key_version !== CREDENTIAL_KEY_VERSION) throw new Error('Versão de criptografia não suportada.')
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(row.encryption_iv, 'base64'))
  decipher.setAAD(Buffer.from(`${userId}|typesafe|${row.key_version}`, 'utf8'))
  decipher.setAuthTag(Buffer.from(row.encryption_tag, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(row.api_key_ciphertext, 'base64')),
    decipher.final()
  ]).toString('utf8')
}

export async function getJevAccessForUser(user: { id: string, email?: string | null }): Promise<JevAccess> {
  if (process.env.ENABLE_JEV_CATEGORIZATION === 'false') return { enabled: false, source: 'disabled' }
  if (isPlatformOwner(user) && process.env.TYPESAFE_API_KEY) {
    return { enabled: true, source: 'platform_owner', apiKey: process.env.TYPESAFE_API_KEY }
  }

  try {
    const rows = await sql`
      SELECT api_key_ciphertext, encryption_iv, encryption_tag, key_version
      FROM public.user_jev_credentials
      WHERE user_id = ${user.id}
      LIMIT 1
    ` as EncryptedCredentialRow[]
    const credential = rows[0]
    if (!credential) return { enabled: false, source: 'disabled' }
    const apiKey = decryptApiKey(credential, user.id)
    return apiKey ? { enabled: true, source: 'user_managed', apiKey } : { enabled: false, source: 'disabled' }
  } catch {
    // Absence of the optional table, malformed stored material or a missing
    // encryption key disables AI safely without leaking credential details.
    return { enabled: false, source: 'disabled' }
  }
}

export async function getJevAccessStatusForUser(user: { id: string, email?: string | null }): Promise<{
  enabled: boolean
  source: JevAccessSource
  acceptsPersonalKey: boolean
}> {
  const access = await getJevAccessForUser(user)
  return {
    enabled: access.enabled,
    source: access.source,
    acceptsPersonalKey: !isPlatformOwner(user)
  }
}

export async function savePersonalJevKey(user: { id: string, email?: string | null }, apiKey: string): Promise<void> {
  if (isPlatformOwner(user)) throw new Error('A conta proprietária usa a credencial da plataforma.')
  const key = apiKey.trim()
  if (key.length < 16 || key.length > 512 || /\s/.test(key)) throw new Error('Chave da API inválida.')
  const encrypted = encryptApiKey(key, user.id)
  const email = user.email?.trim().toLowerCase()
  if (!email) throw new Error('E-mail autenticado indisponível.')

  // The financial database is independent of Supabase Auth. Ensure the
  // authenticated identity exists locally before satisfying the FK below.
  await sql`
    INSERT INTO public.users (id, email)
    VALUES (${user.id}, ${email})
    ON CONFLICT (id) DO NOTHING
  `
  await sql`
    INSERT INTO public.user_jev_credentials (
      user_id, api_key_ciphertext, encryption_iv, encryption_tag, key_fingerprint, key_version, updated_at
    ) VALUES (
      ${user.id}, ${encrypted.api_key_ciphertext}, ${encrypted.encryption_iv}, ${encrypted.encryption_tag}, ${encrypted.key_fingerprint}, ${encrypted.key_version}, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      api_key_ciphertext = EXCLUDED.api_key_ciphertext,
      encryption_iv = EXCLUDED.encryption_iv,
      encryption_tag = EXCLUDED.encryption_tag,
      key_fingerprint = EXCLUDED.key_fingerprint,
      key_version = EXCLUDED.key_version,
      updated_at = NOW()
  `
}

export async function deletePersonalJevKey(user: { id: string }): Promise<void> {
  await sql`DELETE FROM public.user_jev_credentials WHERE user_id = ${user.id}`
}
