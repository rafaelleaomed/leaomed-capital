// Exercise the real boundary effect with synthetic auth events and hook state.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const originalLoad = Module._load
let effect, authListener, releaseUser, ready = false, navigations = []
const listeners = new Map()
global.CustomEvent = class { constructor(type) { this.type = type } }
global.window = {
  location: { replace: url => navigations.push(url) },
  addEventListener: (name, callback) => listeners.set(name, callback),
  removeEventListener: name => listeners.delete(name),
  dispatchEvent: event => listeners.get(event.type)?.(),
}
Module._load = function (request, parent, isMain) {
  if (request === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) }
  if (request === 'react') return {
    useState: initial => { ready = initial; return [initial, value => { ready = value }] },
    useEffect: callback => { effect = callback },
  }
  if (request === '@/utils/supabase-client') return { createSupabaseBrowserClient: () => ({ auth: {
    onAuthStateChange: callback => { authListener = callback; return { data: { subscription: { unsubscribe() {} } } } },
    getUser: () => new Promise(resolve => { releaseUser = resolve }),
  } }) }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, isMain)
}
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, file) => {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  })
  module._compile(compiled.outputText, file)
}
const { FinancialSessionBoundary } = require('../components/FinancialSessionBoundary.tsx')
const { getFinancialUserScope, setFinancialUserScope } = require('../utils/userScopedStorage.ts')
const flush = () => new Promise(resolve => setImmediate(resolve))
async function main() {
  const initial = FinancialSessionBoundary({ userId: 'user-a', children: 'private-a' })
  assert.equal(initial.props.role, 'status', 'Private children must not mount before identity validation')
  let cleanup = effect()
  releaseUser({ data: { user: { id: 'user-a' } }, error: null })
  await flush()
  assert.equal(ready, true)
  assert.equal(getFinancialUserScope(), 'user-a')
  setFinancialUserScope(null)
  assert.equal(ready, false, 'Logout must hide financial content immediately')
  cleanup()
  FinancialSessionBoundary({ userId: 'user-a', children: 'private-a' })
  cleanup = effect()
  authListener('SIGNED_IN', { user: { id: 'user-b' } })
  assert.equal(ready, false)
  assert.equal(getFinancialUserScope(), null)
  releaseUser({ data: { user: { id: 'user-a' } }, error: null })
  await flush()
  assert.equal(ready, false, 'An old validation response must not re-enable the previous user')
  assert.equal(getFinancialUserScope(), null)
  assert.deepEqual(navigations, ['/login'])
  cleanup()
  console.log('Financial boundary: verified identity required; immediate logout; stale auth response rejected')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
