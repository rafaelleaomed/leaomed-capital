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

  if (filter === 'CONSOLIDATED' || filter === 'PF') {
    income += engineData.cashFlow.pf.income;
    expenses += engineData.cashFlow.pf.expenses;
    fixed += engineData.cashFlow.pf.fixed;
    variable += engineData.cashFlow.pf.variable;
    
    for (const [cat, val] of Object.entries(engineData.cashFlow.pf.byCategory)) {
      categoriesMap[cat] = (categoriesMap[cat] || 0) + val;
    }
  }

  if (filter === 'CONSOLIDATED' || filter === 'PJ') {
    income += engineData.cashFlow.pj.income;
    expenses += engineData.cashFlow.pj.expenses;
    fixed += engineData.cashFlow.pj.fixed;
    variable += engineData.cashFlow.pj.variable;
    
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

  // 3. Projeções
  const daysLeft = Math.max(1, daysInMonth - currentDay);
  
  // Saldo base para projeção varia pelo filtro
  let currentBalance = 0;
  if (filter === 'CONSOLIDATED') currentBalance = engineData.balances.consolidated;
  else if (filter === 'PF') currentBalance = engineData.balances.pf;
  else if (filter === 'PJ') currentBalance = engineData.balances.pj;

  // Assumindo MVP simples para projeção: não há recebíveis/pagáveis futuros estritos no engine atual,
  // então usamos o saldo atual para estimar o safe daily spend.
  const safe_daily_spend = calculateSafeDailySpend(
    currentBalance,
    0, // Entradas futuras
    0, // Despesas fixas pendentes
    daysLeft
  );

  const projected_end_balance = currentBalance; // Melhorar lógica com engine futuramente

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
      available_to_invest: 0
    }
  };

  // 5. Gera os alertas ricos via Motor Determinístico
  const alerts = generateDeterministicInsights(basePayload);

  return {
    ...basePayload,
    alerts
  };
}
