const test = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const { compileTypeScript } = require('../scripts/register-typescript-tests.cjs')

test('compila TypeScript e TSX com o runner atual', () => {
  const tsOutput = compileTypeScript('const value: number = 42; module.exports = value', 'sample.ts')
  const module = { exports: {} }
  vm.runInNewContext(tsOutput, { module, exports: module.exports, require })
  assert.equal(module.exports, 42)

  const tsxOutput = compileTypeScript('export default function Card() { return <div>ok</div> }', 'sample.tsx')
  assert.match(tsxOutput, /jsx-runtime/)
})
