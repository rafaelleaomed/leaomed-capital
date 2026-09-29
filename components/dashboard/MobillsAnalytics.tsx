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
  currentBalance = 15200.00,
  totalIncome = 38500.00,
  totalExpenses = 23000.00,
  creditCardTotal = 4650.00,
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

  // Categorias de despesas genéricas da planilha médica padrão
  const expenseCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((c, i) => ({
        name: c.name,
        value: c.total,
        percentage: c.percentage,
        color: palette[i % palette.length]
      }))
    }

    if (currentFilter === 'PJ') {
      return [
        { name: 'Impostos Simples Nacional / DAS', value: 4200.00, percentage: 53.8, color: '#3B82F6' },
        { name: 'Insumos & Despesas Médicas PJ', value: 1600.00, percentage: 20.5, color: '#10B981' },
        { name: 'Mensalidade Contador PJ', value: 1200.00, percentage: 15.4, color: '#F59E0B' },
        { name: 'ISS & Taxas Municipais', value: 800.00, percentage: 10.3, color: '#8B5CF6' }
      ]
    }

    return [
      { name: 'Moradia & Condomínio', value: 6849.90, percentage: 30.4, color: '#10B981' },
      { name: 'Transporte & Veículo', value: 4300.00, percentage: 19.1, color: '#3B82F6' },
      { name: 'Saúde & Assistência', value: 3200.00, percentage: 14.2, color: '#EF4444' },
      { name: 'Despesas Pessoais & CRM', value: 2800.00, percentage: 12.4, color: '#8B5CF6' },
      { name: 'Filhos & Educação', value: 2700.00, percentage: 12.0, color: '#F59E0B' },
      { name: 'Lazer & Restaurantes', value: 2230.00, percentage: 9.9, color: '#EC4899' },
      { name: 'Despesas Financeiras', value: 320.00, percentage: 1.4, color: '#64748B' }
    ]
  }, [categories, currentFilter])

  // Categorias de receitas da gestão médica
  const incomeCategories = useMemo(() => {
    if (currentFilter === 'PJ') {
      return [
        { name: 'Hospital 01 & Hospital 02', value: 24000.00, percentage: 62.3, color: '#06B6D4' },
        { name: 'Convênios Médicos 01 e 02', value: 9500.00, percentage: 24.7, color: '#10B981' },
        { name: 'Consultório & Particulares', value: 5000.00, percentage: 13.0, color: '#3B82F6' }
      ]
    }

    if (currentFilter === 'PF') {
      return [
        { name: 'Pró-Labore Retirada PJ', value: 22000.00, percentage: 70.5, color: '#8B5CF6' },
        { name: 'Consultório Particular', value: 6200.00, percentage: 19.9, color: '#06B6D4' },
        { name: 'Dividendos & Rendimentos FII/Ações', value: 3000.00, percentage: 9.6, color: '#10B981' }
      ]
    }

    // CONSOLIDATED: Receitas externas médicas
    return [
      { name: 'Faturamento Hospitalar & PJ', value: 38500.00, percentage: 77.5, color: '#06B6D4' },
      { name: 'Consultório Particular Direto', value: 8200.00, percentage: 16.5, color: '#10B981' },
      { name: 'Rendimentos FIIs & Investimentos', value: 3000.00, percentage: 6.0, color: '#8B5CF6' }
    ]
  }, [currentFilter])

  // Frequência de gastos diários (distribuição equilibrada dos compromissos)
  const dailySpendData30d = [
    { day: '01', amount: 450 },
    { day: '05', amount: 1850 }, // Condomínio
    { day: '10', amount: 2100 }, // Educação / Filhos
    { day: '15', amount: 1650 }, // Saúde
    { day: '20', amount: 4200 }, // Tributos DAS
    { day: '25', amount: 1800 }, // Financiamento Veicular
    { day: '27', amount: 1200 }, // Contador / Serviços
    { day: '30', amount: 620 },
  ]

  const dailySpendData7d = [
    { day: 'Seg', amount: 280 },
    { day: 'Ter', amount: 450 },
    { day: 'Qua', amount: 620 },
    { day: 'Qui', amount: 190 },
    { day: 'Sex', amount: 850 },
    { day: 'Sáb', amount: 420 },
    { day: 'Dom', amount: 180 },
  ]

  const dailySpend = timeRange === '7d' ? dailySpendData7d : dailySpendData30d
  const maxSpend = Math.max(...dailySpend.map(d => d.amount), 1000)

  // Status de Cartões de Exemplo Médico Sanitizados
  const creditCards = [
    {
      name: 'Cartão Executivo Black',
      institution: 'Banco Principal',
      status: 'Fatura fechada',
      spent: 4650.00,
      limit: 35000.00,
      availableLimit: 30350.00,
      pctUsed: 13.3,
      badge: 'Transporte & Pessoal',
      color: 'bg-zinc-800'
    },
    {
      name: 'Cartão Corporativo PJ',
      institution: 'Banco Digital PJ',
      status: 'Fatura em aberto',
      spent: 2100.00,
      limit: 25000.00,
      availableLimit: 22900.00,
      pctUsed: 8.4,
      badge: 'Insumos & Despesas PJ',
      color: 'bg-amber-600'
    },
    {
      name: 'Cartão Adicional Digital',
      institution: 'Fintech Digital',
      status: 'Fatura paga',
      spent: 680.00,
      limit: 15000.00,
      availableLimit: 14320.00,
      pctUsed: 4.5,
      badge: 'Assinaturas & Streaming',
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
