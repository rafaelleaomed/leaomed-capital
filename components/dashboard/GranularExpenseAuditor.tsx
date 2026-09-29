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
  UserCheck
} from 'lucide-react'
import { 
  GranularTransactionStore, 
  GranularTransaction 
} from '@/utils/granularTransactionStore'
import { CategoryRulesEngine } from '@/utils/categoryRulesEngine'

interface GranularExpenseAuditorProps {
  currentFilter?: string
  isDemo?: boolean
}

export function GranularExpenseAuditor({ currentFilter = 'PF', isDemo = false }: GranularExpenseAuditorProps) {
  const [transactions, setTransactions] = useState<GranularTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [showIgnored, setShowIgnored] = useState(true)

  // Modais de Edição e Criação
  const [editingTx, setEditingTx] = useState<GranularTransaction | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Formulário de Edição
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    date: '',
    accountOrCard: '',
    category: '',
    subcategory: '',
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

  // Filtragem
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      // Filtro de entidade
      if (currentFilter === 'PF' && t.entityType !== 'PF') return false
      if (currentFilter === 'PJ' && t.entityType !== 'PJ') return false

      // Filtro de conta/cartão
      if (selectedAccount !== 'ALL' && t.accountOrCard !== selectedAccount) return false

      // Filtro de categoria
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false

      // Filtro de itens ignorados
      if (!showIgnored && t.isIgnored) return false

      // Busca por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchDesc = t.description.toLowerCase().includes(query)
        const matchCat = t.category.toLowerCase().includes(query)
        const matchSub = t.subcategory.toLowerCase().includes(query)
        const matchAcc = t.accountOrCard.toLowerCase().includes(query)
        if (!matchDesc && !matchCat && !matchSub && !matchAcc) return false
      }

      return true
    })
  }, [transactions, currentFilter, selectedAccount, selectedCategory, showIgnored, searchTerm])

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
    transactions.forEach(t => set.add(t.category))
    return Array.from(set)
  }, [transactions])

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
      category: editForm.category,
      subcategory: editForm.subcategory,
      isFixed: editForm.isFixed
    })

    // Se marcou para salvar como regra permanente
    if (editForm.updateRuleToo && editForm.description.trim().length >= 2) {
      CategoryRulesEngine.saveRule({
        pattern: editForm.description.trim().split(' ')[0],
        category: editForm.category,
        subcategory: editForm.subcategory,
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
      category: newForm.category,
      subcategory: newForm.subcategory,
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
      entityType: 'PF',
      isFixed: false,
      saveAsRule: true
    })
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

      {/* 2. Barra Superior de Filtros e Ações */}
      <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Busca por Texto */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por estabelecimento, categoria, conta..."
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

          {/* Filtro por Conta/Cartão */}
          <div className="flex flex-wrap items-center gap-2">
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
            Clique no ícone de lápis para editar qualquer transação individualmente.
          </span>
        </div>
      </div>

      {/* 3. Tabela Granular de Transações Item a Item */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Estabelecimento / Descrição</th>
                <th className="py-3 px-4">Conta / Cartão</th>
                <th className="py-3 px-4">Categoria & Subcategoria</th>
                <th className="py-3 px-4 text-right">Valor (R$)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredList.map((tx) => {
                  const isPositive = tx.amount > 0
                  return (
                    <tr 
                      key={tx.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                        tx.isIgnored ? 'opacity-50 bg-slate-100/40 dark:bg-slate-950/20' : ''
                      }`}
                    >
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
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{tx.category}</span>
                          <span className="text-[10px] text-slate-400">{tx.subcategory}</span>
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            title="Editar lançamento"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleIgnore(tx.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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

      {/* 4. MODAL DE EDIÇÃO INDIVIDUAL DA DESPESA */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                Editar Lançamento Individual
              </h3>
              <button 
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-white"
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
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Categoria
                  </label>
                  <input 
                    type="text"
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
                    value={editForm.subcategory}
                    onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

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
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL DE ADIÇÃO MANUAL DE NOVA DESPESA */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <form onSubmit={handleCreateNew} className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Nova Despesa Manual
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
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
                  placeholder="Ex: McDonald's, Posto Ipiranga, Supermercado..."
                  value={newForm.description}
                  onChange={(e) => {
                    const desc = e.target.value
                    const pred = CategoryRulesEngine.predict(desc, newForm.entityType)
                    setNewForm({ 
                      ...newForm, 
                      description: desc,
                      category: pred.category,
                      subcategory: pred.subcategory
                    })
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
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Categoria Sugerida (IA)
                  </label>
                  <input 
                    type="text"
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

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
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
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
    </div>
  )
}
