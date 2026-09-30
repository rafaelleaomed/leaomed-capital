'use client'

import React from 'react'
import { 
  UploadCloud, 
  FileText, 
  Camera, 
  PieChart, 
  TrendingUp, 
  CalendarClock, 
  Receipt, 
  ArrowUpRight, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Lock, 
  Eye, 
  EyeOff,
  CreditCard,
  Building2,
  Wallet,
  Coins,
  ChevronRight
} from 'lucide-react'
import { usePrivacy } from '@/context/PrivacyContext'
import { DashboardFilter } from '@/utils/dashboardData'

interface ExecutiveHubCardsProps {
  currentFilter: DashboardFilter
  displayBalance: number
  displayIncome: number
  displayExpenses: number
  creditCardTotal: number
  availableToInvest: number
  onOpenIngestion: () => void
  onOpenQuickTx: () => void
  isDemo?: boolean
}

export function ExecutiveHubCards({
  currentFilter,
  displayBalance,
  displayIncome,
  displayExpenses,
  creditCardTotal,
  availableToInvest,
  onOpenIngestion,
  onOpenQuickTx,
  isDemo = false
}: ExecutiveHubCardsProps) {
  const { isPrivate, togglePrivacy, maskValue } = usePrivacy()

  const scrollToSection = (sectionId: string) => {
    let el = document.getElementById(sectionId)
    if (!el && sectionId === 'divisao-orcamentaria') {
      el = document.getElementById('categorias-planilha') || document.getElementById('planilha-orcamentaria')
    } else if (!el && sectionId === 'central-ingestao') {
      el = document.getElementById('upload-documentos')
    } else if (!el && sectionId === 'resumo-executivo') {
      el = document.getElementById('visao-geral-graficos')
    }

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-4">
      {/* ── BANNER HERO DE DESTAQUE NOBRE: CENTRAL DE INGESTÃO MULTICANAL ── */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-5 md:p-7 shadow-xl shadow-emerald-950/20 text-white">
        {/* Glow & Texture Effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-emerald-600/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Lado Esquerdo: Marca, Título e Proposta */}
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Ingestão Inteligente TypeSafe AI
              </span>
              <span className="text-xs text-slate-400 font-medium">
                • Reconhecimento instantâneo de faturas & extratos
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Puxe seus dados via <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">PDF, CSV ou Fotos</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Arraste suas faturas de cartões de crédito ou tire foto de extratos bancários de plantões PJ. O motor inteligente aplica sua taxonomia personalizada e memoriza regras para nunca mais precisar classificar manualmente.
            </p>
          </div>

          {/* Lado Direito: Ações Rápidas de Ingestão */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => scrollToSection('central-ingestao')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs md:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-5 h-5 text-slate-950 shrink-0" />
              <span>Importar Faturas & Extratos</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={onOpenQuickTx}
              className="w-full sm:w-auto px-4 py-3.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Lançamento Rápido</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── GRADE DE CARDS EXECUTIVOS: NAVEGAÇÃO E VISÃO GERAL ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        
        {/* Card 1: Acessar Meu Painel & Saldo Consolidado */}
        <div 
          onClick={() => scrollToSection('resumo-executivo')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Wallet className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                Painel Geral <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Líquido ({currentFilter === 'CONSOLIDATED' ? 'Consolidado' : currentFilter})
            </h3>
            <div className="text-xl md:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
              {maskValue(displayBalance)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Receitas: <strong className="text-emerald-600 dark:text-emerald-400">{maskValue(displayIncome)}</strong></span>
            <span>Gastos: <strong className="text-rose-500">{maskValue(displayExpenses)}</strong></span>
          </div>
        </div>

        {/* Card 2: Planilha Orçamentária & Gastos Obrigatórios */}
        <div 
          onClick={() => scrollToSection('divisao-orcamentaria')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <PieChart className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-indigo-500 transition-colors">
                Ver Orçamento <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Planilha Orçamentária
            </h3>
            <div className="text-sm md:text-base font-bold text-slate-900 dark:text-white mt-1">
              Fixos vs Variáveis
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Metas de economia e despesas essenciais alinhadas à sua planilha real.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
            <span>Auditoria por Categoria</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Carteira de Investimentos & Rebalanceamento */}
        <div 
          onClick={() => scrollToSection('balanceamento-investimentos')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-amber-500/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                Investimentos <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Carteira & Alocação
            </h3>
            <div className="text-xl md:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
              {maskValue(178476.35)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Aporte Ideal: <strong className="text-amber-500 font-mono">{maskValue(availableToInvest)}</strong></span>
            <span className="font-bold text-emerald-500">+6.76% a.a.</span>
          </div>
        </div>

        {/* Card 4: Previsibilidade Inteligente de Fim dos Parcelamentos */}
        <div 
          onClick={() => scrollToSection('parcelamentos-dividas')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 md:p-5 shadow-sm hover:shadow-md hover:border-cyan-500/40 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <CalendarClock className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-cyan-500 transition-colors">
                Previsão <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fim dos Parcelamentos
            </h3>
            <div className="text-sm md:text-base font-bold text-slate-900 dark:text-white mt-1">
              Alívio de Caixa Futuro
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              T-Cross, Gramados Parks, S26Ultra e quitação progressiva de dívidas.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 flex items-center justify-between">
            <span>Cronograma de Quitação</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>
    </div>
  )
}
