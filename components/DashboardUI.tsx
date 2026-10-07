'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { getMonthlyFinancialData } from '@/utils/monthlyFinancialData'
import { useRouter } from 'next/navigation'
import { 
  Sliders, 
  PlusCircle, 
  Search, 
  BarChart3, 
  LayoutDashboard, 
  PieChart, 
  Receipt, 
  UploadCloud, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles
} from 'lucide-react'
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
import { GlobalQuickFinder } from './dashboard/GlobalQuickFinder'

export type DashboardTab = 'visao-geral' | 'orcamento' | 'investimentos' | 'parcelamentos' | 'ingestao' | 'historico'

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
  const [activeTab, setActiveTab] = useState<DashboardTab>('visao-geral')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false)
  const [isQuickFinderOpen, setIsQuickFinderOpen] = useState(false)

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

  // Sincronização de abas e eventos globais
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        if (hash === 'visao-geral-graficos' || hash === 'visao-geral') setActiveTab('visao-geral')
        else if (hash === 'categorias-planilha' || hash === 'cartoes-credito' || hash === 'orcamento' || hash === 'divisao-orcamentaria') setActiveTab('orcamento')
        else if (hash === 'balanceamento-investimentos' || hash === 'reserva-emergencia' || hash === 'investimentos') setActiveTab('investimentos')
        else if (hash === 'parcelamentos-dividas' || hash === 'consolidado-anual' || hash === 'parcelamentos') setActiveTab('parcelamentos')
        else if (hash === 'central-ingestao' || hash === 'upload-documentos' || hash === 'ingestao') setActiveTab('ingestao')
        else if (hash === 'historico-mensal' || hash === 'historico') setActiveTab('historico')
      }
    }

    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab)
        window.location.hash = '#' + e.detail.tab
        window.dispatchEvent(new CustomEvent('leaomed_tab_changed', { detail: { tab: e.detail.tab } }))
        if (e.detail.elementId) {
          setTimeout(() => {
            const el = document.getElementById(e.detail.elementId)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 100)
        }
      }
    }

    const handleOpenQuickFinder = () => setIsQuickFinderOpen(true)
    const handleObligatory = (e: any) => {
      if (e.detail?.obligatoryTotal) setObligatoryExpenses(e.detail.obligatoryTotal)
    }
    const handleTarget = (e: any) => {
      if (e.detail?.targetPct !== undefined) setInvestmentTargetPct(e.detail.targetPct)
    }
    const handleQuickTx = () => setIsQuickTxOpen(true)
    const handleWizard = () => setIsWizardOpen(true)

    window.addEventListener('hashchange', handleHash)
    window.addEventListener('leaomed_switch_tab', handleSwitchTab)
    window.addEventListener('leaomed_open_quick_finder', handleOpenQuickFinder)
    window.addEventListener('leaomed_open_quick_tx', handleQuickTx)
    window.addEventListener('leaomed_open_onboarding_wizard', handleWizard)
    window.addEventListener('leaomed_budget_obligatory_updated', handleObligatory)
    window.addEventListener('leaomed_investment_target_updated', handleTarget)

    handleHash()

    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('leaomed_switch_tab', handleSwitchTab)
      window.removeEventListener('leaomed_open_quick_finder', handleOpenQuickFinder)
      window.removeEventListener('leaomed_open_quick_tx', handleQuickTx)
      window.removeEventListener('leaomed_open_onboarding_wizard', handleWizard)
      window.removeEventListener('leaomed_budget_obligatory_updated', handleObligatory)
      window.removeEventListener('leaomed_investment_target_updated', handleTarget)
    }
  }, [])

  const handleTabClick = (tabId: DashboardTab) => {
    setActiveTab(tabId)
    window.location.hash = '#' + tabId
    window.dispatchEvent(new CustomEvent('leaomed_tab_changed', { detail: { tab: tabId } }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  // Navegação entre meses
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Configuração das abas executivas
  const executiveTabs: { id: DashboardTab; label: string; icon: any; badge?: string }[] = [
    { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3 },
    { id: 'orcamento', label: 'Orçamento & Cartões', icon: LayoutDashboard },
    { id: 'investimentos', label: 'Investimentos', icon: PieChart, badge: '13 ativos' },
    { id: 'parcelamentos', label: 'Parcelamentos & Dívidas', icon: Receipt, badge: 'Alívio R$ 10k' },
    { id: 'ingestao', label: 'Central de Ingestão', icon: UploadCloud },
    { id: 'historico', label: 'Histórico Mensal', icon: TrendingUp },
  ]

  return (
    <div className="flex flex-col gap-5 md:gap-7 max-w-7xl mx-auto pb-32 md:pb-24 transition-colors">
      {/* Mobile Sticky Quick Navigation */}
      <MobileQuickNav activeTab={activeTab} onSelectTab={(t) => handleTabClick(t as DashboardTab)} />

      {/* ── Top Header Executivo ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 border-b border-slate-200/80 dark:border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Painel Financeiro Integrado
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Ao Vivo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isOwner 
              ? 'Inter PJ (Clínica/Plantões) • Itaú, Nubank e C6 Carbon Black PF • Investimentos' 
              : 'Gestão Médica Integrada PJ (Clínica/Plantões) + Pessoa Física & Carteira de Investimentos'}
          </p>
        </div>

        {/* Controles de Topo: Busca Global + Filtro PF/PJ + Ações */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão de Busca Rápida Global (Ctrl+K) */}
          <button
            onClick={() => setIsQuickFinderOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-medium cursor-pointer shadow-2xs group"
            title="Buscar no App (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white dark:bg-white/10 text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10">
              Ctrl+K
            </kbd>
          </button>

          {/* Seletor Rápido de Mês e Ano */}
          <div className="inline-flex items-center bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10 p-1 text-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap min-w-[110px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Segmented Control Global: Consolidado | PF | PJ */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex rounded-xl shadow-2xs border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/90 p-1" role="group">
            {(['CONSOLIDATED', 'PF', 'PJ'] as DashboardFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center active:scale-95 ${
                  currentFilter === f 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                {f === 'CONSOLIDATED' ? 'Consolidado' : f === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
              </button>
            ))}
          </div>

          {/* Botão de Adicionar Lançamento Manualmente */}
          <button
            onClick={() => setIsQuickTxOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/25 cursor-pointer active:scale-95 shrink-0"
            title="Adicionar Despesa ou Receita"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>+ Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* ── Barra de Abas Executivas (Desktop) ─────────────────────────── */}
      <nav 
        aria-label="Módulos da plataforma"
        className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl sticky top-20 z-20 shadow-xs"
      >
        {executiveTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── CONTEÚDO DA ABA SELECIONADA ─────────────────────────────────── */}

      {/* ABA 1: VISÃO GERAL (Cockpit Executivo) */}
      {activeTab === 'visao-geral' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Alertas Consultivos Determinísticos & IA */}
          <InsightsPanel alerts={payload.alerts} />

          {/* Cards Executivos de Resumo */}
          <ExecutiveHubCards 
            currentFilter={currentFilter}
            displayBalance={displayBalance}
            displayIncome={displayIncome}
            displayExpenses={displayExpenses}
            creditCardTotal={displayCreditCard}
            availableToInvest={availableToInvest}
            onOpenIngestion={() => handleTabClick('ingestao')}
            onOpenQuickTx={() => setIsQuickTxOpen(true)}
            isDemo={isDemo}
          />

          {/* Módulo Visual Mobills (Receitas vs Despesas e Frequência) */}
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

          {/* Gráficos de Fluxo de Caixa e Categorias */}
          <div id="graficos-fluxo" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24">
            <CashFlowChart 
              totalIncome={payload.cash_flow.total_income} 
              totalExpenses={payload.cash_flow.total_expenses} 
            />
            <CategoryChart 
              categories={payload.categories} 
            />
          </div>
        </div>
      )}

      {/* ABA 2: ORÇAMENTO & CARTÕES */}
      {activeTab === 'orcamento' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Resumo de Tetos e Limites */}
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

          {/* Espinha Dorsal da Planilha: Despesas Obrigatórias vs Não Obrigatórias e Cartões */}
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
        </div>
      )}

      {/* ABA 3: INVESTIMENTOS & PATRIMÔNIO */}
      {activeTab === 'investimentos' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="balanceamento-investimentos" className="scroll-mt-24">
            <InvestmentRebalance isDemo={isDemo} />
          </div>
        </div>
      )}

      {/* ABA 4: PARCELAMENTOS & DÍVIDAS */}
      {activeTab === 'parcelamentos' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="parcelamentos-dividas" className="scroll-mt-24">
            <InstallmentsProjection 
              isDemo={isDemo} 
              selectedMonth={selectedMonth} 
              selectedYear={selectedYear} 
            />
          </div>
        </div>
      )}

      {/* ABA 5: CENTRAL DE INGESTÃO */}
      {activeTab === 'ingestao' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="central-ingestao" className="scroll-mt-24">
            <div id="upload-documentos" className="scroll-mt-24">
              <DataIngestionCenter isDemo={isDemo} />
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: HISTÓRICO MENSAL */}
      {activeTab === 'historico' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="historico-mensal" className="scroll-mt-24">
            <HistoricalOverview isDemo={isDemo} />
          </div>
        </div>
      )}

      {/* ── MODAIS GLOBAIS ────────────────────────────────────────────── */}

      {/* Buscador Global Rápido (Ctrl+K) */}
      <GlobalQuickFinder 
        isOpen={isQuickFinderOpen} 
        onClose={() => setIsQuickFinderOpen(false)} 
        onSelectTab={(tab, elementId) => {
          handleTabClick(tab as DashboardTab)
          if (elementId) {
            setTimeout(() => {
              const el = document.getElementById(elementId)
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
          }
        }}
        onOpenQuickTx={() => setIsQuickTxOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
        categories={displayCategories}
      />

      {/* Modal do Onboarding Wizard & Personalização Inicial */}
      <OnboardingWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        isDemo={isDemo} 
      />

      {/* Modal de Novo Lançamento Rápido (Fixa, Parcelada ou Pontual) */}
      <QuickTransactionModal 
        isOpen={isQuickTxOpen} 
        onClose={() => setIsQuickTxOpen(false)} 
      />

      {/* Barra de Navegação Inferior Nativa Apple (Mobile) */}
      <AppleMobileTabBar />
    </div>
  )
}
