'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  CalendarClock, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  PlusCircle,
  Trash2,
  X,
  Check,
  CreditCard
} from 'lucide-react'
import { 
  InstallmentStore, 
  InstallmentItem, 
  formatEndMonthYear 
} from '@/utils/installmentStore'
import { CreditCardStore } from '@/utils/creditCardStore'

interface InstallmentsProjectionProps {
  isDemo?: boolean
  selectedMonth?: number // 0-11
  selectedYear?: number  // ex: 2026
}

const PT_MONTHS_MAP: Record<string, number> = {
  'janeiro': 0, 'fevereiro': 1, 'março': 2, 'marco': 2, 'abril': 3,
  'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7, 'setembro': 8,
  'outubro': 9, 'novembro': 10, 'dezembro': 11
}

export function computeDynamicInstallment(
  item: InstallmentItem,
  viewedMonth?: number,
  viewedYear?: number
) {
  if (item.isPerpetual) {
    return {
      currentInstallment: 1,
      totalInstallments: 1,
      isConcluded: false,
      isLastInstallment: false,
      statusLabel: 'Mensalidade Contínua',
      badgeClass: 'text-amber-500 dark:text-amber-400',
      progress: 100
    }
  }

  const now = new Date()
  const vMonth = viewedMonth !== undefined ? viewedMonth : now.getMonth()
  const vYear = viewedYear !== undefined ? viewedYear : now.getFullYear()

  const endMatch = item.endMonthYear.toLowerCase().match(/([a-zç]+)\/(\d{4})/)
  if (endMatch) {
    const endMStr = endMatch[1]
    const endY = parseInt(endMatch[2], 10)
    const endM = PT_MONTHS_MAP[endMStr]

    if (endM !== undefined && !isNaN(endY)) {
      // Diferença em meses entre o mês de término e o mês sendo visualizado no painel
      // Se estamos em Set/2026 (mês 8) e termina em Out/2026 (mês 9): diffMonths = 1 (falta 1 mês -> parcela 9 de 10)
      const diffMonths = (endY - vYear) * 12 + (endM - vMonth)

      if (diffMonths < 0) {
        return {
          currentInstallment: item.totalInstallments,
          totalInstallments: item.totalInstallments,
          isConcluded: true,
          isLastInstallment: false,
          statusLabel: `Quitado em ${item.endMonthYear}`,
          badgeClass: 'text-emerald-600 dark:text-emerald-400 font-bold',
          progress: 100
        }
      }

      const calculatedCurrent = item.totalInstallments - diffMonths
      const current = Math.max(1, Math.min(item.totalInstallments, calculatedCurrent))
      const isLast = current === item.totalInstallments
      const progress = (current / item.totalInstallments) * 100

      return {
        currentInstallment: current,
        totalInstallments: item.totalInstallments,
        isConcluded: false,
        isLastInstallment: isLast,
        statusLabel: isLast 
          ? `Última Parcela (${current}/${item.totalInstallments})` 
          : `Parcela ${current} de ${item.totalInstallments}`,
        badgeClass: isLast 
          ? 'text-amber-600 dark:text-amber-400 font-bold' 
          : 'text-slate-700 dark:text-slate-300 font-medium',
        progress
      }
    }
  }

  const current = item.currentInstallment
  const isLast = current >= item.totalInstallments
  return {
    currentInstallment: current,
    totalInstallments: item.totalInstallments,
    isConcluded: current > item.totalInstallments,
    isLastInstallment: isLast,
    statusLabel: isLast 
      ? `Última Parcela (${current}/${item.totalInstallments})` 
      : `Parcela ${current} de ${item.totalInstallments}`,
    badgeClass: 'text-slate-700 dark:text-slate-300 font-medium',
    progress: (current / item.totalInstallments) * 100
  }
}

export function InstallmentsProjection({ 
  isDemo = false, 
  selectedMonth, 
  selectedYear 
}: InstallmentsProjectionProps) {
  const [filter, setFilter] = useState<'ALL' | 'MAJOR' | 'ENDING_SOON'>('ALL')
  const [installments, setInstallments] = useState<InstallmentItem[]>([])
  
  // Modais de Edição e Adição
  const [editingItem, setEditingItem] = useState<InstallmentItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Formulário de Edição
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    monthlyValue: '',
    currentInstallment: '',
    totalInstallments: '',
    paymentMethod: 'Cartão Itaú PF',
    customPaymentMethod: '',
    isCustomMethod: false,
    contractNotes: '',
    isPerpetual: false
  })

  // Formulário de Adição
  const [newForm, setNewForm] = useState({
    name: '',
    category: 'Casa',
    monthlyValue: '',
    currentInstallment: '1',
    totalInstallments: '10',
    paymentMethod: 'Cartão Itaú PF',
    customPaymentMethod: '',
    isCustomMethod: false,
    contractNotes: '',
    isPerpetual: false
  })

  // Lista de cartões de crédito configurados no sistema
  const availableCards = React.useMemo(() => {
    const cards = CreditCardStore.getCards()
    const list = cards.map(c => c.name)
    const defaults = [
      'Cartão C6 Carbon Black PF',
      'Cartão Itaú PF',
      'Cartão Nubank PF',
      'Cartão C6 PJ',
      'Boleto Bancário',
      'Débito em Conta (Banco Safra)',
      'Débito em Conta (Banco Inter)'
    ]
    defaults.forEach(d => {
      if (!list.includes(d)) list.push(d)
    })
    return list
  }, [])

  // Carrega parcelamentos do store local + API
  const loadInstallments = useCallback(() => {
    const localItems = InstallmentStore.getInstallments()
    setInstallments(localItems)
  }, [])

  useEffect(() => {
    loadInstallments()

    const handleUpdate = () => loadInstallments()
    if (typeof window !== 'undefined') {
      window.addEventListener('leaomed_installments_updated', handleUpdate)
    }

    if (!isDemo) {
      let isMounted = true
      fetch('/api/installments')
        .then(res => res.json())
        .then(data => {
          if (!isMounted) return
          if (data.success && Array.isArray(data.installments) && data.installments.length > 0) {
            const dbMapped: InstallmentItem[] = data.installments.map((row: any) => ({
              id: String(row.id),
              name: row.description,
              category: row.category,
              subcategory: row.subcategory,
              monthlyValue: parseFloat(row.installment_amount) || 0,
              currentInstallment: row.current_installment,
              totalInstallments: row.total_installments,
              endMonthYear: row.end_date ? new Date(row.end_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : formatEndMonthYear(row.current_installment, row.total_installments),
              contractNotes: `Forma de pagamento: ${row.payment_method || 'Cartão'}`,
              paymentMethod: row.payment_method || 'Cartão de Crédito'
            }))
            
            // Mescla dados do banco com atualizações locais do usuário
            const localList = InstallmentStore.getInstallments()
            const merged = [...localList]
            dbMapped.forEach(dbItem => {
              if (!merged.some(m => m.id === dbItem.id || m.name.toLowerCase() === dbItem.name.toLowerCase())) {
                merged.push(dbItem)
              }
            })
            setInstallments(merged)
          }
        })
        .catch(() => {})

      return () => {
        isMounted = false
        if (typeof window !== 'undefined') {
          window.removeEventListener('leaomed_installments_updated', handleUpdate)
        }
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('leaomed_installments_updated', handleUpdate)
      }
    }
  }, [isDemo, loadInstallments])

  // Handlers de Edição
  const handleOpenEdit = (item: InstallmentItem) => {
    setEditingItem(item)
    const methodExists = availableCards.includes(item.paymentMethod)
    setEditForm({
      name: item.name,
      category: item.category,
      monthlyValue: String(item.monthlyValue),
      currentInstallment: String(item.currentInstallment),
      totalInstallments: String(item.totalInstallments),
      paymentMethod: methodExists ? item.paymentMethod : 'CUSTOM',
      customPaymentMethod: methodExists ? '' : item.paymentMethod,
      isCustomMethod: !methodExists,
      contractNotes: item.contractNotes || '',
      isPerpetual: Boolean(item.isPerpetual)
    })
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    const monthlyVal = parseFloat(editForm.monthlyValue) || 0
    const currInst = parseInt(editForm.currentInstallment, 10) || 1
    const totInst = parseInt(editForm.totalInstallments, 10) || 12
    const finalMethod = editForm.isCustomMethod ? editForm.customPaymentMethod.trim() : editForm.paymentMethod

    const updatedData: Partial<InstallmentItem> = {
      name: editForm.name.trim(),
      category: editForm.category.trim() || 'Outros',
      monthlyValue: monthlyVal,
      currentInstallment: currInst,
      totalInstallments: totInst,
      paymentMethod: finalMethod || 'Cartão de Crédito',
      contractNotes: editForm.contractNotes.trim(),
      isPerpetual: editForm.isPerpetual,
      endMonthYear: editForm.isPerpetual ? 'Mensal Contínuo' : formatEndMonthYear(currInst, totInst)
    }

    InstallmentStore.updateInstallment(editingItem.id, updatedData)

    // Sincroniza via API no backend Neon se conectado
    if (!isDemo) {
      fetch('/api/installments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          description: updatedData.name,
          category: updatedData.category,
          installment_amount: updatedData.monthlyValue,
          current_installment: updatedData.currentInstallment,
          total_installments: updatedData.totalInstallments,
          payment_method: updatedData.paymentMethod
        })
      }).catch(() => {})
    }

    setEditingItem(null)
    loadInstallments()
  }

  // Handlers de Adição
  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name || !newForm.monthlyValue) return

    const monthlyVal = parseFloat(newForm.monthlyValue) || 0
    const currInst = parseInt(newForm.currentInstallment, 10) || 1
    const totInst = parseInt(newForm.totalInstallments, 10) || 12
    const finalMethod = newForm.isCustomMethod ? newForm.customPaymentMethod.trim() : newForm.paymentMethod

    const newItemData = {
      name: newForm.name.trim(),
      category: newForm.category.trim() || 'Outros',
      monthlyValue: monthlyVal,
      currentInstallment: currInst,
      totalInstallments: totInst,
      paymentMethod: finalMethod || 'Cartão de Crédito',
      contractNotes: newForm.contractNotes.trim(),
      isPerpetual: newForm.isPerpetual,
      endMonthYear: newForm.isPerpetual ? 'Mensal Contínuo' : formatEndMonthYear(currInst, totInst)
    }

    const created = InstallmentStore.addInstallment(newItemData)

    // Sincroniza via API no backend Neon se conectado
    if (!isDemo) {
      fetch('/api/installments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: created.name,
          category: created.category,
          installment_amount: created.monthlyValue,
          current_installment: created.currentInstallment,
          total_installments: created.totalInstallments,
          payment_method: created.paymentMethod
        })
      }).catch(() => {})
    }

    setIsAddModalOpen(false)
    setNewForm({
      name: '',
      category: 'Casa',
      monthlyValue: '',
      currentInstallment: '1',
      totalInstallments: '10',
      paymentMethod: 'Cartão Itaú PF',
      customPaymentMethod: '',
      isCustomMethod: false,
      contractNotes: '',
      isPerpetual: false
    })
    loadInstallments()
  }

  // Handler de Exclusão
  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente remover este parcelamento?')) return
    InstallmentStore.deleteInstallment(id)

    if (!isDemo) {
      fetch(`/api/installments?id=${id}`, { method: 'DELETE' }).catch(() => {})
    }

    loadInstallments()
  }

  const totalMonthlyCommitment = installments.reduce((acc, curr) => acc + curr.monthlyValue, 0)
  
  // Marcos de Alívio calculados dinamicamente
  const reliefOct26 = installments
    .filter(i => i.endMonthYear.toLowerCase().includes('2026'))
    .reduce((acc, curr) => acc + curr.monthlyValue, 0)
  const reliefApr27 = reliefOct26 + installments
    .filter(i => i.endMonthYear.toLowerCase().includes('2027'))
    .reduce((acc, curr) => acc + curr.monthlyValue, 0)
  const reliefOct27 = totalMonthlyCommitment

  const filteredInstallments = installments.filter(item => {
    if (filter === 'MAJOR') return item.monthlyValue >= 1000
    if (filter === 'ENDING_SOON') return item.endMonthYear.includes('2026')
    return true
  })

  return (
    <section id="parcelamentos" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 md:p-6 shadow-sm">
      {/* Header com Totais e Ações */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <CalendarClock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Previsibilidade de Parcelamentos & Dívidas
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestão auditada de contratos, financiamentos e compras parceladas no cartão de crédito.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-1 text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'ALL' 
                  ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({installments.length})
            </button>
            <button
              onClick={() => setFilter('MAJOR')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'MAJOR' 
                  ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grandes &gt; R$ 1k
            </button>
            <button
              onClick={() => setFilter('ENDING_SOON')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === 'ENDING_SOON' 
                  ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Quitam em 2026
            </button>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs px-3.5 py-1.5 rounded-xl font-bold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>R$ {totalMonthlyCommitment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Novo Parcelamento</span>
          </button>
        </div>
      </div>

      {/* Destaques de Alívio Contratual Auditado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">1º Alívio (Out/26)</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              + R$ {reliefOct26.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Quitação de Vivara, Lava e Seca (Itaú) e TV TCL (Nubank)
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Mega Alívio (Abril/2027)</div>
            <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
              + R$ {reliefApr27.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Fim das 16x da Entrada T-Cross Cartão C6
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">T-Cross 100% Quitado (Out/2027)</div>
            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
              + R$ {reliefOct27.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Fim do Financiamento Banco Safra (CCB 493464)
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Parcelamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredInstallments.map((item) => {
          const dynamic = computeDynamicInstallment(item, selectedMonth, selectedYear)
          const progress = dynamic.progress
          
          return (
            <div 
              key={item.id} 
              className={`border rounded-xl p-4 transition-all group flex flex-col justify-between relative ${
                dynamic.isConcluded
                  ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : dynamic.isLastInstallment
                  ? 'border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/50 hover:border-indigo-500/40'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="pr-12">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CreditCard className="w-3 h-3 text-indigo-400 shrink-0" />
                      <strong className="text-indigo-600 dark:text-indigo-300 font-bold">{item.paymentMethod}</strong> • {item.category}
                    </span>
                  </div>

                  {/* Botões de Ação (Editar e Excluir) */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200/80 dark:border-white/10 shadow-xs">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Editar cartão ou dados do parcelamento"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Remover parcelamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-2.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 font-mono block">
                      R$ {item.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400">ao mês</span>
                  </div>
                  {dynamic.isConcluded ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      ✓ Quitado
                    </span>
                  ) : dynamic.isLastInstallment ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                      Última Parcela
                    </span>
                  ) : null}
                </div>

                {item.contractNotes && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/5 p-2 rounded-lg border border-slate-200/60 dark:border-white/5 mb-3 leading-relaxed">
                    {item.contractNotes}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                  <span className={`font-semibold ${dynamic.badgeClass}`}>
                    {dynamic.statusLabel}
                  </span>
                  <span className={`font-bold ${item.isPerpetual ? 'text-amber-500 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.endMonthYear}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.isPerpetual 
                        ? 'bg-amber-500 w-full' 
                        : dynamic.isConcluded
                        ? 'bg-emerald-500'
                        : dynamic.isLastInstallment
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL DE EDIÇÃO DE PARCELAMENTO */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Editar Parcelamento / Dívida
              </h3>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Nome do Parcelamento / Contrato
                </label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* SELEÇÃO DO CARTÃO OU FORMA DE PAGAMENTO */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Cartão / Forma de Pagamento
                </label>
                {!editForm.isCustomMethod ? (
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'CUSTOM') {
                        setEditForm(prev => ({ ...prev, isCustomMethod: true, customPaymentMethod: '' }))
                      } else {
                        setEditForm(prev => ({ ...prev, paymentMethod: val, isCustomMethod: false }))
                      }
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-indigo-500/40 px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  >
                    {availableCards.map(card => (
                      <option key={card} value={card}>{card}</option>
                    ))}
                    <option value="CUSTOM">✨ + Outro Cartão / Banco...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Ex: Cartão Itaú Personalité, Cartão Inter..."
                      value={editForm.customPaymentMethod}
                      onChange={(e) => setEditForm({ ...editForm, customPaymentMethod: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-indigo-500 px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, isCustomMethod: false, paymentMethod: availableCards[0] || '' })}
                      className="text-[10px] text-slate-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Valor da Parcela (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editForm.monthlyValue}
                    onChange={(e) => setEditForm({ ...editForm, monthlyValue: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Categoria
                  </label>
                  <input 
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Parcela Atual
                  </label>
                  <input 
                    type="number"
                    value={editForm.currentInstallment}
                    onChange={(e) => setEditForm({ ...editForm, currentInstallment: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Total de Parcelas
                  </label>
                  <input 
                    type="number"
                    value={editForm.totalInstallments}
                    onChange={(e) => setEditForm({ ...editForm, totalInstallments: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Observações / Detalhes do Contrato
                </label>
                <textarea 
                  rows={2}
                  value={editForm.contractNotes}
                  onChange={(e) => setEditForm({ ...editForm, contractNotes: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input 
                    type="checkbox"
                    checked={editForm.isPerpetual}
                    onChange={(e) => setEditForm({ ...editForm, isPerpetual: e.target.checked })}
                    className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-indigo-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Mensalidade contínua (Sem término definido)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO PARCELAMENTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <form onSubmit={handleSaveNew} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                Novo Parcelamento ou Dívida
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Nome do Parcelamento / Contrato
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Compra Notebook 10x, Lava e Seca..."
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* SELEÇÃO DO CARTÃO OU FORMA DE PAGAMENTO */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  Cartão / Forma de Pagamento
                </label>
                {!newForm.isCustomMethod ? (
                  <select
                    value={newForm.paymentMethod}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val === 'CUSTOM') {
                        setNewForm(prev => ({ ...prev, isCustomMethod: true, customPaymentMethod: '' }))
                      } else {
                        setNewForm(prev => ({ ...prev, paymentMethod: val, isCustomMethod: false }))
                      }
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-indigo-500/40 px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  >
                    {availableCards.map(card => (
                      <option key={card} value={card}>{card}</option>
                    ))}
                    <option value="CUSTOM">✨ + Outro Cartão / Banco...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Ex: Cartão Itaú Personalité, Cartão Inter..."
                      value={newForm.customPaymentMethod}
                      onChange={(e) => setNewForm({ ...newForm, customPaymentMethod: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-indigo-500 px-3 py-2 text-xs font-bold text-indigo-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewForm({ ...newForm, isCustomMethod: false, paymentMethod: availableCards[0] || '' })}
                      className="text-[10px] text-slate-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Valor da Parcela (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={newForm.monthlyValue}
                    onChange={(e) => setNewForm({ ...newForm, monthlyValue: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Categoria
                  </label>
                  <input 
                    type="text"
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Parcela Atual
                  </label>
                  <input 
                    type="number"
                    value={newForm.currentInstallment}
                    onChange={(e) => setNewForm({ ...newForm, currentInstallment: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Total de Parcelas
                  </label>
                  <input 
                    type="number"
                    value={newForm.totalInstallments}
                    onChange={(e) => setNewForm({ ...newForm, totalInstallments: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Observações / Detalhes do Contrato
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Compra de eletrodoméstico parcelada no cartão"
                  value={newForm.contractNotes}
                  onChange={(e) => setNewForm({ ...newForm, contractNotes: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input 
                    type="checkbox"
                    checked={newForm.isPerpetual}
                    onChange={(e) => setNewForm({ ...newForm, isPerpetual: e.target.checked })}
                    className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-indigo-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Mensalidade contínua (Sem término definido)</span>
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
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Salvar Parcelamento</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
