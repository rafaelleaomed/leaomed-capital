'use client'

import React, { useState } from 'react'
import { History } from 'lucide-react'

export interface MonthRecord {
  month: string
  pjGross: number
  pjTaxes: number
  pjProlabore: number
  pfIncome: number
  pfExpenses: number
  balance: number
}

export function HistoricalOverview({ isDemo = false }: { isDemo?: boolean }) {
  const [selectedView, setSelectedView] = useState<'ALL' | 'PJ' | 'PF'>('ALL')

  // Histórico demonstrativo genérico para visualização técnica e portfólio
  const demoHistory: MonthRecord[] = [
    { month: 'Dez/25', pjGross: 32000.00, pjTaxes: 2150.00, pjProlabore: 18000.00, pfIncome: 22000.00, pfExpenses: 15400.00, balance: 6600.00 },
    { month: 'Jan/26', pjGross: 35000.00, pjTaxes: 2450.00, pjProlabore: 20000.00, pfIncome: 24500.00, pfExpenses: 16800.00, balance: 7700.00 },
    { month: 'Fev/26', pjGross: 38000.00, pjTaxes: 2650.00, pjProlabore: 22000.00, pfIncome: 27000.00, pfExpenses: 17900.00, balance: 9100.00 },
    { month: 'Mar/26', pjGross: 34000.00, pjTaxes: 2380.00, pjProlabore: 19500.00, pfIncome: 23800.00, pfExpenses: 16200.00, balance: 7600.00 },
    { month: 'Abr/26', pjGross: 37500.00, pjTaxes: 2620.00, pjProlabore: 21500.00, pfIncome: 26500.00, pfExpenses: 18400.00, balance: 8100.00 },
    { month: 'Mai/26', pjGross: 36000.00, pjTaxes: 2520.00, pjProlabore: 21000.00, pfIncome: 25800.00, pfExpenses: 18100.00, balance: 7700.00 },
    { month: 'Jun/26', pjGross: 38500.00, pjTaxes: 2700.00, pjProlabore: 22000.00, pfIncome: 27400.00, pfExpenses: 18900.00, balance: 8500.00 },
    { month: 'Jul/26', pjGross: 40000.00, pjTaxes: 2800.00, pjProlabore: 23000.00, pfIncome: 28500.00, pfExpenses: 19200.00, balance: 9300.00 }
  ]

  const [history, setHistory] = useState<MonthRecord[]>(demoHistory)

  React.useEffect(() => {
    if (isDemo) return
    let isMounted = true
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (data.success && Array.isArray(data.history) && data.history.length > 0) {
          const mapped: MonthRecord[] = data.history.map((row: any) => ({
            month: row.month_year,
            pjGross: parseFloat(row.pj_gross_revenue) || 0,
            pjTaxes: parseFloat(row.pj_taxes) || 0,
            pjProlabore: parseFloat(row.pj_prolabore_withdrawn) || 0,
            pfIncome: parseFloat(row.pf_total_income) || 0,
            pfExpenses: parseFloat(row.pf_total_expenses) || 0,
            balance: parseFloat(row.pf_net_savings) || 0
          }))
          setHistory(mapped)
        }
      })
      .catch(() => {})
    return () => { isMounted = false }
  }, [isDemo])

  return (
    <div id="historico" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-4 w-4 text-blue-500" />
            Série Temporal Financeira (Dezembro/25 a Julho/26)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evolução histórica de receitas brutas, impostos, pró-labore e fluxo líquido PF/PJ.
          </p>
        </div>
        <div className="flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/70 p-1 text-xs font-semibold">
          <button 
            onClick={() => setSelectedView('ALL')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedView === 'ALL' ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Consolidado
          </button>
          <button 
            onClick={() => setSelectedView('PJ')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedView === 'PJ' ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Inter PJ
          </button>
          <button 
            onClick={() => setSelectedView('PF')} 
            className={`px-3 py-1.5 rounded-lg transition-all ${selectedView === 'PF' ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Pessoa Física
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-white/5">
            <tr>
              <th className="py-3 px-3.5">Mês</th>
              {(selectedView === 'ALL' || selectedView === 'PJ') && (
                <>
                  <th className="py-3 px-3.5 text-right">Faturamento PJ</th>
                  <th className="py-3 px-3.5 text-right">Tributos PJ</th>
                  <th className="py-3 px-3.5 text-right">Pró-labore</th>
                </>
              )}
              {(selectedView === 'ALL' || selectedView === 'PF') && (
                <>
                  <th className="py-3 px-3.5 text-right">Renda PF</th>
                  <th className="py-3 px-3.5 text-right">Despesas PF (Cartões)</th>
                  <th className="py-3 px-3.5 text-right">Resultado</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {history.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">{row.month}</td>
                {(selectedView === 'ALL' || selectedView === 'PJ') && (
                  <>
                    <td className="py-3 px-3.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold font-mono tabular-nums">
                      R$ {row.pjGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3.5 text-right text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                      - R$ {row.pjTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3.5 text-right font-medium text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                      R$ {row.pjProlabore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </>
                )}
                {(selectedView === 'ALL' || selectedView === 'PF') && (
                  <>
                    <td className="py-3 px-3.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold font-mono tabular-nums">
                      R$ {row.pfIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3.5 text-right text-rose-600 dark:text-rose-400 font-semibold font-mono tabular-nums">
                      - R$ {row.pfExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-black font-mono tabular-nums ${row.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {row.balance >= 0 ? '+' : ''} R$ {row.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
