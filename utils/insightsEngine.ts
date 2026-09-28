import { DeliveryPayload } from './dashboardData';

export type AlertType = 'warning' | 'danger' | 'opportunity';
export type AlertImpact = 'high' | 'medium' | 'low';

export interface RichAlert {
  type: AlertType;
  message: string;
  impact: AlertImpact;
}

/**
 * Insights Engine: Camada determinística para análise de dados do usuário e geração
 * de alertas acionáveis ANTES de passar por qualquer LLM. Garante qualidade, 
 * consistência e confiabilidade do diagnóstico financeiro.
 */
export function generateDeterministicInsights(payload: Omit<DeliveryPayload, 'alerts'>): RichAlert[] {
  const alerts: RichAlert[] = [];
  const { cash_flow, projections, categories } = payload;

  // Regra 1: Saldo projetado negativo (Crítico)
  if (projections.projected_end_balance < 0) {
    alerts.push({
      type: 'danger',
      message: `Atenção: Seu saldo projetado para o fim do período está negativo em R$ ${Math.abs(projections.projected_end_balance).toFixed(2)}. Reduza despesas imediatamente.`,
      impact: 'high'
    });
  }

  // Regra 2: Despesas superando receitas
  if (cash_flow.total_expenses > cash_flow.total_income) {
    alerts.push({
      type: 'warning',
      message: `Cuidado: Você já gastou R$ ${(cash_flow.total_expenses - cash_flow.total_income).toFixed(2)} a mais do que arrecadou.`,
      impact: 'high'
    });
  }

  // Regra 3: Gastos excessivos em categoria específica (Alimentação como exemplo base)
  // No futuro, isso deve comparar com a média histórica passada no payload
  const foodCategory = categories.find(c => c.name.toLowerCase().includes('alimentação') || c.name.toLowerCase().includes('food'));
  if (foodCategory && foodCategory.percentage > 30) {
    alerts.push({
      type: 'warning',
      message: `Seus gastos com ${foodCategory.name} representam ${foodCategory.percentage.toFixed(1)}% das suas despesas totais. Tente manter abaixo de 30%.`,
      impact: 'medium'
    });
  }

  // Regra 4: Oportunidade de investimento
  // Se o usuário tem uma sobra de mais de 20% da renda ou um disponível seguro alto
  const leftover = cash_flow.total_income - cash_flow.total_expenses;
  if (leftover > 0 && leftover > (cash_flow.total_income * 0.2)) {
    alerts.push({
      type: 'opportunity',
      message: `Ótimo trabalho! Você tem uma sobra de R$ ${leftover.toFixed(2)}. Considere alocar parte desse valor para investimentos.`,
      impact: 'medium'
    });
  } else if (projections.available_to_invest > 0) {
    alerts.push({
      type: 'opportunity',
      message: `Você tem R$ ${projections.available_to_invest.toFixed(2)} seguros e disponíveis para investir hoje.`,
      impact: 'low'
    });
  }

  // Regra 5: Limite diário baixo
  if (projections.safe_daily_spend > 0 && projections.safe_daily_spend < 50) {
    alerts.push({
      type: 'warning',
      message: `Seu limite diário seguro está baixo (R$ ${projections.safe_daily_spend.toFixed(2)}). Evite gastos supérfluos hoje.`,
      impact: 'medium'
    });
  }

  return alerts;
}
