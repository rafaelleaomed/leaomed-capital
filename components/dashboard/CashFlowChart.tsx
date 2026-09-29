import React from 'react'
import { Activity, ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface CashFlowChartProps {
  totalIncome: number;
  totalExpenses: number;
}

export function CashFlowChart({ totalIncome, totalExpenses }: CashFlowChartProps) {
  const maxVal = Math.max(totalIncome, totalExpenses, 1)
  const incomeHeight = `${Math.min(100, Math.max(15, (totalIncome / maxVal) * 100))}%`
  const expensesHeight = `${Math.min(100, Math.max(15, (totalExpenses / maxVal) * 100))}%`
  const netResult = totalIncome - totalExpenses

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Fluxo de Caixa Mensal (Pessoa Jurídica & PF)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparativo volumétrico de entradas vs saídas</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${netResult >= 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'}`}>
          {netResult >= 0 ? 'Superávit' : 'Déficit'} de R$ {Math.abs(netResult).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Visual Bars Container */}
      <div className="flex-1 flex items-end justify-center gap-12 h-52 pt-4 pb-2 border-b border-slate-100 dark:border-white/5">
        {/* Barra de Receitas */}
        <div className="flex flex-col items-center gap-2 group w-24">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-transform group-hover:-translate-y-1">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <div 
            className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-700 shadow-md group-hover:brightness-110"
            style={{ height: incomeHeight }}
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            Entradas
          </span>
        </div>

        {/* Barra de Despesas */}
        <div className="flex flex-col items-center gap-2 group w-24">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 transition-transform group-hover:-translate-y-1">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <div 
            className="w-full bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-xl transition-all duration-700 shadow-md group-hover:brightness-110"
            style={{ height: expensesHeight }}
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
            Saídas
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-3">
        <span>Faturamento PJ + Pró-labore</span>
        <span>Cartões C6 / Itaú / Nubank + Tributos</span>
      </div>
    </div>
  )
}
