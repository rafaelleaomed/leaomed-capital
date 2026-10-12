// Synthetic two-user API regression tests. No database, provider requests or credentials.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const crypto = require('node:crypto')
const root = path.resolve(__dirname, '..')
let userId = 'user-a'
let queries = []
let tokenOwner
let webhookWrites = 0
const accounts = [{ id: 'account-a', user_id: 'user-a', type: 'PF' }, { id: 'account-apj', user_id: 'user-a', type: 'PJ' }, { id: 'account-b', user_id: 'user-b', type: 'PF' }, { id: 'account-bpj', user_id: 'user-b', type: 'PJ' }]
const installments = [{ id: 'installment-a', user_id: 'user-a', description: 'A only', is_active: true }, { id: 'installment-b', user_id: 'user-b', description: 'B only', is_active: true }]
const transactions = []

async function sql(strings, ...values) {
  const query = strings.join('?').replace(/\s+/g, ' ').trim()
  queries.push({ query, values })
  if (query.startsWith('INSERT INTO public.users')) {
    assert.equal(values[0], userId, 'Only the verified session identity may be created')
    return []
  }
  if (/SELECT.*FROM public\.accounts/.test(query)) {
    assert.match(query, /user_id = \?/)
    return accounts.filter(a => a.user_id === userId && (!query.includes('WHERE id =') || a.id === values[0]))
  }
  if (query.startsWith('INSERT INTO public.transactions')) {
    assert.match(query, /WHERE public\.transactions\.user_id = EXCLUDED\.user_id/)
    const [owner, raw, account, amount, date, competence, description, category, subcategory, fixed, ignored, hash] = values
    assert.equal(owner, userId)
    assert.ok(accounts.some(a => a.id === account && a.user_id === owner))
    const existing = transactions.find(t => t.hash === hash)
    if (existing && existing.user_id !== owner) return []
    if (existing) return [{ id: existing.id }]
    const t = { id: `transaction-${transactions.length}`, user_id: owner, account_id: account, hash, description }
    transactions.push(t)
    return [{ id: t.id }]
  }
  if (query.includes('FROM public.transactions t')) {
    assert.match(query, /a\.user_id = t\.user_id/)
    assert.match(query, /t\.user_id = \?/)
    return transactions.filter(t => t.user_id === userId)
  }
  if (query.startsWith('UPDATE public.transactions')) {
    assert.match(query, /WHERE id = \? AND user_id = \?/)
    const [id, owner] = values.slice(-2)
    return transactions.filter(t => t.id === id && t.user_id === owner)
  }
  if (query.startsWith('DELETE FROM public.category_rules')) {
    assert.match(query, /WHERE id = \? AND user_id = \?/)
    return []
  }
  if (query.includes('public.installments')) {
    if (query.startsWith('SELECT')) {
      assert.match(query, /WHERE user_id = \?/)
      return installments.filter(i => i.user_id === values[0] && i.is_active)
    }
    if (query.startsWith('INSERT')) {
      assert.equal(values[0], userId, 'Body user_id must never override session owner')
      return [{ id: 'new-installment', user_id: values[0] }]
    }
    assert.match(query, /WHERE id = \? AND user_id = \?/)
    const [id, owner] = values.slice(-2)
    const item = installments.find(i => i.id === id && i.user_id === owner)
    if (!item) return []
    if (query.includes('is_active = FALSE')) item.is_active = false
    return [item]
  }
  if (/FROM public\.(monthly_history|investment_targets|investment_assets|category_rules)/.test(query)) {
    assert.match(query, /WHERE user_id = \?/)
    return []
  }
  if (query.includes('FROM public.categories')) {
    assert.match(query, /t\.user_id = \?/)
    assert.ok(!query.includes('LEFT JOIN public.transactions'), 'Empty accounts must not receive private global category labels')
    return []
  }
  if (query.startsWith('AND') || query === '') return { fragment: query }
  throw new Error(`Unexpected synthetic SQL: ${query}`)
}
const originalLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (request === '@/utils/db') return { sql }
  if (request === '@/utils/auth-helpers') return { getAuthenticatedUserId: async () => ({ userId, user: userId ? { id: userId, email: `${userId}@synthetic.invalid`, email_confirmed_at: '2026-01-01' } : null, errorResponse: userId ? null : Response.json({ success: false }, { status: 401 }) }) }
  if (request === 'pluggy-sdk') return { PluggyClient: class { async createConnectToken(item, options) { tokenOwner = options.clientUserId; return { accessToken: 'synthetic-token' } } } }
  if (request === '@supabase/supabase-js') return { createClient: () => ({ from: () => ({ insert: async () => { webhookWrites++; return { error: null } } }) }) }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, isMain)
}
require.extensions['.ts'] = (module, file) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } })
  module._compile(outputText, file)
}
const req = (route, body, method = 'POST') => new Request(`http://localhost/api/${route}`, { method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } })

async function main() {
  const routes = Object.fromEntries(['installments', 'transactions', 'investments', 'history', 'budget', 'category-rules', 'connect-token'].map(name => [name, require(`../app/api/${name}/route.ts`)]))
  userId = null
  for (const [name, route] of Object.entries(routes)) {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      if (!route[method]) continue
      const response = await route[method](method === 'GET' || method === 'DELETE' ? new Request(`http://localhost/api/${name}?id=installment-a`) : req(name, {}, method))
      assert.equal(response.status, 401, `${name}/${method} must reject anonymous user`)
    }
  }
  assert.equal(queries.length, 0, 'Anonymous requests must perform no SQL')
  for (const owner of ['user-a', 'user-b']) {
    userId = owner
    const body = await (await routes.installments.GET()).json()
    assert.deepEqual(body.installments.map(i => i.user_id), [owner])
    for (const name of ['history', 'investments', 'budget', 'category-rules']) assert.equal((await routes[name].GET(new Request(`http://localhost/api/${name}`))).status, 200)
  }
  userId = 'user-b'
  assert.equal((await routes.installments.PUT(req('installments', { id: 'installment-a', description: 'intrusion' }, 'PUT'))).status, 404)
  assert.equal((await routes.installments.DELETE(new Request('http://localhost/api/installments?id=installment-a', { method: 'DELETE' }))).status, 404)
  assert.equal(installments[0].is_active, true)
  const created = await (await routes.installments.POST(req('installments', { user_id: 'user-a', description: 'synthetic' }))).json()
  assert.equal(created.installment.user_id, 'user-b')
  const tx = { amount: -10, date: '2026-10-12', description: 'Synthetic purchase' }
  queries = []
  assert.equal((await routes.transactions.POST(req('transactions', { transactions: [{ ...tx, accountId: 'account-b' }, { ...tx, accountId: 'account-a' }] }))).status, 404)
  assert.equal(queries.some(q => /INSERT|UPDATE/.test(q.query)), false, 'Mixed batch must reject foreign account before writing anything')
  for (const [owner, account] of [['user-a', 'account-a'], ['user-b', 'account-b']]) {
    userId = owner
    assert.equal((await routes.transactions.POST(req('transactions', { ...tx, user_id: 'other', accountId: account }))).status, 200)
    const body = await (await routes.transactions.GET(new Request('http://localhost/api/transactions?period=2026-10&entity=PF'))).json()
    assert.deepEqual(body.transactions.map(t => t.user_id), [owner])
  }
  assert.equal(transactions.length, 2)
  assert.equal((await routes.transactions.PUT(req('transactions', { id: transactions[0].id, category: 'intrusion' }, 'PUT'))).status, 404)
  assert.equal((await routes['category-rules'].DELETE(new Request('http://localhost/api/category-rules?id=foreign-rule', { method: 'DELETE' }))).status, 404)
  assert.notEqual(transactions[0].hash, transactions[1].hash)
  assert.equal((await routes.transactions.POST(req('transactions', { ...tx, accountId: 'account-b', raw_id: 'new-import-id' }))).status, 200)
  assert.equal(transactions.length, 2, 'The legacy hash must still deduplicate re-imports with different raw IDs')
  for (const url of ['http://localhost/api/transactions', 'http://localhost/api/transactions?period=2026-10']) {
    const body = await (await routes.transactions.GET(new Request(url))).json()
    assert.deepEqual(body.transactions.map(t => t.user_id), ['user-b'])
  }
  // Simulate a legacy poisoned row whose global hash collides with B's valid account.
  const collisionHash = crypto.createHash('sha256').update('2026-10-12|-10.00|collision purchase|account-b|').digest('hex')
  const poisoned = { id: 'legacy-foreign', user_id: 'user-a', account_id: 'account-b', hash: collisionHash, description: 'A confidential legacy value' }
  transactions.push(poisoned)
  const collision = await routes.transactions.POST(req('transactions', { ...tx, accountId: 'account-b', description: 'Collision purchase' }))
  assert.equal(collision.status, 500, 'Blocked cross-owner upsert must not report success')
  assert.equal(poisoned.user_id, 'user-a')
  assert.equal(poisoned.description, 'A confidential legacy value')
  assert.equal(transactions.length, 3)
  process.env.PLUGGY_CLIENT_ID = 'synthetic'
  process.env.PLUGGY_CLIENT_SECRET = 'synthetic'
  assert.equal((await routes['connect-token'].POST(req('connect-token', { userId: 'user-a' }))).status, 200)
  assert.equal(tokenOwner, 'user-b')
  const webhook = require('../app/api/webhooks/pluggy/route.ts')
  process.env.ENABLE_PLUGGY_WEBHOOK = 'true'
  delete process.env.PLUGGY_WEBHOOK_SECRET
  assert.equal((await webhook.POST(req('webhooks/pluggy', {}))).status, 503)
  process.env.PLUGGY_WEBHOOK_SECRET = 'synthetic-webhook-secret'
  assert.equal((await webhook.POST(req('webhooks/pluggy', { eventId: 'synthetic', event: 'item/updated' }))).status, 401)
  assert.equal(webhookWrites, 0)
  process.env.SUPABASE_URL = 'https://synthetic.invalid'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'synthetic'
  const authenticatedWebhook = new Request('http://localhost/api/webhooks/pluggy', { method: 'POST', headers: { authorization: 'Bearer synthetic-webhook-secret' }, body: JSON.stringify({ eventId: 'synthetic', event: 'item/updated', itemId: 'synthetic-item' }) })
  assert.equal((await webhook.POST(authenticatedWebhook)).status, 200)
  assert.equal(webhookWrites, 1)
  process.env.JEV_PLATFORM_OWNER_EMAIL = 'user-a@synthetic.invalid'
  process.env.JEV_PLATFORM_OWNER_USER_ID = 'user-a'
  const recovered = { transactions: [{ ...tx, description: 'Synthetic recovered expense' }], recoverLegacy: true, expectedUserId: 'user-a' }
  queries = []
  assert.equal((await routes.transactions.POST(req('transactions', recovered))).status, 403)
  assert.equal(queries.length, 0, 'Another account must not execute legacy recovery writes')
  userId = 'user-a'
  assert.equal((await routes.transactions.POST(req('transactions', { ...recovered, expectedUserId: 'user-b' }))).status, 403)
  assert.equal((await routes.transactions.POST(req('transactions', recovered))).status, 200)
  const recoveredCount = transactions.length
  assert.equal((await routes.transactions.POST(req('transactions', recovered))).status, 200)
  assert.equal(transactions.length, recoveredCount, 'Repeating recovery must not duplicate records')
  console.log('API isolation passed: anonymous rejection; two-user reads; IDOR/mixed-batch rejection; session ownership; per-user hashes; webhook authentication; connect-token ownership.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
