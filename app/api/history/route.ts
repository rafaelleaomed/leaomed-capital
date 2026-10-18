import { NextResponse } from 'next/server';
import { sql } from '@/utils/db';
import { getAuthenticatedUserId } from '@/utils/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {

    const rows = await sql`
      SELECT month_year, pj_gross_revenue, pj_taxes, pj_accounting_fee, pj_net_profit, pj_prolabore_withdrawn,
             pf_total_income, pf_total_expenses, pf_invested_amount, pf_net_savings, categories_breakdown
      FROM public.monthly_history
      WHERE user_id = ${userId}
      ORDER BY month_year ASC
    `;

    return NextResponse.json({ success: true, history: rows });
  } catch (error) {
    console.error('Erro ao buscar histórico no banco:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha interna ao recuperar histórico financeiro.' },
      { status: 500 }
    );
  }
}
