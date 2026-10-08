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
  periodLabel: string // ex: "Abr/26"
  daysInMonth: number
  daysLeft: number
  totalIncome: number
  totalExpenses: number
  balance: number
  creditCardTotal: number
  fixedExpenses: number
  variableExpenses: number
  investmentTargetPct: number
  investmentTargetAmount: number
  availableVariableBudget: number
  safeDailySpend: number
  hasData: boolean
  categories: MonthlyCategoryItem[]
  incomeSources: MonthlyIncomeSource[]
  dailySpendData: { day: string; amount: number }[]
}

const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getDaysLeftInCycle(month: number, year: number): number {
  const now = new Date()
  if (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth())) {
    return getDaysInMonth(month, year)
  }
  if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth())) {
    return 0
  }
  const daysInMonth = getDaysInMonth(month, year)
  return Math.max(0, daysInMonth - now.getDate())
}

// Dados puramente demonstrativos para a rota pública /demo
const DEMO_MONTHLY_DATA: Record<string, {
  consolidated: { income: number; expenses: number; card: number; fixed: number };
  pj: { income: number; expenses: number; card: number; fixed: number };
  pf: { income: number; expenses: number; card: number; fixed: number };
}> = {
  '2026-03': {
    consolidated: { income: 42000, expenses: 26000, card: 4500, fixed: 19000 },
    pj: { income: 32000, expenses: 6500, card: 0, fixed: 5200 },
    pf: { income: 28000, expenses: 19500, card: 4500, fixed: 13800 }
  },
  '2026-04': {
    consolidated: { income: 45000, expenses: 28000, card: 5200, fixed: 21000 },
    pj: { income: 35000, expenses: 7200, card: 0, fixed: 5800 },
    pf: { income: 30000, expenses: 20800, card: 5200, fixed: 15200 }
  }
}

/**
 * Retorna dados agregados para exibição.
 * Em modo demo, utiliza valores sintéticos.
 * Em modo produção, não inventa dados nem expõe históricos no código cliente.
 */
export function getMonthlyFinancialData(
  month: number, // 0 a 11
  year: number,
  filter: 'CONSOLIDATED' | 'PF' | 'PJ' = 'PF',
  customInvestmentPct?: number,
  customObligatoryExpenses?: number,
  isDemo: boolean = false
): MonthlyFinancialSummary {
  const daysInMonth = getDaysInMonth(month, year)
  const daysLeft = getDaysLeftInCycle(month, year)
  const periodLabel = `${SHORT_MONTHS[month]}/${String(year).slice(-2)}`

  if (isDemo) {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    const base = DEMO_MONTHLY_DATA[monthKey] || DEMO_MONTHLY_DATA['2026-04']
    const active = filter === 'PJ' ? base.pj : filter === 'PF' ? base.pf : base.consolidated

    const totalIncome = active.income
    const totalExpenses = active.expenses
    const balance = totalIncome - totalExpenses
    const fixedExpenses = customObligatoryExpenses || active.fixed
    const variableExpenses = Math.max(0, totalExpenses - fixedExpenses)
    const targetPct = customInvestmentPct || 10
    const investmentTargetAmount = (totalIncome * targetPct) / 100
    const availableVariableBudget = Math.max(0, totalIncome - fixedExpenses - investmentTargetAmount)
    const safeDailySpend = daysLeft > 0 ? (availableVariableBudget / daysLeft) : 0

    return {
      month,
      year,
      periodLabel,
      daysInMonth,
      daysLeft,
      totalIncome,
      totalExpenses,
      balance,
      creditCardTotal: filter === 'PJ' ? 0 : active.card,
      fixedExpenses,
      variableExpenses,
      investmentTargetPct: targetPct,
      investmentTargetAmount,
      availableVariableBudget,
      safeDailySpend,
      hasData: true,
      categories: [
        { name: 'Moradia & Condomínio', total: 6800, percentage: 32.7, color: '#3B82F6' },
        { name: 'Transporte & Veículo', total: 4900, percentage: 23.6, color: '#F59E0B' },
        { name: 'Saúde & Plano Médico', total: 3200, percentage: 15.4, color: '#10B981' },
        { name: 'Alimentação & Supermercado', total: 2800, percentage: 13.5, color: '#8B5CF6' },
        { name: 'Outros & Lazer', total: 3100, percentage: 14.8, color: '#EC4899' }
      ],
      incomeSources: [
        { name: 'Honorários Médicos PJ', value: 24000, percentage: 80, color: '#10B981' },
        { name: 'Consultas Particulares', value: 6000, percentage: 20, color: '#3B82F6' }
      ],
      dailySpendData: []
    }
  }

  // Em produção, estado padrão limpo (sem dados mockados hardcoded)
  return {
    month,
    year,
    periodLabel,
    daysInMonth,
    daysLeft,
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    creditCardTotal: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    investmentTargetPct: customInvestmentPct || 10,
    investmentTargetAmount: 0,
    availableVariableBudget: 0,
    safeDailySpend: 0,
    hasData: false,
    categories: [],
    incomeSources: [],
    dailySpendData: []
  }
}
