import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { FinancialCategorizationService, CategorizeTransactionRequest } from '@/services/financialCategorizationService'
import { CATEGORIZATION_CONFIG } from '@/config/categorizationConfig'

export const dynamic = 'force-dynamic'

/**
 * POST /api/categorize/batch
 * Processa lotes de transações através de fila concorrente com falha isolada e retry.
 */
export async function POST(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId) {
    return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { items, concurrency } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'O payload deve conter um array items com pelo menos 1 lançamento.' },
        { status: 400 }
      )
    }

    // Limita tamanho do lote para segurança operacional (máximo 50 por chamada)
    const MAX_BATCH_SIZE = 50
    const limitedItems = items.slice(0, MAX_BATCH_SIZE)

    const service = new FinancialCategorizationService()

    const preparedRequests: CategorizeTransactionRequest[] = limitedItems.map(item => ({
      id: item.id,
      raw_id: item.raw_id,
      description: item.description || item.desc || '',
      amount: typeof item.amount === 'number' ? item.amount : (typeof item.val === 'number' ? item.val : 0),
      date: item.date || new Date().toISOString().split('T')[0],
      account_scope: item.account_scope || item.entityType || 'PF',
      payment_method: item.payment_method || item.accountOrCard,
      current_category: item.current_category || item.category || item.cat,
      current_subcategory: item.current_subcategory || item.subcategory || item.subcat,
      user_id: userId
    }))

    const maxConcurrency = Math.min(
      concurrency || CATEGORIZATION_CONFIG.CONCURRENCY.maxConcurrentRequests,
      5
    )

    const results = await service.categorizeBatch(preparedRequests, maxConcurrency)

    // Sumário estatístico do lote
    const summary = {
      total_processed: results.length,
      auto_applied_count: results.filter(r => r.categorization_status === 'auto_applied').length,
      suggested_count: results.filter(r => r.categorization_status === 'suggested').length,
      needs_review_count: results.filter(r => r.categorization_status === 'needs_review').length,
      error_count: results.filter(r => r.categorization_status === 'error').length,
      deterministic_count: results.filter(r => r.decision_type === 'deterministic').length,
      probabilistic_count: results.filter(r => r.decision_type === 'probabilistic').length,
      estimated_cost_usd: (results.filter(r => r.source === 'jev').length * CATEGORIZATION_CONFIG.COST_ESTIMATE.perDecisionUsd).toFixed(5)
    }

    return NextResponse.json({
      success: true,
      summary,
      results
    })
  } catch (error: any) {
    console.error('Erro na rota /api/categorize/batch:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha interna ao processar lote.' },
      { status: 500 }
    )
  }
}
