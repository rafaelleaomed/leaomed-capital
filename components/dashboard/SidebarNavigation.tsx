'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  Building2, 
  UserCheck, 
  Layers,
  UploadCloud,
  Search
} from 'lucide-react'

interface SidebarNavigationProps {
  isDemo?: boolean
}

export function SidebarNavigation({ isDemo = false }: SidebarNavigationProps) {
  const [activeTab, setActiveTab] = useState('visao-geral')

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        if (hash === 'visao-geral-graficos' || hash === 'visao-geral') setActiveTab('visao-geral')
        else if (hash === 'categorias-planilha' || hash === 'cartoes-credito' || hash === 'orcamento') setActiveTab('orcamento')
        else if (hash === 'balanceamento-investimentos' || hash === 'reserva-emergencia' || hash === 'investimentos') setActiveTab('investimentos')
        else if (hash === 'parcelamentos-dividas' || hash === 'consolidado-anual' || hash === 'parcelamentos') setActiveTab('parcelamentos')
        else if (hash === 'central-ingestao' || hash === 'upload-documentos' || hash === 'ingestao') setActiveTab('ingestao')
        else if (hash === 'historico-mensal' || hash === 'historico') setActiveTab('historico')
      }
    }

    const handleTabChange = (e: any) => {
      if (e.detail?.tab) setActiveTab(e.detail.tab)
    }

    window.addEventListener('hashchange', handleHash)
    window.addEventListener('leaomed_tab_changed', handleTabChange)
    handleHash()

    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('leaomed_tab_changed', handleTabChange)
    }
  }, [])

  const navItems = [
    { id: 'visao-geral', label: 'Visão Geral (Cockpit)', icon: BarChart3, hash: '#visao-geral' },
    { id: 'orcamento', label: 'Orçamento & Cartões', icon: LayoutDashboard, hash: '#orcamento' },
    { id: 'investimentos', label: 'Investimentos & Carteira', icon: PieChart, hash: '#investimentos' },
    { id: 'parcelamentos', label: 'Parcelamentos & Dívidas', icon: Receipt, hash: '#parcelamentos' },
    { id: 'ingestao', label: 'Central de Ingestão', icon: UploadCloud, hash: '#ingestao' },
    { id: 'historico', label: 'Histórico Mensal', icon: TrendingUp, hash: '#historico' },
  ]

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('leaomed_open_account_settings'))
  }

  const handleOpenSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('leaomed_open_quick_finder'))
  }

  const handleNavClick = (tabId: string, hash: string) => {
    setActiveTab(tabId)
    window.location.hash = hash
    window.dispatchEvent(new CustomEvent('leaomed_switch_tab', { detail: { tab: tabId } }))
  }

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0 z-30 transition-all">
      <nav className="flex flex-col gap-1.5">
        {/* Botão de Busca Rápida no Topo da Sidebar */}
        <button
          onClick={handleOpenSearch}
          className="flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-emerald-500 transition-all cursor-pointer mb-2 group shadow-2xs"
          title="Buscar no App (Ctrl+K)"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            <span>Buscar no app...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/10 text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10">
            Ctrl+K
          </kbd>
        </button>

        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Módulos Principais
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id, item.hash)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer text-left w-full ${
                isActive
                  ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}

        {/* Botão de Acesso Rápido a Configurações da Conta */}
        <button
          onClick={handleOpenSettings}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer mt-1 text-left"
          title="Gerenciar perfil, trocar senha, adicionar ou remover contas"
        >
          <Settings className="h-4 w-4 text-slate-400 hover:text-emerald-500 shrink-0" />
          <span>Minha Conta & Contas</span>
        </button>

        <div className="mt-5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Separação de Entidades
        </div>

        <div className="flex flex-col gap-1.5 px-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2 font-medium">
              <Building2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              Pessoa Jurídica
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">Ativa</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2 font-medium">
              <UserCheck className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
              PF (Itaú, Nu, C6)
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">Ativa</span>
          </div>
        </div>
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="mt-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-3 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-1">
          <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          Modo Blindado Ativo
        </div>
        Menu fixo para navegação rápida entre abas e conciliação contínua.
      </div>
    </aside>
  )
}
