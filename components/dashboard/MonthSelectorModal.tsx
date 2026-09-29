'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react'

interface MonthSelectorModalProps {
  isOpen: boolean
  selectedMonth: number // 0 = Jan, 5 = Jun, 8 = Set, etc.
  selectedYear: number  // ex: 2026
  onSelect: (month: number, year: number) => void
  onClose: () => void
}

const MONTH_NAMES = [
  'JAN', 'FEV', 'MAR', 'ABR',
  'MAI', 'JUN', 'JUL', 'AGO',
  'SET', 'OUT', 'NOV', 'DEZ'
]

const FULL_MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export function MonthSelectorModal({
  isOpen,
  selectedMonth,
  selectedYear,
  onSelect,
  onClose
}: MonthSelectorModalProps) {
  const [viewYear, setViewYear] = useState(selectedYear)

  if (!isOpen) return null

  // Mês e ano correntes reais do sistema
  const now = new Date()
  const currentSystemMonth = now.getMonth() // ex: 8 = Setembro
  const currentSystemYear = now.getFullYear() // ex: 2026

  const handlePrevYear = () => setViewYear(prev => prev - 1)
  const handleNextYear = () => setViewYear(prev => prev + 1)

  const handleSelectMonth = (monthIndex: number) => {
    onSelect(monthIndex, viewYear)
    onClose()
  }

  const handleJumpToCurrentMonth = () => {
    onSelect(currentSystemMonth, currentSystemYear)
    setViewYear(currentSystemYear)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="month-selector-title"
      >
        {/* Header estilo Mobills com seletor de ano */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-900 p-4 text-white flex items-center justify-between shadow-md">
          <button
            onClick={handlePrevYear}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Ano anterior"
            aria-label="Ano anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span id="month-selector-title" className="font-display font-black text-lg tracking-wider">
              {viewYear}
            </span>
          </div>

          <button
            onClick={handleNextYear}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Próximo ano"
            aria-label="Próximo ano"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Grade 4x3 dos 12 Meses (Idêntica ao Mobills) */}
        <div className="p-5">
          <div className="grid grid-cols-4 gap-2.5">
            {MONTH_NAMES.map((name, index) => {
              const isSelected = selectedMonth === index && selectedYear === viewYear
              const isSystemCurrent = currentSystemMonth === index && currentSystemYear === viewYear

              return (
                <button
                  key={name}
                  onClick={() => handleSelectMonth(index)}
                  className={`py-3 rounded-xl font-bold text-xs tracking-wider transition-all select-none relative ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30 scale-105'
                      : isSystemCurrent
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <span>{name}</span>
                  {isSystemCurrent && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Rodapé com Ações (CANCELAR e MÊS ATUAL) */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs font-bold">
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider"
          >
            Cancelar
          </button>

          <button
            onClick={handleJumpToCurrentMonth}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors uppercase tracking-wider font-black flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Mês Atual</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export { FULL_MONTH_NAMES }
