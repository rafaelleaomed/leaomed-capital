import { NextResponse } from 'next/server'
import { sql } from '@/utils/db'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/category-rules
 * Retorna todas as regras de categorização cadastradas para o usuário autenticado.
 */
export async function GET() {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const rules = await sql`
      SELECT id, pattern, match_type, category, subcategory, subdivision, entity_type, always_apply, hit_count, created_at, updated_at
      FROM public.category_rules
      WHERE user_id = ${userId}
      ORDER BY hit_count DESC, created_at DESC
    `

    return NextResponse.json({ success: true, rules })
  } catch (error: any) {
    console.error('Erro ao buscar category_rules:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao consultar regras no banco de dados.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/category-rules
 * Salva ou sincroniza em lote regras do usuário no PostgreSQL (incluindo migração do LocalStorage).
 */
export async function POST(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()

    // Se for um array de regras (migração do localStorage)
    if (Array.isArray(body.rules)) {
      let insertedCount = 0
      for (const r of body.rules) {
        if (!r.pattern || !r.category) continue
        await sql`
          INSERT INTO public.category_rules (
            user_id, pattern, match_type, category, subcategory, subdivision, entity_type, always_apply, hit_count
          ) VALUES (
            ${userId},
            ${r.pattern.trim().toLowerCase()},
            ${r.match_type || 'contains'},
            ${r.category},
            ${r.subcategory || 'Outros'},
            ${r.subdivision || null},
            ${r.entity_type || r.entityType || 'PF'},
            ${r.always_apply ?? r.alwaysApply ?? true},
            ${r.hit_count || r.hitCount || 1}
          )
          ON CONFLICT (user_id, pattern, entity_type) 
          DO UPDATE SET
            category = EXCLUDED.category,
            subcategory = EXCLUDED.subcategory,
            subdivision = EXCLUDED.subdivision,
            hit_count = public.category_rules.hit_count + 1,
            updated_at = NOW()
        `
        insertedCount++
      }
      return NextResponse.json({ success: true, message: `${insertedCount} regras sincronizadas no PostgreSQL.` })
    }

    // Se for uma regra unitária
    const { pattern, match_type, category, subcategory, subdivision, entity_type, always_apply } = body

    if (!pattern || !category) {
      return NextResponse.json(
        { success: false, error: 'Campos pattern e category são obrigatórios.' },
        { status: 400 }
      )
    }

    const cleanPattern = pattern.trim().toLowerCase()
    const scope = entity_type || 'PF'

    const inserted = await sql`
      INSERT INTO public.category_rules (
        user_id, pattern, match_type, category, subcategory, subdivision, entity_type, always_apply, hit_count
      ) VALUES (
        ${userId},
        ${cleanPattern},
        ${match_type || 'contains'},
        ${category},
        ${subcategory || 'Outros'},
        ${subdivision || null},
        ${scope},
        ${always_apply ?? true},
        1
      )
      ON CONFLICT (user_id, pattern, entity_type) 
      DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        subdivision = EXCLUDED.subdivision,
        hit_count = public.category_rules.hit_count + 1,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({ success: true, rule: inserted[0] })
  } catch (error: any) {
    console.error('Erro ao salvar category_rule:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar regra de categorização.' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/category-rules
 * Remove uma regra pelo ID.
 */
export async function DELETE(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const { searchParams } = new URL(req.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json({ success: false, error: 'ID da regra não fornecido.' }, { status: 400 })
    }

    await sql`
      DELETE FROM public.category_rules
      WHERE id = ${ruleId} AND user_id = ${userId}
    `

    return NextResponse.json({ success: true, message: 'Regra excluída com sucesso.' })
  } catch (error: any) {
    console.error('Erro ao deletar category_rule:', error)
    return NextResponse.json({ success: false, error: 'Falha ao deletar regra.' }, { status: 500 })
  }
}
