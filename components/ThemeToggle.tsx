'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] dark:hover:bg-[var(--capital-card,#fff)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] active:scale-[0.98]"
      title={`Mudar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-3.5 w-3.5 text-[var(--capital-warning,#8b5b15)]" />
          <span className="hidden sm:inline">Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-[var(--capital-accent,#927025)]" />
          <span className="hidden sm:inline">Modo Escuro</span>
        </>
      )}
    </button>
  )
}
