'use client'

import { financialStorage } from '@/utils/userScopedStorage'

import { AccessibleDialog } from './AccessibleDialog'

import React, { useState, useMemo, useEffect } from 'react'
import { 
  X, 
  PlusCircle, 
  Plus,
  FolderPlus,
  Folder,
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Tag, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  Repeat,
  Clock,
  PieChart,
  MapPin,
  Building2,
  Sparkles
} from 'lucide-react'
import { InvestmentLinkModal } from './InvestmentLinkModal'
import { GranularTransactionStore } from '@/utils/granularTransactionStore'
import { CreditCardStore, CreditCardItem } from '@/utils/creditCardStore'

interface QuickTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (transaction: any) => void
  initialType?: 'EXPENSE' | 'INCOME'
}

const DEFAULT_SUBCATEGORIES_BY_CATEGORY: Record<string, string[]> = {
  // Despesas
  'Transporte': [
    'Combustível',
    'Estacionamentos',
    'Táxi / Uber',
    'Parcela Veículo Financiamento',
    'Parcela Veículo Cartão',
    'Seguro Auto',
    'Sem Parar / Pedágio',
    'IPVA / Licenciamento',
    'Lavagem / Estética',
    'Manutenção / Oficina'
  ],
  'Casa / Moradia': [
    'Supermercado',
    'Aluguel',
    'Condomínio',
    'Energia Elétrica (Luz)',
    'Internet / Fibra',
    'Celular / Telefonia',
    'IPTU',
    'Gás',
    'Manutenção / Reformas',
    'Móveis & Utensílios'
  ],
  'Saúde': [
    'Plano de Saúde',
    'Academia / Personal',
    'Farmácia / Remédios',
    'Seguro de Vida / AZOS',
    'Consultas Médicas',
    'Terapia / Psicólogo',
    'Exames Laboratoriais',
    'Odontologia',
    'Dermatologia / Estética'
  ],
  'Alimentação': [
    'Supermercado & Feira',
    'Almoço / Lanches',
    'Delivery / iFood',
    'Restaurantes & Jantares',
    'Padaria & Confeitaria',
    'Marmitas & Congelados',
    'Cafeteria'
  ],
  'Lazer & Restaurantes': [
    'Restaurantes Nobres / GRI',
    'Bares & Baladas',
    'Jogos Mineirão / Ingressos',
    'Resenhas & Aniversários',
    'Viagens / Passeios',
    'Streaming & Assinaturas',
    'Cinema & Teatros'
  ],
  'Investimentos & Aplicações': [
    'Renda Fixa / CDB',
    'Tesouro Selic / IPCA',
    'Fundos Imobiliários (FIIs)',
    'Ações Nacionais (B3)',
    'Stocks / Ativos Internacionais',
    'Criptoativos (Bitcoin / Ethereum)',
    'Reserva de Emergência'
  ],
  'Empresa Médica PJ': [
    'Simples Nacional / DAS',
    'ISSQN Prefeitura',
    'IRPJ / CSLL',
    'INSS / Pró-Labore',
    'Mensalidade Contabilidade',
    'Taxas Bancárias Inter PJ',
    'Anuidade CRM / CFM',
    'Insumos / Consultório'
  ],
  'Financiamento': [
    'Parcela Veículo',
    'Parcela Imóvel / Terreno',
    'Parcela Imóvel',
    'Condomínio Imóvel',
    'Empréstimos Bancários'
  ],
  'Despesas Pessoais': [
    'Vestuário & Roupas',
    'Barbearia & Cuidados',
    'Assinaturas & Softwares (OpenAI / Spotify)',
    'Presentes & Família',
    'Doações',
    'Diversos'
  ],
  'Filhos & Educação': [
    'Mensalidade Escolar / Faculdade',
    'Cursos & Especializações Médicas',
    'Congressos & Eventos Científicos',
    'Material Didático',
    'Atividades Extracurriculares'
  ],
  'Compras': [
    'Eletrônicos & Informática',
    'Suplementos & Vitaminas',
    'E-commerce (Amazon / Mercado Livre)',
    'Perfumes & Cosméticos',
    'Artigos Esportivos'
  ],
  'Pets': [
    'Ração & Petiscos',
    'Veterinário & Consultas',
    'Medicamentos Pet',
    'Banho & Tosa',
    'Acessórios & Brinquedos'
  ],
  'Outras Despesas': [
    'Imprevistos',
    'Tarifas & Encargos',
    'Multas de Trânsito',
    'Gastos Diversos'
  ],
  // Receitas
  'Faturamento Hospitalar & PJ': [
    'Plantão Médico',
    'UPAs Contagem',
    'Hospital Madre Teresa',
    'Hospital Mater Dei',
    'Hospital Felício Rocho',
    'Santa Casa BH',
    'Outros Plantões'
  ],
  'Consultório Particular Direto': [
    'Consultas Particulares',
    'Procedimentos Ambulatoriais',
    'Cirurgias Eletivas',
    'Retornos'
  ],
  'Repasse de Convênios Médicos': [
    'Unimed BH',
    'Bradesco Saúde',
    'Amil',
    'SulAmérica',
    'Outros Convênios'
  ],
  'Plantões Médicos Extras': [
    'Plantão Noturno Extra',
    'Plantão Fim de Semana Extra',
    'Cobertura de Escala',
    'Sobreaviso Remunerado'
  ],
  'Rendimentos FIIs & Dividendos': [
    'Dividendos FIIs',
    'Dividendos de Ações',
    'Juros sobre Capital Próprio (JCP)',
    'Rendimento Renda Fixa'
  ],
  'Resgate de Investimentos': [
    'Resgate Renda Fixa',
    'Resgate FIIs',
    'Venda de Ações',
    'Resgate Criptoativos',
    'Resgate Reserva Emergência'
  ],
  'Pró-Labore Retirada PJ': [
    'Transferência Pró-Labore Mensal',
    'Distribuição de Lucros Isenta'
  ],
  'Outras Receitas': [
    'Restituição de Imposto de Renda',
    'Reembolsos Hospitalares',
    'Venda de Ativos / Veículo',
    'Outros Recebimentos'
  ]
}

export function QuickTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'EXPENSE'
}: QuickTransactionModalProps) {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>(initialType)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [subdivision, setSubdivision] = useState('') // Nível 3: Ex: 'Hospital Madre Teresa'
  const [account, setAccount] = useState('C6 Carbon Black')
  const [scope, setScope] = useState<'PF' | 'PJ'>('PF')
  
  // Vínculo inteligente de Investimentos
  const [investmentAsset, setInvestmentAsset] = useState<string>('')
  const [investmentAction, setInvestmentAction] = useState<'APORTE' | 'RESGATE' | null>(null)
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false)

  // Condição da Despesa: PONTUAL, FIXA ou PARCELADA
  const [expenseCondition, setExpenseCondition] = useState<'PONTUAL' | 'FIXA' | 'PARCELADA'>('PONTUAL')
  const [installmentsCount, setInstallmentsCount] = useState<number>(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [availableCards, setAvailableCards] = useState<CreditCardItem[]>([])

  // Categorias e Subcategorias Customizadas
  const [customExpenseCategories, setCustomExpenseCategories] = useState<string[]>([])
  const [customIncomeCategories, setCustomIncomeCategories] = useState<string[]>([])
  const [customSubcategoriesMap, setCustomSubcategoriesMap] = useState<Record<string, string[]>>({})

  // Modos de Abas (Existentes vs Nova)
  const [categoryMode, setCategoryMode] = useState<'SELECT' | 'NEW'>('SELECT')
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [subcategoryMode, setSubcategoryMode] = useState<'SELECT' | 'NEW'>('SELECT')
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      const stored = CreditCardStore.getCards()
      setAvailableCards(stored)
      if (stored.length > 0 && !account) {
        setAccount(stored[0].name)
      }
      if (typeof window !== 'undefined') {
        try {
          const exp = financialStorage.getItem('leaomed_custom_expense_categories')
          if (exp) setCustomExpenseCategories(JSON.parse(exp))
          const inc = financialStorage.getItem('leaomed_custom_income_categories')
          if (inc) setCustomIncomeCategories(JSON.parse(inc))
          const subs = financialStorage.getItem('leaomed_custom_subcategories_map')
          if (subs) setCustomSubcategoriesMap(JSON.parse(subs))
        } catch (_) {}
      }
    }
  }, [isOpen])

  const expenseCategories = [
    'Transporte',
    'Casa / Moradia',
    'Saúde',
    'Alimentação',
    'Investimentos & Aplicações',
    'Empresa Médica PJ',
    'Financiamento',
    'Despesas Pessoais',
    'Filhos & Educação',
    'Lazer & Restaurantes',
    'Compras',
    'Pets',
    'Outras Despesas'
  ]

  const incomeCategories = [
    'Faturamento Hospitalar & PJ',
    'Consultório Particular Direto',
    'Repasse de Convênios Médicos',
    'Plantões Médicos Extras',
    'Rendimentos FIIs & Dividendos',
    'Resgate de Investimentos',
    'Pró-Labore Retirada PJ',
    'Outras Receitas'
  ]

  const allExpenseCategories = useMemo(() => {
    return Array.from(new Set([...expenseCategories, ...customExpenseCategories]))
  }, [customExpenseCategories])

  const allIncomeCategories = useMemo(() => {
    return Array.from(new Set([...incomeCategories, ...customIncomeCategories]))
  }, [customIncomeCategories])

  const activeCategories = type === 'EXPENSE' ? allExpenseCategories : allIncomeCategories

  const currentCategorySubcategories = useMemo(() => {
    if (!category) return []
    const defaults = DEFAULT_SUBCATEGORIES_BY_CATEGORY[category] || []
    const customs = customSubcategoriesMap[category] || []
    return Array.from(new Set([...defaults, ...customs]))
  }, [category, customSubcategoriesMap])

  const handleCategoryChange = (newCat: string) => {
    if (newCat === '__NEW__') {
      setCategoryMode('NEW')
      return
    }
    setCategory(newCat)
    setCategoryMode('SELECT')
    setSubcategory('')
    setSubcategoryMode('SELECT')
    if (newCat === 'Investimentos & Aplicações') {
      setType('EXPENSE')
      setInvestmentAction('APORTE')
      setIsInvestmentModalOpen(true)
    } else if (newCat === 'Resgate de Investimentos') {
      setType('INCOME')
      setInvestmentAction('RESGATE')
      setIsInvestmentModalOpen(true)
    }
  }

  const handleAddNewCategory = () => {
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return
    if (type === 'EXPENSE') {
      if (!expenseCategories.includes(trimmed) && !customExpenseCategories.includes(trimmed)) {
        const updated = [...customExpenseCategories, trimmed]
        setCustomExpenseCategories(updated)
        try { financialStorage.setItem('leaomed_custom_expense_categories', JSON.stringify(updated)) } catch (_) {}
      }
    } else {
      if (!incomeCategories.includes(trimmed) && !customIncomeCategories.includes(trimmed)) {
        const updated = [...customIncomeCategories, trimmed]
        setCustomIncomeCategories(updated)
        try { financialStorage.setItem('leaomed_custom_income_categories', JSON.stringify(updated)) } catch (_) {}
      }
    }
    setCategory(trimmed)
    setCategoryMode('SELECT')
    setNewCategoryInput('')
    setSubcategory('')
    setSubcategoryMode('NEW')
  }

  const handleAddNewSubcategory = () => {
    const trimmed = newSubcategoryInput.trim()
    if (!trimmed || !category) return
    const currentSubs = customSubcategoriesMap[category] || []
    if (!currentSubs.includes(trimmed)) {
      const updatedMap = {
        ...customSubcategoriesMap,
        [category]: [...currentSubs, trimmed]
      }
      setCustomSubcategoriesMap(updatedMap)
      try { financialStorage.setItem('leaomed_custom_subcategories_map', JSON.stringify(updatedMap)) } catch (_) {}
    }
    setSubcategory(trimmed)
    setSubcategoryMode('SELECT')
    setNewSubcategoryInput('')
  }

  const handleInvestmentSelect = (assetName: string, action: 'APORTE' | 'RESGATE') => {
    setInvestmentAsset(assetName)
    setInvestmentAction(action)
    if (!subcategory.trim()) {
      setSubcategory(action === 'APORTE' ? `Aporte em ${assetName}` : `Resgate de ${assetName}`)
    }
  }

  if (!isOpen) return null

  const parsedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0
  const installmentValue = installmentsCount > 0 ? (parsedAmount / installmentsCount) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || parsedAmount <= 0) return

    setIsSubmitting(true)

    const finalAmount = type === 'EXPENSE' ? -parsedAmount : parsedAmount

    const newTx = {
      id: `manual-tx-${Date.now()}`,
      type,
      description: description.trim(),
      amount: parsedAmount,
      date,
      category: category || (type === 'EXPENSE' ? 'Casa / Moradia' : 'Faturamento Hospitalar & PJ'),
      subcategory: subcategory.trim() || description.trim(),
      subdivision: subdivision.trim() || undefined,
      investmentAsset: investmentAsset.trim() || undefined,
      investmentAction: investmentAction || undefined,
      account,
      scope,
      is_fixed: type === 'EXPENSE' && expenseCondition === 'FIXA',
      is_installment: type === 'EXPENSE' && expenseCondition === 'PARCELADA',
      installments_count: type === 'EXPENSE' && expenseCondition === 'PARCELADA' ? installmentsCount : 1,
      installment_value: type === 'EXPENSE' && expenseCondition === 'PARCELADA' ? installmentValue : parsedAmount
    }

    // Registra também na base de transações granulares para auditoria item a item
    try {
      GranularTransactionStore.addTransaction({
        entityType: scope,
        date,
        description: description.trim(),
        amount: finalAmount,
        accountOrCard: account,
        category: newTx.category,
        subcategory: newTx.subcategory,
        subdivision: newTx.subdivision,
        investmentAsset: newTx.investmentAsset,
        investmentAction: newTx.investmentAction,
        isFixed: type === 'EXPENSE' && expenseCondition === 'FIXA',
        isIgnored: false,
        source: 'MANUAL'
      })
    } catch (_) {}

    setTimeout(() => {
      // Salva no localStorage para sincronizar com a planilha e histórico
      try {
        const storedTxs = financialStorage.getItem('leaomed_manual_transactions')
        const currentList = storedTxs ? JSON.parse(storedTxs) : []
        currentList.unshift(newTx)
        financialStorage.setItem('leaomed_manual_transactions', JSON.stringify(currentList))

        // Despacha evento global para atualizar a planilha em tempo real
        window.dispatchEvent(new CustomEvent('leaomed_new_transaction', { detail: newTx }))
      } catch (_) {}

      setIsSubmitting(false)
      setSuccessMessage('Lançamento registrado e integrado à planilha com sucesso!')

      setTimeout(() => {
        onSuccess?.(newTx)
        onClose()
        setSuccessMessage(null)
        setDescription('')
        setAmount('')
      }, 1000)
    }, 400)
  }

  return (
    <AccessibleDialog onClose={onClose} labelledBy="quick-transaction-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-sm border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] transition-all scale-100 flex flex-col max-h-[92vh]"
      >
        {/* Header com Toggle Despesa vs Receita */}
        <div className="p-5 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${type === 'EXPENSE' ? 'bg-[var(--capital-danger-soft,#fcecec)] text-[var(--capital-danger,#ad3333)]' : 'bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)]'}`}>
              {type === 'EXPENSE' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="quick-transaction-title" className="font-display font-semibold text-base md:text-lg text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] leading-tight">
                Novo Lançamento Manual
              </h3>
              <p className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                Integração imediata com as categorias da planilha e projeções
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 rounded-full hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com scroll interno se necessário */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[var(--capital-success,#157449)]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Tipo: Despesa ou Receita */}
          <div>
            <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1.5">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'EXPENSE'
                    ? 'bg-rose-600 text-white border-[var(--capital-danger,#ad3333)] shadow-md shadow-none'
                    : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)]'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Despesa (Saída)</span>
              </button>

              <button
                type="button"
                onClick={() => setType('INCOME')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'INCOME'
                    ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] border-[var(--capital-accent,#927025)] shadow-md shadow-none'
                    : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Receita (Entrada)</span>
              </button>
            </div>
          </div>

          {/* 2. Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
                Descrição do Lançamento *
              </label>
              <input
                type="text"
                required
                placeholder={type === 'EXPENSE' ? 'Ex: Seguro Veicular, Supermercado...' : 'Ex: Plantão Hospital São Lucas...'}
                aria-label="Descrição do lançamento"
                  value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder-slate-400 focus:outline-none focus:border-[var(--capital-accent,#927025)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
                Valor Total (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--capital-muted,#242a2e)]">R$</span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  aria-label="Valor total em reais"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)] tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* 3. Se Despesa: Condição da Despesa (Fixa vs Parcelada vs Pontual) */}
          {type === 'EXPENSE' && (
            <div className="p-3.5 rounded-2xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-[var(--capital-success,#157449)]" />
                  Natureza da Despesa
                </label>
                <span className="text-[10px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                  {expenseCondition === 'FIXA' ? 'Entra no custo fixo da reserva' : expenseCondition === 'PARCELADA' ? 'Entra no cronograma de parcelas' : 'Lançamento pontual'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExpenseCondition('PONTUAL')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    expenseCondition === 'PONTUAL'
                      ? 'bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] dark:bg-[var(--capital-card,#fff)] dark:text-[var(--capital-text,#f6f3e9)] border-transparent shadow-xs'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)]'
                  }`}
                >
                  <div className="text-[11px]">À Vista / Pontual</div>
                  <div className="text-[9px] font-normal opacity-80 mt-0.5">Mês atual</div>
                </button>

                <button
                  type="button"
                  onClick={() => setExpenseCondition('FIXA')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    expenseCondition === 'FIXA'
                      ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] border-[var(--capital-accent,#927025)] shadow-md shadow-none'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)]'
                  }`}
                >
                  <div className="text-[11px]">Despesa Fixa</div>
                  <div className="text-[9px] font-normal opacity-80 mt-0.5">Recorrente mensal</div>
                </button>

                <button
                  type="button"
                  onClick={() => setExpenseCondition('PARCELADA')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    expenseCondition === 'PARCELADA'
                      ? 'bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] border-[var(--capital-warning,#8b5b15)] shadow-md shadow-none'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)]'
                  }`}
                >
                  <div className="text-[11px]">Parcelada</div>
                  <div className="text-[9px] font-normal opacity-80 mt-0.5">Cartão/Carnê</div>
                </button>
              </div>

              {/* Se PARCELADA: Seletor de Parcelas */}
              {expenseCondition === 'PARCELADA' && (
                <div className="pt-2 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                      Número de Parcelas:
                    </span>
                    <span className="font-mono font-semibold text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]">
                      {installmentsCount}x de R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {[2, 3, 4, 6, 10, 12, 18, 24, 36, 48].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setInstallmentsCount(num)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          installmentsCount === num
                            ? 'bg-amber-500 text-[var(--capital-button-text,#242a2e)] font-semibold scale-105'
                            : 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-warning,#8b5b15)]'
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-1">
                    Será projetado automaticamente no módulo de parcelamentos e previsibilidade de caixa.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. Categoria e Conta */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bloco de Categoria com Abas */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block">
                    Categoria da Planilha *
                  </label>

                  {/* Abas para Categoria: Existente vs Nova */}
                  <div className="flex items-center bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] p-0.5 rounded-lg border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
                    <button
                      type="button"
                      onClick={() => setCategoryMode('SELECT')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        categoryMode === 'SELECT'
                          ? 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] shadow-xs'
                          : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
                      }`}
                    >
                      Existentes
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode('NEW')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                        categoryMode === 'NEW'
                          ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] shadow-xs'
                          : 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] hover:text-[var(--capital-success,#157449)]'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Nova Categoria
                    </button>
                  </div>
                </div>

                {categoryMode === 'SELECT' ? (
                  <select
                    aria-label="Categoria do lançamento"
                  value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)] font-medium"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {activeCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__NEW__" className="font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                      ➕ + Criar Nova Categoria...
                    </option>
                  </select>
                ) : (
                  <div className="flex gap-1.5 animate-in fade-in">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--capital-success,#157449)]" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nome da nova categoria..."
                        aria-label="Nome da nova categoria"
                  value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewCategory() } }}
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)] font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      disabled={!newCategoryInput.trim()}
                      className="px-2.5 py-1.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] disabled:opacity-50 text-[var(--capital-button-text,#211f19)] font-bold text-xs flex items-center gap-1 shadow-xs transition-all shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode('SELECT')}
                      className="px-2 py-1.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)] text-xs font-semibold shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Badge de Ativo de Investimento Vinculado */}
                {investmentAsset && (
                  <div className="mt-1.5 p-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-bold truncate">
                      <PieChart className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{investmentAction === 'APORTE' ? 'Aporte em:' : 'Resgate de:'} <strong>{investmentAsset}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInvestmentModalOpen(true)}
                      className="text-[10px] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] underline font-bold shrink-0 ml-1 cursor-pointer"
                    >
                      Mudar
                    </button>
                  </div>
                )}
              </div>

              {/* Conta / Cartão de Origem */}
              <div>
                <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1.5">
                  Conta / Cartão de Origem
                </label>
                <select
                  aria-label="Cartão ou conta"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)] font-medium"
                >
                  {availableCards.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  {availableCards.length === 0 && (
                    <>
                      <option value="Cartão C6 Carbon Black PF">Cartão C6 Carbon Black PF</option>
                      <option value="Cartão Itaú PF">Cartão Itaú PF</option>
                      <option value="Cartão Nubank PF">Cartão Nubank PF</option>
                    </>
                  )}
                  <option value="Pessoa Jurídica">Pessoa Jurídica (Empresa)</option>
                  <option value="Conta Corrente Safra">Banco Safra</option>
                  <option value="Pix / Dinheiro">Pix / Transferência Direta</option>
                </select>
              </div>
            </div>

            {/* 5. Subcategoria da Planilha (Carrega todas as existentes da categoria selecionada + opção de criar nova) */}
            <div className="p-3.5 rounded-2xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--capital-success,#157449)]" />
                    <span>Subcategoria da Planilha *</span>
                  </label>
                  {category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-bold border border-[var(--capital-accent,#927025)] truncate max-w-[140px]">
                      {category}
                    </span>
                  )}
                </div>

                {category && (
                  <div className="flex items-center bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] p-0.5 rounded-lg border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
                    <button
                      type="button"
                      onClick={() => setSubcategoryMode('SELECT')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        subcategoryMode === 'SELECT'
                          ? 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] shadow-xs'
                          : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
                      }`}
                    >
                      Existentes ({currentCategorySubcategories.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubcategoryMode('NEW')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                        subcategoryMode === 'NEW'
                          ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] shadow-xs'
                          : 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] hover:text-[var(--capital-success,#157449)]'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Nova
                    </button>
                  </div>
                )}
              </div>

              {!category ? (
                <div className="p-3 rounded-xl border border-dashed border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-center bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#fff)]">
                  <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-medium">
                    👆 Selecione uma categoria acima para abrir todas as subcategorias existentes.
                  </p>
                </div>
              ) : subcategoryMode === 'SELECT' ? (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <select
                    aria-label="Subcategoria do lançamento"
                  value={subcategory}
                    onChange={(e) => {
                      if (e.target.value === '__NEW_SUB__') {
                        setSubcategoryMode('NEW')
                      } else {
                        setSubcategory(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)] font-medium"
                  >
                    <option value="">Selecione uma subcategoria existente de {category}...</option>
                    {currentCategorySubcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="__NEW_SUB__" className="font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                      ➕ + Criar Nova Subcategoria em "{category}"...
                    </option>
                  </select>

                  {/* Chips Rápidos de Subcategorias Existentes para seleção com 1 clique */}
                  {currentCategorySubcategories.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1.5">
                        Sugestões Rápidas de {category} (Clique para selecionar):
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {currentCategorySubcategories.map((sub) => {
                          const isSelected = subcategory === sub
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setSubcategory(sub)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] border-[var(--capital-accent,#927025)] shadow-xs'
                                  : 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-accent,#927025)] hover:bg-[var(--capital-soft,#f6f0df)] dark:hover:bg-[var(--capital-soft,#f6f0df)]'
                              }`}
                            >
                              {sub}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Aba para Criar Nova Subcategoria */
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Layers className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--capital-success,#157449)]" />
                      <input
                        type="text"
                        autoFocus
                        placeholder={`Nome da nova subcategoria para "${category}"...`}
                        aria-label="Nome da nova subcategoria"
                  value={newSubcategoryInput}
                        onChange={(e) => setNewSubcategoryInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewSubcategory() } }}
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)] font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewSubcategory}
                      disabled={!newSubcategoryInput.trim()}
                      className="px-2.5 py-1.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] disabled:opacity-50 text-[var(--capital-button-text,#211f19)] font-bold text-xs flex items-center gap-1 shadow-xs transition-all shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubcategoryMode('SELECT')}
                      className="px-2 py-1.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)] text-xs font-semibold shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                    💡 Esta subcategoria será salva automaticamente e ficará disponível sempre que você selecionar <strong>{category}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Subdivisão Nível 3 (Hospital / Local / Tag) */}
            <div>
              <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--capital-accent,#927025)]" />
                Subdivisão Nível 3 (Local / Hospital)
              </label>
              <input
                type="text"
                placeholder="Ex: Hospital Madre Teresa, Mater Dei..."
                aria-label="Local ou hospital"
                  value={subdivision}
                onChange={(e) => setSubdivision(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder-slate-400 focus:outline-none focus:border-[var(--capital-accent,#927025)] font-medium"
              />
            </div>
          </div>

          {/* Chips de Sugestões Rápidas de Hospitais */}
          {(category === 'Transporte' || subcategory.toLowerCase().includes('estacionamento') || subdivision.toLowerCase().includes('hospital')) && (
            <div className="p-3 rounded-2xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] space-y-1.5 animate-in fade-in">
              <span className="text-[11px] font-bold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Hospitais Médicos (Clique para preencher a subdivisão Nível 3):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  'Hospital Madre Teresa',
                  'Hospital Mater Dei',
                  'Hospital Lifecenter',
                  'Hospital Felício Rocho',
                  'Hospital Vila da Serra',
                  'Santa Casa BH'
                ].map((hosp) => (
                  <button
                    key={hosp}
                    type="button"
                    onClick={() => {
                      setSubdivision(hosp)
                      if (!subcategory.trim()) setSubcategory('Estacionamentos')
                      if (!category) setCategory('Transporte')
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      subdivision === hosp 
                        ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] border-[var(--capital-accent,#927025)] shadow-xs'
                        : 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-accent,#927025)]'
                    }`}
                  >
                    🏥 {hosp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Data e Escopo PF/PJ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                aria-label="Data do lançamento"
                  value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
                Classificação Contábil
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope('PF')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    scope === 'PF'
                      ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] border-[var(--capital-accent,#927025)] font-semibold'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]'
                  }`}
                >
                  Pessoa Física (PF)
                </button>
                <button
                  type="button"
                  onClick={() => setScope('PJ')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    scope === 'PJ'
                      ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] border-[var(--capital-accent,#927025)] font-semibold'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]'
                  }`}
                >
                  Pessoa Jurídica (PJ)
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé com Botões de Ação */}
          <div className="pt-4 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !description || parsedAmount <= 0}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] shadow-md shadow-none transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Salvar Lançamento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Vínculo de Investimento (Aporte vs Resgate com Ativos Atuais) */}
      <InvestmentLinkModal
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        actionType={investmentAction || 'APORTE'}
        transactionAmount={parsedAmount}
        transactionDate={date}
        transactionDescription={description}
        onSelectAsset={handleInvestmentSelect}
      />
    </AccessibleDialog>
  )
}
