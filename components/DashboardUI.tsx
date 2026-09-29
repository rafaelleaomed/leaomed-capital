'use client'

import React from 'react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { useRouter } from 'next/navigation'
import { MobileQuickNav } from './dashboard/MobileQuickNav'
import { MobillsAnalytics } from './dashboard/MobillsAnalytics'
import { SummaryCards } from './dashboard/SummaryCards'
import { InsightsPanel } from './dashboard/InsightsPanel'
import { BudgetBreakdown } from './dashboard/BudgetBreakdown'
import { CashFlowChart } from './dashboard/CashFlowChart'
import { CategoryChart } from './dashboard/CategoryChart'
import { DocumentUploadModal } from './dashboard/DocumentUploadModal'
import { InstallmentsProjection } from './dashboard/InstallmentsProjection'
import { InvestmentRebalance } from './dashboard/InvestmentRebalance'
import { HistoricalOverview } from './dashboard/HistoricalOverview'

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

  const handleFilterChange = (filter: DashboardFilter) => {
    router.push(`${basePath}?filter=${filter}`)
  }

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
            Controle automatizado: Inter PJ + Itaú, Nubank e C6 Carbon Black PF
          </p>
        </div>
        
        {/* Toggle Global (Filtro PF / PJ / Consolidado) */}
        <div className="inline-flex rounded-xl shadow-xs border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/90 p-1 self-start sm:self-auto" role="group">
          {(['CONSOLIDATED', 'PF', 'PJ'] as DashboardFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold rounded-lg transition-all ${
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

      {/* Alertas Consultivos Determinísticos & IA */}
      <InsightsPanel alerts={payload.alerts} />

      {/* MÓDULO VISUAL MOBILLS: Gráficos circulares de Despesas e Receitas, Frequência de Gastos e Cartões */}
      <MobillsAnalytics 
        currentFilter={currentFilter}
        currentBalance={payload.projections.projected_end_balance}
        totalIncome={payload.cash_flow.total_income}
        totalExpenses={payload.cash_flow.total_expenses}
        creditCardTotal={currentFilter === 'PJ' ? 0 : 8749.96}
        categories={payload.categories}
      />

      {/* Linha 1: Cards de Decisão Rápida (Executivo) */}
      <SummaryCards 
        currentBalance={payload.projections.projected_end_balance}
        totalIncome={payload.cash_flow.total_income}
        totalExpenses={payload.cash_flow.total_expenses}
        safeDailySpend={payload.projections.safe_daily_spend}
        availableToInvest={payload.projections.available_to_invest}
        currentFilter={currentFilter === 'CONSOLIDATED' ? 'Consolidado' : currentFilter}
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

      {/* Linha 6: Módulo de Entrada Inteligente (Upload Fatura e Extratos - Apenas privado) */}
      {!isDemo && (
        <div id="upload-documentos" className="scroll-mt-24">
          <DocumentUploadModal />
        </div>
      )}

      {/* Linha 7: Série Temporal Histórica */}
      <div id="historico-mensal" className="scroll-mt-24">
        <HistoricalOverview isDemo={isDemo} />
      </div>
    </div>
  )
}
