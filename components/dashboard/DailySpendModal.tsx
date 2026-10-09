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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-sm border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header com Gradiente Executivo */}
        <div className="p-5 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-soft,#f6f0df)] from-blue-500/10 via-emerald-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base md:text-lg text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                Simulador do Teto Diário Seguro
              </h3>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                Planeje quanto gastar por dia mantendo custos fixos pagos e investimentos em dia.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Card de Destaque: Teto Diário Seguro Calculado */}
          <div className="p-5 rounded-2xl bg-[var(--capital-soft,#f6f0df)] from-blue-600 to-indigo-700 text-[var(--capital-text,#242a2e)] shadow-sm shadow-none text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--capital-card,#fff)] rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--capital-accent,#927025)] flex items-center justify-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-[var(--capital-success,#157449)]" />
              Seu Teto de Gasto Seguro Estimado
            </span>
            <div className="font-mono text-3xl md:text-4xl font-semibold tracking-tight tabular-nums my-1">
              R$ {safeDailySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm font-semibold text-[var(--capital-accent,#927025)]"> / dia</span>
            </div>
            <p className="text-xs text-[var(--capital-accent,#927025)] mt-1 max-w-sm mx-auto">
              Gastando até esse limite em variáveis, você garante 100% dos custos fixos pagos e <strong>R$ {investmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> guardados para investir!
            </p>
          </div>

          {/* Controle Interativo: Meta de Aporte (% do Faturamento) */}
          <div className="p-4 rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-[var(--capital-warning,#8b5b15)]" />
                  Meta de Novos Aportes Mensais:
                </span>
                <span className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                  Defina a fatia da sua renda que irá direto para o futuro.
                </span>
              </div>
              <div className="text-right font-mono font-semibold text-sm text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
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
                className="w-full h-2 bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-[var(--capital-muted,#242a2e)] font-bold px-1">
                <span>0% (Sem aporte)</span>
                <span className="text-[var(--capital-success,#157449)] font-semibold">10% (Sugerido)</span>
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
                      ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold shadow-xs'
                      : 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:border-[var(--capital-accent,#927025)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divisão dos Dias (Dias Restantes vs Mês Completo) */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-xs">
            <span className="font-semibold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--capital-accent,#927025)]" />
              Base de Divisão Temporal:
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setCalculationMode('DAYS_LEFT')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  calculationMode === 'DAYS_LEFT'
                    ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)]'
                    : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)]'
                }`}
              >
                Dias Restantes ({daysLeft}d)
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode('FULL_MONTH')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  calculationMode === 'FULL_MONTH'
                    ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)]'
                    : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)]'
                }`}
              >
                Ciclo Total ({daysInMonth}d)
              </button>
            </div>
          </div>

          {/* Demonstração Matemática em Cascata */}
          <div className="space-y-2 p-4 rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] mb-2">
              Composição Contábil do Cálculo
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
              <span className="text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">(+) Faturamento Estimado do Mês</span>
              <span className="font-mono font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
              <span className="text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">(-) Custos Fixos Blindados (Planilha)</span>
              <span className="font-mono font-bold text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]">
                - R$ {fixedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
              <span className="text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">(-) Meta de Novos Aportes ({targetPct}%)</span>
              <span className="font-mono font-bold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]">
                - R$ {investmentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] font-bold">
              <span className="text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">(=) Orçamento Livre para Lazer & Variáveis</span>
              <span className="font-mono text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                R$ {availableVariableBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
              <span>(÷) {activeDays} dias no período</span>
              <span className="font-mono font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-sm">
                = R$ {safeDailySpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / dia
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] shadow-md shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar & Aplicar Meta ({targetPct}%)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
