const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { compileTypeScript } = require('../scripts/register-typescript-tests.cjs')

require.extensions['.ts'] = (module, file) => {
  module._compile(compileTypeScript(fs.readFileSync(file, 'utf8'), file), file)
}

const {
  normalizeExactTransactionName,
  applyClassificationToExactName,
  getCategoryMergeRecommendations,
} = require('../utils/categoryManagement.ts')

const normalized = normalizeExactTransactionName('  FÁCIL   ESTACIONAMENTO  ')
assert.equal(normalized, 'fácil estacionamento')
assert.notEqual(
  normalizeExactTransactionName('Loja-A'),
  normalizeExactTransactionName('Loja A'),
  'A correspondência não pode remover pontuação e atingir nomes diferentes.'
)

const transactions = [
  { id: 'past', description: 'Fácil   Estacionamento', category: 'Outros', subcategory: 'Outros' },
  { id: 'current', description: ' FÁCIL ESTACIONAMENTO ', category: 'Transporte', subcategory: 'Estacionamentos' },
  { id: 'different', description: 'Fácil Estacionamento Centro', category: 'Outros', subcategory: 'Outros' },
]
const result = applyClassificationToExactName(transactions, 'fácil estacionamento', {
  category: 'Transporte',
  subcategory: 'Rotativo',
})
assert.equal(result.updatedCount, 2)
assert.deepEqual(result.transactions.map(item => item.subcategory), ['Rotativo', 'Rotativo', 'Outros'])

const recommendations = getCategoryMergeRecommendations()
assert.ok(recommendations.some(item => item.sourceCategory === 'Casa' && item.targetCategory === 'Moradia'))
assert.ok(recommendations.some(item => item.sourceCategory === 'Lazer' && item.targetCategory === 'Lazer & Estilo de Vida'))
assert.ok(recommendations.some(item => item.sourceCategory === 'Assinaturas' && item.targetCategory === 'Serviços de Assinaturas'))

console.log('Category management: exact historical matching, safe punctuation boundary and duplicate recommendations passed')
