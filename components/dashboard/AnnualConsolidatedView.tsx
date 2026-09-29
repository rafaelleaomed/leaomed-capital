'use client'

import React, { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, ShieldCheck, ArrowUpRight, ArrowDownRight, Sparkles, Calendar, Layers } from 'lucide-react'
import { DashboardFilter } from '@/utils/dashboardData'

interface AnnualConsolidatedViewProps {
  currentFilter: DashboardFilter
  isDemo?: boolean
}

// Dados anuais auditados mês a mês de 2026 (Jan a Set)
const REAL_ANNUAL_DATA_2026 = [
  { month: 'Jan', fullName: 'Janeiro', incomeConsolidated: 23000.00, expensesConsolidated: 10860.21, incomePf: 19000.00, expensesPf: 6376.24, incomePj: 23000.00, expensesPj: 4483.97 },
  { month: 'Fev', fullName: 'Fevereiro', incomeConsolidated: 29300.00, expensesConsolidated: 11627.37, incomePf: 23500.00, expensesPf: 6517.47, incomePj: 29300.00, expensesPj: 5109.90 },
  { month: 'Mar', fullName: 'Março', incomeConsolidated: 24600.00, expensesConsolidated: 10006.33, incomePf: 22000.00, expensesPf: 6992.65, incomePj: 24600.00, expensesPj: 3013.68 },
  { month: 'Abr', fullName: 'Abril', incomeConsolidated: 26979.69, expensesConsolidated: 24257.48, incomePf: 22879.69, expensesPf: 20982.68, incomePj: 26600.00, expensesPj: 3274.80 },
  { month: 'Mai', fullName: 'Maio', incomeConsolidated: 26098.91, expensesConsolidated: 30398.25, incomePf: 23398.91, expensesPf: 27004.93, incomePj: 25700.00, expensesPj: 3393.32 },
  { month: 'Jun', fullName: 'Junho', incomeConsolidated: 29479.99, expensesConsolidated: 31985.63, incomePf: 25979.99, expensesPf: 28729.65, incomePj: 26500.00, expensesPj: 3255.98 },
  { month: 'Jul', fullName: 'Julho', incomeConsolidated: 26720.00, expensesConsolidated: 17475.76, incomePf: 23920.00, expensesPf: 16984.55, incomePj: 26300.00, expensesPj: 491.21 },
  { month: 'Ago', fullName: 'Agosto', incomeConsolidated: 30770.00, expensesConsolidated: 18657.29, incomePf: 24000.00, expensesPf: 18166.08, incomePj: 27400.00, expensesPj: 491.21 },
  { month: 'Set', fullName: 'Setembro', incomeConsolidated: 27300.00, expensesConsolidated: 20869.01, incomePf: 24500.00, expensesPf: 17619.01, incomePj: 26800.00, expensesPj: 3250.00 },
]

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

  const rawData = isDemo ? DEMO_ANNUAL_DATA_2026 : REAL_ANNUAL_DATA_2026

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
  const maxVal = Math.max(...monthlyItems.map(m => Math.max(m.income, m.expenses))) * 1.15

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
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/20 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-display text-lg md:text-xl font-black tracking-tight text-white">
                  Consolidado Anual & Performance Acumulada
                </h3>
                <p className="text-xs text-slate-300">
                  Jan a Set de 2026 (9 meses auditados) • {
                    currentFilter === 'CONSOLIDATED' ? 'Visão Consolidada Integral (PJ + PF)' :
                    currentFilter === 'PJ' ? 'Faturamento & Custos da Clínica (Pessoa Jurídica)' : 'Orçamento Pessoal & Familiar (PF)'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Taxa de Poupança Anual: {savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 4 Grandes Números Anuais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Faturamento Anual Bruto</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tabular-nums">
              R$ {totalAnnualIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Média: R$ {(totalAnnualIncome / 9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Despesas Totais Anuais</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 tabular-nums">
              R$ {totalAnnualExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Média: R$ {(totalAnnualExpenses / 9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Saldo Acumulado no Ano</span>
            <div className={`text-xl sm:text-2xl font-black font-mono tabular-nums ${annualBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {annualBalance >= 0 ? '+' : ''} R$ {annualBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Superávit total retido</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Sobra Média Mensal</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-400 tabular-nums">
              R$ {averageMonthlySurplus.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Capacidade média de aporte</span>
          </div>
        </div>
      </div>

      {/* Gráfico 1: Barras Duplas Receitas x Despesas Mês a Mês */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Comparativo Mensal: Receitas vs Despesas (2026)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Passe o mouse sobre as barras para inspecionar os valores exatos de cada mês
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300">Receitas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span className="text-slate-700 dark:text-slate-300">Despesas</span>
            </div>
          </div>
        </div>

        {/* Barras SVG Interativas */}
        <div className="h-64 sm:h-72 w-full pt-8 pb-4 flex items-end justify-between gap-2 sm:gap-4 border-b border-slate-200 dark:border-white/10">
          {monthlyItems.map((m) => {
            const incPct = (m.income / maxVal) * 100
            const expPct = (m.expenses / maxVal) * 100
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
                  <div className="absolute -top-24 z-30 p-2.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white text-[11px] shadow-xl border border-white/20 whitespace-nowrap pointer-events-none animate-in fade-in duration-150">
                    <span className="font-bold text-white block mb-1">{m.fullName} / 2026</span>
                    <div className="text-emerald-400 font-mono">Receitas: R$ {m.income.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-rose-400 font-mono">Despesas: R$ {m.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className={`font-mono font-bold mt-1 pt-1 border-t border-white/10 ${m.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Saldo: {m.balance >= 0 ? '+' : ''} R$ {m.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* Colunas lado a lado */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                  {/* Barra Receitas */}
                  <div
                    className="w-full max-w-[18px] sm:max-w-[26px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${incPct}%` }}
                  />
                  {/* Barra Despesas */}
                  <div
                    className="w-full max-w-[18px] sm:max-w-[26px] bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${expPct}%` }}
                  />
                </div>

                {/* Rótulo do Mês */}
                <div className="mt-2 text-center">
                  <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {m.month}
                  </span>
                  <span className={`text-[10px] font-mono block ${m.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500 font-bold'}`}>
                    {m.balance >= 0 ? '+' : ''}{(m.balance / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rodapé do Gráfico com Análise Executiva */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 gap-2">
          <span>* Observação Contábil: Os picos de despesas em Maio e Junho/2026 refletem a entrada e quitação do T-Cross e tributos concentrados.</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">Total Auditado: 9 meses</span>
        </div>
      </div>

      {/* Gráfico 2: Evolução do Saldo Acumulado & Linha do Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div>
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Curva de Acúmulo de Saldo (Jan a Set/2026)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evolução progressiva da sobra financeira gerada ao longo do ano
            </p>
          </div>

          <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 pb-2 border-b border-slate-100 dark:border-white/5">
            {accumulatedCurve.map((c, i) => {
              const heightPct = Math.max(10, Math.min(100, ((c.accumulated - minAccumulated) / rangeAcc) * 100))
              return (
                <div key={c.month} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(c.accumulated / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full max-w-[20px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium mt-1">
                    {c.month}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Saldo acumulado total retido em Set/26</span>
            <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">+ R$ {annualBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* 3. Centros de Custo Anuais */}
        <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
          <div>
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              Grandes Centros de Custo Acumulados no Ano
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Concentração das maiores saídas de caixa em 2026
            </p>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Transporte & Veículo (T-Cross Localiza + Safra)', amount: 62450.00, pct: 35.5, color: '#3B82F6' },
              { name: 'Moradia & Condomínio / Casa', amount: 38200.00, pct: 21.7, color: '#10B981' },
              { name: 'Tributos Simples Nacional / DAS (PJ)', amount: 28400.00, pct: 16.1, color: '#F59E0B' },
              { name: 'Financiamentos & Imóveis (Gramado Parks)', amount: 16788.00, pct: 9.5, color: '#8B5CF6' },
              { name: 'Compras, Saúde & Pessoal', amount: 30299.33, pct: 17.2, color: '#EC4899' },
            ].map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <div className="font-mono tabular-nums text-right">
                    <span className="font-bold text-slate-900 dark:text-white">R$ {cat.amount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({cat.pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
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
