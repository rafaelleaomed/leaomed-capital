'use client'

import React, { useState } from 'react'
import { Wallet, Sparkles, Sliders, TrendingDown } from 'lucide-react'
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
  fixedExpenses = 0.57,
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

        {/* 1. Saldo Projetado — accent */}
        <div className="capital-kpi-card col-span-2 sm:col-span-1">
          <div className="kpi-top">
            <span className="kpi-label">Saldo Projetado</span>
            <div className="kpi-icon">
              <Wallet size={20} aria-hidden="true" />
            </div>
          </div>
          <div className={`kpi-value${isPositive ? '' : ' negative'}`}>
            {maskValue(currentBalance)}
          </div>
          <p className="kpi-caption">
            <span className="truncate">{currentFilter}: PJ Inter + Cartões PF{periodLabel ? ` · ${periodLabel}` : ''}</span>
            <span className={`kpi-trend ${isPositive ? 'up' : 'down'}`}>
              {isPositive ? '▲' : '▼'}
            </span>
          </p>
        </div>

        {/* 2. Para Investir — success */}
        <div
          className="capital-kpi-card kpi-success cursor-pointer"
          onClick={() => setIsModalOpen(true)}
          title="Clique para simular e ajustar a meta de aportes mensais"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setIsModalOpen(true)}
        >
          <div className="kpi-top">
            <span className="kpi-label">Para Investir</span>
            <div className="kpi-icon icon-success">
              <Sparkles size={20} aria-hidden="true" />
            </div>
          </div>
          <div className="kpi-value">
            {maskValue(availableToInvest)}
          </div>
          <p className="kpi-caption">
            <span>Aporte mensal planejado</span>
            <span className="kpi-trend neutral">Meta {investmentTargetPct}%</span>
          </p>
        </div>

        {/* 3. Gasto Diário Seguro — warning */}
        <div
          className="capital-kpi-card kpi-warning cursor-pointer"
          onClick={() => setIsModalOpen(true)}
          title="Clique para abrir o Simulador do Teto Diário Seguro"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && setIsModalOpen(true)}
        >
          <div className="kpi-top">
            <span className="kpi-label">Gasto Diário Seguro</span>
            <div className="kpi-icon icon-warning">
              <Sliders size={20} aria-hidden="true" />
            </div>
          </div>
          <div className="kpi-value">
            {maskValue(safeDailySpend)}
            <span style={{ fontSize: '12px', fontWeight: 500, opacity: .7 }}> / dia</span>
          </div>
          <p className="kpi-caption">
            <span>Cobre fixos + {investmentTargetPct}% aportes</span>
            <span className="kpi-trend neutral">Teto Seguro</span>
          </p>
        </div>

        {/* 4. Despesas do Mês — danger */}
        <div className="capital-kpi-card kpi-danger">
          <div className="kpi-top">
            <span className="kpi-label">Despesas do Mês</span>
            <div className="kpi-icon icon-danger">
              <TrendingDown size={20} aria-hidden="true" />
            </div>
          </div>
          <div className="kpi-value">
            - {maskValue(totalExpenses)}
          </div>
          <p className="kpi-caption">
            <span>Receitas:</span>
            <span style={{ fontWeight: 600, color: 'var(--capital-success)' }}>
              + {maskValue(totalIncome)}
            </span>
          </p>
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
