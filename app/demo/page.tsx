import DashboardUI from '@/components/DashboardUI'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'

export const dynamic = 'force-dynamic'

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const filterParam = (params.filter?.toUpperCase() || 'CONSOLIDATED') as DashboardFilter
  const validFilters: DashboardFilter[] = ['CONSOLIDATED', 'PF', 'PJ']
  const activeFilter = validFilters.includes(filterParam) ? filterParam : 'CONSOLIDATED'

  const demoPayload = getDemoPayload(activeFilter)

  return (
    <div className="min-h-screen relative">
      {/* Banner de aviso de Demonstração Pública Premium */}
      <div className="bg-slate-950 border-b border-amber-500/20 text-slate-200 text-xs py-2.5 px-4 text-center font-medium shadow-lg flex flex-wrap items-center justify-center gap-2">
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          Portfólio / Demonstração Pública
        </span>
        <span className="text-slate-300">
          Dados sintéticos de simulação para apresentação técnica. Nenhuma informação real ou privada está exposta.
        </span>
        <a 
          href="/login" 
          className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
        >
          Acesso Restrito →
        </a>
      </div>

      <DashboardUI 
        payload={demoPayload} 
        currentFilter={activeFilter} 
        basePath="/demo" 
        isDemo={true} 
      />
    </div>
  )
}

function getDemoPayload(filter: DashboardFilter): DeliveryPayload {
  const isPj = filter === 'PJ'
  const isPf = filter === 'PF'

  const income = isPj ? 35000.00 : isPf ? 28000.00 : 42000.00
  const expenses = isPj ? 8500.00 : isPf ? 21000.00 : 29500.00
  const fixed = isPj ? 4200.00 : isPf ? 15000.00 : 19200.00
  const variable = expenses - fixed
  const balance = income - expenses

  const categories = isPj ? [
    { name: 'Impostos PJ', total: 4200.00, percentage: 49.4 },
    { name: 'Infraestrutura & Nuvem', total: 2300.00, percentage: 27.1 },
    { name: 'Contabilidade & Licenças', total: 2000.00, percentage: 23.5 }
  ] : [
    { name: 'Moradia & Condomínio', total: 6500.00, percentage: 31.0 },
    { name: 'Transporte & Veículo', total: 5800.00, percentage: 27.6 },
    { name: 'Alimentação & Mercado', total: 3200.00, percentage: 15.2 },
    { name: 'Saúde & Seguro', total: 2100.00, percentage: 10.0 },
    { name: 'Lazer & Viagens', total: 1800.00, percentage: 8.6 },
    { name: 'Assinaturas & Serviços', total: 1600.00, percentage: 7.6 }
  ]

  return {
    period: '2026-06',
    balances: {
      consolidated: 245000.00,
      pf: 45000.00,
      pj: 50000.00,
      investments: 150000.00
    },
    cash_flow: {
      total_income: income,
      total_expenses: expenses,
      fixed_expenses: fixed,
      variable_expenses: variable
    },
    categories,
    investments_detail: {
      total_value: 150000.00,
      by_class: [
        { class: 'renda_fixa', value: 60000.00, percentage: 40.0 },
        { class: 'renda_variavel', value: 37500.00, percentage: 25.0 },
        { class: 'internacional', value: 30000.00, percentage: 20.0 },
        { class: 'real_estate', value: 15000.00, percentage: 10.0 },
        { class: 'cripto', value: 7500.00, percentage: 5.0 }
      ],
      profitability: 11.4
    },
    projections: {
      projected_end_balance: balance,
      safe_daily_spend: balance / 30,
      available_to_invest: isPj ? 15000.00 : 5000.00
    },
    alerts: [
      {
        type: 'opportunity',
        message: 'Portfólio Alinhado: A alocação de ativos atingiu a meta exata de 40% Renda Fixa e 25% Ações.',
        impact: 'low'
      },
      {
        type: 'warning',
        message: 'Demonstração: Todos os valores exibidos são fictícios e simulados para visualização do portfólio.',
        impact: 'medium'
      }
    ]
  }
}
