'use client'

import React, { useState } from 'react'
import { Wallet, Sparkles, ArrowUpRight, TrendingDown, ArrowDownRight, Landmark, Sliders } from 'lucide-react'
import { DailySpendModal } from './DailySpendModal'
import { usePrivacy } from '@/context/PrivacyContext'

interface SummaryCardsProps {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  safeDailySpend: number;
  availableToInvest: number;
  currentFilter: string;
  periodLabel?: string;
  fixedExpenses?: number;
  daysInMonth?: number;
  daysLeft?: number;
  investmentTargetPct?: number;
  onInvestmentPctChange?: (pct: number) => void;
}

export function SummaryCards({
  currentBalance,
  totalIncome,
  totalExpenses,
  safeDailySpend,
  availableToInvest,
  currentFilter,
  periodLabel,
  fixedExpenses = 25528.57,
  daysInMonth = 30,
  daysLeft = 30,
  investmentTargetPct = 10,
  onInvestmentPctChange
}: SummaryCardsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { maskValue } = usePrivacy()
  const isPositive = currentBalance >= 0

  return (
    <section id="resumo-executivo" className="scroll-mt-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. Saldo Projetado / Caixa Atual */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-3.5 md:p-5 backdrop-blur-xl shadow-xs dark:shadow-lg transition-all hover:border-slate-300 dark:hover:border-white/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 md:mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Saldo Projetado
            </span>
            <div className="p-1.5 md:p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
              <Wallet className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className={`font-mono text-xl sm:text-2xl lg:text-3xl font-black tracking-tight tabular-nums ${
            isPositive ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {maskValue(currentBalance)}
          </div>
          <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 mt-1 md:mt-2 flex items-center gap-1 truncate">
            <span className={`h-1.5 w-1.5 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{currentFilter}: PJ Inter + Cartões PF {periodLabel ? `• ${periodLabel}` : ''}</span>
          </p>
        </div>

        {/* 2. Para Investir (Meta de Aporte Mensal) */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-emerald-950/60 dark:via-slate-900/80 dark:to-slate-950 p-3.5 md:p-5 backdrop-blur-xl shadow-xs dark:shadow-xl dark:shadow-emerald-950/20 transition-all hover:border-emerald-500/60 cursor-pointer group"
          title="Clique para simular e ajustar a meta de aportes mensais"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1.5 md:mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
              Para Investir
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-black">
                Meta {investmentTargetPct}%
              </span>
              <Sliders className="w-3 h-3 text-emerald-500/70 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
            {maskValue(availableToInvest)}
          </div>
          <p className="text-[10px] md:text-[11px] text-emerald-700/80 dark:text-emerald-200/70 mt-1 md:mt-2 truncate flex items-center justify-between">
            <span>Aporte mensal planejado</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">Simular →</span>
          </p>
        </div>

        {/* 3. Gasto Diário Seguro */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-blue-950/40 dark:via-slate-900/70 dark:to-slate-950 p-3.5 md:p-5 backdrop-blur-xl shadow-xs dark:shadow-lg transition-all hover:border-blue-500/60 cursor-pointer group"
          title="Clique para abrir o Simulador do Teto Diário Seguro"
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1.5 md:mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
              Gasto Diário Seguro
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] bg-blue-500/10 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full font-bold">
                Teto Seguro
              </span>
              <Sliders className="w-3 h-3 text-blue-500/70 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight tabular-nums">
            {maskValue(safeDailySpend)}
            <span className="text-xs font-bold text-blue-500/80"> / dia</span>
          </div>
          <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 mt-1 md:mt-2 truncate flex items-center justify-between">
            <span>Cobre fixos + {investmentTargetPct}% aportes</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">Ajustar →</span>
          </p>
        </div>

        {/* 4. Total Despesas vs Receitas */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-3.5 md:p-5 backdrop-blur-xl shadow-xs dark:shadow-lg transition-all hover:border-slate-300 dark:hover:border-white/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 md:mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">
              Despesas do Mês
            </span>
            <div className="p-1.5 md:p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight tabular-nums">
            - {maskValue(totalExpenses)}
          </div>
          <div className="flex items-center justify-between text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 mt-1 md:mt-2 pt-1.5 border-t border-slate-100 dark:border-white/5 truncate">
            <span className="truncate">Receitas:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono tabular-nums">
              + {maskValue(totalIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Interativo do Simulador de Teto Diário Seguro e Meta de Aporte */}
      <DailySpendModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        totalIncome={totalIncome}
        fixedExpenses={fixedExpenses}
        daysInMonth={daysInMonth}
        daysLeft={daysLeft}
        currentInvestmentPct={investmentTargetPct}
        onSaveInvestmentPct={onInvestmentPctChange}
      />
    </section>
  )
}
