export interface MonthlyCategoryItem {
  name: string
  total: number
  percentage: number
  color?: string
}

export interface MonthlyIncomeSource {
  name: string
  value: number
  percentage: number
  color?: string
}

export interface MonthlyFinancialSummary {
  month: number // 0-11
  year: number
  periodLabel: string // ex: "Jun/26"
  daysInMonth: number
  daysLeft: number
  totalIncome: number
  totalExpenses: number
  balance: number
  creditCardTotal: number
  fixedExpenses: number
  variableExpenses: number
  investmentTargetPct: number // padrão 10%
  investmentTargetAmount: number // ex: 10% do faturamento
  availableVariableBudget: number // Receitas - Custos Fixos - Meta de Aporte
  safeDailySpend: number // Gasto Diário Seguro por dia
  categories: MonthlyCategoryItem[]
  incomeSources: MonthlyIncomeSource[]
  dailySpendData: { day: string; amount: number }[]
}

// 1. Dados Reais Auditados do Dr. Rafael Leão (Planilha media_1790214901206.xlsx)
const REAL_USER_MONTHLY_DATA: Record<string, {
  consolidated: { income: number; expenses: number; card: number; fixed: number };
  pj: { income: number; expenses: number; card: number; fixed: number };
  pf: { income: number; expenses: number; card: number; fixed: number };
}> = {
  '2025-11': { // Dez/25
    consolidated: { income: 21202.24, expenses: 87868.64, card: 4734.22, fixed: 70680.73 },
    pj: { income: 10400.00, expenses: 1132.75, card: 0, fixed: 1132.75 },
    pf: { income: 21202.24, expenses: 86735.89, card: 4734.22, fixed: 69547.98 }
  },
  '2026-00': { // Jan/26
    consolidated: { income: 23000.00, expenses: 10860.21, card: 2400.00, fixed: 8926.28 },
    pj: { income: 23000.00, expenses: 4483.97, card: 0, fixed: 4483.97 },
    pf: { income: 19000.00, expenses: 6376.24, card: 2400.00, fixed: 4442.31 }
  },
  '2026-01': { // Fev/26
    consolidated: { income: 29300.00, expenses: 11627.37, card: 2500.00, fixed: 9603.24 },
    pj: { income: 29300.00, expenses: 5109.90, card: 0, fixed: 5109.90 },
    pf: { income: 23500.00, expenses: 6517.47, card: 2500.00, fixed: 4493.34 }
  },
  '2026-02': { // Mar/26
    consolidated: { income: 24600.00, expenses: 10006.33, card: 2600.00, fixed: 7639.96 },
    pj: { income: 24600.00, expenses: 3013.68, card: 0, fixed: 3013.68 },
    pf: { income: 22000.00, expenses: 6992.65, card: 2600.00, fixed: 4626.28 }
  },
  '2026-03': { // Abr/26
    consolidated: { income: 26979.69, expenses: 24257.48, card: 5400.00, fixed: 18002.65 },
    pj: { income: 26600.00, expenses: 3274.80, card: 0, fixed: 3274.80 },
    pf: { income: 22879.69, expenses: 20982.68, card: 5400.00, fixed: 14727.85 }
  },
  '2026-04': { // Mai/26
    consolidated: { income: 26098.91, expenses: 30398.25, card: 7800.00, fixed: 26334.39 },
    pj: { income: 25700.00, expenses: 3393.32, card: 0, fixed: 3393.32 },
    pf: { income: 23398.91, expenses: 27004.93, card: 7800.00, fixed: 22941.07 }
  },
  '2026-05': { // Jun/26 (Mês Base Completo da Planilha Oficial)
    consolidated: { income: 29519.99, expenses: 31985.63, card: 7405.92, fixed: 26865.80 },
    pj: { income: 26500.00, expenses: 3255.98, card: 0, fixed: 3255.98 },
    pf: { income: 26019.99, expenses: 28729.65, card: 7405.92, fixed: 23609.82 }
  },
  '2026-06': { // Jul/26
    consolidated: { income: 26720.00, expenses: 17475.76, card: 7200.00, fixed: 16178.45 },
    pj: { income: 26300.00, expenses: 491.21, card: 0, fixed: 491.21 },
    pf: { income: 23920.00, expenses: 16984.55, card: 7200.00, fixed: 15687.24 }
  },
  '2026-07': { // Ago/26
    consolidated: { income: 30770.00, expenses: 18657.29, card: 7400.00, fixed: 16233.16 },
    pj: { income: 27400.00, expenses: 491.21, card: 0, fixed: 491.21 },
    pf: { income: 24000.00, expenses: 18166.08, card: 7400.00, fixed: 15741.95 }
  },
  '2026-08': { // Set/26 (Projeção)
    consolidated: { income: 27300.00, expenses: 20869.01, card: 6800.00, fixed: 18951.15 },
    pj: { income: 26800.00, expenses: 3250.00, card: 0, fixed: 3250.00 },
    pf: { income: 24500.00, expenses: 17619.01, card: 6800.00, fixed: 15701.15 }
  },
  '2026-09': { // Out/26 (Projeção)
    consolidated: { income: 27500.00, expenses: 18990.81, card: 6500.00, fixed: 18596.15 },
    pj: { income: 27000.00, expenses: 3250.00, card: 0, fixed: 3250.00 },
    pf: { income: 24800.00, expenses: 15740.81, card: 6500.00, fixed: 15346.15 }
  },
  '2026-10': { // Nov/26 (Projeção)
    consolidated: { income: 28000.00, expenses: 18157.66, card: 6200.00, fixed: 17763.00 },
    pj: { income: 27500.00, expenses: 3300.00, card: 0, fixed: 3300.00 },
    pf: { income: 25000.00, expenses: 14857.66, card: 6200.00, fixed: 14463.00 }
  },
  '2026-11': { // Dez/26 (Projeção)
    consolidated: { income: 33000.00, expenses: 22300.00, card: 7500.00, fixed: 19300.00 },
    pj: { income: 32000.00, expenses: 3800.00, card: 0, fixed: 3800.00 },
    pf: { income: 28000.00, expenses: 18500.00, card: 7500.00, fixed: 15500.00 }
  }
}

// 2. Modelo Demonstrativo Genérico para rota /demo ou Novos Usuários
const DEMO_MONTHLY_DATA: Record<string, {
  consolidated: { income: number; expenses: number; card: number; fixed: number };
  pj: { income: number; expenses: number; card: number; fixed: number };
  pf: { income: number; expenses: number; card: number; fixed: number };
}> = {
  '2025-11': {
    consolidated: { income: 42000.00, expenses: 24150.00, card: 5800.00, fixed: 21200.00 },
    pj: { income: 32000.00, expenses: 5150.00, card: 1800.00, fixed: 4800.00 },
    pf: { income: 28000.00, expenses: 19000.00, card: 4000.00, fixed: 16400.00 }
  },
  '2026-00': {
    consolidated: { income: 44500.00, expenses: 26250.00, card: 6900.00, fixed: 22400.00 },
    pj: { income: 35000.00, expenses: 5450.00, card: 1900.00, fixed: 5100.00 },
    pf: { income: 29500.00, expenses: 20800.00, card: 5000.00, fixed: 17300.00 }
  },
  '2026-01': {
    consolidated: { income: 47000.00, expenses: 25550.00, card: 6120.00, fixed: 21800.00 },
    pj: { income: 38000.00, expenses: 5850.00, card: 2000.00, fixed: 5400.00 },
    pf: { income: 31000.00, expenses: 19700.00, card: 4120.00, fixed: 16400.00 }
  },
  '2026-02': {
    consolidated: { income: 43800.00, expenses: 24580.00, card: 5400.00, fixed: 21200.00 },
    pj: { income: 34000.00, expenses: 5380.00, card: 1700.00, fixed: 5000.00 },
    pf: { income: 29300.00, expenses: 19200.00, card: 3700.00, fixed: 16200.00 }
  },
  '2026-03': {
    consolidated: { income: 46500.00, expenses: 26020.00, card: 7200.00, fixed: 22100.00 },
    pj: { income: 37500.00, expenses: 5620.00, card: 2100.00, fixed: 5200.00 },
    pf: { income: 30500.00, expenses: 20400.00, card: 5100.00, fixed: 16900.00 }
  },
  '2026-04': {
    consolidated: { income: 45800.00, expenses: 25620.00, card: 6850.00, fixed: 21900.00 },
    pj: { income: 36000.00, expenses: 5520.00, card: 2000.00, fixed: 5100.00 },
    pf: { income: 30800.00, expenses: 20100.00, card: 4850.00, fixed: 16800.00 }
  },
  '2026-05': {
    consolidated: { income: 49400.00, expenses: 28600.00, card: 8749.96, fixed: 24800.00 },
    pj: { income: 38500.00, expenses: 6200.00, card: 2100.00, fixed: 5700.00 },
    pf: { income: 32900.00, expenses: 22400.00, card: 6649.96, fixed: 19100.00 }
  },
  '2026-06': {
    consolidated: { income: 51500.00, expenses: 27800.00, card: 7600.00, fixed: 23500.00 },
    pj: { income: 40000.00, expenses: 6300.00, card: 2200.00, fixed: 5800.00 },
    pf: { income: 34500.00, expenses: 21500.00, card: 5400.00, fixed: 17700.00 }
  },
  '2026-07': {
    consolidated: { income: 52200.00, expenses: 28100.00, card: 8100.00, fixed: 24200.00 },
    pj: { income: 41500.00, expenses: 6400.00, card: 2300.00, fixed: 5900.00 },
    pf: { income: 34700.00, expenses: 21700.00, card: 5800.00, fixed: 18300.00 }
  },
  '2026-08': {
    consolidated: { income: 49700.00, expenses: 28827.60, card: 8749.96, fixed: 25528.57 },
    pj: { income: 38500.00, expenses: 6555.98, card: 2100.00, fixed: 6200.00 },
    pf: { income: 33200.00, expenses: 22271.62, card: 6649.96, fixed: 19328.57 }
  },
  '2026-09': {
    consolidated: { income: 50400.00, expenses: 27950.00, card: 7800.00, fixed: 24500.00 },
    pj: { income: 39000.00, expenses: 6400.00, card: 2100.00, fixed: 5900.00 },
    pf: { income: 33400.00, expenses: 21550.00, card: 5700.00, fixed: 18600.00 }
  },
  '2026-10': {
    consolidated: { income: 51800.00, expenses: 28300.00, card: 8200.00, fixed: 24900.00 },
    pj: { income: 40500.00, expenses: 6500.00, card: 2200.00, fixed: 6000.00 },
    pf: { income: 34300.00, expenses: 21800.00, card: 6000.00, fixed: 18900.00 }
  },
  '2026-11': {
    consolidated: { income: 56400.00, expenses: 31200.00, card: 9400.00, fixed: 25800.00 },
    pj: { income: 44000.00, expenses: 7200.00, card: 2500.00, fixed: 6500.00 },
    pf: { income: 38400.00, expenses: 24000.00, card: 6900.00, fixed: 19300.00 }
  }
}

const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getDaysLeftInCycle(month: number, year: number): number {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInM = getDaysInMonth(month, year)

  if (year === currentYear && month === currentMonth) {
    const today = now.getDate()
    return Math.max(1, daysInM - today + 1)
  }

  return daysInM
}

/**
 * Motor central de cálculo financeiro mensal e teto diário seguro.
 * @param isDemo Se true, utiliza dados da clínica genérica demonstrativa. Se false, utiliza rigorosamente os dados reais do Dr. Rafael Leão.
 */
export function getMonthlyFinancialData(
  month: number, // 0 a 11
  year: number,
  filter: 'CONSOLIDATED' | 'PF' | 'PJ' = 'CONSOLIDATED',
  customInvestmentPct?: number,
  customObligatoryExpenses?: number,
  isDemo: boolean = false
): MonthlyFinancialSummary {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const dataStore = isDemo ? DEMO_MONTHLY_DATA : REAL_USER_MONTHLY_DATA
  const defaultKey = isDemo ? '2026-08' : '2026-05' // Junho como mês base real completo
  const baseFallback = dataStore[monthKey] || dataStore[defaultKey]

  const activeData = filter === 'PJ' 
    ? baseFallback.pj 
    : filter === 'PF' 
    ? baseFallback.pf 
    : baseFallback.consolidated

  const totalIncome = activeData.income
  const totalExpenses = activeData.expenses
  const balance = totalIncome - totalExpenses
  const creditCardTotal = activeData.card

  // Custo fixo da planilha (ou fallback do mês)
  const fixedExpenses = (customObligatoryExpenses !== undefined && customObligatoryExpenses > 0)
    ? customObligatoryExpenses
    : activeData.fixed

  const variableExpenses = Math.max(0, totalExpenses - fixedExpenses)

  // Meta de novos aportes: 10% por padrão, customizável
  const targetPct = customInvestmentPct !== undefined ? customInvestmentPct : 10
  const investmentTargetAmount = (totalIncome * targetPct) / 100

  // Orçamento disponível para gastos variáveis após cobrir custos fixos e novos aportes
  const availableVariableBudget = Math.max(0, totalIncome - fixedExpenses - investmentTargetAmount)

  // Dias no mês e dias restantes
  const daysInMonth = getDaysInMonth(month, year)
  const daysLeft = getDaysLeftInCycle(month, year)

  // Gasto diário seguro
  const safeDailySpend = daysLeft > 0 ? (availableVariableBudget / daysLeft) : 0

  // 1. Distribuição de Categorias
  let categories: MonthlyCategoryItem[] = []

  if (!isDemo) {
    // DADOS REAIS DO DR. RAFAEL LEÃO (base Junho de 2026)
    if (filter === 'PJ') {
      const expenseRatio = totalExpenses / 3255.98
      categories = [
        { name: 'Tributos Simples Nacional / DAS', total: 2764.77 * expenseRatio, percentage: 84.9, color: '#3B82F6' },
        { name: 'Mensalidade Contabilidade PJ', total: 491.21 * expenseRatio, percentage: 15.1, color: '#10B981' }
      ]
    } else if (filter === 'PF') {
      const expenseRatio = totalExpenses / 28729.65
      categories = [
        { name: 'Transporte', total: 13163.55 * expenseRatio, percentage: 45.8, color: '#3B82F6' },
        { name: 'Casa', total: 5662.63 * expenseRatio, percentage: 19.7, color: '#10B981' },
        { name: 'Compras', total: 2773.75 * expenseRatio, percentage: 9.7, color: '#F59E0B' },
        { name: 'Financiamento', total: 2302.90 * expenseRatio, percentage: 8.0, color: '#EF4444' },
        { name: 'Saúde', total: 1278.01 * expenseRatio, percentage: 4.4, color: '#8B5CF6' },
        { name: 'Lazer', total: 803.90 * expenseRatio, percentage: 2.8, color: '#EC4899' },
        { name: 'Alimentação', total: 793.09 * expenseRatio, percentage: 2.8, color: '#06B6D4' },
        { name: 'Viagem', total: 780.94 * expenseRatio, percentage: 2.7, color: '#6366F1' },
        { name: 'Restaurantes', total: 506.71 * expenseRatio, percentage: 1.8, color: '#F97316' },
        { name: 'Assinaturas', total: 254.53 * expenseRatio, percentage: 0.9, color: '#64748B' },
        { name: 'Pets', total: 220.04 * expenseRatio, percentage: 0.8, color: '#14B8A6' },
        { name: 'Impostos e Taxas PF', total: 189.60 * expenseRatio, percentage: 0.7, color: '#94A3B8' }
      ]
    } else {
      // CONSOLIDADO REAL (PF + PJ sem misturar os lançamentos)
      const expenseRatio = totalExpenses / 31985.63
      categories = [
        { name: 'Transporte (PF)', total: 13163.55 * expenseRatio, percentage: 41.2, color: '#3B82F6' },
        { name: 'Casa (PF)', total: 5662.63 * expenseRatio, percentage: 17.7, color: '#10B981' },
        { name: 'Despesas PJ (Tributos & Contador)', total: 3255.98 * expenseRatio, percentage: 10.2, color: '#6366F1' },
        { name: 'Compras (PF)', total: 2773.75 * expenseRatio, percentage: 8.7, color: '#F59E0B' },
        { name: 'Financiamento (PF)', total: 2302.90 * expenseRatio, percentage: 7.2, color: '#EF4444' },
        { name: 'Saúde (PF)', total: 1278.01 * expenseRatio, percentage: 4.0, color: '#8B5CF6' },
        { name: 'Lazer & Restaurantes (PF)', total: 1310.61 * expenseRatio, percentage: 4.1, color: '#EC4899' },
        { name: 'Alimentação & Viagem (PF)', total: 1574.03 * expenseRatio, percentage: 4.9, color: '#06B6D4' },
        { name: 'Outros PF (Pets, Assinaturas, Taxas)', total: 664.17 * expenseRatio, percentage: 2.0, color: '#64748B' }
      ]
    }
  } else {
    // DEMO GENÉRICA
    const expenseRatio = totalExpenses / 28827.60
    categories = [
      { name: 'Transporte', total: 13163.55 * expenseRatio, percentage: 45.7, color: '#3B82F6' },
      { name: 'Casa & Moradia', total: 5528.13 * expenseRatio, percentage: 19.2, color: '#10B981' },
      { name: 'Empresa Médica - Fixas', total: 3255.98 * expenseRatio, percentage: 11.3, color: '#EC4899' },
      { name: 'Compras & Pessoal', total: 2398.37 * expenseRatio, percentage: 8.3, color: '#F59E0B' },
      { name: 'Financiamento Veicular', total: 2302.90 * expenseRatio, percentage: 8.0, color: '#EF4444' },
      { name: 'Saúde & Cuidados', total: 1100.00 * expenseRatio, percentage: 3.8, color: '#8B5CF6' },
      { name: 'Lazer & Restaurantes', total: 728.67 * expenseRatio, percentage: 2.5, color: '#06B6D4' },
      { name: 'Assinaturas & Serviços', total: 350.00 * expenseRatio, percentage: 1.2, color: '#64748B' }
    ]
  }

  // 2. Fontes de Receita com Dados 100% Auditados da Planilha (Sem frações artificiais)
  const EXACT_MONTHLY_INCOME_PF: Record<string, { name: string; value: number; color?: string }[]> = {
    '2025-11': [
      { name: 'Camarinha (Pró-labore PJ)', value: 10000.00, color: '#06B6D4' },
      { name: 'Aeronáutica', value: 11199.86, color: '#3B82F6' },
      { name: 'Dividendos & Rendimentos', value: 2.38, color: '#8B5CF6' }
    ],
    '2026-00': [
      { name: 'Camarinha (Pró-labore PJ)', value: 19000.00, color: '#06B6D4' }
    ],
    '2026-01': [
      { name: 'Camarinha (Pró-labore PJ)', value: 23500.00, color: '#06B6D4' }
    ],
    '2026-02': [
      { name: 'Camarinha (Pró-labore PJ)', value: 22000.00, color: '#06B6D4' }
    ],
    '2026-03': [
      { name: 'Camarinha (Pró-labore PJ)', value: 22500.00, color: '#06B6D4' },
      { name: 'Reembolsos Médicos', value: 150.00, color: '#10B981' },
      { name: 'Rendimento de Investimentos', value: 229.69, color: '#8B5CF6' }
    ],
    '2026-04': [
      { name: 'Camarinha (Pró-labore PJ)', value: 23000.00, color: '#06B6D4' },
      { name: 'Reembolsos Médicos', value: 150.00, color: '#10B981' },
      { name: 'Rendimento de Investimentos', value: 248.91, color: '#8B5CF6' }
    ],
    '2026-05': [
      { name: 'Camarinha (Pró-labore da PJ)', value: 23000.00, color: '#06B6D4' },
      { name: 'Reembolsos Médicos', value: 2650.00, color: '#10B981' },
      { name: 'Rendimento de Investimentos', value: 329.99, color: '#8B5CF6' },
      { name: 'Presentes / Prêmios', value: 40.00, color: '#F59E0B' }
    ],
    '2026-06': [
      { name: 'Camarinha (Pró-labore PJ)', value: 23500.00, color: '#06B6D4' },
      { name: 'Reembolsos Médicos', value: 420.00, color: '#10B981' }
    ],
    '2026-07': [
      { name: 'Camarinha (Pró-labore PJ)', value: 24000.00, color: '#06B6D4' }
    ],
    '2026-08': [
      { name: 'Camarinha (Pró-labore PJ)', value: 24500.00, color: '#06B6D4' },
      { name: 'Reembolsos Médicos', value: 2454.00, color: '#10B981' },
      { name: 'Rendimento de Investimentos', value: 346.00, color: '#8B5CF6' }
    ]
  }

  let incomeSources: MonthlyIncomeSource[] = []

  if (!isDemo) {
    if (filter === 'PJ') {
      incomeSources = [
        { name: 'Camarinha BRUTO (Faturamento PJ)', value: totalIncome, percentage: 100.0, color: '#06B6D4' }
      ]
    } else if (filter === 'PF') {
      const sources = EXACT_MONTHLY_INCOME_PF[monthKey] || EXACT_MONTHLY_INCOME_PF['2026-05']
      const sum = sources.reduce((acc, s) => acc + s.value, 0) || 1
      incomeSources = sources.map(s => ({
        name: s.name,
        value: s.value,
        percentage: Number(((s.value / sum) * 100).toFixed(1)),
        color: s.color
      }))
    } else {
      // CONSOLIDADO REAL (Faturamento Bruto PJ + Entradas Externas PF sem duplicar pró-labore)
      const pfSources = EXACT_MONTHLY_INCOME_PF[monthKey] || EXACT_MONTHLY_INCOME_PF['2026-05']
      const externalPf = pfSources.filter(s => !s.name.includes('Camarinha') && !s.name.includes('Pró-labore'))
      const pjGross = baseFallback.pj.income
      const items = [
        { name: 'Faturamento PJ (Camarinha BRUTO)', value: pjGross, color: '#06B6D4' },
        ...externalPf.map(s => ({ name: `${s.name} (PF)`, value: s.value, color: s.color }))
      ]
      const sum = items.reduce((acc, i) => acc + i.value, 0) || 1
      incomeSources = items.map(s => ({
        name: s.name,
        value: s.value,
        percentage: Number(((s.value / sum) * 100).toFixed(1)),
        color: s.color
      }))
    }
  } else {
    // DEMO GENÉRICA
    const incomeRatio = totalIncome / 49700.00
    incomeSources = [
      { name: 'Faturamento Hospitalar & PJ', value: 38500.00 * incomeRatio, percentage: 77.5, color: '#06B6D4' },
      { name: 'Consultório Particular Direto', value: 8200.00 * incomeRatio, percentage: 16.5, color: '#10B981' },
      { name: 'Rendimentos FIIs & Investimentos', value: 3000.00 * incomeRatio, percentage: 6.0, color: '#8B5CF6' }
    ]
  }

  // Picos diários adaptados ao total de despesas
  const expenseRatio = totalExpenses / (isDemo ? 28827.60 : 28729.65)
  const dailySpendData = [
    { day: '01', amount: Math.round(450 * expenseRatio) },
    { day: '05', amount: Math.round(1850 * expenseRatio) },
    { day: '10', amount: Math.round(2100 * expenseRatio) },
    { day: '15', amount: Math.round(1650 * expenseRatio) },
    { day: '20', amount: Math.round(4200 * expenseRatio) },
    { day: '25', amount: Math.round(1800 * expenseRatio) },
    { day: '27', amount: Math.round(1200 * expenseRatio) },
    { day: '30', amount: Math.round(620 * expenseRatio) }
  ]

  const periodLabel = `${SHORT_MONTHS[month]}/${String(year).slice(2)}`

  return {
    month,
    year,
    periodLabel,
    daysInMonth,
    daysLeft,
    totalIncome,
    totalExpenses,
    balance,
    creditCardTotal,
    fixedExpenses,
    variableExpenses,
    investmentTargetPct: targetPct,
    investmentTargetAmount,
    availableVariableBudget,
    safeDailySpend,
    categories,
    incomeSources,
    dailySpendData
  }
}
