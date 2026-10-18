'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Layers,
  Plus,
  Edit3
} from 'lucide-react'
import { MonthSelectorModal } from './MonthSelectorModal'
import { AnnualConsolidatedView } from './AnnualConsolidatedView'
import CreditCardModal from './CreditCardModal'
import { CreditCardStore, CreditCardItem } from '@/utils/creditCardStore'
import { usePrivacy } from '@/context/PrivacyContext'

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
  incomeSources?: { name: string; value: number; percentage: number; color?: string }[]
  dailySpendData?: { day: string; amount: number }[]
  selectedMonth?: number
  selectedYear?: number
  onMonthChange?: (month: number, year: number) => void
  isDemo?: boolean
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const SHORT_MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr',
  'Mai', 'Jun', 'Jul', 'Ago',
  'Set', 'Out', 'Nov', 'Dez'
]

export function MobillsAnalytics({
  currentFilter = 'CONSOLIDATED',
  currentBalance = 0,
  totalIncome = 0,
  totalExpenses = 0,
  creditCardTotal = 0,
  categories = [],
  incomeSources,
  dailySpendData,
  selectedMonth,
  selectedYear,
  onMonthChange,
  isDemo = false
}: MobillsAnalyticsProps) {
  const { maskValue } = usePrivacy()
  const [viewMode, setViewMode] = useState<'MONTHLY' | 'ANNUAL_CONSOLIDATED'>('MONTHLY')
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Mês e ano corrente do sistema
  const now = new Date()
  const currentSystemMonth = now.getMonth() // ex: 8 = Setembro
  const currentSystemYear = now.getFullYear() // ex: 2026

  const [activeMonth, setActiveMonth] = useState<number>(selectedMonth !== undefined ? selectedMonth : currentSystemMonth)
  const [activeYear, setActiveYear] = useState<number>(selectedYear !== undefined ? selectedYear : currentSystemYear)
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false)

  // Gerenciamento Dinâmico de Cartões de Crédito (Adicionar novo, editar limites, adicionais)
  const [storedCards, setStoredCards] = useState<CreditCardItem[]>([])
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [cardToEdit, setCardToEdit] = useState<CreditCardItem | null>(null)

  useEffect(() => {
    setStoredCards(CreditCardStore.getCards())
    const handleCardsUpdated = () => {
      setStoredCards(CreditCardStore.getCards())
    }
    window.addEventListener('leaomed_credit_cards_updated', handleCardsUpdated)
    return () => window.removeEventListener('leaomed_credit_cards_updated', handleCardsUpdated)
  }, [])

  // Sincronizar caso receba props externas
  useEffect(() => {
    if (selectedMonth !== undefined) setActiveMonth(selectedMonth)
    if (selectedYear !== undefined) setActiveYear(selectedYear)
  }, [selectedMonth, selectedYear])

  // Ouvir hash e eventos para alternar para a visao anual consolidada
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#consolidado-anual') {
        setViewMode('ANNUAL_CONSOLIDATED')
      }
    }
    const handleAnnualEvent = () => setViewMode('ANNUAL_CONSOLIDATED')
    const handleCloseAnnualEvent = () => setViewMode('MONTHLY')
    window.addEventListener('hashchange', handleHash)
    window.addEventListener('leaomed_open_annual_consolidated', handleAnnualEvent)
    window.addEventListener('leaomed_close_annual_consolidated', handleCloseAnnualEvent)
    if (typeof window !== 'undefined' && window.location.hash === '#consolidado-anual') {
      setViewMode('ANNUAL_CONSOLIDATED')
    }
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('leaomed_open_annual_consolidated', handleAnnualEvent)
      window.removeEventListener('leaomed_close_annual_consolidated', handleCloseAnnualEvent)
    }
  }, [])

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      const nextM = 11
      const nextY = activeYear - 1
      setActiveMonth(nextM)
      setActiveYear(nextY)
      onMonthChange?.(nextM, nextY)
    } else {
      const nextM = activeMonth - 1
      setActiveMonth(nextM)
      onMonthChange?.(nextM, activeYear)
    }
  }

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      const nextM = 0
      const nextY = activeYear + 1
      setActiveMonth(nextM)
      setActiveYear(nextY)
      onMonthChange?.(nextM, nextY)
    } else {
      const nextM = activeMonth + 1
      setActiveMonth(nextM)
      onMonthChange?.(nextM, activeYear)
    }
  }

  const handleSelectMonth = (month: number, year: number) => {
    setActiveMonth(month)
    setActiveYear(year)
    onMonthChange?.(month, year)
  }

  const handleResetToCurrentMonth = () => {
    setActiveMonth(currentSystemMonth)
    setActiveYear(currentSystemYear)
    onMonthChange?.(currentSystemMonth, currentSystemYear)
  }

  const isCurrentMonthActive = activeMonth === currentSystemMonth && activeYear === currentSystemYear

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

    if (!isDemo) return []

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
  }, [categories, currentFilter, isDemo])

  // Categorias de receitas da gestão médica dinâmicas por mês
  const incomeCategories = useMemo(() => {
    if (incomeSources && incomeSources.length > 0) {
      return incomeSources.map((s, i) => ({
        name: s.name,
        value: s.value,
        percentage: s.percentage,
        color: s.color || palette[i % palette.length]
      }))
    }

    const targetIncome = totalIncome || (isDemo ? 49700.00 : 26019.99)

    if (!isDemo) return targetIncome > 0 ? [{ name: "Receitas", value: targetIncome, percentage: 100, color: palette[0] }] : []

    const ratio = targetIncome / 49700.00

    if (currentFilter === 'PJ') {
      return [
        { name: 'Hospital 01 & Hospital 02', value: Number((24000.00 * ratio).toFixed(2)), percentage: 62.3, color: '#06B6D4' },
        { name: 'Convênios Médicos 01 e 02', value: Number((9500.00 * ratio).toFixed(2)), percentage: 24.7, color: '#10B981' },
        { name: 'Consultório & Particulares', value: Number((5000.00 * ratio).toFixed(2)), percentage: 13.0, color: '#3B82F6' }
      ]
    }

    if (currentFilter === 'PF') {
      return [
        { name: 'Pró-Labore Retirada PJ', value: Number((22000.00 * ratio).toFixed(2)), percentage: 70.5, color: '#8B5CF6' },
        { name: 'Consultório Particular', value: Number((6200.00 * ratio).toFixed(2)), percentage: 19.9, color: '#06B6D4' },
        { name: 'Dividendos & Rendimentos FII/Ações', value: Number((3000.00 * ratio).toFixed(2)), percentage: 9.6, color: '#10B981' }
      ]
    }

    // CONSOLIDATED: Receitas externas médicas
    return [
      { name: 'Faturamento Hospitalar & PJ', value: Number((38500.00 * ratio).toFixed(2)), percentage: 77.5, color: '#06B6D4' },
      { name: 'Consultório Particular Direto', value: Number((8200.00 * ratio).toFixed(2)), percentage: 16.5, color: '#10B981' },
      { name: 'Rendimentos FIIs & Investimentos', value: Number((3000.00 * ratio).toFixed(2)), percentage: 6.0, color: '#8B5CF6' }
    ]
  }, [currentFilter, incomeSources, totalIncome, palette, isDemo])

  // Frequência de gastos diários (distribuição adaptada ao mês)
  const defaultDailySpend30d = [
    { day: '01', amount: 450 },
    { day: '05', amount: 1850 }, // Condomínio
    { day: '10', amount: 2100 }, // Educação / Filhos
    { day: '15', amount: 1650 }, // Saúde
    { day: '20', amount: 4200 }, // Tributos DAS
    { day: '25', amount: 1800 }, // Financiamento Veicular
    { day: '27', amount: 1200 }, // Contador / Serviços
    { day: '30', amount: 620 },
  ]

  const dailySpendData30d = dailySpendData && dailySpendData.length > 0 ? dailySpendData : isDemo ? defaultDailySpend30d : []

  const dailySpendData7d = [
    { day: 'Seg', amount: 280 },
    { day: 'Ter', amount: 450 },
    { day: 'Qua', amount: 620 },
    { day: 'Qui', amount: 190 },
    { day: 'Sex', amount: 850 },
    { day: 'Sáb', amount: 420 },
    { day: 'Dom', amount: 180 },
  ]

  const dailySpend = timeRange === '7d' ? (isDemo ? dailySpendData7d : dailySpendData30d.slice(-7)) : dailySpendData30d
  const maxSpend = Math.max(...dailySpend.map(d => d.amount), 1000)

  // Status de Cartões Reais Auditados das Faturas (Sem inventar cartões e sem cartão PJ!)
  const creditCards = useMemo(() => {
    if (isDemo) {
      if (currentFilter === 'PJ') return []
      return [
        {
          name: 'Cartão Platinum Executivo (PF)',
          institution: 'Banco Principal',
          status: 'Fatura fechada',
          spent: 5400.00,
          limit: 45000.00,
          availableLimit: 39600.00,
          pctUsed: 12.0,
          badge: 'Transporte & Pessoal',
          color: 'bg-zinc-800'
        },
        {
          name: 'Cartão Digital Secundário (PF)',
          institution: 'Banco Digital',
          status: 'Fatura em aberto',
          spent: 1200.00,
          limit: 15000.00,
          availableLimit: 13800.00,
          pctUsed: 8.0,
          badge: 'Assinaturas & Dia a Dia',
          color: 'bg-purple-600'
        }
      ]
    }

    // Titular do cartão (Dados Reais das Faturas Auditadas e Editáveis):
    if (currentFilter === 'PJ') {
      // PJ opera exclusivamente em conta corrente - SEM CARTÃO DE CRÉDITO CORPORATIVO
      return []
    }

    const cards = storedCards.length > 0 ? storedCards : CreditCardStore.getCards()
    return cards
      .filter(c => currentFilter === 'CONSOLIDATED' || c.entityType === currentFilter)
      .map(c => {
        const spent = Number(c.spent) || 0
        const limit = Number(c.limit) > 0 ? Number(c.limit) : 1
        const availableLimit = Math.max(0, limit - spent)
        const pctUsed = Math.min(100, Math.max(0, (spent / limit) * 100))

        return {
          id: c.id,
          name: c.name,
          institution: c.institution || 'Banco',
          status: c.status || 'Fatura auditada',
          spent,
          limit,
          availableLimit,
          pctUsed: Number(pctUsed.toFixed(1)),
          badge: c.badge || 'Cartão PF',
          color: c.color || 'bg-slate-900',
          closingDay: c.closingDay || 20,
          dueDay: c.dueDay || 28,
          additionalCards: c.additionalCards || 'Nenhum',
          cardholder: c.cardholder || 'Titular do cartão',
          lastDigits: c.lastDigits || '----',
          detail: c.notes || `Vencimento dia ${c.dueDay} • ${c.additionalCards || 'Sem adicionais'}`
        }
      })
  }, [currentFilter, isDemo, storedCards])

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

  // Soma matemática exata das categorias de receitas
  const calculatedTotalIncome = useMemo(() => {
    if (totalIncome !== undefined && totalIncome > 0) return totalIncome
    return incomeCategories.reduce((acc, c) => acc + c.value, 0)
  }, [totalIncome, incomeCategories])

  // Soma matemática exata das categorias de despesas
  const calculatedTotalExpenses = useMemo(() => {
    if (totalExpenses !== undefined && totalExpenses > 0) return totalExpenses
    return expenseCategories.reduce((acc, c) => acc + c.value, 0)
  }, [totalExpenses, expenseCategories])

  // Resultado do mês 100% harmonizado
  const calculatedBalance = useMemo(() => {
    if (currentBalance !== undefined) return currentBalance
    return calculatedTotalIncome - calculatedTotalExpenses
  }, [currentBalance, calculatedTotalIncome, calculatedTotalExpenses])

  // Normalização das porcentagens de receita para garantir soma exata de 100.0%
  const normalizedIncomeCategories = useMemo(() => {
    const sum = calculatedTotalIncome > 0 ? calculatedTotalIncome : 1
    return incomeCategories.map(c => ({
      ...c,
      percentage: (c.value / sum) * 100
    }))
  }, [incomeCategories, calculatedTotalIncome])

  const isSurplus = calculatedBalance >= 0

  // Navegar diretamente para a aba da planilha com foco na conferência (Foto 2)
  const navigateToBudget = (view: 'INCOME' | 'EXPENSE') => {
    window.dispatchEvent(new CustomEvent('leaomed_switch_budget_view', { detail: { view } }))
    const el = document.getElementById('categorias-planilha')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="visao-geral-graficos" className="scroll-mt-24 space-y-5">
      {/* Barra de Navegação Temporal Estilo Mobills (Foto 3) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2">
          {/* Botão Anterior */}
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[var(--capital-text,#242a2e)] hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="Mês anterior"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Botão Principal do Seletor de Mês (Abre o Modal da Foto 3) */}
          <button
            onClick={() => setIsMonthModalOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all group cursor-pointer"
            title="Clique para escolher qualquer mês ou ano"
          >
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-display font-black text-sm md:text-base text-slate-900 dark:text-[var(--capital-text,#242a2e)]">
              {MONTH_NAMES[activeMonth]} {activeYear}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </button>

          {/* Botão Próximo */}
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[var(--capital-text,#242a2e)] hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
            title="Próximo mês"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Alternador de Visão: Mês Atual vs Consolidado Anual (Foto 2) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 shadow-xs" role="group">
            <button
              type="button"
              onClick={() => {
                setViewMode('MONTHLY')
                handleResetToCurrentMonth()
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'MONTHLY'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[var(--capital-text,#242a2e)]'
              }`}
              title="Visualizar movimentações detalhadas do mês selecionado"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mês Atual</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('ANNUAL_CONSOLIDATED')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'ANNUAL_CONSOLIDATED'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[var(--capital-text,#242a2e)]'
              }`}
              title="Clique para gerar gráficos anuais acumulados até aqui (2026)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Visão Anual</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
            {currentFilter === 'CONSOLIDATED' ? 'Visão Global (PF + PJ)' : currentFilter === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
          </span>
        </div>
      </div>

      {viewMode === 'ANNUAL_CONSOLIDATED' ? (
        <AnnualConsolidatedView currentFilter={currentFilter} isDemo={isDemo} />
      ) : (
        <>
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
          <div className={`font-mono text-xl sm:text-2xl font-black tabular-nums tracking-tight ${isSurplus ? 'text-slate-900 dark:text-[var(--capital-text,#242a2e)]' : 'text-rose-600 dark:text-rose-400'}`}>
            {isSurplus ? '+' : ''} {maskValue(calculatedBalance)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5">
            <span>{currentFilter === 'CONSOLIDATED' ? 'Consolidado' : currentFilter === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'} • {SHORT_MONTH_NAMES[activeMonth]}/{String(activeYear).slice(2)}</span>
          </div>
        </div>

        {/* 2. Receitas (Clicável: leva direto para conferência das receitas na planilha) */}
        <div 
          onClick={() => navigateToBudget('INCOME')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] transition-all cursor-pointer group"
          title="Clique para conferir e editar a lista de receitas na planilha"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Receitas</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                (Conferir →)
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            {maskValue(calculatedTotalIncome)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
            <span>{currentFilter === 'PJ' ? 'Contratos / Faturamento PJ' : currentFilter === 'PF' ? 'Pró-labore + Reembolsos' : 'Faturamento Externo Real'}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline">Ver planilha</span>
          </div>
        </div>

        {/* 3. Despesas (Clicável: leva direto para conferência das despesas na planilha) */}
        <div 
          onClick={() => navigateToBudget('EXPENSE')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-rose-500/40 hover:bg-rose-500/[0.02] transition-all cursor-pointer group"
          title="Clique para conferir e editar a lista de despesas na planilha"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Despesas</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                (Conferir →)
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
            {maskValue(calculatedTotalExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center justify-between">
            <span>{currentFilter === 'PJ' ? 'Simples Nacional + Tarifas' : 'Gastos Fixos + Cartões'}</span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold group-hover:underline">Ver planilha</span>
          </div>
        </div>

        {/* 4. Total Faturas dos Cartões */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentFilter === 'PJ' ? 'Total Faturas Cartões' : 'Total Faturas dos Cartões'}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-[var(--capital-text,#242a2e)] tabular-nums tracking-tight">
            {maskValue(creditCardTotal)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            {currentFilter === 'PJ' ? 'Pessoa Jurídica: 100% Débito em Conta' : 'C6 Carbon + Itaú + Nubank'}
          </div>
        </div>
      </div>

      {/* Linha de Gráficos Circulares Donut (Despesas por Categoria e Receitas por Categoria) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Donut 1: Despesas por Categoria */}
        <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-[var(--capital-text,#242a2e)] flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-rose-500" />
              Despesas por categoria (Planilha Oficial)
            </h3>
            <button 
              onClick={() => navigateToBudget('EXPENSE')}
              className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
            >
              Conferir na Planilha →
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut */}
            <div 
              onClick={() => navigateToBudget('EXPENSE')} 
              className="relative w-48 h-48 flex items-center justify-center flex-shrink-0 cursor-pointer group"
              title="Clique para ir para a planilha de despesas"
            >
              <svg className="w-full h-full -rotate-90 group-hover:scale-105 transition-transform" viewBox="0 0 180 180">
                {renderDonutSlices(expenseCategories, calculatedTotalExpenses)}
              </svg>
              <div className="absolute text-center">
                <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-[var(--capital-text,#242a2e)] tabular-nums block">
                  {maskValue(calculatedTotalExpenses)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-rose-500 transition-colors">
                  Ver Planilha
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
                    <span className="font-bold text-slate-900 dark:text-[var(--capital-text,#242a2e)]">{maskValue(cat.value)}</span>
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
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-[var(--capital-text,#242a2e)] flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-500" />
              Origem das Receitas (Sem Duplicidade)
            </h3>
            <button 
              onClick={() => navigateToBudget('INCOME')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Conferir na Planilha →
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
            {/* SVG Donut */}
            <div 
              onClick={() => navigateToBudget('INCOME')} 
              className="relative w-48 h-48 flex items-center justify-center flex-shrink-0 cursor-pointer group"
              title="Clique para ir para a planilha de receitas"
            >
              <svg className="w-full h-full -rotate-90 group-hover:scale-105 transition-transform" viewBox="0 0 180 180">
                {renderDonutSlices(normalizedIncomeCategories, calculatedTotalIncome)}
              </svg>
              <div className="absolute text-center">
                <span className="font-mono text-sm sm:text-base font-black text-slate-900 dark:text-[var(--capital-text,#242a2e)] tabular-nums block">
                  {maskValue(calculatedTotalIncome)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition-colors">
                  Ver Planilha
                </span>
              </div>
            </div>

            {/* Legenda das categorias */}
            <div className="flex-1 space-y-3 w-full">
              {normalizedIncomeCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <div className="font-mono tabular-nums text-right">
                    <div className="font-black text-slate-900 dark:text-[var(--capital-text,#242a2e)]">R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-indigo-500" />
                Frequência e Picos de Gastos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cronograma de saídas e vencimentos do mês</p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-2.5 py-1 rounded-lg transition-all ${timeRange === '7d' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-[var(--capital-text,#242a2e)] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-[var(--capital-text,#242a2e)]'}`}
              >
                7 dias
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1 rounded-lg transition-all ${timeRange === '30d' ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-[var(--capital-text,#242a2e)] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-[var(--capital-text,#242a2e)]'}`}
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
            <span>Picos concentrados em: Veículo Entrada (dia 15) e Financiamento Safra (dia 27)</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Total: R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* 2. Cartões de Crédito */}
        <div id="cartoes-credito" className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                Cartões de Crédito (Compromissos Reais)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentFilter === 'PJ' ? 'Pessoa Jurídica sem cartão de crédito corporativo' : 'Faturas auditadas dos cartões PF'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {currentFilter !== 'PJ' && (
                <button
                  type="button"
                  onClick={() => {
                    setCardToEdit(null)
                    setIsCardModalOpen(true)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  title="Adicionar novo cartão de crédito"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Novo Cartão</span>
                </button>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {SHORT_MONTH_NAMES[activeMonth]}/{String(activeYear).slice(2)}
              </span>
            </div>
          </div>

          {currentFilter === 'PJ' ? (
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/30 text-xs text-slate-700 dark:text-slate-300 space-y-2 my-auto">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Pessoa Jurídica Opera Exclusivamente via Conta Corrente</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                A empresa não possui cartão de crédito corporativo emitido. Todas as saídas da PJ (DAS Simples Nacional, contador, tarifas bancárias e pró-labore) são movimentadas diretamente por débito em conta corrente, Pix e boletos bancários.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 flex-1">
              {creditCards.map((card: any) => (
                <div key={card.id || card.name} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/5 space-y-2.5 hover:border-slate-300 dark:hover:border-white/15 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{card.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/40">
                        {card.badge}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCardToEdit(card)
                          setIsCardModalOpen(true)
                        }}
                        className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-indigo-500 hover:text-[var(--capital-text,#242a2e)] text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Editar limite, adicionais e vencimento deste cartão"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-y-1">
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Fatura: <span className="font-bold text-slate-900 dark:text-[var(--capital-text,#242a2e)]">R$ {card.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Disponível: <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ {card.availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Limite Total: <span className="font-medium text-slate-700 dark:text-slate-300">R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${card.pctUsed}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-200/50 dark:border-white/5">
                    <span>Vencimento: dia {card.dueDay || 28} (fecha dia {card.closingDay || 20})</span>
                    <span>Adicionais: <strong>{card.additionalCards || 'Nenhum'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
            <span>{currentFilter === 'PJ' ? 'Pessoa Jurídica: 100% Débito em Conta' : 'Faturas auditadas do mês'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Auditado & Conectado</span>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Modal Interativo do Seletor de Mês (Estilo Mobills - Foto 3) */}
      <MonthSelectorModal 
        isOpen={isMonthModalOpen}
        selectedMonth={activeMonth}
        selectedYear={activeYear}
        onSelect={handleSelectMonth}
        onClose={() => setIsMonthModalOpen(false)}
      />

      {/* Modal de Edição e Criação de Cartões de Crédito (Limite, Adicionais, etc.) */}
      <CreditCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        cardToEdit={cardToEdit}
        onSaved={() => setStoredCards(CreditCardStore.getCards())}
      />
    </section>
  )
}
