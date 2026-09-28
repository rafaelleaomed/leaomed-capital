'use client'

import React, { useState, useMemo } from 'react'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2,
  PieChart as PieIcon,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

interface CategoryItem {
  name: string
  total: number
  percentage: number
}

interface MobillsAnalyticsProps {
  currentFilter?: 'CONSOLIDATED' | 'PF' | 'PJ'
  currentBalance?: number
  totalIncome?: number
  totalExpenses?: number
  creditCardTotal?: number
  categories?: CategoryItem[]
}

export function MobillsAnalytics({
  currentFilter = 'CONSOLIDATED',
  currentBalance = -2505.64,
  totalIncome = 29479.99,
  totalExpenses = 31985.63,
  creditCardTotal = 8749.96,
  categories = []
}: MobillsAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Paleta de cores para os gráficos
  const palette = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#EC4899', // Rosa
    '#F59E0B', // Âmbar
    '#EF4444', // Vermelho
    '#8B5CF6', // Roxo
    '#06B6D4', // Ciano
    '#F97316', // Laranja
    '#64748B', // Slate
    '#14B8A6'  // Teal
  ]

  // Categorias de despesas reais da planilha do usuário
  const expenseCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c, i) => ({
        name: c.name,
        value: c.total,
        percentage: c.percentage,
        color: palette[i % palette.length]
      }))
    }

    // Baseline da Planilha (Junho/2026)
    if (currentFilter === 'PJ') {
      return [
        { name: 'Tributos Simples Nacional', value: 2764.77, percentage: 84.9, color: '#3B82F6' },
        { name: 'Tarifas Bancárias Inter', value: 491.21, percentage: 15.1, color: '#10B981' }
      ]
    }

    return [
      { name: 'Transporte', value: 13163.55, percentage: 45.8, color: '#3B82F6' },
      { name: 'Casa', value: 5662.62, percentage: 19.7, color: '#10B981' },
      { name: 'Compras', value: 2773.75, percentage: 9.7, color: '#EC4899' },
      { name: 'Financiamento', value: 2302.90, percentage: 8.0, color: '#F59E0B' },
      { name: 'Saúde', value: 1278.01, percentage: 4.4, color: '#EF4444' },
      { name: 'Lazer', value: 803.90, percentage: 2.8, color: '#8B5CF6' },
      { name: 'Alimentação', value: 793.09, percentage: 2.8, color: '#06B6D4' }
    ]
  }, [categories, currentFilter])

  // Categorias de receitas auditadas da planilha (sem duplicação de pró-labore no consolidado)
  const incomeCategories = useMemo(() => {
    if (currentFilter === 'PJ') {
      return [
        { name: 'Honorários Médicos Contratos PJ', value: 26500.00, percentage: 100.0, color: '#06B6D4' }
      ]
    }

    if (currentFilter === 'PF') {
      return [
        { name: 'Pró-Labore Retirada PJ', value: 23000.00, percentage: 88.5, color: '#8B5CF6' },
        { name: 'Reembolsos / Entradas Extras', value: 2979.99, percentage: 11.5, color: '#10B981' }
      ]
    }

    // CONSOLIDATED: Receitas externas que efetivamente entraram no patrimônio
    return [
      { name: 'Faturamento Empresa PJ (Contratos)', value: 26500.00, percentage: 89.9, color: '#06B6D4' },
      { name: 'Entradas Diretas PF (Reembolsos)', value: 2979.99, percentage: 10.1, color: '#10B981' }
    ]
  }, [currentFilter])

  // Frequência de gastos diários (distribuição real dos compromissos no mês de 30 dias)
  const dailySpendData30d = [
    { day: '01', amount: 350 },
    { day: '05', amount: 1451 }, // Condomínio
    { day: '10', amount: 1865 }, // Gramado Parks
    { day: '15', amount: 6837 }, // Parcela T-Cross Cartão
    { day: '20', amount: 1690 }, // Supermercado
    { day: '25', amount: 2764 }, // DAS Simples Nacional
    { day: '27', amount: 3336 }, // Financiamento T-Cross Safra
    { day: '30', amount: 480 },
  ]

  const dailySpendData7d = [
    { day: 'Seg', amount: 120 },
    { day: 'Ter', amount: 3336 }, // Parcela Safra
    { day: 'Qua', amount: 250 },
    { day: 'Qui', amount: 0 },
    { day: 'Sex', amount: 450 },
    { day: 'Sáb', amount: 680 },
    { day: 'Dom', amount: 90 },
  ]

  const dailySpend = timeRange === '7d' ? dailySpendData7d : dailySpendData30d
  const maxSpend = Math.max(...dailySpend.map(d => d.amount), 1000)

  // Status real dos Cartões de Crédito (compromissos de Junho)
  const creditCards = [
    {
      name: 'C6 Carbon Black Mastercard',
      institution: 'C6 Bank',
      status: 'Fatura fechada (Junho)',
      spent: 8749.96,
      limit: 16858.99,
      availableLimit: 8109.03,
      pctUsed: 51.9,
      badge: 'Concentrador T-Cross (12x)',
      color: 'bg-zinc-800'
    },
    {
      name: 'Itaú Personnalité Black',
      institution: 'Banco Itaú',
      status: 'Fatura paga',
      spent: 1450.00,
      limit: 24712.28,
      availableLimit: 23262.28,
      pctUsed: 5.87,
      badge: 'Lava e Seca + Pontuais',
      color: 'bg-amber-500'
    },
    {
      name: 'Nubank Ultravioleta',
      institution: 'Nubank',
      status: 'Fatura paga',
      spent: 509.00,
      limit: 14959.74,
      availableLimit: 14450.74,
      pctUsed: 3.4,
      badge: 'TV TCL + Assinaturas',
      color: 'bg-purple-600'
    }
  ]

  // Renderizador SVG Donut
  const renderDonutSlices = (slices: typeof expenseCategories, total: number) => {
    let accumulatedAngle = 0
    const radius = 64
    const strokeWidth = 24
    const circumference = 2 * Math.PI * radius
    const safeTotal = total > 0 ? total : 1

    return slices.map((slice, i) => {
      const strokeDash = (slice.value / safeTotal) * circumference
      const strokeDashoffset = -accumulatedAngle
      accumulatedAngle += strokeDash

      return (
        <circle
          key={i}
          cx="90"
          cy="90"
          r={radius}
          fill="transparent"
          stroke={slice.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 hover:opacity-80 cursor-pointer"
          onMouseEnter={() => setSelectedCategory(slice.name)}
          onMouseLeave={() => setSelectedCategory(null)}
        />
      )
    })
  }

  const isSurplus = currentBalance >= 0

  return (
    <section id="visao-geral-graficos" className="scroll-mt-24 space-y-6">
      {/* 4 Cards de Topo no Estilo Mobills com Dados Reais da Planilha */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* 1. Saldo / Resultado do Mês */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Resultado do Mês</span>
            <div className={`p-2 rounded-xl ${isSurplus ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className={`font-mono text-xl sm:text-2xl font-black tabular-nums tracking-tight ${isSurplus ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
            {isSurplus ? '+' : ''} R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
            <span>{currentFilter === 'CONSOLIDATED' ? 'Consolidado' : currentFilter === 'PJ' ? 'Inter PJ' : 'Pessoa Física'} • Jun/26</span>
          </div>
        </div>

        {/* 2. Receitas */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Receitas</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            {currentFilter === 'PJ' ? 'Contratos / Faturamento PJ' : currentFilter === 'PF' ? 'Pró-labore + Reembolsos' : 'Faturamento Externo Real'}
          </div>
        </div>

        {/* 3. Despesas */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Despesas</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
            R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            {currentFilter === 'PJ' ? 'Simples Nacional + Tarifas' : 'Gastos Fixos + Cartões'}
          </div>
        </div>

        {/* 4. Cartão de Crédito */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fatura Principal (C6)</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            R$ {creditCardTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Inclui Parcela T-Cross Cartão
          </div>
        </div>
      </div>

      {/* Linha de Gráficos Circulares Donut (Despesas por Categoria e Receitas por Categoria) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Donut 1: Despesas por Categoria */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-rose-500" />
              Despesas por categoria (Planilha Oficial)
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
              {expenseCategories.length} categorias
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                {renderDonutSlices(expenseCategories, totalExpenses)}
              </svg>
              <div className="absolute text-center">
                <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums block">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total
                </span>
              </div>
            </div>

            {/* Legenda das categorias */}
            <div className="flex-1 space-y-2 w-full">
              {expenseCategories.slice(0, 5).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-bold text-slate-900 dark:text-white">R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                    <span className="text-[10px] text-slate-400 w-11 text-right font-sans">({cat.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut 2: Receitas por Categoria */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-500" />
              Origem das Receitas (Sem Duplicidade)
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              Base Auditada
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                {renderDonutSlices(incomeCategories, totalIncome)}
              </svg>
              <div className="absolute text-center">
                <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums block">
                  R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Receita Real
                </span>
              </div>
            </div>

            {/* Legenda das categorias */}
            <div className="flex-1 space-y-3 w-full">
              {incomeCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <div className="font-mono tabular-nums text-right">
                    <div className="font-black text-slate-900 dark:text-white">R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-sans">{cat.percentage.toFixed(1)}% do faturamento</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Linha de Frequência de Gastos + Cartões de Crédito */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 1. Frequência de Gastos */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-indigo-500" />
                Frequência e Picos de Gastos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cronograma de saídas e vencimentos do mês</p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-2.5 py-1 rounded-lg transition-all ${timeRange === '7d' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                7 dias
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1 rounded-lg transition-all ${timeRange === '30d' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                30 dias
              </button>
            </div>
          </div>

          {/* Gráfico de Barras com picos reais de pagamentos */}
          <div className="flex-1 flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-slate-100 dark:border-white/5">
            {dailySpend.map((d, idx) => {
              const heightPct = Math.max(8, Math.min(100, (d.amount / maxSpend) * 100))
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    R$ {d.amount}
                  </span>
                  <div 
                    className="w-full max-w-[28px] bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {d.day}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-3">
            <span>Picos concentrados em: T-Cross Entrada (dia 15) e Financiamento Safra (dia 27)</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Total: R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* 2. Cartões de Crédito */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Cartões de Crédito (Compromissos Reais)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Faturas e limites operacionais</p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Fatura Jun/26
            </span>
          </div>

          <div className="space-y-3.5 flex-1">
            {creditCards.map((card) => (
              <div key={card.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{card.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                    {card.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Fatura: <span className="font-bold text-slate-900 dark:text-white">R$ {card.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Limite: <span className="font-medium text-slate-700 dark:text-slate-300">R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-700"
                    style={{ width: `${card.pctUsed}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
            <span>Disponível para compras e aportes</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Conciliação Ativa</span>
          </div>
        </div>
      </div>
    </section>
  )
}
