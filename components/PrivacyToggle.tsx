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
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
          : 'border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10'
      } ${className}`}
      title={isPrivate ? 'Modo Privacidade ATIVO (Valores Ocultos) - Clique para exibir' : 'Modo Privacidade INATIVO (Valores Visíveis) - Clique para ocultar'}
      aria-label="Alternar modo privacidade de valores"
    >
      {isPrivate ? (
        <EyeOff className="h-4 w-4 shrink-0 text-amber-500 transition-transform group-hover:scale-110" />
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
