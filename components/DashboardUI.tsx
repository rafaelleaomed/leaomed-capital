'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { getMonthlyFinancialData } from '@/utils/monthlyFinancialData'
import { useRouter } from 'next/navigation'
import { Sliders, PlusCircle } from 'lucide-react'
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
import { QuickTransactionModal } from './dashboard/QuickTransactionModal'
import { AppleMobileTabBar } from './dashboard/AppleMobileTabBar'
import { ExecutiveHubCards } from './dashboard/ExecutiveHubCards'

export default function DashboardUI({ 
  payload, 
  currentFilter,
  basePath = '/dashboard',
  isDemo = false,
  isOwner
}: { 
  payload: DeliveryPayload
  currentFilter: DashboardFilter
  basePath?: string
  isDemo?: boolean
  isOwner?: boolean
}) {
  const router = useRouter()
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false)

  // Controle de Mês e Ano Estilo Mobills (Mês atual como padrão)
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear())

  // Meta de novos aportes para investimentos (padrão 10% do faturamento, customizável)
  const [investmentTargetPct, setInvestmentTargetPct] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leaomed_invest_target_pct')
      if (saved) {
        const val = parseFloat(saved)
        if (!isNaN(val) && val >= 0) return val
      }
    }
    return 10
  })

  // Custo fixo / despesas obrigatórias da planilha
  const [obligatoryExpenses, setObligatoryExpenses] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leaomed_obligatory_expenses')
      if (saved) {
        const val = parseFloat(saved)
        if (!isNaN(val) && val > 0) return val
      }
    }
    return 25528.57
  })

  useEffect(() => {
    const handleObligatory = (e: any) => {
      if (e.detail?.obligatoryTotal) setObligatoryExpenses(e.detail.obligatoryTotal)
    }
    const handleTarget = (e: any) => {
      if (e.detail?.targetPct !== undefined) setInvestmentTargetPct(e.detail.targetPct)
    }
    const handleQuickTx = () => setIsQuickTxOpen(true)
    const handleWizard = () => setIsWizardOpen(true)
    window.addEventListener('leaomed_open_quick_tx', handleQuickTx)
    window.addEventListener('leaomed_open_onboarding_wizard', handleWizard)
    window.addEventListener('leaomed_budget_obligatory_updated', handleObligatory)
    window.addEventListener('leaomed_investment_target_updated', handleTarget)
    return () => {
      window.removeEventListener('leaomed_open_quick_tx', handleQuickTx)
      window.removeEventListener('leaomed_open_onboarding_wizard', handleWizard)
      window.removeEventListener('leaomed_budget_obligatory_updated', handleObligatory)
      window.removeEventListener('leaomed_investment_target_updated', handleTarget)
    }
  }, [])

  const handleFilterChange = (filter: DashboardFilter) => {
    router.push(`${basePath}?filter=${filter}`)
  }

  // Dados financeiros sincronizados dinamicamente com o mês e ano selecionados
  const monthlyData = useMemo(() => {
    return getMonthlyFinancialData(
      selectedMonth,
      selectedYear,
      currentFilter,
      investmentTargetPct,
      obligatoryExpenses,
      isDemo,
      isOwner
    )
  }, [selectedMonth, selectedYear, currentFilter, investmentTargetPct, obligatoryExpenses, isDemo, isOwner])

  const displayIncome = monthlyData.totalIncome
  const displayExpenses = monthlyData.totalExpenses
  const displayBalance = monthlyData.balance
  const displayCreditCard = currentFilter === 'PJ' ? 0 : monthlyData.creditCardTotal
  const safeDailySpend = monthlyData.safeDailySpend
  const availableToInvest = monthlyData.investmentTargetAmount
  const displayCategories = monthlyData.categories
  const periodLabel = monthlyData.periodLabel

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto pb-32 md:pb-24 transition-colors">
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
            {isOwner 
              ? 'Controle automatizado: Inter PJ + Itaú, Nubank e C6 Carbon Black PF' 
              : 'Controle automatizado: Gestão Médica Integrada PJ (Clínica/Plantões) + PF & Investimentos'}
          </p>
        </div>
        
        {/* Ações e Filtro Global */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Botão de Adicionar Lançamento Manualmente */}
          <button
            onClick={() => setIsQuickTxOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shadow-emerald-500/20 cursor-pointer"
            title="Adicionar Despesa ou Receita (Fixa, Pontual ou Parcelada)"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>+ Novo Lançamento</span>
          </button>

          {/* Botão de Personalização / Onboarding Wizard */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Personalizar Contas, Categorias e Métodos de Ingestão"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Personalizar & Setup</span>
          </button>

          {/* Toggle Global (Filtro PF / PJ / Consolidado) estilo iOS Segmented Control */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex rounded-xl shadow-xs border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/90 p-1" role="group">
            {(['CONSOLIDATED', 'PF', 'PJ'] as DashboardFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-2 py-2 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center active:scale-95 ${
                  currentFilter === f 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                {f === 'CONSOLIDATED' ? 'Consolidado' : f === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas Consultivos Determinísticos & IA */}
      <InsightsPanel alerts={payload.alerts} />

      {/* ── COMANDO EXECUTIVO: DESTAQUE PARA INGESTÃO DE FATURAS E CARDS DE NAVEGAÇÃO RÁPIDA ── */}
      <ExecutiveHubCards 
        currentFilter={currentFilter}
        displayBalance={displayBalance}
        displayIncome={displayIncome}
        displayExpenses={displayExpenses}
        creditCardTotal={displayCreditCard}
        availableToInvest={availableToInvest}
        onOpenIngestion={() => {
          const el = document.getElementById('central-ingestao')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
        onOpenQuickTx={() => setIsQuickTxOpen(true)}
        isDemo={isDemo}
      />

      {/* MÓDULO VISUAL MOBILLS: Gráficos circulares de Despesas e Receitas, Frequência de Gastos e Cartões */}
      <div id="visao-geral-graficos" className="scroll-mt-24">
        <MobillsAnalytics 
          currentFilter={currentFilter}
          currentBalance={displayBalance}
          totalIncome={displayIncome}
          totalExpenses={displayExpenses}
          creditCardTotal={displayCreditCard}
          categories={displayCategories}
          incomeSources={monthlyData.incomeSources}
          dailySpendData={monthlyData.dailySpendData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(m, y) => {
            setSelectedMonth(m)
            setSelectedYear(y)
          }}
          isDemo={isDemo}
        />
      </div>

      {/* Linha 1: Cards de Decisão Rápida (Executivo) */}
      <div id="resumo-executivo" className="scroll-mt-24">
        <SummaryCards 
          currentBalance={displayBalance}
          totalIncome={displayIncome}
          totalExpenses={displayExpenses}
          safeDailySpend={safeDailySpend}
          availableToInvest={availableToInvest}
          currentFilter={currentFilter === 'CONSOLIDATED' ? 'Consolidado' : currentFilter}
          periodLabel={periodLabel}
          fixedExpenses={obligatoryExpenses}
          daysInMonth={monthlyData.daysInMonth}
          daysLeft={monthlyData.daysLeft}
          investmentTargetPct={investmentTargetPct}
          onInvestmentPctChange={(newPct) => setInvestmentTargetPct(newPct)}
        />
      </div>

      {/* Linha 2: ESPINHA DORSAL DA PLANILHA (Gastos Obrigatórios vs Não Obrigatórios) */}
      <div id="categorias-planilha" className="scroll-mt-24">
        <div id="divisao-orcamentaria" className="scroll-mt-24">
          <BudgetBreakdown 
            currentFilter={currentFilter} 
            isDemo={isDemo} 
            selectedMonth={selectedMonth} 
            selectedYear={selectedYear} 
          />
        </div>
      </div>

      {/* Linha 3: Otimizador de Aportes & Rebalanceamento da Carteira */}
      <div id="balanceamento-investimentos" className="scroll-mt-24">
        <InvestmentRebalance isDemo={isDemo} />
      </div>

      {/* Linha 4: Previsibilidade de Parcelamentos & Alívio de Caixa */}
      <div id="parcelamentos-dividas" className="scroll-mt-24">
        <InstallmentsProjection 
          isDemo={isDemo} 
          selectedMonth={selectedMonth} 
          selectedYear={selectedYear} 
        />
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
      <div id="central-ingestao" className="scroll-mt-24">
        <div id="upload-documentos" className="scroll-mt-24">
          <DataIngestionCenter isDemo={isDemo} />
        </div>
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

      {/* Botão Flutuante (FAB) de Acesso Rápido para Novo Lançamento (Desktop - Mobile usa a TabBar central) */}
      <button
        onClick={() => setIsQuickTxOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/30 items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/40"
        title="Novo Lançamento Manual (Despesa / Receita)"
      >
        <PlusCircle className="w-5 h-5 text-slate-950 shrink-0" />
        <span className="font-black text-xs uppercase tracking-wider">Novo Lançamento</span>
      </button>

      {/* Modal de Novo Lançamento Rápido (Fixa, Parcelada ou Pontual) */}
      <QuickTransactionModal 
        isOpen={isQuickTxOpen} 
        onClose={() => setIsQuickTxOpen(false)} 
      />

      {/* Barra de Navegação Inferior Nativa Apple (iOS Feel) */}
      <AppleMobileTabBar />
    </div>
  )
}

