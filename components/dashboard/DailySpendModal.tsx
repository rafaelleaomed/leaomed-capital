'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  Sparkles, 
  X, 
  ArrowUpRight, 
  Sliders, 
  CheckCircle2, 
  HelpCircle, 
  Calendar, 
  Coins,
  TrendingUp,
  Info
} from 'lucide-react'

interface DailySpendModalProps {
  isOpen: boolean
  onClose: () => void
  totalIncome: number
  fixedExpenses: number
  daysInMonth: number
  daysLeft: number
  currentInvestmentPct?: number
  onSaveInvestmentPct?: (newPct: number) => void
}

export function DailySpendModal({
  isOpen,
  onClose,
  totalIncome,
  fixedExpenses,
  daysInMonth,
  daysLeft,
  currentInvestmentPct = 10,
  onSaveInvestmentPct
}: DailySpendModalProps) {
  const [targetPct, setTargetPct] = useState<number>(currentInvestmentPct)
  const [calculationMode, setCalculationMode] = useState<'DAYS_LEFT' | 'FULL_MONTH'>('DAYS_LEFT')

  useEffect(() => {
    setTargetPct(currentInvestmentPct)
  }, [currentInvestmentPct])

  if (!isOpen) return null

  // Cálculos em tempo real
  const investmentAmount = (totalIncome * targetPct) / 100
  const availableVariableBudget = Math.max(0, totalIncome - fixedExpenses - investmentAmount)
  const activeDays = calculationMode === 'DAYS_LEFT' ? daysLeft : daysInMonth
  const safeDailySpend = activeDays > 0 ? (availableVariableBudget / activeDays) : 0

  const handleApply = () => {
    onSaveInvestmentPct?.(targetPct)
    if (typeof window !== 'undefined') {
      localStorage.setItem('leaomed_invest_target_pct', targetPct.toString())
      window.dispatchEvent(new CustomEvent('leaomed_investment_target_updated', {
        detail: { targetPct }
      }))
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header com Gradiente Executivo */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base md:text-lg text-slate-900 dark:text-white">
                Simulador do Teto Diário Seguro
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planeje quanto gastar por dia mantendo custos fixos pagos e investimentos em dia.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/80 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Card de Destaque: Teto Diário Seguro Calculado */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 flex items-center justify-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Seu Teto de Gasto Seguro Estimado
            </span>
            <div className="font-mono text-3xl md:text-4xl font-black tracking-tight tabular-nums my-1">
              R$ {safeDailySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-semibold text-blue-200"> / dia</span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1 max-w-sm mx-auto">
              Gastando até esse limite em variáveis, você garante 100% dos custos fixos pagos e <strong>R$ {investmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> guardados para investir!
            </p>
          </div>

          {/* Controle Interativo: Meta de Aporte (% do Faturamento) */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  Meta de Novos Aportes Mensais:
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Defina a fatia da sua renda que irá direto para o futuro.
                </span>
              </div>
              <div className="text-right font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                {targetPct}% (R$ {investmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })})
              </div>
            </div>

            {/* Slider de Porcentagem */}
            <div className="space-y-1.5">
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                <span>0% (Sem aporte)</span>
                <span className="text-emerald-600 font-black">10% (Sugerido)</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
              </div>
            </div>

            {/* Presets Rápidos */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { pct: 5, label: '5% (Iniciante)' },
                { pct: 10, label: '10% (Recomendado)' },
                { pct: 15, label: '15% (Acelerado)' },
                { pct: 20, label: '20% (Independência)' }
              ].map(item => (
                <button
                  key={item.pct}
                  type="button"
                  onClick={() => setTargetPct(item.pct)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    targetPct === item.pct
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-500/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divisão dos Dias (Dias Restantes vs Mês Completo) */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/30 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              Base de Divisão Temporal:
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setCalculationMode('DAYS_LEFT')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  calculationMode === 'DAYS_LEFT'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Dias Restantes ({daysLeft}d)
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode('FULL_MONTH')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  calculationMode === 'FULL_MONTH'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ciclo Total ({daysInMonth}d)
              </button>
            </div>
          </div>

          {/* Demonstração Matemática em Cascata */}
          <div className="space-y-2 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/60 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Composição Contábil do Cálculo
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">(+) Faturamento Estimado do Mês</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">(-) Custos Fixos Blindados (Planilha)</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                - R$ {fixedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400">(-) Meta de Novos Aportes ({targetPct}%)</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                - R$ {investmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-white/10 font-bold">
              <span className="text-slate-900 dark:text-white">(=) Orçamento Livre para Lazer & Variáveis</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                R$ {availableVariableBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-slate-500 dark:text-slate-400">
              <span>(÷) {activeDays} dias no período</span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                = R$ {safeDailySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / dia
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar & Aplicar Meta ({targetPct}%)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
