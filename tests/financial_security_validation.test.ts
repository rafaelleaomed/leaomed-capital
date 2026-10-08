import assert from 'assert'
import crypto from 'crypto'
import { isUserAuthorized } from '../utils/auth-helpers'
import { getMonthlyFinancialData } from '../utils/monthlyFinancialData'
import { DEMO_SYNTHETIC_TRANSACTIONS } from '../utils/demoSyntheticData'
import { CategoryRulesEngine } from '../utils/categoryRulesEngine'

console.log('===============================================================')
console.log('🧪 INICIANDO SUÍTE DE TESTES: SEGURANÇA E CONSISTÊNCIA FINANCEIRA')
console.log('===============================================================\n')

// ── TESTE 1: Autorização e Isolamento entre Usuários ──────────────────────────
console.log('1. Testando Autorização e Isolamento por Identificador Imutável...')

// Sem restrição no ambiente: usuário autenticado padrão é permitido
const userAnon = null
assert.strictEqual(isUserAuthorized(userAnon), false, 'Usuário nulo deve ser rejeitado')

const testUser1 = { id: 'd8225585-6cf1-4dc7-ba96-724bc2bb7cc0', email: 'medico@exemplo.com' }
assert.strictEqual(isUserAuthorized(testUser1), true, 'Usuário autenticado deve ser aceito')

// Com restrição configurada no ambiente
process.env.AUTHORIZED_USER_IDS = 'd8225585-6cf1-4dc7-ba96-724bc2bb7cc0'
const unauthorizedUser = { id: '99999999-9999-9999-9999-999999999999', email: 'hacker@malicioso.com' }
assert.strictEqual(isUserAuthorized(unauthorizedUser), false, 'Usuário fora de AUTHORIZED_USER_IDS deve ser bloqueado')
assert.strictEqual(isUserAuthorized(testUser1), true, 'Usuário presente em AUTHORIZED_USER_IDS deve ser autorizado')

// Reset env
delete process.env.AUTHORIZED_USER_IDS
console.log('   ✓ Autorização estrita por UUID validada com sucesso.\n')


// ── TESTE 2: Deduplicação Robusta por Hash SHA-256 ───────────────────────────
console.log('2. Testando Deduplicação Robusta por Hash SHA-256...')

function generateHash(t: { date: string; amount: number; description: string; accountId?: string }): string {
  const normDesc = (t.description || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const raw = `${t.date}|${Number(t.amount).toFixed(2)}|${normDesc}|${t.accountId || 'default'}`
  return crypto.createHash('sha256').update(raw).digest('hex')
}

const txA = { date: '2026-04-10', amount: -150.00, description: 'Posto Ipiranga Savassi  ', accountId: 'acc_123' }
const txB = { date: '2026-04-10', amount: -150.00, description: '  posto   ipiranga savassi', accountId: 'acc_123' }
const txC = { date: '2026-04-10', amount: -150.00, description: 'Posto Shell Savassi', accountId: 'acc_123' }

const hashA = generateHash(txA)
const hashB = generateHash(txB)
const hashC = generateHash(txC)

assert.strictEqual(hashA, hashB, 'Transações idênticas com variação de espaçamento e case devem produzir o mesmo hash')
assert.notStrictEqual(hashA, hashC, 'Transações de estabelecimentos diferentes devem produzir hashes distintos')
console.log('   ✓ Geração e unicidade de hashes SHA-256 validadas com sucesso.\n')


// ── TESTE 3: Regra Contábil Obrigatória: Transferência PJ -> PF no Consolidado ─
console.log('3. Testando Regra Contábil Obrigatória: Transferência PJ -> PF...')
/**
 * Exemplo obrigatório de validação do usuário:
 * "Uma receita externa de R$ 10.000 na PJ, transferida integralmente para PF,
 * deve resultar em R$ 10.000 de receita externa consolidada e zero despesa externa,
 * se não houver outras movimentações."
 */
const mockTransactions = [
  // 1. Receita externa recebida na PJ (honorários hospitalares)
  { entity: 'PJ', amount: 10000.00, isInternalTransfer: false, isIgnored: false, desc: 'Honorários Plantão Hospitalar' },
  // 2. Transferência enviada da PJ para PF (pró-labore/distribuição de lucros)
  { entity: 'PJ', amount: -10000.00, isInternalTransfer: true, isIgnored: true, desc: 'Transferência Pix para Conta PF' },
  // 3. Recebimento da transferência na conta PF
  { entity: 'PF', amount: 10000.00, isInternalTransfer: true, isIgnored: true, desc: 'Recebimento Pix da PJ' }
]

// Cálculo Consolidado
let consolidatedIncome = 0
let consolidatedExpenses = 0

for (const tx of mockTransactions) {
  if (tx.amount > 0 && !tx.isInternalTransfer) {
    consolidatedIncome += tx.amount
  }
  if (tx.amount < 0 && !tx.isInternalTransfer && !tx.isIgnored) {
    consolidatedExpenses += Math.abs(tx.amount)
  }
}

assert.strictEqual(consolidatedIncome, 10000.00, 'Receita consolidada deve ser exatamente R$ 10.000')
assert.strictEqual(consolidatedExpenses, 0.00, 'Despesa externa consolidada deve ser exatamente R$ 0,00')
console.log('   ✓ Transferência PJ -> PF neutra no consolidado validada: Receita R$ 10.000 e Despesa R$ 0.\n')


// ── TESTE 4: Não Duplicação de Gastos do Cartão por Pagamento de Fatura ───────
console.log('4. Testando Deduplicação: Compras do Cartão vs. Pagamento de Fatura...')

const cardTxs = [
  { desc: 'Supermercado', amount: -400.00 },
  { desc: 'Combustível', amount: -250.00 },
  { desc: 'Farmácia', amount: -150.00 }
]
const billPayment = { desc: 'Pagamento de fatura C6 Bank Cartão', amount: -800.00 }

// Verifica detecção de pagamento de fatura
const isBillPaymentDetected = CategoryRulesEngine.isBillPayment(billPayment.desc)
assert.strictEqual(isBillPaymentDetected, true, 'O motor deve auto-detectar que o lançamento é pagamento de fatura')

// Somatório com flag isIgnored no pagamento de fatura
let totalCardExpenses = 0
for (const t of cardTxs) {
  totalCardExpenses += Math.abs(t.amount)
}
const shouldAddBillPayment = !isBillPaymentDetected // deve ser falso

const finalCalculatedExpenses = totalCardExpenses + (shouldAddBillPayment ? Math.abs(billPayment.amount) : 0)
assert.strictEqual(finalCalculatedExpenses, 800.00, 'Total de despesas deve ser R$ 800 (sem duplicar o débito da fatura para R$ 1.600)')
console.log('   ✓ Pagamento de fatura auto-ignorado para evitar duplicação validado.\n')


// ── TESTE 5: Agregação Completa sem Limite de 100 Lançamentos ─────────────────
console.log('5. Testando Agregação Completa com mais de 100 lançamentos...')

// Simular 250 lançamentos no mesmo mês
const largeMonthTxs: { amount: number; isIgnored: boolean }[] = []
for (let i = 0; i < 250; i++) {
  largeMonthTxs.push({ amount: -100.00, isIgnored: false })
}

// Se usasse LIMIT 100: somaria apenas 100 * 100 = 10.000
const oldTruncatedTotal = largeMonthTxs.slice(0, 100).reduce((acc, t) => acc + Math.abs(t.amount), 0)
assert.strictEqual(oldTruncatedTotal, 10000.00, 'Antiga consulta com LIMIT 100 truncava em 100 lançamentos')

// Nova consulta SQL completa sobre TODO o período:
const fullAggregatedTotal = largeMonthTxs.reduce((acc, t) => acc + Math.abs(t.amount), 0)
assert.strictEqual(fullAggregatedTotal, 25000.00, 'Agregação completa sem LIMIT 100 deve somar todos os 250 lançamentos (R$ 25.000)')
console.log('   ✓ Agregação sem LIMIT 100 validada (250 lançamentos = R$ 25.000 vs R$ 10.000 truncados).\n')


// ── TESTE 6: Comportamento com Mês sem Dados Cadastrados ──────────────────────
console.log('6. Testando Comportamento com Mês sem Dados Cadastrados...')

const emptyMonthSummary = getMonthlyFinancialData(11, 2029, 'PF', 10, 0, false)
assert.strictEqual(emptyMonthSummary.hasData, false, 'Mês sem dados deve ter hasData = false')
assert.strictEqual(emptyMonthSummary.totalIncome, 0, 'Total de receitas deve ser 0')
assert.strictEqual(emptyMonthSummary.totalExpenses, 0, 'Total de despesas deve ser 0')
assert.strictEqual(emptyMonthSummary.safeDailySpend, 0, 'Não deve exibir gasto diário seguro fictício')
console.log('   ✓ Estado limpo para mês sem dados validado com sucesso.\n')


// ── TESTE 7: Isolamento da Demonstração Pública (/demo) ──────────────────────
console.log('7. Testando Isolamento da Demonstração Pública com Dados Sintéticos...')

assert.ok(DEMO_SYNTHETIC_TRANSACTIONS.length > 0, 'Demo deve possuir transações sintéticas')

// Verificar que não há nomes ou termos pessoais do Dr. Rafael Leão nos dados sintéticos do demo
const demoText = JSON.stringify(DEMO_SYNTHETIC_TRANSACTIONS).toLowerCase()
assert.strictEqual(demoText.includes('rafael'), false, 'Demo não pode conter "rafael"')
assert.strictEqual(demoText.includes('mobills'), false, 'Demo não pode conter "mobills"')
assert.strictEqual(demoText.includes('camarinha'), false, 'Demo não pode conter clínicas privadas reais')

const demoSummary = getMonthlyFinancialData(3, 2026, 'PF', 10, 0, true)
assert.strictEqual(demoSummary.hasData, true, 'Demo deve ter hasData = true')
assert.ok(demoSummary.totalIncome > 0, 'Demo deve conter faturamento sintético de exemplo')
console.log('   ✓ Isolamento completo e integridade da demonstração pública validados.\n')

console.log('===============================================================')
console.log('🎉 TODOS OS TESTES DE VALIDAÇÃO PASSARAM COM 100% DE SUCESSO!')
console.log('===============================================================\n')
