import { CategoryRulesEngine } from '../utils/categoryRulesEngine'
import { USER_TAXONOMY, USER_TAXONOMY_MAP, getCategoriesByScope, getSubcategoriesForCategory } from '../utils/taxonomy'

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${msg}`)
    process.exit(1)
  }
  console.log(`✅ [PASS] ${msg}`)
}

async function runTaxonomyTests() {
  console.log('--- Testando Alinhamento Estrito com USER_TAXONOMY ---')

  // 1. Validar que as categorias e subcategorias derivadas de USER_TAXONOMY existem no mapa
  const allCategories = Object.keys(USER_TAXONOMY_MAP)
  assert(allCategories.includes('Transporte'), 'USER_TAXONOMY_MAP deve conter Transporte')
  assert(allCategories.includes('Casa'), 'USER_TAXONOMY_MAP deve conter Casa')
  assert(allCategories.includes('Saúde'), 'USER_TAXONOMY_MAP deve conter Saúde')
  assert(allCategories.includes('Empresa - Despesas Fixas'), 'USER_TAXONOMY_MAP deve conter Empresa - Despesas Fixas')

  // 2. Testar predição de Farmácia/Remédios
  const predFarmacia = CategoryRulesEngine.predict('Drogaria Araújo Medicamentos', 'PF')
  assert(predFarmacia.category === 'Saúde', `Farmácia deve mapear para Saúde (obtido: ${predFarmacia.category})`)
  assert(predFarmacia.subcategory === 'Remédios' || predFarmacia.subcategory === 'Farmácia - outros', `Subcategoria deve ser Remédios (obtido: ${predFarmacia.subcategory})`)

  // 3. Testar predição de Posto/Combustível
  const predPosto = CategoryRulesEngine.predict('Posto Ipiranga Combustivel', 'PF')
  assert(predPosto.category === 'Transporte', `Posto deve mapear para Transporte (obtido: ${predPosto.category})`)
  assert(predPosto.subcategory === 'Combustível', `Subcategoria deve ser Combustível (obtido: ${predPosto.subcategory})`)

  // 4. Testar predição de Supermercado
  const predSuper = CategoryRulesEngine.predict('Supermercado Verdemar', 'PF')
  assert(predSuper.category === 'Casa', `Verdemar deve mapear para Casa (obtido: ${predSuper.category})`)
  assert(predSuper.subcategory === 'Supermercado', `Subcategoria deve ser Supermercado (obtido: ${predSuper.subcategory})`)

  // 5. Testar predição de Tributo PJ
  const predDarf = CategoryRulesEngine.predict('DARF Simples Nacional', 'PJ')
  assert(predDarf.category === 'Empresa - Despesas Fixas', `DARF deve mapear para Empresa - Despesas Fixas (obtido: ${predDarf.category})`)
  assert(predDarf.subcategory === 'DARF', `Subcategoria deve ser DARF (obtido: ${predDarf.subcategory})`)

  // 6. Testar que getSubcategoriesForCategory retorna subcategorias reais
  const saudeSubcats = getSubcategoriesForCategory('Saúde')
  assert(saudeSubcats.includes('Remédios') && saudeSubcats.includes('Plano de Saúde'), 'Subcategorias de Saúde devem incluir Remédios e Plano de Saúde')

  console.log('\n🎉 Todos os testes de alinhamento com a taxonomia do usuário passaram com sucesso!')
}

runTaxonomyTests()
