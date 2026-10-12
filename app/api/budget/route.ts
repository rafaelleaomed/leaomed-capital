import { NextResponse } from 'next/server';
import { sql } from '@/utils/db';
import { getAuthenticatedUserId } from '@/utils/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const filter = (searchParams.get('filter')?.toUpperCase() || 'PF') as 'PF' | 'PJ' | 'CONSOLIDATED';
    const period = searchParams.get('period'); // Formato YYYY-MM

    let startDate = '';
    let endDate = '';
    if (period && /^\d{4}-\d{2}$/.test(period)) {
      const [yearStr, monthStr] = period.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const daysInMonth = new Date(year, month, 0).getDate();
      startDate = `${period}-01`;
      endDate = `${period}-${String(daysInMonth).padStart(2, '0')}`;
    }

    // 1. Obter categorias e subcategorias oficiais com soma real de transações do período
    const categoriesWithTransactions = await sql`
      SELECT 
        c.name as category_name,
        c.scope as category_scope,
        s.name as subcategory_name,
        s.is_fixed as is_fixed,
        COALESCE(SUM(ABS(t.amount)), 0) as total_spent,
        COUNT(t.id) as transaction_count
      FROM public.categories c
      JOIN public.subcategories s ON s.category_id = c.id
      LEFT JOIN public.transactions t 
        ON t.category = c.name 
        AND t.subcategory = s.name 
        AND t.user_id = ${userId}
        AND t.amount < 0
        AND t.is_ignored = FALSE
        ${startDate && endDate ? sql`AND t.date >= ${startDate} AND t.date <= ${endDate}` : sql``}
      GROUP BY c.name, c.scope, s.name, s.is_fixed
      ORDER BY c.name ASC, total_spent DESC;
    `;

    // Categorias obrigatórias mapeadas
    const obligatoryCategoryNames = [
      'Transporte', 
      'Casa', 
      'Financiamento', 
      'Saúde', 
      'Alimentação', 
      'Pets', 
      'Impostos e Taxas PF',
      'Empresa - Despesas Fixas'
    ];

    // Estrutura agrupada
    const grouped: Record<string, {
      name: string;
      is_obligatory: boolean;
      total: number;
      subcategories: { name: string; value: number; is_fixed: boolean }[];
    }> = {};

    let totalObligatory = 0;
    let totalNonObligatory = 0;

    for (const row of categoriesWithTransactions) {
      const catName = row.category_name as string;
      const subName = row.subcategory_name as string;
      const spent = parseFloat(row.total_spent as string) || 0;
      const isFixed = Boolean(row.is_fixed);
      const isObligatory = obligatoryCategoryNames.includes(catName);

      // Filtro de escopo
      if (filter === 'PF' && row.category_scope === 'PJ') continue;
      if (filter === 'PJ' && row.category_scope === 'PF') continue;

      if (!grouped[catName]) {
        grouped[catName] = {
          name: catName,
          is_obligatory: isObligatory,
          total: 0,
          subcategories: []
        };
      }

      grouped[catName].total += spent;
      grouped[catName].subcategories.push({
        name: subName,
        value: spent,
        is_fixed: isFixed
      });

      if (isObligatory) {
        totalObligatory += spent;
      } else {
        totalNonObligatory += spent;
      }
    }

    const categoriesList = Object.values(grouped).sort((a, b) => b.total - a.total);
    const totalExpenses = totalObligatory + totalNonObligatory;

    return NextResponse.json({
      success: true,
      data: {
        filter,
        totalExpenses,
        totalObligatory,
        totalNonObligatory,
        pctObligatory: totalExpenses > 0 ? (totalObligatory / totalExpenses) * 100 : 0,
        pctNonObligatory: totalExpenses > 0 ? (totalNonObligatory / totalExpenses) * 100 : 0,
        categories: categoriesList
      }
    });
  } catch (error) {
    console.error('Erro na rota /api/budget:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar dados orçamentários do banco.' },
      { status: 500 }
    );
  }
}
