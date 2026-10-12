const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
let user = { id: 'nonowner-a', email: 'a@example.invalid' }
let queries = 0
const saved = new Map()
const originalLoad = Module._load
Module._load = function(request, parent, main) {
  if (request === '@/utils/auth-helpers') return { getAuthenticatedUserId: async () => ({ user, userId: user?.id, errorResponse: user ? null : Response.json({}, { status: 401 }) }) }
  if (request === '@/utils/db') return { sql: async (strings, ...values) => {
    queries++
    const query = strings.join('?').replace(/\s+/g, ' ')
    if (query.includes('INSERT INTO public.users')) {
      assert.equal(values[0], user.id)
      assert.equal(values[1], user.email)
      return []
    }
    if (query.includes('INSERT INTO public.installments')) {
      const [id, owner] = values
      assert.equal(owner, user.id, 'Body owner must never determine persistence owner')
      if (saved.has(id)) return []
      saved.set(id, { id, userId: owner, is_active: true })
      return [{ id }]
    }
    assert.match(query, /WHERE user_id = \? AND/)
    const [owner, id] = values
    assert.equal(owner, user.id)
    const row = saved.get(id)
    return row?.userId === owner ? [row] : []
  } }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, main)
}
require.extensions['.ts'] = (module, file) => {
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, file)
}
const item = { id: 'foreign-db-uuid-from-file', user_id: 'nonowner-b', name: 'Synthetic own backup', category: 'Other', monthlyValue: 25, currentInstallment: 1, totalInstallments: 6, endMonthYear: 'Março/2027', paymentMethod: 'Synthetic card' }
const req = (override = {}) => new Request('http://localhost/api/installments/import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ expectedUserId: user?.id, ownershipConfirmed: true, installments: [item], ...override }) })
async function main() {
  process.env.JEV_PLATFORM_OWNER_EMAIL = 'someone-else@example.invalid'
  process.env.JEV_PLATFORM_OWNER_USER_ID = 'someone-else'
  const route = require('../app/api/installments/import/route.ts')
  for (const override of [{ expectedUserId: 'nonowner-b' }, { expectedUserId: null }, { ownershipConfirmed: false }, { ownershipConfirmed: null }, { installments: [{ ...item, monthlyValue: -1 }] }, { installments: new Array(301).fill(item) }]) {
    const response = await route.POST(req(override))
    assert.ok([400, 403].includes(response.status))
    assert.equal(queries, 0, 'Rejected request must perform no SQL')
  }
  const first = await (await route.POST(req())).json()
  assert.equal(first.success, true, 'An authenticated non-owner may explicitly import their own file')
  const second = await (await route.POST(req())).json()
  assert.deepEqual(second.mappings, first.mappings)
  assert.equal(saved.size, 1)
  assert.notEqual(first.mappings[0].id, item.id, 'Client database IDs must not be trusted')
  assert.equal([...saved.values()][0].userId, 'nonowner-a')
  user = { id: 'nonowner-b', email: 'b@example.invalid' }
  const other = await (await route.POST(req())).json()
  assert.equal(other.success, true)
  assert.notEqual(other.mappings[0].id, first.mappings[0].id, 'Identical file IDs must remain isolated per authenticated user')
  assert.equal(saved.size, 2)
  const before = queries
  user = null
  assert.equal((await route.POST(req())).status, 401)
  assert.equal(queries, before)
  user = { id: 'missing-email' }
  assert.equal((await route.POST(req())).status, 401)
  assert.equal(queries, before)
  console.log('Explicit backup import passed: non-owner permitted, owner from session, no foreign IDs, required session match/confirmation, pre-SQL validation, per-user idempotence.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
