import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { createCategorizationServiceForUser, CategorizeTransactionRequest } from '@/services/financialCategorizationService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/categorize
 * Endpoint unitário autenticado para categorização com cascata de 5 etapas.
 */
export async function POST(req: Request) {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId) {
    return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { description, amount, date, account_scope, payment_method, id, raw_id, current_category, current_subcategory } = body

    if (!description || typeof amount !== 'number' || !date) {
      return NextResponse.json(
        { success: false, error: 'Campos description, amount e date são obrigatórios.' },
        { status: 400 }
      )
    }

    const service = await createCategorizationServiceForUser({ id: userId, email: user?.email })
    const requestPayload: CategorizeTransactionRequest = {
      id,
      raw_id,
      description,
      amount,
      date,
      account_scope: account_scope || 'PF',
      payment_method,
      current_category,
      current_subcategory,
      user_id: userId
    }

    const result = await service.categorizeTransaction(requestPayload)

    return NextResponse.json({
      success: true,
      result
    })
  } catch (error: unknown) {
    console.error('Erro na rota /api/categorize:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json(
      { success: false, error: 'Falha interna ao processar categorização.' },
      { status: 500 }
    )
  }
}
