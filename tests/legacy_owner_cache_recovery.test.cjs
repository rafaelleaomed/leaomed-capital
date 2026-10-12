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
cache.set('leaomed_granular_txs_user', JSON.stringify([{ id: 'private-tx-a', date: '2026-10-01', description: 'Synthetic owner expense', amount: -10 }]))
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
assert.equal(getVerifiedOwnerLegacyTransactions(owner).length, 1)
assert.equal(recoverVerifiedOwnerCaches(owner), 0, 'Recovery is one-time and does not resurrect deleted current entries')
setFinancialUserScope('user-b')
assert.equal(financialStorage.getItem('leaomed_credit_cards_v3'), null)
assert.deepEqual(getVerifiedOwnerLegacyTransactions({ eligible: true, userId: 'user-b', email: 'b@synthetic.test' }), [])
assert.ok(cache.has('leaomed_credit_cards_v3'), 'The original backup must remain intact')
console.log('Legacy cache recovery passed: verified owner only, no foreign reads, stable scope, one-time restoration, original backup preserved')
