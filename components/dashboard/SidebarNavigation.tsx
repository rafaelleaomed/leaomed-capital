'use client'

import React, { useEffect, useState } from 'react'
import { CalendarDays, CircleHelp, Search, Settings, ShieldCheck } from 'lucide-react'
import { dashboardNavigation, navigateDashboard, NavigationTab, resolveNavigationTab } from './navigation'

interface SidebarNavigationProps {
  isDemo?: boolean
  userName?: string
  userEmail?: string
}

export function SidebarNavigation({ isDemo = false, userName = '', userEmail = '' }: SidebarNavigationProps) {
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

  const mainNav = dashboardNavigation.slice(0, 5)
  const toolsNav = dashboardNavigation.slice(5)

  const initials = userName
    ? userName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <aside className={`capital-sidebar hidden md:flex ${isDemo ? 'capital-sidebar-demo' : ''}`}>
      {/* Search */}
      <button
        type="button"
        className="capital-nav-search"
        onClick={() => window.dispatchEvent(new CustomEvent('leaomed_open_quick_finder'))}
        aria-label="Buscar no app, Control K"
      >
        <Search size={15} aria-hidden="true" />
        <span>Buscar no app</span>
        <kbd>Ctrl K</kbd>
      </button>

      {/* Thin divider below search */}
      <div className="capital-nav-divider" aria-hidden="true" />

      {/* Group: Painel */}
      <span className="capital-nav-group">Painel financeiro</span>
      <nav aria-label="Navegação principal" className="flex flex-col">
        {mainNav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`capital-nav-item ${activeTab === id ? 'active' : ''}`}
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => navigateDashboard(id)}
          >
            <span className="capital-nav-icon"><Icon size={17} aria-hidden="true" /></span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Group: Ferramentas */}
      <span className="capital-nav-group">Ferramentas</span>
      <nav aria-label="Ferramentas de dados">
        {toolsNav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`capital-nav-item ${activeTab === id ? 'active' : ''}`}
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => navigateDashboard(id)}
          >
            <span className="capital-nav-icon"><Icon size={17} aria-hidden="true" /></span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Footer — bottom items + user info */}
      <div className="capital-sidebar-footer">
        <button
          type="button"
          className="capital-nav-item"
          onClick={() => navigateDashboard('investimentos', 'reserva-emergencia')}
        >
          <span className="capital-nav-icon"><ShieldCheck size={17} aria-hidden="true" /></span>
          <span>Reserva de emergência</span>
        </button>
        <button
          type="button"
          className="capital-nav-item"
          onClick={() => navigateDashboard('visao-geral', 'consolidado-anual')}
        >
          <span className="capital-nav-icon"><CalendarDays size={17} aria-hidden="true" /></span>
          <span>Consolidado anual</span>
        </button>
        <button
          type="button"
          className="capital-nav-item"
          onClick={() => window.dispatchEvent(new CustomEvent('leaomed_open_account_settings'))}
        >
          <span className="capital-nav-icon"><Settings size={17} aria-hidden="true" /></span>
          <span>Minha conta &amp; contas</span>
        </button>

        {/* User info row */}
        <div className="capital-sidebar-user">
          <span className="capital-sidebar-user-avatar" aria-hidden="true">{initials}</span>
          <div className="capital-sidebar-user-info">
            <span className="capital-sidebar-user-name">{userName || 'Usuário'}</span>
            {userEmail && <span className="capital-sidebar-user-email">{userEmail}</span>}
          </div>
        </div>
      </div>
    </aside>
  )
}
