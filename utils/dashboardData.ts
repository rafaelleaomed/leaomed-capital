import { EngineResult, calculateSafeDailySpend } from './financialEngine';
import { generateDeterministicInsights, RichAlert } from './insightsEngine';

export type DashboardFilter = 'CONSOLIDATED' | 'PF' | 'PJ';

export interface DeliveryPayload {
  period: string;
  balances: {
    consolidated: number;
    pf: number;
    pj: number;
    investments: number;
  };
  cash_flow: {
    total_income: number;
    total_expenses: number;
    fixed_expenses: number;
    variable_expenses: number;
  };
  categories: {
    name: string;
    total: number;
    percentage: number;
  }[];
  investments_detail: {
    total_value: number;
    by_class: {
      class: string;
      value: number;
      percentage: number;
    }[];
    profitability: number;
  };
  projections: {
    projected_end_balance: number;
    safe_daily_spend: number;
    available_to_invest: number;
  };
  alerts: RichAlert[];
}

/**
 * Transforma os dados brutos do Engine no Delivery Payload final,
 * aplicando o filtro selecionado (Consolidado, PF ou PJ).
 */
export function buildDashboardPayload(
  engineData: EngineResult,
  period: string,
  filter: DashboardFilter,
  daysInMonth: number,
  currentDay: number
): DeliveryPayload {
  
  // 1. Resolve qual fluxo usar baseado no filtro
  let income = 0;
  let expenses = 0;
  let fixed = 0;
  let variable = 0;
  const categoriesMap: Record<string, number> = {};

  if (filter === 'PF') {
    income = engineData.cashFlow.pf.income;
    expenses = engineData.cashFlow.pf.expenses;
    fixed = engineData.cashFlow.pf.fixed;
    variable = engineData.cashFlow.pf.variable;
    for (const [cat, val] of Object.entries(engineData.cashFlow.pf.byCategory)) {
      categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
    }
  } else if (filter === 'PJ') {
    income = engineData.cashFlow.pj.income;
    expenses = engineData.cashFlow.pj.expenses;
    fixed = engineData.cashFlow.pj.fixed;
    variable = engineData.cashFlow.pj.variable;
    for (const [cat, val] of Object.entries(engineData.cashFlow.pj.byCategory)) {
      categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
    }
  } else {
    // CONSOLIDATED: Receita líquida externa real sem duplicar pró-labore
    income = engineData.cashFlow.pj.income > 0 
      ? engineData.cashFlow.pj.income + Math.max(0, engineData.cashFlow.pf.income - (engineData.cashFlow.pf.income > 20000 ? 23000 : 0))
      : (engineData.cashFlow.pf.income + engineData.cashFlow.pj.income);
    expenses = engineData.cashFlow.pf.expenses + engineData.cashFlow.pj.expenses;
    fixed = engineData.cashFlow.pf.fixed + engineData.cashFlow.pj.fixed;
    variable = engineData.cashFlow.pf.variable + engineData.cashFlow.pj.variable;
    for (const [cat, val] of Object.entries(engineData.cashFlow.pf.byCategory)) {
      categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
    }
    for (const [cat, val] of Object.entries(engineData.cashFlow.pj.byCategory)) {
      categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
    }
  }

  // 2. Calcula as porcentagens das categorias
  const categoriesList = Object.entries(categoriesMap)
    .map(([name, total]) => ({
      name,
      total,
      percentage: expenses > 0 ? (total / expenses) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total); // Ordena decrescente

  // 3. Projeções e Teto Diário Seguro
  const available_to_invest = (income * 0.10); // Meta padrão sugerida de 10% do faturamento
  const availableVariable = Math.max(0, income - fixed - available_to_invest);
  const activeCycleDays = daysInMonth > 0 ? daysInMonth : 30;
  const safe_daily_spend = activeCycleDays > 0 ? (availableVariable / activeCycleDays) : 0;

  // Saldo base para projeção varia pelo filtro
  let currentBalance = 0;
  if (filter === 'CONSOLIDATED') currentBalance = engineData.balances.consolidated;
  else if (filter === 'PF') currentBalance = engineData.balances.pf;
  else if (filter === 'PJ') currentBalance = engineData.balances.pj;

  const projected_end_balance = currentBalance > 0 ? currentBalance : (income - expenses);

  // 4. Monta o Payload Final (sem alertas primeiro)
  const basePayload: Omit<DeliveryPayload, 'alerts'> = {
    period,
    balances: engineData.balances,
    cash_flow: {
      total_income: income,
      total_expenses: expenses,
      fixed_expenses: fixed,
      variable_expenses: variable
    },
    categories: categoriesList,
    investments_detail: { 
      total_value: engineData.balances.investments,
      by_class: [],
      profitability: 0
    },
    projections: {
      projected_end_balance,
      safe_daily_spend,
      available_to_invest
    }
  };

  // 5. Gera os alertas ricos via Motor Determinístico
  const alerts = generateDeterministicInsights(basePayload);

  return {
    ...basePayload,
    alerts
  };
}
