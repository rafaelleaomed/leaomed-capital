const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const { compileTypeScript } = require('../scripts/register-typescript-tests.cjs')

const root = path.resolve(__dirname, '..')
let userId = 'user-a'
let sqlCalls = 0
const transactions = [
  { id: 'a-current', user_id: 'user-a', description: 'FÁCIL ESTACIONAMENTO', category: 'Outros', subcategory: 'Outros', amount: -10, date: '2026-10-01' },
  { id: 'a-past', user_id: 'user-a', description: ' fácil   estacionamento ', category: 'Outros', subcategory: 'Outros', amount: -20, date: '2025-01-01' },
  { id: 'a-different', user_id: 'user-a', description: 'Fácil Estacionamento Centro', category: 'Outros', subcategory: 'Outros', amount: -30, date: '2025-01-02' },
  { id: 'a-house', user_id: 'user-a', description: 'Condomínio', category: 'Casa', subcategory: 'Condomínio', amount: -40, date: '2025-01-03' },
  { id: 'b-same', user_id: 'user-b', description: 'FÁCIL ESTACIONAMENTO', category: 'Outros', subcategory: 'Outros', amount: -50, date: '2025-01-04' },
  { id: 'b-house', user_id: 'user-b', description: 'Condomínio', category: 'Casa', subcategory: 'Condomínio', amount: -60, date: '2025-01-05' },
]
const rules = [
  { id: 'rule-a', user_id: 'user-a', category: 'Casa', subcategory: 'Condomínio' },
  { id: 'rule-b', user_id: 'user-b', category: 'Casa', subcategory: 'Condomínio' },
]
const normalize = value => String(value || '').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ')

async function sql(strings, ...values) {
  sqlCalls++
  const query = strings.join('?').replace(/\s+/g, ' ').trim()
  if (query.startsWith('WITH owned_target AS')) {
    assert.match(query, /WHERE id = \? AND user_id = \?/)
    assert.match(query, /t\.user_id = \?/)
    const [id, owner] = values
    const target = transactions.find(item => item.id === id && item.user_id === owner)
    if (!target) return []
    const sourceDescription = values[values.length - 1]
    const category = values[10]
    const subcategory = values[11]
    const updated = transactions.filter(item => item.user_id === owner && (item.id === id || normalize(item.description) === normalize(sourceDescription)))
    updated.forEach(item => {
      item.category = category
      item.subcategory = subcategory
      if (item.id === id) {
        item.description = values[3] ?? item.description
        item.amount = values[5] ?? item.amount
        item.date = values[7] ?? item.date
      }
    })
    return updated
  }
  if (query.startsWith('WITH updated_transactions AS') && query.includes('SET category = ?')) {
    assert.equal(values[1], userId)
    assert.equal(values[4], userId)
    const targetCategory = values[0]
    const sourceCategory = values[2]
    const ownedTransactions = transactions.filter(item => item.user_id === userId && normalize(item.category) === normalize(sourceCategory))
    const ownedRules = rules.filter(item => item.user_id === userId && normalize(item.category) === normalize(sourceCategory))
    ownedTransactions.forEach(item => { item.category = targetCategory })
    ownedRules.forEach(item => { item.category = targetCategory })
    return [{ transaction_count: ownedTransactions.length, rule_count: ownedRules.length }]
  }
  if (query.startsWith('WITH scoped_items AS')) {
    assert.deepEqual(values, [userId, userId])
    return transactions.filter(item => item.user_id === userId).map(item => ({ category: item.category, subcategory: item.subcategory, transaction_count: 1 }))
  }
  throw new Error(`Unexpected SQL: ${query}`)
}

const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === '@/utils/db') return { sql }
  if (request === '@/utils/auth-helpers') return {
    getAuthenticatedUserId: async () => ({
      userId,
      errorResponse: userId ? null : Response.json({ success: false }, { status: 401 }),
    })
  }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, isMain)
}
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, file) => {
  module._compile(compileTypeScript(fs.readFileSync(file, 'utf8'), file), file)
}

const transactionsRoute = require('../app/api/transactions/route.ts')
const categoriesRoute = require('../app/api/categories/route.ts')
const request = (url, method, body) => new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })

async function main() {
  userId = null
  sqlCalls = 0
  assert.equal((await transactionsRoute.PATCH(request('http://localhost/api/transactions', 'PATCH', {}))).status, 401)
  assert.equal((await categoriesRoute.GET()).status, 401)
  assert.equal((await categoriesRoute.POST(request('http://localhost/api/categories', 'POST', {}))).status, 401)
  assert.equal(sqlCalls, 0)

  userId = 'user-b'
  const intrusion = await transactionsRoute.PATCH(request('http://localhost/api/transactions', 'PATCH', {
    id: 'a-current', source_description: 'FÁCIL ESTACIONAMENTO', description: 'Intrusão', amount: -99, date: '2026-10-02', category: 'Intrusão', subcategory: 'Intrusão'
  }))
  assert.equal(intrusion.status, 404)
  assert.equal(transactions.find(item => item.id === 'a-current').category, 'Outros')

  userId = 'user-a'
  const historical = await transactionsRoute.PATCH(request('http://localhost/api/transactions', 'PATCH', {
    id: 'a-current', source_description: 'FÁCIL ESTACIONAMENTO', description: 'FÁCIL ESTACIONAMENTO', amount: -10, date: '2026-10-01', category: 'Transporte', subcategory: 'Rotativo'
  }))
  const historicalBody = await historical.json()
  assert.equal(historical.status, 200)
  assert.equal(historicalBody.updatedCount, 2)
  assert.deepEqual(transactions.filter(item => item.user_id === 'user-a').map(item => item.subcategory), ['Rotativo', 'Rotativo', 'Outros', 'Condomínio'])
  assert.equal(transactions.find(item => item.id === 'b-same').subcategory, 'Outros')

  const merge = await categoriesRoute.POST(request('http://localhost/api/categories', 'POST', {
    action: 'merge_category', sourceCategory: 'Casa', targetCategory: 'Moradia'
  }))
  assert.equal(merge.status, 200)
  assert.equal(transactions.find(item => item.id === 'a-house').category, 'Moradia')
  assert.equal(rules.find(item => item.id === 'rule-a').category, 'Moradia')
  assert.equal(transactions.find(item => item.id === 'b-house').category, 'Casa')
  assert.equal(rules.find(item => item.id === 'rule-b').category, 'Casa')

  const catalog = await (await categoriesRoute.GET()).json()
  assert.ok(catalog.items.every(item => ['Transporte', 'Outros', 'Moradia'].includes(item.category)))
  console.log('Category APIs: exact historical update and category merge remain isolated by authenticated user')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
