'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronRight, Menu, Moon, Plus, Search, Settings, ShieldCheck, Smartphone, Sun, X } from 'lucide-react'
import { useTheme } from '../ThemeProvider'
import { dashboardNavigation, navigateDashboard, NavigationTab, resolveNavigationTab } from './navigation'

export function AppleMobileTabBar() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('visao-geral')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { theme, toggleTheme } = useTheme()

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

  useEffect(() => {
    const dialog = dialogRef.current
    if (isMenuOpen && dialog && !dialog.open) dialog.showModal()
    if (!isMenuOpen && dialog?.open) dialog.close()
    const previousOverflow = document.body.style.overflow
    if (isMenuOpen) document.body.style.overflow = 'hidden'
    const desktop = window.matchMedia('(min-width: 768px)')
    const handleResize = () => { if (desktop.matches) setIsMenuOpen(false) }
    desktop.addEventListener('change', handleResize)
    return () => {
      desktop.removeEventListener('change', handleResize)
      if (isMenuOpen) document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const closeMenu = () => {
    dialogRef.current?.close()
    setIsMenuOpen(false)
  }
  const navigate = (tab: NavigationTab, elementId?: string) => {
    closeMenu()
    navigateDashboard(tab, elementId)
  }
  const action = (name: string) => {
    closeMenu()
    window.dispatchEvent(new CustomEvent(name))
  }
  const mainTabs = dashboardNavigation.filter(item => ['visao-geral', 'auditoria', 'orcamento', 'investimentos'].includes(item.id))
  const moreActive = !mainTabs.some(item => item.id === activeTab)

  return (
    <>
      <nav aria-label="Navegação móvel" className="capital-mobile-nav md:hidden">
        {mainTabs.map(({ id, mobileLabel, icon: Icon }) => (
          <button key={id} type="button" className={`capital-mobile-item ${activeTab === id ? 'active' : ''}`} aria-current={activeTab === id ? 'page' : undefined} onClick={() => navigate(id)}>
            <Icon size={20} aria-hidden="true" /><span>{mobileLabel}</span>
          </button>
        ))}
        <button ref={menuButtonRef} type="button" className={`capital-mobile-item ${isMenuOpen || moreActive ? 'active' : ''}`} aria-haspopup="dialog" aria-expanded={isMenuOpen} aria-controls="capital-more-menu" onClick={() => setIsMenuOpen(true)}>
          <Menu size={20} aria-hidden="true" /><span>Mais</span>
        </button>
      </nav>
      <dialog ref={dialogRef} id="capital-more-menu" className="capital-more-dialog" aria-labelledby="capital-more-title" onCancel={() => setIsMenuOpen(false)} onClose={() => setIsMenuOpen(false)} onClick={event => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu()
        }
      }}>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--capital-line)] pb-4 mb-3">
          <div><h2 id="capital-more-title" className="text-lg font-semibold">Seu controle financeiro</h2><p className="text-xs text-[var(--capital-muted)] mt-1">Módulos, atalhos e preferências</p></div>
          <button type="button" autoFocus aria-label="Fechar menu" onClick={closeMenu} className="capital-icon-button"><X size={20} /></button>
        </div>
        <nav aria-label="Todos os módulos" className="flex flex-col gap-1">
          {dashboardNavigation.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={`capital-nav-item ${activeTab === id ? 'active' : ''}`} aria-current={activeTab === id ? 'page' : undefined} onClick={() => navigate(id)}>
              <span className="capital-nav-icon"><Icon size={18} aria-hidden="true" /></span><span className="flex-1">{label}</span><ChevronRight size={16} aria-hidden="true" />
            </button>
          ))}
        </nav>
        <div className="mt-4 pt-3 border-t border-[var(--capital-line)] flex flex-col gap-1">
          <button type="button" className="capital-nav-item" onClick={() => action('leaomed_open_quick_tx')}><span className="capital-nav-icon"><Plus size={18} /></span>Novo lançamento</button>
          <button type="button" className="capital-nav-item" onClick={() => navigate('investimentos', 'reserva-emergencia')}><span className="capital-nav-icon"><ShieldCheck size={18} /></span>Reserva de emergência</button>
          <button type="button" className="capital-nav-item" onClick={() => navigate('visao-geral', 'consolidado-anual')}><span className="capital-nav-icon"><CalendarDays size={18} /></span>Consolidado anual</button>
          <button type="button" className="capital-nav-item" onClick={() => action('leaomed_open_quick_finder')}><span className="capital-nav-icon"><Search size={18} /></span>Buscar no app</button>
          <button type="button" className="capital-nav-item" onClick={() => action('leaomed_open_account_settings')}><span className="capital-nav-icon"><Settings size={18} /></span>Minha conta & contas</button>
          <button type="button" className="capital-nav-item" onClick={() => action('leaomed_trigger_pwa_install')}><span className="capital-nav-icon"><Smartphone size={18} /></span>Instalar app</button>
          <button type="button" className="capital-nav-item" onClick={toggleTheme}><span className="capital-nav-icon">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</span>Ativar tema {theme === 'dark' ? 'claro' : 'escuro'}</button>
        </div>
      </dialog>
    </>
  )
}
