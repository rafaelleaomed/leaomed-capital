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

// Histórico e projeções consolidadas médicas estruturadas por mês
const BASE_MONTHLY_DATA: Record<string, {
  consolidated: { income: number; expenses: number; card: number; fixed: number };
  pj: { income: number; expenses: number; card: number; fixed: number };
  pf: { income: number; expenses: number; card: number; fixed: number };
}> = {
  '2025-12': {
    consolidated: { income: 42000.00, expenses: 24150.00, card: 5800.00, fixed: 21200.00 },
    pj: { income: 32000.00, expenses: 5150.00, card: 1800.00, fixed: 4800.00 },
    pf: { income: 28000.00, expenses: 19000.00, card: 4000.00, fixed: 16400.00 }
  },
  '2026-00': { // Jan/26
    consolidated: { income: 44500.00, expenses: 26250.00, card: 6900.00, fixed: 22400.00 },
    pj: { income: 35000.00, expenses: 5450.00, card: 1900.00, fixed: 5100.00 },
    pf: { income: 29500.00, expenses: 20800.00, card: 5000.00, fixed: 17300.00 }
  },
  '2026-01': { // Fev/26 (Foto 2)
    consolidated: { income: 47000.00, expenses: 25550.00, card: 6120.00, fixed: 21800.00 },
    pj: { income: 38000.00, expenses: 5850.00, card: 2000.00, fixed: 5400.00 },
    pf: { income: 31000.00, expenses: 19700.00, card: 4120.00, fixed: 16400.00 }
  },
  '2026-02': { // Mar/26
    consolidated: { income: 43800.00, expenses: 24580.00, card: 5400.00, fixed: 21200.00 },
    pj: { income: 34000.00, expenses: 5380.00, card: 1700.00, fixed: 5000.00 },
    pf: { income: 29300.00, expenses: 19200.00, card: 3700.00, fixed: 16200.00 }
  },
  '2026-03': { // Abr/26
    consolidated: { income: 46500.00, expenses: 26020.00, card: 7200.00, fixed: 22100.00 },
    pj: { income: 37500.00, expenses: 5620.00, card: 2100.00, fixed: 5200.00 },
    pf: { income: 30500.00, expenses: 20400.00, card: 5100.00, fixed: 16900.00 }
  },
  '2026-04': { // Mai/26
    consolidated: { income: 45800.00, expenses: 25620.00, card: 6850.00, fixed: 21900.00 },
    pj: { income: 36000.00, expenses: 5520.00, card: 2000.00, fixed: 5100.00 },
    pf: { income: 30800.00, expenses: 20100.00, card: 4850.00, fixed: 16800.00 }
  },
  '2026-05': { // Jun/26 (Foto 1)
    consolidated: { income: 49400.00, expenses: 28600.00, card: 8749.96, fixed: 24800.00 },
    pj: { income: 38500.00, expenses: 6200.00, card: 2100.00, fixed: 5700.00 },
    pf: { income: 32900.00, expenses: 22400.00, card: 6649.96, fixed: 19100.00 }
  },
  '2026-06': { // Jul/26
    consolidated: { income: 51500.00, expenses: 27800.00, card: 7600.00, fixed: 23500.00 },
    pj: { income: 40000.00, expenses: 6300.00, card: 2200.00, fixed: 5800.00 },
    pf: { income: 34500.00, expenses: 21500.00, card: 5400.00, fixed: 17700.00 }
  },
  '2026-07': { // Ago/26
    consolidated: { income: 52200.00, expenses: 28100.00, card: 8100.00, fixed: 24200.00 },
    pj: { income: 41500.00, expenses: 6400.00, card: 2300.00, fixed: 5900.00 },
    pf: { income: 34700.00, expenses: 21700.00, card: 5800.00, fixed: 18300.00 }
  },
  '2026-08': { // Set/26 (Mês Base da Planilha)
    consolidated: { income: 49700.00, expenses: 28827.60, card: 8749.96, fixed: 25528.57 },
    pj: { income: 38500.00, expenses: 6555.98, card: 2100.00, fixed: 6200.00 },
    pf: { income: 33200.00, expenses: 22271.62, card: 6649.96, fixed: 19328.57 }
  },
  '2026-09': { // Out/26 (Projeção)
    consolidated: { income: 50400.00, expenses: 27950.00, card: 7800.00, fixed: 24500.00 },
    pj: { income: 39000.00, expenses: 6400.00, card: 2100.00, fixed: 5900.00 },
    pf: { income: 33400.00, expenses: 21550.00, card: 5700.00, fixed: 18600.00 }
  },
  '2026-10': { // Nov/26 (Projeção)
    consolidated: { income: 51800.00, expenses: 28300.00, card: 8200.00, fixed: 24900.00 },
    pj: { income: 40500.00, expenses: 6500.00, card: 2200.00, fixed: 6000.00 },
    pf: { income: 34300.00, expenses: 21800.00, card: 6000.00, fixed: 18900.00 }
  },
  '2026-11': { // Dez/26 (Projeção com 13º e plantões de festas)
    consolidated: { income: 56400.00, expenses: 31200.00, card: 9400.00, fixed: 25800.00 },
    pj: { income: 44000.00, expenses: 7200.00, card: 2500.00, fixed: 6500.00 },
    pf: { income: 38400.00, expenses: 24000.00, card: 6900.00, fixed: 19300.00 }
  }
}

const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/**
 * Retorna os dias do mês dado mês (0-11) e ano
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Calcula os dias restantes a partir do dia atual (ou o total se for mês futuro)
 */
export function getDaysLeftInCycle(month: number, year: number): number {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const daysInM = getDaysInMonth(month, year)

  if (year === currentYear && month === currentMonth) {
    const today = now.getDate()
    return Math.max(1, daysInM - today + 1)
  }

  // Se for mês passado ou futuro, considera o ciclo cheio do mês
  return daysInM
}

/**
 * Motor central de cálculo financeiro mensal e teto diário seguro
 */
export function getMonthlyFinancialData(
  month: number, // 0 a 11
  year: number,
  filter: 'CONSOLIDATED' | 'PF' | 'PJ' = 'CONSOLIDATED',
  customInvestmentPct?: number,
  customObligatoryExpenses?: number
): MonthlyFinancialSummary {
  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const baseFallback = BASE_MONTHLY_DATA[monthKey] || BASE_MONTHLY_DATA['2026-08']

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

  // Meta de novos aportes: 10% do faturamento por padrão, customizável
  const targetPct = customInvestmentPct !== undefined ? customInvestmentPct : 10
  const investmentTargetAmount = (totalIncome * targetPct) / 100

  // Orçamento disponível para gastos variáveis após cobrir custos fixos e novos aportes
  // Fórmula: Faturamento - Custos Fixos - Meta de Aportes
  const availableVariableBudget = Math.max(0, totalIncome - fixedExpenses - investmentTargetAmount)

  // Dias no mês e dias restantes
  const daysInMonth = getDaysInMonth(month, year)
  const daysLeft = getDaysLeftInCycle(month, year)

  // Gasto diário seguro: divide o saldo variável disponível pelos dias restantes do mês
  // Exemplo: R$ 19.201,43 / 30 dias = R$ 640,05/dia!
  const safeDailySpend = daysLeft > 0 ? (availableVariableBudget / daysLeft) : 0

  // Distribuição de despesas por categoria adaptada ao valor do mês
  const expenseRatio = totalExpenses / 28827.60
  const categories: MonthlyCategoryItem[] = [
    { name: 'Transporte', total: 13163.55 * expenseRatio, percentage: 45.7, color: '#3B82F6' },
    { name: 'Casa & Moradia', total: 5528.13 * expenseRatio, percentage: 19.2, color: '#10B981' },
    { name: 'Empresa - Despesas Fixas', total: 3255.98 * expenseRatio, percentage: 11.3, color: '#EC4899' },
    { name: 'Compras & Pessoal', total: 2398.37 * expenseRatio, percentage: 8.3, color: '#F59E0B' },
    { name: 'Financiamento Veicular', total: 2302.90 * expenseRatio, percentage: 8.0, color: '#EF4444' },
    { name: 'Saúde & Cuidados', total: 1100.00 * expenseRatio, percentage: 3.8, color: '#8B5CF6' },
    { name: 'Lazer & Restaurantes', total: 728.67 * expenseRatio, percentage: 2.5, color: '#06B6D4' },
    { name: 'Assinaturas & Serviços', total: 350.00 * expenseRatio, percentage: 1.2, color: '#64748B' }
  ]

  // Fontes de receita adaptadas ao faturamento do mês
  const incomeRatio = totalIncome / 49700.00
  const incomeSources: MonthlyIncomeSource[] = [
    { name: 'Faturamento Hospitalar & PJ', value: 38500.00 * incomeRatio, percentage: 77.5, color: '#06B6D4' },
    { name: 'Consultório Particular Direto', value: 8200.00 * incomeRatio, percentage: 16.5, color: '#10B981' },
    { name: 'Rendimentos FIIs & Investimentos', value: 3000.00 * incomeRatio, percentage: 6.0, color: '#8B5CF6' }
  ]

  // Picos diários adaptados ao total de despesas
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
