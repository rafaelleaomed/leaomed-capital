'use client'

import React, { useState } from 'react'
import { 
  Layers, 
  Receipt, 
  PieChart, 
  TrendingUp, 
  UploadCloud, 
  LayoutDashboard,
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  CreditCard
} from 'lucide-react'

export function MobileQuickNav() {
  const [activeNav, setActiveNav] = useState('visao-geral-graficos')

  const navItems = [
    {
      id: 'visao-geral-graficos',
      label: 'Gráficos & Mobills',
      icon: PieIcon,
      badge: 'Visual',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'categorias-planilha',
      label: 'Categorias & Planilha',
      icon: Layers,
      badge: 'Principal',
      badgeColor: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30'
    },
    {
      id: 'reserva-emergencia',
      label: 'Reserva de Emergência',
      icon: ShieldCheck,
      badge: 'Segurança',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'cartoes-credito',
      label: 'Cartões de Crédito',
      icon: CreditCard,
      badge: 'Faturas',
      badgeColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
    },
    {
      id: 'balanceamento-investimentos',
      label: 'Investimentos',
      icon: PieChart,
      badge: 'Rebalancear',
      badgeColor: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
    },
    {
      id: 'parcelamentos-dividas',
      label: 'Parcelamentos',
      icon: Receipt,
      badge: 'Contratos',
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
    },
    {
      id: 'historico-mensal',
      label: 'Série Histórica',
      icon: TrendingUp,
      badge: '13 Meses',
      badgeColor: 'bg-slate-200 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10'
    }
  ]

  const scrollTo = (id: string) => {
    setActiveNav(id)
    if (id === 'reserva-emergencia') {
      window.dispatchEvent(new CustomEvent('leaomed_open_emergency_reserve'))
      setTimeout(() => {
        const el = document.getElementById('reserva-emergencia') || document.getElementById('balanceamento-investimentos')
        if (el) {
          const yOffset = -90
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 50)
      return
    }

    const el = document.getElementById(id)
    if (el) {
      const yOffset = -90 // Compensa o header sticky
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="sticky top-16 z-30 -mx-4 px-4 py-2.5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 md:hidden transition-colors">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeNav === item.id

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-950' : 'text-emerald-500'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full border font-bold ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                      : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
