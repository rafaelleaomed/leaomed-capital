'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  Check, 
  X, 
  Tag, 
  HelpCircle, 
  Sliders, 
  CreditCard, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  BrainCircuit, 
  BookmarkCheck,
  AlertTriangle
} from 'lucide-react'
import { CategoryRulesEngine, PredictionResult } from '@/utils/categoryRulesEngine'
import { GranularTransactionStore } from '@/utils/granularTransactionStore'
import { USER_TAXONOMY, USER_TAXONOMY_MAP, getCategoriesByScope, getSubcategoriesForCategory } from '@/utils/taxonomy'

export interface IncomingTransaction {
  id?: string
  date: string
  competenceDate?: string
  description: string
  amount: number
  accountOrCard: string
  entityType?: 'PF' | 'PJ'
  category?: string
  subcategory?: string
  entryType?: 'purchase' | 'refund' | 'fee' | 'bill_payment' | 'cash_withdrawal' | 'adjustment'
  signedAmount?: number
  direction?: 'debit' | 'credit'
  isCardBillPayment?: boolean
}

interface SmartCategorizationModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: IncomingTransaction[]
  onCompleted?: (savedCount: number) => void
}

interface ReviewedItem {
  id: string
  date: string
  competenceDate?: string
  description: string
  amount: number
  accountOrCard: string
  entityType: 'PF' | 'PJ'
  category: string
  subcategory: string
  subdivision?: string
  source: 'USER_RULE' | 'SMART_HEURISTIC' | 'DEFAULT'
  isCardBillPayment: boolean
  entryType: NonNullable<IncomingTransaction['entryType']>
  alwaysApplyRule: boolean
  ruleKeyword: string
}

export function SmartCategorizationModal({
  isOpen,
  onClose,
  transactions,
  onCompleted
}: SmartCategorizationModalProps) {
  const [items, setItems] = useState<ReviewedItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Ao receber transações, passa pelo motor preditivo de regras
  useEffect(() => {
    if (!isOpen || !transactions || transactions.length === 0) return

    const prepared: ReviewedItem[] = transactions.map((t, idx) => {
      const entityScope = t.entityType || 'PF'
      const pred = CategoryRulesEngine.predict(t.description, entityScope)
      
      // Valida se a categoria fornecida ou prevista existe na taxonomia oficial
      const validCategory = (t.category && USER_TAXONOMY_MAP[t.category]) 
        ? t.category 
        : (USER_TAXONOMY_MAP[pred.category] ? pred.category : (entityScope === 'PJ' ? 'Empresa - Despesas Fixas' : 'Casa'))
      
      const availableSubcats = getSubcategoriesForCategory(validCategory)
      const validSubcat = (t.subcategory && availableSubcats.includes(t.subcategory))
        ? t.subcategory
        : (availableSubcats.includes(pred.subcategory) ? pred.subcategory : (availableSubcats[0] || 'Diversos'))

      // Extrai a primeira palavra ou termo representativo para sugestão de regra
      const words = t.description.trim().split(/\s+/)
      const defaultKeyword = words[0]?.length > 2 ? words[0] : (words[1] || t.description)
      const entryType = t.entryType || (t.isCardBillPayment ? 'bill_payment' : 'purchase')
      const signedAmount = typeof t.signedAmount === 'number' ? t.signedAmount : t.amount
      const isCredit = t.direction === 'credit' || entryType === 'refund' || signedAmount < 0

      return {
        id: t.id || `inc_${Date.now()}_${idx}`,
        date: t.date || new Date().toISOString().split('T')[0],
        competenceDate: t.competenceDate,
        description: t.description,
        amount: isCredit ? Math.abs(signedAmount) : -Math.abs(signedAmount),
        accountOrCard: t.accountOrCard || 'Cartão de Crédito',
        entityType: entityScope,
        category: validCategory,
        subcategory: validSubcat,
        subdivision: pred.subdivision,
        source: pred.source,
        isCardBillPayment: entryType === 'bill_payment' || Boolean(t.isCardBillPayment) || pred.isCardBillPayment,
        entryType,
        alwaysApplyRule: pred.source !== 'USER_RULE', // Sugere criar regra se ainda não for regra do usuário
        ruleKeyword: defaultKeyword.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚãõÃÕçÇ]/g, '')
      }
    })

    setItems(prepared)
    setSuccessBanner(null)
  }, [isOpen, transactions])

  if (!isOpen) return null

  const handleCategoryChange = (index: number, newCat: string) => {
    const updated = [...items]
    updated[index].category = newCat
    const subcats = getSubcategoriesForCategory(newCat)
    updated[index].subcategory = subcats[0] || 'Diversos'
    setItems(updated)
  }

  const handleSubcategoryChange = (index: number, newSub: string) => {
    const updated = [...items]
    updated[index].subcategory = newSub
    setItems(updated)
  }

  const handleSubdivisionChange = (index: number, newSubdiv: string) => {
    const updated = [...items]
    updated[index].subdivision = newSubdiv
    setItems(updated)
  }

  const handleToggleAlwaysApply = (index: number) => {
    const updated = [...items]
    updated[index].alwaysApplyRule = !updated[index].alwaysApplyRule
    setItems(updated)
  }

  const handleKeywordChange = (index: number, val: string) => {
    const updated = [...items]
    updated[index].ruleKeyword = val
    setItems(updated)
  }

  const handleConfirmAndSave = async () => {
    if (items.length === 0) return
    setIsSaving(true)
    let rulesCreatedCount = 0

    // 1. Salvar regras que o usuário marcou "Sempre categorizar lançamentos contendo..."
    items.forEach(item => {
      if (item.alwaysApplyRule && item.ruleKeyword.trim().length >= 2) {
        CategoryRulesEngine.saveRule({
          pattern: item.ruleKeyword.trim(),
          category: item.category,
          subcategory: item.subcategory,
          subdivision: item.subdivision,
          entityType: item.entityType,
          alwaysApply: true
        })
        rulesCreatedCount++
      }
    })

    // 2. Salvar transações no PostgreSQL via API /api/transactions
    try {
      const payloadTransactions = items.filter(i => !i.isCardBillPayment).map(i => ({
        date: i.date,
        competenceDate: i.competenceDate,
        description: i.description,
        amount: i.amount,
        accountOrCard: i.accountOrCard,
        category: i.category,
        subcategory: i.subcategory,
        subdivision: i.subdivision,
        isFixed: false,
        isIgnored: false
      }))

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: payloadTransactions })
      })

      const result = await res.json().catch(() => null)
      if (!res.ok || !result?.success) {
        throw new Error(result?.error || result?.message || 'Não foi possível gravar todos os lançamentos no banco.')
      }
    } catch (apiErr: any) {
      setIsSaving(false)
      setSuccessBanner(`Não foi possível concluir a gravação: ${apiErr?.message || 'erro no banco de dados.'}`)
      return
    }

    // 3. Salvar transações na base granular / cache local
    GranularTransactionStore.addBatch(items.filter(i => !i.isCardBillPayment).map(i => ({
      date: i.date,
      description: i.description,
      amount: i.amount,
      accountOrCard: i.accountOrCard,
      category: i.category,
      subcategory: i.subcategory,
      subdivision: i.subdivision,
      entityType: i.entityType,
      isFixed: false,
      source: 'INVOICE'
    })))

    setIsSaving(false)
    setSuccessBanner(`🎉 ${items.length} lançamentos persistidos no banco e ${rulesCreatedCount} regras memorizadas!`)

    setTimeout(() => {
      onCompleted?.(items.length)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] shadow-sm overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-cat-title"
      >
        {/* Header Superior */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <div>
              <h2 id="smart-cat-title" className="font-display font-bold text-base md:text-lg text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                Categorização Inteligente & Memória de Regras
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
                  {items.length} itens detectados
                </span>
              </h2>
              <p className="text-xs text-[var(--capital-muted,#242a2e)]">
                O sistema sugere a categoria ideal. Marque a opção para memorizar e nunca mais precisar categorizar manualmente nos próximos meses.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Fechar"
            className="text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] p-2 rounded-xl hover:bg-[var(--capital-card,#fff)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {successBanner && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] text-xs font-semibold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-[var(--capital-success,#157449)] shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Corpo com a Lista de Itens para Revisão */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[var(--capital-accent,#927025)] text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--capital-accent,#927025)] shrink-0" />
              <span>
                <strong>Aprendizado Contínuo:</strong> Ao salvar, o sistema aprende o padrão de cada estabelecimento e aplica automaticamente nos próximos meses.
              </span>
            </span>
            <span className="text-[11px] font-mono bg-[var(--capital-soft,#f6f0df)] px-2 py-0.5 rounded text-[var(--capital-accent,#927025)]">
              Auto-Memory ON
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3 rounded-2xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]">
              <div className="w-12 h-12 rounded-2xl bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[var(--capital-text,#242a2e)]">Nenhum lançamento legível identificado</h4>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] max-w-md mx-auto leading-relaxed">
                Não foi possível extrair despesas com data e valor deste arquivo. Isso pode ocorrer com PDFs escaneados como imagem de baixa qualidade ou formatos não reconhecidos. Tente importar a fatura em PDF oficial do banco, extrato CSV ou um print nítido.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[var(--capital-card,#fff)] hover:bg-[var(--capital-card,#fff)] text-xs font-bold text-[var(--capital-text,#242a2e)] transition-all cursor-pointer"
                >
                  Fechar e Tentar Outro Arquivo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
            {items.map((item, idx) => {
              const isPositive = item.amount > 0
              const scopeTaxonomy = getCategoriesByScope(item.entityType || 'PF')
              const availableCategories = Object.keys(scopeTaxonomy).length > 0 ? Object.keys(scopeTaxonomy) : Object.keys(USER_TAXONOMY_MAP)
              const subcats = getSubcategoriesForCategory(item.category)

              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isCardBillPayment 
                      ? 'border-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)]'
                      : item.source === 'USER_RULE' 
                        ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)]'
                        : 'border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Dados da Transação */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-[var(--capital-muted,#242a2e)]">{item.date}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-[var(--capital-muted,#242a2e)]" />
                          {item.accountOrCard}
                        </span>
                        {item.source === 'USER_RULE' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)] flex items-center gap-1">
                            <BookmarkCheck className="w-3 h-3" />
                            Regra Memorizada
                          </span>
                        )}
                        {item.isCardBillPayment && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Pagamento de Fatura (Auto-Deduplicado)
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-sm text-[var(--capital-text,#242a2e)] truncate" title={item.description}>
                        {item.description}
                      </div>

                      <div className={`text-base font-semibold font-mono tabular-nums mt-0.5 ${isPositive ? 'text-[var(--capital-success,#157449)]' : 'text-[var(--capital-danger,#ad3333)]'}`}>
                        {isPositive ? '+' : '-'} R$ {Math.abs(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Seletores de Categoria & Subcategoria */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <div className="w-full sm:w-44">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                          Categoria
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleCategoryChange(idx, e.target.value)}
                          className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                        >
                          {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-48">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] block mb-1">
                          Subcategoria
                        </label>
                        <select
                          value={item.subcategory}
                          onChange={(e) => handleSubcategoryChange(idx, e.target.value)}
                          className="w-full rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs font-semibold text-[var(--capital-text,#242a2e)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
                        >
                          {subcats.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Toggle para Memorização de Regra Contínua */}
                  <div className="mt-3 pt-3 border-t border-[var(--capital-line,#e4dfd3)] flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={item.alwaysApplyRule}
                        onChange={() => handleToggleAlwaysApply(idx)}
                        className="rounded border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-success,#157449)] focus:ring-[var(--capital-accent,#927025)] w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-[var(--capital-text,#242a2e)]">
                        Sempre categorizar lançamentos contendo
                      </span>
                    </label>

                    {item.alwaysApplyRule && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[var(--capital-muted,#242a2e)]">&ldquo;</span>
                        <input 
                          type="text"
                          value={item.ruleKeyword}
                          onChange={(e) => handleKeywordChange(idx, e.target.value)}
                          className="rounded-lg bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-accent,#927025)] px-2.5 py-1 text-xs font-bold text-[var(--capital-success,#157449)] w-36 focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)] text-center"
                          placeholder="Termo-chave"
                          title="Palavra-chave a ser memorizada pela IA para os próximos meses"
                        />
                        <span className="text-xs text-[var(--capital-muted,#242a2e)]">&rdquo; nesta categoria</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] hover:text-[var(--capital-text,#242a2e)] hover:bg-[var(--capital-card,#fff)] text-xs font-bold transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmAndSave}
            disabled={isSaving || items.length === 0}
            className="px-6 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shadow-none active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar e Salvar Regras</span>
          </button>
        </div>
      </div>
    </div>
  )
}
