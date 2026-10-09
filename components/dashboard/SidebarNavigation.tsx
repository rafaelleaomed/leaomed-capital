'use client'

import React, { useEffect, useState } from 'react'
import { CalendarDays, CircleHelp, Search, Settings, ShieldCheck } from 'lucide-react'
import { dashboardNavigation, navigateDashboard, NavigationTab, resolveNavigationTab } from './navigation'

interface SidebarNavigationProps { isDemo?: boolean }

export function SidebarNavigation({ isDemo = false }: SidebarNavigationProps) {
  const [activeTab, setActiveTab] = useState<NavigationTab>('visao-geral')
  useEffect(() => {
    const handleHash = () => setActiveTab(resolveNavigationTab(window.location.hash))
    const handleTabChange = (event: Event) => {
      const tab = (event as CustomEvent<{ tab?: string }>).detail?.tab
      if (tab) setActiveTab(resolveNavigationTab(tab))
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    window.addEventListener('leaomed_tab_changed', handleTabChange)
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('leaomed_tab_changed', handleTabChange)
    }
  }, [])
  return (
    <aside className={`capital-sidebar hidden md:flex ${isDemo ? 'capital-sidebar-demo' : ''}`}>
      <button type="button" className="capital-nav-search" onClick={() => window.dispatchEvent(new CustomEvent('leaomed_open_quick_finder'))} aria-label="Buscar no app, Control K">
        <Search size={16} aria-hidden="true" /><span>Buscar no app</span><kbd>Ctrl K</kbd>
      </button>
      <span className="capital-nav-label">SEU CONTROLE FINANCEIRO</span>
      <nav aria-label="Navegação principal" className="flex flex-col gap-1.5">
        {dashboardNavigation.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" className={`capital-nav-item ${activeTab === id ? 'active' : ''}`} aria-current={activeTab === id ? 'page' : undefined} onClick={() => navigateDashboard(id)}>
            <span className="capital-nav-icon"><Icon size={18} aria-hidden="true" /></span><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="capital-sidebar-bottom">
        <button type="button" className="capital-nav-item" onClick={() => navigateDashboard('investimentos', 'reserva-emergencia')}>
          <span className="capital-nav-icon"><ShieldCheck size={18} aria-hidden="true" /></span><span>Reserva de emergência</span>
        </button>
        <button type="button" className="capital-nav-item" onClick={() => navigateDashboard('visao-geral', 'consolidado-anual')}>
          <span className="capital-nav-icon"><CalendarDays size={18} aria-hidden="true" /></span><span>Consolidado anual</span>
        </button>
        <button type="button" className="capital-nav-item" onClick={() => window.dispatchEvent(new CustomEvent('leaomed_open_account_settings'))}>
          <span className="capital-nav-icon"><Settings size={18} aria-hidden="true" /></span><span>Minha conta & contas</span>
        </button>
        <div className="capital-sidebar-note"><CircleHelp size={17} aria-hidden="true" /><p>Atualização mensal<br /><span>Você importa. Você confere.</span></p></div>
      </div>
    </aside>
  )
}
