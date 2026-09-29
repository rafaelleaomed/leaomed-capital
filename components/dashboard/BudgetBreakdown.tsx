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
  Database,
  TrendingDown,
  TrendingUp,
  Edit2,
  PlusCircle,
  X,
  Save,
  Briefcase,
  Stethoscope,
  Coins,
  Repeat
} from 'lucide-react'
import { QuickTransactionModal } from './QuickTransactionModal'

export interface SubcategoryItem {
  name: string
  value: number
  is_fixed?: boolean
}

export interface CategoryGroup {
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
  initialTab?: 'DESPESAS' | 'RECEITAS'
}

export function BudgetBreakdown({ currentFilter = 'PF', isDemo = false, initialTab = 'DESPESAS' }: BudgetBreakdownProps) {
  // Alternador Mestre: Despesas da Planilha vs Receitas da Planilha
  const [sectionView, setSectionView] = useState<'DESPESAS' | 'RECEITAS'>(initialTab)
  
  // Abas internas de despesas
  const [activeTab, setActiveTab] = useState<'ALL' | 'OBRIGATORIAS' | 'NAO_OBRIGATORIAS'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesData, setCategoriesData] = useState<CategoryGroup[]>([])

  // Modal de Adição Rápida
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  // Modal de Edição de Subcategoria ao Clicar no Valor
  const [editingItem, setEditingItem] = useState<{
    categoryName: string
    subcategoryName: string
    currentValue: number
    isFixed: boolean
    isIncome: boolean
  } | null>(null)
  const [editValueInput, setEditValueInput] = useState<string>('')
  const [editNameInput, setEditNameInput] = useState<string>('')
  const [editIsFixedInput, setEditIsFixedInput] = useState<boolean>(true)

  // Estado dos acordeões expandidos
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Moradia': true,
    'Transporte': true,
    'Saúde': true,
    'Empresa Médica PJ': true,
    'Empresa - Despesas Fixas': true,
    'Faturamento Hospitalar & PJ': true,
    'Consultório Particular Direto': true,
    'Rendimentos FIIs & Investimentos': true,
    'Despesas Pessoais': false,
    'Filhos': false,
    'Lazer': false,
    'Despesas Financeiras & Cartões': false
  })

  // Ouvir comando para trocar de visão (se clicou em Receitas ou Despesas no consolidado)
  useEffect(() => {
    const handleSwitch = (e: any) => {
      if (e.detail?.view === 'INCOME') {
        setSectionView('RECEITAS')
      } else if (e.detail?.view === 'EXPENSE') {
        setSectionView('DESPESAS')
      }
    }
    window.addEventListener('leaomed_switch_budget_view', handleSwitch)
    return () => window.removeEventListener('leaomed_switch_budget_view', handleSwitch)
  }, [])

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    effectiveExpenseCategories.forEach(c => { allExpanded[c.name] = true })
    effectiveIncomeCategories.forEach(c => { allExpanded[c.name] = true })
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
      case 'Faturamento Hospitalar & PJ':
        return { icon: Stethoscope, color: 'from-cyan-500 to-teal-600', is_obligatory: true }
      case 'Consultório Particular Direto':
        return { icon: Briefcase, color: 'from-emerald-500 to-green-600', is_obligatory: true }
      case 'Rendimentos FIIs & Investimentos':
        return { icon: Coins, color: 'from-purple-500 to-indigo-600', is_obligatory: false }
      default:
        return { icon: Layers, color: 'from-emerald-500 to-cyan-600', is_obligatory: true }
    }
  }

  // 1. Categorias de Despesas Médicas Padrão (com as subcategorias da Foto 1)
  const defaultExpenseCategories: CategoryGroup[] = useMemo(() => {
    if (currentFilter === 'PJ') {
      return [
        {
          name: 'Empresa Médica PJ',
          icon: Layers,
          total: 7800.00,
          color: 'from-cyan-500 to-blue-600',
          is_obligatory: true,
          subcategories: [
            { name: 'Tributos DAS Simples Nacional', value: 4200.00, is_fixed: true },
            { name: 'Mensalidade Contador PJ', value: 1200.00, is_fixed: true },
            { name: 'ISS & Taxas Municipais', value: 800.00, is_fixed: true },
            { name: 'Insumos & Despesas Médicas PJ', value: 1600.00, is_fixed: false }
          ]
        }
      ]
    }

    return [
      {
        name: 'Transporte',
        icon: Car,
        total: 13163.55,
        color: 'from-blue-500 to-indigo-600',
        is_obligatory: true,
        subcategories: [
          { name: 'T-Cross Cartão Localiza', value: 6837.55, is_fixed: true },
          { name: 'Financiamento Safra Veículo', value: 3336.00, is_fixed: true },
          { name: 'Combustível Mensal', value: 1450.00, is_fixed: false },
          { name: 'IPVA Proporcional', value: 580.00, is_fixed: true },
          { name: 'Seguro Automotivo', value: 480.00, is_fixed: true },
          { name: 'Pedágios & Sem Parar', value: 240.00, is_fixed: true },
          { name: 'Estacionamento Hospital / Clínicas', value: 140.00, is_fixed: false },
          { name: 'Lavagem & Cuidados Veiculares', value: 100.00, is_fixed: false }
        ]
      },
      {
        name: 'Casa',
        icon: Home,
        total: 5528.13,
        color: 'from-emerald-500 to-teal-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Condomínio Residencial', value: 1850.00, is_fixed: true },
          { name: 'Supermercado Familiar', value: 1450.00, is_fixed: false },
          { name: 'Empregada / Diarista', value: 1100.00, is_fixed: true },
          { name: 'Conta de Energia (CEMIG)', value: 480.13, is_fixed: true },
          { name: 'IPTU', value: 320.00, is_fixed: true },
          { name: 'Internet Banda Larga Fibra', value: 179.00, is_fixed: true },
          { name: 'TV / Streaming', value: 149.00, is_fixed: true }
        ]
      },
      {
        name: 'Empresa - Despesas Fixas',
        icon: Layers,
        total: 3255.98,
        color: 'from-cyan-500 to-blue-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Tributos DAS Simples', value: 2412.58, is_fixed: true },
          { name: 'Contabilidade', value: 843.40, is_fixed: true },
          { name: 'Tarifas Inter PJ', value: 0.00, is_fixed: true },
          { name: 'Pró-Labore Transferência', value: 0.00, is_fixed: true }
        ]
      },
      {
        name: 'Financiamento',
        icon: CreditCard,
        total: 2302.90,
        color: 'from-amber-500 to-orange-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Parcela Gramado Parks', value: 1925.41, is_fixed: true },
          { name: 'Condomínio Buona Vitta', value: 377.49, is_fixed: true }
        ]
      },
      {
        name: 'Compras',
        icon: ShoppingBag,
        total: 2398.37,
        color: 'from-purple-500 to-violet-600',
        is_obligatory: false,
        subcategories: [
          { name: 'Itens Pessoais & Vestuário', value: 1250.00, is_fixed: false },
          { name: 'Eletrônicos & Acessórios', value: 820.00, is_fixed: false },
          { name: 'Farmácia & Cuidados', value: 328.37, is_fixed: false }
        ]
      },
      {
        name: 'Saúde',
        icon: HeartPulse,
        total: 1278.01,
        color: 'from-rose-500 to-pink-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Plano de Saúde Familiar', value: 890.00, is_fixed: true },
          { name: 'Consultas & Terapias', value: 250.00, is_fixed: false },
          { name: 'Medicamentos Contínuos', value: 138.01, is_fixed: false }
        ]
      },
      {
        name: 'Lazer',
        icon: Film,
        total: 900.66,
        color: 'from-pink-500 to-rose-600',
        is_obligatory: false,
        subcategories: [
          { name: 'Restaurantes & Gastronomia', value: 580.00, is_fixed: false },
          { name: 'Cinema & Passeios', value: 200.00, is_fixed: false },
          { name: 'Assinaturas de Lazer', value: 120.66, is_fixed: true }
        ]
      }
    ]
  }, [currentFilter])

  // 2. Categorias de Receitas Médicas da Planilha (Faturamento PJ + Consultório + FIIs)
  const defaultIncomeCategories: CategoryGroup[] = useMemo(() => {
    if (currentFilter === 'PJ') {
      return [
        {
          name: 'Faturamento Hospitalar & PJ',
          icon: Stethoscope,
          total: 38500.00,
          color: 'from-cyan-500 to-teal-600',
          is_obligatory: true,
          subcategories: [
            { name: 'Hospital 01 - Plantões Médicos', value: 24000.00, is_fixed: true },
            { name: 'Convênios Médicos 01 e 02', value: 9500.00, is_fixed: true },
            { name: 'Consultório & Atendimentos PJ', value: 5000.00, is_fixed: false }
          ]
        }
      ]
    }

    if (currentFilter === 'PF') {
      return [
        {
          name: 'Retiradas PJ & Pró-Labore',
          icon: Briefcase,
          total: 22000.00,
          color: 'from-purple-500 to-indigo-600',
          is_obligatory: true,
          subcategories: [
            { name: 'Pró-Labore Retirada PJ', value: 22000.00, is_fixed: true }
          ]
        },
        {
          name: 'Consultório Particular Direto',
          icon: Stethoscope,
          total: 6200.00,
          color: 'from-emerald-500 to-teal-600',
          is_obligatory: true,
          subcategories: [
            { name: 'Consultas Particulares Presenciais', value: 4500.00, is_fixed: false },
            { name: 'Telemedicina & Pareceres', value: 1700.00, is_fixed: false }
          ]
        },
        {
          name: 'Rendimentos FIIs & Investimentos',
          icon: Coins,
          total: 3000.00,
          color: 'from-amber-500 to-orange-600',
          is_obligatory: false,
          subcategories: [
            { name: 'Dividendos de Fundos Imobiliários', value: 1850.00, is_fixed: false },
            { name: 'Rendimentos CDB & Caixa', value: 1150.00, is_fixed: false }
          ]
        }
      ]
    }

    // CONSOLIDATED: Receita Externa Real (Sem duplicar pró-labore!)
    return [
      {
        name: 'Faturamento Hospitalar & PJ',
        icon: Stethoscope,
        total: 38500.00,
        color: 'from-cyan-500 to-teal-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Hospital 01 - Plantões Médicos', value: 24000.00, is_fixed: true },
          { name: 'Repasse Convênios Clínicos 01 e 02', value: 9500.00, is_fixed: true },
          { name: 'Honorários Procedimentos Cirúrgicos', value: 5000.00, is_fixed: false }
        ]
      },
      {
        name: 'Consultório Particular Direto',
        icon: Briefcase,
        total: 8200.00,
        color: 'from-emerald-500 to-green-600',
        is_obligatory: true,
        subcategories: [
          { name: 'Consultas Particulares Presenciais', value: 6200.00, is_fixed: false },
          { name: 'Telemedicina & Pareceres Especializados', value: 2000.00, is_fixed: false }
        ]
      },
      {
        name: 'Rendimentos FIIs & Investimentos',
        icon: Coins,
        total: 3000.00,
        color: 'from-purple-500 to-indigo-600',
        is_obligatory: false,
        subcategories: [
          { name: 'Dividendos Fundos Imobiliários FII', value: 1850.00, is_fixed: false },
          { name: 'Rendimentos Renda Fixa / Caixa Remunerado', value: 1150.00, is_fixed: false }
        ]
      }
    ]
  }, [currentFilter])

  // Estados locais das categorias com possibilidade de edição em tempo real
  const [expenseCategories, setExpenseCategories] = useState<CategoryGroup[]>(defaultExpenseCategories)
  const [incomeCategories, setIncomeCategories] = useState<CategoryGroup[]>(defaultIncomeCategories)

  // Carregar edições salvas no localStorage
  useEffect(() => {
    try {
      const savedExpenseEdits = localStorage.getItem('leaomed_custom_budget_edits')
      if (savedExpenseEdits) {
        const editsMap: Record<string, number> = JSON.parse(savedExpenseEdits)
        setExpenseCategories(prev => prev.map(cat => {
          let updatedSubs = cat.subcategories.map(sub => {
            const key = `${cat.name}::${sub.name}`
            return editsMap[key] !== undefined ? { ...sub, value: editsMap[key] } : sub
          })
          const newTotal = updatedSubs.reduce((acc, s) => acc + s.value, 0)
          return { ...cat, total: newTotal, subcategories: updatedSubs }
        }))
      }

      const savedIncomeEdits = localStorage.getItem('leaomed_custom_income_edits')
      if (savedIncomeEdits) {
        const editsMap: Record<string, number> = JSON.parse(savedIncomeEdits)
        setIncomeCategories(prev => prev.map(cat => {
          let updatedSubs = cat.subcategories.map(sub => {
            const key = `${cat.name}::${sub.name}`
            return editsMap[key] !== undefined ? { ...sub, value: editsMap[key] } : sub
          })
          const newTotal = updatedSubs.reduce((acc, s) => acc + s.value, 0)
          return { ...cat, total: newTotal, subcategories: updatedSubs }
        }))
      }
    } catch (_) {}
  }, [])

  // Ouvir novo lançamento manual e incorporar na categoria correspondente
  useEffect(() => {
    const handleNewTx = (e: any) => {
      const tx = e.detail
      if (!tx) return

      if (tx.type === 'EXPENSE') {
        setExpenseCategories(prev => {
          const targetCatIndex = prev.findIndex(c => c.name.toLowerCase().includes(tx.category?.toLowerCase() || ''))
          if (targetCatIndex >= 0) {
            const copy = [...prev]
            copy[targetCatIndex].subcategories.unshift({
              name: tx.description,
              value: tx.amount,
              is_fixed: tx.is_fixed
            })
            copy[targetCatIndex].total = copy[targetCatIndex].subcategories.reduce((acc, s) => acc + s.value, 0)
            return copy
          }
          return prev
        })
      } else {
        setIncomeCategories(prev => {
          const targetCatIndex = prev.findIndex(c => c.name.toLowerCase().includes(tx.category?.toLowerCase() || ''))
          if (targetCatIndex >= 0) {
            const copy = [...prev]
            copy[targetCatIndex].subcategories.unshift({
              name: tx.description,
              value: tx.amount,
              is_fixed: true
            })
            copy[targetCatIndex].total = copy[targetCatIndex].subcategories.reduce((acc, s) => acc + s.value, 0)
            return copy
          }
          return prev
        })
      }
    }

    window.addEventListener('leaomed_new_transaction', handleNewTx)
    return () => window.removeEventListener('leaomed_new_transaction', handleNewTx)
  }, [])

  const effectiveExpenseCategories = expenseCategories.length > 0 ? expenseCategories : defaultExpenseCategories
  const effectiveIncomeCategories = incomeCategories.length > 0 ? incomeCategories : defaultIncomeCategories

  // Cálculos consolidados de Despesas
  const totalObligatory = useMemo(() => {
    return effectiveExpenseCategories
      .filter(c => c.is_obligatory)
      .reduce((acc, c) => acc + c.total, 0)
  }, [effectiveExpenseCategories])

  const totalNonObligatory = useMemo(() => {
    return effectiveExpenseCategories
      .filter(c => !c.is_obligatory)
      .reduce((acc, c) => acc + c.total, 0)
  }, [effectiveExpenseCategories])

  const totalExpenses = totalObligatory + totalNonObligatory
  const pctObligatory = totalExpenses > 0 ? (totalObligatory / totalExpenses) * 100 : 0
  const pctNonObligatory = totalExpenses > 0 ? (totalNonObligatory / totalExpenses) * 100 : 0

  // Cálculos consolidados de Receitas
  const totalIncome = useMemo(() => {
    return effectiveIncomeCategories.reduce((acc, c) => acc + c.total, 0)
  }, [effectiveIncomeCategories])

  // Notificar a Calculadora de Reserva de Emergência sobre o valor das Despesas Obrigatórias
  useEffect(() => {
    if (typeof window !== 'undefined' && totalObligatory > 0) {
      localStorage.setItem('leaomed_obligatory_expenses', totalObligatory.toString())
      window.dispatchEvent(new CustomEvent('leaomed_budget_obligatory_updated', {
        detail: { obligatoryTotal: totalObligatory }
      }))
    }
  }, [totalObligatory])

  // Filtragem por Tab e por Busca
  const filteredExpenseCategories = useMemo(() => {
    return effectiveExpenseCategories.filter(cat => {
      if (activeTab === 'OBRIGATORIAS' && !cat.is_obligatory) return false
      if (activeTab === 'NAO_OBRIGATORIAS' && cat.is_obligatory) return false

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase()
        const catMatch = cat.name.toLowerCase().includes(query)
        const subMatch = cat.subcategories.some(s => s.name.toLowerCase().includes(query))
        return catMatch || subMatch
      }
      return true
    })
  }, [effectiveExpenseCategories, activeTab, searchTerm])

  const filteredIncomeCategories = useMemo(() => {
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase()
      return effectiveIncomeCategories.filter(cat => {
        const catMatch = cat.name.toLowerCase().includes(query)
        const subMatch = cat.subcategories.some(s => s.name.toLowerCase().includes(query))
        return catMatch || subMatch
      })
    }
    return effectiveIncomeCategories
  }, [effectiveIncomeCategories, searchTerm])

  // Abrir modal de edição para um item específico
  const handleOpenEdit = (
    categoryName: string, 
    subcategoryName: string, 
    currentValue: number, 
    isFixed: boolean,
    isIncome: boolean
  ) => {
    setEditingItem({ categoryName, subcategoryName, currentValue, isFixed, isIncome })
    setEditValueInput(currentValue.toFixed(2))
    setEditNameInput(subcategoryName)
    setEditIsFixedInput(isFixed)
  }

  // Salvar a edição do item da planilha
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const parsedVal = parseFloat(editValueInput.replace(',', '.'))
    if (isNaN(parsedVal) || parsedVal < 0) return

    if (!editingItem.isIncome) {
      // Atualizar Despesas
      setExpenseCategories(prev => {
        const updated = prev.map(cat => {
          if (cat.name === editingItem.categoryName) {
            const updatedSubs = cat.subcategories.map(sub => {
              if (sub.name === editingItem.subcategoryName) {
                return {
                  ...sub,
                  name: editNameInput.trim() || sub.name,
                  value: parsedVal,
                  is_fixed: editIsFixedInput
                }
              }
              return sub
            })
            const newTotal = updatedSubs.reduce((acc, s) => acc + s.value, 0)
            return { ...cat, total: newTotal, subcategories: updatedSubs }
          }
          return cat
        })

        // Persistir no localStorage
        try {
          const stored = localStorage.getItem('leaomed_custom_budget_edits')
          const map = stored ? JSON.parse(stored) : {}
          map[`${editingItem.categoryName}::${editingItem.subcategoryName}`] = parsedVal
          localStorage.setItem('leaomed_custom_budget_edits', JSON.stringify(map))
        } catch (_) {}

        return updated
      })
    } else {
      // Atualizar Receitas
      setIncomeCategories(prev => {
        const updated = prev.map(cat => {
          if (cat.name === editingItem.categoryName) {
            const updatedSubs = cat.subcategories.map(sub => {
              if (sub.name === editingItem.subcategoryName) {
                return {
                  ...sub,
                  name: editNameInput.trim() || sub.name,
                  value: parsedVal
                }
              }
              return sub
            })
            const newTotal = updatedSubs.reduce((acc, s) => acc + s.value, 0)
            return { ...cat, total: newTotal, subcategories: updatedSubs }
          }
          return cat
        })

        // Persistir no localStorage
        try {
          const stored = localStorage.getItem('leaomed_custom_income_edits')
          const map = stored ? JSON.parse(stored) : {}
          map[`${editingItem.categoryName}::${editingItem.subcategoryName}`] = parsedVal
          localStorage.setItem('leaomed_custom_income_edits', JSON.stringify(map))
        } catch (_) {}

        return updated
      })
    }

    setEditingItem(null)
  }

  return (
    <section id="categorias-planilha" className="scroll-mt-24">
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 md:p-6 shadow-sm relative overflow-hidden transition-all">
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
              Divisão exata das suas despesas e receitas. Clique em qualquer valor da lista para editar inconsistências em tempo real.
            </p>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => setIsAddTransactionOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Novo Lançamento</span>
            </button>
            <button
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              Expandir Todos
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              Recolher
            </button>
          </div>
        </div>

        {/* SELETOR MESTRE: DESPESAS DA PLANILHA vs RECEITAS DA PLANILHA */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 shadow-inner relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSectionView('DESPESAS')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                sectionView === 'DESPESAS'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Despesas da Planilha</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                sectionView === 'DESPESAS' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </button>

            <button
              onClick={() => setSectionView('RECEITAS')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                sectionView === 'RECEITAS'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Receitas da Planilha</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                sectionView === 'RECEITAS' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </button>
          </div>

          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Valores clicáveis para ajuste rápido</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VISÃO 1: DESPESAS DA PLANILHA */}
        {/* ========================================================================= */}
        {sectionView === 'DESPESAS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Barra de Proporção Master: Obrigatórias vs Não Obrigatórias */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 p-4 md:p-5 relative z-10 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-3">
                {/* Bloco Obrigatórias */}
                <div className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl">
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
                <div className="flex items-center gap-2.5 bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-xl">
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

                {/* Bloco Total Geral */}
                <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-white/10 sm:pl-4">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Gasto Mensal Total</span>
                  <span className="font-mono text-base md:text-lg font-black text-slate-900 dark:text-white tabular-nums">
                    R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso Bicolor */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-700 shadow-sm"
                  style={{ width: `${pctObligatory}%` }}
                  title={`Obrigatórias: ${pctObligatory.toFixed(1)}%`}
                />
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-700 shadow-sm"
                  style={{ width: `${pctNonObligatory}%` }}
                  title={`Não Obrigatórias: ${pctNonObligatory.toFixed(1)}%`}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-2 px-1">
                <span>Essenciais: Transporte, Casa, Financiamento, Saúde...</span>
                <span>Flexíveis: Compras, Lazer, Viagens, Delivery...</span>
              </div>
            </div>

            {/* Filtros e Busca Rápida */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
              <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold shadow-xs">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todas ({effectiveExpenseCategories.length})
                </button>
                <button
                  onClick={() => setActiveTab('OBRIGATORIAS')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                    activeTab === 'OBRIGATORIAS'
                      ? 'bg-blue-600 text-white font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Obrigatórias ({effectiveExpenseCategories.filter(c => c.is_obligatory).length})
                </button>
                <button
                  onClick={() => setActiveTab('NAO_OBRIGATORIAS')}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                    activeTab === 'NAO_OBRIGATORIAS'
                      ? 'bg-purple-600 text-white font-black shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Não Obrigatórias ({effectiveExpenseCategories.filter(c => !c.is_obligatory).length})
                </button>
              </div>

              {/* Campo de Busca Rápida */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar gasto ou subcategoria (ex: T-Cross, Inter, DAS)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Grid de Categorias de Despesas (Bento Cards com Drill-down e Edição Clicável) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {filteredExpenseCategories.map((cat) => {
                const Icon = cat.icon
                const isExpanded = expandedCategories[cat.name] ?? false
                const catPct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0

                return (
                  <div
                    key={cat.name}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-slate-950/90 shadow-sm dark:shadow-lg'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-950/70'
                    }`}
                  >
                    {/* Header Clicável da Categoria */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none active:scale-[0.99] transition-all cursor-pointer"
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

                    {/* Subcategorias Expandidas (Com clique direto para edição) */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-900/60 p-3.5 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex justify-between">
                          <span>Subcategoria / Item</span>
                          <span>Valor Alocado (Clique p/ Editar)</span>
                        </div>
                        {cat.subcategories.map((sub, idx) => {
                          const subPct = cat.total > 0 ? (sub.value / cat.total) * 100 : 0

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors text-xs border border-slate-200/50 dark:border-transparent group"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
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

                              {/* VALOR CLICÁVEL PARA EDIÇÃO DIRETA */}
                              <div className="text-right flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenEdit(cat.name, sub.name, sub.value, !!sub.is_fixed, false)
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer group/val"
                                  title="Clique para editar este valor na planilha"
                                >
                                  <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums group-hover/val:text-emerald-600 dark:group-hover/val:text-emerald-400">
                                    R$ {sub.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <Edit2 className="w-3 h-3 text-slate-400 group-hover/val:text-emerald-500 transition-colors opacity-60 group-hover/val:opacity-100" />
                                </button>
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISÃO 2: RECEITAS DA PLANILHA (FATURAMENTO MÉDICO, CONSULTÓRIO E FIIS) */}
        {/* ========================================================================= */}
        {sectionView === 'RECEITAS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Barra de Resumo de Receitas */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-slate-950 p-4 md:p-5 relative z-10 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-3">
                <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Faturamento Hospitalar & PJ</span>
                    <span className="font-mono text-sm md:text-base font-black text-slate-900 dark:text-white tabular-nums">
                      R$ {effectiveIncomeCategories[0]?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-teal-500/10 border border-teal-500/20 px-3 py-2 rounded-xl">
                  <span className="h-3 w-3 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50" />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Consultório & FIIs PF</span>
                    <span className="font-mono text-sm md:text-base font-black text-slate-900 dark:text-white tabular-nums">
                      R$ {(totalIncome - (effectiveIncomeCategories[0]?.total || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-white/10 sm:pl-4">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Receita Mensal Total</span>
                  <span className="font-mono text-base md:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Barra de Progresso das Receitas */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                {effectiveIncomeCategories.map((c, i) => {
                  const pct = totalIncome > 0 ? (c.total / totalIncome) * 100 : 0
                  const colors = ['from-cyan-500 to-teal-600', 'from-emerald-500 to-green-600', 'from-purple-500 to-indigo-600']
                  return (
                    <div 
                      key={c.name}
                      className={`bg-gradient-to-r ${colors[i % colors.length]} h-full transition-all duration-700 shadow-sm`}
                      style={{ width: `${pct}%` }}
                      title={`${c.name}: ${pct.toFixed(1)}%`}
                    />
                  )
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-2 px-1">
                <span>Fontes: Plantões Hospitalares, Honorários Convênios, Consultas Particulares e Rendimentos</span>
                <span>Auditado sem duplicidade de pró-labore</span>
              </div>
            </div>

            {/* Grid de Categorias de Receitas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {filteredIncomeCategories.map((cat) => {
                const Icon = cat.icon
                const isExpanded = expandedCategories[cat.name] ?? true
                const catPct = totalIncome > 0 ? (cat.total / totalIncome) * 100 : 0

                return (
                  <div
                    key={cat.name}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/70 shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all overflow-hidden"
                  >
                    {/* Header Clicável da Categoria de Receita */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 focus:outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${cat.color} text-white shadow-md flex-shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-display text-sm font-bold text-slate-900 dark:text-white tracking-tight block truncate">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                            {catPct.toFixed(1)}% das receitas
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-sm md:text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums block">
                          R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Subcategorias de Receitas Expandidas */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-900/60 p-3.5 space-y-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex justify-between">
                          <span>Origem / Contrato</span>
                          <span>Valor (Clique p/ Editar)</span>
                        </div>
                        {cat.subcategories.map((sub, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors text-xs border border-slate-200/50 dark:border-transparent group"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                              {sub.name}
                            </span>

                            {/* VALOR CLICÁVEL PARA EDIÇÃO DE RECEITA */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenEdit(cat.name, sub.name, sub.value, true, true)
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer group/val"
                              title="Clique para editar este valor de receita"
                            >
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                R$ {sub.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <Edit2 className="w-3 h-3 text-slate-400 group-hover/val:text-emerald-500 transition-colors opacity-60 group-hover/val:opacity-100" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE EDIÇÃO DIRETA DE VALOR DE SUBCATEGORIA (FOTO 1) */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all scale-100"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                    Editar Valor da Planilha
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {editingItem.categoryName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário de Edição */}
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Item / Subcategoria
                </label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Valor Alocado (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editValueInput}
                    onChange={(e) => setEditValueInput(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl text-sm font-mono font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  O somatório da categoria e os cálculos gerais serão atualizados automaticamente.
                </p>
              </div>

              {!editingItem.isIncome && (
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editIsFixedInput}
                      onChange={(e) => setEditIsFixedInput(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Despesa Fixa / Obrigatória (Entra no cálculo da reserva)
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Alteração</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Novo Lançamento Rápido */}
      <QuickTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        initialType={sectionView === 'RECEITAS' ? 'INCOME' : 'EXPENSE'}
      />
    </section>
  )
}
