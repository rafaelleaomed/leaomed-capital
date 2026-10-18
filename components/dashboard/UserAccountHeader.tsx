'use client'

import { financialStorage } from '@/utils/userScopedStorage'

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
    setUserName(initialName)

    if (typeof window !== 'undefined' && initialEmail) {
      const prevEmail = financialStorage.getItem('leaomed_current_user_email')
      if (prevEmail && prevEmail !== initialEmail) {
        window.dispatchEvent(new CustomEvent('leaomed_transactions_updated'))
      }
      financialStorage.setItem('leaomed_current_user_email', initialEmail)
    }

    if (typeof window !== 'undefined') {
      const saved = financialStorage.getItem('leaomed_user_profile')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.fullName) setUserName(parsed.fullName)
        } catch (e) {
          console.error(e)
        }
      } else if (!isDemo) {
        fetch('/api/user/profile')
          .then(res => res.json())
          .then(data => {
            if (data?.success && data?.profile?.name) {
              setUserName(data.profile.name)
            }
          })
          .catch(() => {})
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
      <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
        {/* Botão Interativo do Perfil */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] border border-transparent hover:border-[var(--capital-line,#e4dfd3)] dark:hover:border-[var(--capital-line,#e4dfd3)] transition-all cursor-pointer group text-left"
          title="Clique para gerenciar sua conta: alterar nome, atualizar senha, gerenciar contas bancárias"
        >
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] group-hover:text-[var(--capital-success,#157449)] dark:group-hover:text-[var(--capital-success,#157449)] transition-colors">
                {userName}
              </span>
              <Settings className="w-3 h-3 text-[var(--capital-muted,#242a2e)] group-hover:text-[var(--capital-success,#157449)] transition-colors opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-[10px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block font-medium">
              {isDemo ? 'Demonstração Médica' : 'Perfil Executivo'}
            </span>
          </div>

          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-[var(--capital-soft,#f6f0df)] from-emerald-500 to-teal-700 text-[var(--capital-text,#242a2e)] font-semibold text-xs flex items-center justify-center shadow-md shadow-none group-hover:scale-105 transition-transform border border-[var(--capital-accent,#927025)]">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--capital-button,#c7a354)] border-2 border-white dark:border-[var(--capital-line,#e4dfd3)]" />
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-[var(--capital-muted,#242a2e)] group-hover:text-[var(--capital-muted,#242a2e)] dark:group-hover:text-[var(--capital-text,#f6f3e9)] hidden sm:block transition-transform group-hover:translate-y-0.5" />
        </button>

        {/* Botão de Logout */}
        <LogoutButton className="ml-1 hidden md:flex items-center gap-1.5 text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] transition-colors text-xs" />
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
