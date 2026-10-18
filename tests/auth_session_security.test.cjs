const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const { NextRequest } = require('next/server')
const root = path.resolve(__dirname, '..')
const originalLoad = Module._load
let currentUser = { id: 'synthetic-user-a' }
let authThrows = false
let authError = null
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://synthetic.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'synthetic-test-key'
for (const key of ['AUTHORIZED_USER_IDS', 'AUTHORIZED_USER_ID', 'AUTHORIZED_EMAILS', 'AUTHORIZED_EMAIL']) delete process.env[key]

Module._load = function (request, parent, isMain) {
  if (request === '@supabase/ssr') return { createServerClient: () => ({ auth: { getUser: async () => {
    if (authThrows) throw new Error('synthetic failure')
    return { data: { user: currentUser }, error: authError }
  } } }) }
  if (request === 'next/headers') return { cookies: async () => ({ getAll: () => [], set() {} }) }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, isMain)
}
require.extensions['.ts'] = (module, file) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  })
  module._compile(outputText, file)
}

async function main() {
  const { getAuthenticatedUserId } = require('../utils/auth-helpers.ts')
  const { proxy } = require('../proxy.ts')
  const apiRequest = () => new NextRequest('https://synthetic.test/api/installments')
  assert.equal((await getAuthenticatedUserId()).userId, 'synthetic-user-a')
  currentUser = { id: 'synthetic-user-b' }
  assert.equal((await getAuthenticatedUserId()).userId, 'synthetic-user-b')
  const success = await proxy(apiRequest())
  assert.equal(success.headers.get('Cache-Control'), 'private, no-store, max-age=0')
  assert.equal(success.headers.get('Vary'), 'Cookie')
  currentUser = null
  assert.equal((await getAuthenticatedUserId()).errorResponse.status, 401)
  assert.equal((await proxy(apiRequest())).status, 401)
  currentUser = { id: 'synthetic-user-a' }
  authError = { message: 'synthetic invalid session' }
  assert.equal((await getAuthenticatedUserId()).errorResponse.status, 401)
  assert.equal((await proxy(apiRequest())).status, 401)
  authError = null
  authThrows = true
  const unavailable = await getAuthenticatedUserId()
  assert.equal(unavailable.userId, null)
  assert.equal(unavailable.errorResponse.status, 503)
  assert.equal((await proxy(apiRequest())).status, 503)
  assert.equal((await proxy(new NextRequest('https://synthetic.test/dashboard'))).status, 503)
  console.log('Validated session identity A/B, anonymous rejection, no private caching and fail-closed auth errors')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
