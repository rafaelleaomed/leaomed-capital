
import { financialStorage, getFinancialUserScope, getFinancialScopeVersion } from './userScopedStorage'
import { CategoryRulesEngine } from './categoryRulesEngine'
import { DEMO_SYNTHETIC_TRANSACTIONS } from './demoSyntheticData'
import { InstallmentStore } from './installmentStore'

export interface GranularTransaction {
  id: string
  entityType: 'PF' | 'PJ'
  date: string // YYYY-MM-DD
  originalDate?: string
  description: string
  originalDescription?: string
  amount: number // Valores negativos para despesas, positivos para receitas
  accountOrCard: string
  category: string
  subcategory: string
  subdivision?: string // Nível 3: Ex: 'Hospital Madre Teresa', 'Hospital Mater Dei', 'Lifecenter'
  investmentAsset?: string // Vínculo com ativo da carteira de investimentos
  investmentAction?: 'APORTE' | 'RESGATE'
  isFixed: boolean
  isIgnored: boolean // Se true, o valor NÃO entra no somatório de despesas (deduplicado)
  isDuplicateSuspect?: boolean
  duplicateReason?: string
  source: 'INITIAL_AUDIT' | 'MANUAL' | 'INVOICE' | 'OCR' | 'OPEN_FINANCE'
  
  // Metadados do Sistema de Categorização Inteligente (Jev / Regras / Modo Sombra)
  decisionType?: 'deterministic' | 'probabilistic' | 'manual' | 'unclassified'
  certaintyLabel?: string
  categorySource?: 'manual' | 'local_rule' | 'jev' | 'llm' | 'imported' | 'unknown'
  categoryConfidence?: number | null
  isFixedProbability?: number | null
  needsReviewProbability?: number | null
  aiSuggestedCategory?: string
  aiSuggestedSubcategory?: string
  aiSuggestedIsFixed?: boolean
  aiReviewRequired?: boolean
  categorizationStatus?: 'pending' | 'suggested' | 'confirmed' | 'auto_applied' | 'needs_review' | 'rejected' | 'error'
  categorizationError?: string
}

function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.pathname.startsWith('/demo')
}

function getStorageKey(): string {
  if (typeof window === 'undefined') return 'leaomed_granular_txs'
  if (isDemoMode()) return 'leaomed_granular_txs_demo'
  return 'leaomed_granular_txs_user'
}

export class GranularTransactionStore {
  // Busca todas as transações persistidas
  static getAll(): GranularTransaction[] {
    if (typeof window === 'undefined') return []
    const key = getStorageKey()

    if (isDemoMode()) {
      return [...DEMO_SYNTHETIC_TRANSACTIONS]
    }

    try {
      const raw = financialStorage.getItem(key)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (_) {
      return []
    }
  }

  // Sincroniza do banco via API
  static async fetchFromApi(period?: string): Promise<GranularTransaction[]> {
    const requestScope = getFinancialScopeVersion()
    if (typeof window === 'undefined') return []
    if (!getFinancialUserScope() && !window.location.pathname.startsWith('/demo')) return []
    if (isDemoMode()) return [...DEMO_SYNTHETIC_TRANSACTIONS]

    try {
      const url = period ? `/api/transactions?period=${period}&limit=1000` : '/api/transactions?limit=1000'
      const res = await fetch(url)
      const data = await res.json()
      if (getFinancialScopeVersion() !== requestScope) return []
      if (res.ok && data?.success && Array.isArray(data.transactions)) {
        const mapped: GranularTransaction[] = data.transactions.map((t: any) => ({
          id: t.id,
          entityType: t.entity_type || 'PF',
          date: t.competence_date?.split('T')[0] || t.date?.split('T')[0] || t.date,
          originalDate: t.date?.split('T')[0] || t.date,
          description: t.description,
          amount: parseFloat(t.amount) || 0,
          accountOrCard: t.account_name || 'Conta',
          category: t.category || 'Outros',
          subcategory: t.subcategory || 'Geral',
          isFixed: Boolean(t.is_fixed),
          isIgnored: Boolean(t.is_ignored),
          source: 'MANUAL'
        }))
        const key = getStorageKey()
        financialStorage.setItem(key, JSON.stringify(mapped))
        return mapped
      }
    } catch (e) {
      console.warn('Fallback para cache local de transações:', e)
    }
    if (getFinancialScopeVersion() !== requestScope) return []
    return this.getAll()
  }


  // Verifica se uma transação está sem categoria ou sem subcategoria definida
  static isUncategorized(t: GranularTransaction): boolean {
    const cat = (t.category || '').trim().toLowerCase()
    const sub = (t.subcategory || '').trim().toLowerCase()
    
    const hasNoCat = !cat || cat === 'outros' || cat === 'sem categoria' || cat === 'não categorizado' || cat === 'pendente'
    const hasNoSub = !sub || sub === 'outros' || sub === 'não categorizado' || sub === 'pendente' || sub === 'não especificado'
    
    return hasNoCat || hasNoSub
  }

  // Retorna todos os lançamentos pendentes de categoria ou subcategoria
  static getUncategorized(transactions?: GranularTransaction[]): GranularTransaction[] {
    const list = transactions || this.getAll()
    return list.filter(t => this.isUncategorized(t))
  }

  // Salva lista no LocalStorage e dispara evento
  private static save(items: GranularTransaction[]): void {
    if (typeof window === 'undefined') return
    try {
      const key = getStorageKey()
      financialStorage.setItem(key, JSON.stringify(items))
      window.dispatchEvent(new CustomEvent('leaomed_transactions_updated', { detail: { count: items.length } }))
    } catch (_) {}
  }

  // Adiciona uma nova transação com enriquecimento inteligente de categoria e detecção de parcelamentos
  static addTransaction(tx: Omit<GranularTransaction, 'id' | 'isDuplicateSuspect' | 'duplicateReason'>): GranularTransaction {
    const items = this.getAll()
    const isPayment = CategoryRulesEngine.isBillPayment(tx.description)

    const newTx: GranularTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      isDuplicateSuspect: isPayment,
      duplicateReason: isPayment ? 'Pagamento de fatura de cartão. Se os itens do cartão já estiverem lançados, mantenha como ignorado para evitar duplicidade.' : undefined
    }

    items.unshift(newTx)
    this.save(items)

    // Sincroniza automaticamente com o sistema de parcelamentos se houver indicação de parcela (ex: 10/12)
    InstallmentStore.syncFromTransaction(newTx)

    return newTx
  }

  // Atualiza transação existente
  static updateTransaction(id: string, updates: Partial<GranularTransaction>): boolean {
    const items = this.getAll()
    const index = items.findIndex(t => t.id === id)
    if (index === -1) return false

    items[index] = {
      ...items[index],
      ...updates
    }

    this.save(items)

    // Sincroniza atualização com o sistema de parcelamentos
    InstallmentStore.syncFromTransaction(items[index])

    return true
  }

  /** Persiste a classificação no banco antes de atualizar o cache local. */
  static async persistClassification(id: string, updates: Partial<GranularTransaction>): Promise<boolean> {
    const requestScope = getFinancialScopeVersion()
    if (isDemoMode()) return this.updateTransaction(id, updates)
    if (!getFinancialUserScope()) return false

    const response = await fetch('/api/transactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        category: updates.category,
        subcategory: updates.subcategory,
        is_fixed: updates.isFixed,
        is_ignored: updates.isIgnored
      })
    })
    const result = await response.json().catch(() => null)
    if (getFinancialScopeVersion() !== requestScope) return false
    if (!response.ok || !result?.success) {
      throw new Error(result?.error || 'Não foi possível salvar a classificação.')
    }
    return this.updateTransaction(id, updates)
  }

  // Remove transação
  static deleteTransaction(id: string): boolean {
    const items = this.getAll()
    const filtered = items.filter(t => t.id !== id)
    if (filtered.length === items.length) return false

    this.save(filtered)
    return true
  }

  // Alterna status de ignorado / deduplicado
  static toggleIgnore(id: string): boolean {
    const items = this.getAll()
    const target = items.find(t => t.id === id)
    if (!target) return false

    target.isIgnored = !target.isIgnored
    this.save(items)
    return true
  }

  // Adiciona lote vindo de importação de fatura ou OCR
  static addBatch(newBatch: Array<{
    date: string
    description: string
    amount: number
    accountOrCard: string
    category: string
    subcategory: string
    entityType?: 'PF' | 'PJ'
    isFixed?: boolean
    source?: 'INVOICE' | 'OCR' | 'MANUAL' | 'OPEN_FINANCE'
  }>): GranularTransaction[] {
    const items = this.getAll()
    const createdList: GranularTransaction[] = []

    for (const b of newBatch) {
      const isPayment = CategoryRulesEngine.isBillPayment(b.description)
      const newTx: GranularTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        entityType: b.entityType || 'PF',
        date: b.date || new Date().toISOString().split('T')[0],
        description: b.description,
        amount: b.amount,
        accountOrCard: b.accountOrCard,
        category: b.category,
        subcategory: b.subcategory,
        isFixed: b.isFixed ?? false,
        isIgnored: isPayment, // Auto-ignora débitos de fatura para proteger contra duplicidade
        isDuplicateSuspect: isPayment,
        duplicateReason: isPayment ? 'Pagamento de fatura auto-detectado. Ignorado para evitar somar 2x com as compras do cartão.' : undefined,
        source: b.source || 'INVOICE'
      }
      createdList.push(newTx)
      items.unshift(newTx)

      // Sincroniza automaticamente com o sistema de parcelamentos
      InstallmentStore.syncFromTransaction(newTx)
    }

    this.save(items)
    return createdList
  }

  // Varredura de Duplicidades: detecta pagamentos de fatura em conflito com lançamentos do cartão
  static scanDuplicates(transactions?: GranularTransaction[]): {
    hasDuplicates: boolean
    billPayments: GranularTransaction[]
    cardExpensesCount: number
    cardExpensesTotal: number
  } {
    const list = transactions || this.getAll()
    const billPayments = list.filter(t => t.isDuplicateSuspect || CategoryRulesEngine.isBillPayment(t.description))
    const cardExpenses = list.filter(t => t.accountOrCard.toLowerCase().includes('cartão') || t.accountOrCard.toLowerCase().includes('c6') || t.accountOrCard.toLowerCase().includes('nu'))

    const cardExpensesTotal = cardExpenses.reduce((acc, t) => acc + (t.isIgnored ? 0 : Math.abs(t.amount)), 0)

    return {
      hasDuplicates: billPayments.length > 0 && cardExpenses.length > 0,
      billPayments,
      cardExpensesCount: cardExpenses.length,
      cardExpensesTotal
    }
  }

  // Deduplica com 1 clique todos os pagamentos de fatura
  static deduplicateAllBillPayments(): number {
    const items = this.getAll()
    let count = 0

    items.forEach(t => {
      if ((t.isDuplicateSuspect || CategoryRulesEngine.isBillPayment(t.description)) && !t.isIgnored) {
        t.isIgnored = true
        t.duplicateReason = 'Ignorado automaticamente pelo motor de deduplicação (gastos do cartão já ativos).'
        count++
      }
    })

    if (count > 0) {
      this.save(items)
    }

    return count
  }

  // Restaura para a base padrão
  static resetToDefault(): void {
    if (typeof window !== 'undefined') {
      try {
        const key = getStorageKey()
        const initialList = isDemoMode() ? [...DEMO_SYNTHETIC_TRANSACTIONS] : []
        financialStorage.setItem(key, JSON.stringify(initialList))
        window.dispatchEvent(new CustomEvent('leaomed_transactions_updated'))
      } catch (_) {}
    }
  }
}

