'use client'

import { getFinancialScopeVersion } from '@/utils/userScopedStorage'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Tag, 
  Calendar, 
  DollarSign, 
  Sliders, 
  X, 
  Check, 
  Layers, 
  BookmarkCheck,
  Building2,
  UserCheck,
  MapPin,
  PieChart,
  HelpCircle,
  Sparkles,
  BrainCircuit,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react'
import { 
  GranularTransactionStore, 
  GranularTransaction 
} from '@/utils/granularTransactionStore'
import { CategoryRulesEngine } from '@/utils/categoryRulesEngine'
import { normalizeCategoryName } from '@/utils/taxonomy'
import { InvestmentLinkModal } from './InvestmentLinkModal'

interface GranularExpenseAuditorProps {
  currentFilter?: string
  isDemo?: boolean
  selectedMonth?: number
  selectedYear?: number
  initialCategory?: string
}

export const BH_HOSPITALS = [
  'Hospital Madre Teresa',
  'Hospital Mater Dei',
  'Hospital Lifecenter',
  'Hospital Felício Rocho',
  'Hospital Vila da Serra',
  'Santa Casa BH',
  'Hospital Vera Cruz',
  'Hospital Baleia'
]

export const EXPENSE_TAXONOMY: Record<string, string[]> = {
  'Transporte': [
    'Estacionamentos',
    'Combustível',
    'Transporte por Aplicativo',
    'Manutenção Veicular',
    'Pedágios & Sem Parar',
    'Seguro Auto',
    'Outros'
  ],
  'Alimentação': [
    'Restaurantes & Fast Food',
    'Delivery & Lanches',
    'Supermercado Familiar',
    'Padaria & Confeitaria',
    'Cafeteria',
    'Outros'
  ],
  'Moradia': [
    'Supermercado Familiar',
    'Aluguel & Condomínio',
    'Energia Elétrica',
    'Água & Saneamento',
    'Internet & Telefone',
    'Manutenção & Reforma',
    'Outros'
  ],
  'Saúde': [
    'Farmácia & Medicamentos',
    'Consultas & Exames',
    'Plano de Saúde',
    'Odontologia',
    'Equipamentos Médicos',
    'Outros'
  ],
  'Educação': [
    'Cursos & Congressos',
    'Mensalidades Escolares',
    'Livros & Materiais',
    'Outros'
  ],
  'Lazer & Estilo de Vida': [
    'Viagens & Hospedagem',
    'Streaming & Assinaturas',
    'Vestuário & Acessórios',
    'Academia & Esportes',
    'Eletrônicos & Gadgets',
    'Outros'
  ],
  'Despesas PJ': [
    'DAS Simples Nacional',
    'Contabilidade & Honorários',
    'Taxas Bancárias & Sistemas',
    'Pró-Labore / Distribuição',
    'Outros'
  ],
  'Investimentos & Aplicações': [
    'Renda Fixa / CDB',
    'Tesouro Selic / IPCA',
    'Fundos Imobiliários (FIIs)',
    'Ações Nacionais',
    'Criptoativos',
    'Aporte Geral'
  ],
  'Pagamento de Fatura': [
    'Deduplicado / Débito de Cartão',
    'Fatura Cartão C6',
    'Fatura Itaú',
    'Fatura Nubank'
  ]
}

export const INCOME_TAXONOMY: Record<string, string[]> = {
  'Faturamento Hospitalar & PJ': [
    'Plantão Médico',
    'UPAs Contagem',
    'Hospital Madre Teresa',
    'Hospital Mater Dei',
    'Hospital Felício Rocho',
    'Santa Casa BH',
    'Outros Plantões'
  ],
  'Receita PF & Pró-Labore': [
    'Pró-Labore Médico',
    'Salários & Remunerações',
    'Consultas Particulares',
    'Reembolso / Transferências',
    'Venda de Bens',
    'Outras Receitas PF'
  ],
  'Reembolso & Devolução': [
    'Reembolso de Despesas',
    'Reembolso Plano de Saúde',
    'Estorno de Compra',
    'Outros Reembolsos'
  ],
  'Rendimentos & Investimentos': [
    'Rendimentos CDB / Renda Fixa',
    'Dividendos & JCP',
    'Resgate de Aplicações',
    'Venda de Ativos'
  ],
  'Presentes & PIX Recebidos': [
    'Presente / Aniversário / Casamento',
    'Transferência Familiar',
    'PIX Comercial / Serviço',
    'Outros Recebimentos'
  ],
  'Resgate de Investimentos': [
    'Resgate de Capital',
    'Resgate de Emergência',
    'Outros'
  ]
}

export const STANDARD_TAXONOMY: Record<string, string[]> = {
  ...INCOME_TAXONOMY,
  ...EXPENSE_TAXONOMY
}

export function GranularExpenseAuditor({ 
  currentFilter = 'PF', 
  isDemo = false,
  selectedMonth,
  selectedYear,
  initialCategory
}: GranularExpenseAuditorProps) {
  const financialScopeVersion = React.useRef(getFinancialScopeVersion()).current
  const [transactions, setTransactions] = useState<GranularTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL')
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory ? normalizeCategoryName(initialCategory) : 'ALL')
  useEffect(() => {
    setSelectedCategory(initialCategory ? normalizeCategoryName(initialCategory) : 'ALL')
    setSelectedSubdivision('ALL')
  }, [initialCategory])
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('ALL')
  const [showIgnored, setShowIgnored] = useState(true)
  const [onlyUncategorized, setOnlyUncategorized] = useState(false)
  
  // Filtros Avançados de Inteligência Artificial & Jev
  type AiFilterType = 'ALL' | 'PENDING' | 'JEV_SUGGESTIONS' | 'LOW_CONFIDENCE' | 'NEEDS_REVIEW'
  const [aiFilter, setAiFilter] = useState<AiFilterType>('ALL')

  // Processamento em Lote com Jev
  const [isAiBatchRunning, setIsAiBatchRunning] = useState(false)
  const [aiBatchProgress, setAiBatchProgress] = useState<{ current: number; total: number } | null>(null)
  const [aiBatchSummary, setAiBatchSummary] = useState<{
    total_processed: number
    auto_applied_count: number
    suggested_count: number
    needs_review_count: number
    error_count: number
    estimated_cost_usd: string
  } | null>(null)

  // Período no formato 'YYYY-MM' (Baseado no Mês/Ano selecionado no painel)
  const initialPeriod = useMemo(() => {
    const now = new Date()
    const yr = selectedYear !== undefined ? selectedYear : now.getFullYear()
    const mo = selectedMonth !== undefined ? selectedMonth : now.getMonth()
    return `${yr}-${String(mo + 1).padStart(2, '0')}`
  }, [selectedMonth, selectedYear])

  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod)

  useEffect(() => {
    setSelectedPeriod(initialPeriod)
  }, [initialPeriod])

  // Seleção Múltipla & Categorização em Lote
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set())
  const [bulkTxType, setBulkTxType] = useState<'EXPENSE' | 'INCOME' | 'ALL'>('EXPENSE')
  const [bulkCategory, setBulkCategory] = useState<string>('Transporte')
  const [isBulkCustomCategory, setIsBulkCustomCategory] = useState<boolean>(false)
  const [bulkCustomCategory, setBulkCustomCategory] = useState<string>('')
  const [bulkSubcategory, setBulkSubcategory] = useState<string>('Estacionamentos')
  const [isBulkCustomSubcategory, setIsBulkCustomSubcategory] = useState<boolean>(false)
  const [bulkCustomSubcategory, setBulkCustomSubcategory] = useState<string>('')
  const [hospitalsList, setHospitalsList] = useState<string[]>(BH_HOSPITALS)
  const [bulkSubdivision, setBulkSubdivision] = useState<string>('')
  const [isBulkCustomSubdivision, setIsBulkCustomSubdivision] = useState<boolean>(false)
  const [bulkCustomSubdivision, setBulkCustomSubdivision] = useState<string>('')
  const [bulkLearnRule, setBulkLearnRule] = useState<boolean>(true)
  const [bulkToast, setBulkToast] = useState<string | null>(null)

  // Ordenação por Colunas do Extrato
  type SortField = 'date' | 'description' | 'accountOrCard' | 'category' | 'amount' | 'isIgnored'
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Modais de Edição e Criação
  const [editingTx, setEditingTx] = useState<GranularTransaction | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Modal de Vínculo de Investimento
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [investContext, setInvestContext] = useState<{
    target: 'EDIT' | 'NEW'
    action: 'APORTE' | 'RESGATE'
    amount: number
    date: string
    desc: string
  }>({
    target: 'EDIT',
    action: 'APORTE',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    desc: ''
  })

  // Formulário de Edição
  const [editForm, setEditForm] = useState({
    txType: 'EXPENSE' as 'EXPENSE' | 'INCOME',
    description: '',
    amount: '',
    date: '',
    accountOrCard: '',
    category: '',
    customCategory: '',
    isCustomCategory: false,
    subcategory: '',
    customSubcategory: '',
    isCustomSubcategory: false,
    subdivision: '',
    investmentAsset: '',
    investmentAction: null as 'APORTE' | 'RESGATE' | null,
    isFixed: false,
    updateRuleToo: true
  })

  // Formulário de Novo Lançamento Manual
  const [newForm, setNewForm] = useState({
    txType: 'EXPENSE' as 'EXPENSE' | 'INCOME',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Alimentação',
    customCategory: '',
    isCustomCategory: false,
    subcategory: 'Restaurantes & Fast Food',
    customSubcategory: '',
    isCustomSubcategory: false,
    subdivision: '',
    investmentAsset: '',
    investmentAction: null as 'APORTE' | 'RESGATE' | null,
    entityType: 'PF' as 'PF' | 'PJ',
    isFixed: false,
    saveAsRule: true
  })

  // Carrega transações do cache local e sincroniza do banco via API
  const loadTransactions = async (periodTarget?: string) => {
    const list = GranularTransactionStore.getAll()
    if (list && list.length > 0) {
      setTransactions(list.map(t => ({
        ...t,
        category: normalizeCategoryName(t.category)
      })))
    }

    if (!isDemo) {
      try {
        const fresh = await GranularTransactionStore.fetchFromApi(periodTarget || selectedPeriod)
      if (getFinancialScopeVersion() !== financialScopeVersion) return
        if (fresh && fresh.length > 0) {
          setTransactions(fresh.map(t => ({
            ...t,
            category: normalizeCategoryName(t.category)
          })))
        }
      } catch (err) {
        console.warn('Erro ao sincronizar transações da API:', err)
      }
    }
  }

  useEffect(() => {
    loadTransactions(selectedPeriod)
    const handleUpdate = () => loadTransactions(selectedPeriod)
    window.addEventListener('leaomed_transactions_updated', handleUpdate)
    return () => window.removeEventListener('leaomed_transactions_updated', handleUpdate)
  }, [selectedPeriod, isDemo])

  // Varredura de Duplicidades (Cartão vs Pagamento de Fatura em Conta Corrente)
  const duplicateReport = useMemo(() => {
    return GranularTransactionStore.scanDuplicates(transactions)
  }, [transactions])

  // Lançamentos pendentes de categoria ou subcategoria
  const uncategorizedItems = useMemo(() => {
    return transactions.filter(t => GranularTransactionStore.isUncategorized(t))
  }, [transactions])

  const uncategorizedTotal = useMemo(() => {
    return uncategorizedItems.reduce((acc, t) => acc + (t.isIgnored ? 0 : Math.abs(t.amount)), 0)
  }, [uncategorizedItems])

  // Subdivisão Nível 3 Dinâmica (Exibida SOMENTE quando uma Categoria, Subcategoria ou Tag está selecionada)
  const level3Stats = useMemo(() => {
    const hasActiveScope = selectedCategory !== 'ALL' || selectedSubdivision !== 'ALL' || searchTerm.trim().length > 0
    if (!hasActiveScope) {
      return { hasData: false, list: [], totalAmount: 0, title: '' }
    }

    const items = transactions.filter(t => {
      if (t.isIgnored) return false
      if (currentFilter === 'PF' && t.entityType !== 'PF') return false
      if (currentFilter === 'PJ' && t.entityType !== 'PJ') return false
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false
      if (selectedAccount !== 'ALL' && t.accountOrCard !== selectedAccount) return false
      return Boolean(t.subdivision && t.subdivision.trim())
    })

    if (items.length === 0) return { hasData: false, list: [], totalAmount: 0, title: '' }

    const map: Record<string, { total: number; count: number }> = {}
    let totalAmount = 0

    items.forEach(t => {
      const tag = t.subdivision!.trim()
      const val = Math.abs(t.amount)
      totalAmount += val
      if (!map[tag]) map[tag] = { total: 0, count: 0 }
      map[tag].total += val
      map[tag].count += 1
    })

    const list = Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      pct: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0
    })).sort((a, b) => b.total - a.total)

    const title = selectedCategory !== 'ALL' 
      ? `Subdivisão Nível 3 em "${selectedCategory}"` 
      : `Subdivisão Nível 3 (Discriminação por Local / Tag)`

    return {
      hasData: list.length > 0,
      list,
      totalAmount,
      title
    }
  }, [transactions, selectedCategory, selectedAccount, selectedSubdivision, currentFilter, searchTerm])

  // Filtragem
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      // Filtro de entidade
      if (currentFilter === 'PF' && t.entityType !== 'PF') return false
      if (currentFilter === 'PJ' && t.entityType !== 'PJ') return false

      // Filtro de Tipo (Despesas x Receitas x Todos)
      if (txTypeFilter === 'EXPENSE' && t.amount > 0) return false
      if (txTypeFilter === 'INCOME' && t.amount < 0) return false

      // Filtro por Mês / Período
      if (selectedPeriod !== 'ALL' && (!t.date || !t.date.startsWith(selectedPeriod))) return false

      // Filtro exclusivo de pendentes
      if (onlyUncategorized && !GranularTransactionStore.isUncategorized(t)) return false

      // Filtros Específicos de Inteligência Artificial / Jev
      if (aiFilter === 'PENDING' && !GranularTransactionStore.isUncategorized(t) && t.categorizationStatus !== 'pending') return false
      if (aiFilter === 'JEV_SUGGESTIONS' && t.categorySource !== 'jev' && !t.aiSuggestedCategory) return false
      if (aiFilter === 'LOW_CONFIDENCE' && (!(typeof t.categoryConfidence === 'number' && t.categoryConfidence < 0.70))) return false
      if (aiFilter === 'NEEDS_REVIEW' && !t.aiReviewRequired && t.categorizationStatus !== 'needs_review') return false

      // Filtro de conta/cartão
      if (selectedAccount !== 'ALL' && t.accountOrCard !== selectedAccount) return false

      // Filtro de categoria
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false

      // Filtro de subdivisão (hospital/local)
      if (selectedSubdivision !== 'ALL' && (t.subdivision || 'Outros / Sem Hospital') !== selectedSubdivision) return false

      // Filtro de itens ignorados
      if (!showIgnored && t.isIgnored) return false

      // Busca por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchDesc = t.description.toLowerCase().includes(query)
        const matchCat = t.category.toLowerCase().includes(query)
        const matchSub = t.subcategory.toLowerCase().includes(query)
        const matchSubdiv = (t.subdivision || '').toLowerCase().includes(query)
        const matchAcc = t.accountOrCard.toLowerCase().includes(query)
        const matchInvest = (t.investmentAsset || '').toLowerCase().includes(query)
        if (!matchDesc && !matchCat && !matchSub && !matchSubdiv && !matchAcc && !matchInvest) return false
      }

      return true
    })
  }, [transactions, currentFilter, txTypeFilter, selectedPeriod, onlyUncategorized, aiFilter, selectedAccount, selectedCategory, selectedSubdivision, showIgnored, searchTerm])

  // Executa Categorização em Lote de Lançamentos Pendentes via API do Jev
  const handleCategorizePendingWithAi = async () => {
    const pendings = transactions.filter(t => GranularTransactionStore.isUncategorized(t) || t.categorizationStatus === 'pending')
    if (pendings.length === 0) {
      setBulkToast('Nenhum lançamento pendente encontrado para categorização.')
      setTimeout(() => setBulkToast(null), 3000)
      return
    }

    setIsAiBatchRunning(true)
    setAiBatchProgress({ current: 0, total: pendings.length })

    try {
      const resp = await fetch('/api/categorize/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pendings.map(p => ({
            id: p.id,
            description: p.description,
            amount: p.amount,
            date: p.date,
            account_scope: p.entityType,
            payment_method: p.accountOrCard,
            current_category: p.category,
            current_subcategory: p.subcategory
          }))
        })
      })

      if (!resp.ok) {
        throw new Error('Falha na comunicação com a API de categorização.')
      }

      const data = await resp.json()
      if (getFinancialScopeVersion() !== financialScopeVersion) return
      if (data.success && data.results) {
        // Atualiza transações no store com as sugestões retornadas (Modo Sombra)
        data.results.forEach((res: any) => {
          if (getFinancialScopeVersion() !== financialScopeVersion) return
          GranularTransactionStore.updateTransaction(res.transaction_id, {
            categorySource: res.source,
            decisionType: res.decision_type,
            certaintyLabel: res.certainty_label,
            categoryConfidence: res.choice_confidence,
            isFixedProbability: res.is_fixed_probability,
            needsReviewProbability: res.needs_review_probability,
            aiSuggestedCategory: res.suggested_category,
            aiSuggestedSubcategory: res.suggested_subcategory,
            aiSuggestedIsFixed: res.is_fixed,
            aiReviewRequired: res.review_required,
            categorizationStatus: res.categorization_status,
            categorizationError: res.error_message
          })
        })

        loadTransactions()
        setAiBatchSummary(data.summary)
      }
    } catch (err: any) {
      setBulkToast(`Erro ao processar lote: ${err?.message || 'Falha de conexão'}`)
      setTimeout(() => setBulkToast(null), 4000)
    } finally {
      setIsAiBatchRunning(false)
      setAiBatchProgress(null)
    }
  }

  // Aceita sugestão do Jev / IA em 1 clique
  const handleAcceptAiSuggestion = (tx: GranularTransaction) => {
    if (!tx.aiSuggestedCategory) return

    if (getFinancialScopeVersion() !== financialScopeVersion) return
    GranularTransactionStore.updateTransaction(tx.id, {
      category: tx.aiSuggestedCategory,
      subcategory: tx.aiSuggestedSubcategory || 'Outros',
      isFixed: tx.aiSuggestedIsFixed ?? tx.isFixed,
      categorySource: 'manual',
      categorizationStatus: 'confirmed',
      aiReviewRequired: false
    })

    loadTransactions()
    setBulkToast(`✅ Sugestão "${tx.aiSuggestedCategory} > ${tx.aiSuggestedSubcategory}" confirmada!`)
    setTimeout(() => setBulkToast(null), 2500)
  }

  // Rejeita sugestão do Jev
  const handleRejectAiSuggestion = (tx: GranularTransaction) => {
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    GranularTransactionStore.updateTransaction(tx.id, {
      categorizationStatus: 'rejected',
      aiReviewRequired: true
    })

    loadTransactions()
    setBulkToast(`Sugestão rejeitada para "${tx.description}". Classifique manualmente.`)
    setTimeout(() => setBulkToast(null), 2500)
  }

  // Lista de períodos disponíveis a partir das transações reais + mês ativo
  const availablePeriods = useMemo(() => {
    const set = new Set<string>()
    if (initialPeriod && initialPeriod !== 'ALL') {
      set.add(initialPeriod)
    }
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        set.add(t.date.substring(0, 7))
      }
    })
    return Array.from(set).sort().reverse()
  }, [transactions, initialPeriod])

  const formatPeriodLabel = (p: string) => {
    if (p === 'ALL') return '📅 Todos os Meses'
    const parts = p.split('-')
    if (parts.length < 2) return p
    const [year, month] = parts
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    const monthIndex = parseInt(month, 10) - 1
    const monthName = months[monthIndex] || month
    return `📅 ${monthName}/${year}`
  }

  // Lista Ordenada para a Tabela
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let valA: any = a[sortField] || ''
      let valB: any = b[sortField] || ''

      if (sortField === 'amount') {
        valA = Math.abs(a.amount)
        valB = Math.abs(b.amount)
      } else if (sortField === 'category') {
        valA = `${a.category || ''} ${a.subcategory || ''} ${a.subdivision || ''}`.toLowerCase()
        valB = `${b.category || ''} ${b.subcategory || ''} ${b.subdivision || ''}`.toLowerCase()
      } else if (sortField === 'isIgnored') {
        valA = a.isIgnored ? 1 : 0
        valB = b.isIgnored ? 1 : 0
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredList, sortField, sortDirection])

  // Métricas do extrato granular
  const metrics = useMemo(() => {
    let incomeActive = 0
    let expenseActive = 0
    let deduplicatedVal = 0

    filteredList.forEach(t => {
      if (t.isIgnored) {
        deduplicatedVal += Math.abs(t.amount)
      } else if (t.amount > 0) {
        incomeActive += t.amount
      } else {
        expenseActive += Math.abs(t.amount)
      }
    })

    return {
      incomeActive,
      expenseActive,
      netBalance: incomeActive - expenseActive,
      deduplicatedVal,
      count: filteredList.length
    }
  }, [filteredList])

  // Lista única de contas e cartões existentes (Sem contas fictícias harcoded)
  const availableAccounts = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach(t => {
      if (t.accountOrCard && t.accountOrCard.trim()) {
        set.add(t.accountOrCard.trim())
      }
    })
    return Array.from(set).sort()
  }, [transactions])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    // Categorias padrão da taxonomia + categorias existentes nas transações
    Object.keys(STANDARD_TAXONOMY).forEach(c => set.add(normalizeCategoryName(c)))
    transactions.forEach(t => {
      if (t.category && t.category.trim()) set.add(normalizeCategoryName(t.category.trim()))
    })
    return Array.from(set).sort()
  }, [transactions])

  const expenseCategories = useMemo(() => {
    const set = new Set<string>()
    Object.keys(EXPENSE_TAXONOMY).forEach(c => set.add(normalizeCategoryName(c)))
    transactions.forEach(t => {
      if (t.amount < 0 && t.category && t.category.trim()) set.add(normalizeCategoryName(t.category.trim()))
    })
    return Array.from(set).sort()
  }, [transactions])

  const incomeCategories = useMemo(() => {
    const set = new Set<string>()
    Object.keys(INCOME_TAXONOMY).forEach(c => set.add(normalizeCategoryName(c)))
    transactions.forEach(t => {
      if (t.amount > 0 && t.category && t.category.trim()) set.add(normalizeCategoryName(t.category.trim()))
    })
    return Array.from(set).sort()
  }, [transactions])

  // Auto-detecta se os lançamentos selecionados são receitas ou despesas
  useEffect(() => {
    if (selectedTxIds.size > 0) {
      let pos = 0
      let neg = 0
      selectedTxIds.forEach(id => {
        const tx = transactions.find(t => t.id === id)
        if (tx) {
          if (tx.amount > 0) pos++
          else neg++
        }
      })
      if (pos > neg) {
        setBulkTxType('INCOME')
        const firstCat = incomeCategories[0] || 'Receita PF & Pró-Labore'
        setBulkCategory(firstCat)
        const setOfSubs = new Set<string>()
        if (STANDARD_TAXONOMY[firstCat]) STANDARD_TAXONOMY[firstCat].forEach(s => setOfSubs.add(s))
        const subList = Array.from(setOfSubs)
        setBulkSubcategory(subList[0] || 'Outros')
      } else {
        setBulkTxType('EXPENSE')
        const firstCat = expenseCategories[0] || 'Transporte'
        setBulkCategory(firstCat)
        const setOfSubs = new Set<string>()
        if (STANDARD_TAXONOMY[firstCat]) STANDARD_TAXONOMY[firstCat].forEach(s => setOfSubs.add(s))
        const subList = Array.from(setOfSubs)
        setBulkSubcategory(subList[0] || 'Outros')
      }
      setIsBulkCustomCategory(false)
      setIsBulkCustomSubcategory(false)
    }
  }, [selectedTxIds])

  const availableSubdivisions = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach(t => {
      if (t.subdivision && t.subdivision.trim()) set.add(t.subdivision.trim())
    })
    return Array.from(set).sort()
  }, [transactions])

  // Obtém subcategorias dinâmicas para a categoria selecionada
  const getSubcategoriesForCategory = React.useCallback((catName: string) => {
    const set = new Set<string>()
    if (STANDARD_TAXONOMY[catName]) {
      STANDARD_TAXONOMY[catName].forEach(s => set.add(s))
    }
    transactions.forEach(t => {
      if (t.category === catName && t.subcategory && t.subcategory.trim()) {
        set.add(t.subcategory.trim())
      }
    })
    return Array.from(set)
  }, [transactions])

  // Obtém marcas e subdivisões Nível 3 dinâmicas para a categoria/subcategoria selecionada
  const getSubdivisionsForScope = React.useCallback((catName: string, subcatName: string) => {
    const set = new Set<string>()
    if ((catName && catName.toLowerCase().includes('transporte')) || (subcatName && subcatName.toLowerCase().includes('estacionamento'))) {
      BH_HOSPITALS.forEach(h => set.add(h))
    }
    transactions.forEach(t => {
      if (
        (!catName || t.category === catName) &&
        (!subcatName || t.subcategory === subcatName) &&
        t.subdivision && 
        t.subdivision.trim()
      ) {
        set.add(t.subdivision.trim())
      }
    })
    return Array.from(set)
  }, [transactions])

  // Métricas e Ações de Seleção Múltipla / Lote
  const selectedTotalAmount = useMemo(() => {
    return filteredList
      .filter(t => selectedTxIds.has(t.id))
      .reduce((acc, t) => acc + (t.isIgnored ? 0 : Math.abs(t.amount)), 0)
  }, [filteredList, selectedTxIds])

  const uncategorizedInViewCount = useMemo(() => {
    return filteredList.filter(t => GranularTransactionStore.isUncategorized(t)).length
  }, [filteredList])

  const handleToggleSelectTx = (id: string) => {
    setSelectedTxIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleSelectAll = () => {
    if (selectedTxIds.size === filteredList.length && filteredList.length > 0) {
      setSelectedTxIds(new Set())
    } else {
      setSelectedTxIds(new Set(filteredList.map(t => t.id)))
    }
  }

  const handleSelectOnlyUncategorized = () => {
    const uncat = filteredList.filter(t => GranularTransactionStore.isUncategorized(t))
    setSelectedTxIds(new Set(uncat.map(t => t.id)))
  }

  const handleClearSelection = () => {
    setSelectedTxIds(new Set())
  }

  const handleBulkCategoryChange = (cat: string) => {
    if (cat === 'NEW_CATEGORY') {
      setIsBulkCustomCategory(true)
      setIsBulkCustomSubcategory(true)
    } else {
      setIsBulkCustomCategory(false)
      setBulkCategory(cat)
      const availableSubs = getSubcategoriesForCategory(cat)
      setBulkSubcategory(availableSubs[0] || 'Outros')
      setIsBulkCustomSubcategory(false)
    }
  }

  const handleApplyBulkCategorization = () => {
    if (selectedTxIds.size === 0) return

    const rawCat = isBulkCustomCategory ? bulkCustomCategory.trim() : bulkCategory.trim()
    const finalCat = normalizeCategoryName(rawCat)
    const finalSubcat = (isBulkCustomCategory || isBulkCustomSubcategory) 
      ? bulkCustomSubcategory.trim() 
      : bulkSubcategory.trim()
    const finalSubdivision = isBulkCustomSubdivision ? bulkCustomSubdivision.trim() : bulkSubdivision.trim()

    if (!finalCat) return

    if (finalSubdivision && !hospitalsList.includes(finalSubdivision)) {
      setHospitalsList(prev => [...prev, finalSubdivision])
    }

    const count = selectedTxIds.size
    const targets = Array.from(selectedTxIds)

    targets.forEach(id => {
      const tx = transactions.find(t => t.id === id)
      if (tx) {
        let finalAmount = tx.amount
        if (bulkTxType === 'INCOME' && tx.amount < 0) {
          finalAmount = Math.abs(tx.amount)
        } else if (bulkTxType === 'EXPENSE' && tx.amount > 0) {
          finalAmount = -Math.abs(tx.amount)
        }

        if (bulkLearnRule && tx.description) {
          CategoryRulesEngine.saveRule({
            pattern: tx.description,
            category: finalCat,
            subcategory: finalSubcat || 'Outros',
            subdivision: finalSubdivision || undefined,
            entityType: tx.entityType,
            alwaysApply: true
          })
        }
        if (getFinancialScopeVersion() !== financialScopeVersion) return
        GranularTransactionStore.updateTransaction(id, {
          amount: finalAmount,
          category: finalCat,
          subcategory: finalSubcat || 'Outros',
          subdivision: finalSubdivision || tx.subdivision
        })
      }
    })

    setSelectedTxIds(new Set())
    setIsBulkCustomCategory(false)
    setIsBulkCustomSubcategory(false)
    setIsBulkCustomSubdivision(false)
    setBulkCustomSubdivision('')
    loadTransactions()
    setBulkToast(`✅ ${count} lançamento(s) recategorizado(s) com sucesso em "${finalCat} > ${finalSubcat || 'Outros'}"!`)
    setTimeout(() => setBulkToast(null), 4500)
  }

  const handleBulkDelete = () => {
    if (selectedTxIds.size === 0) return
    const count = selectedTxIds.size
    if (!confirm(`Deseja realmente excluir os ${count} lançamentos selecionados?`)) return

    selectedTxIds.forEach(id => {
      if (getFinancialScopeVersion() !== financialScopeVersion) return
      GranularTransactionStore.deleteTransaction(id)
    })
    setSelectedTxIds(new Set())
    loadTransactions()
    setBulkToast(`🗑️ ${count} lançamentos excluídos com sucesso.`)
    setTimeout(() => setBulkToast(null), 4000)
  }

  // Ações
  const handleToggleIgnore = (id: string) => {
    GranularTransactionStore.toggleIgnore(id)
  }

  const handleDelete = (id: string) => {
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    GranularTransactionStore.deleteTransaction(id)
    setDeletingId(null)
  }

  const handleDeduplicateAll = () => {
    GranularTransactionStore.deduplicateAllBillPayments()
  }

  const handleOpenEdit = (tx: GranularTransaction) => {
    setEditingTx(tx)
    const isInc = tx.amount > 0
    setEditForm({
      txType: isInc ? 'INCOME' : 'EXPENSE',
      description: tx.description,
      amount: Math.abs(tx.amount).toFixed(2),
      date: tx.date,
      accountOrCard: tx.accountOrCard,
      category: tx.category || '',
      customCategory: '',
      isCustomCategory: false,
      subcategory: tx.subcategory || '',
      customSubcategory: '',
      isCustomSubcategory: false,
      subdivision: tx.subdivision || '',
      investmentAsset: tx.investmentAsset || '',
      investmentAction: tx.investmentAction || null,
      isFixed: tx.isFixed,
      updateRuleToo: true
    })
  }

  const handleSaveEdit = () => {
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    if (!editingTx) return

    const parsedVal = parseFloat(editForm.amount) || 0
    const finalVal = editForm.txType === 'INCOME' ? Math.abs(parsedVal) : -Math.abs(parsedVal)
    const finalCat = editForm.isCustomCategory ? editForm.customCategory.trim() : editForm.category.trim()
    const finalSubcat = (editForm.isCustomCategory || editForm.isCustomSubcategory) 
      ? editForm.customSubcategory.trim() 
      : editForm.subcategory.trim()

    const fallbackCat = editForm.txType === 'INCOME' ? 'Receita PF & Pró-Labore' : 'Despesas Pessoais'

    if (getFinancialScopeVersion() !== financialScopeVersion) return
    GranularTransactionStore.updateTransaction(editingTx.id, {
      description: editForm.description.trim(),
      amount: finalVal,
      date: editForm.date,
      accountOrCard: editForm.accountOrCard,
      category: finalCat || fallbackCat,
      subcategory: finalSubcat || 'Outros',
      subdivision: editForm.subdivision.trim() || undefined,
      investmentAsset: editForm.investmentAsset.trim() || undefined,
      investmentAction: editForm.investmentAction || undefined,
      isFixed: editForm.isFixed
    })

    if (editForm.updateRuleToo && editForm.description.trim().length >= 2) {
      CategoryRulesEngine.saveRule({
        pattern: editForm.description.trim().split(' ')[0],
        category: finalCat || fallbackCat,
        subcategory: finalSubcat || 'Outros',
        subdivision: editForm.subdivision.trim() || undefined,
        entityType: editingTx.entityType,
        alwaysApply: true
      })
    }

    setEditingTx(null)
  }

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.description || !newForm.amount) return

    const val = parseFloat(newForm.amount) || 0
    const finalVal = newForm.txType === 'INCOME' ? Math.abs(val) : -Math.abs(val)
    const finalCat = newForm.isCustomCategory ? newForm.customCategory.trim() : newForm.category.trim()
    const finalSubcat = (newForm.isCustomCategory || newForm.isCustomSubcategory) 
      ? newForm.customSubcategory.trim() 
      : newForm.subcategory.trim()

    const fallbackCat = newForm.txType === 'INCOME' ? 'Receita PF & Pró-Labore' : 'Despesas Pessoais'

    if (getFinancialScopeVersion() !== financialScopeVersion) return
    GranularTransactionStore.addTransaction({
      entityType: newForm.entityType,
      date: newForm.date,
      description: newForm.description.trim(),
      amount: finalVal,
      accountOrCard: newForm.accountOrCard,
      category: finalCat || fallbackCat,
      subcategory: finalSubcat || 'Outros',
      subdivision: newForm.subdivision.trim() || undefined,
      investmentAsset: newForm.investmentAsset.trim() || undefined,
      investmentAction: newForm.investmentAction || undefined,
      isFixed: newForm.isFixed,
      isIgnored: false,
      source: 'MANUAL'
    })

    if (newForm.saveAsRule) {
      const kw = newForm.description.trim().split(' ')[0]
      if (kw.length >= 2) {
        CategoryRulesEngine.saveRule({
          pattern: kw,
          category: finalCat || fallbackCat,
          subcategory: finalSubcat || 'Outros',
          subdivision: newForm.subdivision.trim() || undefined,
          entityType: newForm.entityType,
          alwaysApply: true
        })
      }
    }

    setIsAddModalOpen(false)
    setNewForm({
      txType: 'EXPENSE',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      accountOrCard: availableAccounts[0] || 'Cartão C6 Carbon Black',
      category: 'Alimentação',
      customCategory: '',
      isCustomCategory: false,
      subcategory: 'Restaurantes & Fast Food',
      customSubcategory: '',
      isCustomSubcategory: false,
      subdivision: '',
      investmentAsset: '',
      investmentAction: null,
      entityType: 'PF',
      isFixed: false,
      saveAsRule: true
    })
  }

  const handleOpenInvestmentLink = (target: 'EDIT' | 'NEW', action: 'APORTE' | 'RESGATE') => {
    const isEdit = target === 'EDIT'
    const amountVal = isEdit ? (parseFloat(editForm.amount) || 0) : (parseFloat(newForm.amount) || 0)
    const dateVal = isEdit ? editForm.date : newForm.date
    const descVal = isEdit ? editForm.description : newForm.description

    setInvestContext({
      target,
      action,
      amount: amountVal,
      date: dateVal,
      desc: descVal
    })
    setIsInvestModalOpen(true)
  }

  const handleAssetSelected = (assetName: string, action: 'APORTE' | 'RESGATE') => {
    if (investContext.target === 'EDIT') {
      setEditForm(prev => ({
        ...prev,
        investmentAsset: assetName,
        investmentAction: action,
        category: action === 'APORTE' ? 'Investimentos & Aplicações' : 'Resgate de Investimentos',
        subcategory: prev.subcategory || (action === 'APORTE' ? `Aporte em ${assetName}` : `Resgate de ${assetName}`)
      }))
    } else {
      setNewForm(prev => ({
        ...prev,
        investmentAsset: assetName,
        investmentAction: action,
        category: action === 'APORTE' ? 'Investimentos & Aplicações' : 'Resgate de Investimentos',
        subcategory: prev.subcategory || (action === 'APORTE' ? `Aporte em ${assetName}` : `Resgate de ${assetName}`)
      }))
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. BANNER DO DETECTOR INTELIGENTE DE DUPLICIDADES (Cartão vs Débito de Fatura em Conta) */}
      {duplicateReport.hasDuplicates && (
        <div className="p-4 md:p-5 rounded-xl bg-[var(--capital-warning-soft,#fcf1dc)] dark:bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-2xl bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)] mt-0.5 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm md:text-base text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] flex items-center gap-2">
                  Prevenção de Duplicidade Ativa (Cartão vs Pagamento em Conta)
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)]">
                    Aviso Contábil
                  </span>
                </h4>
                <p className="text-xs text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] mt-1 max-w-2xl leading-relaxed">
                  Como você concentra seus gastos nos <strong>cartões de crédito</strong>, identificamos o débito do pagamento total da fatura na conta corrente concomitantemente aos lançamentos individuais do cartão. O sistema auto-deduplicou os débitos de fatura para não somar seus gastos duas vezes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDeduplicateAll}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--capital-button-text,#242a2e)] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-none cursor-pointer"
                title="Garante que todos os débitos de fatura fiquem ignorados e não dupliquem suas despesas"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Aplicar Deduplicação Segura</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BANNER DE LANÇAMENTOS SEM CATEGORIA OU SEM SUBCATEGORIA */}
      {uncategorizedItems.length > 0 && (
        <div className="p-4 md:p-5 rounded-xl bg-[var(--capital-warning-soft,#fcf1dc)] dark:bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-2xl bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)] mt-0.5 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm md:text-base text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] flex items-center gap-2">
                  {uncategorizedItems.length} Lançamento(s) Pendente(s) de Classificação
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)]">
                    Ação Necessária
                  </span>
                </h4>
                <p className="text-xs text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] mt-1 max-w-2xl leading-relaxed">
                  Identificamos <strong>{uncategorizedItems.length} despesa(s)</strong> (totalizando <strong>R$ {uncategorizedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>) sem categoria ou subcategoria definida. Classifique-as para manter a precisão contábil do orçamento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setOnlyUncategorized(!onlyUncategorized)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  onlyUncategorized
                    ? 'bg-amber-400 text-[var(--capital-button-text,#242a2e)] ring-2 ring-amber-300 shadow-none'
                    : 'bg-amber-500 hover:bg-amber-400 text-[var(--capital-button-text,#242a2e)] shadow-none'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{onlyUncategorized ? 'Ver Todos os Gastos' : 'Filtrar Pendentes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WIDGET INTERATIVO: SUBDIVISÃO NÍVEL 3 (Exibido SOMENTE quando houver filtro ativo de categoria ou subdivisão) */}
      {level3Stats.hasData && (
        <div className="p-4 md:p-5 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] text-[var(--capital-text,#242a2e)] space-y-3.5 shadow-md animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                  {level3Stats.title}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]">
                    Nível 3 (Tags & Locais)
                  </span>
                </h4>
                <p className="text-[11px] text-[var(--capital-muted,#242a2e)]">
                  Total acumulado no escopo: <strong className="text-[var(--capital-text,#242a2e)] font-mono">R$ {level3Stats.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>
            </div>

            {selectedSubdivision !== 'ALL' && (
              <button
                onClick={() => setSelectedSubdivision('ALL')}
                className="text-xs text-[var(--capital-accent,#927025)] hover:text-[var(--capital-accent,#927025)] font-bold underline cursor-pointer"
              >
                Limpar filtro ({selectedSubdivision})
              </button>
            )}
          </div>

          {/* Grid de Subdivisões */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {level3Stats.list.map((item) => {
              const isSelected = selectedSubdivision === item.name
              return (
                <div
                  key={item.name}
                  onClick={() => setSelectedSubdivision(isSelected ? 'ALL' : item.name)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] ring-2 ring-[var(--capital-accent,#927025)] shadow-sm'
                      : 'border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] hover:border-[var(--capital-line,#e4dfd3)]'
                  }`}
                  title={`Clique para filtrar lançamentos em ${item.name}`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[var(--capital-text,#242a2e)] truncate" title={item.name}>
                      🏷️ {item.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[var(--capital-accent,#927025)]">
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="font-mono font-bold text-sm text-[var(--capital-accent,#927025)]">
                      R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">
                      {item.count} {item.count === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-[var(--capital-card,#f8fafc)] h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-[var(--capital-soft,#f6f0df)] from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Barra Superior de Filtros e Ações */}
      <div className="p-4 md:p-5 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Busca por Texto */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[var(--capital-muted,#242a2e)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por estabelecimento, categoria, hospital, conta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-muted,#242a2e)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Linha */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Tipo (Despesas x Receitas x Todos) */}
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value as 'ALL' | 'EXPENSE' | 'INCOME')}
              className="rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none cursor-pointer"
            >
              <option value="ALL">🌐 Todos os Lançamentos</option>
              <option value="EXPENSE">🔴 Apenas Despesas (-)</option>
              <option value="INCOME">🟢 Apenas Receitas (+)</option>
            </select>

            {/* Filtro por Mês / Período */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] focus:outline-none cursor-pointer"
            >
              {availablePeriods.map(p => (
                <option key={p} value={p}>{formatPeriodLabel(p)}</option>
              ))}
              <option value="ALL">📅 Todos os Meses ({transactions.length})</option>
            </select>

            {/* Filtro por Conta/Cartão */}
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas as Contas / Cartões</option>
              {availableAccounts.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>

            {/* Filtro por Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas as Categorias</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Filtro por Subdivisão (Hospital / Local) */}
            {availableSubdivisions.length > 0 && (
              <select
                value={selectedSubdivision}
                onChange={(e) => setSelectedSubdivision(e.target.value)}
                className="rounded-xl bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-semibold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos os Hospitais / Locais</option>
                {availableSubdivisions.map(subdiv => (
                  <option key={subdiv} value={subdiv}>🏥 {subdiv}</option>
                ))}
              </select>
            )}

            {/* Filtro Inteligente com IA & Jev */}
            <select
              value={aiFilter}
              onChange={(e) => setAiFilter(e.target.value as any)}
              className="rounded-xl bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-semibold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Filtro IA: Todos</option>
              <option value="PENDING">⚠️ Somente Pendentes ({uncategorizedItems.length})</option>
              <option value="JEV_SUGGESTIONS">✨ Sugestões Jev (Modo Sombra)</option>
              <option value="LOW_CONFIDENCE">🔍 Baixa Confiança (&lt;70%)</option>
              <option value="NEEDS_REVIEW">🛡️ Revisão Obrigatória</option>
            </select>

            {/* Botão de Categorização em Lote com Jev (TypeSafe AI) */}
            <button
              onClick={handleCategorizePendingWithAi}
              disabled={isAiBatchRunning || uncategorizedItems.length === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                isAiBatchRunning 
                  ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)]'
                  : 'bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] shadow-none active:scale-95'
              }`}
              title="Aciona o Jev em fila concorrente para sugerir categorias para todos os lançamentos pendentes em modo sombra"
            >
              {isAiBatchRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando Jev ({aiBatchProgress?.current || 0}/{aiBatchProgress?.total || 0})...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>✨ Categorizar Pendentes com IA</span>
                </>
              )}
            </button>

            {/* Alternar Visualização de Ignorados */}
            <button
              onClick={() => setShowIgnored(!showIgnored)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showIgnored 
                  ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'
                  : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)]'
              }`}
              title="Mostrar ou ocultar lançamentos marcados como deduplicados / ignorados"
            >
              {showIgnored ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showIgnored ? 'Ocultar Deduplicados' : 'Ver Deduplicados'}</span>
            </button>

            {/* Botão de Adicionar Novo Lançamento Manual */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Resumo de Totais do Extrato */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
              Lançamentos: <strong className="text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] font-mono">{metrics.count}</strong>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-bold">
              🟢 Receitas (+): <strong className="font-mono">R$ {metrics.incomeActive.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--capital-danger-soft,#fcecec)] border border-[var(--capital-danger,#ad3333)] text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)] font-bold">
              🔴 Despesas (-): <strong className="font-mono">R$ {metrics.expenseActive.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold ${
              metrics.netBalance >= 0 
                ? 'bg-[var(--capital-soft,#f6f0df)] border-[var(--capital-accent,#927025)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'
                : 'bg-[var(--capital-warning-soft,#fcf1dc)] border-[var(--capital-warning,#8b5b15)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]'
            }`}>
              ⚖️ Saldo Líquido: <strong className="font-mono">{metrics.netBalance >= 0 ? '+' : ''}R$ {metrics.netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>

            {metrics.deduplicatedVal > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] font-medium">
                👁️ Deduplicados: <strong className="font-mono">R$ {metrics.deduplicatedVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--capital-muted,#242a2e)] hidden md:inline">
            Clique no cabeçalho de qualquer coluna para ordenar ou no ícone de lápis para editar.
          </span>
        </div>
      </div>

      {/* 5. Tabela Granular de Transações Item a Item */}
      <div className="rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] shadow-sm overflow-hidden">
        {/* Banner de Lote Ativo no topo da Tabela */}
        {selectedTxIds.size > 0 && (
          <div className="p-3 bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] border-b border-[var(--capital-accent,#927025)] flex flex-wrap items-center justify-between gap-2 px-4 text-xs font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--capital-success,#157449)]" />
              <span><strong>{selectedTxIds.size}</strong> lançamento(s) selecionado(s)</span>
              <span className="font-mono font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] bg-[var(--capital-soft,#f6f0df)] px-2 py-0.5 rounded-md">
                Total: R$ {selectedTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectOnlyUncategorized}
                className="px-2.5 py-1 rounded-lg bg-[var(--capital-warning-soft,#fcf1dc)] hover:bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] text-[11px] font-bold cursor-pointer transition-colors"
              >
                Marcar só pendentes ({uncategorizedInViewCount})
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1 rounded-lg bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-card,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)] text-[11px] font-bold cursor-pointer transition-colors"
              >
                Desmarcar todos
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] uppercase tracking-wider font-semibold select-none">
              <tr>
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos"
                    checked={filteredList.length > 0 && selectedTxIds.size === filteredList.length}
                    onChange={handleToggleSelectAll}
                    className="rounded text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] cursor-pointer w-4 h-4"
                    title="Selecionar / Desmarcar todos os visíveis"
                  />
                </th>
                <th 
                  onClick={() => handleSort('date')} 
                  className="py-3 px-4 cursor-pointer hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors"
                  title="Clique para ordenar por data"
                >
                  <div className="flex items-center gap-1">
                    <span>Data</span>
                    <span className="text-[11px]">{sortField === 'date' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('description')} 
                  className="py-3 px-4 cursor-pointer hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors"
                  title="Clique para ordenar por estabelecimento / descrição"
                >
                  <div className="flex items-center gap-1">
                    <span>Estabelecimento / Descrição</span>
                    <span className="text-[11px]">{sortField === 'description' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('accountOrCard')} 
                  className="py-3 px-4 cursor-pointer hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors"
                  title="Clique para ordenar por conta / cartão"
                >
                  <div className="flex items-center gap-1">
                    <span>Conta / Cartão</span>
                    <span className="text-[11px]">{sortField === 'accountOrCard' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('category')} 
                  className="py-3 px-4 cursor-pointer hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors"
                  title="Clique para ordenar por categoria"
                >
                  <div className="flex items-center gap-1">
                    <span>Categoria / Subcategoria / Hospital</span>
                    <span className="text-[11px]">{sortField === 'category' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center">
                  <span>Origem / IA</span>
                </th>
                <th 
                  onClick={() => handleSort('amount')} 
                  className="py-3 px-4 text-right cursor-pointer hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors"
                  title="Clique para ordenar por valor"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Valor (R$)</span>
                    <span className="text-[11px]">{sortField === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('isIgnored')} 
                  className="py-3 px-4 text-center cursor-pointer hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors"
                  title="Clique para ordenar por status"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <span className="text-[11px]">{sortField === 'isIgnored' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--capital-line,#e4dfd3)] dark:divide-[var(--capital-line,#e4dfd3)]">
              {sortedList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--capital-muted,#242a2e)]">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                sortedList.map((tx) => {
                  const isPositive = tx.amount > 0
                  const isUncat = GranularTransactionStore.isUncategorized(tx)
                  const isSelected = selectedTxIds.has(tx.id)

                  return (
                    <tr 
                      key={tx.id} 
                      className={`hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-white/[0.02] transition-colors ${
                        isSelected 
                          ? 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] ring-1 ring-inset ring-[var(--capital-accent,#927025)]'
                          : tx.isIgnored 
                            ? 'opacity-50 bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]'
                            : isUncat 
                              ? 'bg-[var(--capital-warning-soft,#fcf1dc)] dark:bg-[var(--capital-warning-soft,#fcf1dc)]'
                              : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          aria-label={`Selecionar ${tx.description}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelectTx(tx.id)}
                          className="rounded text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] whitespace-nowrap">
                        <span title={tx.originalDate && tx.originalDate !== tx.date ? `Data original da compra: ${tx.originalDate}` : undefined}>{tx.date}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] max-w-xs truncate" title={tx.description}>
                        {tx.description}
                        {tx.isDuplicateSuspect && (
                          <span className="ml-2 text-[10px] font-bold text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)] px-1.5 py-0.5 rounded border border-[var(--capital-warning,#8b5b15)]">
                            Fatura Cartão
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[11px] font-medium">
                          <CreditCard className="w-3 h-3 text-[var(--capital-muted,#242a2e)]" />
                          {tx.accountOrCard}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                              {tx.category || <span className="text-[var(--capital-warning,#8b5b15)] font-bold">⚠️ Sem Categoria</span>}
                            </span>
                            {isUncat && (
                              <button
                                onClick={() => handleOpenEdit(tx)}
                                className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-[var(--capital-button-text,#242a2e)] hover:bg-amber-400 transition-colors"
                              >
                                Classificar
                              </button>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">
                              {tx.subcategory || <span className="text-[var(--capital-warning,#8b5b15)]">⚠️ Sem Subcategoria</span>}
                            </span>

                            {/* Subdivisão Nível 3 (Hospital / Local) */}
                            {tx.subdivision && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]">
                                🏥 {tx.subdivision}
                              </span>
                            )}

                            {/* Vínculo de Investimento */}
                            {tx.investmentAsset && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
                                💼 {tx.investmentAction === 'APORTE' ? 'Aporte:' : 'Resgate:'} {tx.investmentAsset}
                              </span>
                            )}
                          </div>

                          {/* Bloco de Sugestão Jev (Modo Sombra) */}
                          {tx.aiSuggestedCategory && tx.categorizationStatus !== 'confirmed' && (
                            <div className="mt-1.5 p-1.5 rounded-lg bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] flex items-center justify-between gap-1.5 animate-in fade-in">
                              <div className="flex items-center gap-1 text-[10px] text-[var(--capital-accent,#927025)] font-medium truncate">
                                <Sparkles className="w-3 h-3 text-[var(--capital-accent,#927025)] shrink-0" />
                                <span>
                                  <strong>{tx.aiSuggestedCategory}</strong> &gt; {tx.aiSuggestedSubcategory}
                                </span>
                                {typeof tx.categoryConfidence === 'number' && (
                                  <span className="text-[9px] font-mono font-bold text-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] px-1 py-0.2 rounded">
                                    {(tx.categoryConfidence * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAcceptAiSuggestion(tx)}
                                  className="px-1.5 py-0.5 rounded bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] text-[10px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                                  title="Aceitar sugestão da IA"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Aceitar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectAiSuggestion(tx)}
                                  className="px-1 py-0.5 rounded bg-[var(--capital-card,#f8fafc)] hover:bg-[var(--capital-card,#f8fafc)] text-[var(--capital-muted,#242a2e)] text-[10px] font-bold transition-colors cursor-pointer"
                                  title="Rejeitar sugestão"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Coluna Origem / IA */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {tx.categorySource === 'local_rule' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]" title={tx.certaintyLabel || 'Regra memorizada'}>
                            <BookmarkCheck className="w-3 h-3" />
                            Regra
                          </span>
                        ) : tx.categorySource === 'jev' || tx.aiSuggestedCategory ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]" title="Sugestão gerada pelo Jev em Modo Sombra">
                            <BrainCircuit className="w-3 h-3 text-[var(--capital-accent,#927025)]" />
                            Jev
                          </span>
                        ) : tx.categorySource === 'manual' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]">
                            Manual
                          </span>
                        ) : isUncat ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)]">
                            Pendente
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">
                            Importado
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        tx.isIgnored 
                          ? 'text-[var(--capital-muted,#242a2e)] line-through'
                          : isPositive 
                            ? 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
                            : 'text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]'
                      }`}>
                        {isPositive ? '+' : '-'} R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {tx.isIgnored ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)] px-2 py-0.5 rounded-full border border-[var(--capital-warning,#8b5b15)]">
                            Deduplicado
                          </span>
                        ) : isUncat ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)] px-2 py-0.5 rounded-full border border-[var(--capital-warning,#8b5b15)]">
                            ⚠️ Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] bg-[var(--capital-soft,#f6f0df)] px-2 py-0.5 rounded-full border border-[var(--capital-accent,#927025)]">
                            Ativo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 rounded-lg text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-success,#157449)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors cursor-pointer"
                            title="Editar lançamento e classificar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleIgnore(tx.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              tx.isIgnored 
                                ? 'text-[var(--capital-warning,#8b5b15)] hover:bg-[var(--capital-warning-soft,#fcf1dc)]'
                                : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-muted,#242a2e)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)]'
                            }`}
                            title={tx.isIgnored ? 'Reativar no cálculo de despesas' : 'Deduplicar / Ignorar do cálculo'}
                          >
                            {tx.isIgnored ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] hover:bg-[var(--capital-danger-soft,#fcecec)] transition-colors cursor-pointer"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. MODAL DE EDIÇÃO INDIVIDUAL DA DESPESA / RECEITA */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] shadow-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--capital-line,#e4dfd3)] pb-3">
              <h3 className="font-bold text-base text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[var(--capital-success,#157449)]" />
                Editar Lançamento Individual
              </h3>
              <button 
                onClick={() => setEditingTx(null)}
                className="text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* TOGGLE: DESPESA (-) VS RECEITA (+) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                  Tipo de Lançamento
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)]">
                  <button
                    type="button"
                    onClick={() => {
                      const firstCat = expenseCategories[0] || 'Transporte'
                      const availableSubs = getSubcategoriesForCategory(firstCat)
                      setEditForm(prev => ({
                        ...prev,
                        txType: 'EXPENSE',
                        category: firstCat,
                        isCustomCategory: false,
                        subcategory: availableSubs.length > 0 ? availableSubs[0] : 'Outros',
                        isCustomSubcategory: false
                      }))
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      editForm.txType === 'EXPENSE'
                        ? 'bg-rose-600 text-white font-semibold shadow-md'
                        : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)]'
                    }`}
                  >
                    <span>🔴 Despesa (-)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstCat = incomeCategories[0] || 'Receita PF & Pró-Labore'
                      const availableSubs = getSubcategoriesForCategory(firstCat)
                      setEditForm(prev => ({
                        ...prev,
                        txType: 'INCOME',
                        category: firstCat,
                        isCustomCategory: false,
                        subcategory: availableSubs.length > 0 ? availableSubs[0] : 'Outros',
                        isCustomSubcategory: false
                      }))
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      editForm.txType === 'INCOME'
                        ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-semibold shadow-md'
                        : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-button-text,#211f19)]'
                    }`}
                  >
                    <span>🟢 Receita (+)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                  Estabelecimento / Descrição
                </label>
                <input 
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                    Valor (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                    Data
                  </label>
                  <input 
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block">
                      Categoria ({editForm.txType === 'INCOME' ? 'Receita' : 'Despesa'})
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenInvestmentLink('EDIT', 'APORTE')}
                      className="text-[10px] font-bold text-[var(--capital-success,#157449)] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <PieChart className="w-3 h-3" />
                      <span>{editForm.investmentAsset ? 'Ativo OK' : 'Investimento?'}</span>
                    </button>
                  </div>

                  {!editForm.isCustomCategory ? (
                    <select
                      value={editForm.category}
                      onChange={(e) => {
                        const newCat = e.target.value
                        if (newCat === 'NEW_CATEGORY') {
                          setEditForm(prev => ({ 
                            ...prev, 
                            isCustomCategory: true, 
                            customCategory: '', 
                            isCustomSubcategory: true, 
                            customSubcategory: '' 
                          }))
                        } else {
                          const availableSubs = getSubcategoriesForCategory(newCat)
                          setEditForm(prev => ({
                            ...prev,
                            category: newCat,
                            isCustomCategory: false,
                            subcategory: availableSubs.length > 0 ? availableSubs[0] : prev.subcategory,
                            isCustomSubcategory: false
                          }))
                        }
                      }}
                      className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                    >
                      <option value="">-- Selecione uma Categoria --</option>
                      {(editForm.txType === 'INCOME' ? incomeCategories : expenseCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="NEW_CATEGORY">✨ + Criar Nova Categoria...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Nome da Nova Categoria"
                        value={editForm.customCategory}
                        onChange={(e) => setEditForm({ ...editForm, customCategory: e.target.value })}
                        className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-bold text-[var(--capital-success,#157449)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, isCustomCategory: false, category: expenseCategories[0] || '' })}
                        className="text-[10px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1"
                        title="Voltar às categorias existentes"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                    Subcategoria
                  </label>
                  {(!editForm.isCustomCategory && !editForm.isCustomSubcategory) ? (
                    <select
                      value={editForm.subcategory}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === 'NEW_SUBCATEGORY') {
                          setEditForm(prev => ({ ...prev, isCustomSubcategory: true, customSubcategory: '' }))
                        } else {
                          setEditForm(prev => ({ ...prev, subcategory: val, isCustomSubcategory: false }))
                        }
                      }}
                      className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                    >
                      <option value="">-- Selecione uma Subcategoria --</option>
                      {getSubcategoriesForCategory(editForm.category).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="NEW_SUBCATEGORY">✨ + Criar Nova Subcategoria...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Nome da Nova Subcategoria"
                        value={editForm.customSubcategory}
                        onChange={(e) => setEditForm({ ...editForm, customSubcategory: e.target.value })}
                        className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-bold text-[var(--capital-success,#157449)] focus:outline-none"
                      />
                      {!editForm.isCustomCategory && (
                        <button
                          type="button"
                          onClick={() => setEditForm({ ...editForm, isCustomSubcategory: false })}
                          className="text-[10px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Subdivisão Nível 3 (Hospital / Local / Tag) */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-accent,#927025)] block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Subdivisão Nível 3 (Local / Hospital / Tag)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Hospital Madre Teresa, Presente Casamento..."
                  value={editForm.subdivision}
                  onChange={(e) => setEditForm({ ...editForm, subdivision: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                />

                {/* Chips e Sugestões Nível 3 para a categoria selecionada */}
                {getSubdivisionsForScope(editForm.category, editForm.subcategory).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-[var(--capital-accent,#927025)] font-semibold w-full block">Subdivisões Existentes:</span>
                    {getSubdivisionsForScope(editForm.category, editForm.subcategory).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setEditForm(prev => ({
                          ...prev,
                          subdivision: tag
                        }))}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                          editForm.subdivision === tag
                            ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] border-[var(--capital-accent,#927025)] font-bold'
                            : 'bg-[var(--capital-card,#f8fafc)] text-[var(--capital-accent,#927025)] border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-accent,#927025)]'
                        }`}
                      >
                        🏷️ {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Vínculo de Investimento */}
              {editForm.investmentAsset && (
                <div className="p-2.5 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--capital-success,#157449)] font-bold truncate">
                    <PieChart className="w-3.5 h-3.5 shrink-0" />
                    <span>Vinculado a: <strong>{editForm.investmentAsset}</strong> ({editForm.investmentAction === 'APORTE' ? 'Aporte' : 'Resgate'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenInvestmentLink('EDIT', editForm.investmentAction || 'APORTE')}
                    className="text-[10px] text-[var(--capital-success,#157449)] underline font-bold cursor-pointer"
                  >
                    Trocar Ativo
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-[var(--capital-line,#e4dfd3)] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-text,#242a2e)]">
                  <input 
                    type="checkbox"
                    checked={editForm.isFixed}
                    onChange={(e) => setEditForm({ ...editForm, isFixed: e.target.checked })}
                    className="rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] w-4 h-4 cursor-pointer"
                  />
                  <span>Despesa fixa recorrente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-success,#157449)] font-semibold">
                  <input 
                    type="checkbox"
                    checked={editForm.updateRuleToo}
                    onChange={(e) => setEditForm({ ...editForm, updateRuleToo: e.target.checked })}
                    className="rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] w-4 h-4 cursor-pointer"
                  />
                  <span>Sempre categorizar lançamentos semelhantes nesta categoria</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--capital-line,#e4dfd3)]">
              <button
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] text-xs font-bold text-[var(--capital-text,#242a2e)] hover:text-[var(--capital-text,#242a2e)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-none cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE ADIÇÃO MANUAL DE NOVO LANÇAMENTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-md animate-in fade-in duration-150">
          <form onSubmit={handleCreateNew} className="w-full max-w-lg rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] shadow-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--capital-line,#e4dfd3)] pb-3">
              <h3 className="font-bold text-base text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[var(--capital-success,#157449)]" />
                Novo Lançamento Manual
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* TOGGLE: NOVAN DESPESA (-) VS NOVA RECEITA (+) */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                  Tipo de Lançamento
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)]">
                  <button
                    type="button"
                    onClick={() => {
                      const firstCat = expenseCategories[0] || 'Alimentação'
                      const availableSubs = getSubcategoriesForCategory(firstCat)
                      setNewForm(prev => ({
                        ...prev,
                        txType: 'EXPENSE',
                        category: firstCat,
                        isCustomCategory: false,
                        subcategory: availableSubs.length > 0 ? availableSubs[0] : 'Outros',
                        isCustomSubcategory: false
                      }))
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newForm.txType === 'EXPENSE'
                        ? 'bg-rose-600 text-white font-semibold shadow-md'
                        : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)]'
                    }`}
                  >
                    <span>🔴 Nova Despesa (-)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstCat = incomeCategories[0] || 'Receita PF & Pró-Labore'
                      const availableSubs = getSubcategoriesForCategory(firstCat)
                      setNewForm(prev => ({
                        ...prev,
                        txType: 'INCOME',
                        category: firstCat,
                        isCustomCategory: false,
                        subcategory: availableSubs.length > 0 ? availableSubs[0] : 'Outros',
                        isCustomSubcategory: false
                      }))
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      newForm.txType === 'INCOME'
                        ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-semibold shadow-md'
                        : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-button-text,#211f19)]'
                    }`}
                  >
                    <span>🟢 Nova Receita (+)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                  Estabelecimento / Descrição
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Pix recebido, McDonald's, Plantão Médico..."
                  value={newForm.description}
                  onChange={(e) => {
                    const desc = e.target.value
                    const pred = CategoryRulesEngine.predict(desc, newForm.entityType)
                    setNewForm(prev => ({ 
                      ...prev, 
                      description: desc,
                      category: pred.category || prev.category,
                      subcategory: pred.subcategory || prev.subcategory,
                      subdivision: pred.subdivision || prev.subdivision
                    }))
                  }}
                  className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                    Valor (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={newForm.amount}
                    onChange={(e) => setNewForm({ ...newForm, amount: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                    Data
                  </label>
                  <input 
                    type="date"
                    required
                    value={newForm.date}
                    onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                    Cartão / Conta
                  </label>
                  <select
                    value={newForm.accountOrCard}
                    onChange={(e) => setNewForm({ ...newForm, accountOrCard: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                  >
                    {availableAccounts.map(acc => (
                      <option key={acc} value={acc}>{acc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block">
                      Categoria ({newForm.txType === 'INCOME' ? 'Receita' : 'Despesa'})
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenInvestmentLink('NEW', 'APORTE')}
                      className="text-[10px] font-bold text-[var(--capital-success,#157449)] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <PieChart className="w-3 h-3" />
                      <span>{newForm.investmentAsset ? 'Ativo OK' : 'Investimento?'}</span>
                    </button>
                  </div>

                  {!newForm.isCustomCategory ? (
                    <select
                      value={newForm.category}
                      onChange={(e) => {
                        const newCat = e.target.value
                        if (newCat === 'NEW_CATEGORY') {
                          setNewForm(prev => ({ 
                            ...prev, 
                            isCustomCategory: true, 
                            customCategory: '', 
                            isCustomSubcategory: true, 
                            customSubcategory: '' 
                          }))
                        } else {
                          const availableSubs = getSubcategoriesForCategory(newCat)
                          setNewForm(prev => ({
                            ...prev,
                            category: newCat,
                            isCustomCategory: false,
                            subcategory: availableSubs.length > 0 ? availableSubs[0] : prev.subcategory,
                            isCustomSubcategory: false
                          }))
                        }
                      }}
                      className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                    >
                      <option value="">-- Selecione uma Categoria --</option>
                      {(newForm.txType === 'INCOME' ? incomeCategories : expenseCategories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="NEW_CATEGORY">✨ + Criar Nova Categoria...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Nome da Nova Categoria"
                        value={newForm.customCategory}
                        onChange={(e) => setNewForm({ ...newForm, customCategory: e.target.value })}
                        className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-bold text-[var(--capital-success,#157449)] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setNewForm({ ...newForm, isCustomCategory: false, category: expenseCategories[0] || '' })}
                        className="text-[10px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1"
                        title="Voltar às categorias existentes"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                    Subcategoria
                  </label>
                  {(!newForm.isCustomCategory && !newForm.isCustomSubcategory) ? (
                    <select
                      value={newForm.subcategory}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === 'NEW_SUBCATEGORY') {
                          setNewForm(prev => ({ ...prev, isCustomSubcategory: true, customSubcategory: '' }))
                        } else {
                          setNewForm(prev => ({ ...prev, subcategory: val, isCustomSubcategory: false }))
                        }
                      }}
                      className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                    >
                      <option value="">-- Selecione uma Subcategoria --</option>
                      {getSubcategoriesForCategory(newForm.category).map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="NEW_SUBCATEGORY">✨ + Criar Nova Subcategoria...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Nome da Nova Subcategoria"
                        value={newForm.customSubcategory}
                        onChange={(e) => setNewForm({ ...newForm, customSubcategory: e.target.value })}
                        className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-bold text-[var(--capital-success,#157449)] focus:outline-none"
                      />
                      {!newForm.isCustomCategory && (
                        <button
                          type="button"
                          onClick={() => setNewForm({ ...newForm, isCustomSubcategory: false })}
                          className="text-[10px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-accent,#927025)] block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Subdivisão (Hospital / Local / Tag)
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Hospital Madre Teresa, Presente Casamento..."
                    value={newForm.subdivision}
                    onChange={(e) => setNewForm({ ...newForm, subdivision: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              {/* Chips e Sugestões Nível 3 para a nova despesa */}
              {getSubdivisionsForScope(newForm.category, newForm.subcategory).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-[var(--capital-accent,#927025)] font-semibold w-full block">Subdivisões Existentes:</span>
                  {getSubdivisionsForScope(newForm.category, newForm.subcategory).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewForm(prev => ({
                        ...prev,
                        subdivision: tag
                      }))}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                        newForm.subdivision === tag
                          ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] border-[var(--capital-accent,#927025)] font-bold'
                          : 'bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-accent,#927025)]'
                      }`}
                    >
                      🏷️ {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Vínculo de Investimento */}
              {newForm.investmentAsset && (
                <div className="p-2.5 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--capital-success,#157449)] font-bold truncate">
                    <PieChart className="w-3.5 h-3.5 shrink-0" />
                    <span>Vinculado a: <strong>{newForm.investmentAsset}</strong> ({newForm.investmentAction === 'APORTE' ? 'Aporte' : 'Resgate'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenInvestmentLink('NEW', newForm.investmentAction || 'APORTE')}
                    className="text-[10px] text-[var(--capital-success,#157449)] underline font-bold cursor-pointer"
                  >
                    Trocar Ativo
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-[var(--capital-line,#e4dfd3)] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-text,#242a2e)]">
                  <input 
                    type="checkbox"
                    checked={newForm.isFixed}
                    onChange={(e) => setNewForm({ ...newForm, isFixed: e.target.checked })}
                    className="rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] w-4 h-4 cursor-pointer"
                  />
                  <span>Lançamento fixo recorrente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-success,#157449)] font-semibold">
                  <input 
                    type="checkbox"
                    checked={newForm.saveAsRule}
                    onChange={(e) => setNewForm({ ...newForm, saveAsRule: e.target.checked })}
                    className="rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] w-4 h-4 cursor-pointer"
                  />
                  <span>Lembrar e sempre categorizar lançamentos semelhantes nesta categoria</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--capital-line,#e4dfd3)]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] text-xs font-bold text-[var(--capital-text,#242a2e)] hover:text-[var(--capital-text,#242a2e)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-none cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Salvar Lançamento</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. MODAL DE VÍNCULO DE INVESTIMENTO */}
      <InvestmentLinkModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        actionType={investContext.action}
        transactionAmount={investContext.amount}
        transactionDate={investContext.date}
        transactionDescription={investContext.desc}
        onSelectAsset={handleAssetSelected}
      />

      {/* 9. BARRA FLUTUANTE DE CATEGORIZAÇÃO EM LOTE */}
      {selectedTxIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl rounded-xl bg-[var(--capital-card,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border-2 border-[var(--capital-accent,#927025)] shadow-sm backdrop-blur-xl p-4 text-[var(--capital-text,#242a2e)] animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--capital-line,#e4dfd3)] pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                  <span>Categorizar {selectedTxIds.size} lançamento(s) selecionado(s)</span>
                  <span className="font-mono text-[var(--capital-success,#157449)] font-semibold text-xs bg-[var(--capital-soft,#f6f0df)] px-2 py-0.5 rounded border border-[var(--capital-accent,#927025)]">
                    Total: R$ {selectedTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </h4>
                <p className="text-[10px] text-[var(--capital-muted,#242a2e)]">
                  Defina a categoria e subcategoria desejadas para aplicar a todos simultaneamente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto text-xs">
              <button
                type="button"
                onClick={handleSelectOnlyUncategorized}
                className="text-[11px] font-semibold text-[var(--capital-warning,#8b5b15)] hover:underline cursor-pointer"
              >
                Marcar só pendentes ({uncategorizedInViewCount})
              </button>
              <span className="text-[var(--capital-muted,#242a2e)]">|</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[11px] font-semibold text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] cursor-pointer"
              >
                Desmarcar ({selectedTxIds.size})
              </button>
            </div>
          </div>

          {/* Seletores de Categoria e Subcategoria com Filtro Despesa vs Receita */}
          <div className="space-y-3">
            {/* TOGGLE DESPESA VS RECEITA NA BARRA DE LOTE */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[var(--capital-card,#f8fafc)] p-1 rounded-xl border border-[var(--capital-line,#e4dfd3)]">
                <button
                  type="button"
                  onClick={() => {
                    setBulkTxType('EXPENSE')
                    const firstCat = expenseCategories[0] || 'Transporte'
                    setBulkCategory(firstCat)
                    const subs = getSubcategoriesForCategory(firstCat)
                    setBulkSubcategory(subs[0] || 'Outros')
                    setIsBulkCustomCategory(false)
                    setIsBulkCustomSubcategory(false)
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    bulkTxType === 'EXPENSE'
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)]'
                  }`}
                >
                  <span>🔴 Despesas</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkTxType('INCOME')
                    const firstCat = incomeCategories[0] || 'Receita PF & Pró-Labore'
                    setBulkCategory(firstCat)
                    const subs = getSubcategoriesForCategory(firstCat)
                    setBulkSubcategory(subs[0] || 'Outros')
                    setIsBulkCustomCategory(false)
                    setIsBulkCustomSubcategory(false)
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    bulkTxType === 'INCOME'
                      ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-semibold shadow-xs'
                      : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-button-text,#211f19)]'
                  }`}
                >
                  <span>🟢 Receitas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBulkTxType('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    bulkTxType === 'ALL'
                      ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-semibold shadow-xs'
                      : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-button-text,#211f19)]'
                  }`}
                >
                  <span>🌐 Todas</span>
                </button>
              </div>

              <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">
                Lançamentos marcados serão ajustados para {bulkTxType === 'INCOME' ? 'Receitas (+)' : bulkTxType === 'EXPENSE' ? 'Despesas (-)' : 'o tipo original'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                  Categoria ({bulkTxType === 'INCOME' ? 'Receitas' : bulkTxType === 'EXPENSE' ? 'Despesas' : 'Todas'})
                </label>

                {!isBulkCustomCategory ? (
                  <select
                    value={bulkCategory}
                    onChange={(e) => handleBulkCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                  >
                    {(bulkTxType === 'INCOME' ? incomeCategories : bulkTxType === 'EXPENSE' ? expenseCategories : availableCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="NEW_CATEGORY">✨ + Criar Nova Categoria...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Nova Categoria..."
                      value={bulkCustomCategory}
                      onChange={(e) => setBulkCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] text-xs font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsBulkCustomCategory(false)}
                      className="text-[10px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                  Subcategoria
                </label>
                {(!isBulkCustomCategory && !isBulkCustomSubcategory) ? (
                  <select
                    value={bulkSubcategory}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'NEW_SUBCATEGORY') {
                        setIsBulkCustomSubcategory(true)
                      } else {
                        setIsBulkCustomSubcategory(false)
                        setBulkSubcategory(val)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                  >
                    {getSubcategoriesForCategory(bulkCategory).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="NEW_SUBCATEGORY">✨ + Criar Nova Subcategoria...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Nova Subcategoria..."
                      value={bulkCustomSubcategory}
                      onChange={(e) => setBulkCustomSubcategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] text-xs font-bold focus:outline-none"
                    />
                    {!isBulkCustomCategory && (
                      <button
                        type="button"
                        onClick={() => setIsBulkCustomSubcategory(false)}
                        className="text-[10px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-accent,#927025)] block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Hospital / Local (Opcional)
                </label>
                {!isBulkCustomSubdivision ? (
                  <select
                    value={bulkSubdivision}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'NEW_HOSPITAL') {
                        setIsBulkCustomSubdivision(true)
                      } else {
                        setIsBulkCustomSubdivision(false)
                        setBulkSubdivision(val)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] text-[var(--capital-accent,#927025)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                  >
                    <option value="">Nenhum / Não alterar</option>
                    {hospitalsList.map(hosp => (
                      <option key={hosp} value={hosp}>🏥 {hosp}</option>
                    ))}
                    <option value="NEW_HOSPITAL">➕ + Criar Novo Hospital / Local...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Novo Hospital / Local..."
                      value={bulkCustomSubdivision}
                      onChange={(e) => setBulkCustomSubdivision(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] text-[var(--capital-accent,#927025)] text-xs font-bold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsBulkCustomSubdivision(false)}
                      className="text-[10px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Opção de Regra Inteligente e Botões de Ação */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-[var(--capital-line,#e4dfd3)]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-text,#242a2e)] hover:text-[var(--capital-text,#242a2e)]">
              <input
                type="checkbox"
                checked={bulkLearnRule}
                onChange={(e) => setBulkLearnRule(e.target.checked)}
                className="rounded text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] w-4 h-4 cursor-pointer"
              />
              <span className="text-[11px]">
                Memorizar como <strong>regra inteligente permanente</strong> para os próximos meses
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-2 rounded-xl bg-[var(--capital-danger-soft,#fcecec)] hover:bg-[var(--capital-danger-soft,#fcecec)] text-[var(--capital-danger,#ad3333)] text-xs font-bold border border-[var(--capital-danger,#ad3333)] flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Excluir lançamentos selecionados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir ({selectedTxIds.size})</span>
              </button>

              <button
                type="button"
                onClick={handleApplyBulkCategorization}
                className="px-5 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center gap-2 shadow-sm shadow-none transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar a Todos ({selectedTxIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resumo da Categorização com IA / Jev */}
      {aiBatchSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] text-[var(--capital-text,#242a2e)] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--capital-line,#e4dfd3)]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]">
                  <BrainCircuit className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[var(--capital-text,#242a2e)]">Resumo da Execução Jev (Modo Sombra)</h3>
                  <p className="text-xs text-[var(--capital-muted,#242a2e)]">Classificação inteligente em 2 camadas concluída</p>
                </div>
              </div>
              <button 
                onClick={() => setAiBatchSummary(null)} 
                className="text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] space-y-0.5">
                <span className="text-[var(--capital-muted,#242a2e)] text-[10px] uppercase font-semibold">Total Processado</span>
                <p className="text-lg font-mono font-bold text-[var(--capital-text,#242a2e)]">{aiBatchSummary.total_processed} itens</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] space-y-0.5">
                <span className="text-[var(--capital-accent,#927025)] text-[10px] uppercase font-semibold">Sugestões Geradas</span>
                <p className="text-lg font-mono font-bold text-[var(--capital-accent,#927025)]">{aiBatchSummary.suggested_count + aiBatchSummary.auto_applied_count}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] space-y-0.5">
                <span className="text-[var(--capital-warning,#8b5b15)] text-[10px] uppercase font-semibold">Revisão Humana Obrigatória</span>
                <p className="text-lg font-mono font-bold text-[var(--capital-warning,#8b5b15)]">{aiBatchSummary.needs_review_count}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] space-y-0.5">
                <span className="text-[var(--capital-muted,#242a2e)] text-[10px] uppercase font-semibold">Custo Estimado</span>
                <p className="text-lg font-mono font-bold text-[var(--capital-success,#157449)]">${aiBatchSummary.estimated_cost_usd} USD</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[11px] text-[var(--capital-accent,#927025)] flex items-start gap-2">
              <Info className="w-4 h-4 text-[var(--capital-accent,#927025)] shrink-0 mt-0.5" />
              <span>
                <strong>Modo Sombra Ativo:</strong> As sugestões estão visíveis diretamente na tabela com badges roxos. Você pode confirmar com 1 clique (✓) ou rejeitar (✕). Nenhuma categoria foi modificada automaticamente sem o seu consentimento.
              </span>
            </div>

            <button
              onClick={() => setAiBatchSummary(null)}
              className="w-full py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold text-xs transition-colors cursor-pointer"
            >
              Entendido, ver sugestões na tabela
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {bulkToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold text-xs shadow-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bulkToast}</span>
        </div>
      )}
    </div>
  )
}
