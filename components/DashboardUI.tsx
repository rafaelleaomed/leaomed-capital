'use client'

import React, { useState, useEffect, useRef } from 'react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { useRouter } from 'next/navigation'
import { 
  UploadCloud, 
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from 'lucide-react'
import { TieredCockpitView } from './dashboard/TieredCockpitView'
import { resolveDashboardTab } from './dashboard/navigation'
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
import { AnnualConsolidatedView } from './dashboard/AnnualConsolidatedView'
import { MonthSelectorModal } from './dashboard/MonthSelectorModal'
import { NewUserOnboardingModal } from './dashboard/NewUserOnboardingModal'

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
  const [auditCategory, setAuditCategory] = useState<string | undefined>()
  const [isAnnualOpen, setIsAnnualOpen] = useState(false)
  const pendingElement = useRef<string | undefined>(undefined)
  const [navigationRequest, setNavigationRequest] = useState(0)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isQuickFinderOpen, setIsQuickFinderOpen] = useState(false)
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false)
  const [isNewUserOnboardingOpen, setIsNewUserOnboardingOpen] = useState(false)
  const [currentLoggedUserEmail, setCurrentLoggedUserEmail] = useState('')
  const [currentLoggedUserName, setCurrentLoggedUserName] = useState('')

  // Verifica se o usuário precisa preencher a configuração inicial (onboarding)
  useEffect(() => {
    if (isDemo) return
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.profile) {
          setCurrentLoggedUserEmail(data.profile.email || '')
          setCurrentLoggedUserName(data.profile.name || '')
          if (!data.profile.onboardingCompleted) {
            setIsNewUserOnboardingOpen(true)
          }
        }
      })
      .catch(() => {})
  }, [isDemo])

  // Período selecionado (formato YYYY-MM)
  const isValidPeriod = (period?: string): period is string => /^\d{4}-(0[1-9]|1[0-2])$/.test(period || '')
  const activePeriod = isValidPeriod(selectedPeriod)
    ? selectedPeriod
    : isValidPeriod(payload.period)
      ? payload.period
      : '2026-01'
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
    router.refresh()
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
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    router.push(`${basePath}?filter=${filter}&period=${activePeriod}${hash}`)
    router.refresh()
  }

  // Navigation remains compatible with existing hashes and quick actions.
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      const tab = resolveDashboardTab(hash)
      if (tab) {
        setActiveTab(tab)
        if (hash !== tab) pendingElement.current = hash
        setNavigationRequest(n => n + 1)
      }
    }
    const handleSwitchTab = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: string; elementId?: string; category?: string }>).detail
      const tab = detail?.tab && resolveDashboardTab(detail.tab)
      if (!tab) return
      if (tab === 'auditoria') setAuditCategory(detail.category)
      pendingElement.current = detail.elementId
      setActiveTab(tab)
      if (window.location.hash !== '#' + tab) window.location.hash = '#' + tab
      setNavigationRequest(n => n + 1)
    }
    const openFinder = () => setIsQuickFinderOpen(true)
    const openQuickTx = () => setIsQuickTxOpen(true)
    const openUpload = () => setIsUploadModalOpen(true)
    const openAnnual = () => setIsAnnualOpen(true)
    const closeAnnual = () => setIsAnnualOpen(false)
    window.addEventListener('hashchange', handleHash)
    window.addEventListener('leaomed_switch_tab', handleSwitchTab)
    window.addEventListener('leaomed_open_quick_finder', openFinder)
    window.addEventListener('leaomed_open_quick_tx', openQuickTx)
    window.addEventListener('leaomed_open_upload', openUpload)
    window.addEventListener('leaomed_open_annual_consolidated', openAnnual)
    window.addEventListener('leaomed_close_annual_consolidated', closeAnnual)
    handleHash()
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('leaomed_switch_tab', handleSwitchTab)
      window.removeEventListener('leaomed_open_quick_finder', openFinder)
      window.removeEventListener('leaomed_open_quick_tx', openQuickTx)
      window.removeEventListener('leaomed_open_upload', openUpload)
      window.removeEventListener('leaomed_open_annual_consolidated', openAnnual)
      window.removeEventListener('leaomed_close_annual_consolidated', closeAnnual)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('leaomed_tab_changed', { detail: { tab: activeTab } }))
    const elementId = pendingElement.current
    if (!elementId) return
    const frame = requestAnimationFrame(() => {
      if (elementId === 'reserva-emergencia') {
        window.dispatchEvent(new CustomEvent('leaomed_open_emergency_reserve'))
      } else if (elementId === 'consolidado-anual') {
        window.dispatchEvent(new CustomEvent('leaomed_open_annual_consolidated'))
      } else {
        document.getElementById(elementId)?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      }
      pendingElement.current = undefined
    })
    return () => cancelAnimationFrame(frame)
  }, [activeTab, navigationRequest])

  const handleTabClick = (tabId: DashboardTab, elementId?: string, category?: string) => {
    if (tabId === 'auditoria') setAuditCategory(category)
    setIsAnnualOpen(false)
    pendingElement.current = elementId
    setActiveTab(tabId)
    window.location.hash = '#' + tabId
    setNavigationRequest(n => n + 1)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  const titles: Record<DashboardTab, { title: string; description: string }> = {
    'visao-geral': { title: 'Seu mês, com clareza.', description: 'Entenda seus gastos e confira o que precisa de atenção.' },
    auditoria: { title: 'Auditoria de lançamentos', description: 'Confira categorias, documentos e alterações do período.' },
    orcamento: { title: 'Orçamento & cartões', description: 'Organize despesas, faturas e o planejamento dos próximos meses.' },
    investimentos: { title: 'Seu patrimônio', description: 'Carteira, rebalanceamento e simuladores em um só lugar.' },
    parcelamentos: { title: 'Parcelamentos & dívidas', description: 'Acompanhe contratos e compromissos dos próximos meses.' },
    ingestao: { title: 'Importar documentos', description: 'Adicione extratos e faturas para conferir seus lançamentos.' },
    historico: { title: 'Histórico mensal', description: 'Consulte a evolução e os detalhes dos meses anteriores.' },
  }

  return (
    <div className={isDemo ? 'flex flex-col gap-5 md:gap-7 max-w-7xl mx-auto pb-32 md:pb-24' : 'capital-workspace'}>
      <header className="capital-page-heading">
        <div>
          <h1>{titles[activeTab].title}</h1>
          <p>{titles[activeTab].description}</p>
        </div>
        <div className="capital-heading-actions">
          <button type="button" className="capital-secondary-button" onClick={() => setIsQuickTxOpen(true)}>
            <PlusCircle size={17} /><span>Novo lançamento</span>
          </button>
          <button type="button" className="capital-primary-button" onClick={() => setIsUploadModalOpen(true)}>
            <UploadCloud size={17} /><span>Importar</span>
          </button>
        </div>
      </header>
      <div className="capital-period-toolbar">
        <div className="capital-scope-picker" role="group" aria-label="Escopo financeiro">
          {(['PF', 'PJ', 'CONSOLIDATED'] as DashboardFilter[]).map(filter => (
            <button type="button" key={filter} aria-pressed={currentFilter === filter} className={currentFilter === filter ? 'active' : ''} onClick={() => handleFilterChange(filter)}>
              {filter === 'PF' ? 'Pessoa Física' : filter === 'PJ' ? 'Pessoa Jurídica' : 'Consolidado'}
            </button>
          ))}
        </div>
        <div className="capital-month-picker" aria-label="Período selecionado">
          <button type="button" className="capital-icon-button" aria-label="Mês anterior" onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
          <button
            type="button"
            className="capital-period-button"
            onClick={() => setIsMonthSelectorOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Selecionar período. Atual: ${monthNames[selectedMonth]} de ${selectedYear}`}
          >
            <CalendarDays size={16} aria-hidden="true" />
            <span>{monthNames[selectedMonth]} {selectedYear}</span>
          </button>
          <button type="button" className="capital-icon-button" aria-label="Próximo mês" onClick={handleNextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* ── CONTEÚDO DA ABA SELECIONADA ─────────────────────────────────── */}

      {/* ABA 1: COCKPIT EM CAMADAS (PROPOSTA 2) */}
      {activeTab === 'visao-geral' && isAnnualOpen && (
        <section className="min-w-0">
          <button type="button" className="capital-secondary-button mb-4" onClick={() => setIsAnnualOpen(false)}><ChevronLeft size={16} />Voltar ao meu mês</button>
          <AnnualConsolidatedView currentFilter={currentFilter} isDemo={isDemo} />
        </section>
      )}
      {activeTab === 'visao-geral' && !isAnnualOpen && (
        <div key={`visao-geral-${activePeriod}-${currentFilter}`} className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Alertas Consultivos Reais */}


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
          >
          {payload.alerts && payload.alerts.length > 0 && (
            <InsightsPanel alerts={payload.alerts} />
          )}

          {/* Gráficos de Fluxo de Caixa e Categorias (apenas quando houver dados) */}
          {hasRealData && (
            <div id="graficos-fluxo" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-24">
              <CashFlowChart 
                totalIncome={payload.cash_flow.total_income} 
                totalExpenses={payload.cash_flow.total_expenses} 
              />
              <CategoryChart 
                categories={payload.categories}
                onCategoryClick={(category) => {
                  handleTabClick('auditoria', undefined, category)
                }}
              />
            </div>
          )}
          </TieredCockpitView>
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
            initialCategory={auditCategory}
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
        onSelectTab={(tabId, elementId) => handleTabClick(tabId as DashboardTab, elementId)}
        onOpenQuickTx={() => setIsQuickTxOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
        categories={payload.categories}
      />

      <OnboardingWizardModal 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />

      <MonthSelectorModal
        isOpen={isMonthSelectorOpen}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelect={(month, year) => handlePeriodChange(year, month)}
        onClose={() => setIsMonthSelectorOpen(false)}
      />

      <NewUserOnboardingModal
        isOpen={isNewUserOnboardingOpen}
        userEmail={currentLoggedUserEmail}
        initialName={currentLoggedUserName}
        onCompleted={(updatedName) => {
          setIsNewUserOnboardingOpen(false)
          setCurrentLoggedUserName(updatedName)
          router.refresh()
        }}
      />

      {/* TabBar Nativa para Mobile (Apple HIG) */}
      <AppleMobileTabBar />

    </div>
  )
}
