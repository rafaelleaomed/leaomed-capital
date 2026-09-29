'use client'

import React, { useState } from 'react'
import { 
  CalendarClock, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'

export interface InstallmentItem {
  id: string
  name: string
  category: string
  monthlyValue: number
  currentInstallment: number
  totalInstallments: number
  endMonthYear: string
  contractNotes?: string
  isPerpetual?: boolean
  hasIpcaAdjustment?: boolean
  paymentMethod?: string
}

export function InstallmentsProjection({ isDemo = false }: { isDemo?: boolean }) {
  const [filter, setFilter] = useState<'ALL' | 'MAJOR' | 'ENDING_SOON'>('ALL')

  // Portfólio demonstrativo sanitizado sem dados sensíveis de contratos reais
  const demoInstallments: InstallmentItem[] = [
    { 
      id: '1', 
      name: 'Entrada Veículo Parcelada (12x)', 
      category: 'Transporte', 
      monthlyValue: 6837.14, 
      currentInstallment: 2, 
      totalInstallments: 12, 
      endMonthYear: 'Abril/2027', 
      contractNotes: '12x no cartão corporativo • Quitação prevista para Abril/2027',
      paymentMethod: 'Cartão Black'
    },
    { 
      id: '2', 
      name: 'Financiamento Veicular CDC (18x)', 
      category: 'Transporte', 
      monthlyValue: 3336.28, 
      currentInstallment: 2, 
      totalInstallments: 18, 
      endMonthYear: 'Outubro/2027', 
      contractNotes: '18 parcelas fixas • Veículo 100% quitado ao término',
      paymentMethod: 'Débito em Conta'
    },
    { 
      id: '3', 
      name: 'Cota Imobiliária / Resort (70x)', 
      category: 'Imóvel / Resort', 
      monthlyValue: 1865.33, 
      currentInstallment: 5, 
      totalInstallments: 70, 
      endMonthYear: 'Fevereiro/2032', 
      contractNotes: '70 parcelas mensais • Reajuste IPCA acumulado',
      hasIpcaAdjustment: true,
      paymentMethod: 'Boleto Bancário'
    },
    { 
      id: '4', 
      name: 'Condomínio Fração Imobiliária', 
      category: 'Imóvel / Resort', 
      monthlyValue: 377.49, 
      currentInstallment: 5, 
      totalInstallments: 999, 
      endMonthYear: 'Perpétuo (Contínuo)', 
      contractNotes: 'Taxa mensal de manutenção e conservação da fração imobiliária',
      isPerpetual: true,
      paymentMethod: 'Boleto Bancário'
    },
    { 
      id: '5', 
      name: 'Equipamentos de TI / Smartphones', 
      category: 'Tecnologia', 
      monthlyValue: 274.66, 
      currentInstallment: 4, 
      totalInstallments: 21, 
      endMonthYear: 'Novembro/2027', 
      contractNotes: 'Parceria de fornecimento tecnológico corporativo',
      paymentMethod: 'Cartão Corporativo'
    },
    { 
      id: '6', 
      name: 'Compras Corporativas Diversas', 
      category: 'Compras', 
      monthlyValue: 382.37, 
      currentInstallment: 7, 
      totalInstallments: 10, 
      endMonthYear: 'Outubro/2026', 
      contractNotes: 'Término iminente em Outubro/2026',
      paymentMethod: 'Cartão Black'
    },
    { 
      id: '7', 
      name: 'Eletrodomésticos & Climatização', 
      category: 'Estrutura', 
      monthlyValue: 355.00, 
      currentInstallment: 7, 
      totalInstallments: 10, 
      endMonthYear: 'Outubro/2026', 
      contractNotes: 'Término iminente em Outubro/2026',
      paymentMethod: 'Cartão Corporativo'
    },
    { 
      id: '8', 
      name: 'Painéis e Telas de Monitoramento', 
      category: 'Estrutura', 
      monthlyValue: 250.92, 
      currentInstallment: 7, 
      totalInstallments: 10, 
      endMonthYear: 'Outubro/2026', 
      contractNotes: 'Término iminente em Outubro/2026',
      paymentMethod: 'Cartão Corporativo'
    },
    { 
      id: '9', 
      name: 'Mobiliário Ergonômico de Escritório', 
      category: 'Estrutura', 
      monthlyValue: 197.00, 
      currentInstallment: 4, 
      totalInstallments: 10, 
      endMonthYear: 'Dezembro/2026', 
      contractNotes: 'Finalização programada em Dezembro/2026',
      paymentMethod: 'Cartão Corporativo'
    },
  ]

  const [installments, setInstallments] = useState<InstallmentItem[]>(demoInstallments)

  // Suporte a carregamento de parcelamentos customizados do Onboarding Wizard
  const loadCustomInstallments = React.useCallback(() => {
    try {
      const stored = localStorage.getItem('leaomed_user_custom_setup')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.installments && Array.isArray(parsed.installments) && parsed.installments.length > 0) {
          const mapped: InstallmentItem[] = parsed.installments.map((inst: any, idx: number) => ({
            id: `custom-${idx}`,
            name: inst.name,
            category: inst.category || 'Financiamento',
            monthlyValue: Number(inst.monthlyValue) || 0,
            currentInstallment: Number(inst.currentInstallment) || 1,
            totalInstallments: Number(inst.totalInstallments) || 12,
            endMonthYear: inst.endMonthYear || 'Em aberto',
            contractNotes: `Personalizado no Setup • ${inst.totalInstallments}x de R$ ${Number(inst.monthlyValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            paymentMethod: 'Débito / Cartão'
          }))
          setInstallments(mapped)
          return true
        }
      }
    } catch (_) {}
    return false
  }, [])

  // Sincronização com API e escuta de eventos do Wizard
  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      const config = e.detail
      if (config?.installments?.length) {
        const mapped: InstallmentItem[] = config.installments.map((inst: any, idx: number) => ({
          id: `custom-${idx}`,
          name: inst.name,
          category: inst.category || 'Financiamento',
          monthlyValue: Number(inst.monthlyValue) || 0,
          currentInstallment: Number(inst.currentInstallment) || 1,
          totalInstallments: Number(inst.totalInstallments) || 12,
          endMonthYear: inst.endMonthYear || 'Em aberto',
          contractNotes: `Personalizado no Setup • ${inst.totalInstallments}x de R$ ${Number(inst.monthlyValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          paymentMethod: 'Débito / Cartão'
        }))
        setInstallments(mapped)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('leaomed_setup_updated', handleUpdate)
    }

    if (isDemo) {
      loadCustomInstallments()
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('leaomed_setup_updated', handleUpdate)
        }
      }
    }

    let isMounted = true
    fetch('/api/installments')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (data.success && Array.isArray(data.installments) && data.installments.length > 0) {
          const mapped: InstallmentItem[] = data.installments.map((row: any) => ({
            id: String(row.id),
            name: row.description,
            category: row.category,
            monthlyValue: parseFloat(row.installment_amount) || 0,
            currentInstallment: row.current_installment,
            totalInstallments: row.total_installments,
            endMonthYear: row.end_date ? new Date(row.end_date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Em aberto',
            contractNotes: `Método: ${row.payment_method || 'Boleto/Cartão'} • Subcategoria: ${row.subcategory || 'Geral'}`,
            paymentMethod: row.payment_method
          }))
          setInstallments(mapped)
        } else {
          loadCustomInstallments()
        }
      })
      .catch(() => {
        if (isMounted) loadCustomInstallments()
      })

    return () => { 
      isMounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('leaomed_setup_updated', handleUpdate)
      }
    }
  }, [isDemo, loadCustomInstallments])

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
      {/* Header com Totais e Botão de Filtro */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <CalendarClock className="h-4 w-4" />
            </span>
            <h2 className="font-display text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Previsibilidade de Parcelamentos & Alívio de Caixa
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contratos auditados: Localiza Frotas (12x), Banco Safra (18x), Gramado Parks (70x) e faturas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-1 text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'ALL' 
                  ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({installments.length})
            </button>
            <button
              onClick={() => setFilter('MAJOR')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'MAJOR' 
                  ? 'bg-indigo-600 text-white font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grandes &gt; R$ 1k
            </button>
            <button
              onClick={() => setFilter('ENDING_SOON')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
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
              Quitação de Vivara, Lava e Seca e TV TCL
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
              Fim das 12x da Entrada T-Cross Cartão (Localiza)
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
              Fim das 18 parcelas do Banco Safra (CCB 493464)
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards de Parcelamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredInstallments.map((item) => {
          const progress = item.isPerpetual ? 100 : (item.currentInstallment / item.totalInstallments) * 100
          
          return (
            <div 
              key={item.id} 
              className="border border-slate-200 dark:border-white/5 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-950/50 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.category} • {item.paymentMethod}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono block">
                      R$ {item.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-slate-400">ao mês</span>
                  </div>
                </div>

                {item.contractNotes && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/5 p-2 rounded-lg border border-slate-200/60 dark:border-white/5 mb-3 leading-relaxed">
                    {item.contractNotes}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>
                    {item.isPerpetual 
                      ? 'Mensalidade Contínua' 
                      : `Parcela ${item.currentInstallment} de ${item.totalInstallments}`}
                  </span>
                  <span className={`font-semibold ${item.isPerpetual ? 'text-amber-500 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.endMonthYear}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.isPerpetual 
                        ? 'bg-amber-500 w-full' 
                        : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
