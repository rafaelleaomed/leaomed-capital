'use client'

import React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { usePrivacy } from '@/context/PrivacyContext'

export function PrivacyToggle({ className = '', showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { isPrivate, togglePrivacy } = usePrivacy()

  return (
    <button
      onClick={togglePrivacy}
      className={`group relative inline-flex items-center gap-2 rounded-xl border p-2 text-xs font-bold transition-all active:scale-95 cursor-pointer select-none ${
        isPrivate 
          ? 'border-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] hover:bg-[var(--capital-warning-soft,#fcf1dc)]'
          : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-white hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)]'
      } ${className}`}
      title={isPrivate ? 'Modo Privacidade ATIVO (Valores Ocultos) - Clique para exibir' : 'Modo Privacidade INATIVO (Valores Visíveis) - Clique para ocultar'}
      aria-label="Alternar modo privacidade de valores"
    >
      {isPrivate ? (
        <EyeOff className="h-4 w-4 shrink-0 text-[var(--capital-warning,#8b5b15)] transition-transform group-hover:scale-110" />
      ) : (
        <Eye className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
      )}
      {showLabel && (
        <span className="text-[11px]">
          {isPrivate ? 'Valores Ocultos' : 'Ocultar Valores'}
        </span>
      )}
    </button>
  )
}
