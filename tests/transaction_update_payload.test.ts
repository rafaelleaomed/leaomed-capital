import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPersistedTransactionUpdate } from '../utils/transactionUpdatePayload.ts'

test('persists every editable transaction field supported by the database', () => {
  const original = {
    accountOrCard: 'Conta principal',
    subdivision: undefined,
    investmentAsset: undefined,
    investmentAction: undefined
  }
  const payload = buildPersistedTransactionUpdate('tx-1', original, {
    description: 'Compra editada',
    amount: -25.5,
    date: '2026-10-20',
    accountOrCard: 'Conta principal',
    category: 'Saúde',
    subcategory: 'Farmácia',
    subdivision: undefined,
    investmentAsset: undefined,
    investmentAction: undefined,
    isFixed: true,
    isIgnored: false
  })

  assert.deepEqual(payload, {
    id: 'tx-1',
    description: 'Compra editada',
    amount: -25.5,
    date: '2026-10-20',
    category: 'Saúde',
    subcategory: 'Farmácia',
    is_fixed: true,
    is_ignored: false
  })
})

test('rejects edits that the database cannot persist instead of losing them silently', () => {
  const original = {
    accountOrCard: 'Conta principal',
    subdivision: undefined,
    investmentAsset: undefined,
    investmentAction: undefined
  }

  assert.throws(
    () => buildPersistedTransactionUpdate('tx-1', original, { accountOrCard: 'Outra conta' }),
    /conta, subdivisão ou vínculo de investimento/i
  )
})
