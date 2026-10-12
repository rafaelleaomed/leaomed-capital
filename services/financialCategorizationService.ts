import crypto from 'crypto'
import { sql } from '@/utils/db'
import { CATEGORIZATION_CONFIG, isSensitiveCategory } from '@/config/categorizationConfig'
import { 
  IFinancialCategorizationProvider, 
  JevCategorizationProvider, 
  DisabledCategorizationProvider,
  SanitizedTransactionInput,
  CategorizationDecision
} from './financialCategorizationProvider'
import { getJevAccessForUser } from './userJevAccess'

export interface CategorizeTransactionRequest {
  id?: string
  raw_id?: string
  description: string
  amount: number
  date: string
  account_scope: 'PF' | 'PJ'
  payment_method?: string
  current_category?: string
  current_subcategory?: string
  user_id: string
}

export interface CategorizationResult {
  transaction_id?: string
  original_description: string
  sanitized_description: string
  applied_category: string
  applied_subcategory: string
  suggested_category: string
  suggested_subcategory: string
  decision_type: 'deterministic' | 'probabilistic'
  certainty_label: string
  choice_confidence: number | null
  is_fixed_probability: number | null
  needs_review_probability: number | null
  is_fixed: boolean
  review_required: boolean
  categorization_status: 'pending' | 'suggested' | 'confirmed' | 'auto_applied' | 'needs_review' | 'rejected' | 'error'
  source: 'manual' | 'local_rule' | 'jev' | 'llm' | 'imported' | 'unknown'
  provider: string
  latency_ms: number
  error_message?: string
}

export class FinancialCategorizationService {
  private provider: IFinancialCategorizationProvider

  constructor(provider?: IFinancialCategorizationProvider) {
    if (provider) {
      this.provider = provider
    } else {
      this.provider = new DisabledCategorizationProvider()
    }
  }

  /**
   * Sanitiza a descrição removendo CPFs, números de cartão, telefones e termos confidenciais
   */
  static sanitizeDescription(raw: string): string {
    if (!raw) return ''
    let clean = raw.trim()

    // Remove CPF (xxx.xxx.xxx-xx ou 11 dígitos seguidos)
    clean = clean.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF_OCULTADO]')
    
    // Remove números de cartão (16 dígitos ou blocos de 4 dígitos)
    clean = clean.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[CARTAO_OCULTADO]')
    
    // Remove tokens de autorização longos hex/alfanuméricos
    clean = clean.replace(/\b[0-9a-fA-F]{24,64}\b/g, '')
    clean = clean.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL_OCULTADO]')
    clean = clean.replace(/\b(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-\s]?\d{4}\b/g, '[TELEFONE_OCULTADO]')

    // Remove múltiplos espaços
    clean = clean.replace(/\s+/g, ' ').trim()

    return clean
  }

  /**
   * Gera hash SHA-256 exclusivo para identificação e cache de decisão
   */
  static generateInputHash(input: { description: string; amount: number; date: string; scope: string }): string {
    const payloadStr = `${input.description.toLowerCase().trim()}|${input.amount.toFixed(2)}|${input.date}|${input.scope}`
    return crypto.createHash('sha256').update(payloadStr).digest('hex')
  }

  /**
   * Cascata de Categorização de 1 Lançamento
   */
  async categorizeTransaction(req: CategorizeTransactionRequest): Promise<CategorizationResult> {
    const startTime = Date.now()
    const sanitizedDesc = FinancialCategorizationService.sanitizeDescription(req.description)
    const lowerDesc = sanitizedDesc.toLowerCase()
    const inputHash = FinancialCategorizationService.generateInputHash({
      description: sanitizedDesc,
      amount: req.amount,
      date: req.date,
      scope: req.account_scope
    })

    // Se a transação já foi categorizada manualmente pelo usuário, NUNCA sobrescreve
    if (req.current_category && req.current_category !== 'NÃO_IDENTIFICADO' && req.current_category !== 'Pendente') {
      return {
        transaction_id: req.id,
        original_description: req.description,
        sanitized_description: sanitizedDesc,
        applied_category: req.current_category,
        applied_subcategory: req.current_subcategory || 'Outros',
        suggested_category: req.current_category,
        suggested_subcategory: req.current_subcategory || 'Outros',
        decision_type: 'deterministic',
        certainty_label: 'categorização manual prévia',
        choice_confidence: null,
        is_fixed_probability: null,
        needs_review_probability: null,
        is_fixed: false,
        review_required: false,
        categorization_status: 'confirmed',
        source: 'manual',
        provider: 'user',
        latency_ms: 0
      }
    }

    // -------------------------------------------------------------
    // ETAPA 1 & 2: Regras Persistidas no PostgreSQL (category_rules)
    // -------------------------------------------------------------
    try {
      const userRules = await sql`
        SELECT pattern, match_type, category, subcategory, subdivision, is_fixed, always_apply
        FROM public.category_rules
        WHERE user_id = ${req.user_id} AND entity_type = ${req.account_scope} AND always_apply = TRUE
        ORDER BY created_at DESC
      `

      // 1. Regra Exata
      const exactMatch = userRules.find((r: any) => r.pattern?.toLowerCase().trim() === lowerDesc)
      if (exactMatch) {
        return {
          transaction_id: req.id,
          original_description: req.description,
          sanitized_description: sanitizedDesc,
          applied_category: exactMatch.category,
          applied_subcategory: exactMatch.subcategory,
          suggested_category: exactMatch.category,
          suggested_subcategory: exactMatch.subcategory,
          decision_type: 'deterministic',
          certainty_label: 'regra local exata',
          choice_confidence: null,
          is_fixed_probability: null,
          needs_review_probability: null,
          is_fixed: Boolean(exactMatch.is_fixed),
          review_required: isSensitiveCategory(exactMatch.category, exactMatch.subcategory),
          categorization_status: isSensitiveCategory(exactMatch.category, exactMatch.subcategory) ? 'needs_review' : 'auto_applied',
          source: 'local_rule',
          provider: 'postgres_rules',
          latency_ms: Date.now() - startTime
        }
      }

      // 2. Regra de Estabelecimento (Substring / Contains)
      const substringMatch = userRules.find((r: any) => lowerDesc.includes(r.pattern?.toLowerCase().trim()))
      if (substringMatch) {
        return {
          transaction_id: req.id,
          original_description: req.description,
          sanitized_description: sanitizedDesc,
          applied_category: substringMatch.category,
          applied_subcategory: substringMatch.subcategory,
          suggested_category: substringMatch.category,
          suggested_subcategory: substringMatch.subcategory,
          decision_type: 'deterministic',
          certainty_label: 'regra memorizada',
          choice_confidence: null,
          is_fixed_probability: null,
          needs_review_probability: null,
          is_fixed: Boolean(substringMatch.is_fixed),
          review_required: isSensitiveCategory(substringMatch.category, substringMatch.subcategory),
          categorization_status: isSensitiveCategory(substringMatch.category, substringMatch.subcategory) ? 'needs_review' : 'auto_applied',
          source: 'local_rule',
          provider: 'postgres_rules',
          latency_ms: Date.now() - startTime
        }
      }
    } catch (dbErr) {
      console.warn('[FinancialCategorizationService] Aviso ao consultar category_rules no Postgres:', dbErr instanceof Error ? dbErr.name : 'unknown_error')
    }

    // -------------------------------------------------------------
    // ETAPA 2.5: Memória de Categorização Passada (Hit Histórico Idêntico)
    // Se o usuário já categorizou uma transação com a mesmíssima descrição no passado
    // -------------------------------------------------------------
    try {
      const pastTx = await sql`
        SELECT category, subcategory, is_fixed_expense
        FROM public.transactions
        WHERE user_id = ${req.user_id} 
          AND account_id IN (SELECT id FROM public.accounts WHERE type = ${req.account_scope} AND user_id = ${req.user_id})
          AND LOWER(description) = ${lowerDesc}
          AND category IS NOT NULL 
          AND category != 'Pendente'
          AND category != 'NÃO_IDENTIFICADO'
        ORDER BY date DESC
        LIMIT 1
      `;
      if (pastTx && pastTx.length > 0) {
        const pTx = pastTx[0];
        return {
          transaction_id: req.id,
          original_description: req.description,
          sanitized_description: sanitizedDesc,
          applied_category: pTx.category,
          applied_subcategory: pTx.subcategory,
          suggested_category: pTx.category,
          suggested_subcategory: pTx.subcategory,
          decision_type: 'deterministic',
          certainty_label: 'hit histórico',
          choice_confidence: null,
          is_fixed_probability: null,
          needs_review_probability: null,
          is_fixed: Boolean(pTx.is_fixed_expense),
          review_required: false, // JEV sugere direto com base no histórico
          categorization_status: 'auto_applied',
          source: 'local_rule',
          provider: 'postgres_rules',
          latency_ms: Date.now() - startTime
        };
      }
    } catch (dbErr) {
       console.warn('[FinancialCategorizationService] Aviso ao consultar hit histórico:', dbErr instanceof Error ? dbErr.name : 'unknown_error');
    }

    // -------------------------------------------------------------
    // ETAPA 3: Heurística Local Especializada (Padrões Médicos/Comerciais)
    // -------------------------------------------------------------
    const heuristicMatch = this.checkLocalHeuristics(lowerDesc, req.account_scope)
    if (heuristicMatch) {
      return {
        transaction_id: req.id,
        original_description: req.description,
        sanitized_description: sanitizedDesc,
        applied_category: heuristicMatch.category,
        applied_subcategory: heuristicMatch.subcategory,
        suggested_category: heuristicMatch.category,
        suggested_subcategory: heuristicMatch.subcategory,
        decision_type: 'deterministic',
        certainty_label: 'heurística local',
        choice_confidence: null,
        is_fixed_probability: null,
        needs_review_probability: null,
        is_fixed: heuristicMatch.is_fixed,
        review_required: heuristicMatch.review_required,
        categorization_status: heuristicMatch.review_required ? 'needs_review' : 'auto_applied',
        source: 'local_rule',
        provider: 'local_heuristics',
        latency_ms: Date.now() - startTime
      }
    }

    // -------------------------------------------------------------
    // ETAPA 4: Jev (TypeSafe AI) — Chamada Estruturada
    // -------------------------------------------------------------
    const sanitizedInput: SanitizedTransactionInput = {
      description: sanitizedDesc,
      amount: req.amount,
      date: req.date,
      account_scope: req.account_scope,
      payment_method: req.payment_method
    }

    const jevDecision = await this.provider.classify(sanitizedInput)

    // Auditoria assíncrona no PostgreSQL
    if (jevDecision.provider !== 'disabled') {
      this.logAiAuditAsync({
        user_id: req.user_id,
        transaction_id: req.id,
        input_hash: inputHash,
        sanitized_input: CATEGORIZATION_CONFIG.PRIVACY.storeAiInputs ? sanitizedInput : null,
        decision: jevDecision
      })
    }

    const isSensitive = isSensitiveCategory(jevDecision.category, jevDecision.subcategory)
    const reviewRequired = jevDecision.review_required || isSensitive || (jevDecision.choice_confidence !== null && jevDecision.choice_confidence < CATEGORIZATION_CONFIG.THRESHOLDS.lowConfidence)

    // No Modo Sombra (Shadow Mode), nunca altera a categoria real da transação
    // Grava como 'suggested' ou 'needs_review'
    return {
      transaction_id: req.id,
      original_description: req.description,
      sanitized_description: sanitizedDesc,
      applied_category: CATEGORIZATION_CONFIG.SHADOW_MODE ? (req.current_category || 'Pendente') : (reviewRequired ? 'Pendente' : jevDecision.category),
      applied_subcategory: CATEGORIZATION_CONFIG.SHADOW_MODE ? (req.current_subcategory || 'Pendente') : (reviewRequired ? 'Pendente' : jevDecision.subcategory),
      suggested_category: jevDecision.category,
      suggested_subcategory: jevDecision.subcategory,
      decision_type: jevDecision.decision_type,
      certainty_label: jevDecision.certainty_label,
      choice_confidence: jevDecision.choice_confidence,
      is_fixed_probability: jevDecision.is_fixed_probability,
      needs_review_probability: jevDecision.needs_review_probability,
      is_fixed: jevDecision.is_fixed,
      review_required: reviewRequired,
      categorization_status: reviewRequired ? 'needs_review' : 'suggested',
      source: jevDecision.provider === 'jev' ? 'jev' : 'unknown',
      provider: jevDecision.provider,
      latency_ms: jevDecision.latency_ms,
      error_message: jevDecision.error_message
    }
  }

  /**
   * Processamento em Lote com Fila e Limite Estrito de Concorrência
   */
  async categorizeBatch(
    items: CategorizeTransactionRequest[],
    concurrency = CATEGORIZATION_CONFIG.CONCURRENCY.maxConcurrentRequests
  ): Promise<CategorizationResult[]> {
    const results: CategorizationResult[] = new Array(items.length)
    let currentIndex = 0

    const worker = async () => {
      while (currentIndex < items.length) {
        const index = currentIndex++
        try {
          results[index] = await this.categorizeTransaction(items[index])
        } catch (err: any) {
          results[index] = {
            transaction_id: items[index].id,
            original_description: items[index].description,
            sanitized_description: FinancialCategorizationService.sanitizeDescription(items[index].description),
            applied_category: 'Pendente',
            applied_subcategory: 'Pendente',
            suggested_category: 'NÃO_IDENTIFICADO',
            suggested_subcategory: 'NÃO_IDENTIFICADO',
            decision_type: 'probabilistic',
            certainty_label: 'erro_processamento',
            choice_confidence: null,
            is_fixed_probability: null,
            needs_review_probability: 1.0,
            is_fixed: false,
            review_required: true,
            categorization_status: 'error',
            source: 'unknown',
            provider: 'error',
            latency_ms: 0,
            error_message: err?.message || 'Erro no item'
          }
        }
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
    await Promise.all(workers)

    return results
  }

  /**
   * Heurística Local Padrão Médica/Financeira
   */
  private checkLocalHeuristics(desc: string, scope: 'PF' | 'PJ'): { category: string; subcategory: string; is_fixed: boolean; review_required: boolean } | null {
    if (scope === 'PJ') {
      if (desc.includes('darf') || desc.includes('simples nacional')) {
        return { category: 'Empresa - Despesas Fixas', subcategory: 'DARF', is_fixed: true, review_required: true }
      }
      if (desc.includes('contabil') || desc.includes('contador')) {
        return { category: 'Empresa - Despesas Fixas', subcategory: 'Mensalidade Contabilidade', is_fixed: true, review_required: false }
      }
    }

    if (desc.includes('pagamento fatura') || desc.includes('debito fatura') || desc.includes('pgto fatura')) {
      return { category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', is_fixed: true, review_required: true }
    }
    if (desc.includes('posto') || desc.includes('ipiranga') || desc.includes('shell') || desc.includes('combustivel')) {
      return { category: 'Transporte', subcategory: 'Combustível', is_fixed: false, review_required: false }
    }
    if (desc.includes('uber') || desc.includes('99app')) {
      return { category: 'Transporte', subcategory: 'Táxi/Uber', is_fixed: false, review_required: false }
    }
    if (desc.includes('supermercado') || desc.includes('verdemar') || desc.includes('carrefour') || desc.includes('supernosso')) {
      return { category: 'Casa', subcategory: 'Supermercado', is_fixed: false, review_required: false }
    }
    if (desc.includes('drogaria') || desc.includes('araujo') || desc.includes('drogasil') || desc.includes('raia')) {
      return { category: 'Saúde', subcategory: 'Remédios', is_fixed: false, review_required: false }
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('amazon prime')) {
      return { category: 'Serviços de assinaturas', subcategory: 'Netflix', is_fixed: true, review_required: false }
    }

    return null
  }

  /**
   * Grava auditoria em `ai_categorization_logs` sem bloquear a resposta principal
   */
  private async logAiAuditAsync(params: {
    user_id: string
    transaction_id?: string
    input_hash: string
    sanitized_input: any | null
    decision: CategorizationDecision
  }): Promise<void> {
    try {
      await sql`
        INSERT INTO public.ai_categorization_logs (
          user_id,
          transaction_id,
          input_hash,
          sanitized_input,
          provider,
          model,
          question_version,
          output_json,
          category_suggestion,
          subcategory_suggestion,
          choice_confidence,
          is_fixed_probability,
          needs_review_probability,
          review_required,
          error_message
        ) VALUES (
          ${params.user_id},
          (SELECT id FROM public.transactions
           WHERE id = ${params.transaction_id || null} AND user_id = ${params.user_id}),
          ${params.input_hash},
          ${params.sanitized_input ? JSON.stringify(params.sanitized_input) : null},
          ${params.decision.provider},
          ${params.decision.model},
          ${params.decision.question_version},
          ${JSON.stringify({
            certainty_label: params.decision.certainty_label,
            choice_confidence: params.decision.choice_confidence,
            review_required: params.decision.review_required
          })},
          ${params.decision.category},
          ${params.decision.subcategory},
          ${params.decision.choice_confidence},
          ${params.decision.is_fixed_probability},
          ${params.decision.needs_review_probability},
          ${params.decision.review_required},
          ${params.decision.error_message || null}
        )
      `
    } catch (logErr) {
      console.warn('[FinancialCategorizationService] Falha ao registrar log de auditoria no Postgres:', logErr instanceof Error ? logErr.name : 'unknown_error')
    }
  }
}

export async function createCategorizationServiceForUser(user: { id: string, email?: string | null }): Promise<FinancialCategorizationService> {
  const access = await getJevAccessForUser(user)
  return new FinancialCategorizationService(
    access.enabled && access.apiKey
      ? new JevCategorizationProvider(access.apiKey)
      : new DisabledCategorizationProvider()
  )
}
