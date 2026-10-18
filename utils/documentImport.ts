export interface ParsedDocumentTransaction {
  desc: string
  val: number | string
  date: string
  competenceDate?: string
  accountOrCard?: string
  cat?: string
  subcategory?: string
  isFixed?: boolean
  isCardBillPayment?: boolean
  entryType?: string
  signedAmount?: number
  direction?: 'debit' | 'credit'
}

/** Invoice debit/credit semantics differ from signed bank-statement amounts. */
export function documentTransactionsForPersistence(transactions: ParsedDocumentTransaction[]) {
  return transactions.flatMap(transaction => {
    const type = transaction.entryType || (transaction.isCardBillPayment ? 'bill_payment' : 'purchase')
    if (type === 'bill_payment' || transaction.isCardBillPayment) return []
    const value = typeof transaction.val === 'number' ? transaction.val : Number(transaction.val)
    const signed = transaction.signedAmount ?? value
    if (!Number.isFinite(signed) || signed === 0) return []
    const credit = transaction.direction === 'credit' || type === 'refund' || signed < 0
    return [{
      date: transaction.date,
      competenceDate: transaction.competenceDate || transaction.date,
      description: transaction.desc,
      amount: credit ? Math.abs(signed) : -Math.abs(signed),
      accountOrCard: transaction.accountOrCard,
      category: transaction.cat || 'Outros',
      subcategory: transaction.subcategory || 'Geral',
      isFixed: Boolean(transaction.isFixed),
      isIgnored: false,
    }]
  })
}
