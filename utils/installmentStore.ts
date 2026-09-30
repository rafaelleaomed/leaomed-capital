import { CreditCardStore } from './creditCardStore'

export interface InstallmentItem {
  id: string
  name: string
  category: string
  subcategory?: string
  monthlyValue: number
  currentInstallment: number
  totalInstallments: number
  endMonthYear: string
  contractNotes?: string
  isPerpetual?: boolean
  paymentMethod: string
  entityType?: 'PF' | 'PJ'
  startDate?: string
}

const STORAGE_KEY = 'leaomed_installment_store_v2'

export const DEFAULT_INSTALLMENTS: InstallmentItem[] = [
  {
    id: 'inst_tcross_card',
    name: 'Parcela Entrada T-Cross Cartão',
    category: 'Transporte',
    subcategory: 'Parcela T-Cross Cartão',
    monthlyValue: 6837.22,
    currentInstallment: 6,
    totalInstallments: 16,
    endMonthYear: 'Abril/2027',
    contractNotes: 'Localiza Frotas • Entrada do veículo parcelada no cartão',
    paymentMethod: 'Cartão C6 Carbon Black PF',
    entityType: 'PF'
  },
  {
    id: 'inst_tcross_financing',
    name: 'Financiamento T-Cross (Banco VW/Safra)',
    category: 'Transporte',
    subcategory: 'Parcela T-Cross Financiamento',
    monthlyValue: 3336.28,
    currentInstallment: 14,
    totalInstallments: 36,
    endMonthYear: 'Abril/2028',
    contractNotes: 'Contrato CCB 493464 • 36 parcelas fixas',
    paymentMethod: 'Débito em Conta (Banco Safra)',
    entityType: 'PF'
  },
  {
    id: 'inst_gramado_parks',
    name: 'Parcela Gramado Parks (Buona Vitta GVI126924)',
    category: 'Financiamento',
    subcategory: 'Parcela Gramado Parks',
    monthlyValue: 1865.33,
    currentInstallment: 5,
    totalInstallments: 70,
    endMonthYear: 'Fevereiro/2032',
    contractNotes: 'Contrato de multipropriedade GVI126924 • Reajustado pelo IPCA',
    paymentMethod: 'Boleto Gramado Parks',
    entityType: 'PF'
  },
  {
    id: 'inst_condo_buona_vitta',
    name: 'Condomínio Buona Vitta Resort',
    category: 'Financiamento',
    subcategory: 'Condomínio Buona Vitta',
    monthlyValue: 377.49,
    currentInstallment: 5,
    totalInstallments: 999,
    endMonthYear: 'Mensal Contínuo',
    contractNotes: 'Condomínio mensal recorrente • Taxa de manutenção',
    isPerpetual: true,
    paymentMethod: 'Boleto Condomínio',
    entityType: 'PF'
  },
  {
    id: 'inst_s26_ultra',
    name: 'Samsung S26 Ultra',
    category: 'Compras',
    subcategory: 'Eletrônicos',
    monthlyValue: 274.66,
    currentInstallment: 4,
    totalInstallments: 21,
    endMonthYear: 'Novembro/2027',
    contractNotes: 'Aquisição smartphone em 21x',
    paymentMethod: 'Cartão C6 Carbon Black PF',
    entityType: 'PF'
  },
  {
    id: 'inst_vivara',
    name: 'Aliança Solitário Vivara',
    category: 'Compras',
    subcategory: 'Joias & Presentes',
    monthlyValue: 382.37,
    currentInstallment: 7,
    totalInstallments: 10,
    endMonthYear: 'Outubro/2026',
    contractNotes: 'Término em Outubro/2026',
    paymentMethod: 'Cartão C6 Carbon Black PF',
    entityType: 'PF'
  },
  {
    id: 'inst_lava_seca',
    name: 'Lava e Seca Midea',
    category: 'Casa',
    subcategory: 'Eletrodomésticos',
    monthlyValue: 355.00,
    currentInstallment: 7,
    totalInstallments: 10,
    endMonthYear: 'Outubro/2026',
    contractNotes: 'Término em Outubro/2026 • Fatura Itaú',
    paymentMethod: 'Cartão Itaú PF',
    entityType: 'PF'
  },
  {
    id: 'inst_tv_tcl',
    name: 'TV TCL 55"',
    category: 'Casa',
    subcategory: 'Eletrônicos',
    monthlyValue: 250.92,
    currentInstallment: 7,
    totalInstallments: 10,
    endMonthYear: 'Outubro/2026',
    contractNotes: 'Término em Outubro/2026 • Fatura Nubank',
    paymentMethod: 'Cartão Nubank PF',
    entityType: 'PF'
  },
  {
    id: 'inst_sofa',
    name: 'Sofá Retrátil Sala',
    category: 'Casa',
    subcategory: 'Móveis',
    monthlyValue: 197.00,
    currentInstallment: 4,
    totalInstallments: 10,
    endMonthYear: 'Dezembro/2026',
    contractNotes: 'Mobiliário residencial em 10x',
    paymentMethod: 'Cartão C6 Carbon Black PF',
    entityType: 'PF'
  }
]

export function parseInstallmentPattern(description: string): {
  isInstallment: boolean
  current: number
  total: number
  cleanName: string
} | null {
  if (!description) return null

  // 1. Padrão "10/12", "(03/10)", "PARC 02/06", "10 de 12", "10-12"
  const matchFraction = description.match(/(?:parc\.?|parcela)?\s*\(?\s*(\d{1,2})\s*(?:\/|de|-)\s*(\d{1,2})\s*\)?/i)
  if (matchFraction) {
    const current = parseInt(matchFraction[1], 10)
    const total = parseInt(matchFraction[2], 10)
    if (current > 0 && total >= current && total <= 120) {
      const cleanName = description.replace(matchFraction[0], '').replace(/\s{2,}/g, ' ').trim()
      return {
        isInstallment: true,
        current,
        total,
        cleanName: cleanName || description
      }
    }
  }

  // 2. Padrão "10x", "12X"
  const matchX = description.match(/\b(\d{1,2})\s*[xX]\b/)
  if (matchX) {
    const total = parseInt(matchX[1], 10)
    if (total > 1 && total <= 120) {
      const cleanName = description.replace(matchX[0], '').replace(/\s{2,}/g, ' ').trim()
      return {
        isInstallment: true,
        current: 1,
        total,
        cleanName: cleanName || description
      }
    }
  }

  return null
}

export function formatEndMonthYear(current: number, total: number): string {
  const now = new Date()
  const remainingMonths = Math.max(0, total - current)
  const endDate = new Date(now.getFullYear(), now.getMonth() + remainingMonths, 1)
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return `${months[endDate.getMonth()]}/${endDate.getFullYear()}`
}

export class InstallmentStore {
  static getInstallments(): InstallmentItem[] {
    if (typeof window === 'undefined') return DEFAULT_INSTALLMENTS
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INSTALLMENTS))
        return DEFAULT_INSTALLMENTS
      }
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INSTALLMENTS
    } catch (_) {
      return DEFAULT_INSTALLMENTS
    }
  }

  static saveInstallments(items: InstallmentItem[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      window.dispatchEvent(new CustomEvent('leaomed_installments_updated', { detail: { installments: items } }))
    } catch (_) {}
  }

  static addInstallment(item: Omit<InstallmentItem, 'id'>): InstallmentItem {
    const items = this.getInstallments()
    const newId = `inst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const newItem: InstallmentItem = {
      ...item,
      id: newId
    }
    items.unshift(newItem)
    this.saveInstallments(items)
    return newItem
  }

  static updateInstallment(id: string, updates: Partial<InstallmentItem>): boolean {
    const items = this.getInstallments()
    const index = items.findIndex(i => i.id === id)
    if (index === -1) return false

    items[index] = {
      ...items[index],
      ...updates
    }
    this.saveInstallments(items)
    return true
  }

  static deleteInstallment(id: string): boolean {
    const items = this.getInstallments()
    const filtered = items.filter(i => i.id !== id)
    if (filtered.length === items.length) return false

    this.saveInstallments(filtered)
    return true
  }

  // Roteamento Automático ao Adicionar / Importar Transação
  static syncFromTransaction(tx: {
    description: string
    amount: number
    accountOrCard: string
    category: string
    subcategory?: string
    entityType?: 'PF' | 'PJ'
  }): InstallmentItem | null {
    const parsed = parseInstallmentPattern(tx.description)
    if (!parsed || !parsed.isInstallment) return null

    const items = this.getInstallments()
    const monthlyVal = Math.abs(tx.amount)
    const cleanLower = parsed.cleanName.toLowerCase()

    // Procura se já existe um parcelamento correspondente
    const existing = items.find(i => {
      const iLower = i.name.toLowerCase()
      return iLower.includes(cleanLower) || cleanLower.includes(iLower)
    })

    if (existing) {
      this.updateInstallment(existing.id, {
        currentInstallment: parsed.current,
        totalInstallments: parsed.total,
        monthlyValue: monthlyVal > 0 ? monthlyVal : existing.monthlyValue,
        paymentMethod: tx.accountOrCard || existing.paymentMethod,
        category: tx.category || existing.category,
        subcategory: tx.subcategory || existing.subcategory,
        endMonthYear: formatEndMonthYear(parsed.current, parsed.total)
      })
      return existing
    } else {
      const created = this.addInstallment({
        name: parsed.cleanName || tx.description,
        category: tx.category || 'Outros',
        subcategory: tx.subcategory || 'Geral',
        monthlyValue: monthlyVal,
        currentInstallment: parsed.current,
        totalInstallments: parsed.total,
        endMonthYear: formatEndMonthYear(parsed.current, parsed.total),
        paymentMethod: tx.accountOrCard || 'Cartão de Crédito',
        contractNotes: `Detectado automaticamente (${parsed.current}/${parsed.total})`,
        entityType: tx.entityType || 'PF'
      })
      return created
    }
  }
}
