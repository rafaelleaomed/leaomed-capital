const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { compileTypeScript } = require('./register-typescript-tests.cjs')

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8').replace(/from ['"]@\/([^'"]+)['"]/g, (_, relative) => `from ${JSON.stringify(path.resolve(__dirname, '..', relative))}`)
  module._compile(compileTypeScript(source, filename), filename)
}

const cache = new Map()
global.window = {
  location: { pathname: '/dashboard' },
  dispatchEvent() {},
  localStorage: {
    getItem: key => cache.get(key) ?? null,
    setItem: (key, value) => cache.set(key, value),
    removeItem: key => cache.delete(key)
  }
}
global.CustomEvent = class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail } }
const { setFinancialUserScope, financialStorage } = require('../utils/userScopedStorage.ts')
const { InstallmentStore } = require('../utils/installmentStore.ts')
const { CreditCardStore } = require('../utils/creditCardStore.ts')
const { InvestmentPortfolioStore } = require('../utils/investmentPortfolioStore.ts')
const { GranularTransactionStore } = require('../utils/granularTransactionStore.ts')
const { CategoryRulesEngine } = require('../utils/categoryRulesEngine.ts')

test('each user starts empty; legacy caches are never attributed to another user', () => {
  cache.set('leaomed_installment_store_v2', JSON.stringify([{ id: 'legacy-private' }]))
  cache.set('leaomed_credit_cards_v3', JSON.stringify([{ id: 'legacy-private' }]))
  setFinancialUserScope('synthetic-A')
  assert.deepEqual(InstallmentStore.getInstallments(), [])
  assert.deepEqual(CreditCardStore.getCards(), [])
  assert.deepEqual(InvestmentPortfolioStore.getAssets(), [])
  InstallmentStore.addInstallment({ name: 'Synthetic A', monthlyValue: 10, category: 'Teste', currentInstallment: 1, totalInstallments: 2, endMonthYear: 'Teste', paymentMethod: 'Teste' })
  CreditCardStore.saveCards([{ id: 'card-A' }])
  InvestmentPortfolioStore.saveAssets([{ name: 'asset-A' }])
  InvestmentPortfolioStore.logMovement({ id: 'movement-A' })
  GranularTransactionStore.addTransaction({ description: 'Synthetic A', amount: -10, accountOrCard: 'Teste', category: 'Teste', subcategory: 'Teste', date: '2026-01-01', entityType: 'PF', isFixed: false, isIgnored: false, source: 'MANUAL' })
  financialStorage.setItem('leaomed_categorization_rules', JSON.stringify([{ id: 'rule-A', pattern: 'synthetic-owner-rule', category: 'Categoria particular A', subcategory: 'Teste A' }]))
  assert.equal(CategoryRulesEngine.predict('synthetic-owner-rule', 'PF').category, 'Categoria particular A')
  financialStorage.setItem('profile', 'profile-A')
  setFinancialUserScope('synthetic-B')
  assert.deepEqual(InstallmentStore.getInstallments(), [])
  assert.deepEqual(CreditCardStore.getCards(), [])
  assert.deepEqual(InvestmentPortfolioStore.getAssets(), [])
  assert.deepEqual(InvestmentPortfolioStore.getMovements(), [])
  assert.deepEqual(GranularTransactionStore.getAll(), [])
  assert.deepEqual(CategoryRulesEngine.getCustomRules(), [])
  assert.notEqual(CategoryRulesEngine.predict('synthetic-owner-rule', 'PF').source, 'USER_RULE')
  assert.equal(financialStorage.getItem('profile'), null)
  InstallmentStore.addInstallment({ name: 'Synthetic B', monthlyValue: 20, category: 'Teste', currentInstallment: 1, totalInstallments: 3, endMonthYear: 'Teste', paymentMethod: 'Teste' })
  assert.equal(InstallmentStore.getInstallments()[0].name, 'Synthetic B')
  setFinancialUserScope('synthetic-A')
  assert.equal(InstallmentStore.getInstallments()[0].name, 'Synthetic A')
  assert.equal(InstallmentStore.getInstallments().length, 1)
  assert.equal(CreditCardStore.getCards()[0].id, 'card-A')
  assert.equal(InvestmentPortfolioStore.getAssets()[0].name, 'asset-A')
  assert.equal(GranularTransactionStore.getAll()[0].description, 'Synthetic A')
  assert.equal(CategoryRulesEngine.getCustomRules()[0].id, 'rule-A')
  assert.equal(CategoryRulesEngine.predict('synthetic-owner-rule', 'PF').category, 'Categoria particular A')
  financialStorage.removeItem('leaomed_categorization_rules')
  InstallmentStore.saveInstallments([])
  CreditCardStore.saveCards([])
  InvestmentPortfolioStore.saveAssets([])
  assert.deepEqual(InstallmentStore.getInstallments(), [])
  assert.deepEqual(CreditCardStore.getCards(), [])
  assert.deepEqual(InvestmentPortfolioStore.getAssets(), [])
  setFinancialUserScope(null)
  assert.equal(financialStorage.getItem('profile'), null)
  assert.deepEqual(GranularTransactionStore.getAll(), [])
  const size = cache.size
  financialStorage.setItem('profile', 'anonymous')
  assert.equal(cache.size, size)
})

test('a delayed response from user A cannot enter user B cache or survive A-B-A', async () => {
  setFinancialUserScope('synthetic-A')
  let release
  global.fetch = () => new Promise(resolve => { release = resolve })
  const pending = GranularTransactionStore.fetchFromApi()
  setFinancialUserScope('synthetic-B')
  release({ ok: true, json: async () => ({ success: true, transactions: [{ id: 'private-A', amount: '10', date: '2026-01-01' }] }) })
  assert.deepEqual(await pending, [])
  assert.deepEqual(GranularTransactionStore.getAll(), [])
  setFinancialUserScope('synthetic-A')
  const pendingRules = CategoryRulesEngine.syncFromPostgres()
  setFinancialUserScope('synthetic-B')
  setFinancialUserScope('synthetic-A')
  release({ ok: true, json: async () => ({ rules: [{ id: 'stale-A' }] }) })
  assert.deepEqual(await pendingRules, [])
  assert.deepEqual(CategoryRulesEngine.getCustomRules(), [])
})

test('client modules and their compiled output contain no private seed sentinels, including onboarding', () => {
  const blocked = ['3336.28', '1865.33', '6837.22', '377.49', '274.66', '382.37', '493464', 'GVI126924', 'Dr. Rafael Leão', '9482']
  for (const directory of ['components', 'utils']) {
    const root = path.resolve(__dirname, '..', directory)
    for (const relative of fs.readdirSync(root, { recursive: true }).filter(file => /\.(tsx|ts)$/.test(file))) {
      const source = fs.readFileSync(path.join(root, relative), 'utf8')
      const compiled = compileTypeScript(source, path.join(root, relative))
      assert.equal(blocked.some(value => source.includes(value) || compiled.includes(value)), false, `${directory}/${relative} must contain no private seed`)
    }
  }
})
