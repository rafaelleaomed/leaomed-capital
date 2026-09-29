'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Car, 
  Home, 
  HeartPulse, 
  CreditCard, 
  UtensilsCrossed, 
  Dog, 
  Receipt, 
  ShoppingBag, 
  Film, 
  Plane, 
  Coffee, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Database
} from 'lucide-react'

interface SubcategoryItem {
  name: string
  value: number
  is_fixed?: boolean
}

interface CategoryGroup {
  name: string
  icon: any
  total: number
  color: string
  is_obligatory: boolean
  subcategories: SubcategoryItem[]
}

interface BudgetBreakdownProps {
  currentFilter?: string
  isDemo?: boolean
}

export function BudgetBreakdown({ currentFilter = 'PF', isDemo = false }: BudgetBreakdownProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'OBRIGATORIAS' | 'NAO_OBRIGATORIAS'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesData, setCategoriesData] = useState<CategoryGroup[]>([])

  // Estado dos acordeões (categorias médicas principais abertas inicialmente)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Moradia': true,
    'Transporte': true,
    'Saúde': true,
    'Empresa Médica PJ': true,
    'Despesas Pessoais': false,
    'Filhos': false,
    'Lazer': false,
    'Despesas Financeiras & Cartões': false
  })

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    categoriesData.forEach(c => { allExpanded[c.name] = true })
    setExpandedCategories(allExpanded)
  }

  const collapseAll = () => {
    setExpandedCategories({})
  }

  // Mapeamento de Ícones e Estilos
  const getCategoryMeta = (name: string): { icon: any; color: string; is_obligatory: boolean } => {
    switch (name) {
      case 'Transporte':
        return { icon: Car, color: 'from-blue-500 to-indigo-600', is_obligatory: true }
      case 'Casa':
      case 'Moradia':
        return { icon: Home, color: 'from-emerald-500 to-teal-600', is_obligatory: true }
      case 'Financiamento':
        return { icon: CreditCard, color: 'from-amber-500 to-orange-600', is_obligatory: true }
      case 'Saúde':
        return { icon: HeartPulse, color: 'from-rose-500 to-pink-600', is_obligatory: true }
      case 'Alimentação':
        return { icon: UtensilsCrossed, color: 'from-yellow-500 to-amber-600', is_obligatory: true }
      case 'Pets':
        return { icon: Dog, color: 'from-cyan-500 to-blue-500', is_obligatory: true }
      case 'Impostos e Taxas PF':
      case 'Despesas Pessoais':
        return { icon: Receipt, color: 'from-slate-500 to-zinc-600', is_obligatory: true }
      case 'Compras':
        return { icon: ShoppingBag, color: 'from-purple-500 to-violet-600', is_obligatory: false }
      case 'Lazer':
        return { icon: Film, color: 'from-pink-500 to-rose-600', is_obligatory: false }
      case 'Viagem':
        return { icon: Plane, color: 'from-sky-500 to-indigo-500', is_obligatory: false }
      case 'Restaurantes & Delivery':
        return { icon: Coffee, color: 'from-orange-500 to-amber-500', is_obligatory: false }
      case 'Serviços de Assinaturas':
      case 'Filhos':
        return { icon: Sparkles, color: 'from-indigo-500 to-blue-600', is_obligatory: true }
      case 'Empresa Médica PJ':
      case 'Empresa - Despesas Fixas':
        return { icon: Layers, color: 'from-cyan-500 to-blue-600', is_obligatory: true }
      default:
        return { icon: Layers, color: 'from-emerald-500 to-cyan-600', is_obligatory: true }
    }
  }

  // Planilha Médica Genérica Padrão (Isolada de dados pessoais para Demonstração e Novos Usuários)
  const genericMedicalCategories: CategoryGroup[] = useMemo(() => {
    if (currentFilter === 'PJ') {
      return [
        {
          name: 'Empresa Médica PJ',
          icon: Layers,
          total: 7800.00,
          color: 'from-cyan-500 to-blue-600',
          is_obligatory: true,
          subcategories: [
            { name: 'Impostos Simples Nacional / DAS', value: 4200.00, is_fixed: true },
            { name: 'Insumos & Despesas Médicas PJ', value: 1600.00, is_fixed: false },
            { name: 'Mensalidade Contador PJ', value: 1200.00, is_fixed: true },
            { name: 'ISS & Taxas Municipais', value: 800.00, is_fixed: true }
          ]
        }
      ]
    }

    return [
      {
        name: 'Moradia',
        icon: Home,
        total: 6849.90,
        color: 'from-emerald-500 to-teal-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Supermercado & Feira', value: 2400.00, is_fixed: false },
          { name: 'Condomínio Residencial', value: 1850.00, is_fixed: true },
          { name: 'Empregados / Diarista', value: 1100.00, is_fixed: true },
          { name: 'Conta de Energia (Luz)', value: 420.00, is_fixed: true },
          { name: 'IPTU', value: 380.00, is_fixed: true },
          { name: 'Itens para Casa & Manutenção', value: 250.00, is_fixed: false },
          { name: 'Telefonia Celular', value: 180.00, is_fixed: true },
          { name: 'Internet Banda Larga Fibra', value: 149.90, is_fixed: true },
          { name: 'TV por Assinatura / Streaming', value: 120.00, is_fixed: true }
        ]
      },
      {
        name: 'Transporte',
        icon: Car,
        total: 4300.00,
        color: 'from-blue-500 to-indigo-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Financiamento Veicular Modelo', value: 1800.00, is_fixed: true },
          { name: 'Combustível', value: 950.00, is_fixed: false },
          { name: 'IPVA + Seguro Obrigatório', value: 450.00, is_fixed: true },
          { name: 'Seguro Auto', value: 420.00, is_fixed: true },
          { name: 'Manutenção Veículo / Revisão', value: 380.00, is_fixed: false },
          { name: 'Estacionamentos & Valet', value: 180.00, is_fixed: false },
          { name: 'Pedágios (Sem Parar)', value: 120.00, is_fixed: true }
        ]
      },
      {
        name: 'Saúde',
        icon: HeartPulse,
        total: 3200.00,
        color: 'from-rose-500 to-pink-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Plano de Saúde Familiar', value: 1650.00, is_fixed: true },
          { name: 'Seguro Saúde & Vida', value: 580.00, is_fixed: true },
          { name: 'Médicos / Terapeutas / Consultas', value: 400.00, is_fixed: false },
          { name: 'Farmácia & Medicamentos', value: 350.00, is_fixed: false },
          { name: 'Dentista / Prevenção', value: 220.00, is_fixed: false }
        ]
      },
      {
        name: 'Despesas Pessoais',
        icon: Receipt,
        total: 2800.00,
        color: 'from-purple-500 to-violet-600',
        is_obligatory: false,
        subcategories: [
          { name: 'Congressos & Simpósios Médicos', value: 850.00, is_fixed: false },
          { name: 'Cursos & Atualização Científica', value: 600.00, is_fixed: false },
          { name: 'Vestuário & Jalecos', value: 420.00, is_fixed: false },
          { name: 'Anuidade CRM / Sociedades Médicas', value: 380.00, is_fixed: true },
          { name: 'Academia & Condicionamento', value: 350.00, is_fixed: true },
          { name: 'Cuidados Pessoais / Barbearia', value: 200.00, is_fixed: false }
        ]
      },
      {
        name: 'Filhos',
        icon: Sparkles,
        total: 2700.00,
        color: 'from-amber-500 to-orange-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Escola / Mensalidade Escolar', value: 1800.00, is_fixed: true },
          { name: 'Alimentação & Lanches', value: 400.00, is_fixed: false },
          { name: 'Mesada', value: 250.00, is_fixed: true },
          { name: 'Atividades Extras & Material', value: 250.00, is_fixed: false }
        ]
      },
      {
        name: 'Lazer',
        icon: Film,
        total: 2230.00,
        color: 'from-pink-500 to-rose-600',
        is_obligatory: false,
        subcategories: [
          { name: 'Restaurantes & Gastronomia', value: 950.00, is_fixed: false },
          { name: 'Viagens & Gastos de Férias', value: 800.00, is_fixed: false },
          { name: 'Comida Delivery (iFood)', value: 320.00, is_fixed: false },
          { name: 'Passeios & Cinema', value: 160.00, is_fixed: false }
        ]
      },
      {
        name: 'Despesas Financeiras & Cartões',
        icon: CreditCard,
        total: 320.00,
        color: 'from-slate-500 to-zinc-600',
        is_obligatory: false,
        subcategories: [
          { name: 'Anuidade / Seguros Cartão', value: 142.00, is_fixed: true },
          { name: 'Tarifas Bancárias', value: 89.00, is_fixed: true },
          { name: 'Taxas Tesouro Direto / Custódia', value: 89.00, is_fixed: false }
        ]
      }
    ]
  }, [currentFilter])

  // Carrega dados da rota /api/budget ou fallback genérico protegido
  useEffect(() => {
    // Escuta atualizações do Wizard em tempo real
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('leaomed_user_custom_setup')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.categories?.length > 0) {
            const mapped: CategoryGroup[] = parsed.categories
              .filter((c: any) => currentFilter === 'CONSOLIDATED' || c.scope === currentFilter || c.scope === 'AMBOS')
              .map((c: any) => {
                const meta = getCategoryMeta(c.name)
                const subs = (c.subcategories || []).map((s: any) => ({
                  name: s.name,
                  value: 350.00,
                  is_fixed: s.isFixed ?? true
                }))
                const total = subs.reduce((acc: number, s: any) => acc + s.value, 0)
                return {
                  name: c.name,
                  icon: meta.icon,
                  total: total > 0 ? total : 1200.00,
                  color: meta.color,
                  is_obligatory: meta.is_obligatory,
                  subcategories: subs
                }
              })
            if (mapped.length > 0) {
              setCategoriesData(mapped)
            }
          }
        }
      } catch (_) {}
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('leaomed_setup_updated', handleUpdate)
    }

    if (isDemo) {
      handleUpdate()
      setCategoriesData(prev => prev.length > 0 ? prev : genericMedicalCategories)
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('leaomed_setup_updated', handleUpdate)
        }
      }
    }

    let isMounted = true
    setIsLoading(true)

    fetch(`/api/budget?filter=${currentFilter}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (data.success && data.data && data.data.categories?.length > 0) {
          const mapped: CategoryGroup[] = data.data.categories.map((c: any) => {
            const meta = getCategoryMeta(c.name)
            return {
              name: c.name,
              icon: meta.icon,
              total: c.total,
              color: meta.color,
              is_obligatory: c.is_obligatory ?? meta.is_obligatory,
              subcategories: c.subcategories || []
            }
          })
          setCategoriesData(mapped)
        } else {
          setCategoriesData(genericMedicalCategories)
        }
      })
      .catch(() => {
        if (isMounted) setCategoriesData(genericMedicalCategories)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => { 
      isMounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('leaomed_setup_updated', handleUpdate)
      }
    }
  }, [currentFilter, isDemo, genericMedicalCategories])

  const effectiveCategories = categoriesData.length > 0 ? categoriesData : genericMedicalCategories

  // Cálculos consolidados
  const totalObligatory = useMemo(() => {
    return effectiveCategories
      .filter(c => c.is_obligatory)
      .reduce((acc, c) => acc + c.total, 0)
  }, [effectiveCategories])

  const totalNonObligatory = useMemo(() => {
    return effectiveCategories
      .filter(c => !c.is_obligatory)
      .reduce((acc, c) => acc + c.total, 0)
  }, [effectiveCategories])

  const totalExpenses = totalObligatory + totalNonObligatory
  const pctObligatory = totalExpenses > 0 ? (totalObligatory / totalExpenses) * 100 : 0
  const pctNonObligatory = totalExpenses > 0 ? (totalNonObligatory / totalExpenses) * 100 : 0

  // Filtragem por Tab e por Busca
  const filteredCategories = useMemo(() => {
    return effectiveCategories.filter(cat => {
      // Filtro de aba
      if (activeTab === 'OBRIGATORIAS' && !cat.is_obligatory) return false
      if (activeTab === 'NAO_OBRIGATORIAS' && cat.is_obligatory) return false

      // Filtro de busca textual
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase()
        const catMatch = cat.name.toLowerCase().includes(query)
        const subMatch = cat.subcategories.some(s => s.name.toLowerCase().includes(query))
        return catMatch || subMatch
      }

      return true
    })
  }, [effectiveCategories, activeTab, searchTerm])

  return (
    <section id="categorias-planilha" className="scroll-mt-24">
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 md:p-6 shadow-sm relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Top Header do Módulo */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Categorias Oficiais da Planilha
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Database className="h-3 w-3" /> Neon Postgres Live
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Divisão exata das suas categorias e subcategorias: acompanhe onde cada centavo foi alocado entre gastos essenciais (obrigatórios) e estilo de vida.
            </p>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              Expandir Todos
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              Recolher
            </button>
          </div>
        </div>

        {/* Barra de Proporção Master: Obrigatórias vs Não Obrigatórias */}
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 p-4 md:p-5 mb-6 relative z-10 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-3">
            {/* Bloco Obrigatórias */}
            <div className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg">
              <span className="h-3 w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Despesas Obrigatórias</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-sm md:text-base font-black text-slate-900 dark:text-white tabular-nums">
                    R$ {totalObligatory.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                    ({pctObligatory.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco Não Obrigatórias */}
            <div className="flex items-center gap-2.5 bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-lg">
              <span className="h-3 w-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Despesas Não Obrigatórias</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-sm md:text-base font-black text-slate-900 dark:text-white tabular-nums">
                    R$ {totalNonObligatory.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">
                    ({pctNonObligatory.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Total Geral */}
            <div className="sm:text-right px-2 py-1">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Gasto Mensal Total</span>
              <span className="font-mono text-base md:text-lg font-black text-slate-900 dark:text-white tabular-nums">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Barra Visual Gradiente */}
          <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-3.5 overflow-hidden flex p-0.5 border border-slate-300 dark:border-white/5">
            <div 
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 h-full rounded-l-full transition-all duration-700 shadow-sm" 
              style={{ width: `${Math.max(5, pctObligatory)}%` }} 
              title={`Obrigatórias: ${pctObligatory.toFixed(1)}%`}
            />
            <div 
              className="bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 h-full rounded-r-full transition-all duration-700 shadow-sm" 
              style={{ width: `${Math.max(5, pctNonObligatory)}%` }} 
              title={`Não Obrigatórias: ${pctNonObligatory.toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 px-0.5">
            <span>Essenciais: Transporte, Casa, Financiamento, Saúde...</span>
            <span>Flexíveis: Compras, Lazer, Viagens, Delivery...</span>
          </div>
        </div>

        {/* Controles de Filtro e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 relative z-10">
          {/* Seletor de Aba */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950/90 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({effectiveCategories.length})
            </button>
            <button
              onClick={() => setActiveTab('OBRIGATORIAS')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                activeTab === 'OBRIGATORIAS'
                  ? 'bg-blue-600 text-white font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Obrigatórias ({effectiveCategories.filter(c => c.is_obligatory).length})
            </button>
            <button
              onClick={() => setActiveTab('NAO_OBRIGATORIAS')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                activeTab === 'NAO_OBRIGATORIAS'
                  ? 'bg-purple-600 text-white font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Não Obrigatórias ({effectiveCategories.filter(c => !c.is_obligatory).length})
            </button>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar gasto ou subcategoria (ex: T-Cross, Ifood, CEMIG)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500/50 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Grid de Categorias (Bento Cards com Drill-down) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon
            const isExpanded = expandedCategories[cat.name] ?? false
            const catPct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0

            return (
              <div
                key={cat.name}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-950/90 shadow-sm dark:shadow-lg'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-950/70'
                }`}
              >
                {/* Header Clicável da Categoria */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.name)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-hidden active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${cat.color} text-white shadow-md flex-shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-sm md:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                          {cat.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            cat.is_obligatory
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                              : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {cat.is_obligatory ? 'Obrigatória' : 'Não Obrigatória'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{cat.subcategories.length} itens</span>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{catPct.toFixed(1)}% do orçamento</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-sm md:text-base font-extrabold text-slate-900 dark:text-white tabular-nums block">
                        R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className={`p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                    }`}>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                {/* Barra de Progresso interna da categoria */}
                <div className="px-4 pb-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(2, catPct * 2))}%` }}
                    />
                  </div>
                </div>

                {/* Subcategorias Expandidas (Drill-down detalhado) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-900/60 p-3.5 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex justify-between">
                      <span>Subcategoria / Item</span>
                      <span>Valor Alocado</span>
                    </div>
                    {cat.subcategories.map((sub, idx) => {
                      const subPct = cat.total > 0 ? (sub.value / cat.total) * 100 : 0

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors text-xs border border-slate-200/50 dark:border-transparent"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                {sub.name}
                              </span>
                              {sub.is_fixed && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 flex-shrink-0">
                                  Fixo
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              {subPct.toFixed(1)}% de {cat.name}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums block">
                              R$ {sub.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <Filter className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhuma categoria encontrada</p>
            <p className="text-xs text-slate-500 mt-1">Tente ajustar o termo da busca ou trocar de aba.</p>
          </div>
        )}
      </div>
    </section>
  )
}
