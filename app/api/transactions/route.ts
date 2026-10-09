import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/db'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import crypto from 'crypto'

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
          SELECT t.id, t.account_id, t.amount, t.date, t.description, t.category, t.subcategory,
                 t.is_fixed, t.is_ignored, a.type as entity_type, a.name as account_name
          FROM public.transactions t
          LEFT JOIN public.accounts a ON a.id = t.account_id
          WHERE t.user_id = ${userId}
            AND t.date >= ${startDate} AND t.date <= ${endDate}
            AND (a.type = ${entity} OR a.type IS NULL)
          ORDER BY t.date DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      } else {
        rows = await sql`
          SELECT t.id, t.account_id, t.amount, t.date, t.description, t.category, t.subcategory,
                 t.is_fixed, t.is_ignored, a.type as entity_type, a.name as account_name
          FROM public.transactions t
          LEFT JOIN public.accounts a ON a.id = t.account_id
          WHERE t.user_id = ${userId}
            AND t.date >= ${startDate} AND t.date <= ${endDate}
          ORDER BY t.date DESC, t.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      }
    } else {
      rows = await sql`
        SELECT t.id, t.account_id, t.amount, t.date, t.description, t.category, t.subcategory,
               t.is_fixed, t.is_ignored, a.type as entity_type, a.name as account_name
        FROM public.transactions t
        LEFT JOIN public.accounts a ON a.id = t.account_id
        WHERE t.user_id = ${userId}
        ORDER BY t.date DESC, t.created_at DESC
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
    console.error('Erro ao buscar transactions no banco:', error)
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
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const transactionsToInsert = Array.isArray(body.transactions) ? body.transactions : [body]

    if (transactionsToInsert.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhuma transação enviada.' }, { status: 400 })
    }

    const invalidTransactionIndex = transactionsToInsert.findIndex((tx: any) => {
      const amount = Number(tx?.amount)
      return !tx?.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date) || !tx?.description?.trim() || !Number.isFinite(amount) || amount === 0
    })
    if (invalidTransactionIndex >= 0) {
      return NextResponse.json({
        success: false,
        error: `Lançamento inválido na posição ${invalidTransactionIndex + 1}. Informe data, descrição e valor diferente de zero.`
      }, { status: 400 })
    }

    // Busca ou cria uma conta padrão para o usuário caso não informada
    const existingAccounts = await sql`
      SELECT id, type FROM public.accounts WHERE user_id = ${userId} LIMIT 2
    `
    let defaultPfAccountId = existingAccounts.find((a: any) => a.type === 'PF')?.id
    let defaultPjAccountId = existingAccounts.find((a: any) => a.type === 'PJ')?.id

    if (!defaultPfAccountId) {
      const createdPf = await sql`
        INSERT INTO public.accounts (user_id, type, pluggy_item_id, pluggy_account_id, name, institution)
        VALUES (${userId}, 'PF', 'manual_import', ${`manual_pf_${userId}`}, 'Conta Corrente PF', 'Manual / Extrato')
        ON CONFLICT (pluggy_account_id) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `
      defaultPfAccountId = createdPf[0]?.id
    }

    if (!defaultPjAccountId) {
      const createdPj = await sql`
        INSERT INTO public.accounts (user_id, type, pluggy_item_id, pluggy_account_id, name, institution)
        VALUES (${userId}, 'PJ', 'manual_import', ${`manual_pj_${userId}`}, 'Conta Inter PJ', 'Manual / Extrato')
        ON CONFLICT (pluggy_account_id) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `
      defaultPjAccountId = createdPj[0]?.id
    }

    let insertedCount = 0
    let duplicateCount = 0
    let failedCount = 0

    for (const tx of transactionsToInsert) {
      if (!tx.date || tx.amount === undefined || tx.amount === null || !tx.description) {
        continue
      }

      const entityType = (tx.entityType || tx.type || 'PF').toUpperCase()
      const accountId = tx.accountId || (entityType === 'PJ' ? defaultPjAccountId : defaultPfAccountId)
      const rawId = tx.id || tx.raw_id || `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const txHash = generateTransactionHash({
        date: tx.date,
        amount: Number(tx.amount),
        description: tx.description,
        accountId,
        sourceAccountOrCard: tx.accountOrCard || tx.sourceAccountOrCard
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
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            is_fixed = EXCLUDED.is_fixed,
            is_ignored = EXCLUDED.is_ignored
          RETURNING id
        `
        if (res && res.length > 0) insertedCount++
      } catch (insertErr: any) {
        if (insertErr.code === '23505') { // unique_violation
          duplicateCount++
        } else {
          console.error('Erro ao inserir transação:', insertErr)
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
    console.error('Erro na rota POST /api/transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar transações no banco.' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/transactions
 * Atualiza categoria, subcategoria ou status de uma transação pertencente ao usuário.
 */
export async function PUT(req: NextRequest) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const { id, category, subcategory, is_fixed, is_ignored } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da transação é obrigatório.' }, { status: 400 })
    }

    const updated = await sql`
      UPDATE public.transactions
      SET 
        category = COALESCE(${category}, category),
        subcategory = COALESCE(${subcategory}, subcategory),
        is_fixed = COALESCE(${is_fixed}, is_fixed),
        is_ignored = COALESCE(${is_ignored}, is_ignored)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, category, subcategory, is_fixed, is_ignored
    `

    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'Transação não encontrada ou acesso não autorizado.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, transaction: updated[0] })
  } catch (error: any) {
    console.error('Erro ao atualizar transação:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar transação.' },
      { status: 500 }
    )
  }
}
