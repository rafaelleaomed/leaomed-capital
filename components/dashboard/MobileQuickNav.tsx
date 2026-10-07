'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  LayoutDashboard, 
  PieChart, 
  Receipt, 
  UploadCloud, 
  TrendingUp,
  Search
} from 'lucide-react'

interface MobileQuickNavProps {
  activeTab?: string
  onSelectTab?: (tab: string) => void
}

export function MobileQuickNav({ activeTab: propActiveTab, onSelectTab }: MobileQuickNavProps) {
  const [activeNav, setActiveNav] = useState(propActiveTab || 'visao-geral')

  useEffect(() => {
    if (propActiveTab) setActiveNav(propActiveTab)
  }, [propActiveTab])

  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail?.tab) setActiveNav(e.detail.tab)
    }
    window.addEventListener('leaomed_tab_changed', handleTabChange)
    return () => window.removeEventListener('leaomed_tab_changed', handleTabChange)
  }, [])

  const navItems = [
    {
      id: 'visao-geral',
      label: 'Visão Geral',
      icon: BarChart3
    },
    {
      id: 'orcamento',
      label: 'Orçamento & Cartões',
      icon: LayoutDashboard
    },
    {
      id: 'investimentos',
      label: 'Investimentos',
      icon: PieChart
    },
    {
      id: 'parcelamentos',
      label: 'Parcelamentos',
      icon: Receipt
    },
    {
      id: 'ingestao',
      label: 'Central de Ingestão',
      icon: UploadCloud
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: TrendingUp
    }
  ]

  const handleSelect = (id: string) => {
    setActiveNav(id)
    if (onSelectTab) {
      onSelectTab(id)
    } else {
      window.dispatchEvent(new CustomEvent('leaomed_switch_tab', { detail: { tab: id } }))
    }
  }

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('leaomed_open_quick_finder'))
  }

  return (
    <div className="sticky top-14 sm:top-16 z-30 -mx-4 px-3 py-2 bg-white/95 dark:bg-[#070B12]/95 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 md:hidden transition-colors shadow-2xs">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Botão de Busca Rápida Mobile */}
        <button
          onClick={handleOpenSearch}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 shrink-0 cursor-pointer active:scale-95"
          title="Buscar no App"
        >
          <Search className="w-3.5 h-3.5 text-emerald-500" />
          <span>Buscar</span>
        </button>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-black'
                  : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-950' : 'text-emerald-500'}`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

