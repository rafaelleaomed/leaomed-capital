import assert from 'node:assert/strict'
import { parseInvoiceFromTextOrOCR } from '../services/aiDocumentParser'
import { documentTransactionsForPersistence } from '../utils/documentImport'
import { C6_SANITIZED_INVOICE } from './fixtures/invoiceProfiles'

const invoice = parseInvoiceFromTextOrOCR(C6_SANITIZED_INVOICE)
const preview = invoice.transactions.map(transaction => ({
  desc: transaction.description,
  val: transaction.amount,
  date: transaction.date,
  competenceDate: `${invoice.period}-01`,
  accountOrCard: transaction.accountOrCard,
  entryType: transaction.entryType,
  signedAmount: transaction.signedAmount,
  direction: transaction.direction,
  isCardBillPayment: transaction.is_card_bill_payment,
}))
const ledger = documentTransactionsForPersistence(preview)
assert.equal(preview.length, 11)
assert.equal(ledger.length, 10, 'The bill payment is not a second purchase')
assert.equal(ledger.filter(transaction => transaction.amount > 0).length, 1, 'Refund reduces the net amount')
assert.equal(-Math.round(ledger.reduce((sum, transaction) => sum + transaction.amount, 0) * 100) / 100, invoice.total_amount)
assert.equal(ledger.some(transaction => /Entrada\s*\+|CET|juros do parcelamento/i.test(transaction.description)), false)
assert.ok(ledger.every(transaction => transaction.competenceDate === '2026-10-01'), 'Installments belong to the invoice month')
assert.equal(ledger[0].date, '2026-05-15', 'The original purchase date remains available')
assert.deepEqual(documentTransactionsForPersistence([{ desc: 'Synthetic', val: 0, date: '2026-10-01' }]), [])
console.log('Document import contract passed: 10 ledger entries, correct credit/debit net, no financing offers, original dates and invoice competence')
