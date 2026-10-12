'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, ShieldCheck, ArrowUpRight, ArrowDownRight, Sparkles, Calendar, Layers } from 'lucide-react'
import { GranularTransactionStore } from '@/utils/granularTransactionStore'
import { DashboardFilter } from '@/utils/dashboardData'

interface AnnualConsolidatedViewProps {
  currentFilter: DashboardFilter
  isDemo?: boolean
}

// Dados anuais auditados mês a mês de 2026 (Jan a Set)


// Modelo Demonstrativo Anual Genérico
const DEMO_ANNUAL_DATA_2026 = [
  { month: 'Jan', fullName: 'Janeiro', incomeConsolidated: 44500.00, expensesConsolidated: 26250.00, incomePf: 29500.00, expensesPf: 20800.00, incomePj: 35000.00, expensesPj: 5450.00 },
  { month: 'Fev', fullName: 'Fevereiro', incomeConsolidated: 47000.00, expensesConsolidated: 25550.00, incomePf: 31000.00, expensesPf: 19700.00, incomePj: 38000.00, expensesPj: 5850.00 },
  { month: 'Mar', fullName: 'Março', incomeConsolidated: 43800.00, expensesConsolidated: 24580.00, incomePf: 29300.00, expensesPf: 19200.00, incomePj: 34000.00, expensesPj: 5380.00 },
  { month: 'Abr', fullName: 'Abril', incomeConsolidated: 46500.00, expensesConsolidated: 26020.00, incomePf: 30500.00, expensesPf: 20400.00, incomePj: 37500.00, expensesPj: 5620.00 },
  { month: 'Mai', fullName: 'Maio', incomeConsolidated: 45800.00, expensesConsolidated: 25620.00, incomePf: 30800.00, expensesPf: 20100.00, incomePj: 36000.00, expensesPj: 5520.00 },
  { month: 'Jun', fullName: 'Junho', incomeConsolidated: 49400.00, expensesConsolidated: 28600.00, incomePf: 32900.00, expensesPf: 22400.00, incomePj: 38500.00, expensesPj: 6200.00 },
  { month: 'Jul', fullName: 'Julho', incomeConsolidated: 48200.00, expensesConsolidated: 27100.00, incomePf: 32000.00, expensesPf: 21300.00, incomePj: 38000.00, expensesPj: 5800.00 },
  { month: 'Ago', fullName: 'Agosto', incomeConsolidated: 51000.00, expensesConsolidated: 28900.00, incomePf: 34000.00, expensesPf: 22700.00, incomePj: 40000.00, expensesPj: 6200.00 },
  { month: 'Set', fullName: 'Setembro', incomeConsolidated: 49700.00, expensesConsolidated: 27800.00, incomePf: 33000.00, expensesPf: 21900.00, incomePj: 39000.00, expensesPj: 5900.00 },
]

export function AnnualConsolidatedView({ currentFilter, isDemo = false }: AnnualConsolidatedViewProps) {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)

  const [ownTransactions, setOwnTransactions] = useState(() => GranularTransactionStore.getAll())
  useEffect(() => {
    const refresh = () => setOwnTransactions(GranularTransactionStore.getAll())
    refresh()
    window.addEventListener('leaomed_transactions_updated', refresh)
    return () => window.removeEventListener('leaomed_transactions_updated', refresh)
  }, [])
  const rawData = isDemo ? DEMO_ANNUAL_DATA_2026 : DEMO_ANNUAL_DATA_2026.map((d, index) => {
    const rows = ownTransactions.filter(t => !t.isIgnored && t.date.startsWith('2026-' + String(index + 1).padStart(2, '0')))
    const sum = (entity: 'PF' | 'PJ', income: boolean) => rows.filter(t => t.entityType === entity && (income ? t.amount > 0 : t.amount < 0)).reduce((total, t) => total + Math.abs(t.amount), 0)
    const incomePf = sum('PF', true), expensesPf = sum('PF', false), incomePj = sum('PJ', true), expensesPj = sum('PJ', false)
    return { ...d, incomeConsolidated: incomePf + incomePj, expensesConsolidated: expensesPf + expensesPj, incomePf, expensesPf, incomePj, expensesPj }
  })
  const annualCategories = useMemo(() => {
    const totals = new Map<string, number>()
    ownTransactions.filter(t => !t.isIgnored && t.amount < 0 && t.date.startsWith('2026-') && (currentFilter === 'CONSOLIDATED' || t.entityType === currentFilter)).forEach(t => totals.set(t.category, (totals.get(t.category) || 0) + Math.abs(t.amount)))
    const total = [...totals.values()].reduce((a, b) => a + b, 0)
    return [...totals].map(([name, amount]) => ({ name, amount, pct: total > 0 ? Math.round(amount / total * 1000) / 10 : 0, color: '#3B82F6' }))
  }, [ownTransactions, currentFilter])

  // Mapear dados conforme filtro ativo (Consolidado, PF ou PJ)
  const monthlyItems = useMemo(() => {
    return rawData.map(d => {
      let inc = d.incomeConsolidated
      let exp = d.expensesConsolidated

      if (currentFilter === 'PF') {
        inc = d.incomePf
        exp = d.expensesPf
      } else if (currentFilter === 'PJ') {
        inc = d.incomePj
        exp = d.expensesPj
      }

      const bal = inc - exp
      return {
        month: d.month,
        fullName: d.fullName,
        income: inc,
        expenses: exp,
        balance: bal
      }
    })
  }, [rawData, currentFilter])

  // Métricas anuais acumuladas
  const totalAnnualIncome = useMemo(() => monthlyItems.reduce((acc, m) => acc + m.income, 0), [monthlyItems])
  const totalAnnualExpenses = useMemo(() => monthlyItems.reduce((acc, m) => acc + m.expenses, 0), [monthlyItems])
  const annualBalance = totalAnnualIncome - totalAnnualExpenses
  const averageMonthlySurplus = annualBalance / monthlyItems.length
  const savingsRate = totalAnnualIncome > 0 ? (annualBalance / totalAnnualIncome) * 100 : 0

  // Máximo para escala dos gráficos
  const maxVal = Math.max(1, ...monthlyItems.map(m => Math.max(m.income, m.expenses))) * 1.15

  // Evolução acumulada do saldo ao longo do ano
  let runningBalance = 0
  const accumulatedCurve = monthlyItems.map(m => {
    runningBalance += m.balance
    return {
      month: m.month,
      accumulated: runningBalance
    }
  })
  const maxAccumulated = Math.max(...accumulatedCurve.map(c => c.accumulated))
  const minAccumulated = Math.min(0, ...accumulatedCurve.map(c => c.accumulated))
  const rangeAcc = maxAccumulated - minAccumulated || 1

  return (
    <div id="consolidado-anual" className="space-y-6 animate-in fade-in duration-300 scroll-mt-24">
      {/* Banner de Apresentação da Visão Anual */}
      <div className="p-5 md:p-6 rounded-xl bg-[var(--capital-soft,#f6f0df)] from-slate-900 via-slate-950 to-slate-900 border border-[var(--capital-accent,#927025)] shadow-sm text-[var(--capital-text,#242a2e)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--capital-soft,#f6f0df)] rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display text-lg md:text-xl font-semibold tracking-tight text-[var(--capital-text,#242a2e)]">
                  Consolidado Anual & Performance Acumulada
                </h3>
                <p className="text-xs text-[var(--capital-text,#242a2e)]">
                  Jan a Set de 2026 (9 meses auditados) • {
                    currentFilter === 'CONSOLIDATED' ? 'Visão Consolidada Integral (PJ + PF)' :
                    currentFilter === 'PJ' ? 'Faturamento & Custos da Clínica (Pessoa Jurídica)' : 'Orçamento Pessoal & Familiar (PF)'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
              Taxa de Poupança Anual: {savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 4 Grandes Números Anuais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-[var(--capital-card,#fff)] border border-[var(--capital-line,#e4dfd3)] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-[var(--capital-muted,#242a2e)] block mb-1">Faturamento Anual Bruto</span>
            <div className="text-xl sm:text-2xl font-semibold font-mono text-[var(--capital-success,#157449)] tabular-nums">
              R$ {totalAnnualIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[var(--capital-muted,#242a2e)] mt-1 block">Média: R$ {(totalAnnualIncome / 9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--capital-card,#fff)] border border-[var(--capital-line,#e4dfd3)] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-[var(--capital-muted,#242a2e)] block mb-1">Despesas Totais Anuais</span>
            <div className="text-xl sm:text-2xl font-semibold font-mono text-[var(--capital-danger,#ad3333)] tabular-nums">
              R$ {totalAnnualExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[var(--capital-muted,#242a2e)] mt-1 block">Média: R$ {(totalAnnualExpenses / 9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--capital-card,#fff)] border border-[var(--capital-line,#e4dfd3)] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-[var(--capital-muted,#242a2e)] block mb-1">Saldo Acumulado no Ano</span>
            <div className={`text-xl sm:text-2xl font-semibold font-mono tabular-nums ${annualBalance >= 0 ? 'text-[var(--capital-success,#157449)]' : 'text-[var(--capital-danger,#ad3333)]'}`}>
              {annualBalance >= 0 ? '+' : ''} R$ {annualBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[var(--capital-muted,#242a2e)] mt-1 block">Superávit total retido</span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--capital-card,#fff)] border border-[var(--capital-line,#e4dfd3)] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-[var(--capital-muted,#242a2e)] block mb-1">Sobra Média Mensal</span>
            <div className="text-xl sm:text-2xl font-semibold font-mono text-[var(--capital-accent,#927025)] tabular-nums">
              R$ {averageMonthlySurplus.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[var(--capital-muted,#242a2e)] mt-1 block">Capacidade média de aporte</span>
          </div>
        </div>
      </div>

      {/* Gráfico 1: Barras Duplas Receitas x Despesas Mês a Mês */}
      <div className="p-5 md:p-6 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-display text-base font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--capital-success,#157449)]" />
              Comparativo Mensal: Receitas vs Despesas (2026)
            </h4>
            <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
              Passe o mouse sobre as barras para inspecionar os valores exatos de cada mês
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[var(--capital-button,#c7a354)]" />
              <span className="text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span className="text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">Despesas</span>
            </div>
          </div>
        </div>

        {/* Barras SVG Interativas */}
        <div className="h-64 sm:h-72 w-full pt-8 pb-4 flex items-end justify-between gap-2 sm:gap-4 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
          {monthlyItems.map((m) => {
            const incPct = maxVal > 0 ? (m.income / maxVal) * 100 : 0
            const expPct = maxVal > 0 ? (m.expenses / maxVal) * 100 : 0
            const isSelected = hoveredMonth === m.month

            return (
              <div
                key={m.month}
                onMouseEnter={() => setHoveredMonth(m.month)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Tooltip flutuante no hover */}
                {isSelected && (
                  <div className="absolute -top-24 z-30 p-2.5 rounded-xl bg-[var(--capital-card,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] text-[11px] shadow-sm border border-[var(--capital-line,#e4dfd3)] whitespace-nowrap pointer-events-none animate-in fade-in duration-150">
                    <span className="font-bold text-[var(--capital-text,#242a2e)] block mb-1">{m.fullName} / 2026</span>
                    <div className="text-[var(--capital-success,#157449)] font-mono">Receitas: R$ {m.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-[var(--capital-danger,#ad3333)] font-mono">Despesas: R$ {m.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`font-mono font-bold mt-1 pt-1 border-t border-[var(--capital-line,#e4dfd3)] ${m.balance >= 0 ? 'text-[var(--capital-success,#157449)]' : 'text-[var(--capital-danger,#ad3333)]'}`}>
                      Saldo: {m.balance >= 0 ? '+' : ''} R$ {m.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* Colunas lado a lado */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                  {/* Barra Receitas */}
                  <div
                    className="w-full max-w-[18px] sm:max-w-[26px] bg-[var(--capital-soft,#f6f0df)] from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${incPct}%` }}
                  />
                  {/* Barra Despesas */}
                  <div
                    className="w-full max-w-[18px] sm:max-w-[26px] bg-[var(--capital-soft,#f6f0df)] from-rose-600 to-rose-400 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${expPct}%` }}
                  />
                </div>

                {/* Rótulo do Mês */}
                <div className="mt-2 text-center">
                  <span className={`text-xs font-bold block ${isSelected ? 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]' : 'text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]'}`}>
                    {m.month}
                  </span>
                  <span className={`text-[10px] font-mono block ${m.balance >= 0 ? 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-semibold' : 'text-[var(--capital-danger,#ad3333)] font-bold'}`}>
                    {m.balance >= 0 ? '+' : ''}{(m.balance / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rodapé do Gráfico com Análise Executiva */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] pt-2 gap-2">
          <span>* Observação Contábil: O consolidado anual aguarda lançamentos próprios para apuração.</span>
          <span className="font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">Total Auditado: 9 meses</span>
        </div>
      </div>

      {/* Gráfico 2: Evolução do Saldo Acumulado & Linha do Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 md:p-6 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] shadow-sm space-y-4">
          <div>
            <h4 className="font-display text-base font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--capital-accent,#927025)]" />
              Curva de Acúmulo de Saldo (Jan a Set/2026)
            </h4>
            <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
              Evolução progressiva da sobra financeira gerada ao longo do ano
            </p>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 pb-2 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
            {accumulatedCurve.map((c, i) => {
              const heightPct = Math.max(10, Math.min(100, ((c.accumulated - minAccumulated) / rangeAcc) * 100))
              return (
                <div key={c.month} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <span className="text-[10px] font-mono font-bold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {(c.accumulated / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full max-w-[20px] bg-[var(--capital-soft,#f6f0df)] from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-[var(--capital-muted,#242a2e)] font-medium mt-1">
                    {c.month}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] pt-1">
            <span>Saldo acumulado total retido em Set/26</span>
            <span className="font-semibold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] font-mono">+ R$ {annualBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* 3. Centros de Custo Anuais */}
        <div className="p-5 md:p-6 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] shadow-sm space-y-4">
          <div>
            <h4 className="font-display text-base font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[var(--capital-success,#157449)]" />
              Grandes Centros de Custo Acumulados no Ano
            </h4>
            <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
              Concentração das maiores saídas de caixa em 2026
            </p>
          </div>

          <div className="space-y-3">
            {annualCategories.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">{cat.name}</span>
                  </div>
                  <div className="font-mono tabular-nums text-right">
                    <span className="font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">R$ {cat.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                    <span className="text-[10px] text-[var(--capital-muted,#242a2e)] ml-1">({cat.pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
