'use client'

import React from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { usePrivacy } from '@/context/PrivacyContext'

interface CashFlowChartProps { totalIncome: number; totalExpenses: number }

export function CashFlowChart({ totalIncome, totalExpenses }: CashFlowChartProps) {
  const { maskValue } = usePrivacy()
  const maxVal = Math.max(totalIncome, totalExpenses, 1)
  const incomeHeight = `${Math.min(100, Math.max(15, (totalIncome / maxVal) * 100))}%`
  const expensesHeight = `${Math.min(100, Math.max(15, (totalExpenses / maxVal) * 100))}%`
  const netResult = totalIncome - totalExpenses
  return (
    <section className="capital-panel min-w-0 flex flex-col">
      <div className="panel-heading"><div><span className="eyebrow">COMPARATIVO DO PERÍODO</span><h2>Receitas e despesas</h2></div></div>
      <p className="small-note">{netResult >= 0 ? 'Superávit' : 'Déficit'} de {maskValue(Math.abs(netResult))}</p>
      <div role="img" aria-label={`Receitas ${maskValue(totalIncome)} e despesas ${maskValue(totalExpenses)}`} className="flex items-end justify-center gap-8 sm:gap-12 h-64 pt-5 pb-3 border-b border-[var(--capital-line)]">
        {[
          { label: 'Entradas', value: totalIncome, height: incomeHeight, color: 'var(--capital-success)', Icon: ArrowDownLeft },
          { label: 'Saídas', value: totalExpenses, height: expensesHeight, color: 'var(--capital-accent)', Icon: ArrowUpRight }
        ].map(({ label, value, height, color, Icon }) => <div key={label} className="flex flex-col items-center gap-2 w-24 h-full justify-end min-w-0">
          <strong className="text-xs tabular-nums whitespace-nowrap">{maskValue(value)}</strong>
          <div className="w-16 sm:w-20 rounded-t-lg" style={{ height, background: color }} />
          <span className="text-xs text-[var(--capital-muted)] flex items-center gap-1"><Icon size={14} />{label}</span>
        </div>)}
      </div>
      <p className="small-note mt-3">Valores registrados no período e escopo selecionados</p>
    </section>
  )
}
