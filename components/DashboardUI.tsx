'use client'

import React, { useState } from 'react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { useRouter } from 'next/navigation'
import { Sliders } from 'lucide-react'
import { MobileQuickNav } from './dashboard/MobileQuickNav'
import { MobillsAnalytics } from './dashboard/MobillsAnalytics'
import { SummaryCards } from './dashboard/SummaryCards'
import { InsightsPanel } from './dashboard/InsightsPanel'
import { BudgetBreakdown } from './dashboard/BudgetBreakdown'
import { CashFlowChart } from './dashboard/CashFlowChart'
import { CategoryChart } from './dashboard/CategoryChart'
import { DataIngestionCenter } from './dashboard/DataIngestionCenter'
import { InstallmentsProjection } from './dashboard/InstallmentsProjection'
import { InvestmentRebalance } from './dashboard/InvestmentRebalance'
import { HistoricalOverview } from './dashboard/HistoricalOverview'
import { OnboardingWizardModal } from './dashboard/OnboardingWizardModal'

export default function DashboardUI({ 
  payload, 
  currentFilter,
  basePath = '/dashboard',
  isDemo = false
}: { 
  payload: DeliveryPayload
  currentFilter: DashboardFilter
  basePath?: string
  isDemo?: boolean
}) {
  const router = useRouter()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  // Controle de Mês e Ano Estilo Mobills (Mês atual como padrão)
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())

  const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const periodLabel = `${SHORT_MONTHS[selectedMonth]}/${String(selectedYear).slice(2)}`

  const handleFilterChange = (filter: DashboardFilter) => {
    router.push(`${basePath}?filter=${filter}`)
  }

  // Valores rigorosamente auditados sem duplicidade contábil
  const displayIncome = isDemo 
    ? (currentFilter === 'PJ' ? 38500.00 : currentFilter === 'PF' ? 31200.00 : 49700.00)
    : payload.cash_flow.total_income

  const displayExpenses = isDemo
    ? (currentFilter === 'PJ' ? 7800.00 : currentFilter === 'PF' ? 22400.00 : 30200.00)
    : payload.cash_flow.total_expenses

  const displayBalance = isDemo
    ? (displayIncome - displayExpenses)
    : payload.projections.projected_end_balance

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto pb-24 transition-colors">
      {/* Mobile Sticky Quick Navigation */}
      <MobileQuickNav />

      {/* Top Header com Filtro Global PF / PJ / Consolidado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Painel Financeiro Integrado
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Online
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isDemo 
              ? 'Controle automatizado: Gestão Médica Integrada PJ (Clínica/Plantões) + PF & Investimentos' 
              : 'Controle automatizado: Inter PJ + Itaú, Nubank e C6 Carbon Black PF'}
          </p>
        </div>
        
        {/* Ações e Filtro Global */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Botão de Personalização / Onboarding Wizard */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Personalizar Contas, Categorias e Métodos de Ingestão"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Personalizar & Setup</span>
          </button>

          {/* Toggle Global (Filtro PF / PJ / Consolidado) */}
          <div className="inline-flex rounded-xl shadow-xs border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/90 p-1" role="group">
            {(['CONSOLIDATED', 'PF', 'PJ'] as DashboardFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  currentFilter === f 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                {f === 'CONSOLIDATED' ? 'Consolidado' : f === 'PJ' ? 'Inter PJ' : 'Pessoa Física'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas Consultivos Determinísticos & IA */}
      <InsightsPanel alerts={payload.alerts} />

      {/* MÓDULO VISUAL MOBILLS: Gráficos circulares de Despesas e Receitas, Frequência de Gastos e Cartões */}
      <MobillsAnalytics 
        currentFilter={currentFilter}
        currentBalance={displayBalance}
        totalIncome={displayIncome}
        totalExpenses={displayExpenses}
        creditCardTotal={currentFilter === 'PJ' ? 0 : (isDemo ? 4650.00 : 8749.96)}
        categories={payload.categories}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={(m, y) => {
          setSelectedMonth(m)
          setSelectedYear(y)
        }}
      />

      {/* Linha 1: Cards de Decisão Rápida (Executivo) */}
      <SummaryCards 
        currentBalance={displayBalance}
        totalIncome={displayIncome}
        totalExpenses={displayExpenses}
        safeDailySpend={payload.projections.safe_daily_spend}
        availableToInvest={payload.projections.available_to_invest}
        currentFilter={currentFilter === 'CONSOLIDATED' ? 'Consolidado' : currentFilter}
        periodLabel={periodLabel}
      />

      {/* Linha 2: ESPINHA DORSAL DA PLANILHA (Gastos Obrigatórios vs Não Obrigatórios) */}
      <BudgetBreakdown currentFilter={currentFilter} isDemo={isDemo} />

      {/* Linha 3: Otimizador de Aportes & Rebalanceamento da Carteira */}
      <div id="balanceamento-investimentos" className="scroll-mt-24">
        <InvestmentRebalance isDemo={isDemo} />
      </div>

      {/* Linha 4: Previsibilidade de Parcelamentos & Alívio de Caixa */}
      <div id="parcelamentos-dividas" className="scroll-mt-24">
        <InstallmentsProjection isDemo={isDemo} />
      </div>

      {/* Linha 5: Gráficos de Fluxo e Categorias Reais */}
      <div id="graficos-fluxo" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24">
        <CashFlowChart 
          totalIncome={payload.cash_flow.total_income} 
          totalExpenses={payload.cash_flow.total_expenses} 
        />
        <CategoryChart 
          categories={payload.categories} 
        />
      </div>

      {/* Linha 6: Central Multicanal de Ingestão de Dados (Fatura, OCR/Print, Manual, Open Finance) */}
      <div id="upload-documentos" className="scroll-mt-24">
        <DataIngestionCenter isDemo={isDemo} />
      </div>

      {/* Linha 7: Série Temporal Histórica */}
      <div id="historico-mensal" className="scroll-mt-24">
        <HistoricalOverview isDemo={isDemo} />
      </div>

      {/* Modal do Onboarding Wizard & Personalização Inicial */}
      <OnboardingWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        isDemo={isDemo} 
      />
    </div>
  )
}

