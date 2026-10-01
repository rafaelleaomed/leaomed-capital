'use client'

import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Layers, 
  ShieldCheck, 
  Plus, 
  Menu, 
  X, 
  CreditCard, 
  Receipt, 
  PieChart, 
  TrendingUp, 
  Settings, 
  ChevronRight,
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Download,
  Smartphone
} from 'lucide-react'
import { useTheme } from '../ThemeProvider'

export function AppleMobileTabBar() {
  const [activeTab, setActiveTab] = useState('inicio')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'visao-geral-graficos' || !hash) setActiveTab('inicio')
      else if (hash === 'categorias-planilha') setActiveTab('planilha')
      else if (hash === 'reserva-emergencia') setActiveTab('reserva')
      else if (hash === 'cartoes-credito') setActiveTab('cartoes')
    }

    window.addEventListener('hashchange', handleHash)
    handleHash()
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const navigateTo = (sectionId: string, customAction?: () => void) => {
    setIsMenuOpen(false)
    if (customAction) {
      customAction()
      return
    }

    window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))

    if (sectionId === 'visao-geral-graficos') {
      setActiveTab('inicio')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (sectionId === 'categorias-planilha') {
      setActiveTab('planilha')
      setTimeout(() => {
        const el = document.getElementById('categorias-planilha')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (sectionId === 'reserva-emergencia') {
      setActiveTab('reserva')
      window.dispatchEvent(new CustomEvent('leaomed_open_emergency_reserve'))
      setTimeout(() => {
        const el = document.getElementById('reserva-emergencia') || document.getElementById('balanceamento-investimentos')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (sectionId === 'cartoes-credito') {
      setActiveTab('cartoes')
      setTimeout(() => {
        const el = document.getElementById('cartoes-credito')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    } else if (sectionId === 'parcelamentos-dividas') {
      setTimeout(() => {
        const el = document.getElementById('parcelamentos-dividas')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (sectionId === 'balanceamento-investimentos') {
      setTimeout(() => {
        const el = document.getElementById('balanceamento-investimentos')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (sectionId === 'historico-mensal') {
      setTimeout(() => {
        const el = document.getElementById('historico-mensal')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }

  const handleOpenQuickTx = () => {
    window.dispatchEvent(new CustomEvent('leaomed_open_quick_tx'))
  }

  const handleOpenAnnual = () => {
    setIsMenuOpen(false)
    window.dispatchEvent(new CustomEvent('leaomed_open_annual_consolidated'))
  }

  const handleOpenSettings = () => {
    setIsMenuOpen(false)
    window.dispatchEvent(new CustomEvent('leaomed_open_account_settings'))
  }

  return (
    <>
      {/* ── 1. Apple-Style Bottom Tab Bar (iOS Native Feel) ──────────────── */}
      <nav 
        aria-label="Navegação móvel"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/85 dark:bg-[#070B12]/85 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 transition-all"
      >
        <div className="grid grid-cols-5 items-center justify-around px-2 max-w-lg mx-auto">
          {/* Tab 1: Início */}
          <button
            onClick={() => navigateTo('visao-geral-graficos')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'inicio' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className={`h-5 w-5 transition-transform ${activeTab === 'inicio' ? 'scale-110' : ''}`} />
              {activeTab === 'inicio' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Início</span>
          </button>

          {/* Tab 2: Planilha */}
          <button
            onClick={() => navigateTo('categorias-planilha')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'planilha' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Layers className={`h-5 w-5 transition-transform ${activeTab === 'planilha' ? 'scale-110' : ''}`} />
              {activeTab === 'planilha' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Planilha</span>
          </button>

          {/* Tab 3: Botão Central + Novo Lançamento (Apple Tactile FAB) */}
          <div className="flex flex-col items-center justify-center -mt-4">
            <button
              onClick={handleOpenQuickTx}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/35 border-2 border-white dark:border-[#070B12] active:scale-90 transition-transform cursor-pointer"
              title="Novo Lançamento Rápido"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
            <span className="text-[10px] mt-1 font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              Novo
            </span>
          </div>

          {/* Tab 4: Reserva de Emergência (Destaque Solicitado pelo Usuário!) */}
          <button
            onClick={() => navigateTo('reserva-emergencia')}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              activeTab === 'reserva' 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <ShieldCheck className={`h-5 w-5 transition-transform ${activeTab === 'reserva' ? 'scale-110 text-emerald-500' : ''}`} />
              {activeTab === 'reserva' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight font-medium">Reserva</span>
          </button>

          {/* Tab 5: Menu / Módulos Completo (Action Sheet) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer active:scale-95 ${
              isMenuOpen 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Menu className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Módulos</span>
          </button>
        </div>
      </nav>

      {/* ── 2. iOS Action Sheet / Bottom Sheet Modal ───────────────────────── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop com Blur suave */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in"
          />

          {/* Sheet Container com estilo Apple HIG */}
          <div className="relative bg-white dark:bg-[#0E1522] rounded-t-[28px] border-t border-slate-200/80 dark:border-white/10 shadow-2xl p-5 pt-3 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-250">
            {/* Handle Bar / Puxador Apple */}
            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

            {/* Cabeçalho do Sheet */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Módulos & Funcionalidades</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    LeãoMed
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Navegação rápida otimizada para iPhone & Celular
                </p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista agrupada estilo iOS Settings */}
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                {/* 1. Reserva de Emergência (DESTAQUE) */}
                <button
                  onClick={() => navigateTo('reserva-emergencia')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer active:bg-emerald-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Reserva de Emergência</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                          6x a 12x Custo Fixo
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Blindagem familiar e da clínica médica
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 2. Cartões de Crédito */}
                <button
                  onClick={() => navigateTo('cartoes-credito')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer active:bg-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Cartões de Crédito & Faturas
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Limites, fechamento, adicionais e auditoria
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 3. Parcelamentos & Alívio de Caixa */}
                <button
                  onClick={() => navigateTo('parcelamentos-dividas')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer active:bg-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Previsibilidade de Parcelamentos
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Contratos Safra, Localiza, Gramado e quitações
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 4. Investimentos & Carteira */}
                <button
                  onClick={() => navigateTo('balanceamento-investimentos')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer active:bg-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Investimentos & Rebalanceamento
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        13 ativos conciliados e metas de alocação
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 5. Consolidado Anual */}
                <button
                  onClick={handleOpenAnnual}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer active:bg-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Consolidado Anual
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Visão macro multianual de 2024 a 2026
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 6. Histórico Mensal */}
                <button
                  onClick={() => navigateTo('historico-mensal')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer active:bg-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-500/15 border border-slate-500/20 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Histórico Mensal
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Série temporal completa com impostos e pró-labore
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Bloco de Configurações e Preferências */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                {/* Minha Conta & Contas */}
                <button
                  onClick={handleOpenSettings}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer active:bg-slate-200/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Minha Conta & Contas Conectadas
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Gerenciar perfil, senha e instituições bancárias
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Instalar App no Celular PWA */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    window.dispatchEvent(new CustomEvent('leaomed_trigger_pwa_install'))
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 transition-all text-left cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/40 p-0.5 bg-slate-950 flex items-center justify-center shrink-0">
                      <img src="/icon-192x192.png" alt="LeãoMed" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <span>Instalar App na Tela Inicial</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                          Novo
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ícone oficial do Leão • Tela cheia sem navegador
                      </div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>

                {/* Alternador de Tema Claro/Escuro */}
                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Aparência
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Atualmente em modo {theme === 'dark' ? 'escuro' : 'claro'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs active:scale-95"
                  >
                    Alternar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
