import { CategoryRulesEngine } from './categoryRulesEngine'

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
  isFixed: boolean
  isIgnored: boolean // Se true, o valor NÃO entra no somatório de despesas (deduplicado)
  isDuplicateSuspect?: boolean
  duplicateReason?: string
  source: 'INITIAL_AUDIT' | 'MANUAL' | 'INVOICE' | 'OCR' | 'OPEN_FINANCE'
}

const STORAGE_KEY = 'leaomed_granular_transactions_v2'

// Base inicial auditada do Dr. Rafael Leão (Junho/2026)
const INITIAL_TRANSACTIONS: GranularTransaction[] = [
  // 1. Débito em Conta Corrente do Pagamento da Fatura (Candidato Primário à Deduplicação!)
  {
    id: 'tx_bill_pay_c6_jun',
    entityType: 'PF',
    date: '2026-06-22',
    description: 'PAGTO TITULO C6 BANK / FATURA CARTÃO',
    amount: -7405.92,
    accountOrCard: 'Itaú Personnalité PF',
    category: 'Pagamento de Fatura',
    subcategory: 'Deduplicado / Débito de Cartão',
    isFixed: true,
    isIgnored: true, // Já vem seguro como ignorado para não duplicar, mas permite auditoria
    isDuplicateSuspect: true,
    duplicateReason: 'Débito em conta referente à fatura do cartão C6 cujos gastos já estão discriminados abaixo.',
    source: 'INITIAL_AUDIT'
  },

  // 2. Gastos Discriminados no Cartão C6 Carbon Black (PF)
  {
    id: 'tx_c6_01',
    entityType: 'PF',
    date: '2026-06-03',
    description: 'Posto Ipiranga Combustível',
    amount: -340.50,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Transporte',
    subcategory: 'Combustível',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_c6_02',
    entityType: 'PF',
    date: '2026-06-07',
    description: 'Supermercado Verdemar Familiar',
    amount: -1250.80,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Moradia',
    subcategory: 'Supermercado Familiar',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_c6_03',
    entityType: 'PF',
    date: '2026-06-11',
    description: 'Restaurante & Almoço Clínico',
    amount: -280.40,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Alimentação',
    subcategory: 'Restaurantes & Fast Food',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_c6_04',
    entityType: 'PF',
    date: '2026-06-14',
    description: 'Inscrição Congresso Brasileiro de Medicina',
    amount: -1850.00,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Despesas Pessoais',
    subcategory: 'Educação Médica & Livros',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_c6_05',
    entityType: 'PF',
    date: '2026-06-18',
    description: 'Drogaria Araújo Medicamentos',
    amount: -220.00,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Saúde',
    subcategory: 'Medicamentos & Farmácia',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_c6_06',
    entityType: 'PF',
    date: '2026-06-21',
    description: 'Manutenção e Revisão Preventiva Veicular',
    amount: -1580.00,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Transporte',
    subcategory: 'Manutenção Veicular',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_c6_07',
    entityType: 'PF',
    date: '2026-06-25',
    description: "McDonald's Lanches Fim de Turno",
    amount: -145.90,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Alimentação',
    subcategory: 'Restaurantes & Fast Food',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_c6_08',
    entityType: 'PF',
    date: '2026-06-28',
    description: 'Compras Pessoais e Vestuário',
    amount: -1738.32,
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Despesas Pessoais',
    subcategory: 'Vestuário & Uso Pessoal',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },

  // 3. Gastos no Cartão Nubank PF
  {
    id: 'tx_nu_01',
    entityType: 'PF',
    date: '2026-06-04',
    description: 'Assinatura UpToDate Medicina Baseada em Evidências',
    amount: -480.00,
    accountOrCard: 'Nubank PF',
    category: 'Despesas Pessoais',
    subcategory: 'Educação Médica & Livros',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_nu_02',
    entityType: 'PF',
    date: '2026-06-08',
    description: 'Streaming & Assinaturas Digitais (Netflix/Prime)',
    amount: -129.90,
    accountOrCard: 'Nubank PF',
    category: 'Lazer',
    subcategory: 'Streaming & Assinaturas',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_nu_03',
    entityType: 'PF',
    date: '2026-06-15',
    description: 'Delivery iFood Plantão',
    amount: -185.30,
    accountOrCard: 'Nubank PF',
    category: 'Alimentação',
    subcategory: 'Delivery & Lanches',
    isFixed: false,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },

  // 4. Despesas Fixas Obrigatórias em Conta Corrente (Itaú PF)
  {
    id: 'tx_itau_01',
    entityType: 'PF',
    date: '2026-06-05',
    description: 'Financiamento Veicular CDC Parcela 01/36',
    amount: -3336.28,
    accountOrCard: 'Itaú Personnalité PF',
    category: 'Financiamento',
    subcategory: 'Parcelas CDC Veicular',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_itau_02',
    entityType: 'PF',
    date: '2026-06-10',
    description: 'Fração Imobiliária / Cota Turística Resort Parcela 01/70',
    amount: -1865.33,
    accountOrCard: 'Itaú Personnalité PF',
    category: 'Financiamento',
    subcategory: 'Fração Imobiliária Resort',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_itau_03',
    entityType: 'PF',
    date: '2026-06-06',
    description: 'Condomínio Residencial',
    amount: -1850.00,
    accountOrCard: 'Itaú Personnalité PF',
    category: 'Moradia',
    subcategory: 'Condomínio Residencial',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_itau_04',
    entityType: 'PF',
    date: '2026-06-12',
    description: 'Plano de Saúde Familiar',
    amount: -1650.00,
    accountOrCard: 'Itaú Personnalité PF',
    category: 'Saúde',
    subcategory: 'Plano de Saúde',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },

  // 5. Pessoa Jurídica (Débitos em Conta Corrente PJ - 100% Débito sem Cartão)
  {
    id: 'tx_pj_01',
    entityType: 'PJ',
    date: '2026-06-20',
    description: 'DARF Simples Nacional PJ Competência 05/26',
    amount: -550.00,
    accountOrCard: 'Pessoa Jurídica',
    category: 'Empresa Médica PJ',
    subcategory: 'DARF Simples Nacional',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_pj_02',
    entityType: 'PJ',
    date: '2026-06-20',
    description: 'GPS INSS Previdenciário Pró-Labore',
    amount: -961.21,
    accountOrCard: 'Pessoa Jurídica',
    category: 'Empresa Médica PJ',
    subcategory: 'Previdência INSS',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_pj_03',
    entityType: 'PJ',
    date: '2026-06-10',
    description: 'ISSQN Municipal Clínica',
    amount: -708.73,
    accountOrCard: 'Pessoa Jurídica',
    category: 'Empresa Médica PJ',
    subcategory: 'ISSQN Municipal',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  },
  {
    id: 'tx_pj_04',
    entityType: 'PJ',
    date: '2026-06-18',
    description: 'Honorários Mensalidade Contabilidade Médica',
    amount: -491.21,
    accountOrCard: 'Pessoa Jurídica',
    category: 'Empresa Médica PJ',
    subcategory: 'Assessoria Contábil',
    isFixed: true,
    isIgnored: false,
    source: 'INITIAL_AUDIT'
  }
]

export class GranularTransactionStore {
  // Busca todas as transações persistidas
  static getAll(): GranularTransaction[] {
    if (typeof window === 'undefined') return INITIAL_TRANSACTIONS
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        // Inicializa com a base oficial e salva
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS))
        return INITIAL_TRANSACTIONS
      }
      return JSON.parse(raw) as GranularTransaction[]
    } catch (_) {
      return INITIAL_TRANSACTIONS
    }
  }

  // Salva lista no LocalStorage e dispara evento
  private static save(items: GranularTransaction[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new CustomEvent('leaomed_transactions_updated', { detail: { count: items.length } }))
    } catch (_) {}
  }

  // Adiciona uma nova transação com enriquecimento inteligente de categoria
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
