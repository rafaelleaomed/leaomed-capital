export interface PjTransactionRecord {
  id: string
  entityType: 'PF' | 'PJ'
  date: string
  description: string
  amount: number
  accountOrCard: string
  category: string
  subcategory: string
  subdivision?: string
  isFixed: boolean
  isIgnored: boolean
  source: 'INITIAL_AUDIT' | 'MANUAL' | 'INVOICE' | 'OCR' | 'OPEN_FINANCE'
}

export const PJ_REAL_TRANSACTIONS: PjTransactionRecord[] = []
