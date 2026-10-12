const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
let user = { id: 'owner-a', email: 'owner@example.invalid' }
let writes = 0
const saved = new Map()
const originalLoad = Module._load
Module._load = function(request, parent, main) {
  if (request === '@/utils/auth-helpers') return { getAuthenticatedUserId: async () => ({ user, userId: user?.id, errorResponse: user ? null : Response.json({}, { status: 401 }) }) }
  if (request === '@/utils/db') return { sql: async (strings, ...values) => {
    const query = strings.join('?').replace(/\s+/g, ' ')
    if (query.includes('INSERT INTO public.users')) {
      assert.equal(values[0], user.id)
      assert.equal(values[1], user.email)
      return []
    }
    if (query.includes('INSERT INTO public.installments')) {
      writes++
      const [id, userId, description] = values
      assert.equal(userId, user.id)
      assert.match(values[9], /^\d{4}-\d{2}-\d{2}$/)
      assert.match(values[10], /^\d{4}-\d{2}-\d{2}$/)
      if (saved.has(id)) return []
      saved.set(id, { id, userId, description })
      return [{ id }]
    }
    assert.match(query, /WHERE user_id = \?/)
    return [...saved.values()].filter(row => row.userId === values[0] && row.description === values[1])
  } }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, main)
}
require.extensions['.ts'] = (module, file) => {
  module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, file)
}
const item = { id: 'legacy-1', name: 'Synthetic plan', category: 'Outros', monthlyValue: 15, currentInstallment: 2, totalInstallments: 6, endMonthYear: 'Fevereiro/2027', paymentMethod: 'Synthetic card' }
const request = items => new Request('http://localhost/api/installments/recovery', { method: 'POST', body: JSON.stringify({ user_id: 'someone-else', installments: items }), headers: { 'content-type': 'application/json' } })
async function main() {
  process.env.JEV_PLATFORM_OWNER_EMAIL = 'owner@example.invalid'
  process.env.JEV_PLATFORM_OWNER_USER_ID = 'owner-a'
  const route = require('../app/api/installments/recovery/route.ts')
  const persistence = require('../services/installmentPersistence.ts')
  const store = require('../utils/installmentStore.ts')
  assert.notEqual(persistence.legacyInstallmentId('owner-a', 'same-legacy'), persistence.legacyInstallmentId('friend-b', 'same-legacy'))
  delete process.env.JEV_PLATFORM_OWNER_USER_ID
  assert.equal(persistence.canRecoverLegacyInstallments(user), false, 'An unverified email alone cannot establish legacy ownership')
  assert.equal(persistence.canRecoverLegacyInstallments({ ...user, email_confirmed_at: '2026-01-01T00:00:00Z' }), true)
  process.env.JEV_PLATFORM_OWNER_USER_ID = 'owner-a'
  const mapped = store.mapDatabaseInstallment({ id: 'server-uuid', description: 'Synthetic', category: 'Other', installment_amount: '20.25', current_installment: 2, total_installments: 6, end_date: '2027-02-01', payment_method: 'Synthetic' }, { ...item, contractNotes: 'Synthetic note', entityType: 'PJ' })
  assert.equal(mapped.id, 'server-uuid')
  assert.equal(mapped.endMonthYear, 'Fevereiro/2027')
  assert.equal(mapped.contractNotes, 'Synthetic note')
  assert.equal(mapped.entityType, 'PJ')
  assert.equal(store.installmentApiPayload(mapped).end_date, '2027-02-01')
  assert.equal((await (await route.GET()).json()).eligible, true)
  const first = await (await route.POST(request([item]))).json()
  assert.equal(first.success, true)
  const second = await (await route.POST(request([item]))).json()
  assert.deepEqual(first.mappings, second.mappings)
  assert.equal(saved.size, 1)
  assert.equal([...saved.values()][0].userId, 'owner-a')
  const before = writes
  user = { id: 'friend-b', email: 'friend@example.invalid' }
  assert.equal((await (await route.GET()).json()).eligible, false)
  assert.equal((await route.POST(request([item]))).status, 403)
  assert.equal(writes, before)
  user = { id: 'friend-b', email: 'owner@example.invalid' }
  assert.equal((await route.POST(request([item]))).status, 403, 'Configured ID must reject an email match for another ID')
  user = null
  assert.equal((await route.POST(request([item]))).status, 401)
  user = { id: 'owner-a', email: 'owner@example.invalid' }
  assert.equal((await route.POST(request([{ ...item, monthlyValue: -10 }]))).status, 400)
  assert.equal(writes, before)
  console.log('Owner recovery passed: authenticated capability, no foreign writes, stable idempotent IDs, session owner, valid dates, invalid batch rejection.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
