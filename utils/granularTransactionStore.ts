import { CategoryRulesEngine } from './categoryRulesEngine'
import { PJ_REAL_TRANSACTIONS } from './pjTransactionsHistory'
import { PF_MOBILLS_REAL_TRANSACTIONS } from './pfMobillsTransactionsHistory'
import { InstallmentStore } from './installmentStore'

export interface GranularTransaction {
  id: string
  entityType: 'PF' | 'PJ'
  date: string // YYYY-MM-DD
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
}

const STORAGE_KEY = 'leaomed_granular_transactions_v5'

// Base histórica real auditada consolidada (PF Mobills + PJ Banco Inter)
const INITIAL_TRANSACTIONS: GranularTransaction[] = [
  // 1. Pessoa Física Real (Extrato Mobills Mar/2026 a Set/2026 - 936 Lançamentos Reais Categorizados)
  ...(PF_MOBILLS_REAL_TRANSACTIONS as unknown as GranularTransaction[]),

  // 2. Pessoa Jurídica Real (Extrato Banco Inter dos Últimos 2 Anos - 132 Lançamentos Reais)
  ...(PJ_REAL_TRANSACTIONS as unknown as GranularTransaction[])
]

export class GranularTransactionStore {
  // Busca todas as transações persistidas
  static getAll(): GranularTransaction[] {
    if (typeof window === 'undefined') return INITIAL_TRANSACTIONS
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        // Se existir v3 ou v2 antigo, preserva transações adicionadas e mescla com as novas
        const oldV4 = localStorage.getItem('leaomed_granular_transactions_v4')
        const oldV3 = localStorage.getItem('leaomed_granular_transactions_v3')
        const oldV2 = localStorage.getItem('leaomed_granular_transactions_v2')
        let initialList = INITIAL_TRANSACTIONS
        const candidateOld = oldV4 || oldV3 || oldV2
        if (candidateOld) {
          try {
            const parsedOld = JSON.parse(candidateOld) as GranularTransaction[]
            // Adiciona transações customizadas que o usuário possa ter criado
            const customUserTxs = parsedOld.filter(t => !INITIAL_TRANSACTIONS.some(init => init.id === t.id))
            initialList = [...INITIAL_TRANSACTIONS, ...customUserTxs]
          } catch (_) {}
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList))
        return initialList
      }
      return JSON.parse(raw) as GranularTransaction[]
    } catch (_) {
      return INITIAL_TRANSACTIONS
    }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
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

  // Restaura para a base padrão oficial
  static resetToDefault(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS))
        window.dispatchEvent(new CustomEvent('leaomed_transactions_updated'))
      } catch (_) {}
    }
  }
}
