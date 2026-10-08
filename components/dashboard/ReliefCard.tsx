'use client'

import React from 'react'
import { ArrowRight, CalendarCheck2 } from 'lucide-react'
import { 
  addMonths, 
  monthLabel, 
  reliefForMonth, 
  InstallmentContract 
} from '@/utils/installmentsEngine'

interface ReliefCardProps {
  contracts: InstallmentContract[]
  scope: 'PF' | 'PJ'
  month: string
  onOpen: () => void
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  })
}

export function ReliefCard({ contracts, scope, month, onOpen }: ReliefCardProps) {
  const current = reliefForMonth(contracts, month, scope)
  const next = reliefForMonth(contracts, addMonths(month, 1), scope)
  const hasContracts = contracts.some(c => c.scope === scope)

  return (
    <button 
      type="button" 
      onClick={onOpen}
      className="relief-card group focus:outline-none focus:ring-2 focus:ring-[#E4C77B]"
      aria-label="Abrir previsibilidade de parcelamentos e alívio de cartões"
    >
      <div className="relief-heading">
        <span className="panel-icon gold">
          <CalendarCheck2 className="w-5 h-5 text-[#E4C77B]" />
        </span>
        <div className="min-w-0">
          <span className="eyebrow text-[#E4C77B] text-[10px] font-bold tracking-wider uppercase block">
            PREVISIBILIDADE DE ALÍVIO · CARTÕES
          </span>
          <span className="relief-title font-semibold text-base sm:text-lg text-[#F6F3E9] block mt-0.5">
            Parcelas que estão chegando ao fim
          </span>
        </div>
        <ArrowRight className="relief-arrow w-5 h-5 text-[#E4C77B] ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>

      <div className="relief-values">
        {[current, next].map((entry, index) => (
          <div className="relief-metric" key={entry.month}>
            <span className="text-xs text-[#B0B8BD]">
              {index === 0 ? 'Neste mês' : 'No próximo mês'} · {monthLabel(entry.month)}
            </span>
            <strong className="text-2xl sm:text-3xl font-bold text-[#77D49F] tracking-tight">
              {hasContracts ? formatBRL(entry.amountCents / 100) : 'Sem dados'}
              {hasContracts && <small className="text-xs text-[#B0B8BD] font-normal ml-1">/mês</small>}
            </strong>
            <span className="text-xs text-[#B0B8BD]">
              {entry.items.length} {entry.items.length === 1 ? 'última parcela' : 'últimas parcelas'} · redução a partir de {monthLabel(entry.startsIn)}
            </span>
            {entry.unreviewed > 0 && (
              <span className="relief-warning text-xs text-[#F0D09A] font-medium">
                {entry.unreviewed} para conferir · valor cadastrado, ainda não auditado
              </span>
            )}
            {entry.incomplete > 0 && (
              <span className="relief-warning text-xs text-[#F0D09A] font-medium">
                Previsão parcial · {entry.incomplete} contratos sem cronograma/valor válido
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="relief-caption text-[11px] text-[#B0B8BD] leading-relaxed mt-2">
        Previsão dos contratos cadastrados. A última parcela ainda é cobrada no mês indicado; o valor deixa de pesar na cobrança seguinte.
      </p>

      <div className="relief-cta flex items-center gap-2 text-xs font-semibold text-[#E4C77B] mt-3 group-hover:text-[#F6F3E9] transition-colors">
        <span>Conferir parcelas e dívidas</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}

export default ReliefCard
