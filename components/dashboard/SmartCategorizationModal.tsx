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

export interface IncomingTransaction {
  id?: string
  date: string
  description: string
  amount: number
  accountOrCard: string
  entityType?: 'PF' | 'PJ'
  category?: string
  subcategory?: string
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
  description: string
  amount: number
  accountOrCard: string
  entityType: 'PF' | 'PJ'
  category: string
  subcategory: string
  source: 'USER_RULE' | 'SMART_HEURISTIC' | 'DEFAULT'
  isCardBillPayment: boolean
  alwaysApplyRule: boolean
  ruleKeyword: string
}

// Categorias e Subcategorias padrão da plataforma médica
const CATEGORY_OPTIONS: Record<string, string[]> = {
  'Alimentação': ['Restaurantes & Fast Food', 'Supermercado Familiar', 'Delivery & Lanches', 'Padaria & Confeitaria', 'Cafeteria & Lanches'],
  'Transporte': ['Combustível', 'Transporte por Aplicativo', 'Manutenção Veicular', 'Estacionamento & Pedágios', 'Seguro Auto'],
  'Moradia': ['Condomínio Residencial', 'Supermercado Familiar', 'Energia Elétrica', 'Água e Esgoto', 'Internet & Telefonia', 'Manutenção da Casa'],
  'Saúde': ['Medicamentos & Farmácia', 'Plano de Saúde', 'Consultas & Exames', 'Odontologia'],
  'Despesas Pessoais': ['Educação Médica & Livros', 'Congressos & Atualização', 'Vestuário & Uso Pessoal', 'Anuidade CRM/CFM', 'Educação / Escola'],
  'Financiamento': ['Parcelas CDC Veicular', 'Fração Imobiliária Resort', 'Amortização de Dívidas'],
  'Lazer': ['Streaming & Assinaturas', 'Viagens & Hospedagem', 'Passeios & Cultura', 'Esportes & Academia'],
  'Empresa Médica PJ': ['DARF Simples Nacional', 'Previdência INSS', 'ISSQN Municipal', 'Assessoria Contábil', 'Despesas Operacionais Clínica'],
  'Pagamento de Fatura': ['Deduplicado / Débito de Cartão']
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
      const pred = CategoryRulesEngine.predict(t.description, t.entityType || 'PF')
      
      // Extrai a primeira palavra ou termo representativo para sugestão de regra
      const words = t.description.trim().split(/\s+/)
      const defaultKeyword = words[0]?.length > 2 ? words[0] : (words[1] || t.description)

      return {
        id: t.id || `inc_${Date.now()}_${idx}`,
        date: t.date || new Date().toISOString().split('T')[0],
        description: t.description,
        amount: t.amount,
        accountOrCard: t.accountOrCard || 'Cartão de Crédito',
        entityType: t.entityType || 'PF',
        category: t.category || pred.category,
        subcategory: t.subcategory || pred.subcategory,
        source: pred.source,
        isCardBillPayment: pred.isCardBillPayment,
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
    const subcats = CATEGORY_OPTIONS[newCat] || ['Diversos']
    updated[index].subcategory = subcats[0]
    setItems(updated)
  }

  const handleSubcategoryChange = (index: number, newSub: string) => {
    const updated = [...items]
    updated[index].subcategory = newSub
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

  const handleConfirmAndSave = () => {
    setIsSaving(true)
    let rulesCreatedCount = 0

    // 1. Salvar regras que o usuário marcou "Sempre categorizar lançamentos contendo..."
    items.forEach(item => {
      if (item.alwaysApplyRule && item.ruleKeyword.trim().length >= 2) {
        CategoryRulesEngine.saveRule({
          pattern: item.ruleKeyword.trim(),
          category: item.category,
          subcategory: item.subcategory,
          entityType: item.entityType,
          alwaysApply: true
        })
        rulesCreatedCount++
      }
    })

    // 2. Salvar transações na base granular
    GranularTransactionStore.addBatch(items.map(i => ({
      date: i.date,
      description: i.description,
      amount: i.amount,
      accountOrCard: i.accountOrCard,
      category: i.category,
      subcategory: i.subcategory,
      entityType: i.entityType,
      isFixed: i.isCardBillPayment,
      source: 'INVOICE'
    })))

    setIsSaving(false)
    setSuccessBanner(`🎉 ${items.length} lançamentos categorizados e ${rulesCreatedCount} novas regras memorizadas! Nos próximos meses, despesas semelhantes serão categorizadas automaticamente sem esforço.`)

    setTimeout(() => {
      onCompleted?.(items.length)
      onClose()
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="smart-cat-title"
      >
        {/* Header Superior */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <div>
              <h2 id="smart-cat-title" className="font-display font-bold text-base md:text-lg text-white flex items-center gap-2">
                Categorização Inteligente & Memória de Regras
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {items.length} itens detectados
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                O sistema sugere a categoria ideal. Marque a opção para memorizar e nunca mais precisar categorizar manualmente nos próximos meses.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Fechar"
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {successBanner && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Corpo com a Lista de Itens para Revisão */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Aprendizado Contínuo:</strong> Ao salvar, o sistema aprende o padrão de cada estabelecimento e aplica automaticamente nos próximos meses.
              </span>
            </span>
            <span className="text-[11px] font-mono bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">
              Auto-Memory ON
            </span>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const isPositive = item.amount > 0
              const subcats = CATEGORY_OPTIONS[item.category] || ['Diversos']

              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    item.isCardBillPayment 
                      ? 'border-amber-500/30 bg-amber-500/5' 
                      : item.source === 'USER_RULE' 
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : 'border-white/10 bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Dados da Transação */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">{item.date}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {item.accountOrCard}
                        </span>
                        {item.source === 'USER_RULE' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <BookmarkCheck className="w-3 h-3" />
                            Regra Memorizada
                          </span>
                        )}
                        {item.isCardBillPayment && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Pagamento de Fatura (Auto-Deduplicado)
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-sm text-white truncate" title={item.description}>
                        {item.description}
                      </div>

                      <div className={`text-base font-black font-mono tabular-nums mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : '-'} R$ {Math.abs(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Seletores de Categoria & Subcategoria */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <div className="w-full sm:w-44">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Categoria
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleCategoryChange(idx, e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                        >
                          {Object.keys(CATEGORY_OPTIONS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div className="w-full sm:w-48">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                          Subcategoria
                        </label>
                        <select
                          value={item.subcategory}
                          onChange={(e) => handleSubcategoryChange(idx, e.target.value)}
                          className="w-full rounded-xl bg-slate-950 border border-white/10 px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                        >
                          {subcats.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Toggle para Memorização de Regra Contínua */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={item.alwaysApplyRule}
                        onChange={() => handleToggleAlwaysApply(idx)}
                        className="rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        Sempre categorizar lançamentos contendo
                      </span>
                    </label>

                    {item.alwaysApplyRule && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">&ldquo;</span>
                        <input 
                          type="text"
                          value={item.ruleKeyword}
                          onChange={(e) => handleKeywordChange(idx, e.target.value)}
                          className="rounded-lg bg-slate-950 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-400 w-36 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-center"
                          placeholder="Termo-chave"
                          title="Palavra-chave a ser memorizada pela IA para os próximos meses"
                        />
                        <span className="text-xs text-slate-400">&rdquo; nesta categoria</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/80">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs font-bold transition-all"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmAndSave}
            disabled={isSaving || items.length === 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar e Salvar Regras</span>
          </button>
        </div>
      </div>
    </div>
  )
}
