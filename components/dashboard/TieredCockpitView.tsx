'use client'

import React, { useState } from 'react'
import { 
  Building2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  UploadCloud, 
  PlusCircle, 
  CreditCard, 
  PieChart, 
  Receipt,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { DeliveryPayload, DashboardFilter } from '@/utils/dashboardData'
import { usePrivacy } from '@/context/PrivacyContext'

interface TieredCockpitViewProps {
  payload: DeliveryPayload
  currentFilter: DashboardFilter
  selectedPeriod: string
  hasRealData: boolean
  onOpenUpload: () => void
  onOpenQuickTx: () => void
  onNavigateTab: (tabId: string) => void
  onFilterChange: (filter: DashboardFilter) => void
}

export function TieredCockpitView({
  payload,
  currentFilter,
  selectedPeriod,
  hasRealData,
  onOpenUpload,
  onOpenQuickTx,
  onNavigateTab,
  onFilterChange
}: TieredCockpitViewProps) {
  const { maskValue } = usePrivacy()
  
  // Estado de expansão das camadas
  const [isPjLayerOpen, setIsPjLayerOpen] = useState(currentFilter === 'PJ')
  const [isInvestLayerOpen, setIsInvestLayerOpen] = useState(false)

  const isPf = currentFilter === 'PF'
  const isPj = currentFilter === 'PJ'

  const cashFlow = payload.cash_flow || {
    total_income: 0,
    total_expenses: 0,
    fixed_expenses: 0,
    variable_expenses: 0
  }

  const income = cashFlow.total_income
  const expenses = cashFlow.total_expenses
  const fixedExpenses = cashFlow.fixed_expenses
  const variableExpenses = cashFlow.variable_expenses
  const netBalance = income - expenses
  const isPositive = netBalance >= 0

  const investmentsTotal = payload.investments_detail?.total_value || payload.balances?.investments || 0

  const [yearStr, monthStr] = selectedPeriod.split('-')
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const monthIndex = parseInt(monthStr, 10) - 1
  const periodLabel = `${monthNames[monthIndex] || 'Mês'} de ${yearStr}`

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      
      {/* ── Status do Mês & Alerta de Dados ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${hasRealData ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
            {hasRealData ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {hasRealData ? `Competência Fechada: ${periodLabel}` : `Sem dados cadastrados para ${periodLabel}`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {hasRealData 
                ? 'Lançamentos auditados e validados no banco de dados.'
                : 'Importe sua fatura de cartão ou extrato bancário para consolidar o mês.'}
            </p>
          </div>
        </div>

        {/* Botão de Ação Primária: Anexar Fatura */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span>Anexar Fatura</span>
          </button>

          <button
            onClick={onOpenQuickTx}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
            title="Adicionar lançamento manual avulso"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── CAMADA 1: NÍVEL SUPERIOR — ORIGEM PJ (CONSULTÓRIO & PLANTÕES) ───── */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden transition-all">
        <div 
          onClick={() => setIsPjLayerOpen(!isPjLayerOpen)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Nível 1 • Pessoa Jurídica (Empresa & Plantões)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300">
                  Origem das Receitas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Contratos de honorários hospitalares, guias DAS Simples Nacional e transferências para PF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPf && (
              <span className="hidden sm:inline text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isPjLayerOpen ? 'Recolher detalhes' : 'Expandir visão PJ'}
              </span>
            )}
            <button className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500">
              {isPjLayerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Conteúdo Expansível da Camada PJ */}
        {isPjLayerOpen && (
          <div className="p-4 pt-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Faturamento Bruto PJ
                </span>
                <span className="font-mono text-lg font-black text-slate-900 dark:text-white tabular-nums">
                  {maskValue(isPj ? income : 26500.00)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Honorários médicos e plantões
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Tributos & DAS Provisão
                </span>
                <span className="font-mono text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">
                  - {maskValue(isPj ? expenses : 3255.98)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Simples Nacional + Contabilidade
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Disponível para PF (Pró-Labore / Lucros)
                </span>
                <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {maskValue(isPj ? netBalance : 23244.02)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Livre para transferência pessoal
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={() => onFilterChange('PJ')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar área completa da Pessoa Jurídica</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── CAMADA 2: NÍVEL CENTRAL — CORAÇÃO PESSOA FÍSICA (DESTAQUE MÁXIMO) ─ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Nível 2 • Fluxo Pessoal (Pessoa Física)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O que entrou no bolso, compromissos fixos inegociáveis e saldo livre
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {periodLabel}
          </span>
        </div>

        {/* 4 Cards Principais de Fluxo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* 1. Receitas PF */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Entradas no Bolso</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {maskValue(income)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
              Pró-labore + Lucros transferidos
            </span>
          </div>

          {/* 2. Despesas Obrigatórias (Essenciais) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xs hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gastos Obrigatórios</span>
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {maskValue(fixedExpenses)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
              T-Cross, Moradia, Saúde e Financiamentos
            </span>
          </div>

          {/* 3. Despesas Discricionárias / Livres */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xs hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gastos Livres / Variáveis</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {maskValue(variableExpenses)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
              Lazer, restaurantes e compras
            </span>
          </div>

          {/* 4. Resultado Líquido do Mês */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xs hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resultado do Período</span>
              <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className={`font-mono text-xl sm:text-2xl font-black tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isPositive ? '+' : ''} {maskValue(netBalance)}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
              {isPositive ? 'Excedente livre para investir' : 'Atenção ao déficit operacional'}
            </span>
          </div>

        </div>

        {/* Resumo Rápido das Principais Categorias do Mês */}
        {payload.categories && payload.categories.length > 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Distribuição das Maiores Despesas
              </span>
              <button
                onClick={() => onNavigateTab('orcamento')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver planilha detalhada</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {payload.categories.slice(0, 4).map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {c.name}
                  </span>
                  <div className="font-mono text-sm font-black text-slate-900 dark:text-white mt-1">
                    {maskValue(c.total)}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(5, c.percentage))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {c.percentage}% do total
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── CAMADA 3: NÍVEL INFERIOR — DESTINO & PATRIMÔNIO (INVESTIMENTOS) ─── */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden transition-all">
        <div 
          onClick={() => setIsInvestLayerOpen(!isInvestLayerOpen)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors select-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Nível 3 • Patrimônio & Investimentos
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300">
                  Destino do Capital
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Patrimônio acumulado, reserva de emergência e alocação por classes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="font-mono text-sm font-black text-slate-900 dark:text-white tabular-nums block">
                {maskValue(investmentsTotal)}
              </span>
              <span className="text-[10px] text-slate-400">Posição consolidada</span>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-400 dark:text-slate-500">
              {isInvestLayerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Detalhes Expansíveis de Investimentos */}
        {isInvestLayerOpen && (
          <div className="p-4 pt-2 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Patrimônio Total Investido
                </span>
                <span className="font-mono text-lg font-black text-purple-600 dark:text-purple-400 tabular-nums">
                  {maskValue(investmentsTotal)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Renda Fixa, Ações, Internacional e Cripto
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Capacidade de Aporte do Mês
                </span>
                <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {maskValue(Math.max(0, netBalance))}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Baseado no saldo líquido real apurado
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Gestão da Carteira
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Rebalanceamento & Metas
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab('investimentos')}
                  className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Abrir tela completa de investimentos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

    </div>
  )
}
