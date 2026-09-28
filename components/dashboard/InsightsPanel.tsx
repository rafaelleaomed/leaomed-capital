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
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 p-3.5 shadow-xs flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          IA Diagnóstico: Todos os indicadores de fluxo de caixa e compromissos operam na faixa de segurança.
        </span>
        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Estável
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-4 md:p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Diagnóstico Consultivo & Inteligência Financeira
            </h3>
            <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400">Diagnóstico preditivo em tempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
            {alerts.length} {alerts.length === 1 ? 'Aviso' : 'Avisos'}
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            title={isOpen ? "Recolher alertas" : "Expandir alertas"}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3 mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5">
          {alerts.map((alert, idx) => {
            let Icon = Info
            let cardStyle = 'border-blue-200 dark:border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
            let impactBadge = 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'

            if (alert.type === 'danger') {
              Icon = ShieldAlert
              cardStyle = 'border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
              impactBadge = 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
            } else if (alert.type === 'warning') {
              Icon = TrendingDown
              cardStyle = 'border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
              impactBadge = 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
            } else if (alert.type === 'opportunity') {
              Icon = TrendingUp
              cardStyle = 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
              impactBadge = 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
            }

            return (
              <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-xl border ${cardStyle} transition-all`}>
                <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${impactBadge}`}>
                      Impacto {alert.impact === 'high' ? 'Alto' : alert.impact === 'medium' ? 'Médio' : 'Baixo'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
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
