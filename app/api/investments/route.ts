import { NextResponse } from 'next/server';
import { sql } from '@/utils/db';
import { getAuthenticatedUserId } from '@/utils/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {

    // 1. Metas de Alocação (Ações 25%, Real Estate 15%, Caixa 30%, Cripto 5%, Internacional 25%)
    const targets = await sql`
      SELECT asset_class, target_percentage
      FROM public.investment_targets
      WHERE user_id = ${userId}
      ORDER BY target_percentage DESC;
    `;

    // 2. 13 Ativos Reais
    const assets = await sql`
      SELECT 
        id, asset_name, category, broker, quantity, avg_price, current_price,
        total_invested, current_total, profit_loss, profit_loss_pct, operation,
        is_emergency_reserve
      FROM public.investment_assets
      WHERE user_id = ${userId}
      ORDER BY current_total DESC;
    `;

    let totalInvested = 0;
    let totalCurrent = 0;
    let emergencyReserve = 0;

    for (const a of assets) {
      const cur = parseFloat(a.current_total as string) || 0;
      const inv = parseFloat(a.total_invested as string) || 0;
      totalInvested += inv;
      totalCurrent += cur;
      if (a.is_emergency_reserve) {
        emergencyReserve += cur;
      }
    }

    const totalProfit = totalCurrent - totalInvested;
    const totalProfitPct = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;
    const rebalancePortfolio = totalCurrent - emergencyReserve;

    return NextResponse.json({
      success: true,
      data: {
        targets,
        assets,
        summary: {
          totalInvested,
          totalCurrent,
          totalProfit,
          totalProfitPct,
          emergencyReserve,
          rebalancePortfolio
        }
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar investimentos no Neon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
