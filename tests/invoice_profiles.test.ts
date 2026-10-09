import assert from 'node:assert/strict'
import { parseInvoiceFromTextOrOCR } from '../services/aiDocumentParser'
import { C6_JANUARY_ROLLOVER, C6_SANITIZED_INVOICE, GENERIC_BANK_FIXTURES } from './fixtures/invoiceProfiles'

const c6 = parseInvoiceFromTextOrOCR(C6_SANITIZED_INVOICE)

assert.equal(c6.diagnostics?.profile_id, 'c6')
assert.equal(c6.period, '2026-10')
assert.equal(c6.total_amount, 1843.68)
assert.equal(c6.transactions.length, 11, 'only posted lines are imported')
assert.equal(c6.transactions.some(item => /Entrada \+ 2x/i.test(item.description)), false, 'financing offers never become purchases')
assert.equal(c6.transactions.some(item => /CET|IOF do parcelamento/i.test(item.description)), false)
assert.equal(c6.transactions.filter(item => item.accountOrCard === 'C6 Carbon Virtual Final 9074').length, 3, 'parser resumes at the next card after an excluded section')

const payment = c6.transactions.find(item => item.entryType === 'bill_payment')
const refund = c6.transactions.find(item => item.entryType === 'refund')
const fee = c6.transactions.find(item => item.entryType === 'fee')
assert.equal(payment?.direction, 'credit')
assert.equal(refund?.signedAmount, -98)
assert.equal(fee?.direction, 'debit')
assert.deepEqual(c6.transactions.find(item => /SEGURO DEMO/i.test(item.description))?.installment_total, 10)
assert.equal(c6.diagnostics?.requiresReview, false)
assert.equal(c6.diagnostics?.delta, 0)
assert.equal(c6.diagnostics?.cardReconciliations.length, 3)
assert.equal(c6.diagnostics?.rejected.some(item => item.reason === 'financial_offer'), true)
assert.equal(JSON.stringify(c6.diagnostics).includes('Entrada + 2x'), false, 'diagnostics must not retain source invoice text')

const january = parseInvoiceFromTextOrOCR(C6_JANUARY_ROLLOVER)
assert.equal(january.transactions[0]?.date, '2025-12-28', 'December purchases on a January bill use the prior year')
assert.equal(january.diagnostics?.requiresReview, false)

for (const [profile, fixture] of Object.entries(GENERIC_BANK_FIXTURES)) {
  const result = parseInvoiceFromTextOrOCR(fixture)
  assert.equal(result.diagnostics?.profile_id, profile)
  assert.ok(result.transactions.length >= 1)
  assert.equal(result.diagnostics?.requiresReview, true, `${profile} remains human-reviewable until a specialized layout is approved`)
  assert.ok(result.diagnostics?.ambiguous_blocks?.[0], `${profile} exposes only sanitized structural ambiguity`)
}

console.log('invoice profile fixtures: C6 reconciliation and bank semantic fallbacks passed')
