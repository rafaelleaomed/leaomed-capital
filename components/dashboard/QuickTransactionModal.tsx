'use client'

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
    'Parcela T-Cross Financiamento',
    'Parcela T-Cross Cartão',
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
    'Parcela Gramados Parks',
    'Condomínio Buona Vitta',
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
    'Plantão Camarinha',
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
          const exp = localStorage.getItem('leaomed_custom_expense_categories')
          if (exp) setCustomExpenseCategories(JSON.parse(exp))
          const inc = localStorage.getItem('leaomed_custom_income_categories')
          if (inc) setCustomIncomeCategories(JSON.parse(inc))
          const subs = localStorage.getItem('leaomed_custom_subcategories_map')
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
        try { localStorage.setItem('leaomed_custom_expense_categories', JSON.stringify(updated)) } catch (_) {}
      }
    } else {
      if (!incomeCategories.includes(trimmed) && !customIncomeCategories.includes(trimmed)) {
        const updated = [...customIncomeCategories, trimmed]
        setCustomIncomeCategories(updated)
        try { localStorage.setItem('leaomed_custom_income_categories', JSON.stringify(updated)) } catch (_) {}
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
      try { localStorage.setItem('leaomed_custom_subcategories_map', JSON.stringify(updatedMap)) } catch (_) {}
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
        const storedTxs = localStorage.getItem('leaomed_manual_transactions')
        const currentList = storedTxs ? JSON.parse(storedTxs) : []
        currentList.unshift(newTx)
        localStorage.setItem('leaomed_manual_transactions', JSON.stringify(currentList))

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all scale-100 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header com Toggle Despesa vs Receita */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${type === 'EXPENSE' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {type === 'EXPENSE' ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-white leading-tight">
                Novo Lançamento Manual
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Integração imediata com as categorias da planilha e projeções
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com scroll interno se necessário */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Tipo: Despesa ou Receita */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'EXPENSE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
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
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Descrição do Lançamento *
              </label>
              <input
                type="text"
                required
                placeholder={type === 'EXPENSE' ? 'Ex: Seguro Veicular, Supermercado...' : 'Ex: Plantão Hospital São Lucas...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Valor Total (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* 3. Se Despesa: Condição da Despesa (Fixa vs Parcelada vs Pontual) */}
          {type === 'EXPENSE' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-emerald-500" />
                  Natureza da Despesa
                </label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {expenseCondition === 'FIXA' ? 'Entra no custo fixo da reserva' : expenseCondition === 'PARCELADA' ? 'Entra no cronograma de parcelas' : 'Lançamento pontual'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExpenseCondition('PONTUAL')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    expenseCondition === 'PONTUAL'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
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
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
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
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="text-[11px]">Parcelada</div>
                  <div className="text-[9px] font-normal opacity-80 mt-0.5">Cartão/Carnê</div>
                </button>
              </div>

              {/* Se PARCELADA: Seletor de Parcelas */}
              {expenseCondition === 'PARCELADA' && (
                <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Número de Parcelas:
                    </span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400">
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
                            ? 'bg-amber-500 text-slate-950 font-black scale-105'
                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-amber-500/50'
                        }`}
                      >
                        {num}x
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Categoria da Planilha *
                  </label>

                  {/* Abas para Categoria: Existente vs Nova */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setCategoryMode('SELECT')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        categoryMode === 'SELECT'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Existentes
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode('NEW')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                        categoryMode === 'NEW'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Nova Categoria
                    </button>
                  </div>
                </div>

                {categoryMode === 'SELECT' ? (
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {activeCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__NEW__" className="font-bold text-emerald-600 dark:text-emerald-400">
                      ➕ + Criar Nova Categoria...
                    </option>
                  </select>
                ) : (
                  <div className="flex gap-1.5 animate-in fade-in">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-emerald-500" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nome da nova categoria..."
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewCategory() } }}
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-400 dark:border-emerald-500/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      disabled={!newCategoryInput.trim()}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode('SELECT')}
                      className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Badge de Ativo de Investimento Vinculado */}
                {investmentAsset && (
                  <div className="mt-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold truncate">
                      <PieChart className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{investmentAction === 'APORTE' ? 'Aporte em:' : 'Resgate de:'} <strong>{investmentAsset}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInvestmentModalOpen(true)}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 underline font-bold shrink-0 ml-1 cursor-pointer"
                    >
                      Mudar
                    </button>
                  </div>
                )}
              </div>

              {/* Conta / Cartão de Origem */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Conta / Cartão de Origem
                </label>
                <select
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
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
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/50 border border-slate-200/80 dark:border-white/10 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Subcategoria da Planilha *</span>
                  </label>
                  {category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20 truncate max-w-[140px]">
                      {category}
                    </span>
                  )}
                </div>

                {category && (
                  <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setSubcategoryMode('SELECT')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                        subcategoryMode === 'SELECT'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Existentes ({currentCategorySubcategories.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubcategoryMode('NEW')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                        subcategoryMode === 'NEW'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      Nova
                    </button>
                  </div>
                )}
              </div>

              {!category ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center bg-white/40 dark:bg-white/5">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    👆 Selecione uma categoria acima para abrir todas as subcategorias existentes.
                  </p>
                </div>
              ) : subcategoryMode === 'SELECT' ? (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <select
                    value={subcategory}
                    onChange={(e) => {
                      if (e.target.value === '__NEW_SUB__') {
                        setSubcategoryMode('NEW')
                      } else {
                        setSubcategory(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="">Selecione uma subcategoria existente de {category}...</option>
                    {currentCategorySubcategories.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="__NEW_SUB__" className="font-bold text-emerald-600 dark:text-emerald-400">
                      ➕ + Criar Nova Subcategoria em "{category}"...
                    </option>
                  </select>

                  {/* Chips Rápidos de Subcategorias Existentes para seleção com 1 clique */}
                  {currentCategorySubcategories.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
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
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
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
                      <Layers className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-emerald-500" />
                      <input
                        type="text"
                        autoFocus
                        placeholder={`Nome da nova subcategoria para "${category}"...`}
                        value={newSubcategoryInput}
                        onChange={(e) => setNewSubcategoryInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewSubcategory() } }}
                        className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-400 dark:border-emerald-500/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddNewSubcategory}
                      disabled={!newSubcategoryInput.trim()}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubcategoryMode('SELECT')}
                      className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    💡 Esta subcategoria será salva automaticamente e ficará disponível sempre que você selecionar <strong>{category}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Subdivisão Nível 3 (Hospital / Local / Tag) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                Subdivisão Nível 3 (Local / Hospital)
              </label>
              <input
                type="text"
                placeholder="Ex: Hospital Madre Teresa, Mater Dei..."
                value={subdivision}
                onChange={(e) => setSubdivision(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Chips de Sugestões Rápidas de Hospitais */}
          {(category === 'Transporte' || subcategory.toLowerCase().includes('estacionamento') || subdivision.toLowerCase().includes('hospital')) && (
            <div className="p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-1.5 animate-in fade-in">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
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
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-500/50'
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Classificação Contábil
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope('PF')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    scope === 'PF'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Pessoa Física (PF)
                </button>
                <button
                  type="button"
                  onClick={() => setScope('PJ')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    scope === 'PJ'
                      ? 'bg-blue-600 text-white border-blue-600 font-black'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Pessoa Jurídica (PJ)
                </button>
              </div>
            </div>
          </div>

          {/* Rodapé com Botões de Ação */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !description || parsedAmount <= 0}
              className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
    </div>
  )
}
