
import { financialStorage, getFinancialUserScope, getFinancialScopeVersion } from './userScopedStorage'
import { USER_TAXONOMY } from '@/utils/taxonomy'

export interface CategorizationRule {
  id: string
  pattern: string
  match_type?: 'exact' | 'contains' | 'starts_with' | 'regex'
  category: string
  subcategory: string
  subdivision?: string
  entityType?: 'PF' | 'PJ'
  alwaysApply: boolean
  createdAt: string
  hitCount: number
}

export interface PredictionResult {
  category: string
  subcategory: string
  subdivision?: string
  source: 'USER_RULE' | 'SMART_HEURISTIC' | 'DEFAULT'
  decisionType: 'deterministic' | 'probabilistic'
  certaintyLabel: string
  matchedRuleId?: string
  matchedPattern?: string
  confidence?: number | null // Reservado para Jev Choice/Score
  isCardBillPayment: boolean
}

export function normalizeText(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\*•|\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Chave no localStorage para cache local transitório das regras aprendidas
const STORAGE_KEY = 'leaomed_categorization_rules'

// Constrói regras heurísticas inteligentes pré-configuradas baseadas na taxonomia oficial USER_TAXONOMY
const buildTaxonomyHeuristics = (): Array<{
  pattern: string
  category: string
  subcategory: string
  subdivision?: string
  isBillPayment?: boolean
}> => {
  const rules: Array<{
    pattern: string
    category: string
    subcategory: string
    subdivision?: string
    isBillPayment?: boolean
  }> = [
    // Detecção de Pagamento de Fatura (Candidatos a Deduplicação / Duplicidade)
    { pattern: 'pagamento fatura', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pgto fatura', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagto fatura', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagamento cartao', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'debito fatura', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'deb autom fatura', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagto titulo c6', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagamento c6 bank', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagamento itaucard', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagamento itau', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagamento nubank', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },
    { pattern: 'pagamento efetuado', category: 'Pagamento de Fatura', subcategory: 'Fatura de Cartão', isBillPayment: true },

    // Estabelecimentos Frequentes e Lançamentos Reais
    { pattern: 'localiza', category: 'Transporte', subcategory: 'Parcela Veículo Cartão' },
    { pattern: 'uber', category: 'Transporte', subcategory: 'Táxi/Uber' },
    { pattern: '99app', category: 'Transporte', subcategory: 'Táxi/Uber' },
    { pattern: 'lapaza', category: 'Transporte', subcategory: 'Estacionamentos' },
    { pattern: 'estapar', category: 'Transporte', subcategory: 'Estacionamentos' },
    { pattern: 'posto ponteio', category: 'Transporte', subcategory: 'Combustível' },
    { pattern: 'postode', category: 'Transporte', subcategory: 'Combustível' },
    { pattern: 'madreteresa', category: 'Transporte', subcategory: 'Estacionamentos' },
    { pattern: 'hospital mat', category: 'Transporte', subcategory: 'Estacionamentos' },
    { pattern: 'hospitalbeti', category: 'Transporte', subcategory: 'Estacionamentos' },

    // Alimentação & Restaurantes
    { pattern: 'burger king', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'donna anna', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'mep*quintal', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'vo maria', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'ed mais bar', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'slopesgastrobar', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'arigato culinaria', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'bebedouroartof', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'speedpa*botequim', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'subway', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'soaresrestaurante', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'januario comercio', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
    { pattern: 'ifood', category: 'Alimentação', subcategory: 'Delivery & Lanches' },

    // Supermercado & Padaria
    { pattern: 'supermercados bh', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'sup epa', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'padaria arte do trigo', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'baff s comercio', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'mundo verde', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'sn xua', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'gelada cia', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'panificadora', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'sempre de sams', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'carrefour', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'verdemar', category: 'Casa', subcategory: 'Supermercado' },
    { pattern: 'super nosso', category: 'Casa', subcategory: 'Supermercado' },

    // Saúde & Farmácia
    { pattern: 'araujo loja', category: 'Saúde', subcategory: 'Remédios' },
    { pattern: 'drogaria araujo', category: 'Saúde', subcategory: 'Remédios' },
    { pattern: 'raia', category: 'Saúde', subcategory: 'Remédios' },
    { pattern: 'drogasil', category: 'Saúde', subcategory: 'Remédios' },
    { pattern: 'pacheco', category: 'Saúde', subcategory: 'Remédios' },

    // Softwares & Assinaturas
    { pattern: 'google one', category: 'Serviços de Assinaturas', subcategory: 'Streaming & Assinaturas' },
    { pattern: 'chatgpt', category: 'Serviços de Assinaturas', subcategory: 'Inteligência Artificial' },
    { pattern: 'openai', category: 'Serviços de Assinaturas', subcategory: 'Inteligência Artificial' },
    { pattern: 'typesafe ai', category: 'Serviços de Assinaturas', subcategory: 'Inteligência Artificial' },
    { pattern: 'spotify', category: 'Serviços de Assinaturas', subcategory: 'Streaming & Assinaturas' },
    { pattern: 'netflix', category: 'Serviços de Assinaturas', subcategory: 'Streaming & Assinaturas' },

    // Educação, Compras & Lazer
    { pattern: 'htm*d2ia consultoria', category: 'Educação', subcategory: 'Cursos & Congressos' },
    { pattern: 'mercadinho baby', category: 'Compras', subcategory: 'Vestuário & Acessórios' },
    { pattern: 'mercadolivre', category: 'Compras', subcategory: 'Compras Online' },
    { pattern: 'magalu', category: 'Compras', subcategory: 'Compras & Presentes' },
    { pattern: 'lojas redes', category: 'Compras', subcategory: 'Compras & Presentes' },
    { pattern: 'natura', category: 'Compras', subcategory: 'Compras & Presentes' },
    { pattern: 'loterias', category: 'Lazer & Estilo de Vida', subcategory: 'Lazer & Viagens' },
    { pattern: 'clube serra', category: 'Lazer & Estilo de Vida', subcategory: 'Lazer & Viagens' },
    { pattern: 'barbearia', category: 'Lazer & Estilo de Vida', subcategory: 'Cuidados Pessoais' },
    { pattern: 'repasse de iof', category: 'Impostos e Taxas PF', subcategory: 'IOF' },
    { pattern: 'iof', category: 'Impostos e Taxas PF', subcategory: 'IOF' }
  ]

  // Adiciona keywords cadastradas na taxonomia oficial do usuário normalizadas
  USER_TAXONOMY.forEach(cat => {
    cat.subcategories.forEach(sub => {
      if (sub.keywords && Array.isArray(sub.keywords)) {
        sub.keywords.forEach(kw => {
          if (kw && kw.trim().length >= 2) {
            rules.push({
              pattern: normalizeText(kw),
              category: cat.name,
              subcategory: sub.name
            })
          }
        })
      }
    })
  })

  return rules.map(r => ({
    ...r,
    pattern: normalizeText(r.pattern)
  }))
}

const DEFAULT_HEURISTIC_RULES = buildTaxonomyHeuristics()

export class CategoryRulesEngine {
  // Carrega regras do LocalStorage como cache rápido
  static getCustomRules(): CategorizationRule[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = financialStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (_) {
      return []
    }
  }

  // Sincroniza regras do PostgreSQL no client
  static async syncFromPostgres(): Promise<CategorizationRule[]> {
    const requestScope = getFinancialScopeVersion()
    if (typeof window === 'undefined') return []
    if (!getFinancialUserScope() && !window.location.pathname.startsWith('/demo')) return []
    if (typeof window === 'undefined') return []
    try {
      const resp = await fetch('/api/category-rules')
      if (resp.ok) {
        const data = await resp.json()
      if (getFinancialScopeVersion() !== requestScope) return []
        if (data.rules && Array.isArray(data.rules)) {
          const rules: CategorizationRule[] = data.rules.map((r: any) => ({
            id: r.id,
            pattern: r.pattern,
            match_type: r.match_type,
            category: r.category,
            subcategory: r.subcategory,
            subdivision: r.subdivision,
            entityType: r.entity_type,
            alwaysApply: r.always_apply,
            createdAt: r.created_at,
            hitCount: r.hit_count
          }))
          financialStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
          return rules
        }
      }
    } catch (e) {
      console.warn('Falha na sincronização de regras com o banco:', e)
    }
    if (getFinancialScopeVersion() !== requestScope) return []
    return this.getCustomRules()
  }

  // Salva uma nova regra no PostgreSQL e atualiza o cache local
  static saveRule(params: {
    pattern: string
    match_type?: 'exact' | 'contains' | 'starts_with' | 'regex'
    category: string
    subcategory: string
    subdivision?: string
    entityType?: 'PF' | 'PJ'
    alwaysApply?: boolean
  }): CategorizationRule {
    const rules = this.getCustomRules()
    const cleanPattern = params.pattern.trim().toLowerCase()
    
    const existingIndex = rules.findIndex(r => r.pattern.toLowerCase() === cleanPattern)

    const updatedRule: CategorizationRule = {
      id: existingIndex >= 0 ? rules[existingIndex].id : `rule_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      pattern: cleanPattern,
      match_type: params.match_type || 'contains',
      category: params.category,
      subcategory: params.subcategory,
      subdivision: params.subdivision,
      entityType: params.entityType || 'PF',
      alwaysApply: params.alwaysApply ?? true,
      createdAt: existingIndex >= 0 ? rules[existingIndex].createdAt : new Date().toISOString(),
      hitCount: existingIndex >= 0 ? (rules[existingIndex].hitCount + 1) : 1
    }

    if (existingIndex >= 0) {
      rules[existingIndex] = updatedRule
    } else {
      rules.unshift(updatedRule)
    }

    if (typeof window !== 'undefined' && getFinancialUserScope()) {
      try {
        financialStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
        window.dispatchEvent(new CustomEvent('leaomed_rules_updated', { detail: { rule: updatedRule } }))

        // Envia de forma assíncrona para o PostgreSQL
        fetch('/api/category-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pattern: updatedRule.pattern,
            match_type: updatedRule.match_type,
            category: updatedRule.category,
            subcategory: updatedRule.subcategory,
            subdivision: updatedRule.subdivision,
            entity_type: updatedRule.entityType,
            always_apply: updatedRule.alwaysApply
          })
        }).catch(err => console.warn('Aviso: falha ao persistir regra no PostgreSQL:', err))

      } catch (_) {}
    }

    return updatedRule
  }

  // Deleta uma regra
  static deleteRule(id: string): void {
    const rules = this.getCustomRules().filter(r => r.id !== id)
    if (typeof window !== 'undefined') {
      try {
        financialStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
        window.dispatchEvent(new CustomEvent('leaomed_rules_updated'))
        fetch(`/api/category-rules?id=${id}`, { method: 'DELETE' }).catch(() => {})
      } catch (_) {}
    }
  }

  // Verifica se uma descrição é pagamento de fatura (candidato à duplicidade)
  static isBillPayment(description: string): boolean {
    const clean = normalizeText(description)
    if (!clean) return false

    const billPatterns = [
      'pagamento fatura',
      'pagamento de fatura',
      'pgto fatura',
      'pgto de fatura',
      'pagto fatura',
      'pagto de fatura',
      'pagamento cartao',
      'pagamento de cartao',
      'debito fatura',
      'deb autom fatura',
      'pagto titulo c6',
      'pagamento c6 bank',
      'pagamento itaucard',
      'pagamento nubank',
      'fatura cartao',
      'fatura c6'
    ]

    return billPatterns.some(p => clean.includes(p)) || 
      DEFAULT_HEURISTIC_RULES.some(r => r.isBillPayment && clean.includes(r.pattern))
  }

  // Predição em Cascata Determinística Local
  static predict(description: string, entityType: 'PF' | 'PJ' = 'PF'): PredictionResult {
    if (!description) {
      return {
        category: 'Casa',
        subcategory: 'Supermercado',
        source: 'DEFAULT',
        decisionType: 'deterministic',
        certaintyLabel: 'padrão inicial',
        isCardBillPayment: false
      }
    }

    const clean = normalizeText(description)
    const isPayment = this.isBillPayment(description)

    // 1. Regra Exata do Usuário
    const customRules = this.getCustomRules()
    const exactMatch = customRules.find(r => normalizeText(r.pattern) === clean)

    if (exactMatch) {
      return {
        category: exactMatch.category,
        subcategory: exactMatch.subcategory,
        subdivision: exactMatch.subdivision,
        source: 'USER_RULE',
        decisionType: 'deterministic',
        certaintyLabel: 'regra local exata',
        matchedRuleId: exactMatch.id,
        matchedPattern: exactMatch.pattern,
        isCardBillPayment: isPayment
      }
    }

    // 2. Regra de Estabelecimento por Substring
    const substringMatch = customRules.find(r => clean.includes(normalizeText(r.pattern)))
    if (substringMatch) {
      return {
        category: substringMatch.category,
        subcategory: substringMatch.subcategory,
        subdivision: substringMatch.subdivision,
        source: 'USER_RULE',
        decisionType: 'deterministic',
        certaintyLabel: 'regra memorizada',
        matchedRuleId: substringMatch.id,
        matchedPattern: substringMatch.pattern,
        isCardBillPayment: isPayment
      }
    }

    // 3. Heurística Especializada Padrão da Taxonomia Oficial
    const matchedHeuristic = DEFAULT_HEURISTIC_RULES.find(r => clean.includes(r.pattern))
    if (matchedHeuristic) {
      return {
        category: matchedHeuristic.category,
        subcategory: matchedHeuristic.subcategory,
        subdivision: matchedHeuristic.subdivision,
        source: 'SMART_HEURISTIC',
        decisionType: 'deterministic',
        certaintyLabel: 'heurística local',
        matchedPattern: matchedHeuristic.pattern,
        isCardBillPayment: isPayment
      }
    }

    // 4. Fallback Padrão
    if (entityType === 'PJ') {
      return {
        category: 'Empresa - Despesas Fixas',
        subcategory: 'Outras taxas',
        source: 'DEFAULT',
        decisionType: 'deterministic',
        certaintyLabel: 'fallback pj',
        isCardBillPayment: isPayment
      }
    }

    return {
      category: 'Outros',
      subcategory: 'Geral',
      source: 'DEFAULT',
      decisionType: 'deterministic',
      certaintyLabel: 'fallback pf',
      isCardBillPayment: isPayment
    }
  }

  // Aplica as regras sobre uma lista de transações
  static applyToBatch<T extends { desc?: string; description?: string; cat?: string; category?: string; subcategory?: string; subdivision?: string }>(
    items: T[],
    entityType: 'PF' | 'PJ' = 'PF'
  ): (T & { suggestedCategory: string; suggestedSubcategory: string; suggestedSubdivision?: string; isUserRule: boolean; isBillPayment: boolean; certaintyLabel: string })[] {
    return items.map(item => {
      const text = item.description || item.desc || ''
      const pred = this.predict(text, entityType)
      return {
        ...item,
        suggestedCategory: pred.category,
        suggestedSubcategory: pred.subcategory,
        suggestedSubdivision: pred.subdivision,
        isUserRule: pred.source === 'USER_RULE',
        isBillPayment: pred.isCardBillPayment,
        certaintyLabel: pred.certaintyLabel
      }
    })
  }
}
