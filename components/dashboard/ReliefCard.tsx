'use client'

import React from 'react'
import { ArrowRight, CalendarCheck2 } from 'lucide-react'
import { usePrivacy } from '@/context/PrivacyContext'
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

export function ReliefCard({ contracts, scope, month, onOpen }: ReliefCardProps) {
  const { maskValue } = usePrivacy()
  const current = reliefForMonth(contracts, month, scope)
  const next = reliefForMonth(contracts, addMonths(month, 1), scope)
  const hasContracts = contracts.some(c => c.scope === scope)

  return (
    <button 
      type="button" 
      onClick={onOpen}
      className="relief-card group"
      aria-label="Abrir previsibilidade de parcelamentos e alívio de cartões"
    >
      <div className="relief-heading">
        <span className="panel-icon gold">
          <CalendarCheck2 className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <span className="eyebrow block">
            PREVISIBILIDADE DE ALÍVIO · CARTÕES
          </span>
          <span className="relief-title block mt-0.5">
            Parcelas que estão chegando ao fim
          </span>
        </div>
        <ArrowRight className="relief-arrow w-5 h-5 ml-auto shrink-0 group-hover:translate-x-1 transition-transform motion-reduce:transition-none" />
      </div>

      <div className="relief-values">
        {[current, next].map((entry, index) => (
          <div className="relief-metric" key={entry.month}>
            <span className="text-xs text-[var(--capital-muted)]">
              {index === 0 ? 'Neste mês' : 'No próximo mês'} · {monthLabel(entry.month)}
            </span>
            <strong className="text-2xl sm:text-3xl text-[var(--capital-success)] tracking-tight tabular-nums">
              {hasContracts ? maskValue(entry.amountCents / 100) : 'Sem dados'}
              {hasContracts && <small className="text-xs text-[var(--capital-muted)] font-normal ml-1">/mês</small>}
            </strong>
            <span className="text-xs text-[var(--capital-muted)]">
              {entry.items.length} {entry.items.length === 1 ? 'última parcela' : 'últimas parcelas'} · redução a partir de {monthLabel(entry.startsIn)}
            </span>
            {entry.unreviewed > 0 && (
              <span className="relief-warning text-xs text-[var(--capital-warning)] font-medium">
                {entry.unreviewed} para conferir · valor cadastrado, ainda não auditado
              </span>
            )}
            {entry.incomplete > 0 && (
              <span className="relief-warning text-xs text-[var(--capital-warning)] font-medium">
                Previsão parcial · {entry.incomplete} contratos sem cronograma/valor válido
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="relief-caption text-[11px] text-[var(--capital-muted)] leading-relaxed mt-2">
        Previsão dos contratos cadastrados. A última parcela ainda é cobrada no mês indicado; o valor deixa de pesar na cobrança seguinte.
      </p>

      <div className="relief-cta flex items-center gap-2 text-xs font-semibold text-[var(--capital-accent)] mt-3">
        <span>Conferir parcelas e dívidas</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}

export default ReliefCard
