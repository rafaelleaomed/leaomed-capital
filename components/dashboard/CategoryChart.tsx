'use client'

import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { usePrivacy } from '@/context/PrivacyContext'

interface CategoryData { name: string; total: number; percentage: number }
interface CategoryChartProps { categories: CategoryData[]; onCategoryClick?: (categoryName: string) => void }
const PALETTE = ['#C7A354', '#157449', '#698F89', '#A67C52', '#8E879A', '#BE8882', '#737B81']

export function CategoryChart({ categories, onCategoryClick }: CategoryChartProps) {
  const { maskValue } = usePrivacy()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const topCategories = (categories || []).slice(0, 7)
  const totalAmount = topCategories.reduce((total, category) => total + category.total, 0)
  const circumference = 2 * Math.PI * 66
  let offset = 0
  const slices = topCategories.map((category, index) => {
    const share = totalAmount > 0 ? category.total / totalAmount : 0
    const slice = { ...category, length: share * circumference, offset, color: PALETTE[index % PALETTE.length] }
    offset += slice.length
    return slice
  })
  const activeItem = (hoveredIndex !== null ? slices[hoveredIndex] : null) || (selectedIndex !== null ? slices[selectedIndex] : null)
  const handleSelect = (index: number, name: string) => {
    setSelectedIndex(selectedIndex === index ? null : index)
    if (onCategoryClick) onCategoryClick(name)
    else window.dispatchEvent(new CustomEvent('leaomed_switch_tab', { detail: { tab: 'auditoria', category: name } }))
  }

  return (
    <section className="capital-panel min-w-0 flex flex-col">
      <div className="panel-heading">
        <div><span className="eyebrow">SEU MÊS EM DETALHES</span><h2>Para onde foi o dinheiro?</h2></div>
        <span className="count-badge">{topCategories.length} categorias</span>
      </div>
      <p className="small-note">Selecione uma fatia ou categoria para conferir os lançamentos.</p>
      {topCategories.length === 0 ? <div className="flex h-48 items-center justify-center text-sm text-[var(--capital-muted)]">Nenhuma despesa processada para este período.</div> : (
        <div className="flex flex-col items-center gap-5 py-5">
          <div className="relative w-52 h-52 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full" aria-label="Distribuição dos gastos por categoria">
              <circle cx="100" cy="100" r="66" fill="none" stroke="var(--capital-line)" strokeWidth="26" />
              {slices.map((slice, index) => <circle
                key={`${slice.name}-${index}`} cx="100" cy="100" r="66" fill="none" stroke={slice.color} strokeWidth="26"
                strokeDasharray={`${slice.length} ${circumference - slice.length}`} strokeDashoffset={-slice.offset} transform="rotate(-90 100 100)"
                tabIndex={0} role="button" aria-label={`Conferir ${slice.name}: ${maskValue(slice.total)}, ${slice.percentage.toFixed(1)}%`} aria-pressed={selectedIndex === index}
                className="cursor-pointer transition-opacity motion-reduce:transition-none focus:outline focus:outline-2 focus:outline-[var(--capital-accent)]"
                style={{ opacity: (hoveredIndex !== null && hoveredIndex !== index) || (selectedIndex !== null && selectedIndex !== index) ? 0.35 : 1 }}
                onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)} onBlur={() => setHoveredIndex(null)} onClick={() => handleSelect(index, slice.name)}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleSelect(index, slice.name) } }}
              />)}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-[var(--capital-muted)] max-w-[110px] truncate">{activeItem ? activeItem.name : 'Total exibido'}</span>
              <strong className="text-sm tabular-nums mt-1">{maskValue(activeItem ? activeItem.total : totalAmount)}</strong>
              <span className="text-xs text-[var(--capital-accent)] mt-1">{activeItem ? `${activeItem.percentage.toFixed(1)}%` : `${topCategories.length} categorias`}</span>
            </div>
          </div>
          <div className="w-full space-y-1">
            {slices.map((slice, index) => <button key={`${slice.name}-${index}`} type="button" aria-pressed={selectedIndex === index}
              onClick={() => handleSelect(index, slice.name)} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)} onBlur={() => setHoveredIndex(null)}
              className="w-full rounded-lg p-2 text-left hover:bg-[var(--capital-soft)] transition-colors motion-reduce:transition-none"
              style={{ background: selectedIndex === index ? 'var(--capital-soft)' : undefined }}>
              <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                <span className="flex items-center gap-2 min-w-0"><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: slice.color }} /><span className="break-words">{slice.name}</span></span>
                <span className="flex items-center gap-2 ml-auto"><strong className="tabular-nums">{maskValue(slice.total)}</strong><span className="small-note">{slice.percentage.toFixed(1)}%</span></span>
              </span>
              <span className="block h-1 rounded-full bg-[var(--capital-line)] mt-2 overflow-hidden"><span className="block h-full rounded-full" style={{ width: `${Math.max(5, Math.min(100, slice.percentage))}%`, background: slice.color }} /></span>
            </button>)}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 items-center justify-between border-t border-[var(--capital-line)] pt-3 mt-auto">
        {selectedIndex !== null ? <button type="button" className="text-action" onClick={() => { setSelectedIndex(null); setHoveredIndex(null) }}>Limpar seleção</button> : <span className="small-note">Gastos do mês selecionado</span>}
        <button type="button" className="text-action" onClick={() => window.dispatchEvent(new CustomEvent('leaomed_switch_tab', { detail: { tab: 'auditoria' } }))}>Auditar tudo<ArrowRight size={14} /></button>
      </div>
    </section>
  )
}
