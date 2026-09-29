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
  Repeat,
  Trash2,
  Building2,
  UserCheck
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
  initialTab?: string
}

export type BudgetScopeTab = 'EXPENSE_PF' | 'EXPENSE_PJ' | 'INCOME_PJ' | 'INCOME_PF'

export function BudgetBreakdown({ currentFilter = 'PF', isDemo = false, initialTab }: BudgetBreakdownProps) {
  // Determina a aba inicial de acordo com o filtro global
  const defaultTab: BudgetScopeTab = useMemo(() => {
    if (initialTab === 'RECEITAS') return currentFilter === 'PJ' ? 'INCOME_PJ' : 'INCOME_PF'
    if (currentFilter === 'PJ') return 'EXPENSE_PJ'
    return 'EXPENSE_PF'
  }, [currentFilter, initialTab])

  const [activeScopeTab, setActiveScopeTab] = useState<BudgetScopeTab>(defaultTab)

  // Sincronizar se o filtro global superior mudar
  useEffect(() => {
    if (currentFilter === 'PJ') {
      setActiveScopeTab(prev => (prev === 'INCOME_PJ' || prev === 'INCOME_PF') ? 'INCOME_PJ' : 'EXPENSE_PJ')
    } else if (currentFilter === 'PF') {
      setActiveScopeTab(prev => (prev === 'INCOME_PJ' || prev === 'INCOME_PF') ? 'INCOME_PF' : 'EXPENSE_PF')
    }
  }, [currentFilter])

  // Sub-filtro para despesas PF (Todas, Obrigatórias ou Não Obrigatórias)
  const [expenseFilterTab, setExpenseFilterTab] = useState<'ALL' | 'OBRIGATORIAS' | 'NAO_OBRIGATORIAS'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal de Novo Lançamento
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  // Modal de Edição Inline
  const [editingItem, setEditingItem] = useState<{
    scope: BudgetScopeTab
    categoryName: string
    subcategoryName: string
    currentValue: number
    isFixed: boolean
  } | null>(null)
  const [editValueInput, setEditValueInput] = useState<string>('')
  const [editNameInput, setEditNameInput] = useState<string>('')
  const [editIsFixedInput, setEditIsFixedInput] = useState<boolean>(true)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  // Acordeões expandidos
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Transporte': true,
    'Casa': true,
    'Financiamento': true,
    'Tributos Simples Nacional & Federais': true,
    'Serviços Contábeis & Administrativos': true,
    'Faturamento Bruto PJ': true,
    'Pró-Labore & Entradas PF': true,
    'Faturamento Hospitalar & PJ': true,
    'Retiradas PJ & Pró-Labore': true,
    'Saúde': true,
    'Compras': false,
    'Lazer': false
  })

  // Ouvir comando para trocar de visão (se clicou em Receitas ou Despesas no consolidado)
  useEffect(() => {
    const handleSwitch = (e: any) => {
      if (e.detail?.view === 'INCOME') {
        setActiveScopeTab(currentFilter === 'PJ' ? 'INCOME_PJ' : 'INCOME_PF')
      } else if (e.detail?.view === 'EXPENSE') {
        setActiveScopeTab(currentFilter === 'PJ' ? 'EXPENSE_PJ' : 'EXPENSE_PF')
      }
    }
    window.addEventListener('leaomed_switch_budget_view', handleSwitch)
    return () => window.removeEventListener('leaomed_switch_budget_view', handleSwitch)
  }, [currentFilter])

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  // 1. DATASETS REAIS AUDITADOS DO DR. RAFAEL LEÃO (media_1790214901206.xlsx)
  const realExpensePFCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Transporte',
      icon: Car,
      total: 13163.55,
      color: 'from-blue-500 to-indigo-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Parcela T-Cross Cartão', value: 6837.22, is_fixed: true },
        { name: 'Parcela T-Cross Financiamento Safra', value: 3336.28, is_fixed: true },
        { name: 'Combustível', value: 708.32, is_fixed: false },
        { name: 'Estacionamentos', value: 663.75, is_fixed: false },
        { name: 'Portas WRV', value: 500.00, is_fixed: true },
        { name: 'Seguro Automotivo', value: 336.83, is_fixed: true },
        { name: 'Táxi / Uber', value: 81.15, is_fixed: false }
      ]
    },
    {
      name: 'Casa',
      icon: Home,
      total: 5662.63,
      color: 'from-emerald-500 to-teal-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Supermercado Familiar', value: 1690.80, is_fixed: false },
        { name: 'Condomínio Residencial', value: 1451.79, is_fixed: true },
        { name: 'Aluguel', value: 500.00, is_fixed: true },
        { name: 'IPTU', value: 359.73, is_fixed: true },
        { name: 'Lava e Seca', value: 355.00, is_fixed: true },
        { name: 'TV TCL', value: 250.92, is_fixed: true },
        { name: 'Conta de Luz (CEMIG)', value: 216.00, is_fixed: true },
        { name: 'Sofá', value: 197.00, is_fixed: true },
        { name: 'IPTV', value: 147.00, is_fixed: true },
        { name: 'Celular', value: 139.99, is_fixed: true },
        { name: 'Tela Janelas', value: 130.00, is_fixed: true },
        { name: 'Internet Fibra', value: 89.90, is_fixed: true },
        { name: 'Lixeira - Utensílios', value: 51.03, is_fixed: true },
        { name: 'Adega Climatizada', value: 42.67, is_fixed: true },
        { name: 'AirFryer', value: 40.80, is_fixed: true }
      ]
    },
    {
      name: 'Financiamento',
      icon: CreditCard,
      total: 2302.90,
      color: 'from-amber-500 to-orange-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Parcela Gramados Parks', value: 1925.41, is_fixed: true },
        { name: 'Condomínio Buona Vitta', value: 377.49, is_fixed: true }
      ]
    },
    {
      name: 'Saúde',
      icon: HeartPulse,
      total: 1278.01,
      color: 'from-rose-500 to-pink-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Plano de Saúde', value: 509.00, is_fixed: true },
        { name: 'Seguro AZOS', value: 353.76, is_fixed: true },
        { name: 'Academia', value: 299.98, is_fixed: true },
        { name: 'Remédios & Farmácia', value: 115.27, is_fixed: false }
      ]
    },
    {
      name: 'Alimentação',
      icon: UtensilsCrossed,
      total: 793.09,
      color: 'from-yellow-500 to-amber-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Almoço & Lanches Rotina', value: 793.09, is_fixed: false }
      ]
    },
    {
      name: 'Pets',
      icon: Dog,
      total: 220.04,
      color: 'from-teal-500 to-emerald-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Areia, Ração e Cuidados Pets', value: 220.04, is_fixed: false }
      ]
    },
    {
      name: 'Impostos e Taxas PF',
      icon: Receipt,
      total: 189.60,
      color: 'from-slate-500 to-zinc-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Anuidade CRM', value: 189.60, is_fixed: true }
      ]
    },
    {
      name: 'Compras',
      icon: ShoppingBag,
      total: 2773.75,
      color: 'from-purple-500 to-violet-600',
      is_obligatory: false,
      subcategories: [
        { name: 'Presentes Familiares', value: 950.78, is_fixed: false },
        { name: 'Suplementos', value: 480.56, is_fixed: false },
        { name: 'Aliança Solitário', value: 382.37, is_fixed: true },
        { name: 'BoateBus', value: 310.00, is_fixed: true },
        { name: 'S26 Ultra', value: 274.66, is_fixed: true },
        { name: 'Aliexpress / Shopee', value: 151.78, is_fixed: false },
        { name: 'Doações', value: 102.00, is_fixed: false },
        { name: 'Tela S23 Ultra', value: 90.20, is_fixed: true },
        { name: 'Vestuário & Roupas', value: 31.40, is_fixed: false }
      ]
    },
    {
      name: 'Lazer',
      icon: Film,
      total: 803.90,
      color: 'from-pink-500 to-rose-600',
      is_obligatory: false,
      subcategories: [
        { name: 'Ingressos & Jogos Mineirão', value: 492.10, is_fixed: false },
        { name: 'Resenhas & Aniversários', value: 173.80, is_fixed: false },
        { name: 'Bares & Baladas', value: 60.00, is_fixed: false },
        { name: 'Futebol & Esportes', value: 60.00, is_fixed: false },
        { name: 'Apostas & Jogos', value: 18.00, is_fixed: false }
      ]
    },
    {
      name: 'Viagem',
      icon: Plane,
      total: 780.94,
      color: 'from-sky-500 to-indigo-500',
      is_obligatory: false,
      subcategories: [
        { name: 'Hospedagem', value: 267.24, is_fixed: false },
        { name: 'Combustível Viagem', value: 224.00, is_fixed: false },
        { name: 'Compras Viagem', value: 222.70, is_fixed: false },
        { name: 'Alimentação / Supermercado Viagem', value: 67.00, is_fixed: false }
      ]
    },
    {
      name: 'Restaurantes & Delivery',
      icon: Coffee,
      total: 506.71,
      color: 'from-orange-500 to-amber-500',
      is_obligatory: false,
      subcategories: [
        { name: 'Almoço / Jantar GRI', value: 204.30, is_fixed: false },
        { name: 'Ifood Delivery', value: 204.26, is_fixed: false },
        { name: 'Sorvetes & Sobremesas', value: 98.15, is_fixed: false }
      ]
    },
    {
      name: 'Serviços de Assinaturas',
      icon: Sparkles,
      total: 254.53,
      color: 'from-indigo-500 to-blue-600',
      is_obligatory: false,
      subcategories: [
        { name: 'Empiricus SOROS', value: 123.90, is_fixed: true },
        { name: 'Curso IA Danilo', value: 56.48, is_fixed: true },
        { name: 'Myprofit Gestão', value: 29.90, is_fixed: true },
        { name: 'Mobilis Finanças', value: 29.80, is_fixed: true },
        { name: 'Ifood Club', value: 7.95, is_fixed: true },
        { name: 'CapCut Pro', value: 6.50, is_fixed: true }
      ]
    }
  ], [])

  const realExpensePJCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Tributos Simples Nacional & Federais',
      icon: Receipt,
      total: 2764.77,
      color: 'from-cyan-500 to-blue-600',
      is_obligatory: true,
      subcategories: [
        { name: 'INSS Patronal / Pró-labore', value: 961.21, is_fixed: true },
        { name: 'ISS Municipal', value: 708.73, is_fixed: true },
        { name: 'DARF Tributário', value: 550.00, is_fixed: true },
        { name: 'COFINS', value: 311.17, is_fixed: true },
        { name: 'IRPJ PJ', value: 88.59, is_fixed: true },
        { name: 'CSLL', value: 77.52, is_fixed: true },
        { name: 'PIS', value: 67.55, is_fixed: true }
      ]
    },
    {
      name: 'Serviços Contábeis & Administrativos',
      icon: Building2,
      total: 491.21,
      color: 'from-emerald-500 to-teal-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Mensalidade Contabilidade PJ', value: 491.21, is_fixed: true },
        { name: 'Tarifas Bancárias Inter PJ', value: 0.00, is_fixed: true },
        { name: 'Taxas & Certidões PJ', value: 0.00, is_fixed: false }
      ]
    }
  ], [])

  const realIncomePJCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Faturamento Bruto PJ',
      icon: Stethoscope,
      total: 26500.00,
      color: 'from-cyan-500 to-teal-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Camarinha BRUTO (Faturamento PJ)', value: 26500.00, is_fixed: true },
        { name: 'UPAs Contagem', value: 0.00, is_fixed: true },
        { name: 'Sabarás', value: 0.00, is_fixed: true },
        { name: 'Cruzeiro', value: 0.00, is_fixed: true }
      ]
    }
  ], [])

  const realIncomePFCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Pró-Labore & Entradas PF',
      icon: Briefcase,
      total: 25979.99,
      color: 'from-purple-500 to-indigo-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Camarinha (Pró-labore da PJ)', value: 23000.00, is_fixed: true },
        { name: 'Reembolsos Médicos', value: 2650.00, is_fixed: false },
        { name: 'Rendimento de Investimentos', value: 329.99, is_fixed: false },
        { name: 'Presentes / Prêmios', value: 40.00, is_fixed: false }
      ]
    }
  ], [])

  // 2. DATASETS GENÉRICOS DEMONSTRATIVOS (apenas para /demo)
  const demoExpensePFCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Transporte',
      icon: Car,
      total: 13163.55,
      color: 'from-blue-500 to-indigo-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Parcela Veicular Safra', value: 3336.00, is_fixed: true },
        { name: 'Cartão Combustível & Parcelas', value: 6837.55, is_fixed: true },
        { name: 'Combustível Mensal', value: 1450.00, is_fixed: false },
        { name: 'IPVA Proporcional', value: 580.00, is_fixed: true },
        { name: 'Seguro Automotivo', value: 480.00, is_fixed: true },
        { name: 'Pedágios & Estacionamentos', value: 480.00, is_fixed: false }
      ]
    },
    {
      name: 'Casa & Moradia',
      icon: Home,
      total: 5528.13,
      color: 'from-emerald-500 to-teal-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Condomínio Residencial', value: 1850.00, is_fixed: true },
        { name: 'Supermercado Familiar', value: 1450.00, is_fixed: false },
        { name: 'Empregada / Diarista', value: 1100.00, is_fixed: true },
        { name: 'Energia Elétrica & Gás', value: 480.13, is_fixed: true },
        { name: 'IPTU Proporcional', value: 320.00, is_fixed: true },
        { name: 'Internet Banda Larga', value: 179.00, is_fixed: true },
        { name: 'Streaming & Assinaturas', value: 149.00, is_fixed: true }
      ]
    },
    {
      name: 'Compras & Pessoal',
      icon: ShoppingBag,
      total: 2398.37,
      color: 'from-purple-500 to-violet-600',
      is_obligatory: false,
      subcategories: [
        { name: 'Vestuário & Cuidados', value: 1250.00, is_fixed: false },
        { name: 'Eletrônicos & Gadgets', value: 820.00, is_fixed: false },
        { name: 'Farmácia & Beleza', value: 328.37, is_fixed: false }
      ]
    },
    {
      name: 'Saúde & Cuidados',
      icon: HeartPulse,
      total: 1278.01,
      color: 'from-rose-500 to-pink-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Plano de Saúde Familiar', value: 890.00, is_fixed: true },
        { name: 'Academia & Terapias', value: 250.00, is_fixed: false },
        { name: 'Medicamentos Contínuos', value: 138.01, is_fixed: false }
      ]
    },
    {
      name: 'Lazer & Restaurantes',
      icon: Film,
      total: 900.66,
      color: 'from-pink-500 to-rose-600',
      is_obligatory: false,
      subcategories: [
        { name: 'Restaurantes & Gastronomia', value: 580.00, is_fixed: false },
        { name: 'Passeios & Cinema', value: 200.00, is_fixed: false },
        { name: 'Assinaturas de Lazer', value: 120.66, is_fixed: true }
      ]
    }
  ], [])

  const demoExpensePJCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Empresa Médica PJ - Tributos & Fixas',
      icon: Layers,
      total: 6200.00,
      color: 'from-cyan-500 to-blue-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Tributos DAS Simples Nacional', value: 3800.00, is_fixed: true },
        { name: 'Mensalidade Contador Especializado', value: 1200.00, is_fixed: true },
        { name: 'ISS & Taxas de Funcionamento', value: 600.00, is_fixed: true },
        { name: 'Insumos Médicos & Softwares PJ', value: 600.00, is_fixed: false }
      ]
    }
  ], [])

  const demoIncomePJCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Faturamento Hospitalar & PJ',
      icon: Stethoscope,
      total: 38500.00,
      color: 'from-cyan-500 to-teal-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Hospital 01 - Plantões Médicos', value: 24000.00, is_fixed: true },
        { name: 'Convênios Médicos 01 e 02', value: 9500.00, is_fixed: true },
        { name: 'Honorários Procedimentos Cirúrgicos', value: 5000.00, is_fixed: false }
      ]
    }
  ], [])

  const demoIncomePFCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Retiradas PJ & Consultório PF',
      icon: Briefcase,
      total: 31200.00,
      color: 'from-purple-500 to-indigo-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Retirada de Pró-Labore da Clínica', value: 22000.00, is_fixed: true },
        { name: 'Consultório Particular Presencial', value: 6200.00, is_fixed: false },
        { name: 'Rendimentos FIIs & Caixa', value: 3000.00, is_fixed: false }
      ]
    }
  ], [])

  // Selecionar fontes ativas baseadas no flag isDemo
  const baseExpensePFCategories = isDemo ? demoExpensePFCategories : realExpensePFCategories
  const baseExpensePJCategories = isDemo ? demoExpensePJCategories : realExpensePJCategories
  const baseIncomePJCategories = isDemo ? demoIncomePJCategories : realIncomePJCategories
  const baseIncomePFCategories = isDemo ? demoIncomePFCategories : realIncomePFCategories

  // Estados locais para permitir edição e exclusão persistidas
  const [expensePFCats, setExpensePFCats] = useState<CategoryGroup[]>(baseExpensePFCategories)
  const [expensePJCats, setExpensePJCats] = useState<CategoryGroup[]>(baseExpensePJCategories)
  const [incomePJCats, setIncomePJCats] = useState<CategoryGroup[]>(baseIncomePJCategories)
  const [incomePFCats, setIncomePFCats] = useState<CategoryGroup[]>(baseIncomePFCategories)

  // Atualizar quando mudar isDemo
  useEffect(() => {
    setExpensePFCats(baseExpensePFCategories)
    setExpensePJCats(baseExpensePJCategories)
    setIncomePJCats(baseIncomePJCategories)
    setIncomePFCats(baseIncomePFCategories)
  }, [baseExpensePFCategories, baseExpensePJCategories, baseIncomePJCategories, baseIncomePFCategories])

  // Carregar edições e exclusões locais salvas no localStorage
  useEffect(() => {
    try {
      const storedDeleted = localStorage.getItem('leaomed_deleted_budget_items')
      const deletedKeys: string[] = storedDeleted ? JSON.parse(storedDeleted) : []

      const savedEdits = localStorage.getItem('leaomed_custom_budget_edits_v2')
      const editsMap: Record<string, { name?: string; value: number; is_fixed?: boolean }> = savedEdits ? JSON.parse(savedEdits) : {}

      const applyUpdates = (cats: CategoryGroup[], scopeKey: string) => {
        return cats.map(cat => {
          const updatedSubs = cat.subcategories
            .filter(sub => !deletedKeys.includes(`${scopeKey}::${cat.name}::${sub.name}`))
            .map(sub => {
              const k = `${scopeKey}::${cat.name}::${sub.name}`
              if (editsMap[k]) {
                return {
                  ...sub,
                  name: editsMap[k].name || sub.name,
                  value: editsMap[k].value,
                  is_fixed: editsMap[k].is_fixed !== undefined ? editsMap[k].is_fixed : sub.is_fixed
                }
              }
              return sub
            })
          const newTotal = updatedSubs.reduce((acc, s) => acc + s.value, 0)
          return { ...cat, total: newTotal, subcategories: updatedSubs }
        })
      }

      setExpensePFCats(prev => applyUpdates(prev, 'EXPENSE_PF'))
      setExpensePJCats(prev => applyUpdates(prev, 'EXPENSE_PJ'))
      setIncomePJCats(prev => applyUpdates(prev, 'INCOME_PJ'))
      setIncomePFCats(prev => applyUpdates(prev, 'INCOME_PF'))
    } catch (_) {}
  }, [])

  // Notificar calculadora de reserva com o somatório de despesas obrigatórias PF
  const totalObligatoryPF = useMemo(() => {
    return expensePFCats
      .filter(c => c.is_obligatory)
      .reduce((acc, c) => acc + c.total, 0)
  }, [expensePFCats])

  useEffect(() => {
    if (typeof window !== 'undefined' && totalObligatoryPF > 0) {
      localStorage.setItem('leaomed_obligatory_expenses', totalObligatoryPF.toString())
      window.dispatchEvent(new CustomEvent('leaomed_budget_obligatory_updated', {
        detail: { obligatoryTotal: totalObligatoryPF }
      }))
    }
  }, [totalObligatoryPF])

  // Categorias ativas de acordo com a aba selecionada
  const currentCategoryList: CategoryGroup[] = useMemo(() => {
    switch (activeScopeTab) {
      case 'EXPENSE_PF':
        return expensePFCats
      case 'EXPENSE_PJ':
        return expensePJCats
      case 'INCOME_PJ':
        return incomePJCats
      case 'INCOME_PF':
        return incomePFCats
      default:
        return expensePFCats
    }
  }, [activeScopeTab, expensePFCats, expensePJCats, incomePJCats, incomePFCats])

  // Totais de cada escopo para exibir nas abas
  const totalExpensePF = useMemo(() => expensePFCats.reduce((acc, c) => acc + c.total, 0), [expensePFCats])
  const totalExpensePJ = useMemo(() => expensePJCats.reduce((acc, c) => acc + c.total, 0), [expensePJCats])
  const totalIncomePJ = useMemo(() => incomePJCats.reduce((acc, c) => acc + c.total, 0), [incomePJCats])
  const totalIncomePF = useMemo(() => incomePFCats.reduce((acc, c) => acc + c.total, 0), [incomePFCats])

  // Filtragem de busca e sub-abas
  const filteredCategories = useMemo(() => {
    return currentCategoryList.filter(cat => {
      // Sub-aba de despesas PF
      if (activeScopeTab === 'EXPENSE_PF') {
        if (expenseFilterTab === 'OBRIGATORIAS' && !cat.is_obligatory) return false
        if (expenseFilterTab === 'NAO_OBRIGATORIAS' && cat.is_obligatory) return false
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase()
        const catMatch = cat.name.toLowerCase().includes(query)
        const subMatch = cat.subcategories.some(s => s.name.toLowerCase().includes(query))
        return catMatch || subMatch
      }
      return true
    })
  }, [currentCategoryList, activeScopeTab, expenseFilterTab, searchTerm])

  // Salvar Edição
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const parsedVal = parseFloat(editValueInput.replace(',', '.'))
    if (isNaN(parsedVal) || parsedVal < 0) return

    const { scope, categoryName, subcategoryName } = editingItem

    const updateState = (setter: React.Dispatch<React.SetStateAction<CategoryGroup[]>>) => {
      setter(prev => prev.map(cat => {
        if (cat.name === categoryName) {
          const updatedSubs = cat.subcategories.map(sub => {
            if (sub.name === subcategoryName) {
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
      }))
    }

    if (scope === 'EXPENSE_PF') updateState(setExpensePFCats)
    else if (scope === 'EXPENSE_PJ') updateState(setExpensePJCats)
    else if (scope === 'INCOME_PJ') updateState(setIncomePJCats)
    else if (scope === 'INCOME_PF') updateState(setIncomePFCats)

    // Persistir no localStorage
    try {
      const stored = localStorage.getItem('leaomed_custom_budget_edits_v2')
      const map = stored ? JSON.parse(stored) : {}
      map[`${scope}::${categoryName}::${subcategoryName}`] = {
        name: editNameInput.trim() || subcategoryName,
        value: parsedVal,
        is_fixed: editIsFixedInput
      }
      localStorage.setItem('leaomed_custom_budget_edits_v2', JSON.stringify(map))
    } catch (_) {}

    setEditingItem(null)
  }

  // Excluir Item
  const handleDeleteItem = () => {
    if (!editingItem) return
    const { scope, categoryName, subcategoryName } = editingItem

    const updateState = (setter: React.Dispatch<React.SetStateAction<CategoryGroup[]>>) => {
      setter(prev => prev.map(cat => {
        if (cat.name === categoryName) {
          const filteredSubs = cat.subcategories.filter(s => s.name !== subcategoryName)
          const newTotal = filteredSubs.reduce((acc, s) => acc + s.value, 0)
          return { ...cat, total: newTotal, subcategories: filteredSubs }
        }
        return cat
      }))
    }

    if (scope === 'EXPENSE_PF') updateState(setExpensePFCats)
    else if (scope === 'EXPENSE_PJ') updateState(setExpensePJCats)
    else if (scope === 'INCOME_PJ') updateState(setIncomePJCats)
    else if (scope === 'INCOME_PF') updateState(setIncomePFCats)

    try {
      const stored = localStorage.getItem('leaomed_deleted_budget_items')
      const deletedList: string[] = stored ? JSON.parse(stored) : []
      const key = `${scope}::${categoryName}::${subcategoryName}`
      if (!deletedList.includes(key)) {
        deletedList.push(key)
        localStorage.setItem('leaomed_deleted_budget_items', JSON.stringify(deletedList))
      }
    } catch (_) {}

    setEditingItem(null)
    setIsConfirmingDelete(false)
  }

  const expandAll = () => {
    const allExp: Record<string, boolean> = {}
    currentCategoryList.forEach(c => { allExp[c.name] = true })
    setExpandedCategories(allExp)
  }

  const collapseAll = () => {
    setExpandedCategories({})
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="font-display text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Planilha Orçamentária Oficial
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" /> Rigorosamente Segregada (PF vs PJ)
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Dados organizados em abas independentes para Pessoa Física e Jurídica. Clique sobre qualquer valor para editar diretamente na planilha.
            </p>
          </div>

          {/* Botões de Ação Rápida */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
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

        {/* ========================================================================= */}
        {/* SELETOR DE ABAS PRINCIPAIS: SEGREGAÇÃO ESTRITA ENTRE PF E PJ */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 shadow-inner relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            {/* Aba 1: Despesas PF (Exibida no filtro PF ou Consolidado) */}
            {(currentFilter === 'CONSOLIDATED' || currentFilter === 'PF') && (
              <button
                onClick={() => setActiveScopeTab('EXPENSE_PF')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                  activeScopeTab === 'EXPENSE_PF'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-white" />
                <span>Despesas PF (Pessoa Física)</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  activeScopeTab === 'EXPENSE_PF' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}>
                  R$ {totalExpensePF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </button>
            )}

            {/* Aba 2: Despesas PJ (Exibida no filtro PJ ou Consolidado) */}
            {(currentFilter === 'CONSOLIDATED' || currentFilter === 'PJ') && (
              <button
                onClick={() => setActiveScopeTab('EXPENSE_PJ')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                  activeScopeTab === 'EXPENSE_PJ'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 text-white" />
                <span>Despesas PJ (Empresa)</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  activeScopeTab === 'EXPENSE_PJ' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}>
                  R$ {totalExpensePJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </button>
            )}

            {/* Aba 3: Receitas PJ (Exibida no filtro PJ ou Consolidado) */}
            {(currentFilter === 'CONSOLIDATED' || currentFilter === 'PJ') && (
              <button
                onClick={() => setActiveScopeTab('INCOME_PJ')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                  activeScopeTab === 'INCOME_PJ'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-white" />
                <span>Receitas PJ (Faturamento)</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  activeScopeTab === 'INCOME_PJ' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}>
                  R$ {totalIncomePJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </button>
            )}

            {/* Aba 4: Receitas PF (Exibida no filtro PF ou Consolidado) */}
            {(currentFilter === 'CONSOLIDATED' || currentFilter === 'PF') && (
              <button
                onClick={() => setActiveScopeTab('INCOME_PF')}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                  activeScopeTab === 'INCOME_PF'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                }`}
              >
                <Coins className="w-4 h-4 text-white" />
                <span>Receitas PF (Pró-labore & Entradas)</span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                  activeScopeTab === 'INCOME_PF' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}>
                  R$ {totalIncomePF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </button>
            )}
          </div>

          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Valores editáveis ao clicar</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BANNER INFORMATIVO ESPECÍFICO DO ESCOPO SELECIONADO */}
        {/* ========================================================================= */}
        {activeScopeTab === 'EXPENSE_PF' && (
          <div className="mb-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/80 p-4 md:p-5 relative z-10 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-3">
              <div className="flex items-center gap-2.5 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl">
                <span className="h-3 w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Despesas Obrigatórias (Fixas)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-sm md:text-base font-black text-slate-900 dark:text-white tabular-nums">
                      R$ {totalObligatoryPF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">
                      ({totalExpensePF > 0 ? ((totalObligatoryPF / totalExpensePF) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-purple-500/10 border border-purple-500/20 px-3 py-2 rounded-xl">
                <span className="h-3 w-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Despesas Não Obrigatórias (Variáveis)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-sm md:text-base font-black text-slate-900 dark:text-white tabular-nums">
                      R$ {(totalExpensePF - totalObligatoryPF).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-xs">
                      ({totalExpensePF > 0 ? (((totalExpensePF - totalObligatoryPF) / totalExpensePF) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-white/10 sm:pl-4">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Total Despesas PF</span>
                <span className="font-mono text-base md:text-lg font-black text-slate-900 dark:text-white tabular-nums">
                  R$ {totalExpensePF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Barra de Progresso Bicolor */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-700 shadow-sm"
                style={{ width: `${totalExpensePF > 0 ? (totalObligatoryPF / totalExpensePF) * 100 : 0}%` }}
              />
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-700 shadow-sm"
                style={{ width: `${totalExpensePF > 0 ? ((totalExpensePF - totalObligatoryPF) / totalExpensePF) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-2 px-1">
              <span>Fixas/Essenciais: Transporte, Casa, Financiamento, Saúde...</span>
              <span>Flexíveis: Compras, Lazer, Viagens, Restaurantes...</span>
            </div>
          </div>
        )}

        {activeScopeTab === 'EXPENSE_PJ' && (
          <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 md:p-5 relative z-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                Custos Operacionais & Tributários da Empresa Médica PJ
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Impostos do Simples Nacional / DAS (INSS, ISS, DARF, COFINS, IRPJ, CSLL, PIS) e Mensalidade Contábil.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Despesas PJ</span>
              <span className="font-mono text-base md:text-lg font-black text-indigo-700 dark:text-indigo-300 tabular-nums">
                R$ {totalExpensePJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {activeScopeTab === 'INCOME_PJ' && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 md:p-5 relative z-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                Faturamento Bruto da Empresa PJ
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {isDemo 
                  ? 'Faturamento gerado por plantões hospitalares e contratos de convênios médicos.' 
                  : 'Faturamento bruto da PJ (Camarinha BRUTO) auditado na planilha oficial.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Faturamento Bruto</span>
              <span className="font-mono text-base md:text-lg font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                R$ {totalIncomePJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {activeScopeTab === 'INCOME_PF' && (
          <div className="mb-6 rounded-2xl border border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20 p-4 md:p-5 relative z-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
                Renda Pessoa Física (Pró-labore & Entradas)
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {isDemo 
                  ? 'Retiradas de pró-labore da clínica médica, consultas particulares e proventos de investimentos.' 
                  : 'Pró-labore retirado da PJ (Camarinha), reembolsos médicos e rendimentos de investimentos da PF.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Receitas PF</span>
              <span className="font-mono text-base md:text-lg font-black text-teal-700 dark:text-teal-300 tabular-nums">
                R$ {totalIncomePF.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BARRA DE FILTROS INTERNOS E CAMPO DE BUSCA */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 relative z-10">
          {/* Sub-filtro para despesas PF */}
          {activeScopeTab === 'EXPENSE_PF' ? (
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-semibold shadow-xs">
              <button
                onClick={() => setExpenseFilterTab('ALL')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                  expenseFilterTab === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas ({expensePFCats.length})
              </button>
              <button
                onClick={() => setExpenseFilterTab('OBRIGATORIAS')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                  expenseFilterTab === 'OBRIGATORIAS'
                    ? 'bg-blue-600 text-white font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Obrigatórias ({expensePFCats.filter(c => c.is_obligatory).length})
              </button>
              <button
                onClick={() => setExpenseFilterTab('NAO_OBRIGATORIAS')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg active:scale-[0.98] transition-all cursor-pointer ${
                  expenseFilterTab === 'NAO_OBRIGATORIAS'
                    ? 'bg-purple-600 text-white font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Não Obrigatórias ({expensePFCats.filter(c => !c.is_obligatory).length})
              </button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>{filteredCategories.length} categorias listadas no escopo</span>
            </div>
          )}

          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar item ou subcategoria na planilha..."
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

        {/* ========================================================================= */}
        {/* GRID DE CATEGORIAS DO ESCOPO SELECIONADO */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {filteredCategories.map((cat) => {
            const Icon = cat.icon
            const isExpanded = expandedCategories[cat.name] ?? false
            const currentScopeTotal = activeScopeTab === 'EXPENSE_PF' 
              ? totalExpensePF 
              : activeScopeTab === 'EXPENSE_PJ' 
              ? totalExpensePJ 
              : activeScopeTab === 'INCOME_PJ' 
              ? totalIncomePJ 
              : totalIncomePF
            const catPct = currentScopeTotal > 0 ? (cat.total / currentScopeTotal) * 100 : 0

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
                        {activeScopeTab === 'EXPENSE_PF' && (
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              cat.is_obligatory
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
                                : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {cat.is_obligatory ? 'Obrigatória' : 'Não Obrigatória'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{cat.subcategories.length} itens</span>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{catPct.toFixed(1)}% do escopo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className={`font-mono text-sm md:text-base font-extrabold tabular-nums block ${
                        activeScopeTab.startsWith('INCOME') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}>
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
                      style={{ width: `${Math.min(100, Math.max(2, catPct * 1.5))}%` }}
                    />
                  </div>
                </div>

                {/* Subcategorias Expandidas (Com clique direto para edição) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-white/5 bg-slate-100/60 dark:bg-slate-900/60 p-3.5 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 flex justify-between">
                      <span>Item / Subcategoria</span>
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

                          {/* VALOR CLICÁVEL PARA EDIÇÃO DIRETA E BOTÃO DE EXCLUIR */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingItem({
                                  scope: activeScopeTab,
                                  categoryName: cat.name,
                                  subcategoryName: sub.name,
                                  currentValue: sub.value,
                                  isFixed: !!sub.is_fixed
                                })
                                setEditValueInput(sub.value.toFixed(2))
                                setEditNameInput(sub.name)
                                setEditIsFixedInput(!!sub.is_fixed)
                                setIsConfirmingDelete(false)
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer group/val"
                              title="Clique para editar este valor na planilha"
                            >
                              <span className={`font-mono font-bold tabular-nums group-hover/val:text-emerald-600 dark:group-hover/val:text-emerald-400 ${
                                activeScopeTab.startsWith('INCOME') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                              }`}>
                                R$ {sub.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <Edit2 className="w-3 h-3 text-slate-400 group-hover/val:text-emerald-500 transition-colors opacity-60 group-hover/val:opacity-100" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingItem({
                                  scope: activeScopeTab,
                                  categoryName: cat.name,
                                  subcategoryName: sub.name,
                                  currentValue: sub.value,
                                  isFixed: !!sub.is_fixed
                                })
                                setEditValueInput(sub.value.toFixed(2))
                                setEditNameInput(sub.name)
                                setEditIsFixedInput(!!sub.is_fixed)
                                setIsConfirmingDelete(true)
                              }}
                              className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Excluir este item da planilha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* ========================================================================= */}
      {/* MODAL DE EDIÇÃO DIRETA DE VALOR DE SUBCATEGORIA */}
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
                    Editar Item da Planilha
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {editingItem.categoryName} ({editingItem.scope.replace('_', ' ')})
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
                  Nome do Item / Subcategoria
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

              {editingItem.scope.startsWith('EXPENSE') && (
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

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 px-2.5 py-1.5 rounded-xl">
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Excluir item?</span>
                    <button
                      type="button"
                      onClick={handleDeleteItem}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
                    >
                      Sim, Excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Excluir este item da planilha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Item</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Novo Lançamento Rápido */}
      <QuickTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        initialType={activeScopeTab.startsWith('INCOME') ? 'INCOME' : 'EXPENSE'}
      />
    </section>
  )
}
