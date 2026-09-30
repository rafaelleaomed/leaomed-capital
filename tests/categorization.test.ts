/**
 * Suíte de Testes de Integridade e Segurança da Categorização Jev / LeãoMed Capital
 */

import { FinancialCategorizationService, CategorizeTransactionRequest } from '../services/financialCategorizationService'
import { MockCategorizationProvider, JevCategorizationProvider } from '../services/financialCategorizationProvider'
import { USER_TAXONOMY } from '../utils/taxonomy'
import { isSensitiveCategory } from '../config/categorizationConfig'

async function runTests() {
  console.log(`\n======================================================`)
  console.log(`🧪 EXECUTANDO SUÍTE DE TESTES: JEV & REGRAS`)
  console.log(`======================================================\n`)

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  ❌ [FAIL] ${testName}`)
      failed++
    }
  }

  const service = new FinancialCategorizationService(new MockCategorizationProvider())

  // Teste 1: Sanitização de PII (CPF, Cartões e Tokens)
  const rawDescWithPii = 'Compra Drogaria Araujo 123.456.789-00 Cartao 4532-1234-5678-9012'
  const sanitized = FinancialCategorizationService.sanitizeDescription(rawDescWithPii)
  assert(
    !sanitized.includes('123.456.789-00') && !sanitized.includes('4532-1234-5678-9012'),
    '1. Sanitização deve ocultar CPF e número de cartão de crédito'
  )

  // Teste 2: Preservação estrita de Categorização Manual
  const manualReq: CategorizeTransactionRequest = {
    id: 'tx_manual_01',
    description: 'Posto Ipiranga Savassi',
    amount: -250.00,
    date: '2026-06-01',
    account_scope: 'PF',
    current_category: 'Minha Categoria Personalizada',
    current_subcategory: 'Minha Subcategoria',
    user_id: 'user_test_01'
  }
  const manualRes = await service.categorizeTransaction(manualReq)
  assert(
    manualRes.applied_category === 'Minha Categoria Personalizada' && manualRes.source === 'manual',
    '2. Lançamento com categorização manual NUNCA deve ser sobrescrito'
  )

  // Teste 3: Categorias de Alto Risco / Sensíveis exigem sempre revisão
  const sensitiveReq: CategorizeTransactionRequest = {
    id: 'tx_darf_01',
    description: 'DARF Simples Nacional Inter PJ',
    amount: -4500.00,
    date: '2026-06-15',
    account_scope: 'PJ',
    user_id: 'user_test_01'
  }
  const sensitiveRes = await service.categorizeTransaction(sensitiveReq)
  assert(
    sensitiveRes.review_required === true,
    '3. Guias de impostos (DARF/Simples) devem exigir revisão humana obrigatória'
  )

  // Teste 4: Taxonomia Oficial Estrita (A categoria sugerida deve pertencer à USER_TAXONOMY)
  const allCategoryNames = USER_TAXONOMY.map(c => c.name)
  const generalReq: CategorizeTransactionRequest = {
    id: 'tx_food_01',
    description: 'Restaurante Coco Bambu',
    amount: -180.00,
    date: '2026-06-02',
    account_scope: 'PF',
    user_id: 'user_test_01'
  }
  const generalRes = await service.categorizeTransaction(generalReq)
  assert(
    allCategoryNames.includes(generalRes.suggested_category) || generalRes.suggested_category === 'NÃO_IDENTIFICADO',
    '4. Sugestão deve respeitar rigorosamente a taxonomia oficial do usuário'
  )

  // Teste 5: Hash SHA-256 Idempotente
  const hash1 = FinancialCategorizationService.generateInputHash({
    description: 'Supermercado Verdemar',
    amount: 350.50,
    date: '2026-06-05',
    scope: 'PF'
  })
  const hash2 = FinancialCategorizationService.generateInputHash({
    description: 'Supermercado Verdemar ',
    amount: 350.50,
    date: '2026-06-05',
    scope: 'PF'
  })
  assert(
    hash1 === hash2 && hash1.length === 64,
    '5. Geração de input_hash SHA-256 deve ser determinística e normalizada'
  )

  // Teste 6: Detecção de Ambiguidade / PIX Desconhecido
  const ambiguousReq: CategorizeTransactionRequest = {
    id: 'tx_pix_01',
    description: 'PIX Enviado para chave desconhecida',
    amount: -300.00,
    date: '2026-06-07',
    account_scope: 'PF',
    user_id: 'user_test_01'
  }
  const ambiguousRes = await service.categorizeTransaction(ambiguousReq)
  assert(
    ambiguousRes.review_required === true || ambiguousRes.categorization_status === 'needs_review',
    '6. Lançamentos com descrição ambígua devem ser marcados com needs_review'
  )

  // Teste 7: Processamento em Lote com Fila e Falha Isolada
  const batchItems: CategorizeTransactionRequest[] = [
    { description: 'Posto Shell', amount: -150, date: '2026-06-01', account_scope: 'PF', user_id: 'user_test_01' },
    { description: 'Drogasil Remédios', amount: -80, date: '2026-06-02', account_scope: 'PF', user_id: 'user_test_01' },
    { description: 'Aluguel QuintoAndar', amount: -3500, date: '2026-06-03', account_scope: 'PF', user_id: 'user_test_01' }
  ]
  const batchResults = await service.categorizeBatch(batchItems, 2)
  assert(
    batchResults.length === 3 && batchResults.every(r => r.suggested_category !== ''),
    '7. Processamento em lote deve retornar todos os itens com concorrência limitada'
  )

  console.log(`\n------------------------------------------------------`)
  console.log(`RESULTADO DOS TESTES: ${passed} passaram | ${failed} falharam`)
  console.log(`------------------------------------------------------\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

if (require.main === module) {
  runTests().then(() => {
    console.log('🎉 Todos os testes de segurança e integridade passaram com sucesso!')
    process.exit(0)
  }).catch(err => {
    console.error('Erro na execução dos testes:', err)
    process.exit(1)
  })
}
