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

export const DEFAULT_CREDIT_CARDS: CreditCardItem[] = [
  {
    id: 'card_c6_carbon',
    name: 'Cartão C6 Carbon Black PF',
    institution: 'C6 Bank',
    limit: 50000.00,
    spent: 6800.00,
    closingDay: 20,
    dueDay: 28,
    additionalCards: '1 adicional (Esposa)',
    cardholder: 'Dr. Rafael Leão',
    lastDigits: '9482',
    badge: 'Principal (PF) - Veículo & Pessoal',
    color: 'bg-slate-900',
    entityType: 'PF',
    status: 'Fatura auditada (PDF)',
    notes: 'Inclui Parcela Entrada T-Cross'
  },
  {
    id: 'card_itau_pf',
    name: 'Cartão Itaú PF',
    institution: 'Banco Itaú',
    limit: 20000.00,
    spent: 355.00,
    closingDay: 8,
    dueDay: 15,
    additionalCards: 'Nenhum',
    cardholder: 'Dr. Rafael Leão',
    lastDigits: '3104',
    badge: 'Casa & Eletro (PF)',
    color: 'bg-orange-600',
    entityType: 'PF',
    status: 'Fatura auditada',
    notes: 'Parcela Lava e Seca Midea (R$ 355,00)'
  },
  {
    id: 'card_nubank_pf',
    name: 'Cartão Nubank PF',
    institution: 'Nubank',
    limit: 15000.00,
    spent: 250.92,
    closingDay: 3,
    dueDay: 10,
    additionalCards: 'Nenhum',
    cardholder: 'Dr. Rafael Leão',
    lastDigits: '7712',
    badge: 'Tecnologia & Família (PF)',
    color: 'bg-purple-700',
    entityType: 'PF',
    status: 'Fatura auditada',
    notes: 'Parcela TV TCL (R$ 250,92)'
  }
]

export class CreditCardStore {
  static getCards(): CreditCardItem[] {
    if (typeof window === 'undefined') return DEFAULT_CREDIT_CARDS
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CREDIT_CARDS))
        return DEFAULT_CREDIT_CARDS
      }
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CREDIT_CARDS
    } catch (_) {
      return DEFAULT_CREDIT_CARDS
    }
  }

  static saveCards(cards: CreditCardItem[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
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
    return DEFAULT_CREDIT_CARDS
  }
}
