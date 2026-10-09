'use client'

import React, { useState } from 'react'
import { AlertCircle, TrendingUp, TrendingDown, Info, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react'
import { RichAlert } from '@/utils/insightsEngine'

interface InsightsPanelProps {
  alerts: RichAlert[];
}

export function InsightsPanel({ alerts }: InsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] p-3.5 shadow-xs flex items-center justify-between text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--capital-success,#157449)]" />
          IA Diagnóstico: Todos os indicadores de fluxo de caixa e compromissos operam na faixa de segurança.
        </span>
        <span className="text-[10px] uppercase font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] bg-[var(--capital-soft,#f6f0df)] px-2.5 py-1 rounded-full border border-[var(--capital-accent,#927025)]">
          Estável
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] p-4 md:p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-xs md:text-sm font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] leading-tight">
              Diagnóstico Consultivo & Inteligência Financeira
            </h3>
            <p className="text-[10px] md:text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">Diagnóstico preditivo em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] px-2.5 py-1 rounded-full">
            {alerts.length} {alerts.length === 1 ? 'Aviso' : 'Avisos'}
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)] transition-all cursor-pointer"
            title={isOpen ? "Recolher alertas" : "Expandir alertas"}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3 mt-3.5 pt-3 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
          {alerts.map((alert, idx) => {
            let Icon = Info
            let cardStyle = 'border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'
            let impactBadge = 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'

            if (alert.type === 'danger') {
              Icon = ShieldAlert
              cardStyle = 'border-[var(--capital-danger,#ad3333)] dark:border-[var(--capital-danger,#ad3333)] bg-[var(--capital-danger-soft,#fcecec)] dark:bg-[var(--capital-danger-soft,#fcecec)] text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]'
              impactBadge = 'bg-[var(--capital-danger-soft,#fcecec)] dark:bg-[var(--capital-danger-soft,#fcecec)] text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]'
            } else if (alert.type === 'warning') {
              Icon = TrendingDown
              cardStyle = 'border-[var(--capital-warning,#8b5b15)] dark:border-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)] dark:bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]'
              impactBadge = 'bg-[var(--capital-warning-soft,#fcf1dc)] dark:bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]'
            } else if (alert.type === 'opportunity') {
              Icon = TrendingUp
              cardStyle = 'border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
              impactBadge = 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
            }

            return (
              <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-xl border ${cardStyle} transition-all`}>
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] leading-relaxed font-medium">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${impactBadge}`}>
                      Impacto {alert.impact === 'high' ? 'Alto' : alert.impact === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                    <span className="text-[10px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hidden sm:inline">
                      Motor de Decisão
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
