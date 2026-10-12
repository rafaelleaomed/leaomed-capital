'use client'

import { getFinancialScopeVersion } from '@/utils/userScopedStorage'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  CalendarCheck2, 
  ArrowLeft, 
  ChevronDown, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { 
  InstallmentStore, 
  InstallmentItem, 
  formatEndMonthYear 
} from '@/utils/installmentStore'
import { CreditCardStore } from '@/utils/creditCardStore'
import { 
  convertInstallmentItemsToContracts, 
  addMonths, 
  monthLabel, 
  monthNumber, 
  lastBillingMonth, 
  remainingAfterMonth, 
  currentMonthInSaoPaulo,
  InstallmentContract 
} from '@/utils/installmentsEngine'
import { ReliefCard } from './ReliefCard'

interface InstallmentsProjectionProps {
  isDemo?: boolean
  selectedMonth?: number // 0-11
  selectedYear?: number  // ex: 2026
  onBack?: () => void
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
      badgeClass: 'text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]',
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
      const diffMonths = (endY - vYear) * 12 + (endM - vMonth)

      if (diffMonths < 0) {
        return {
          currentInstallment: item.totalInstallments,
          totalInstallments: item.totalInstallments,
          isConcluded: true,
          isLastInstallment: false,
          statusLabel: `Quitado em ${item.endMonthYear}`,
          badgeClass: 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-bold',
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
          ? 'text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] font-bold'
          : 'text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-medium',
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
    badgeClass: 'text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-medium',
    progress: (current / item.totalInstallments) * 100
  }
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  })
}

export function InstallmentsProjection({ 
  isDemo = false, 
  selectedMonth, 
  selectedYear,
  onBack 
}: InstallmentsProjectionProps) {
  const financialScopeVersion = React.useRef(getFinancialScopeVersion()).current
  // Mês de referência no formato YYYY-MM
  const initialMonth = useMemo(() => {
    if (selectedYear !== undefined && selectedMonth !== undefined) {
      return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
    }
    return currentMonthInSaoPaulo()
  }, [selectedYear, selectedMonth])

  const [refMonth, setRefMonth] = useState<string>(initialMonth)

  useEffect(() => {
    if (selectedYear !== undefined && selectedMonth !== undefined) {
      setRefMonth(`${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`)
    }
  }, [selectedYear, selectedMonth])

  // Filtros de visualização
  const [filter, setFilter] = useState<'active' | 'current' | 'next' | 'all'>('active')
  const [cardOnly, setCardOnly] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Lista bruta de parcelamentos do store local + API
  const [installments, setInstallments] = useState<InstallmentItem[]>([])
  
  // Status de conferência local (item.id -> boolean)
  const [reviewedMap, setReviewedMap] = useState<Record<string, boolean>>({})

  // Modais de Edição e Adição
  const [editingItem, setEditingItem] = useState<InstallmentItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

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

  // Lista de cartões configurados no sistema
  const availableCards = useMemo(() => {
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

  // Carrega parcelamentos do store local
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
          if (getFinancialScopeVersion() !== financialScopeVersion) return
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
              endMonthYear: row.end_date 
                ? new Date(row.end_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) 
                : formatEndMonthYear(row.current_installment, row.total_installments),
              contractNotes: `Forma de pagamento: ${row.payment_method || 'Cartão'}`,
              paymentMethod: row.payment_method || 'Cartão de Crédito'
            }))
            
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

  // Converte itens da base em contratos tipados do motor de alívio
  const contracts: InstallmentContract[] = useMemo(() => {
    const rawContracts = convertInstallmentItemsToContracts(installments)
    return rawContracts.map(c => ({
      ...c,
      reviewed: reviewedMap[c.id] !== undefined ? reviewedMap[c.id] : c.reviewed
    }))
  }, [installments, reviewedMap])

  // Contratos filtrados por escopo (padrão PF) e regras da tela
  const visibleContracts = useMemo(() => {
    return contracts.filter(item => {
      if (cardOnly && item.kind !== 'credit-card') return false
      const end = lastBillingMonth(item)
      if (filter === 'current') return item.status === 'active' && end === refMonth
      if (filter === 'next') return item.status === 'active' && end === addMonths(refMonth, 1)
      if (filter === 'all') return true
      return item.status === 'active' && (!end || end >= refMonth)
    })
  }, [contracts, cardOnly, filter, refMonth])

  // Alterna o status de conferido
  const handleToggleReview = (id: string) => {
    setReviewedMap(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }))
  }

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
    if (getFinancialScopeVersion() !== financialScopeVersion) return
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

    if (getFinancialScopeVersion() !== financialScopeVersion) return
    InstallmentStore.updateInstallment(editingItem.id, updatedData)

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
    if (getFinancialScopeVersion() !== financialScopeVersion) return
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
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    if (!confirm('Deseja realmente remover este parcelamento?')) return
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    InstallmentStore.deleteInstallment(id)

    if (!isDemo) {
      fetch(`/api/installments?id=${id}`, { method: 'DELETE' }).catch(() => {})
    }

    loadInstallments()
  }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* ── Toolbar Superior ────────────────────────────────────────────── */}
      <div className="installment-toolbar">
        {onBack ? (
          <button 
            type="button" 
            className="secondary-button cursor-pointer" 
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            <span>Voltar ao resumo</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex w-full min-w-0 flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-xs text-[var(--capital-muted,#b0b8bd)]">
            <span>Mês de referência das parcelas:</span>
            <input 
              type="month" 
              value={refMonth} 
              onChange={(e) => e.target.value && setRefMonth(e.target.value)}
              className="bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#f6f3e9)] px-3 py-1.5 border border-[var(--capital-line,#e4dfd3)] rounded-lg text-xs font-semibold focus:outline-none focus:border-[var(--capital-accent,#927025)]"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="primary-button cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Novo Parcelamento</span>
          </button>
        </div>
      </div>

      {/* ── Card de Previsibilidade de Alívio ────────────────────────────── */}
      <ReliefCard 
        contracts={contracts} 
        scope="PF" 
        month={refMonth} 
        onOpen={() => setFilter('current')}
      />

      {/* ── Barra de Controles e Filtros Segmentados ──────────────────────── */}
      <div className="planning-controls installment-filters flex-wrap gap-3">
        <div className="segmented">
          {[
            ['active', 'Em andamento'],
            ['current', 'Encerram neste mês'],
            ['next', 'Encerram no próximo'],
            ['all', 'Todos']
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? 'active' : ''}
              aria-pressed={filter === id}
              onClick={() => setFilter(id as any)}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="check-label flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-muted,#b0b8bd)]">
          <input 
            type="checkbox" 
            checked={cardOnly} 
            onChange={(e) => setCardOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#232a2e)] text-[var(--capital-accent,#927025)] focus:ring-[#E4C77B]"
          />
          <span>Somente cartões</span>
        </label>
      </div>

      {/* ── Nota Informativa ──────────────────────────────────────────────── */}
      <p className="small-note installment-note text-xs text-[var(--capital-muted,#b0b8bd)]">
        {visibleContracts.length} contratos cadastrados. O alívio do resumo considera apenas parcelas de cartão; financiamentos e cobranças contínuas ficam separados.
      </p>

      {/* ── Grid de Cards de Parcelamento (Estilo Capital) ─────────────────── */}
      <div className="installment-grid">
        {visibleContracts.map((item) => {
          const end = lastBillingMonth(item)
          const current = Math.max(0, Math.min(item.totalInstallments ?? Infinity, monthNumber(refMonth) - monthNumber(item.firstBillingMonth) + 1))
          const last = end === refMonth && item.status === 'active'
          const remaining = remainingAfterMonth(item, refMonth)
          const isExpanded = expandedId === item.id

          // Encontra o item original no store para edição
          const rawItem = installments.find(i => i.id === item.id)

          return (
            <section 
              className={`capital-panel installment-card ${last ? 'ending' : ''} relative group`} 
              key={item.id}
            >
              <div className="panel-heading">
                <div className="min-w-0 pr-8">
                  <h2 className="text-base font-semibold text-[var(--capital-text,#f6f3e9)] truncate">{item.title}</h2>
                  <span className="small-note text-xs text-[var(--capital-muted,#b0b8bd)] block truncate">
                    {item.account} · {item.category}
                  </span>
                </div>
                <CalendarCheck2 size={19} className="text-[var(--capital-accent,#927025)] shrink-0" />

                {/* Ações de Edição e Exclusão no Card */}
                {rawItem && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rawItem)}
                      className="p-1 text-[var(--capital-muted,#b0b8bd)] hover:text-[var(--capital-accent,#927025)] hover:bg-[#323126] rounded transition-colors"
                      title="Editar dados do parcelamento"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(rawItem.id)}
                      className="p-1 text-[var(--capital-muted,#b0b8bd)] hover:text-[var(--capital-danger,#ad3333)] hover:bg-[var(--capital-danger-soft,#fcecec)] rounded transition-colors"
                      title="Remover parcelamento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="installment-amount flex items-baseline gap-2 my-3">
                <strong className="text-2xl font-bold text-[var(--capital-accent,#927025)]">
                  {formatBRL(item.amountCents / 100)}
                </strong>
                <span className="text-xs text-[var(--capital-muted,#b0b8bd)]">/mês</span>
                {last && (
                  <span className="status pending text-[11px] px-2 py-0.5 rounded font-semibold ml-auto">
                    Última parcela
                  </span>
                )}
              </div>

              <span className="small-note text-xs text-[var(--capital-muted,#b0b8bd)] block">
                {item.kind === 'recurring' 
                  ? 'Cobrança contínua' 
                  : `${item.kind === 'loan' ? 'Financiamento' : 'Cartão'} · ${current} de ${item.totalInstallments} parcelas`}
              </span>

              <div className="bar-track my-2.5">
                <span 
                  style={{ width: `${item.totalInstallments ? Math.min(100, Math.max(5, (current / item.totalInstallments) * 100)) : 100}%` }} 
                />
              </div>

              <div className="installment-meta flex items-center justify-between text-xs text-[var(--capital-muted,#b0b8bd)]">
                <span>{end ? `Última cobrança: ${monthLabel(end)}` : 'Sem término definido'}</span>
                <span className={`status ${item.reviewed ? 'reviewed' : 'pending'}`}>
                  {item.status === 'active' 
                    ? (item.reviewed ? 'Conferido' : 'Revisão pendente') 
                    : (item.status === 'cancelled' ? 'Cancelado' : 'Quitado')}
                </span>
              </div>

              <button 
                type="button" 
                className="text-action mt-2 cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-[var(--capital-accent,#927025)]"
                aria-expanded={isExpanded} 
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <span>Conferir detalhes</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="installment-details pt-3 border-t border-[var(--capital-line,#e4dfd3)] mt-3 space-y-2 text-xs text-[var(--capital-muted,#b0b8bd)]">
                  <p>Primeira fatura: <strong className="text-[var(--capital-text,#f6f3e9)]">{monthLabel(item.firstBillingMonth)}</strong>.</p>
                  <p>
                    {remaining === null 
                      ? 'Sem saldo de parcelas calculável.' 
                      : `Parcelas posteriores ao mês de referência: ${formatBRL(remaining / 100)}.`}
                  </p>
                  <p>
                    {last 
                      ? `Redução da cobrança a partir de ${monthLabel(addMonths(refMonth, 1))}.` 
                      : 'A previsão depende dos valores e datas cadastrados.'}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-2">
                    <button 
                      type="button" 
                      className="secondary-button text-xs py-1.5 px-3 cursor-pointer" 
                      onClick={() => handleToggleReview(item.id)}
                    >
                      <Check size={14} />
                      <span>{item.reviewed ? 'Marcar para revisar' : 'Marcar como conferido'}</span>
                    </button>
                    {rawItem && (
                      <button
                        type="button"
                        className="secondary-button text-xs py-1.5 px-3 cursor-pointer"
                        onClick={() => handleOpenEdit(rawItem)}
                      >
                        <Edit3 size={14} />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {visibleContracts.length === 0 && (
        <section className="capital-panel empty-state py-12 flex flex-col items-center justify-center text-center">
          <CalendarCheck2 size={32} className="text-[var(--capital-muted,#b0b8bd)] mb-3" />
          <h2 className="text-lg font-bold text-[var(--capital-text,#f6f3e9)]">Nenhuma parcela neste filtro</h2>
          <p className="text-xs text-[var(--capital-muted,#b0b8bd)] max-w-md mt-1">
            Nenhum contrato ativo corresponde aos filtros selecionados para {monthLabel(refMonth)}. Adicione um novo parcelamento ou altere os filtros acima.
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="primary-button mt-4 cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Cadastrar Parcelamento</span>
          </button>
        </section>
      )}

      {/* ── MODAL DE EDIÇÃO DE PARCELAMENTO ──────────────────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[#11161B]/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="capital-modal w-full max-w-md border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#f6f3e9)] p-6 rounded-2xl shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="modal-header flex items-center justify-between border-b border-[var(--capital-line,#e4dfd3)] pb-3">
              <h3 className="font-bold text-base text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[var(--capital-accent,#927025)]" />
                <span>Editar Parcelamento / Contrato</span>
              </h3>
              <button 
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-[var(--capital-muted,#b0b8bd)] hover:text-[var(--capital-text,#f6f3e9)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                  Nome do Parcelamento / Contrato
                </label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-accent,#927025)] block mb-1 flex items-center gap-1">
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
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)] cursor-pointer"
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
                      className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, isCustomMethod: false, paymentMethod: availableCards[0] || '' })}
                      className="text-[10px] text-[var(--capital-muted,#b0b8bd)] hover:text-[var(--capital-text,#f6f3e9)] p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Valor da Parcela (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={editForm.monthlyValue}
                    onChange={(e) => setEditForm({ ...editForm, monthlyValue: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Categoria
                  </label>
                  <input 
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Parcela Atual
                  </label>
                  <input 
                    type="number"
                    value={editForm.currentInstallment}
                    onChange={(e) => setEditForm({ ...editForm, currentInstallment: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Total de Parcelas
                  </label>
                  <input 
                    type="number"
                    value={editForm.totalInstallments}
                    onChange={(e) => setEditForm({ ...editForm, totalInstallments: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                  Observações / Detalhes do Contrato
                </label>
                <textarea 
                  rows={2}
                  value={editForm.contractNotes}
                  onChange={(e) => setEditForm({ ...editForm, contractNotes: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                />
              </div>

              <div className="pt-2 border-t border-[var(--capital-line,#e4dfd3)]">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-muted,#b0b8bd)]">
                  <input 
                    type="checkbox"
                    checked={editForm.isPerpetual}
                    onChange={(e) => setEditForm({ ...editForm, isPerpetual: e.target.checked })}
                    className="rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#232a2e)] text-[var(--capital-accent,#927025)] focus:ring-[#E4C77B] w-4 h-4 cursor-pointer"
                  />
                  <span>Mensalidade contínua (Sem término definido)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--capital-line,#e4dfd3)]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="secondary-button cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="primary-button cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE NOVO PARCELAMENTO ──────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[#11161B]/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form onSubmit={handleSaveNew} className="capital-modal w-full max-w-md border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#f6f3e9)] p-6 rounded-2xl shadow-sm space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="modal-header flex items-center justify-between border-b border-[var(--capital-line,#e4dfd3)] pb-3">
              <h3 className="font-bold text-base text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[var(--capital-accent,#927025)]" />
                <span>Novo Parcelamento ou Dívida</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--capital-muted,#b0b8bd)] hover:text-[var(--capital-text,#f6f3e9)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                  Nome do Parcelamento / Contrato
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Compra Notebook 10x, Lava e Seca..."
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-accent,#927025)] block mb-1 flex items-center gap-1">
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
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)] cursor-pointer"
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
                      className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-accent,#927025)] px-3 py-2 text-xs font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setNewForm({ ...newForm, isCustomMethod: false, paymentMethod: availableCards[0] || '' })}
                      className="text-[10px] text-[var(--capital-muted,#b0b8bd)] hover:text-[var(--capital-text,#f6f3e9)] p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Valor da Parcela (R$)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={newForm.monthlyValue}
                    onChange={(e) => setNewForm({ ...newForm, monthlyValue: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Categoria
                  </label>
                  <input 
                    type="text"
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Parcela Atual
                  </label>
                  <input 
                    type="number"
                    value={newForm.currentInstallment}
                    onChange={(e) => setNewForm({ ...newForm, currentInstallment: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                    Total de Parcelas
                  </label>
                  <input 
                    type="number"
                    value={newForm.totalInstallments}
                    onChange={(e) => setNewForm({ ...newForm, totalInstallments: e.target.value })}
                    className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-mono font-bold text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#b0b8bd)] block mb-1">
                  Observações / Detalhes do Contrato
                </label>
                <textarea 
                  rows={2}
                  placeholder="Ex: Compra de eletrodoméstico parcelada no cartão"
                  value={newForm.contractNotes}
                  onChange={(e) => setNewForm({ ...newForm, contractNotes: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:border-[var(--capital-accent,#927025)]"
                />
              </div>

              <div className="pt-2 border-t border-[var(--capital-line,#e4dfd3)]">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--capital-muted,#b0b8bd)]">
                  <input 
                    type="checkbox"
                    checked={newForm.isPerpetual}
                    onChange={(e) => setNewForm({ ...newForm, isPerpetual: e.target.checked })}
                    className="rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#232a2e)] text-[var(--capital-accent,#927025)] focus:ring-[#E4C77B] w-4 h-4 cursor-pointer"
                  />
                  <span>Mensalidade contínua (Sem término definido)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--capital-line,#e4dfd3)]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="secondary-button cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="primary-button cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Salvar Parcelamento</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default InstallmentsProjection
