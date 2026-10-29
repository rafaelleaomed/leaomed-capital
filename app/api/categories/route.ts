import { NextResponse } from 'next/server'
import { sql } from '@/utils/db'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { validateCategoryLabel } from '@/utils/categoryManagement'

// Fix LE-2: Fix S-4: classe explícita para distinguir erros de validação sem inspecionar mensagem de string
class ValidationError extends Error { constructor(message: string) { super(message); this.name = 'ValidationError' } }

function validated(value: unknown, fieldName: string): string {
  try { return validateCategoryLabel(value, fieldName) } catch (error) { throw new ValidationError(error instanceof Error ? error.message : `${fieldName} inválida.`) }
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const rows = await sql`
      WITH scoped_items AS (
        SELECT category, subcategory, 1::bigint AS item_count
        FROM public.transactions
        WHERE user_id = ${userId}
        UNION ALL
        SELECT category, subcategory, 0::bigint AS item_count
        FROM public.category_rules
        WHERE user_id = ${userId}
      )
      SELECT category, subcategory, SUM(item_count)::int AS transaction_count
      FROM scoped_items
      WHERE NULLIF(TRIM(category), '') IS NOT NULL
      GROUP BY category, subcategory
      ORDER BY LOWER(category), LOWER(COALESCE(subcategory, ''))
    `
    return NextResponse.json({ success: true, items: rows })
  } catch (error) {
    console.error('Erro ao consultar categorias do usuário:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json({ success: false, error: 'Falha ao consultar categorias.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const action = body?.action

    if (action === 'rename_category' || action === 'merge_category') {
      const sourceCategory = validated(body.sourceCategory, 'Categoria de origem')
      const targetCategory = validated(body.targetCategory, 'Categoria de destino')
      if (sourceCategory.toLocaleLowerCase('pt-BR') === targetCategory.toLocaleLowerCase('pt-BR')) {
        return NextResponse.json({ success: false, error: 'Escolha categorias diferentes.' }, { status: 400 })
      }

      const result = await sql`
        WITH updated_transactions AS (
          UPDATE public.transactions
          SET category = ${targetCategory}
          WHERE user_id = ${userId} AND REGEXP_REPLACE(LOWER(TRIM(category)), '\\s+', ' ', 'g') = REGEXP_REPLACE(LOWER(${sourceCategory}), '\\s+', ' ', 'g')
          RETURNING id
        ), updated_rules AS (
          UPDATE public.category_rules
          SET category = ${targetCategory}, updated_at = NOW()
          WHERE user_id = ${userId} AND REGEXP_REPLACE(LOWER(TRIM(category)), '\\s+', ' ', 'g') = REGEXP_REPLACE(LOWER(${sourceCategory}), '\\s+', ' ', 'g')
          RETURNING id
        )
        SELECT
          (SELECT COUNT(*)::int FROM updated_transactions) AS transaction_count,
          (SELECT COUNT(*)::int FROM updated_rules) AS rule_count
      `
      return NextResponse.json({ success: true, ...result[0] })
    }

    if (action === 'rename_subcategory' || action === 'merge_subcategory') {
      const sourceCategory = validated(body.sourceCategory, 'Categoria de origem')
      const sourceSubcategory = validated(body.sourceSubcategory, 'Subcategoria de origem')
      const targetCategory = validated(body.targetCategory || sourceCategory, 'Categoria de destino')
      const targetSubcategory = validated(body.targetSubcategory, 'Subcategoria de destino')
      if (
        sourceCategory.toLocaleLowerCase('pt-BR') === targetCategory.toLocaleLowerCase('pt-BR') &&
        sourceSubcategory.toLocaleLowerCase('pt-BR') === targetSubcategory.toLocaleLowerCase('pt-BR')
      ) {
        return NextResponse.json({ success: false, error: 'Escolha uma subcategoria de destino diferente.' }, { status: 400 })
      }

      const result = await sql`
        WITH updated_transactions AS (
          UPDATE public.transactions
          SET category = ${targetCategory}, subcategory = ${targetSubcategory}
          WHERE user_id = ${userId}
            AND REGEXP_REPLACE(LOWER(TRIM(category)), '\\s+', ' ', 'g') = REGEXP_REPLACE(LOWER(${sourceCategory}), '\\s+', ' ', 'g')
            AND REGEXP_REPLACE(LOWER(TRIM(subcategory)), '\\s+', ' ', 'g') = REGEXP_REPLACE(LOWER(${sourceSubcategory}), '\\s+', ' ', 'g')
          RETURNING id
        ), updated_rules AS (
          UPDATE public.category_rules
          SET category = ${targetCategory}, subcategory = ${targetSubcategory}, updated_at = NOW()
          WHERE user_id = ${userId}
            AND REGEXP_REPLACE(LOWER(TRIM(category)), '\\s+', ' ', 'g') = REGEXP_REPLACE(LOWER(${sourceCategory}), '\\s+', ' ', 'g')
            AND REGEXP_REPLACE(LOWER(TRIM(subcategory)), '\\s+', ' ', 'g') = REGEXP_REPLACE(LOWER(${sourceSubcategory}), '\\s+', ' ', 'g')
          RETURNING id
        )
        SELECT
          (SELECT COUNT(*)::int FROM updated_transactions) AS transaction_count,
          (SELECT COUNT(*)::int FROM updated_rules) AS rule_count
      `
      return NextResponse.json({ success: true, ...result[0] })
    }

    return NextResponse.json({ success: false, error: 'Ação de categoria inválida.' }, { status: 400 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    console.error('Erro ao atualizar categorias do usuário:', error instanceof Error ? error.name : 'unknown_error')
    const message = 'Falha ao atualizar categorias.'
    const status = 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
