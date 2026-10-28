const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const { transform, loadBindings } = require('next/dist/build/swc')

const root = path.resolve(__dirname, '..')
const originalLoad = Module._load
const queries = []
let mode = 'backup'
let transactionCalls = 0

async function sql(strings, ...values) {
  const query = strings.join('?').replace(/\s+/g, ' ').trim()
  queries.push({ query, values })
  if (query.includes('information_schema.columns')) return [{ column_name: 'id', data_type: 'uuid', is_nullable: 'NO' }]
  if (query.includes('previous_wallet_id')) return [{ id: 'user-a', email: 'owner@example.com', previous_wallet_id: null }]
  if (query.startsWith('SELECT id FROM public.users')) return [{ id: 'user-a' }]
  if (query.startsWith('SET LOCAL') || query.startsWith('ALTER TABLE') || query.startsWith('DO $migration$') || query.startsWith('CREATE UNIQUE INDEX') || query.startsWith('COMMENT ON COLUMN')) return []
  if (query.startsWith('UPDATE public.users')) return mode === 'missing' ? [] : [{ id: 'user-a' }]
  if (query.includes('other_users_with_same_wallet')) return [{ target_ok: 1, other_users_with_same_wallet: 0 }]
  throw new Error(`Unexpected SQL: ${query}`)
}
sql.transaction = async (queriesOrFn, options) => {
  transactionCalls += 1
  assert.equal(options.isolationLevel, 'Serializable')
  return Promise.all(queriesOrFn(sql))
}

Module._load = function (request, parent, isMain) {
  if (request === '@/utils/db') return { sql }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, isMain)
}
process.env.I10_MIGRATION_TOKEN = 'synthetic-token-with-enough-length'
process.env.I10_MIGRATION_USER_EMAIL = 'owner@example.com'
process.env.I10_MIGRATION_WALLET_ID = '1584990'
const request = (method, token) => new Request('http://localhost/api/internal/i10-migration', {
  method,
  headers: token ? { 'x-admin-secret': token } : {}
})

async function main() {
  await loadBindings()
  const routePath = path.join(root, 'app/api/internal/i10-migration/route.ts')
  const transformed = await transform(fs.readFileSync(routePath, 'utf8'), {
    filename: routePath,
    jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
    module: { type: 'commonjs' }
  })
  const routeModule = new Module(routePath, module)
  routeModule.filename = routePath
  routeModule.paths = Module._nodeModulePaths(path.dirname(routePath))
  routeModule._compile(transformed.code, routePath)
  const route = routeModule.exports

  assert.equal((await route.GET(request('GET'))).status, 401)
  assert.equal((await route.POST(request('POST', 'wrong-token'))).status, 401)
  assert.equal(queries.length, 0, 'Unauthorized calls must perform no SQL')

  const backupResponse = await route.GET(request('GET', process.env.I10_MIGRATION_TOKEN))
  assert.equal(backupResponse.status, 200)
  const backup = await backupResponse.json()
  assert.equal(backup.target_user.id, 'user-a')
  assert.equal(backup.target_user.email, 'owner@example.com')
  assert.equal(backup.target_user.previous_wallet_id, null)

  const applyResponse = await route.POST(request('POST', process.env.I10_MIGRATION_TOKEN))
  assert.equal(applyResponse.status, 200)
  assert.deepEqual(await applyResponse.json(), {
    success: true,
    target_ok: true,
    other_users_with_same_wallet: 0
  })
  assert.equal(transactionCalls, 1, 'DDL, update, and verification must run in one transaction')
  assert.match(queries.find(item => item.query.startsWith('UPDATE public.users')).query, /WHERE id = \? AND lower\(email\) = lower\(\?\) RETURNING id/)

  mode = 'missing'
  const missingResponse = await route.POST(request('POST', process.env.I10_MIGRATION_TOKEN))
  assert.equal(missingResponse.status, 409)
  console.log('Temporary migration route passed: fail-closed auth, backup-before-write contract, exact-user update, isolation verification.')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
