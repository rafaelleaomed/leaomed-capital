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
  Layers
} from 'lucide-react'

interface SidebarNavigationProps {
  isDemo?: boolean
}

export function SidebarNavigation({ isDemo = false }: SidebarNavigationProps) {
  const [activeSection, setActiveSection] = useState('visao-geral-graficos')

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash) setActiveSection(hash)
    }

    window.addEventListener('hashchange', handleHash)
    if (window.location.hash) {
      setActiveSection(window.location.hash.replace('#', ''))
    }

    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const navItems = [
    { id: 'visao-geral-graficos', label: 'Gráficos & Dashboard', icon: BarChart3, hash: '#visao-geral-graficos' },
    { id: 'consolidado-anual', label: 'Consolidado Anual', icon: Layers, hash: '#consolidado-anual' },
    { id: 'categorias-planilha', label: 'Categorias & Planilha', icon: LayoutDashboard, hash: '#categorias-planilha' },
    { id: 'cartoes-credito', label: 'Cartões de Crédito', icon: CreditCard, hash: '#cartoes-credito' },
    { id: 'parcelamentos-dividas', label: 'Parcelamentos & Dívidas', icon: Receipt, hash: '#parcelamentos-dividas' },
    { id: 'reserva-emergencia', label: 'Reserva de Emergência', icon: ShieldCheck, hash: '#reserva-emergencia' },
    { id: 'balanceamento-investimentos', label: 'Investimentos & Carteira', icon: PieChart, hash: '#balanceamento-investimentos' },
    { id: 'historico-mensal', label: 'Histórico Mensal', icon: TrendingUp, hash: '#historico-mensal' },
  ]

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('leaomed_open_account_settings'))
  }

  const handleNavClick = (id: string, hash: string) => {
    setActiveSection(id)
    if (id === 'consolidado-anual') {
      window.dispatchEvent(new CustomEvent('leaomed_open_annual_consolidated'))
    } else if (id === 'historico-mensal') {
      window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
      setTimeout(() => {
        const el = document.getElementById('historico-mensal')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (id === 'cartoes-credito') {
      window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
      setTimeout(() => {
        const el = document.getElementById('cartoes-credito')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    } else if (id === 'reserva-emergencia') {
      window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
      window.dispatchEvent(new CustomEvent('leaomed_open_emergency_reserve'))
      setTimeout(() => {
        const el = document.getElementById('reserva-emergencia') || document.getElementById('balanceamento-investimentos')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (id === 'parcelamentos-dividas') {
      window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
      setTimeout(() => {
        const el = document.getElementById('parcelamentos-dividas')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (id === 'balanceamento-investimentos') {
      window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
      setTimeout(() => {
        const el = document.getElementById('balanceamento-investimentos')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (id === 'categorias-planilha') {
      window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
      setTimeout(() => {
        const el = document.getElementById('categorias-planilha')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } else if (id === 'visao-geral-graficos') {
      window.dispatchEvent(new CustomEvent('leaomed_close_annual_consolidated'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0 z-30 transition-all">
      <nav className="flex flex-col gap-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Módulos Principais
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <a
              key={item.id}
              href={item.hash}
              onClick={() => handleNavClick(item.id, item.hash)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </a>
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
