'use client'

import React, { useState, useEffect } from 'react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  BarChart3, 
  LayoutDashboard, 
  PieChart, 
  Receipt, 
  UploadCloud, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  PlusCircle
} from 'lucide-react'
import { TieredCockpitView } from './dashboard/TieredCockpitView'
import { MobileQuickNav } from './dashboard/MobileQuickNav'
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
import { DocumentUploadModal } from './dashboard/DocumentUploadModal'
import { GranularExpenseAuditor } from './dashboard/GranularExpenseAuditor'
import { AppleMobileTabBar } from './dashboard/AppleMobileTabBar'
import { GlobalQuickFinder } from './dashboard/GlobalQuickFinder'

export type DashboardTab = 'visao-geral' | 'auditoria' | 'orcamento' | 'investimentos' | 'parcelamentos' | 'ingestao' | 'historico'

export default function DashboardUI({ 
  payload, 
  currentFilter = 'PF',
  basePath = '/dashboard',
  isDemo = false,
  isOwner = true,
  selectedPeriod,
  hasRealData = false
}: { 
  payload: DeliveryPayload
  currentFilter?: DashboardFilter
  basePath?: string
  isDemo?: boolean
  isOwner?: boolean
  selectedPeriod?: string
  hasRealData?: boolean
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<DashboardTab>('visao-geral')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isQuickFinderOpen, setIsQuickFinderOpen] = useState(false)

  // Período selecionado (formato YYYY-MM)
  const activePeriod = selectedPeriod || payload.period || '2026-04'
  const [yearStr, monthStr] = activePeriod.split('-')
  const selectedYear = parseInt(yearStr, 10)
  const selectedMonth = parseInt(monthStr, 10) - 1 // 0-11

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Navegação dinâmica entre meses via URL preservando a aba ativa
  const handlePeriodChange = (newYear: number, newMonth: number) => {
    const formattedPeriod = `${newYear}-${String(newMonth + 1).padStart(2, '0')}`
    const currentHash = typeof window !== 'undefined' ? window.location.hash : ''
    router.push(`${basePath}?filter=${currentFilter}&period=${formattedPeriod}${currentHash}`)
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      handlePeriodChange(selectedYear - 1, 11)
    } else {
      handlePeriodChange(selectedYear, selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      handlePeriodChange(selectedYear + 1, 0)
    } else {
      handlePeriodChange(selectedYear, selectedMonth + 1)
    }
  }

  const handleFilterChange = (filter: DashboardFilter) => {
    router.push(`${basePath}?filter=${filter}&period=${activePeriod}`)
  }

  // Sincronização de abas por hash da URL
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        if (hash === 'visao-geral' || hash === 'visao-geral-graficos') setActiveTab('visao-geral')
        else if (hash === 'auditoria' || hash === 'lancamentos') setActiveTab('auditoria')
        else if (hash === 'orcamento' || hash === 'categorias-planilha') setActiveTab('orcamento')
        else if (hash === 'investimentos' || hash === 'balanceamento-investimentos') setActiveTab('investimentos')
        else if (hash === 'parcelamentos' || hash === 'parcelamentos-dividas') setActiveTab('parcelamentos')
        else if (hash === 'ingestao' || hash === 'anexar-fatura') setActiveTab('ingestao')
        else if (hash === 'historico' || hash === 'historico-mensal') setActiveTab('historico')
      }
    }

    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab)
        window.location.hash = '#' + e.detail.tab
      }
    }

    window.addEventListener('hashchange', handleHash)
    window.addEventListener('leaomed_switch_tab', handleSwitchTab)
    window.addEventListener('leaomed_open_quick_finder', () => setIsQuickFinderOpen(true))
    window.addEventListener('leaomed_open_quick_tx', () => setIsQuickTxOpen(true))
    window.addEventListener('leaomed_open_upload', () => setIsUploadModalOpen(true))

    handleHash()

    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('leaomed_switch_tab', handleSwitchTab)
    }
  }, [])

  const handleTabClick = (tabId: DashboardTab) => {
    setActiveTab(tabId)
    window.location.hash = '#' + tabId
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Configuração das abas executivas
  const executiveTabs: { id: DashboardTab; label: string; icon: any; badge?: string }[] = [
    { id: 'visao-geral', label: 'Cockpit em Camadas', icon: BarChart3 },
    { id: 'auditoria', label: 'Auditoria de Lançamentos', icon: ListFilter },
    { id: 'orcamento', label: 'Orçamento & Categorias', icon: LayoutDashboard },
    { id: 'investimentos', label: 'Investimentos', icon: PieChart },
    { id: 'parcelamentos', label: 'Parcelamentos', icon: Receipt },
    { id: 'ingestao', label: 'Anexar Fatura', icon: UploadCloud },
    { id: 'historico', label: 'Histórico Anual', icon: TrendingUp },
  ]

  return (
    <div className="flex flex-col gap-5 md:gap-7 max-w-7xl mx-auto pb-32 md:pb-24 transition-colors">
      
      {/* Mobile Sticky Quick Navigation */}
      <MobileQuickNav activeTab={activeTab} onSelectTab={(t) => handleTabClick(t as DashboardTab)} />

      {/* ── Top Header Executivo ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 border-b border-slate-200/80 dark:border-white/5 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl overflow-hidden shadow-md border border-emerald-500/25 bg-slate-900 shrink-0">
            <img src="/logo.jpg" alt="LeãoMed Capital Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                LeãoMed Capital
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {currentFilter === 'PF' ? 'Pessoa Física' : currentFilter === 'PJ' ? 'Pessoa Jurídica' : 'Consolidado'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Gestão Financeira Médica • Visão Inicial PF • Origem PJ em Segundo Plano
            </p>
          </div>
        </div>

        {/* Controles de Topo: Busca Global + Filtro PF/PJ + Navegação Temporal */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão de Busca Rápida Global (Ctrl+K) */}
          <button
            onClick={() => setIsQuickFinderOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-medium cursor-pointer shadow-2xs group"
            title="Buscar no App (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white dark:bg-white/10 text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10">
              Ctrl+K
            </kbd>
          </button>

          {/* Seletor Dinâmico de Mês e Ano */}
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

          {/* Alternador Global de Contexto: PF (Padrão) | PJ (Secundário) | Consolidado */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex rounded-xl shadow-2xs border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/90 p-1" role="group">
            {(['PF', 'PJ', 'CONSOLIDATED'] as DashboardFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-center active:scale-95 ${
                  currentFilter === f 
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                {f === 'PF' ? 'Pessoa Física' : f === 'PJ' ? 'Pessoa Jurídica' : 'Consolidado'}
              </button>
            ))}
          </div>

          {/* Botão de Ação Rápida: Anexar Fatura */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/25 cursor-pointer active:scale-95 shrink-0"
            title="Anexar Fatura ou Extrato"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Anexar Fatura</span>
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

      {/* ABA 1: COCKPIT EM CAMADAS (PROPOSTA 2) */}
      {activeTab === 'visao-geral' && (
        <div key={`visao-geral-${activePeriod}-${currentFilter}`} className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Alertas Consultivos Reais */}
          {payload.alerts && payload.alerts.length > 0 && (
            <InsightsPanel alerts={payload.alerts} />
          )}

          {/* O Cockpit em 3 Camadas */}
          <TieredCockpitView 
            payload={payload}
            currentFilter={currentFilter}
            selectedPeriod={activePeriod}
            hasRealData={hasRealData}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenQuickTx={() => setIsQuickTxOpen(true)}
            onNavigateTab={(tab) => handleTabClick(tab as DashboardTab)}
            onFilterChange={handleFilterChange}
          />

          {/* Gráficos de Fluxo de Caixa e Categorias (apenas quando houver dados) */}
          {hasRealData && (
            <div id="graficos-fluxo" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24">
              <CashFlowChart 
                totalIncome={payload.cash_flow.total_income} 
                totalExpenses={payload.cash_flow.total_expenses} 
              />
              <CategoryChart 
                categories={payload.categories} 
              />
            </div>
          )}
        </div>
      )}

      {/* ABA 2: AUDITORIA DE LANÇAMENTOS (CONFERÊNCIA INDIVIDUAL DESKTOP) */}
      {activeTab === 'auditoria' && (
        <div key={`auditoria-${activePeriod}-${currentFilter}`} className="flex flex-col gap-6 animate-in fade-in duration-200">
          <GranularExpenseAuditor 
            key={`auditor-${activePeriod}-${currentFilter}`}
            currentFilter={currentFilter}
            isDemo={isDemo}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>
      )}

      {/* ABA 3: ORÇAMENTO & CATEGORIAS (PLANILHA DE DESPESAS FIXAS/VARIÁVEIS) */}
      {activeTab === 'orcamento' && (
        <div key={`orcamento-${activePeriod}-${currentFilter}`} className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="categorias-planilha" className="scroll-mt-24">
            <BudgetBreakdown 
              key={`budget-${activePeriod}-${currentFilter}`}
              currentFilter={currentFilter} 
              isDemo={isDemo} 
              selectedMonth={selectedMonth} 
              selectedYear={selectedYear} 
            />
          </div>
        </div>
      )}

      {/* ABA 4: INVESTIMENTOS & PATRIMÔNIO (ÁREA COMPLETA) */}
      {activeTab === 'investimentos' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="balanceamento-investimentos" className="scroll-mt-24">
            <InvestmentRebalance isDemo={isDemo} />
          </div>
        </div>
      )}

      {/* ABA 5: PARCELAMENTOS & DÍVIDAS */}
      {activeTab === 'parcelamentos' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="parcelamentos-dividas" className="scroll-mt-24">
            <InstallmentsProjection 
              isDemo={isDemo} 
              selectedMonth={selectedMonth} 
              selectedYear={selectedYear} 
              onBack={() => handleTabClick('visao-geral')}
            />
          </div>
        </div>
      )}

      {/* ABA 6: ANEXAR FATURA (CENTRAL DE INGESTÃO) */}
      {activeTab === 'ingestao' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div id="central-ingestao" className="scroll-mt-24">
            <DataIngestionCenter isDemo={isDemo} />
          </div>
        </div>
      )}

      {/* ABA 7: HISTÓRICO ANUAL */}
      {activeTab === 'historico' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <HistoricalOverview isDemo={isDemo} />
        </div>
      )}

      {/* ── MODAIS GLOBAIS ─────────────────────────────────────────────── */}
      <QuickTransactionModal 
        isOpen={isQuickTxOpen} 
        onClose={() => setIsQuickTxOpen(false)} 
      />

      <DocumentUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <GlobalQuickFinder 
        isOpen={isQuickFinderOpen}
        onClose={() => setIsQuickFinderOpen(false)}
        onSelectTab={(tabId) => handleTabClick(tabId as DashboardTab)}
        onOpenQuickTx={() => setIsQuickTxOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      <OnboardingWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />

      {/* TabBar Nativa para Mobile (Apple HIG) */}
      <AppleMobileTabBar />

    </div>
  )
}
