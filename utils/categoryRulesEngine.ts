export interface CategorizationRule {
  id: string
  pattern: string
  category: string
  subcategory: string
  entityType?: 'PF' | 'PJ'
  alwaysApply: boolean
  createdAt: string
  hitCount: number
}

export interface PredictionResult {
  category: string
  subcategory: string
  source: 'USER_RULE' | 'SMART_HEURISTIC' | 'DEFAULT'
  matchedRuleId?: string
  matchedPattern?: string
  confidence: number // 0 a 1
  isCardBillPayment: boolean
}

// Chave no localStorage para guardar as regras aprendidas
const STORAGE_KEY = 'leaomed_categorization_rules'

// Regras base inteligentes pré-configuradas (Taxonomia Médica e Cotidiano Brasileiro)
const DEFAULT_HEURISTIC_RULES: Array<{
  pattern: string
  category: string
  subcategory: string
  isBillPayment?: boolean
}> = [
  // Detecção de Pagamento de Fatura (Candidatos a Deduplicação / Duplicidade)
  { pattern: 'pagamento fatura', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'pgto fatura', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'pagto fatura', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'pagamento cartao', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'debito fatura', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'deb autom fatura', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'pagto titulo c6', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'pagamento c6 bank', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'pagamento itaucard', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },
  { pattern: 'pagamento nubank', category: 'Pagamento de Fatura', subcategory: 'Deduplicado / Débito de Cartão', isBillPayment: true },

  // Alimentação & Restaurantes
  { pattern: 'mcdonald', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
  { pattern: 'mc donald', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
  { pattern: 'burger king', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
  { pattern: 'ifood', category: 'Alimentação', subcategory: 'Delivery & Lanches' },
  { pattern: 'outback', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
  { pattern: 'restaurante', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
  { pattern: 'churrascaria', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },
  { pattern: 'padaria', category: 'Alimentação', subcategory: 'Padaria & Confeitaria' },
  { pattern: 'cafe', category: 'Alimentação', subcategory: 'Cafeteria & Lanches' },
  { pattern: 'pizzaria', category: 'Alimentação', subcategory: 'Restaurantes & Fast Food' },

  // Transporte & Veículos
  { pattern: 'posto', category: 'Transporte', subcategory: 'Combustível' },
  { pattern: 'ipiranga', category: 'Transporte', subcategory: 'Combustível' },
  { pattern: 'shell', category: 'Transporte', subcategory: 'Combustível' },
  { pattern: 'petrobras', category: 'Transporte', subcategory: 'Combustível' },
  { pattern: 'combustivel', category: 'Transporte', subcategory: 'Combustível' },
  { pattern: 'uber', category: 'Transporte', subcategory: 'Transporte por Aplicativo' },
  { pattern: '99app', category: 'Transporte', subcategory: 'Transporte por Aplicativo' },
  { pattern: 'estacionamento', category: 'Transporte', subcategory: 'Estacionamento & Pedágios' },
  { pattern: 'sem parar', category: 'Transporte', subcategory: 'Estacionamento & Pedágios' },
  { pattern: 'veloe', category: 'Transporte', subcategory: 'Estacionamento & Pedágios' },
  { pattern: 'oficina', category: 'Transporte', subcategory: 'Manutenção Veicular' },
  { pattern: 'pneu', category: 'Transporte', subcategory: 'Manutenção Veicular' },

  // Moradia & Supermercados
  { pattern: 'supermercado', category: 'Moradia', subcategory: 'Supermercado Familiar' },
  { pattern: 'verdemar', category: 'Moradia', subcategory: 'Supermercado Familiar' },
  { pattern: 'supernosso', category: 'Moradia', subcategory: 'Supermercado Familiar' },
  { pattern: 'carrefour', category: 'Moradia', subcategory: 'Supermercado Familiar' },
  { pattern: 'pao de acucar', category: 'Moradia', subcategory: 'Supermercado Familiar' },
  { pattern: 'bh supermercados', category: 'Moradia', subcategory: 'Supermercado Familiar' },
  { pattern: 'condominio', category: 'Moradia', subcategory: 'Condomínio Residencial' },
  { pattern: 'cemig', category: 'Moradia', subcategory: 'Energia Elétrica' },
  { pattern: 'copasa', category: 'Moradia', subcategory: 'Água e Esgoto' },
  { pattern: 'sabesp', category: 'Moradia', subcategory: 'Água e Esgoto' },
  { pattern: 'claro', category: 'Moradia', subcategory: 'Internet & Telefonia' },
  { pattern: 'vivo', category: 'Moradia', subcategory: 'Internet & Telefonia' },

  // Saúde & Farmácia
  { pattern: 'drogaria', category: 'Saúde', subcategory: 'Medicamentos & Farmácia' },
  { pattern: 'farmacia', category: 'Saúde', subcategory: 'Medicamentos & Farmácia' },
  { pattern: 'araujo', category: 'Saúde', subcategory: 'Medicamentos & Farmácia' },
  { pattern: 'raia', category: 'Saúde', subcategory: 'Medicamentos & Farmácia' },
  { pattern: 'drogasil', category: 'Saúde', subcategory: 'Medicamentos & Farmácia' },
  { pattern: 'pacheco', category: 'Saúde', subcategory: 'Medicamentos & Farmácia' },
  { pattern: 'unimed', category: 'Saúde', subcategory: 'Plano de Saúde' },
  { pattern: 'bradesco saude', category: 'Saúde', subcategory: 'Plano de Saúde' },
  { pattern: 'sulamerica saude', category: 'Saúde', subcategory: 'Plano de Saúde' },

  // Educação & Formação Médica
  { pattern: 'uptodate', category: 'Despesas Pessoais', subcategory: 'Educação Médica & Livros' },
  { pattern: 'congresso', category: 'Despesas Pessoais', subcategory: 'Congressos & Atualização' },
  { pattern: 'crm', category: 'Despesas Pessoais', subcategory: 'Anuidade CRM/CFM' },
  { pattern: 'cfm', category: 'Despesas Pessoais', subcategory: 'Anuidade CRM/CFM' },
  { pattern: 'amb', category: 'Despesas Pessoais', subcategory: 'Sociedades Médicas' },
  { pattern: 'colegio', category: 'Despesas Pessoais', subcategory: 'Educação / Escola' },
  { pattern: 'escola', category: 'Despesas Pessoais', subcategory: 'Educação / Escola' },

  // Lazer & Assinaturas
  { pattern: 'netflix', category: 'Lazer', subcategory: 'Streaming & Assinaturas' },
  { pattern: 'spotify', category: 'Lazer', subcategory: 'Streaming & Assinaturas' },
  { pattern: 'amazon prime', category: 'Lazer', subcategory: 'Streaming & Assinaturas' },
  { pattern: 'apple.com', category: 'Lazer', subcategory: 'Assinaturas & Apple' },
  { pattern: 'cinema', category: 'Lazer', subcategory: 'Passeios & Cultura' },
  { pattern: 'teatro', category: 'Lazer', subcategory: 'Passeios & Cultura' },

  // Financiamentos
  { pattern: 'financiamento', category: 'Financiamento', subcategory: 'Parcelas CDC / Imóveis' },
  { pattern: 'cota turistica', category: 'Financiamento', subcategory: 'Fração Imobiliária Resort' },
  { pattern: 'resort', category: 'Financiamento', subcategory: 'Fração Imobiliária Resort' },

  // Pessoa Jurídica (Tributos & Serviços)
  { pattern: 'darf', category: 'Empresa Médica PJ', subcategory: 'Tributos Federais (DARF)' },
  { pattern: 'simples nacional', category: 'Empresa Médica PJ', subcategory: 'DAS Simples Nacional' },
  { pattern: 'contabil', category: 'Empresa Médica PJ', subcategory: 'Assessoria Contábil' },
  { pattern: 'contador', category: 'Empresa Médica PJ', subcategory: 'Assessoria Contábil' },
  { pattern: 'inss', category: 'Empresa Médica PJ', subcategory: 'Previdência INSS' },
  { pattern: 'iss', category: 'Empresa Médica PJ', subcategory: 'ISSQN Municipal' }
]

export class CategoryRulesEngine {
  // Carrega regras aprendidas pelo usuário do LocalStorage
  static getCustomRules(): CategorizationRule[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as CategorizationRule[]
    } catch (_) {
      return []
    }
  }

  // Salva uma nova regra ou atualiza regra existente
  static saveRule(params: {
    pattern: string
    category: string
    subcategory: string
    entityType?: 'PF' | 'PJ'
    alwaysApply?: boolean
  }): CategorizationRule {
    const rules = this.getCustomRules()
    const cleanPattern = params.pattern.trim().toLowerCase()
    
    // Verifica se já existe uma regra para este padrão
    const existingIndex = rules.findIndex(r => r.pattern.toLowerCase() === cleanPattern)

    const updatedRule: CategorizationRule = {
      id: existingIndex >= 0 ? rules[existingIndex].id : `rule_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      pattern: cleanPattern,
      category: params.category,
      subcategory: params.subcategory,
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

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
        window.dispatchEvent(new CustomEvent('leaomed_rules_updated', { detail: { rule: updatedRule } }))
      } catch (_) {}
    }

    return updatedRule
  }

  // Deleta uma regra do usuário
  static deleteRule(id: string): void {
    const rules = this.getCustomRules().filter(r => r.id !== id)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
        window.dispatchEvent(new CustomEvent('leaomed_rules_updated'))
      } catch (_) {}
    }
  }

  // Limpa todas as regras customizadas
  static clearCustomRules(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
        window.dispatchEvent(new CustomEvent('leaomed_rules_updated'))
      } catch (_) {}
    }
  }

  // Verifica se uma descrição é pagamento de fatura (candidato à duplicidade)
  static isBillPayment(description: string): boolean {
    const lower = description.toLowerCase()
    return DEFAULT_HEURISTIC_RULES.some(r => r.isBillPayment && lower.includes(r.pattern))
  }

  // Prediz categoria e subcategoria com base na descrição
  static predict(description: string, entityType: 'PF' | 'PJ' = 'PF'): PredictionResult {
    if (!description) {
      return {
        category: 'Despesas Pessoais',
        subcategory: 'Outros Lançamentos',
        source: 'DEFAULT',
        confidence: 0.1,
        isCardBillPayment: false
      }
    }

    const clean = description.toLowerCase().trim()
    const isPayment = this.isBillPayment(clean)

    // 1. Prioridade Máxima: Regras Aprendidas pelo Usuário
    const customRules = this.getCustomRules()
    const matchedCustom = customRules.find(r => clean.includes(r.pattern.toLowerCase()))

    if (matchedCustom) {
      return {
        category: matchedCustom.category,
        subcategory: matchedCustom.subcategory,
        source: 'USER_RULE',
        matchedRuleId: matchedCustom.id,
        matchedPattern: matchedCustom.pattern,
        confidence: 0.98,
        isCardBillPayment: isPayment
      }
    }

    // 2. Heurística Padrão Médica & Comercial
    const matchedHeuristic = DEFAULT_HEURISTIC_RULES.find(r => clean.includes(r.pattern))

    if (matchedHeuristic) {
      return {
        category: matchedHeuristic.category,
        subcategory: matchedHeuristic.subcategory,
        source: 'SMART_HEURISTIC',
        matchedPattern: matchedHeuristic.pattern,
        confidence: 0.85,
        isCardBillPayment: isPayment
      }
    }

    // 3. Fallback inteligente
    if (entityType === 'PJ') {
      return {
        category: 'Empresa Médica PJ',
        subcategory: 'Despesas Operacionais',
        source: 'DEFAULT',
        confidence: 0.3,
        isCardBillPayment: isPayment
      }
    }

    return {
      category: 'Despesas Pessoais',
      subcategory: 'Diversos',
      source: 'DEFAULT',
      confidence: 0.2,
      isCardBillPayment: isPayment
    }
  }

  // Aplica as regras sobre uma lista de transações
  static applyToBatch<T extends { desc?: string; description?: string; cat?: string; category?: string; subcategory?: string }>(
    items: T[],
    entityType: 'PF' | 'PJ' = 'PF'
  ): (T & { suggestedCategory: string; suggestedSubcategory: string; isUserRule: boolean; isBillPayment: boolean })[] {
    return items.map(item => {
      const text = item.description || item.desc || ''
      const pred = this.predict(text, entityType)
      return {
        ...item,
        suggestedCategory: pred.category,
        suggestedSubcategory: pred.subcategory,
        isUserRule: pred.source === 'USER_RULE',
        isBillPayment: pred.isCardBillPayment
      }
    })
  }
}
