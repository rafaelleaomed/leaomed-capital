
import { financialStorage, getFinancialUserScope } from './userScopedStorage'


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

export const DEFAULT_INSTALLMENTS: InstallmentItem[] = []

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
    if (typeof window === 'undefined') return []
    try {
      const raw = financialStorage.getItem(STORAGE_KEY)
      if (!raw) {
        financialStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_INSTALLMENTS))
        return []
      }
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (_) {
      return []
    }
  }

  static saveInstallments(items: InstallmentItem[]): void {
    if (typeof window === 'undefined' || !getFinancialUserScope()) return
    try {
      financialStorage.setItem(STORAGE_KEY, JSON.stringify(items))
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
