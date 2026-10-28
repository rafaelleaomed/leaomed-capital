import { timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import type { NeonQueryFunctionInTransaction } from '@neondatabase/serverless'
import { sql } from '@/utils/db'

export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.I10_MIGRATION_TOKEN
  const provided = request.headers.get('x-admin-secret') || ''
  if (!expected || expected.length < 24 || !provided) return false

  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(provided)
  return expectedBuffer.length === providedBuffer.length
    && timingSafeEqual(expectedBuffer, providedBuffer)
}

function migrationConfig() {
  const email = process.env.I10_MIGRATION_USER_EMAIL?.trim().toLowerCase()
  const walletId = process.env.I10_MIGRATION_WALLET_ID?.trim()
  if (!email || !/^\d{5,15}$/.test(walletId || '')) return null
  return { email, walletId: walletId as string }
}

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401, headers: NO_STORE })
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized()
  const config = migrationConfig()
  if (!config) {
    return NextResponse.json({ success: false, error: 'Configuração indisponível.' }, { status: 503, headers: NO_STORE })
  }

  try {
    const [columns, users] = await Promise.all([
      sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
      `,
      sql`
        SELECT
          u.id,
          u.email,
          to_jsonb(u) ->> 'investidor10_wallet_id' AS previous_wallet_id
        FROM public.users u
        WHERE lower(u.email) = lower(${config.email})
      `,
    ])
    if (users.length !== 1) {
      return NextResponse.json({ success: false, error: 'Usuário alvo não identificado de forma única.' }, { status: 409, headers: NO_STORE })
    }

    return NextResponse.json({ captured_at: new Date().toISOString(), columns, target_user: users[0] }, { headers: NO_STORE })
  } catch (error) {
    console.error('[temporary i10 migration backup]', error)
    return NextResponse.json({ success: false, error: 'Falha ao criar backup.' }, { status: 500, headers: NO_STORE })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized()
  const config = migrationConfig()
  if (!config) {
    return NextResponse.json({ success: false, error: 'Configuração indisponível.' }, { status: 503, headers: NO_STORE })
  }

  try {
    const users = await sql`
      SELECT id
      FROM public.users
      WHERE lower(email) = lower(${config.email})
    `
    if (users.length !== 1) {
      return NextResponse.json({ success: false, error: 'Usuário alvo não identificado de forma única.' }, { status: 409, headers: NO_STORE })
    }
    const targetId = users[0].id

    const results = await sql.transaction((txn: NeonQueryFunctionInTransaction<false, false>) => [
      txn`SET LOCAL lock_timeout = '5s'`,
      txn`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS investidor10_wallet_id TEXT`,
      txn`
        DO $migration$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'users_investidor10_wallet_id_format'
              AND conrelid = 'public.users'::regclass
          ) THEN
            ALTER TABLE public.users
            ADD CONSTRAINT users_investidor10_wallet_id_format
            CHECK (investidor10_wallet_id IS NULL OR investidor10_wallet_id ~ '^[0-9]{5,15}$');
          END IF;
        END
        $migration$
      `,
      txn`CREATE UNIQUE INDEX IF NOT EXISTS users_investidor10_wallet_id_unique ON public.users (investidor10_wallet_id) WHERE investidor10_wallet_id IS NOT NULL`,
      txn`COMMENT ON COLUMN public.users.investidor10_wallet_id IS 'ID numérico da carteira restrita ou pública do Investidor10. Isolado por user_id.'`,
      txn`
        UPDATE public.users
        SET investidor10_wallet_id = ${config.walletId}
        WHERE id = ${targetId} AND lower(email) = lower(${config.email})
        RETURNING id
      `,
      txn`
        SELECT
          COUNT(*) FILTER (WHERE id = ${targetId} AND investidor10_wallet_id = ${config.walletId})::int AS target_ok,
          COUNT(*) FILTER (WHERE id <> ${targetId} AND investidor10_wallet_id = ${config.walletId})::int AS other_users_with_same_wallet
        FROM public.users
      `,
    ], { isolationLevel: 'Serializable' })

    const updated = results[5]
    if (updated.length !== 1) {
      return NextResponse.json({ success: false, error: 'Migração não aplicada ao usuário alvo.' }, { status: 409, headers: NO_STORE })
    }

    const verification = results[6]
    const targetOk = Number(verification[0]?.target_ok) === 1
    const otherUsers = Number(verification[0]?.other_users_with_same_wallet ?? -1)
    if (!targetOk || otherUsers !== 0) {
      return NextResponse.json({ success: false, error: 'A verificação de isolamento falhou.' }, { status: 500, headers: NO_STORE })
    }

    return NextResponse.json({ success: true, target_ok: true, other_users_with_same_wallet: 0 }, { headers: NO_STORE })
  } catch (error) {
    console.error('[temporary i10 migration apply]', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json({ success: false, error: 'Falha ao aplicar migração.' }, { status: 500, headers: NO_STORE })
  }
}
