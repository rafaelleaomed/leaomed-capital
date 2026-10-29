import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/db'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import crypto from 'crypto'
import { canRecoverLegacyInstallments } from '@/services/installmentPersistence'

export const dynamic = 'force-dynamic'

/**
 * Gera hash único para deduplicação da transação
 */
function generateTransactionHash(t: {
  date: string
  amount: number
  description: string
  accountId?: string
  sourceAccountOrCard?: string
}): string {
  const normDesc = (t.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const source = (t.sourceAccountOrCard || '').trim().toLowerCase().replace(/\s+/g, ' ')
  // accountId is authorized against the session before hashing. Preserve the
  // existing hash format so re-importing old statements remains idempotent.
  const raw = `${t.date}|${Number(t.amount).toFixed(2)}|${normDesc}|${t.accountId || 'default'}|${source}`
  return crypto.createHash('sha256').update(raw).digest('hex')
}

/**
 * GET /api/transactions
 * Lista transações do usuário autenticado com filtros de período e paginação.
 */
export async function GET(req: NextRequest) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') // YYYY-MM
    const entity = searchParams.get('entity')?.toUpperCase() // 'PF' | 'PJ'
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 1000)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)

    let rows: any[]

    if (period) {
      const [yearStr, monthStr] = period.split('-')
      const year = parseInt(yearStr, 10)
      const month = parseInt(monthStr, 10) // 1-12
      const daysInMonth = new Date(year, month, 0).getDate()
      const startDate = `${period}-01`
      const endDate = `${period}-${String(daysInMonth).padStart(2, '0')}`

      if (entity === 'PF' || entity === 'PJ') {
        rows = await sql`
          SELECT t.id, t.account_id, t.amount, t.date, t.competence_date, t.description, t.category, t.subcategory,
                 t.is_fixed, t.is_ignored, a.type as entity_type, a.name as account_name
          FROM public.transactions t
          LEFT JOIN public.accounts a ON a.id = t.account_id AND a.user_id = t.user_id
          WHERE t.user_id = ${userId}
            AND COALESCE(t.competence_date, t.date) >= ${startDate} AND COALESCE(t.competence_date, t.date) <= ${endDate}
            AND (a.type = ${entity} OR a.type IS NULL)
          ORDER BY COALESCE(t.competence_date, t.date) DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        rows = await sql`
          SELECT t.id, t.account_id, t.amount, t.date, t.competence_date, t.description, t.category, t.subcategory,
                 t.is_fixed, t.is_ignored, a.type as entity_type, a.name as account_name
          FROM public.transactions t
          LEFT JOIN public.accounts a ON a.id = t.account_id AND a.user_id = t.user_id
          WHERE t.user_id = ${userId}
            AND COALESCE(t.competence_date, t.date) >= ${startDate} AND COALESCE(t.competence_date, t.date) <= ${endDate}
          ORDER BY COALESCE(t.competence_date, t.date) DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      rows = await sql`
        SELECT t.id, t.account_id, t.amount, t.date, t.competence_date, t.description, t.category, t.subcategory,
               t.is_fixed, t.is_ignored, a.type as entity_type, a.name as account_name
        FROM public.transactions t
        LEFT JOIN public.accounts a ON a.id = t.account_id AND a.user_id = t.user_id
        WHERE t.user_id = ${userId}
        ORDER BY COALESCE(t.competence_date, t.date) DESC, t.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json({
      success: true,
      transactions: rows,
      count: rows.length,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Erro ao buscar transactions no banco:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar transações no banco de dados.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Inserção de uma ou múltiplas transações com deduplicação atômica via hash único.
 */
export async function POST(req: NextRequest) {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    if (body.recoverLegacy && (!canRecoverLegacyInstallments(user) || body.expectedUserId !== userId)) {
      return NextResponse.json({ success: false, error: 'Recuperação indisponível para esta conta.' }, { status: 403 })
    }
    const transactionsToInsert = Array.isArray(body.transactions) ? body.transactions : [body]

    if (transactionsToInsert.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhuma transação enviada.' }, { status: 400 })
    }

    const invalidTransactionIndex = transactionsToInsert.findIndex((tx: any) => {
      const amount = Number(tx?.amount)
      return !tx?.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date) ||
        (tx.competenceDate !== undefined && (typeof tx.competenceDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tx.competenceDate))) ||
        [tx?.accountOrCard, tx?.sourceAccountOrCard].some(source => source !== undefined && (typeof source !== 'string' || source.length > 255)) ||
        !tx?.description?.trim() || !Number.isFinite(amount) || amount === 0
    })
    if (invalidTransactionIndex >= 0) {
      return NextResponse.json({
        success: false,
        error: `Lançamento inválido na posição ${invalidTransactionIndex + 1}. Informe data, descrição e valor diferente de zero.`
      }, { status: 400 })
    }

    // Validate every supplied account before any mutation, including mixed batches.
    const suppliedAccountIds = [...new Set(transactionsToInsert.map((tx: any) => tx.accountId).filter(Boolean))]
    for (const accountId of suppliedAccountIds) {
      if (typeof accountId !== 'string') {
        return NextResponse.json({ success: false, error: 'Conta inválida.' }, { status: 400 })
      }
      const ownedAccount = await sql`
        SELECT id FROM public.accounts WHERE id = ${accountId} AND user_id = ${userId}
      `
      if (ownedAccount.length === 0) {
        return NextResponse.json({ success: false, error: 'Conta não encontrada.' }, { status: 404 })
      }
    }

    if (!userId || !user?.email) return NextResponse.json({ success: false, error: 'Identidade autenticada indisponível.' }, { status: 401 })
    // Supabase Auth and the financial database are independent; create only this verified identity.
    await sql`INSERT INTO public.users (id, email) VALUES (${userId}, ${user.email}) ON CONFLICT (id) DO NOTHING`

    // Busca ou cria uma conta padrão para o usuário caso não informada
    const existingAccounts = await sql`
      SELECT id, type, pluggy_account_id FROM public.accounts WHERE user_id = ${userId}
      ORDER BY created_at ASC, id ASC
    `
    const defaultFor = (entity: 'PF' | 'PJ') => existingAccounts.find((a: any) => a.type === entity && a.pluggy_account_id === `manual_${entity.toLowerCase()}_${userId}`)?.id ||
      existingAccounts.find((a: any) => a.type === entity && !String(a.pluggy_account_id || '').startsWith('manual_source_'))?.id
    let defaultPfAccountId = defaultFor('PF')
    let defaultPjAccountId = defaultFor('PJ')

    if (!defaultPfAccountId) {
      const createdPf = await sql`
        INSERT INTO public.accounts (user_id, type, pluggy_item_id, pluggy_account_id, name, institution)
        VALUES (${userId}, 'PF', 'manual_import', ${`manual_pf_${userId}`}, 'Conta Corrente PF', 'Manual / Extrato')
        ON CONFLICT (pluggy_account_id) DO UPDATE SET name = EXCLUDED.name
        WHERE public.accounts.user_id = EXCLUDED.user_id
        RETURNING id
      `
      defaultPfAccountId = createdPf[0]?.id
    }

    if (!defaultPjAccountId) {
      const createdPj = await sql`
        INSERT INTO public.accounts (user_id, type, pluggy_item_id, pluggy_account_id, name, institution)
        VALUES (${userId}, 'PJ', 'manual_import', ${`manual_pj_${userId}`}, 'Conta Inter PJ', 'Manual / Extrato')
        ON CONFLICT (pluggy_account_id) DO UPDATE SET name = EXCLUDED.name
        WHERE public.accounts.user_id = EXCLUDED.user_id
        RETURNING id
      `
      defaultPjAccountId = createdPj[0]?.id
    }

    if (!defaultPfAccountId || !defaultPjAccountId) {
      return NextResponse.json({ success: false, error: 'Falha ao obter contas do usuário.' }, { status: 500 })
    }

    let insertedCount = 0
    let duplicateCount = 0
    let failedCount = 0
    const sourceAccounts = new Map<string, string>()

    for (const tx of transactionsToInsert) {
      if (!tx.date || tx.amount === undefined || tx.amount === null || !tx.description) {
        continue
      }

      const entityType = (tx.entityType || tx.type || 'PF').toUpperCase()
      const defaultAccountId = entityType === 'PJ' ? defaultPjAccountId : defaultPfAccountId
      const source = (tx.accountOrCard || tx.sourceAccountOrCard || '').trim()
      // Preserve the historic hash account even when repairing the persisted
      // account reference so reimporting an existing PDF does not duplicate it.
      const hashAccountId = tx.accountId || defaultAccountId
      let accountId = hashAccountId
      if (!tx.accountId && source) {
        const normalizedSource = source.toLowerCase().replace(/\s+/g, ' ')
        const sourceHash = crypto.createHash('sha256').update(normalizedSource).digest('hex')
        const sourceKey = `manual_source_${userId}_${entityType === 'PJ' ? 'pj' : 'pf'}_${sourceHash}`
        accountId = sourceAccounts.get(sourceKey)
        if (!accountId) {
          const sourceRows = await sql`
            INSERT INTO public.accounts (user_id, type, pluggy_item_id, pluggy_account_id, name, institution)
            VALUES (${userId}, ${entityType === 'PJ' ? 'PJ' : 'PF'}, 'manual_import', ${sourceKey}, ${source}, 'Manual / Extrato')
            ON CONFLICT (pluggy_account_id) DO UPDATE SET name = EXCLUDED.name
            WHERE public.accounts.user_id = EXCLUDED.user_id
            RETURNING id
          `
          accountId = sourceRows[0]?.id
          if (!accountId) return NextResponse.json({ success: false, error: 'Não foi possível vincular a origem à sua conta.' }, { status: 500 })
          sourceAccounts.set(sourceKey, accountId)
        }
      }
      const rawId = tx.id || tx.raw_id || `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const txHash = generateTransactionHash({
        date: tx.date,
        amount: Number(tx.amount),
        description: tx.description,
        accountId: hashAccountId,
        sourceAccountOrCard: source
      })

      const amount = Number(tx.amount)
      const competenceDate = tx.competenceDate || tx.date
      const category = tx.category || 'Outros'
      const subcategory = tx.subcategory || 'Geral'
      const isFixed = Boolean(tx.isFixed ?? tx.is_fixed)
      const isIgnored = Boolean(tx.isIgnored ?? tx.is_ignored)

      try {
        const res = await sql`
          INSERT INTO public.transactions (
            user_id, raw_id, account_id, amount, date, competence_date,
            description, category, subcategory, is_fixed, is_ignored, hash
          ) VALUES (
            ${userId}, ${rawId}, ${accountId}, ${amount}, ${tx.date}, ${competenceDate},
            ${tx.description}, ${category}, ${subcategory}, ${isFixed}, ${isIgnored}, ${txHash}
          )
          ON CONFLICT (hash) DO UPDATE SET
            account_id = EXCLUDED.account_id,
            competence_date = EXCLUDED.competence_date,
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            is_fixed = EXCLUDED.is_fixed,
            is_ignored = EXCLUDED.is_ignored
          WHERE public.transactions.user_id = EXCLUDED.user_id
          RETURNING id
        `
        if (res && res.length > 0) insertedCount++
        else failedCount++ // A conflict owned by another user must never be reported as saved.
      } catch (insertErr: any) {
        if (insertErr.code === '23505') { // unique_violation
          duplicateCount++
        } else {
          console.error('Erro ao inserir transação:', insertErr instanceof Error ? insertErr.name : 'unknown_error')
          failedCount++
        }
      }
    }

    const response = {
      success: failedCount === 0,
      partial: failedCount > 0,
      insertedCount,
      duplicateCount,
      failedCount,
      message: failedCount > 0
        ? `${insertedCount} lançamentos gravados; ${failedCount} não puderam ser gravados.`
        : `${insertedCount} transações processadas com sucesso.`
    }
    return NextResponse.json(response, { status: failedCount > 0 ? 500 : 200 })
  } catch (error: any) {
    console.error('Erro na rota POST /api/transactions:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar transações no banco.' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/transactions
 * Atualiza os campos editáveis de uma transação pertencente ao usuário.
 */
export async function PATCH(req: NextRequest) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const { id, source_description, description, amount, date, category, subcategory, is_fixed, is_ignored } = body

    if (!id || typeof source_description !== 'string' || !source_description.trim()) {
      return NextResponse.json({ success: false, error: 'Lançamento e nome de origem são obrigatórios.' }, { status: 400 })
    }
    if (typeof category !== 'string' || !category.trim() || typeof subcategory !== 'string' || !subcategory.trim()) {
      return NextResponse.json({ success: false, error: 'Categoria e subcategoria são obrigatórias.' }, { status: 400 })
    }
    if (description !== undefined && (typeof description !== 'string' || !description.trim())) {
      return NextResponse.json({ success: false, error: 'Descrição inválida.' }, { status: 400 })
    }
    if (amount !== undefined && (typeof amount !== 'number' || !Number.isFinite(amount))) {
      return NextResponse.json({ success: false, error: 'Valor inválido.' }, { status: 400 })
    }
    if (date !== undefined && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
      return NextResponse.json({ success: false, error: 'Data inválida.' }, { status: 400 })
    }

    const updated = await sql`
      WITH owned_target AS (
        SELECT id
        FROM public.transactions
        WHERE id = ${id} AND user_id = ${userId}
      )
      UPDATE public.transactions AS t
      SET
        description = CASE WHEN t.id = ${id} THEN COALESCE(${description?.trim()}, t.description) ELSE t.description END,
        amount = CASE WHEN t.id = ${id} THEN COALESCE(${amount}, t.amount) ELSE t.amount END,
        date = CASE WHEN t.id = ${id} THEN COALESCE(${date}, t.date) ELSE t.date END,
        competence_date = CASE WHEN t.id = ${id} THEN COALESCE(${date}, t.competence_date) ELSE t.competence_date END,
        category = ${category.trim()},
        subcategory = ${subcategory.trim()},
        is_fixed = CASE WHEN t.id = ${id} THEN COALESCE(${is_fixed}, t.is_fixed) ELSE t.is_fixed END,
        is_ignored = CASE WHEN t.id = ${id} THEN COALESCE(${is_ignored}, t.is_ignored) ELSE t.is_ignored END
      FROM owned_target
      WHERE t.user_id = ${userId}
        AND (
          t.id = owned_target.id
          OR REGEXP_REPLACE(LOWER(TRIM(t.description)), '\\s+', ' ', 'g') =
             REGEXP_REPLACE(LOWER(TRIM(${source_description})), '\\s+', ' ', 'g')
        )
      RETURNING t.id, t.description, t.amount, t.date,
                t.competence_date, t.category, t.subcategory,
                t.is_fixed, t.is_ignored
    `

    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'Lançamento não encontrado ou acesso não autorizado.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      transaction: updated.find((item: any) => item.id === id) || updated[0]
    })
  } catch (error) {
    console.error('Erro ao recategorizar lançamentos pelo nome:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json({ success: false, error: 'Falha ao atualizar lançamentos com o mesmo nome.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const { id, description, amount, date, category, subcategory, is_fixed, is_ignored } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da transação é obrigatório.' }, { status: 400 })
    }

    if (description !== undefined && (typeof description !== 'string' || !description.trim())) {
      return NextResponse.json({ success: false, error: 'Descrição inválida.' }, { status: 400 })
    }
    if (amount !== undefined && (typeof amount !== 'number' || !Number.isFinite(amount))) {
      return NextResponse.json({ success: false, error: 'Valor inválido.' }, { status: 400 })
    }
    if (date !== undefined && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
      return NextResponse.json({ success: false, error: 'Data inválida.' }, { status: 400 })
    }

    const updated = await sql`
      UPDATE public.transactions
      SET 
        description = COALESCE(${description?.trim()}, description),
        amount = COALESCE(${amount}, amount),
        date = COALESCE(${date}, date),
        competence_date = COALESCE(${date}, competence_date),
        category = COALESCE(${category}, category),
        subcategory = COALESCE(${subcategory}, subcategory),
        is_fixed = COALESCE(${is_fixed}, is_fixed),
        is_ignored = COALESCE(${is_ignored}, is_ignored)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, description, amount, date, competence_date, category, subcategory, is_fixed, is_ignored
    `

    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'Transação não encontrada ou acesso não autorizado.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, transaction: updated[0] })
  } catch (error: any) {
    console.error('Erro ao atualizar transação:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar transação.' },
      { status: 500 }
    )
  }
}
