const assert = require('node:assert/strict')
require('../scripts/register-typescript-tests.cjs')
const cache = new Map()
let financialReads = 0
global.CustomEvent = class { constructor(type) { this.type = type } }
global.window = {
  dispatchEvent() {},
  localStorage: {
    getItem: key => { if (!key.includes('email')) financialReads++; return cache.get(key) ?? null },
    setItem: (key, value) => cache.set(key, value),
    removeItem: key => cache.delete(key),
  },
}
const { setFinancialUserScope, financialStorage } = require('../utils/userScopedStorage.ts')
const { recoverVerifiedOwnerCaches, getVerifiedOwnerLegacyTransactions } = require('../utils/legacyFinancialRecovery.ts')
cache.set('leaomed_current_user_email', 'owner@synthetic.test')
cache.set('leaomed_credit_cards_v3', JSON.stringify([{ id: 'private-a' }]))
cache.set('leaomed_portfolio_assets_v2', JSON.stringify([{ name: 'private-a' }]))
cache.set('leaomed_granular_txs_user', JSON.stringify([
  { id: 'private-tx-a', date: '2026-10-01', description: 'Synthetic owner expense', amount: -10 },
]))
cache.set('leaomed_granular_transactions_v5', JSON.stringify([
  { id: 'private-tx-a', date: '2026-10-01', description: 'Synthetic owner expense', amount: -10 },
  { id: 'historic-pf-b', date: '2026-09-01', description: 'Historic PF expense', amount: -20, entityType: 'PF' },
]))
cache.set('leaomed_granular_transactions_v4', JSON.stringify([
  { id: 'historic-pj-c', date: '2025-09-01', description: 'Historic PJ income', amount: 100, entityType: 'PJ' },
]))
cache.set('leaomed_granular_transactions_user', JSON.stringify([
  { id: 'historic-user-d', date: '2025-08-01', description: 'Intermediate generation', amount: -30 },
]))
cache.set('leaomed_granular_transactions_v3', JSON.stringify([
  { invalid: true },
  { id: 'historic-v3-e', date: '2025-07-01', description: 'V3 generation', amount: -40 },
]))
cache.set('leaomed_granular_transactions_v2', JSON.stringify([
  { id: 'historic-v2-f', date: '2025-06-01', description: 'V2 generation', amount: -50 },
]))
cache.set('leaomed_granular_txs', JSON.stringify([
  { id: 'historic-txs-g', date: '2025-05-01', description: 'Oldest generation', amount: 60 },
]))
setFinancialUserScope('user-b')
assert.equal(recoverVerifiedOwnerCaches({ eligible: false, userId: 'user-b', email: 'b@synthetic.test' }), 0)
assert.equal(financialReads, 0, 'An ineligible account must never inspect legacy financial caches')
assert.equal(recoverVerifiedOwnerCaches({ eligible: true, userId: 'user-a', email: 'owner@synthetic.test' }), 0)
assert.equal(financialReads, 0, 'A stale capability from A must not migrate into B')
setFinancialUserScope('user-a')
const owner = { eligible: true, userId: 'user-a', email: 'owner@synthetic.test' }
financialStorage.setItem('leaomed_credit_cards_v3', '[]')
assert.equal(recoverVerifiedOwnerCaches(owner), 2)
assert.equal(JSON.parse(financialStorage.getItem('leaomed_credit_cards_v3'))[0].id, 'private-a')
financialStorage.setItem('leaomed_owner_transactions_recovery_v1', 'complete')
const recoveredTransactions = getVerifiedOwnerLegacyTransactions(owner)
assert.equal(recoveredTransactions.length, 7, 'All historic storage generations must be recovered')
assert.deepEqual(recoveredTransactions.map(tx => tx.id), [
  'private-tx-a', 'historic-user-d', 'historic-pf-b', 'historic-pj-c',
  'historic-v3-e', 'historic-v2-f', 'historic-txs-g',
])
financialStorage.setItem('leaomed_owner_transactions_recovery_v2', 'complete')
assert.deepEqual(getVerifiedOwnerLegacyTransactions(owner), [], 'The new recovery marker must prevent repeated imports')
assert.equal(recoverVerifiedOwnerCaches(owner), 0, 'Recovery is one-time and does not resurrect deleted current entries')
setFinancialUserScope('user-b')
assert.equal(financialStorage.getItem('leaomed_credit_cards_v3'), null)
assert.deepEqual(getVerifiedOwnerLegacyTransactions({ eligible: true, userId: 'user-b', email: 'b@synthetic.test' }), [])
assert.ok(cache.has('leaomed_credit_cards_v3'), 'The original backup must remain intact')
console.log('Legacy cache recovery passed: verified owner only, no foreign reads, stable scope, one-time restoration, original backup preserved')
