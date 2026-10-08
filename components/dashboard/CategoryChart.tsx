'use client'

import React, { useState } from 'react'
import { PieChart as PieIcon, ArrowRight, Layers } from 'lucide-react'

interface CategoryData {
  name: string
  total: number
  percentage: number
}

interface CategoryChartProps {
  categories: CategoryData[]
  onCategoryClick?: (categoryName: string) => void
}

const PALETTE = [
  '#E4C77B', // Dourado LeãoMed
  '#77D49F', // Esmeralda
  '#38BDF8', // Sky Blue
  '#F59E0B', // Âmbar
  '#A855F7', // Púrpura
  '#EC4899', // Rosa
  '#64748B', // Slate
  '#10B981'  // Verde
]

export function CategoryChart({ categories, onCategoryClick }: CategoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const topCategories = (categories || []).slice(0, 7)
  const totalAmount = topCategories.reduce((acc, c) => acc + c.total, 0)

  // Cálculo dos arcos do Donut SVG
  let cumulativePercent = 0
  const slices = topCategories.map((c, i) => {
    const percent = totalAmount > 0 ? (c.total / totalAmount) : 0
    const startAngle = cumulativePercent * 2 * Math.PI - Math.PI / 2
    cumulativePercent += percent
    const endAngle = cumulativePercent * 2 * Math.PI - Math.PI / 2

    const cx = 100
    const cy = 100
    const r = 80
    const innerR = 52

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)

    const x1Inner = cx + innerR * Math.cos(startAngle)
    const y1Inner = cy + innerR * Math.sin(startAngle)
    const x2Inner = cx + innerR * Math.cos(endAngle)
    const y2Inner = cy + innerR * Math.sin(endAngle)

    const largeArcFlag = percent > 0.5 ? 1 : 0

    // Path fechado do arco donut
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x2Inner} ${y2Inner}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
      'Z'
    ].join(' ')

    return {
      name: c.name,
      total: c.total,
      percentage: c.percentage,
      pathData,
      color: PALETTE[i % PALETTE.length]
    }
  })

  const activeItem = (hoveredIndex !== null ? slices[hoveredIndex] : null) || 
                     (selectedIndex !== null ? slices[selectedIndex] : null)

  const handleSelect = (idx: number, name: string) => {
    setSelectedIndex(selectedIndex === idx ? null : idx)
    if (onCategoryClick) {
      onCategoryClick(name)
    } else {
      // Dispara evento global para que a auditoria filtre por categoria
      window.dispatchEvent(new CustomEvent('leaomed_switch_tab', { detail: { tab: 'auditoria' } }))
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#3B4246] bg-white dark:bg-[#232A2E] p-6 shadow-sm flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-[#F6F3E9] flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-[#E4C77B]" />
            <span>Gráfico de Gastos do Mês</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#B0B8BD] mt-0.5">
            Distribuição percentual interativa • Clique nas fatias para filtrar
          </p>
        </div>
        {selectedIndex !== null && (
          <button
            onClick={() => setSelectedIndex(null)}
            className="text-[11px] font-bold text-[#E4C77B] hover:underline cursor-pointer"
          >
            Limpar seleção
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center gap-6 my-2">
        {topCategories.length === 0 ? (
          <div className="flex h-48 w-full items-center justify-center text-xs text-slate-500 dark:text-[#B0B8BD]">
            Nenhuma despesa processada para este período.
          </div>
        ) : (
          <>
            {/* Donut Chart SVG */}
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full transform -rotate-90 select-none overflow-visible"
              >
                {slices.map((slice, i) => {
                  const isHovered = hoveredIndex === i
                  const isSelected = selectedIndex === i
                  const isDimmed = (hoveredIndex !== null && !isHovered) || (selectedIndex !== null && !isSelected)

                  return (
                    <path
                      key={i}
                      d={slice.pathData}
                      fill={slice.color}
                      stroke={isSelected ? '#F6F3E9' : '#232A2E'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        opacity: isDimmed ? 0.35 : 1,
                        transform: isHovered || isSelected ? 'scale(1.04)' : 'scale(1)',
                        transformOrigin: '100px 100px'
                      }}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => handleSelect(i, slice.name)}
                    />
                  )
                })}
              </svg>

              {/* Centro do Donut com informações dinâmicas */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-[#B0B8BD] truncate max-w-[100px]">
                  {activeItem ? activeItem.name : 'Total do Mês'}
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-[#F6F3E9] font-mono tabular-nums leading-tight mt-0.5">
                  R$ {(activeItem ? activeItem.total : totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] font-bold text-[#E4C77B]">
                  {activeItem ? `${activeItem.percentage.toFixed(1)}%` : `${topCategories.length} categorias`}
                </span>
              </div>
            </div>

            {/* Lista clicável de categorias com barras de progresso */}
            <div className="flex-1 w-full space-y-2.5">
              {slices.map((slice, i) => {
                const isSelected = selectedIndex === i
                const isHovered = hoveredIndex === i

                return (
                  <div
                    key={slice.name}
                    onClick={() => handleSelect(i, slice.name)}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`group p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#E4C77B] bg-[#E4C77B]/10 shadow-xs' 
                        : isHovered
                          ? 'border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: slice.color }} 
                        />
                        <span className="font-semibold text-slate-700 dark:text-[#F6F3E9] truncate">
                          {slice.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-[#F6F3E9] font-mono tabular-nums">
                          R$ {slice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-bold text-[#B0B8BD] bg-slate-100 dark:bg-[#191D21] px-1.5 py-0.5 rounded-md">
                          {slice.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-[#191D21] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(5, Math.min(100, slice.percentage))}%`,
                          backgroundColor: slice.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-[#3B4246] text-[11px] text-[#B0B8BD] flex items-center justify-between">
        <span>Toque em uma categoria para auditar os lançamentos</span>
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('leaomed_switch_tab', { detail: { tab: 'auditoria' } }))
          }}
          className="text-[#E4C77B] hover:text-[#F6F3E9] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Auditar tudo</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
