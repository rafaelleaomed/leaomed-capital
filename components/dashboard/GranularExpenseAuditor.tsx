'use client'

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
  Sparkles
} from 'lucide-react'
import { 
  GranularTransactionStore, 
  GranularTransaction 
} from '@/utils/granularTransactionStore'
import { CategoryRulesEngine } from '@/utils/categoryRulesEngine'
import { InvestmentLinkModal } from './InvestmentLinkModal'

interface GranularExpenseAuditorProps {
  currentFilter?: string
  isDemo?: boolean
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

export const STANDARD_TAXONOMY: Record<string, string[]> = {
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
  'Resgate de Investimentos': [
    'Resgate de Capital',
    'Resgate de Emergência',
    'Outros'
  ],
  'Pagamento de Fatura': [
    'Deduplicado / Débito de Cartão',
    'Fatura Cartão C6',
    'Fatura Itaú',
    'Fatura Nubank'
  ]
}

export function GranularExpenseAuditor({ currentFilter = 'PF', isDemo = false }: GranularExpenseAuditorProps) {
  const [transactions, setTransactions] = useState<GranularTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedSubdivision, setSelectedSubdivision] = useState<string>('ALL')
  const [showIgnored, setShowIgnored] = useState(true)
  const [onlyUncategorized, setOnlyUncategorized] = useState(false)

  // Seleção Múltipla & Categorização em Lote
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set())
  const [bulkCategory, setBulkCategory] = useState<string>('Transporte')
  const [bulkSubcategory, setBulkSubcategory] = useState<string>('Estacionamentos')
  const [bulkSubdivision, setBulkSubdivision] = useState<string>('')
  const [bulkLearnRule, setBulkLearnRule] = useState<boolean>(true)
  const [bulkToast, setBulkToast] = useState<string | null>(null)

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
    description: '',
    amount: '',
    date: '',
    accountOrCard: '',
    category: '',
    subcategory: '',
    subdivision: '',
    investmentAsset: '',
    investmentAction: null as 'APORTE' | 'RESGATE' | null,
    isFixed: false,
    updateRuleToo: true
  })

  // Formulário de Nova Despesa
  const [newForm, setNewForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    accountOrCard: 'Cartão C6 Carbon Black',
    category: 'Alimentação',
    subcategory: 'Restaurantes & Fast Food',
    subdivision: '',
    investmentAsset: '',
    investmentAction: null as 'APORTE' | 'RESGATE' | null,
    entityType: 'PF' as 'PF' | 'PJ',
    isFixed: false,
    saveAsRule: true
  })

  // Carrega transações e ouve eventos de atualização
  const loadTransactions = () => {
    const list = GranularTransactionStore.getAll()
    setTransactions(list)
  }

  useEffect(() => {
    loadTransactions()
    const handleUpdate = () => loadTransactions()
    window.addEventListener('leaomed_transactions_updated', handleUpdate)
    return () => window.removeEventListener('leaomed_transactions_updated', handleUpdate)
  }, [])

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

  // Estatísticas de Estacionamento & Hospitais (Subdivisão Nível 3)
  const hospitalStats = useMemo(() => {
    const parkItems = transactions.filter(t => 
      !t.isIgnored && 
      (t.subcategory?.toLowerCase().includes('estacionamento') || 
       t.description?.toLowerCase().includes('estacionamento') || 
       Boolean(t.subdivision))
    )

    const map: Record<string, { total: number; count: number }> = {}
    let overallParkingTotal = 0

    parkItems.forEach(t => {
      const hospitalName = t.subdivision || 'Outros / Sem Hospital'
      const val = Math.abs(t.amount)
      overallParkingTotal += val
      if (!map[hospitalName]) {
        map[hospitalName] = { total: 0, count: 0 }
      }
      map[hospitalName].total += val
      map[hospitalName].count += 1
    })

    const list = Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      pct: overallParkingTotal > 0 ? (data.total / overallParkingTotal) * 100 : 0
    })).sort((a, b) => b.total - a.total)

    return {
      list,
      overallParkingTotal,
      hasData: list.length > 0
    }
  }, [transactions])

  // Filtragem
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      // Filtro de entidade
      if (currentFilter === 'PF' && t.entityType !== 'PF') return false
      if (currentFilter === 'PJ' && t.entityType !== 'PJ') return false

      // Filtro exclusivo de pendentes
      if (onlyUncategorized && !GranularTransactionStore.isUncategorized(t)) return false

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
  }, [transactions, currentFilter, onlyUncategorized, selectedAccount, selectedCategory, selectedSubdivision, showIgnored, searchTerm])

  // Métricas do extrato granular
  const totalActive = useMemo(() => {
    return filteredList
      .filter(t => !t.isIgnored)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  }, [filteredList])

  const totalDeduplicated = useMemo(() => {
    return filteredList
      .filter(t => t.isIgnored)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  }, [filteredList])

  // Lista única de contas e categorias existentes
  const availableAccounts = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach(t => {
      if (currentFilter === 'ALL' || t.entityType === currentFilter) {
        set.add(t.accountOrCard)
      }
    })
    return Array.from(set)
  }, [transactions, currentFilter])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach(t => {
      if (t.category && t.category.trim()) set.add(t.category)
    })
    return Array.from(set)
  }, [transactions])

  const availableSubdivisions = useMemo(() => {
    const set = new Set<string>()
    transactions.forEach(t => {
      if (t.subdivision && t.subdivision.trim()) set.add(t.subdivision)
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
    setBulkCategory(cat)
    if (STANDARD_TAXONOMY[cat] && STANDARD_TAXONOMY[cat].length > 0) {
      setBulkSubcategory(STANDARD_TAXONOMY[cat][0])
    }
  }

  const handleApplyBulkCategorization = () => {
    if (selectedTxIds.size === 0) return
    if (!bulkCategory.trim()) return

    const count = selectedTxIds.size
    const targets = Array.from(selectedTxIds)

    targets.forEach(id => {
      const tx = transactions.find(t => t.id === id)
      if (tx) {
        if (bulkLearnRule && tx.description) {
          CategoryRulesEngine.saveRule({
            pattern: tx.description,
            category: bulkCategory.trim(),
            subcategory: bulkSubcategory.trim(),
            subdivision: bulkSubdivision.trim() || undefined,
            entityType: tx.entityType,
            alwaysApply: true
          })
        }
        GranularTransactionStore.updateTransaction(id, {
          category: bulkCategory.trim(),
          subcategory: bulkSubcategory.trim(),
          subdivision: bulkSubdivision.trim() || tx.subdivision
        })
      }
    })

    setSelectedTxIds(new Set())
    loadTransactions()
    setBulkToast(`✅ ${count} lançamentos categorizados com sucesso em "${bulkCategory} > ${bulkSubcategory}"!`)
    setTimeout(() => setBulkToast(null), 4500)
  }

  const handleBulkDelete = () => {
    if (selectedTxIds.size === 0) return
    const count = selectedTxIds.size
    if (!confirm(`Deseja realmente excluir os ${count} lançamentos selecionados?`)) return

    selectedTxIds.forEach(id => {
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
    GranularTransactionStore.deleteTransaction(id)
    setDeletingId(null)
  }

  const handleDeduplicateAll = () => {
    GranularTransactionStore.deduplicateAllBillPayments()
  }

  const handleOpenEdit = (tx: GranularTransaction) => {
    setEditingTx(tx)
    setEditForm({
      description: tx.description,
      amount: Math.abs(tx.amount).toFixed(2),
      date: tx.date,
      accountOrCard: tx.accountOrCard,
      category: tx.category,
      subcategory: tx.subcategory,
      subdivision: tx.subdivision || '',
      investmentAsset: tx.investmentAsset || '',
      investmentAction: tx.investmentAction || null,
      isFixed: tx.isFixed,
      updateRuleToo: true
    })
  }

  const handleSaveEdit = () => {
    if (!editingTx) return

    const parsedVal = parseFloat(editForm.amount) || 0
    const finalVal = editingTx.amount < 0 ? -Math.abs(parsedVal) : Math.abs(parsedVal)

    GranularTransactionStore.updateTransaction(editingTx.id, {
      description: editForm.description.trim(),
      amount: finalVal,
      date: editForm.date,
      accountOrCard: editForm.accountOrCard,
      category: editForm.category.trim() || 'Despesas Pessoais',
      subcategory: editForm.subcategory.trim() || 'Diversos',
      subdivision: editForm.subdivision.trim() || undefined,
      investmentAsset: editForm.investmentAsset.trim() || undefined,
      investmentAction: editForm.investmentAction || undefined,
      isFixed: editForm.isFixed
    })

    // Se marcou para salvar como regra permanente
    if (editForm.updateRuleToo && editForm.description.trim().length >= 2) {
      CategoryRulesEngine.saveRule({
        pattern: editForm.description.trim().split(' ')[0],
        category: editForm.category,
        subcategory: editForm.subcategory,
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

    GranularTransactionStore.addTransaction({
      entityType: newForm.entityType,
      date: newForm.date,
      description: newForm.description.trim(),
      amount: -Math.abs(val),
      accountOrCard: newForm.accountOrCard,
      category: newForm.category.trim() || 'Despesas Pessoais',
      subcategory: newForm.subcategory.trim() || 'Diversos',
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
          category: newForm.category,
          subcategory: newForm.subcategory,
          subdivision: newForm.subdivision.trim() || undefined,
          entityType: newForm.entityType,
          alwaysApply: true
        })
      }
    }

    setIsAddModalOpen(false)
    setNewForm({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      accountOrCard: 'Cartão C6 Carbon Black',
      category: 'Alimentação',
      subcategory: 'Restaurantes & Fast Food',
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
        <div className="p-4 md:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mt-0.5 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm md:text-base text-amber-100 flex items-center gap-2">
                  Prevenção de Duplicidade Ativa (Cartão vs Pagamento em Conta)
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Aviso Contábil
                  </span>
                </h4>
                <p className="text-xs text-amber-200/90 mt-1 max-w-2xl leading-relaxed">
                  Como você concentra seus gastos nos <strong>cartões de crédito</strong>, identificamos o débito do pagamento total da fatura na conta corrente concomitantemente aos lançamentos individuais do cartão. O sistema auto-deduplicou os débitos de fatura para não somar seus gastos duas vezes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDeduplicateAll}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
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
        <div className="p-4 md:p-5 rounded-3xl bg-amber-500/15 border border-amber-500/35 text-amber-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-2xl bg-amber-500/25 text-amber-400 border border-amber-500/40 mt-0.5 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm md:text-base text-amber-100 flex items-center gap-2">
                  {uncategorizedItems.length} Lançamento(s) Pendente(s) de Classificação
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Ação Necessária
                  </span>
                </h4>
                <p className="text-xs text-amber-200/90 mt-1 max-w-2xl leading-relaxed">
                  Identificamos <strong>{uncategorizedItems.length} despesa(s)</strong> (totalizando <strong>R$ {uncategorizedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>) sem categoria ou subcategoria definida. Classifique-as para manter a precisão contábil do orçamento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setOnlyUncategorized(!onlyUncategorized)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  onlyUncategorized
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-amber-400/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{onlyUncategorized ? 'Ver Todos os Gastos' : 'Filtrar Pendentes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. WIDGET INTERATIVO: ANÁLISE DETALHADA POR HOSPITAL (ESTACIONAMENTOS NO MÊS) */}
      {hospitalStats.hasData && (
        <div className="p-4 md:p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 text-white space-y-3.5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  Subdivisão Nível 3: Gastos com Estacionamento por Hospital
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Discriminação por Local
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Total de estacionamentos no mês: <strong className="text-white font-mono">R$ {hospitalStats.overallParkingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>
            </div>

            {selectedSubdivision !== 'ALL' && (
              <button
                onClick={() => setSelectedSubdivision('ALL')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                Limpar filtro ({selectedSubdivision})
              </button>
            )}
          </div>

          {/* Grid de Hospitais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {hospitalStats.list.map((hosp) => {
              const isSelected = selectedSubdivision === hosp.name
              return (
                <div
                  key={hosp.name}
                  onClick={() => setSelectedSubdivision(isSelected ? 'ALL' : hosp.name)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-400/40 shadow-sm'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                  title={`Clique para filtrar lançamentos em ${hosp.name}`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white truncate" title={hosp.name}>
                      🏥 {hosp.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-400">
                      {hosp.pct.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="font-mono font-bold text-sm text-indigo-300">
                      R$ {hosp.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {hosp.count} {hosp.count === 1 ? 'ida' : 'idas'}
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, hosp.pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 4. Barra Superior de Filtros e Ações */}
      <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Busca por Texto */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por estabelecimento, categoria, hospital, conta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Linha */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Conta/Cartão */}
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
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
              className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
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
                className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos os Hospitais / Locais</option>
                {availableSubdivisions.map(subdiv => (
                  <option key={subdiv} value={subdiv}>🏥 {subdiv}</option>
                ))}
              </select>
            )}

            {/* Toggle de Pendentes */}
            <button
              onClick={() => setOnlyUncategorized(!onlyUncategorized)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyUncategorized 
                  ? 'border-amber-500 bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/30' 
                  : 'border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-700'
              }`}
              title="Exibir apenas lançamentos sem categoria ou sem subcategoria"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pendentes ({uncategorizedItems.length})</span>
            </button>

            {/* Alternar Visualização de Ignorados */}
            <button
              onClick={() => setShowIgnored(!showIgnored)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showIgnored 
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                  : 'border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-700'
              }`}
              title="Mostrar ou ocultar lançamentos marcados como deduplicados / ignorados"
            >
              {showIgnored ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showIgnored ? 'Ocultar Deduplicados' : 'Ver Deduplicados'}</span>
            </button>

            {/* Botão de Adicionar Despesa Manual */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Adicionar Despesa</span>
            </button>
          </div>
        </div>

        {/* Resumo de Totais do Extrato */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Lançamentos exibidos: <strong className="text-slate-900 dark:text-white font-mono">{filteredList.length}</strong></span>
            <span>Ativos computados: <strong className="text-rose-600 dark:text-rose-400 font-mono">R$ {totalActive.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            {totalDeduplicated > 0 && (
              <span className="text-amber-600 dark:text-amber-400">Deduplicados/Ignorados: <strong className="font-mono">R$ {totalDeduplicated.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 hidden md:inline">
            Clique no ícone de lápis para editar ou classificar qualquer transação individualmente.
          </span>
        </div>
      </div>

      {/* 5. Tabela Granular de Transações Item a Item */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden">
        {/* Banner de Lote Ativo no topo da Tabela */}
        {selectedTxIds.size > 0 && (
          <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/15 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 px-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span><strong>{selectedTxIds.size}</strong> lançamento(s) selecionado(s)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white bg-emerald-500/20 px-2 py-0.5 rounded-md">
                Total: R$ {selectedTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectOnlyUncategorized}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Marcar só pendentes ({uncategorizedInViewCount})
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
              >
                Desmarcar todos
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos"
                    checked={filteredList.length > 0 && selectedTxIds.size === filteredList.length}
                    onChange={handleToggleSelectAll}
                    className="rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer w-4 h-4"
                    title="Selecionar / Desmarcar todos os visíveis"
                  />
                </th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Estabelecimento / Descrição</th>
                <th className="py-3 px-4">Conta / Cartão</th>
                <th className="py-3 px-4">Categoria / Subcategoria / Hospital</th>
                <th className="py-3 px-4 text-right">Valor (R$)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredList.map((tx) => {
                  const isPositive = tx.amount > 0
                  const isUncat = GranularTransactionStore.isUncategorized(tx)
                  const isSelected = selectedTxIds.has(tx.id)

                  return (
                    <tr 
                      key={tx.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                        isSelected 
                          ? 'bg-emerald-500/15 dark:bg-emerald-500/20 ring-1 ring-inset ring-emerald-500/40' 
                          : tx.isIgnored 
                            ? 'opacity-50 bg-slate-100/40 dark:bg-slate-950/20' 
                            : isUncat 
                              ? 'bg-amber-500/5 dark:bg-amber-500/10' 
                              : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          aria-label={`Selecionar ${tx.description}`}
                          checked={isSelected}
                          onChange={() => handleToggleSelectTx(tx.id)}
                          className="rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate" title={tx.description}>
                        {tx.description}
                        {tx.isDuplicateSuspect && (
                          <span className="ml-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Fatura Cartão
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {tx.accountOrCard}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {tx.category || <span className="text-amber-500 font-bold">⚠️ Sem Categoria</span>}
                            </span>
                            {isUncat && (
                              <button
                                onClick={() => handleOpenEdit(tx)}
                                className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
                              >
                                Classificar
                              </button>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-slate-400">
                              {tx.subcategory || <span className="text-amber-500/80">⚠️ Sem Subcategoria</span>}
                            </span>

                            {/* Subdivisão Nível 3 (Hospital / Local) */}
                            {tx.subdivision && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                                🏥 {tx.subdivision}
                              </span>
                            )}

                            {/* Vínculo de Investimento */}
                            {tx.investmentAsset && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                💼 {tx.investmentAction === 'APORTE' ? 'Aporte:' : 'Resgate:'} {tx.investmentAsset}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap ${
                        tx.isIgnored 
                          ? 'text-slate-400 line-through' 
                          : isPositive 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isPositive ? '+' : '-'} R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {tx.isIgnored ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Deduplicado
                          </span>
                        ) : isUncat ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                            ⚠️ Pendente
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Ativo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Editar lançamento e classificar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleIgnore(tx.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              tx.isIgnored 
                                ? 'text-amber-500 hover:bg-amber-500/10' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'
                            }`}
                            title={tx.isIgnored ? 'Reativar no cálculo de despesas' : 'Deduplicar / Ignorar do cálculo'}
                          >
                            {tx.isIgnored ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

      {/* 6. MODAL DE EDIÇÃO INDIVIDUAL DA DESPESA */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                Editar Lançamento Individual
              </h3>
              <button 
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Estabelecimento / Descrição
                </label>
                <input 
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Valor (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Data
                  </label>
                  <input 
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Categoria
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenInvestmentLink('EDIT', 'APORTE')}
                      className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <PieChart className="w-3 h-3" />
                      <span>{editForm.investmentAsset ? 'Ativo OK' : 'Investimento?'}</span>
                    </button>
                  </div>
                  <input 
                    type="text"
                    placeholder="Ex: Transporte, Alimentação, Saúde..."
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Subcategoria
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Estacionamentos, Combustível..."
                    value={editForm.subcategory}
                    onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Subdivisão Nível 3 (Hospital / Local) */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Subdivisão Nível 3 (Local / Hospital / Tag)
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Hospital Madre Teresa, Hospital Mater Dei..."
                  value={editForm.subdivision}
                  onChange={(e) => setEditForm({ ...editForm, subdivision: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-indigo-500/30 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                {/* Chips de Hospitais Rápidos */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BH_HOSPITALS.map((hosp) => (
                    <button
                      key={hosp}
                      type="button"
                      onClick={() => setEditForm(prev => ({
                        ...prev,
                        subdivision: hosp,
                        category: prev.category || 'Transporte',
                        subcategory: prev.subcategory || 'Estacionamentos'
                      }))}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                        editForm.subdivision === hosp
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-slate-950 text-slate-300 border-white/10 hover:border-indigo-400'
                      }`}
                    >
                      🏥 {hosp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vínculo de Investimento */}
              {editForm.investmentAsset && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                    <PieChart className="w-3.5 h-3.5 shrink-0" />
                    <span>Vinculado a: <strong>{editForm.investmentAsset}</strong> ({editForm.investmentAction === 'APORTE' ? 'Aporte' : 'Resgate'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenInvestmentLink('EDIT', editForm.investmentAction || 'APORTE')}
                    className="text-[10px] text-emerald-400 underline font-bold cursor-pointer"
                  >
                    Trocar Ativo
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-white/5 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input 
                    type="checkbox"
                    checked={editForm.isFixed}
                    onChange={(e) => setEditForm({ ...editForm, isFixed: e.target.checked })}
                    className="rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Despesa fixa recorrente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-400 font-semibold">
                  <input 
                    type="checkbox"
                    checked={editForm.updateRuleToo}
                    onChange={(e) => setEditForm({ ...editForm, updateRuleToo: e.target.checked })}
                    className="rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Sempre categorizar lançamentos semelhantes nesta categoria</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE ADIÇÃO MANUAL DE NOVA DESPESA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <form onSubmit={handleCreateNew} className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Nova Despesa Manual
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Estabelecimento / Descrição
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: McDonald's, Estacionamento Madre Teresa, Supermercado..."
                  value={newForm.description}
                  onChange={(e) => {
                    const desc = e.target.value
                    const pred = CategoryRulesEngine.predict(desc, newForm.entityType)
                    setNewForm(prev => ({ 
                      ...prev, 
                      description: desc,
                      category: pred.category,
                      subcategory: pred.subcategory,
                      subdivision: pred.subdivision || prev.subdivision
                    }))
                  }}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Valor (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={newForm.amount}
                    onChange={(e) => setNewForm({ ...newForm, amount: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Data
                  </label>
                  <input 
                    type="date"
                    required
                    value={newForm.date}
                    onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Cartão / Conta
                  </label>
                  <select
                    value={newForm.accountOrCard}
                    onChange={(e) => setNewForm({ ...newForm, accountOrCard: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                  >
                    <option value="Cartão C6 Carbon Black">Cartão C6 Carbon Black</option>
                    <option value="Nubank PF">Nubank PF</option>
                    <option value="Itaú Personnalité PF">Itaú Personnalité PF</option>
                    <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Categoria Sugerida
                    </label>
                    <button
                      type="button"
                      onClick={() => handleOpenInvestmentLink('NEW', 'APORTE')}
                      className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <PieChart className="w-3 h-3" />
                      <span>{newForm.investmentAsset ? 'Ativo OK' : 'Investimento?'}</span>
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Subcategoria
                  </label>
                  <input 
                    type="text"
                    value={newForm.subcategory}
                    onChange={(e) => setNewForm({ ...newForm, subcategory: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Subdivisão (Hospital / Local)
                  </label>
                  <input 
                    type="text"
                    placeholder="Ex: Hospital Madre Teresa..."
                    value={newForm.subdivision}
                    onChange={(e) => setNewForm({ ...newForm, subdivision: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-indigo-500/30 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Chips de Hospitais Rápidos */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BH_HOSPITALS.map((hosp) => (
                  <button
                    key={hosp}
                    type="button"
                    onClick={() => setNewForm(prev => ({
                      ...prev,
                      subdivision: hosp,
                      category: prev.category || 'Transporte',
                      subcategory: prev.subcategory || 'Estacionamentos'
                    }))}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                      newForm.subdivision === hosp
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-slate-950 text-slate-300 border-white/10 hover:border-indigo-400'
                    }`}
                  >
                    🏥 {hosp}
                  </button>
                ))}
              </div>

              {/* Vínculo de Investimento */}
              {newForm.investmentAsset && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                    <PieChart className="w-3.5 h-3.5 shrink-0" />
                    <span>Vinculado a: <strong>{newForm.investmentAsset}</strong> ({newForm.investmentAction === 'APORTE' ? 'Aporte' : 'Resgate'})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenInvestmentLink('NEW', newForm.investmentAction || 'APORTE')}
                    className="text-[10px] text-emerald-400 underline font-bold cursor-pointer"
                  >
                    Trocar Ativo
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-white/5 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input 
                    type="checkbox"
                    checked={newForm.isFixed}
                    onChange={(e) => setNewForm({ ...newForm, isFixed: e.target.checked })}
                    className="rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Despesa fixa recorrente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-emerald-400 font-semibold">
                  <input 
                    type="checkbox"
                    checked={newForm.saveAsRule}
                    onChange={(e) => setNewForm({ ...newForm, saveAsRule: e.target.checked })}
                    className="rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Lembrar e sempre categorizar lançamentos semelhantes nesta categoria</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Salvar Despesa</span>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 border-2 border-emerald-500 shadow-2xl backdrop-blur-xl p-4 text-white animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Categorizar {selectedTxIds.size} lançamento(s) selecionado(s)</span>
                  <span className="font-mono text-emerald-400 font-extrabold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Total: R$ {selectedTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  Defina a categoria e subcategoria desejadas para aplicar a todos simultaneamente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto text-xs">
              <button
                type="button"
                onClick={handleSelectOnlyUncategorized}
                className="text-[11px] font-semibold text-amber-400 hover:underline cursor-pointer"
              >
                Marcar só pendentes ({uncategorizedInViewCount})
              </button>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[11px] font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Desmarcar ({selectedTxIds.size})
              </button>
            </div>
          </div>

          {/* Seletores de Categoria e Subcategoria */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Categoria
              </label>
              <select
                value={bulkCategory}
                onChange={(e) => handleBulkCategoryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {Object.keys(STANDARD_TAXONOMY).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Subcategoria
              </label>
              <select
                value={bulkSubcategory}
                onChange={(e) => setBulkSubcategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {(STANDARD_TAXONOMY[bulkCategory] || ['Outros']).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Hospital / Local (Opcional)
              </label>
              <select
                value={bulkSubdivision}
                onChange={(e) => setBulkSubdivision(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-indigo-500/30 text-indigo-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="">Nenhum / Não alterar</option>
                {BH_HOSPITALS.map(hosp => (
                  <option key={hosp} value={hosp}>🏥 {hosp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Opção de Regra Inteligente e Botões de Ação */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={bulkLearnRule}
                onChange={(e) => setBulkLearnRule(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
              />
              <span className="text-[11px]">
                Memorizar como <strong>regra inteligente permanente</strong> para os próximos meses
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Excluir lançamentos selecionados"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir ({selectedTxIds.size})</span>
              </button>

              <button
                type="button"
                onClick={handleApplyBulkCategorization}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar a Todos ({selectedTxIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {bulkToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bulkToast}</span>
        </div>
      )}
    </div>
  )
}
