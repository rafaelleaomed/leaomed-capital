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

export function InstallmentsProjection() {
  const [filter, setFilter] = useState<'ALL' | 'MAJOR' | 'ENDING_SOON'>('ALL')

  // Base auditada com os contratos reais (Localiza nº 3796937, Safra CCB 0102300010493464 e Buona Vitta GVI126924)
  const installments: InstallmentItem[] = [
    { 
      id: '1', 
      name: 'Entrada T-Cross Cartão (Localiza)', 
      category: 'Transporte', 
      monthlyValue: 6837.14, 
      currentInstallment: 2, 
      totalInstallments: 12, 
      endMonthYear: 'Abril/2027', 
      contractNotes: 'Contrato Localiza nº 3796937: 12x no cartão de crédito (Entrada R$ 73.884 + taxas/encargos) • Término Abr/2027',
      paymentMethod: 'C6 Carbon Black'
    },
    { 
      id: '2', 
      name: 'Financiamento T-Cross (Banco Safra)', 
      category: 'Transporte', 
      monthlyValue: 3336.28, 
      currentInstallment: 2, 
      totalInstallments: 18, 
      endMonthYear: '27/Outubro/2027', 
      contractNotes: 'CCB Safra nº 010230001 493464: 18 parcelas de R$ 3.336,28 (Vcto 27/05/26 a 27/10/27) • T-Cross 100% quitado!',
      paymentMethod: 'Boleto Banco Safra'
    },
    { 
      id: '3', 
      name: 'Gramado Parks (Contrato GVI126924)', 
      category: 'Imóvel / Resort', 
      monthlyValue: 1865.33, 
      currentInstallment: 5, 
      totalInstallments: 70, 
      endMonthYear: 'Fevereiro/2032', 
      contractNotes: '70 parcelas mensais (10/05/2026 a 10/02/2032) • Reajuste IPCA acumulado (Cláusula 1.4.1/3.2)',
      hasIpcaAdjustment: true,
      paymentMethod: 'Boleto Gramado Parks'
    },
    { 
      id: '4', 
      name: 'Condomínio Buona Vitta Spa Resort', 
      category: 'Imóvel / Resort', 
      monthlyValue: 377.49, 
      currentInstallment: 5, 
      totalInstallments: 999, 
      endMonthYear: 'Perpétuo (Nunca vence)', 
      contractNotes: 'Encargo mensal contínuo de manutenção da fração imobiliária do resort',
      isPerpetual: true,
      paymentMethod: 'Boleto Condomínio'
    },
    { 
      id: '5', 
      name: 'Samsung S26 Ultra', 
      category: 'Eletrônicos', 
      monthlyValue: 274.66, 
      currentInstallment: 4, 
      totalInstallments: 21, 
      endMonthYear: 'Novembro/2027', 
      contractNotes: 'Finaliza em Nov/27',
      paymentMethod: 'C6 Carbon Black'
    },
    { 
      id: '6', 
      name: 'Aliança Solitário Vivara', 
      category: 'Compras', 
      monthlyValue: 382.37, 
      currentInstallment: 7, 
      totalInstallments: 10, 
      endMonthYear: 'Outubro/2026', 
      contractNotes: 'Finaliza em breve (Out/26)',
      paymentMethod: 'C6 Carbon Black'
    },
    { 
      id: '7', 
      name: 'Lava e Seca Midea', 
      category: 'Casa', 
      monthlyValue: 355.00, 
      currentInstallment: 7, 
      totalInstallments: 10, 
      endMonthYear: 'Outubro/2026', 
      contractNotes: 'Finaliza em breve (Out/26)',
      paymentMethod: 'Itaú Personnalité'
    },
    { 
      id: '8', 
      name: 'TV TCL 55"', 
      category: 'Casa', 
      monthlyValue: 250.92, 
      currentInstallment: 7, 
      totalInstallments: 10, 
      endMonthYear: 'Outubro/2026', 
      contractNotes: 'Finaliza em breve (Out/26)',
      paymentMethod: 'Nubank Ultravioleta'
    },
    { 
      id: '9', 
      name: 'Sofá Retrátil Sala', 
      category: 'Casa', 
      monthlyValue: 197.00, 
      currentInstallment: 4, 
      totalInstallments: 10, 
      endMonthYear: 'Dezembro/2026', 
      contractNotes: 'Finaliza em Dez/26',
      paymentMethod: 'C6 Carbon Black'
    },
  ]

  const totalMonthlyCommitment = installments.reduce((acc, curr) => acc + curr.monthlyValue, 0)
  
  // Marcos de Alívio
  const reliefOct26 = 382.37 + 355.00 + 250.92 // R$ 988,29
  const reliefApr27 = reliefOct26 + 197.00 + 6837.14 // R$ 8.022,43
  const reliefOct27 = reliefApr27 + 3336.28 // R$ 11.358,71 (Quitação total T-Cross)

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
