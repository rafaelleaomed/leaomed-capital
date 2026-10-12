
import { financialStorage, getFinancialUserScope } from './userScopedStorage'
export interface CreditCardItem {
  id: string
  name: string
  institution: string
  limit: number
  spent: number
  closingDay: number
  dueDay: number
  additionalCards?: string
  cardholder?: string
  lastDigits?: string
  badge: string
  color: string
  entityType: 'PF' | 'PJ'
  status?: string
  notes?: string
}

const STORAGE_KEY = 'leaomed_credit_cards_v3'

export const DEFAULT_CREDIT_CARDS: CreditCardItem[] = []

export class CreditCardStore {
  static getCards(): CreditCardItem[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = financialStorage.getItem(STORAGE_KEY)
      if (!raw) {
        financialStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CREDIT_CARDS))
        return []
      }
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch (_) {
      return []
    }
  }

  static saveCards(cards: CreditCardItem[]): void {
    if (typeof window === 'undefined' || !getFinancialUserScope()) return
    try {
      financialStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
      window.dispatchEvent(new CustomEvent('leaomed_credit_cards_updated', { detail: { cards } }))
    } catch (_) {}
  }

  static addCard(cardData: Omit<CreditCardItem, 'id'>): CreditCardItem {
    const cards = this.getCards()
    const newCard: CreditCardItem = {
      ...cardData,
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }
    const updated = [...cards, newCard]
    this.saveCards(updated)
    return newCard
  }

  static updateCard(id: string, updates: Partial<CreditCardItem>): CreditCardItem | null {
    const cards = this.getCards()
    const idx = cards.findIndex(c => c.id === id)
    if (idx === -1) return null

    const updatedCard: CreditCardItem = {
      ...cards[idx],
      ...updates
    }
    cards[idx] = updatedCard
    this.saveCards(cards)
    return updatedCard
  }

  static deleteCard(id: string): boolean {
    const cards = this.getCards()
    const filtered = cards.filter(c => c.id !== id)
    if (filtered.length === cards.length) return false
    this.saveCards(filtered)
    return true
  }

  static resetToDefaults(): CreditCardItem[] {
    this.saveCards(DEFAULT_CREDIT_CARDS)
    return []
  }
}
