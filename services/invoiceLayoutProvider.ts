export type InvoiceBlockRole = 'posted_card_transactions' | 'financial_offer_or_summary' | 'future_installments' | 'other_or_unknown'

export interface SanitizedInvoiceBlock {
  id: string
  labels: string[]
  candidate_count: number
  exclusion_markers: string[]
}

export interface InvoiceLayoutReview {
  available: boolean
  used: boolean
  requiresReview: boolean
  decisions: Array<{ id: string, role: InvoiceBlockRole, confidence: number | null }>
}

/**
 * Sends only structural evidence to Jev. It never receives PDF text, merchant
 * names, dates, monetary values, document identifiers or card numbers.
 */
export async function reviewSanitizedInvoiceBlocks(
  profileId: string,
  blocks: SanitizedInvoiceBlock[],
  apiKey?: string
): Promise<InvoiceLayoutReview> {
  if (!apiKey || blocks.length === 0) {
    return { available: Boolean(apiKey), used: false, requiresReview: false, decisions: [] }
  }

  const endpoint = process.env.TYPESAFE_API_ENDPOINT || 'https://api.typesafe.ai/v1/systemone'
  const model = process.env.TYPESAFE_MODEL || 'jev-latest'
  const decisions: InvoiceLayoutReview['decisions'] = []

  for (const block of blocks.slice(0, 4)) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          state: {
            parser_profile: profileId,
            block: {
              structural_labels: block.labels.slice(0, 8),
              candidate_count: Math.max(0, Math.min(999, block.candidate_count)),
              exclusion_markers: block.exclusion_markers.slice(0, 8)
            }
          },
          questions: {
            block_role: {
              type: 'choice',
              instructions: 'Classifique o papel estrutural deste bloco sanitizado de uma fatura. Não infira transações nem valores.',
              criteria: {
                posted_card_transactions: 'Tabela de compras já lançadas na fatura, com evidência estrutural de linhas candidatas.',
                financial_offer_or_summary: 'Resumo administrativo, pagamento mínimo, parcelamento de fatura, juros, CET, IOF, boleto ou limite. Nunca representa uma compra.',
                future_installments: 'Compras parceladas previstas para faturas futuras. Nunca representa compra desta fatura.',
                other_or_unknown: 'Estrutura insuficiente ou outro conteúdo administrativo.'
              }
            }
          }
        }),
        signal: controller.signal
      })
      if (!response.ok) continue
      const answer = (await response.json())?.answers?.block_role
      const role = answer?.choice as InvoiceBlockRole | undefined
      const confidence = typeof answer?.confidence === 'number' ? answer.confidence : null
      if (!role || !['posted_card_transactions', 'financial_offer_or_summary', 'future_installments', 'other_or_unknown'].includes(role)) continue
      decisions.push({ id: block.id, role, confidence })
    } catch {
      // The deterministic parser remains authoritative when Jev is unavailable.
    } finally {
      clearTimeout(timeout)
    }
  }

  return {
    available: true,
    used: decisions.length > 0,
    requiresReview: decisions.some(decision => decision.role === 'other_or_unknown' || decision.confidence === null || decision.confidence < 0.7),
    decisions
  }
}
