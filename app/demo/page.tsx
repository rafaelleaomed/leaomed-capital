import DashboardUI from '@/components/DashboardUI'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ShieldCheck, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation'
import { UserAccountHeader } from '@/components/dashboard/UserAccountHeader'

export const dynamic = 'force-dynamic'

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const params = await searchParams
  const filterParam = (params.filter?.toUpperCase() || 'PF') as DashboardFilter
  const validFilters: DashboardFilter[] = ['PF', 'PJ', 'CONSOLIDATED']
  const activeFilter = validFilters.includes(filterParam) ? filterParam : 'PF'

  const demoPayload = getDemoPayload(activeFilter)


  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-[#070B12] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Banner de aviso de Demonstração Pública Premium */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs py-1.5 px-3 text-center font-medium shadow-xs flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          Modo Demonstração
        </span>
        <span className="hidden sm:inline">
          Planilha médica padrão genérica ativa.
        </span>
        <a 
          href="/login?mode=signup" 
          className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 hover:underline text-[11px] sm:text-xs"
        >
          Criar conta gratuita →
        </a>
      </div>

      {/* Topbar Executiva no Demo com ThemeToggle */}
      <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/85 dark:bg-slate-950/85 px-3 sm:px-6 md:px-8 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-900 shadow-md shrink-0">
            <img src="/logo.jpg" alt="LeãoMed Capital Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="font-display text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              LeãoMed Capital
            </span>
            <span className="hidden sm:block text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              Gestão Médica & Inteligência Financeira
            </span>
            <span className="sm:hidden text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              Gestão Médica
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Alternador de Modo Claro / Escuro */}
          <ThemeToggle />

          {/* Botão de Cadastro para Novos Usuários */}
          <a 
            href="/login?mode=signup" 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
            title="Criar nova conta com a planilha padrão médica"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>Cadastrar</span>
          </a>

          {/* Botão de Login */}
          <a 
            href="/login" 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </a>

          <UserAccountHeader isDemo={true} initialName="Dr. Médico (Demo)" initialEmail="demo@leaomed.com" />
        </div>
      </header>

      {/* Layout com Sidebar Fixo Permanente */}
      <div className="flex flex-1 relative items-start">
        <SidebarNavigation isDemo={true} />

        {/* Conteúdo Principal do Dashboard */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          <DashboardUI 
            payload={demoPayload} 
            currentFilter={activeFilter} 
            basePath="/demo" 
            isDemo={true} 
            selectedPeriod="2026-04"
            hasRealData={true}
          />

        </main>
      </div>
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
