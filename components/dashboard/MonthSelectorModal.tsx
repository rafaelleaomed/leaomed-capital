'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessibleDialog } from './AccessibleDialog'

interface MonthSelectorModalProps {
  isOpen: boolean
  selectedMonth: number
  selectedYear: number
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

const monthFromKey = (month: number, key: string) => {
  if (key === 'ArrowRight') return (month + 1) % 12
  if (key === 'ArrowLeft') return (month + 11) % 12
  if (key === 'ArrowDown') return (month + 4) % 12
  if (key === 'ArrowUp') return (month + 8) % 12
  if (key === 'Home') return Math.floor(month / 4) * 4
  if (key === 'End') return Math.floor(month / 4) * 4 + 3
  return month
}

export function MonthSelectorModal({
  isOpen,
  selectedMonth,
  selectedYear,
  onSelect,
  onClose
}: MonthSelectorModalProps) {
  const [viewYear, setViewYear] = useState(selectedYear)
  const [focusedMonth, setFocusedMonth] = useState(selectedMonth)
  const monthRefs = useRef<Array<HTMLButtonElement | null>>([])
  const pendingFocus = useRef(selectedMonth)

  useEffect(() => {
    if (!isOpen) return
    setViewYear(selectedYear)
    setFocusedMonth(selectedMonth)
    pendingFocus.current = selectedMonth
  }, [isOpen, selectedMonth, selectedYear])

  useEffect(() => {
    if (!isOpen) return
    const frame = requestAnimationFrame(() => {
      monthRefs.current[pendingFocus.current]?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [isOpen, viewYear])

  if (!isOpen) return null

  const now = new Date()
  const currentSystemMonth = now.getMonth()
  const currentSystemYear = now.getFullYear()

  const focusMonth = (monthIndex: number) => {
    pendingFocus.current = monthIndex
    setFocusedMonth(monthIndex)
    monthRefs.current[monthIndex]?.focus()
  }

  const changeViewYear = (nextYear: number, monthToFocus = focusedMonth) => {
    pendingFocus.current = monthToFocus
    setFocusedMonth(monthToFocus)
    setViewYear(nextYear)
  }

  const handleSelectMonth = (monthIndex: number) => {
    onSelect(monthIndex, viewYear)
    onClose()
  }

  const handleJumpToCurrentMonth = () => {
    onSelect(currentSystemMonth, currentSystemYear)
    onClose()
  }

  const handleMonthKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, monthIndex: number) => {
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      changeViewYear(viewYear + (event.key === 'PageUp' ? -1 : 1), monthIndex)
      return
    }

    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    focusMonth(monthFromKey(monthIndex, event.key))
  }

  return (
    <AccessibleDialog onClose={onClose} labelledBy="month-selector-title" className="month-selector-dialog">
      <div className="month-selector-layout" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
        <section className="month-selector-surface" aria-describedby="month-selector-help">
          <header className="month-selector-header">
            <button
              type="button"
              onClick={() => changeViewYear(viewYear - 1)}
              className="month-selector-year-button"
              title="Ano anterior"
              aria-label="Ano anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 id="month-selector-title">Selecionar mês</h2>
              <strong aria-live="polite">{viewYear}</strong>
            </div>

            <button
              type="button"
              onClick={() => changeViewYear(viewYear + 1)}
              className="month-selector-year-button"
              title="Próximo ano"
              aria-label="Próximo ano"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </header>

          <div className="month-selector-body">
            <p id="month-selector-help" className="sr-only">Use as setas para percorrer os meses, Home e End para ir ao início ou fim da linha, e Page Up ou Page Down para trocar o ano.</p>
            <div className="month-selector-grid" role="group" aria-label={`Meses de ${viewYear}`}>
              {MONTH_NAMES.map((name, index) => {
                const isSelected = selectedMonth === index && selectedYear === viewYear
                const isSystemCurrent = currentSystemMonth === index && currentSystemYear === viewYear

                return (
                  <button
                    type="button"
                    key={name}
                    ref={element => { monthRefs.current[index] = element }}
                    tabIndex={focusedMonth === index ? 0 : -1}
                    onFocus={() => setFocusedMonth(index)}
                    onKeyDown={event => handleMonthKeyDown(event, index)}
                    onClick={() => handleSelectMonth(index)}
                    aria-label={`${FULL_MONTH_NAMES[index]} de ${viewYear}${isSelected ? ', selecionado' : ''}${isSystemCurrent ? ', mês atual' : ''}`}
                    aria-pressed={isSelected}
                    className={`month-selector-month ${isSelected ? 'is-selected' : ''} ${isSystemCurrent ? 'is-current' : ''}`}
                  >
                    <span>{name}</span>
                    {isSystemCurrent && !isSelected && <i aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </div>

          <footer className="month-selector-footer">
            <button type="button" onClick={onClose} className="month-selector-cancel">Cancelar</button>
            <button type="button" onClick={handleJumpToCurrentMonth} className="month-selector-current">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Mês atual</span>
            </button>
          </footer>
        </section>
      </div>
    </AccessibleDialog>
  )
}

export { FULL_MONTH_NAMES }
