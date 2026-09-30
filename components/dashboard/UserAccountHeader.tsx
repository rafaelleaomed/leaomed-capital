'use client'

import React, { useState, useEffect } from 'react'
import { User, Settings, ChevronDown } from 'lucide-react'
import { AccountSettingsModal } from './AccountSettingsModal'
import { LogoutButton } from '@/components/LogoutButton'

interface UserAccountHeaderProps {
  initialName?: string
  initialEmail?: string
  isDemo?: boolean
}

export function UserAccountHeader({
  initialName = 'Dr. Usuário',
  initialEmail = 'usuario@leaomed.com',
  isDemo = false
}: UserAccountHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userName, setUserName] = useState(initialName)

  useEffect(() => {
    if (typeof window !== 'undefined' && initialEmail) {
      const prevEmail = localStorage.getItem('leaomed_current_user_email')
      if (prevEmail && prevEmail !== initialEmail) {
        // Novo usuário logado: isolar sessão
        window.dispatchEvent(new CustomEvent('leaomed_transactions_updated'))
      }
      localStorage.setItem('leaomed_current_user_email', initialEmail)
    }

    // Carregar nome customizado salvo no perfil
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`leaomed_user_profile_${initialEmail}`) || localStorage.getItem('leaomed_user_profile')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.fullName) setUserName(parsed.fullName)
        } catch (e) {
          console.error(e)
        }
      }
    }

    const handleProfileUpdate = (e: any) => {
      if (e.detail?.fullName) {
        setUserName(e.detail.fullName)
      }
    }

    const handleOpenSettings = () => {
      setIsOpen(true)
    }

    window.addEventListener('leaomed_profile_updated', handleProfileUpdate)
    window.addEventListener('leaomed_open_account_settings', handleOpenSettings)

    return () => {
      window.removeEventListener('leaomed_profile_updated', handleProfileUpdate)
      window.removeEventListener('leaomed_open_account_settings', handleOpenSettings)
    }
  }, [])

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'RL'

  return (
    <>
      <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-slate-200 dark:border-white/10">
        {/* Botão Interativo do Perfil */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all cursor-pointer group text-left"
          title="Clique para gerenciar sua conta: alterar nome, atualizar senha, gerenciar contas bancárias"
        >
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {userName}
              </span>
              <Settings className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              {isDemo ? 'Demonstração Médica' : 'Perfil Executivo'}
            </span>
          </div>

          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform border border-emerald-400/40">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 hidden sm:block transition-transform group-hover:translate-y-0.5" />
        </button>

        {/* Botão de Logout */}
        <LogoutButton className="ml-1 hidden md:flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-xs" />
      </div>

      {/* Modal de Gestão da Conta */}
      <AccountSettingsModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        isDemo={isDemo} 
      />
    </>
  )
}
