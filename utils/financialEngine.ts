export type AccountType = 'PF' | 'PJ';

export interface Account {
  id: string;
  type: AccountType;
  // in a real scenario we might have current_balance
}

export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  date: string;
  category: string | null;
  subcategory: string | null;
  is_fixed_expense: boolean;
}

export interface EngineResult {
  balances: {
    consolidated: number;
    pf: number;
    pj: number;
    investments: number; // For future implementation
  };
  cashFlow: {
    pf: {
      income: number;
      expenses: number;
      fixed: number;
      variable: number;
      byCategory: Record<string, number>;
    };
    pj: {
      income: number;
      expenses: number;
      fixed: number;
      variable: number;
      byCategory: Record<string, number>;
    };
  };
  averages: {
    pf: { dailyVariableSpend: number };
    pj: { dailyVariableSpend: number };
  };
  raw: {
    transactions: Transaction[];
    accounts: Record<string, Account>;
  };
}

/**
 * Motor central de cálculos financeiros.
 * Processa as transações brutas e estrutura os cálculos base separados por PF e PJ.
 */
export function runFinancialEngine(
  transactions: Transaction[],
  accounts: Account[],
  daysInMonth: number,
  currentDay: number
): EngineResult {
  const accountMap: Record<string, Account> = {};
  accounts.forEach((acc) => {
    accountMap[acc.id] = acc;
  });

  const result: EngineResult = {
    balances: {
      consolidated: 0,
      pf: 0,
      pj: 0,
      investments: 0,
    },
    cashFlow: {
      pf: { income: 0, expenses: 0, fixed: 0, variable: 0, byCategory: {} },
      pj: { income: 0, expenses: 0, fixed: 0, variable: 0, byCategory: {} },
    },
    averages: {
      pf: { dailyVariableSpend: 0 },
      pj: { dailyVariableSpend: 0 },
    },
    raw: {
      transactions,
      accounts: accountMap,
    },
  };

  for (const tx of transactions) {
    const acc = accountMap[tx.account_id];
    if (!acc) continue;

    const isPf = acc.type === 'PF';
    const flow = isPf ? result.cashFlow.pf : result.cashFlow.pj;

    const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount || 0);

    // Balances calculation (for MVP: sum of flows, assuming starting at 0 if no explicit balance is provided)
    // In production, current balances come from accounts table.
    result.balances.consolidated += amount;
    if (isPf) result.balances.pf += amount;
    if (!isPf) result.balances.pj += amount;

    if (amount > 0) {
      flow.income += amount;
    } else {
      const expenseAmount = Math.abs(amount);
      flow.expenses += expenseAmount;

      if (tx.is_fixed_expense) {
        flow.fixed += expenseAmount;
      } else {
        flow.variable += expenseAmount;
      }

      // Categorize
      const cat = tx.category || 'Outros';
      flow.byCategory[cat] = (flow.byCategory[cat] || 0) + expenseAmount;
    }
  }

  // Calculate Averages
  const passedDays = currentDay > 0 ? currentDay : 1;
  result.averages.pf.dailyVariableSpend = result.cashFlow.pf.variable / passedDays;
  result.averages.pj.dailyVariableSpend = result.cashFlow.pj.variable / passedDays;

  return result;
}

/**
 * Estima o Safe Daily Spend baseado no saldo projetado livre.
 */
export function calculateSafeDailySpend(
  currentBalance: number,
  expectedIncome: number,
  expectedFixedExpenses: number,
  daysLeft: number
): number {
  if (daysLeft <= 0) daysLeft = 1;
  const availableToSpend = currentBalance + expectedIncome - expectedFixedExpenses;
  return Math.max(0, availableToSpend) / daysLeft;
}
