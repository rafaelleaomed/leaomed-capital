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

  const income = isPj ? 38500.00 : isPf ? 31200.00 : 49700.00
  const expenses = isPj ? 7800.00 : isPf ? 22400.00 : 30200.00
  const fixed = isPj ? 6200.00 : isPf ? 16800.00 : 23000.00
  const variable = expenses - fixed
  const balance = income - expenses

  const categories = isPj ? [
    { name: 'Impostos PJ (Simples/DAS)', total: 4200.00, percentage: 53.8 },
    { name: 'Mensalidade Contador PJ', total: 1200.00, percentage: 15.4 },
    { name: 'ISS & Taxas Municipais', total: 800.00, percentage: 10.3 },
    { name: 'Insumos & Despesas Médicas', total: 1600.00, percentage: 20.5 }
  ] : [
    { name: 'Moradia & Condomínio', total: 6800.00, percentage: 30.4 },
    { name: 'Transporte & Veículo', total: 4900.00, percentage: 21.9 },
    { name: 'Saúde & Plano Médico', total: 3200.00, percentage: 14.3 },
    { name: 'Despesas Pessoais & CRM', total: 2800.00, percentage: 12.5 },
    { name: 'Filhos & Educação', total: 2700.00, percentage: 12.0 },
    { name: 'Lazer & Restaurantes', total: 2000.00, percentage: 8.9 }
  ]

  return {
    period: '2026-06',
    balances: {
      consolidated: 285000.00,
      pf: 52000.00,
      pj: 63000.00,
      investments: 170000.00
    },
    cash_flow: {
      total_income: income,
      total_expenses: expenses,
      fixed_expenses: fixed,
      variable_expenses: variable
    },
    categories,
    investments_detail: {
      total_value: 170000.00,
      by_class: [
        { class: 'renda_fixa', value: 68000.00, percentage: 40.0 },
        { class: 'renda_variavel', value: 42500.00, percentage: 25.0 },
        { class: 'internacional', value: 25500.00, percentage: 15.0 },
        { class: 'real_estate', value: 20400.00, percentage: 12.0 },
        { class: 'cripto', value: 13600.00, percentage: 8.0 }
      ],
      profitability: 12.8
    },
    projections: {
      projected_end_balance: balance,
      safe_daily_spend: balance / 30,
      available_to_invest: isPj ? 22000.00 : 7500.00
    },
    alerts: [
      {
        type: 'opportunity',
        message: 'Fluxo Operacional Médico: Receitas de plantões e convênios cobriram 100% das despesas fixas com excedente de R$ 19.500 para aportes.',
        impact: 'low'
      },
      {
        type: 'warning',
        message: 'Modo Demonstração: Template médico genérico ativo. Clique em "Personalizar & Setup" para configurar suas próprias contas, categorias e financiamentos.',
        impact: 'medium'
      }
    ]
  }
}
