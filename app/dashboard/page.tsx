import { redirect } from 'next/navigation'
import { sql } from '@/utils/db'
import { getAuthenticatedUser } from '@/utils/supabase-server'
import { isUserAuthorized } from '@/utils/auth-helpers'
import { DashboardFilter, DeliveryPayload } from '@/utils/dashboardData'
import DashboardUI from '@/components/DashboardUI'

export const dynamic = 'force-dynamic'

interface SearchParamsProps {
  filter?: string
  period?: string
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsProps>
}) {
  // ── Autenticação e Autorização Estrita por Sessão ─────────────────────────
  const user = await getAuthenticatedUser()
  if (!user) redirect('/login')

  if (!isUserAuthorized(user)) {
    redirect('/login?error=' + encodeURIComponent('Acesso restrito ao proprietário da plataforma.'))
  }

  const params = await searchParams
  // Requisito confirmado: A visão inicial deve ser Pessoa Física (PF)
  const filterParam = (params.filter?.toUpperCase() || 'PF') as DashboardFilter
  const validFilters: DashboardFilter[] = ['PF', 'PJ', 'CONSOLIDATED']
  const activeFilter = validFilters.includes(filterParam) ? filterParam : 'PF'

  // Período dinâmico (padrão: mês corrente ou query param ?period=YYYY-MM)
  const now = new Date()
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const period = params.period && /^\d{4}-\d{2}$/.test(params.period) ? params.period : defaultPeriod

  const [yearStr, monthStr] = period.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) // 1-12
  const daysInMonth = new Date(year, month, 0).getDate()
  const startDate = `${period}-01`
  const endDate = `${period}-${String(daysInMonth).padStart(2, '0')}`

  let payload: DeliveryPayload
  let hasRealData = false

  try {
    const userId = user.id

    // 1. Agregação contábil completa sobre TODO o mês selecionado (SEM LIMIT 100)
    const summaryRows = await sql`
      SELECT 
        COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.amount < 0 AND t.is_ignored = FALSE THEN ABS(t.amount) ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN t.amount < 0 AND t.is_ignored = FALSE AND t.is_fixed = TRUE THEN ABS(t.amount) ELSE 0 END), 0) as fixed_expenses,
        COUNT(t.id) as total_transactions
      FROM public.transactions t
      LEFT JOIN public.accounts a ON a.id = t.account_id
      WHERE t.user_id = ${userId}
        AND t.date >= ${startDate} AND t.date <= ${endDate}
        AND (
          CASE 
            WHEN ${activeFilter} = 'PF' THEN (a.type = 'PF' OR a.type IS NULL)
            WHEN ${activeFilter} = 'PJ' THEN a.type = 'PJ'
            ELSE TRUE 
          END
        );
    `

    const summary = summaryRows[0] || {}
    const totalIncome = parseFloat(summary.total_income || '0')
    const totalExpenses = parseFloat(summary.total_expenses || '0')
    const fixedExpenses = parseFloat(summary.fixed_expenses || '0')
    const variableExpenses = Math.max(0, totalExpenses - fixedExpenses)
    const txCount = parseInt(summary.total_transactions || '0', 10)
    hasRealData = txCount > 0

    // 2. Agrupamento das top categorias de despesas do período
    const categoryRows = await sql`
      SELECT 
        COALESCE(t.category, 'Outros') as name,
        SUM(ABS(t.amount)) as total
      FROM public.transactions t
      LEFT JOIN public.accounts a ON a.id = t.account_id
      WHERE t.user_id = ${userId}
        AND t.amount < 0
        AND t.is_ignored = FALSE
        AND t.date >= ${startDate} AND t.date <= ${endDate}
        AND (
          CASE 
            WHEN ${activeFilter} = 'PF' THEN (a.type = 'PF' OR a.type IS NULL)
            WHEN ${activeFilter} = 'PJ' THEN a.type = 'PJ'
            ELSE TRUE 
          END
        )
      GROUP BY t.category
      ORDER BY total DESC
      LIMIT 8;
    `

    const categories = (categoryRows || []).map((c: any) => {
      const tot = parseFloat(c.total || '0')
      return {
        name: c.name,
        total: tot,
        percentage: totalExpenses > 0 ? Number(((tot / totalExpenses) * 100).toFixed(1)) : 0
      }
    })

    // 3. Resumo patrimonial de investimentos (tabela investment_assets)
    let totalInvestments = 0
    try {
      const invRows = await sql`
        SELECT COALESCE(SUM(current_total), 0) as total_val
        FROM public.investment_assets
        WHERE user_id = ${userId};
      `
      totalInvestments = parseFloat(invRows[0]?.total_val || '0')
    } catch (_) {
      totalInvestments = 0
    }

    // 4. Balanço dos módulos PF, PJ e Consolidado
    const balance = totalIncome - totalExpenses

    payload = {
      period,
      balances: {
        consolidated: balance,
        pf: activeFilter === 'PJ' ? 0 : balance,
        pj: activeFilter === 'PF' ? 0 : balance,
        investments: totalInvestments
      },
      cash_flow: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        fixed_expenses: fixedExpenses,
        variable_expenses: variableExpenses
      },
      categories,
      investments_detail: {
        total_value: totalInvestments,
        by_class: [],
        profitability: 0
      },
      projections: {
        projected_end_balance: balance,
        safe_daily_spend: 0,
        available_to_invest: Math.max(0, balance)
      },
      alerts: hasRealData ? [
        {
          type: 'opportunity',
          message: `Período ${period}: ${txCount} lançamentos contabilizados com sucesso no banco de dados.`,
          impact: 'low'
        }
      ] : [
        {
          type: 'warning',
          message: `Nenhum lançamento encontrado para o período ${period}. Anexe sua fatura ou extrato para visualizar a análise.`,
          impact: 'medium'
        }
      ]
    }
  } catch (err) {
    console.error('[Dashboard Server] Erro ao consultar banco de dados:', err)
    payload = getEmptyUserPayload(activeFilter, period)
  }

  return (
    <div className="min-h-screen">
      <DashboardUI 
        payload={payload} 
        currentFilter={activeFilter} 
        isOwner={true}
        selectedPeriod={period}
        hasRealData={hasRealData}
      />
    </div>
  )
}

function getEmptyUserPayload(filter: DashboardFilter, period: string): DeliveryPayload {
  return {
    period,
    balances: { consolidated: 0, pf: 0, pj: 0, investments: 0 },
    cash_flow: { total_income: 0, total_expenses: 0, fixed_expenses: 0, variable_expenses: 0 },
    categories: [],
    investments_detail: { total_value: 0, by_class: [], profitability: 0 },
    projections: { projected_end_balance: 0, safe_daily_spend: 0, available_to_invest: 0 },
    alerts: [
      {
        type: 'warning',
        message: `Sem dados importados para ${period}. Anexe uma fatura para começar.`,
        impact: 'low'
      }
    ]
  }
}
