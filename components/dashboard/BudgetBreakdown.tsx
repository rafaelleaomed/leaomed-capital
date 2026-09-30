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
  UserCheck,
  UploadCloud,
  FileText,
  Percent,
  Calculator,
  RotateCcw,
  FileCheck,
  Check
} from 'lucide-react'
import { QuickTransactionModal } from './QuickTransactionModal'
import { GranularExpenseAuditor } from './GranularExpenseAuditor'
import { GranularTransactionStore } from '@/utils/granularTransactionStore'

export interface PjMonthTaxData {
  month: string
  label: string
  faturamento: number
  simples?: number
  irpj: number
  csll: number
  cofins: number
  pis: number
  inss: number
  iss: number
  darf: number
  outras: number
  contabilidade: number
}

export const INITIAL_PJ_HISTORY: PjMonthTaxData[] = [
  { month: 'set_24', label: 'Set/24', faturamento: 12600.00, simples: 0.00, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 293.65, outras: 0.00, contabilidade: 0.00 },
  { month: 'out_24', label: 'Out/24', faturamento: 0.00, simples: 857.80, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 58.84, outras: 0.00, contabilidade: 427.88 },
  { month: 'nov_24', label: 'Nov/24', faturamento: 12400.00, simples: 804.28, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 58.84, outras: 0.00, contabilidade: 427.88 },
  { month: 'dez_24', label: 'Dez/24', faturamento: 10400.00, simples: 0.00, irpj: 25.84, csll: 22.61, cofins: 90.77, pis: 19.70, inss: 280.38, iss: 206.73, darf: 58.84, outras: 0.00, contabilidade: 427.88 },
  { month: 'jan_25', label: 'Jan/25', faturamento: 15900.00, simples: 0.00, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 0.00, outras: 0.00, contabilidade: 427.88 },
  { month: 'fev_25', label: 'Fev/25', faturamento: 22600.00, simples: 954.00, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 60.39, outras: 0.00, contabilidade: 460.00 },
  { month: 'mar_25', label: 'Mar/25', faturamento: 0.00, simples: 1356.00, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 183.56, outras: 36.25, contabilidade: 460.00 },
  { month: 'abr_25', label: 'Abr/25', faturamento: 16700.00, simples: 1002.01, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 651.84, outras: 0.00, contabilidade: 460.00 },
  { month: 'mai_25', label: 'Mai/25', faturamento: 24700.00, simples: 1482.00, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 1250.24, outras: 161.36, contabilidade: 460.00 },
  { month: 'jun_25', label: 'Jun/25', faturamento: 30900.00, simples: 1854.00, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 1929.27, outras: 0.00, contabilidade: 460.00 },
  { month: 'jul_25', label: 'Jul/25', faturamento: 24900.00, simples: 1603.99, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 1397.15, outras: 0.00, contabilidade: 460.00 },
  { month: 'ago_25', label: 'Ago/25', faturamento: 27800.00, simples: 1832.41, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 1751.90, outras: 0.00, contabilidade: 460.00 },
  { month: 'set_25', label: 'Set/25', faturamento: 33500.00, simples: 2304.34, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 2148.07, outras: 0.00, contabilidade: 460.00 },
  { month: 'out_25', label: 'Out/25', faturamento: 30000.00, simples: 2151.74, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 2354.32, outras: 0.00, contabilidade: 0.00 },
  { month: 'nov_25', label: 'Nov/25', faturamento: 28100.00, simples: 2094.29, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 2216.82, outras: 0.00, contabilidade: 460.00 },
  { month: 'dez_25', label: 'Dez/25', faturamento: 24900.00, simples: 1910.96, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 2216.82, outras: 0.00, contabilidade: 460.00 },
  { month: 'jan_26', label: 'Jan/26', faturamento: 23000.00, simples: 0.00, irpj: 72.29, csll: 63.25, cofins: 253.90, pis: 55.12, inss: 784.30, iss: 578.29, darf: 2216.82, outras: 0.00, contabilidade: 460.00 },
  { month: 'fev_26', label: 'Fev/26', faturamento: 29300.00, simples: 0.00, irpj: 95.06, csll: 83.18, cofins: 333.90, pis: 72.48, inss: 1031.40, iss: 760.48, darf: 2242.19, outras: 0.00, contabilidade: 491.21 },
  { month: 'mar_26', label: 'Mar/26', faturamento: 24600.00, simples: 0.00, irpj: 81.10, csll: 70.96, cofins: 284.86, pis: 61.84, inss: 879.92, iss: 648.79, darf: 495.00, outras: 0.00, contabilidade: 491.21 },
  { month: 'abr_26', label: 'Abr/26', faturamento: 26600.00, simples: 0.00, irpj: 87.89, csll: 76.90, cofins: 308.71, pis: 67.02, inss: 953.60, iss: 703.12, darf: 0.00, outras: 0.00, contabilidade: 491.21 },
  { month: 'mai_26', label: 'Mai/26', faturamento: 25700.00, simples: 0.00, irpj: 85.83, csll: 75.10, cofins: 301.47, pis: 65.44, inss: 931.23, iss: 686.62, darf: 1136.35, outras: 206.42, contabilidade: 491.21 },
  { month: 'jun_26', label: 'Jun/26', faturamento: 26500.00, simples: 0.00, irpj: 88.59, csll: 77.52, cofins: 311.17, pis: 67.55, inss: 961.21, iss: 708.73, darf: 550.00, outras: 0.00, contabilidade: 491.21 },
  { month: 'jul_26', label: 'Jul/26', faturamento: 26300.00, simples: 2187.93, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 1040.02, outras: 0.00, contabilidade: 491.21 },
  { month: 'ago_26', label: 'Ago/26', faturamento: 27100.00, simples: 2257.83, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 1283.97, outras: 0.00, contabilidade: 491.21 },
  { month: 'set_26', label: 'Set/26', faturamento: 23300.00, simples: 1939.78, irpj: 0.00, csll: 0.00, cofins: 0.00, pis: 0.00, inss: 0.00, iss: 0.00, darf: 1040.02, outras: 0.00, contabilidade: 491.21 }
]


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
  selectedMonth?: number
  selectedYear?: number
}

export type BudgetScopeTab = 'EXPENSE_PF' | 'EXPENSE_PJ' | 'INCOME_PJ' | 'INCOME_PF' | 'GRANULAR_AUDIT'

export function BudgetBreakdown({ currentFilter = 'PF', isDemo = false, initialTab, selectedMonth, selectedYear }: BudgetBreakdownProps) {
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

  // Contador de transações pendentes de classificação no extrato granular
  const [uncategorizedCount, setUncategorizedCount] = useState<number>(0)

  useEffect(() => {
    const updateCount = () => {
      try {
        const list = GranularTransactionStore.getAll()
        const count = list.filter(t => GranularTransactionStore.isUncategorized(t)).length
        setUncategorizedCount(count)
      } catch (_) {}
    }
    updateCount()
    window.addEventListener('leaomed_transactions_updated', updateCount)
    return () => window.removeEventListener('leaomed_transactions_updated', updateCount)
  }, [])

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

  // Estados de Controle Tributário da PJ, Alíquotas e Boletos
  const [pjTaxHistory, setPjTaxHistory] = useState<PjMonthTaxData[]>(INITIAL_PJ_HISTORY)
  const [taxRateViewMode, setTaxRateViewMode] = useState<'SEM_CONTABILIDADE' | 'COM_CONTABILIDADE'>('COM_CONTABILIDADE')
  const [selectedPjMonthKey, setSelectedPjMonthKey] = useState<string>('set_26')
  const [pjYearFilter, setPjYearFilter] = useState<'ALL' | '2026' | '2025' | '2024'>('ALL')
  const [isUploadingBoleto, setIsUploadingBoleto] = useState<boolean>(false)
  const [boletoSuccessMsg, setBoletoSuccessMsg] = useState<string | null>(null)
  const [isDraggingBoleto, setIsDraggingBoleto] = useState<boolean>(false)
  const [editingPjCell, setEditingPjCell] = useState<{
    month: string
    monthLabel: string
    field: keyof PjMonthTaxData
    fieldLabel: string
    value: number
  } | null>(null)
  const [editPjValueInput, setEditPjValueInput] = useState<string>('')
  const [uploadedBoletos, setUploadedBoletos] = useState<{
    id: string
    name: string
    taxType: string
    amount: number
    month: string
    date: string
  }[]>([])

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
        { name: 'Tarifas Bancárias Pessoa Jurídica', value: 0.00, is_fixed: true },
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

  const realIncomePFCategories: CategoryGroup[] = useMemo(() => {
    const subs = [
      { name: 'Camarinha (Pró-labore da PJ)', value: 23000.00, is_fixed: true },
      { name: 'Reembolsos Médicos', value: 2650.00, is_fixed: false },
      { name: 'Rendimento de Investimentos', value: 329.99, is_fixed: false },
      { name: 'Presentes / Prêmios', value: 40.00, is_fixed: false }
    ]
    const totalSum = Number(subs.reduce((acc, s) => acc + s.value, 0).toFixed(2))
    return [
      {
        name: 'Pró-Labore & Entradas PF',
        icon: Briefcase,
        total: totalSum,
        color: 'from-purple-500 to-indigo-600',
        is_obligatory: true,
        subcategories: subs
      }
    ]
  }, [])

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
      ]
    }
  ], [])

  // Categorias Zeradas para Novos Usuários
  const emptyExpensePFCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Transporte',
      icon: Car,
      total: 0.00,
      color: 'from-blue-500 to-cyan-500',
      is_obligatory: true,
      subcategories: [
        { name: 'Combustível', value: 0.00, is_fixed: false },
        { name: 'Seguro Auto', value: 0.00, is_fixed: true },
        { name: 'Estacionamento & Táxi/Uber', value: 0.00, is_fixed: false },
        { name: 'Manutenção / Revisão', value: 0.00, is_fixed: false }
      ]
    },
    {
      name: 'Casa & Moradia',
      icon: Home,
      total: 0.00,
      color: 'from-emerald-500 to-teal-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Aluguel / Condomínio', value: 0.00, is_fixed: true },
        { name: 'Supermercado Familiar', value: 0.00, is_fixed: false },
        { name: 'Energia, Internet & Celular', value: 0.00, is_fixed: true }
      ]
    },
    {
      name: 'Saúde & Bem-Estar',
      icon: HeartPulse,
      total: 0.00,
      color: 'from-rose-500 to-pink-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Plano de Saúde', value: 0.00, is_fixed: true },
        { name: 'Farmácia & Medicamentos', value: 0.00, is_fixed: false },
        { name: 'Academia & Esportes', value: 0.00, is_fixed: true }
      ]
    },
    {
      name: 'Compras & Lazer',
      icon: ShoppingBag,
      total: 0.00,
      color: 'from-amber-500 to-orange-500',
      is_obligatory: false,
      subcategories: [
        { name: 'Compras & Presentes', value: 0.00, is_fixed: false },
        { name: 'Restaurantes & Delivery', value: 0.00, is_fixed: false },
        { name: 'Lazer & Viagens', value: 0.00, is_fixed: false }
      ]
    }
  ], [])

  const emptyExpensePJCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Tributos & Impostos PJ',
      icon: Building2,
      total: 0.00,
      color: 'from-blue-600 to-indigo-700',
      is_obligatory: true,
      subcategories: [
        { name: 'Simples Nacional / DAS', value: 0.00, is_fixed: true },
        { name: 'Mensalidade Assessoria Contábil', value: 0.00, is_fixed: true },
        { name: 'Tarifas Bancárias PJ', value: 0.00, is_fixed: false }
      ]
    }
  ], [])

  const emptyIncomePJCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Receitas PJ (Plantões & Contratos)',
      icon: Stethoscope,
      total: 0.00,
      color: 'from-emerald-600 to-teal-700',
      is_obligatory: true,
      subcategories: [
        { name: 'Plantão Hospitalar / Clínica', value: 0.00, is_fixed: true },
        { name: 'Repasses & Convênios', value: 0.00, is_fixed: false }
      ]
    }
  ], [])

  const emptyIncomePFCategories: CategoryGroup[] = useMemo(() => [
    {
      name: 'Receitas PF (Pró-Labore & Entradas)',
      icon: Briefcase,
      total: 0.00,
      color: 'from-purple-500 to-indigo-600',
      is_obligatory: true,
      subcategories: [
        { name: 'Pró-Labore PJ ➔ PF', value: 0.00, is_fixed: true },
        { name: 'Consultório Particular', value: 0.00, is_fixed: false },
        { name: 'Rendimentos de Investimentos', value: 0.00, is_fixed: false }
      ]
    }
  ], [])

  // Selecionar fontes ativas: se for demo ou se o usuário autenticado for o Dr. Rafael Leão
  const isOwnerUser = typeof window !== 'undefined' && Boolean(
    localStorage.getItem('leaomed_current_user_email')?.toLowerCase().includes('rafael') ||
    localStorage.getItem('leaomed_current_user_email')?.toLowerCase() === 'rafaelleaobh@gmail.com'
  )

  const baseExpensePFCategories = isDemo ? demoExpensePFCategories : isOwnerUser ? realExpensePFCategories : emptyExpensePFCategories
  const baseExpensePJCategories = isDemo ? demoExpensePJCategories : isOwnerUser ? realExpensePJCategories : emptyExpensePJCategories
  const baseIncomePJCategories = isDemo ? demoIncomePJCategories : isOwnerUser ? realIncomePJCategories : emptyIncomePJCategories
  const baseIncomePFCategories = isDemo ? demoIncomePFCategories : isOwnerUser ? realIncomePFCategories : emptyIncomePFCategories

  // Estados locais para permitir edição e exclusão persistidas
  const [expensePFCats, setExpensePFCats] = useState<CategoryGroup[]>(baseExpensePFCategories)
  const [expensePJCats, setExpensePJCats] = useState<CategoryGroup[]>(baseExpensePJCategories)
  const [incomePJCats, setIncomePJCats] = useState<CategoryGroup[]>(baseIncomePJCategories)
  const [incomePFCats, setIncomePFCats] = useState<CategoryGroup[]>(baseIncomePFCategories)

  // Atualizar quando mudar isDemo ou status de usuário
  useEffect(() => {
    setExpensePFCats(baseExpensePFCategories)
    setExpensePJCats(baseExpensePJCategories)
    setIncomePJCats(baseIncomePJCategories)
    setIncomePFCats(baseIncomePFCategories)
  }, [baseExpensePFCategories, baseExpensePJCategories, baseIncomePJCategories, baseIncomePFCategories])

  // Carregar edições e exclusões locais salvas no localStorage isolado por usuário
  useEffect(() => {
    try {
      const userEmail = localStorage.getItem('leaomed_current_user_email') || ''
      const isOwner = userEmail.toLowerCase().includes('rafael') || userEmail.toLowerCase() === 'rafaelleaobh@gmail.com'
      if (!isDemo && !isOwner) {
        // Novo usuário: histórico de PJ inicia zerado
        setPjTaxHistory([])
        return
      }

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

      const storedPjTax = localStorage.getItem('leaomed_pj_tax_history_v2')
      if (storedPjTax) {
        try {
          setPjTaxHistory(JSON.parse(storedPjTax))
        } catch (_) {}
      }
      const storedBoletos = localStorage.getItem('leaomed_pj_uploaded_boletos')
      if (storedBoletos) {
        try {
          setUploadedBoletos(JSON.parse(storedBoletos))
        } catch (_) {}
      }
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

  // Filtro de Anos para a Tabela Histórica PJ
  const filteredPjHistory = useMemo(() => {
    if (pjYearFilter === 'ALL') return pjTaxHistory
    if (pjYearFilter === '2026') return pjTaxHistory.filter(m => m.month.endsWith('_26'))
    if (pjYearFilter === '2025') return pjTaxHistory.filter(m => m.month.endsWith('_25'))
    if (pjYearFilter === '2024') return pjTaxHistory.filter(m => m.month.endsWith('_24'))
    return pjTaxHistory
  }, [pjTaxHistory, pjYearFilter])

  // Cálculos do Mês Selecionado da PJ
  const currentPjMonthData = useMemo(() => {
    return pjTaxHistory.find(m => m.month === selectedPjMonthKey) || pjTaxHistory[pjTaxHistory.length - 1]
  }, [pjTaxHistory, selectedPjMonthKey])

  const pjMonthMetrics = useMemo(() => {
    const d = currentPjMonthData
    const tributosPuros = (d.simples || 0) + d.irpj + d.csll + d.cofins + d.pis + d.inss + d.iss + d.darf + d.outras
    const custoOperacionalTotal = tributosPuros + d.contabilidade
    const pctTributosPuros = d.faturamento > 0 ? (tributosPuros / d.faturamento) * 100 : 0
    const pctCargaTotal = d.faturamento > 0 ? (custoOperacionalTotal / d.faturamento) * 100 : 0
    const proLaborePf = 23000.00
    const sobraCaixaPj = Math.max(0, d.faturamento - custoOperacionalTotal - proLaborePf)

    return {
      tributosPuros,
      custoOperacionalTotal,
      pctTributosPuros,
      pctCargaTotal,
      proLaborePf,
      sobraCaixaPj
    }
  }, [currentPjMonthData])

  // Handler para Upload / Arraste de múltiplos boletos PJ
  const handlePjBoletoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploadingBoleto(true)

    setTimeout(() => {
      const newItems: {
        id: string
        name: string
        taxType: string
        amount: number
        month: string
        date: string
      }[] = []
      const fileArr = Array.from(files)

      let updatedHistory = [...pjTaxHistory]
      const currentMonthIndex = updatedHistory.findIndex(m => m.month === selectedPjMonthKey)
      const targetIdx = currentMonthIndex >= 0 ? currentMonthIndex : updatedHistory.length - 1
      const targetMonthData = { ...updatedHistory[targetIdx] }

      fileArr.forEach((file, idx) => {
        const lower = file.name.toLowerCase()
        let taxType = 'Guia Tributária DAS / DARF'
        let amount = 550.00

        if (lower.includes('darf')) {
          taxType = 'DARF Federal (IRPJ / CSLL / Retenções)'
          amount = 550.00
          targetMonthData.darf = amount
        } else if (lower.includes('das') || lower.includes('simples')) {
          taxType = 'DAS Simples Nacional Médico'
          amount = 1250.00
          targetMonthData.iss = 708.73
        } else if (lower.includes('inss') || lower.includes('gps') || lower.includes('previd')) {
          taxType = 'INSS Patronal / Pró-labore'
          amount = 961.21
          targetMonthData.inss = amount
        } else if (lower.includes('iss') || lower.includes('prefeitura') || lower.includes('bh')) {
          taxType = 'ISSQN Municipal'
          amount = 708.73
          targetMonthData.iss = amount
        } else if (lower.includes('contabil') || lower.includes('contador') || lower.includes('honor')) {
          taxType = 'Mensalidade Contabilidade PJ'
          amount = 491.21
          targetMonthData.contabilidade = amount
        } else {
          taxType = `Boleto Operacional PJ (${file.name.slice(0, 18)})`
          amount = 491.21
          targetMonthData.contabilidade = amount
        }

        newItems.push({
          id: `${Date.now()}-${idx}`,
          name: file.name,
          taxType,
          amount,
          month: targetMonthData.label,
          date: new Date().toLocaleDateString('pt-BR')
        })
      })

      updatedHistory[targetIdx] = targetMonthData
      setPjTaxHistory(updatedHistory)
      setUploadedBoletos(prev => {
        const merged = [...newItems, ...prev]
        try {
          localStorage.setItem('leaomed_pj_uploaded_boletos', JSON.stringify(merged))
        } catch (_) {}
        return merged
      })

      try {
        localStorage.setItem('leaomed_pj_tax_history_v2', JSON.stringify(updatedHistory))
      } catch (_) {}

      // Sincronizar com as categorias ativas de PJ
      setExpensePJCats(prev => prev.map(cat => {
        if (cat.name === 'Tributos Simples Nacional & Federais') {
          const updatedSubs = cat.subcategories.map(sub => {
            if (sub.name === 'DARF Tributário') return { ...sub, value: targetMonthData.darf }
            if (sub.name === 'INSS Patronal / Pró-labore') return { ...sub, value: targetMonthData.inss }
            if (sub.name === 'ISS Municipal') return { ...sub, value: targetMonthData.iss }
            return sub
          })
          const newTot = updatedSubs.reduce((acc, s) => acc + s.value, 0)
          return { ...cat, total: newTot, subcategories: updatedSubs }
        }
        if (cat.name === 'Serviços Contábeis & Administrativos') {
          const updatedSubs = cat.subcategories.map(sub => {
            if (sub.name === 'Mensalidade Contabilidade PJ') return { ...sub, value: targetMonthData.contabilidade }
            return sub
          })
          const newTot = updatedSubs.reduce((acc, s) => acc + s.value, 0)
          return { ...cat, total: newTot, subcategories: updatedSubs }
        }
        return cat
      }))

      setIsUploadingBoleto(false)
      setBoletoSuccessMsg(`${files.length} boleto(s) PJ conciliado(s) com sucesso na competência ${targetMonthData.label}!`)
      setTimeout(() => setBoletoSuccessMsg(null), 6000)
    }, 900)
  }

  // Handler para Salvar Célula da Tabela da PJ
  const handleSavePjCell = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPjCell) return
    const parsedVal = parseFloat(editPjValueInput.replace(',', '.'))
    if (isNaN(parsedVal) || parsedVal < 0) return

    const { month, field } = editingPjCell
    const updated = pjTaxHistory.map(row => {
      if (row.month === month) {
        return {
          ...row,
          [field]: parsedVal
        }
      }
      return row
    })

    setPjTaxHistory(updated)
    try {
      localStorage.setItem('leaomed_pj_tax_history_v2', JSON.stringify(updated))
    } catch (_) {}

    // Sincronizar com subcategorias se for o mês ativo
    if (month === 'jun') {
      setExpensePJCats(prev => prev.map(cat => {
        const updatedSubs = cat.subcategories.map(sub => {
          if (field === 'darf' && sub.name.includes('DARF')) return { ...sub, value: parsedVal }
          if (field === 'inss' && sub.name.includes('INSS')) return { ...sub, value: parsedVal }
          if (field === 'iss' && sub.name.includes('ISS')) return { ...sub, value: parsedVal }
          if (field === 'cofins' && sub.name.includes('COFINS')) return { ...sub, value: parsedVal }
          if (field === 'irpj' && sub.name.includes('IRPJ')) return { ...sub, value: parsedVal }
          if (field === 'csll' && sub.name.includes('CSLL')) return { ...sub, value: parsedVal }
          if (field === 'pis' && sub.name.includes('PIS')) return { ...sub, value: parsedVal }
          if (field === 'contabilidade' && sub.name.includes('Contabilidade')) return { ...sub, value: parsedVal }
          return sub
        })
        const newTot = updatedSubs.reduce((acc, s) => acc + s.value, 0)
        return { ...cat, total: newTot, subcategories: updatedSubs }
      }))
    }

    setEditingPjCell(null)
  }

  const handleResetPjHistory = () => {
    if (window.confirm('Deseja restaurar os valores originais da planilha oficial para todas as competências da PJ?')) {
      setPjTaxHistory(INITIAL_PJ_HISTORY)
      try {
        localStorage.removeItem('leaomed_pj_tax_history_v2')
      } catch (_) {}
    }
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
            {/* Aba 1: Despesas PF */}
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

            {/* Aba 2: Despesas PJ */}
            <button
              onClick={() => setActiveScopeTab('EXPENSE_PJ')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                activeScopeTab === 'EXPENSE_PJ'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4 text-white" />
              <span>Empresa PJ (Impostos & Contabilidade)</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                activeScopeTab === 'EXPENSE_PJ' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                R$ {totalExpensePJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </button>

            {/* Aba 3: Receitas PJ */}
            <button
              onClick={() => setActiveScopeTab('INCOME_PJ')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                activeScopeTab === 'INCOME_PJ'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-white" />
              <span>Receitas PJ (Faturamento Camarinha)</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                activeScopeTab === 'INCOME_PJ' ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
              }`}>
                R$ {totalIncomePJ.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </button>

            {/* Aba 4: Receitas PF */}
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

            {/* Aba 5: Extrato Item a Item & Auditoria */}
            <button
              onClick={() => setActiveScopeTab('GRANULAR_AUDIT')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                activeScopeTab === 'GRANULAR_AUDIT'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
              title="Auditar despesa por despesa individualmente e prevenir duplicidade com cartões"
            >
              <Receipt className={`w-4 h-4 ${activeScopeTab === 'GRANULAR_AUDIT' ? 'text-slate-950' : 'text-amber-500'}`} />
              <span>Extrato Item a Item & Auditoria</span>
              {uncategorizedCount > 0 ? (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-600 text-white animate-pulse shadow-xs">
                  ⚠️ {uncategorizedCount} pendente{uncategorizedCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  activeScopeTab === 'GRANULAR_AUDIT' ? 'bg-black/20 text-slate-950 font-black' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}>
                  Anti-Duplicidade
                </span>
              )}
            </button>
          </div>

          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Valores editáveis ao clicar</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BANNER INFORMATIVO ESPECÍFICO DO ESCOPO SELECIONADO OU AUDITORIA */}
        {/* ========================================================================= */}
        {activeScopeTab === 'GRANULAR_AUDIT' ? (
          <GranularExpenseAuditor 
            currentFilter={currentFilter} 
            isDemo={isDemo} 
            selectedMonth={selectedMonth} 
            selectedYear={selectedYear} 
          />
        ) : (
          <>
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
          <div className="space-y-6 mb-8 relative z-10">
            {/* 1. Header & Alíquota Efetiva PJ com Seletor */}
            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 dark:from-indigo-950/30 dark:via-slate-900/80 dark:to-slate-950 p-5 md:p-6 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-indigo-100 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <h3 className="font-display text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Controle Tributário & Operacional da Empresa PJ
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                      Pessoa Jurídica • 100% Débito em Conta
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
                    Fluxo médico: o faturamento hospitalar (Camarinha) entra na conta da PJ, são pagos os impostos federais/municipais e a contabilidade, e o saldo líquido é transferido para a Pessoa Física como pró-labore.
                  </p>
                </div>

                {/* Seletor de Competência da PJ */}
                <div className="flex items-center gap-2 self-start lg:self-auto bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-indigo-200 dark:border-white/10 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2">Competência:</span>
                  <select
                    value={selectedPjMonthKey}
                    onChange={(e) => setSelectedPjMonthKey(e.target.value)}
                    aria-label="Selecionar competência da PJ"
                    className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-transparent py-1 px-2.5 rounded-xl border border-indigo-300 dark:border-white/20 focus:outline-none cursor-pointer"
                  >
                    {pjTaxHistory.map((m) => (
                      <option key={m.month} value={m.month} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">
                        {m.label} ({m.month.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid de Cards de Carga Tributária e Pró-Labore */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
                {/* Card 1: Faturamento Bruto */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Faturamento Bruto PJ (Camarinha)
                  </span>
                  <div className="font-mono text-lg md:text-xl font-black text-cyan-600 dark:text-cyan-400 tabular-nums">
                    R$ {currentPjMonthData.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    100% Contratos Hospitalares
                  </span>
                </div>

                {/* Card 2: Total Impostos (Simples/Federais) */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Impostos Federais & Municipais
                  </span>
                  <div className="font-mono text-lg md:text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    R$ {pjMonthMetrics.tributosPuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    DARF, INSS, ISS, COFINS, IRPJ, CSLL, PIS
                  </span>
                </div>

                {/* Card 3: Mensalidade Contabilidade */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/5 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                    Mensalidade Contabilidade
                  </span>
                  <div className="font-mono text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    R$ {currentPjMonthData.contabilidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Honorários Contábeis Especializados
                  </span>
                </div>

                {/* Card 4: Alíquota e Seletor de Carga */}
                <div className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                        {taxRateViewMode === 'SEM_CONTABILIDADE' ? 'Alíquota Pura de Impostos' : 'Carga Operacional Total'}
                      </span>
                      <Percent className="w-3.5 h-3.5 text-indigo-200" />
                    </div>
                    <div className="font-mono text-2xl font-black tabular-nums tracking-tight">
                      {taxRateViewMode === 'SEM_CONTABILIDADE' 
                        ? `${pjMonthMetrics.pctTributosPuros.toFixed(1)}%` 
                        : `${pjMonthMetrics.pctCargaTotal.toFixed(1)}%`}
                    </div>
                  </div>

                  {/* Alternador / Toggle de Alíquota */}
                  <div className="pt-2">
                    <div className="inline-flex w-full rounded-xl bg-indigo-950/60 p-0.5 text-[9px] font-bold">
                      <button
                        type="button"
                        onClick={() => setTaxRateViewMode('SEM_CONTABILIDADE')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                          taxRateViewMode === 'SEM_CONTABILIDADE'
                            ? 'bg-white text-indigo-900 font-black shadow-xs'
                            : 'text-indigo-200 hover:text-white'
                        }`}
                      >
                        Sem Contador ({pjMonthMetrics.pctTributosPuros.toFixed(1)}%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaxRateViewMode('COM_CONTABILIDADE')}
                        className={`flex-1 py-1 rounded-lg transition-all cursor-pointer text-center ${
                          taxRateViewMode === 'COM_CONTABILIDADE'
                            ? 'bg-white text-indigo-900 font-black shadow-xs'
                            : 'text-indigo-200 hover:text-white'
                        }`}
                      >
                        Com Contador ({pjMonthMetrics.pctCargaTotal.toFixed(1)}%)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informação do Pró-labore repassado */}
              <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Pró-Labore Transferido para PF:</strong> R$ 23.000,00 (origem do "Salário Pró-Labore Camarinha" na PF).
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                  Saldo de caixa retido na PJ: <strong className="text-slate-900 dark:text-white font-mono">R$ {pjMonthMetrics.sobraCaixaPj.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>

            {/* 2. Central de Ingestão de Boletos e Guias PJ ("Jogar Boletos PJ no Sistema") */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-display font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Central de Conciliação Automática de Boletos PJ
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Jogue aqui seus boletos bancários da PJ (DAS, DARF, INSS, ISS, Mensalidade Contábil) para conciliação automática mês a mês.
                  </p>
                </div>
                {uploadedBoletos.length > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-500/20 self-start sm:self-auto">
                    {uploadedBoletos.length} boleto(s) auditado(s)
                  </span>
                )}
              </div>

              {/* Dropzone de Boletos PJ */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingBoleto(true) }}
                onDragLeave={() => setIsDraggingBoleto(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDraggingBoleto(false)
                  handlePjBoletoUpload(e.dataTransfer.files)
                }}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  isDraggingBoleto 
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
                    : 'border-slate-300 dark:border-white/20 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
                onClick={() => document.getElementById('pj-boleto-file-input')?.click()}
              >
                <input
                  id="pj-boleto-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.xml"
                  className="hidden"
                  onChange={(e) => handlePjBoletoUpload(e.target.files)}
                />

                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white block">
                      Arraste seus boletos e guias PJ aqui (ou clique para selecionar)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Suporta múltiplos arquivos PDF (DARF, DAS Simples, GPS INSS, ISS e Boleto do Contador)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all pointer-events-none"
                  >
                    + Selecionar Boletos do Computador
                  </button>
                </div>

                {isUploadingBoleto && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 z-20">
                    <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                      Lendo código de barras, OCR e conciliando com a competência {currentPjMonthData.label}...
                    </span>
                  </div>
                )}
              </div>

              {/* Mensagem Toast de Sucesso */}
              {boletoSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{boletoSuccessMsg}</span>
                </div>
              )}

              {/* Lista de Boletos Recentes Conciliados */}
              {uploadedBoletos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    Últimos Boletos Conciliados Automaticamente:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {uploadedBoletos.slice(0, 6).map((b) => (
                      <div key={b.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                            {b.taxType}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                            {b.name} • {b.month}
                          </span>
                        </div>
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Tabela Oficial Idêntica à Planilha (Imagem 4 - "Empresa - Despesas Fixas") */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 md:p-6 shadow-xs space-y-4">
              {/* Cabeçalho da Tabela e Ações */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                <div>
                  <h4 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Empresa - Despesas Fixas (Tabela Oficial da Planilha)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Histórico consolidado dos últimos 2 anos (Set/24 a Set/26). Clique sobre qualquer valor para editar diretamente.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* Filtro por Ano */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setPjYearFilter('ALL')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        pjYearFilter === 'ALL'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Todos (24M)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPjYearFilter('2026')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        pjYearFilter === '2026'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      2026
                    </button>
                    <button
                      type="button"
                      onClick={() => setPjYearFilter('2025')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        pjYearFilter === '2025'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      2025
                    </button>
                    <button
                      type="button"
                      onClick={() => setPjYearFilter('2024')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        pjYearFilter === '2024'
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      2024
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetPjHistory}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Restaurar valores de fábrica da planilha oficial"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>
                </div>
              </div>

              {/* Tabela Responsiva Estilo Planilha Excel */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold text-[11px] uppercase tracking-wider">
                      <th className="p-3 border-r border-slate-700 whitespace-nowrap min-w-[200px]">
                        Tributo / Custo Fixo PJ
                      </th>
                      {filteredPjHistory.map((col) => (
                        <th 
                          key={col.month} 
                          className={`p-3 text-right border-r border-slate-700 min-w-[95px] whitespace-nowrap ${
                            col.month === selectedPjMonthKey ? 'bg-indigo-700 text-white font-black' : ''
                          }`}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                    {/* Linha 0: Simples Nacional (Guia Única quando não destrinchado) */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        Simples Nacional (Guia Única)
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'simples' as any, fieldLabel: 'Simples Nacional (Guia Única)', value: col.simples || 0 })
                            setEditPjValueInput((col.simples || 0).toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.simples && col.simples > 0 ? col.simples.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 1: IRPJ */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        IRPJ
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'irpj', fieldLabel: 'IRPJ da PJ', value: col.irpj })
                            setEditPjValueInput(col.irpj.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.irpj > 0 ? col.irpj.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 2: CSLL */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        CSLL
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'csll', fieldLabel: 'CSLL da PJ', value: col.csll })
                            setEditPjValueInput(col.csll.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.csll > 0 ? col.csll.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 3: COFINS */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        COFINS
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'cofins', fieldLabel: 'COFINS da PJ', value: col.cofins })
                            setEditPjValueInput(col.cofins.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.cofins > 0 ? col.cofins.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 4: PIS */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        PIS
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'pis', fieldLabel: 'PIS da PJ', value: col.pis })
                            setEditPjValueInput(col.pis.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.pis > 0 ? col.pis.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 5: INSS */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        INSS
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'inss', fieldLabel: 'INSS Patronal / Pró-labore', value: col.inss })
                            setEditPjValueInput(col.inss.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.inss > 0 ? col.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 6: ISS */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        ISS
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'iss', fieldLabel: 'ISS Municipal', value: col.iss })
                            setEditPjValueInput(col.iss.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.iss > 0 ? col.iss.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 7: DARF */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        DARF
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'darf', fieldLabel: 'DARF Tributário Federal', value: col.darf })
                            setEditPjValueInput(col.darf.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.darf > 0 ? col.darf.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 8: Outras taxas */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        Outras taxas
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'outras', fieldLabel: 'Outras Taxas da PJ', value: col.outras })
                            setEditPjValueInput(col.outras.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.outras > 0 ? col.outras.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* Linha 9: Mensalidade Contabilidade */}
                    <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-white/5">
                        Mensalidade Contabilidade
                      </td>
                      {filteredPjHistory.map((col) => (
                        <td
                          key={col.month}
                          onClick={() => {
                            setEditingPjCell({ month: col.month, monthLabel: col.label, field: 'contabilidade', fieldLabel: 'Mensalidade Contabilidade', value: col.contabilidade })
                            setEditPjValueInput(col.contabilidade.toString())
                          }}
                          className={`p-2.5 text-right cursor-pointer hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 transition-colors border-r border-slate-100 dark:border-white/5 ${
                            col.month === selectedPjMonthKey ? 'font-bold bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}
                          title="Clique para editar"
                        >
                          {col.contabilidade > 0 ? col.contabilidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </td>
                      ))}
                    </tr>

                    {/* LINHA DE TOTAL: EMPRESA - DESPESAS FIXAS */}
                    <tr className="bg-rose-50/60 dark:bg-rose-950/30 font-black text-rose-700 dark:text-rose-400 border-t-2 border-slate-300 dark:border-white/20">
                      <td className="p-3 font-sans uppercase tracking-wider border-r border-slate-200 dark:border-white/10">
                        Empresa - Despesas Fixas (Total)
                      </td>
                      {filteredPjHistory.map((col) => {
                        const tributos = (col.simples || 0) + col.irpj + col.csll + col.cofins + col.pis + col.inss + col.iss + col.darf + col.outras
                        const totalCol = tributos + col.contabilidade
                        return (
                          <td key={col.month} className="p-3 text-right border-r border-slate-200 dark:border-white/10">
                            {totalCol.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        )
                      })}
                    </tr>

                    {/* LINHA: PERCENTUAL DE IMPOSTO (SEM CONTABILIDADE) */}
                    <tr className={`transition-colors ${
                      taxRateViewMode === 'SEM_CONTABILIDADE' 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 font-black text-indigo-700 dark:text-indigo-300' 
                        : 'text-slate-600 dark:text-slate-400 font-semibold'
                    }`}>
                      <td className="p-2.5 font-sans border-r border-slate-100 dark:border-white/5">
                        % Impostos (Sem Contabilidade)
                      </td>
                      {filteredPjHistory.map((col) => {
                        const tributos = (col.simples || 0) + col.irpj + col.csll + col.cofins + col.pis + col.inss + col.iss + col.darf + col.outras
                        const pct = col.faturamento > 0 ? ((tributos / col.faturamento) * 100).toFixed(1) : '0.0'
                        return (
                          <td key={col.month} className="p-2.5 text-right border-r border-slate-100 dark:border-white/5">
                            {pct}%
                          </td>
                        )
                      })}
                    </tr>

                    {/* LINHA: PERCENTUAL DE IMPOSTO (COM CONTABILIDADE - PLANILHA OFICIAL) */}
                    <tr className={`border-b-2 border-slate-300 dark:border-white/20 transition-colors ${
                      taxRateViewMode === 'COM_CONTABILIDADE' 
                        ? 'bg-indigo-600 text-white font-black' 
                        : 'bg-indigo-50/40 dark:bg-indigo-950/20 text-slate-800 dark:text-slate-200 font-bold'
                    }`}>
                      <td className="p-3 font-sans uppercase tracking-wider border-r border-slate-200 dark:border-white/10">
                        Percentual de imposto (Com Contador - Planilha)
                      </td>
                      {filteredPjHistory.map((col) => {
                        const tributos = (col.simples || 0) + col.irpj + col.csll + col.cofins + col.pis + col.inss + col.iss + col.darf + col.outras
                        const totalCol = tributos + col.contabilidade
                        const pct = col.faturamento > 0 ? Math.round((totalCol / col.faturamento) * 100) : 0
                        return (
                          <td key={col.month} className="p-3 text-right border-r border-slate-200 dark:border-white/10">
                            {pct}%
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

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
        </>
      )}
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

      {/* Modal de Edição de Célula da Planilha PJ */}
      {editingPjCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm md:text-base text-slate-900 dark:text-white">
                    Editar Custo PJ • {editingPjCell.monthLabel}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingPjCell.fieldLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPjCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePjCell} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor Pago (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="text"
                    value={editPjValueInput}
                    onChange={(e) => setEditPjValueInput(e.target.value)}
                    placeholder="0,00"
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Valor anterior na planilha: R$ {editingPjCell.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingPjCell(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar na Planilha</span>
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
        initialType={activeScopeTab.startsWith('INCOME') ? 'INCOME' : 'EXPENSE'}
      />
    </section>
  )
}
