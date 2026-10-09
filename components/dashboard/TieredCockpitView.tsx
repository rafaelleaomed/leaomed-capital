'use client'

import React, { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ArrowRight, Wallet, Building2, TrendingUp, ChevronDown, UploadCloud, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { usePrivacy } from '@/context/PrivacyContext'
import { ReliefCard } from './ReliefCard'
import { InstallmentStore } from '@/utils/installmentStore'
import { convertInstallmentItemsToContracts } from '@/utils/installmentsEngine'

interface TieredCockpitViewProps {
  children?: React.ReactNode
  payload: DeliveryPayload
  currentFilter: DashboardFilter
  selectedPeriod: string
  hasRealData: boolean
  onOpenUpload: () => void
  onOpenQuickTx: () => void
  onNavigateTab: (tabId: string) => void
  onFilterChange: (filter: DashboardFilter) => void
}

export function TieredCockpitView({ payload, currentFilter, selectedPeriod, hasRealData, onOpenUpload, onOpenQuickTx, onNavigateTab, onFilterChange, children }: TieredCockpitViewProps) {
  const { maskValue } = usePrivacy()
  const [isPjLayerOpen, setIsPjLayerOpen] = useState(currentFilter === 'PJ')
  const [isInvestLayerOpen, setIsInvestLayerOpen] = useState(false)
  const [contracts, setContracts] = useState(() => convertInstallmentItemsToContracts(InstallmentStore.getInstallments()))
  React.useEffect(() => {
    const handleUpdate = () => setContracts(convertInstallmentItemsToContracts(InstallmentStore.getInstallments()))
    window.addEventListener('leaomed_installments_updated', handleUpdate)
    return () => window.removeEventListener('leaomed_installments_updated', handleUpdate)
  }, [])

  const cashFlow = payload.cash_flow || { total_income: 0, total_expenses: 0, fixed_expenses: 0, variable_expenses: 0 }
  const income = cashFlow.total_income
  const expenses = cashFlow.total_expenses
  const netBalance = income - expenses
  const investmentsTotal = payload.investments_detail?.total_value || payload.balances?.investments || 0
  const [year, month] = selectedPeriod.split('-')
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const periodLabel = `${monthNames[Number(month) - 1] || 'Mês'} de ${year}`

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="capital-stats">
        {[
          { label: 'Receitas do mês', value: income, caption: 'Entradas registradas no período', icon: ArrowDownLeft, tone: 'green' },
          { label: 'Despesas do mês', value: expenses, caption: 'Gastos registrados no período', icon: ArrowUpRight, tone: 'amber' },
          { label: 'Resultado do mês', value: netBalance, caption: 'Receitas menos despesas', icon: Wallet, tone: netBalance >= 0 ? 'teal' : 'amber' }
        ].map(stat => (
          <button type="button" key={stat.label} className={`capital-stat ${stat.tone}`} onClick={() => onNavigateTab('auditoria')}>
            <span className="stat-top"><span>{stat.label}</span><span className="stat-icon"><stat.icon size={21} /></span></span>
            <strong>{maskValue(stat.value)}</strong>
            <span className="stat-caption">{stat.caption}<ArrowRight size={15} /></span>
          </button>
        ))}
      </div>
      <ReliefCard contracts={contracts} scope={currentFilter === 'PJ' ? 'PJ' : 'PF'} month={selectedPeriod} onOpen={() => onNavigateTab('parcelamentos')} />
      {children}
      <section className="capital-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span className={`panel-icon ${hasRealData ? 'gold' : 'amber'}`}>{hasRealData ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}</span>
            <div><h2>{hasRealData ? `Lançamentos de ${periodLabel}` : 'Este mês ainda não tem dados'}</h2><p className="small-note mt-1">{hasRealData ? 'Confira seus lançamentos na auditoria.' : `Importe sua fatura ou extrato para consolidar ${periodLabel}.`}</p></div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {hasRealData && <button type="button" className="secondary-button" onClick={() => onNavigateTab('auditoria')}>Conferir lançamentos<ArrowRight size={16} /></button>}
            <button type="button" className="primary-button" onClick={onOpenUpload}><UploadCloud size={16} />Anexar fatura</button>
            <button type="button" className="icon-button" onClick={onOpenQuickTx} aria-label="Adicionar lançamento manual" title="Adicionar lançamento manual"><PlusCircle size={20} /></button>
          </div>
        </div>
      </section>
      <section className="capital-panel">
        <div className="panel-heading"><div><span className="eyebrow">COMPOSIÇÃO DAS DESPESAS</span><h2>Compromissos e gastos variáveis</h2></div><button type="button" className="text-action" onClick={() => onNavigateTab('orcamento')}>Ver orçamento<ArrowRight size={15} /></button></div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><dt className="small-note">Gastos obrigatórios</dt><dd className="text-xl font-semibold tabular-nums mt-1">{maskValue(cashFlow.fixed_expenses)}</dd></div>
          <div><dt className="small-note">Gastos livres / variáveis</dt><dd className="text-xl font-semibold tabular-nums mt-1">{maskValue(cashFlow.variable_expenses)}</dd></div>
        </dl>
      </section>
      {payload.categories && payload.categories.length > 0 && <section className="capital-panel">
        <div className="panel-heading"><div><span className="eyebrow">RESUMO DO PERÍODO</span><h2>Maiores despesas</h2></div><button type="button" className="text-action" onClick={() => onNavigateTab('orcamento')}>Ver planilha<ArrowRight size={15} /></button></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{payload.categories.slice(0, 4).map((category, index) => <div key={`${category.name}-${index}`} className="min-w-0"><span className="block text-sm truncate">{category.name}</span><strong className="block mt-1 tabular-nums">{maskValue(category.total)}</strong><div className="bar-track mt-2"><span style={{ width: `${Math.min(100, Math.max(5, category.percentage))}%` }} /></div><span className="small-note">{category.percentage}% do total</span></div>)}</div>
      </section>}
      <section className="capital-panel">
        <button type="button" className="flex w-full items-center gap-3 text-left" aria-expanded={isPjLayerOpen} aria-controls="overview-pj-details" onClick={() => setIsPjLayerOpen(!isPjLayerOpen)}><span className="panel-icon gold"><Building2 size={22} /></span><span className="flex-1 min-w-0"><span className="block font-semibold">Pessoa jurídica</span><span className="small-note">Empresa, honorários e plantões</span></span><ChevronDown size={18} className={isPjLayerOpen ? 'rotate-180' : ''} /></button>
        {isPjLayerOpen && <div id="overview-pj-details" className="mt-5">
          {currentFilter === 'PJ' ? <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[['Receitas PJ', income], ['Despesas PJ', expenses], ['Resultado PJ', netBalance]].map(([label, value]) => <div key={String(label)}><dt className="small-note">{label}</dt><dd className="text-lg font-semibold tabular-nums mt-1">{maskValue(Number(value))}</dd></div>)}</dl> : <p className="small-note">Selecione o escopo PJ para consultar os valores registrados da empresa no período.</p>}
          <button type="button" className="text-action mt-4" onClick={() => onFilterChange('PJ')}>Acessar área completa da pessoa jurídica<ArrowRight size={15} /></button>
        </div>}
      </section>
      <section className="capital-panel">
        <button type="button" className="flex w-full items-center gap-3 text-left" aria-expanded={isInvestLayerOpen} aria-controls="overview-investment-details" onClick={() => setIsInvestLayerOpen(!isInvestLayerOpen)}><span className="panel-icon teal"><TrendingUp size={22} /></span><span className="flex-1 min-w-0"><span className="block font-semibold">Patrimônio e investimentos</span><span className="small-note">Carteira, reserva e metas de aporte</span></span><span className="hidden sm:block font-semibold tabular-nums">{maskValue(investmentsTotal)}</span><ChevronDown size={18} className={isInvestLayerOpen ? 'rotate-180' : ''} /></button>
        {isInvestLayerOpen && <div id="overview-investment-details" className="mt-5"><dl className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><dt className="small-note">Patrimônio total investido</dt><dd className="text-lg font-semibold tabular-nums mt-1">{maskValue(investmentsTotal)}</dd></div><div><dt className="small-note">Capacidade de aporte do mês</dt><dd className="text-lg font-semibold tabular-nums mt-1">{maskValue(Math.max(0, netBalance))}</dd><p className="small-note">Baseada no saldo líquido apurado</p></div></dl><button type="button" className="text-action mt-4" onClick={() => onNavigateTab('investimentos')}>Abrir carteira e simuladores<ArrowRight size={15} /></button></div>}
      </section>
    </div>
  )
}
