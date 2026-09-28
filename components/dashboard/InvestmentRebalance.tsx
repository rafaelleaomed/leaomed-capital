'use client'

import React, { useState, useMemo } from 'react'
import { 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Building2, 
  Globe, 
  Bitcoin, 
  Landmark, 
  Coins,
  ChevronDown,
  Info
} from 'lucide-react'

interface AssetRow {
  name: string
  category: 'Ações' | 'Real Estate' | 'Caixa' | 'Cripto' | 'Internacional' | 'Reserva Emergência'
  broker: string
  quantity?: number
  avgPrice?: number
  currentPrice?: number
  invested: number
  current: number
  profit: number
  profitPct: number
  operation: 'Comprado' | 'Vendido'
  isEmergencyReserve?: boolean
}

export function InvestmentRebalance() {
  // Metas oficiais da imagem media_1790555008565.png
  const [targets, setTargets] = useState({
    'Ações': 25,
    'Real Estate': 15,
    'Caixa': 30,
    'Cripto': 5,
    'Internacional': 25,
  })

  const [activeTab, setActiveTab] = useState<'REBALANCE' | 'TABLE'>('REBALANCE')

  // 13 Ativos exatos da imagem media_1790554922684.png
  const assets: AssetRow[] = [
    { name: 'Caixa Itaú', category: 'Caixa', broker: 'Itaú', invested: 29020.73, current: 33346.93, profit: 4326.19, profitPct: 14.91, operation: 'Comprado' },
    { name: 'Internacional NuInvest', category: 'Internacional', broker: 'NuInvest', quantity: 268, avgPrice: 60.27, currentPrice: 71.89, invested: 16152.11, current: 19266.23, profit: 3114.12, profitPct: 19.28, operation: 'Comprado' },
    { name: 'Ações Itaú', category: 'Ações', broker: 'Itaú', quantity: 1930, avgPrice: 13.07, currentPrice: 14.68, invested: 25221.59, current: 28327.03, profit: 3105.44, profitPct: 12.31, operation: 'Comprado' },
    { name: 'Reserva Emergência Itaú', category: 'Reserva Emergência', broker: 'Itaú', invested: 32000.00, current: 33418.10, profit: 1418.10, profitPct: 4.43, operation: 'Comprado', isEmergencyReserve: true },
    { name: 'Cripto NuCrypto', category: 'Cripto', broker: 'NuCrypto', quantity: 40.01, avgPrice: 100.27, currentPrice: 134.47, invested: 4011.69, current: 5380.14, profit: 1368.45, profitPct: 34.11, operation: 'Comprado' },
    { name: 'Internacional Inter USA', category: 'Internacional', broker: 'Inter USA', quantity: 36.99, avgPrice: 278.68, currentPrice: 300.01, invested: 10308.36, current: 11097.54, profit: 789.18, profitPct: 7.66, operation: 'Comprado' },
    { name: 'Caixa NuInvest', category: 'Caixa', broker: 'NuInvest', invested: 10000.00, current: 10376.89, profit: 376.89, profitPct: 3.77, operation: 'Comprado' },
    { name: 'Cripto Itaú', category: 'Cripto', broker: 'Itaú', quantity: 5, avgPrice: 120.04, currentPrice: 128.19, invested: 600.18, current: 640.95, profit: 40.77, profitPct: 6.79, operation: 'Comprado' },
    { name: 'Ações BTG (Vendido)', category: 'Ações', broker: 'BTG', quantity: -1, avgPrice: 46.12, currentPrice: 42.13, invested: -46.12, current: -42.13, profit: 3.99, profitPct: 8.65, operation: 'Vendido' },
    { name: 'Ações NuInvest', category: 'Ações', broker: 'NuInvest', quantity: 1005, avgPrice: 5.82, currentPrice: 5.55, invested: 5846.01, current: 5582.30, profit: -263.71, profitPct: -4.51, operation: 'Comprado' },
    { name: 'Cripto Bybit', category: 'Cripto', broker: 'Bybit', quantity: 96.23, avgPrice: 104.97, currentPrice: 101.54, invested: 10101.26, current: 9771.66, profit: -329.60, profitPct: -3.26, operation: 'Comprado' },
    { name: 'Real Estate NuInvest', category: 'Real Estate', broker: 'NuInvest', quantity: 966, avgPrice: 21.35, currentPrice: 20.03, invested: 20627.38, current: 19350.70, profit: -1276.68, profitPct: -6.19, operation: 'Comprado' },
    { name: 'Cripto MEXC', category: 'Cripto', broker: 'MEXC', quantity: 9984.04, avgPrice: 0.33, currentPrice: 0.20, invested: 3317.82, current: 1960.02, profit: -1357.80, profitPct: -40.92, operation: 'Comprado' },
  ]

  // Totais Gerais
  const totalInvested = assets.reduce((acc, a) => acc + a.invested, 0) // R$ 167.161,02
  const totalCurrent = assets.reduce((acc, a) => acc + a.current, 0)   // R$ 178.476,35
  const totalProfit = totalCurrent - totalInvested                    // +R$ 11.315,33
  const totalProfitPct = (totalProfit / totalInvested) * 100          // +6,76%

  // Reserva de Emergência isolada
  const emergencyReserve = assets
    .filter(a => a.isEmergencyReserve)
    .reduce((acc, a) => acc + a.current, 0) // R$ 33.418,10

  // Portfólio de Ativos sob gestão de Rebalanceamento (SEM reserva de emergência)
  const rebalancePortfolioTotal = totalCurrent - emergencyReserve // R$ 145.058,25

  // Agrupamento por categoria (excluindo Reserva de Emergência)
  const categoryGroups = useMemo(() => {
    const groups: Record<string, { current: number; invested: number }> = {
      'Ações': { current: 0, invested: 0 },
      'Real Estate': { current: 0, invested: 0 },
      'Caixa': { current: 0, invested: 0 },
      'Cripto': { current: 0, invested: 0 },
      'Internacional': { current: 0, invested: 0 },
    }

    assets.forEach(a => {
      if (a.isEmergencyReserve) return
      if (groups[a.category]) {
        groups[a.category].current += a.current
        groups[a.category].invested += a.invested
      }
    })

    return Object.entries(groups).map(([cat, val]) => {
      const currentPct = rebalancePortfolioTotal > 0 ? (val.current / rebalancePortfolioTotal) * 100 : 0
      const targetPct = targets[cat as keyof typeof targets] || 0
      const targetValue = (targetPct / 100) * rebalancePortfolioTotal
      const diffValue = targetValue - val.current // Se positivo, falta aportar; se negativo, sobrealocado
      const diffPct = targetPct - currentPct

      return {
        category: cat,
        currentValue: val.current,
        currentPct,
        targetPct,
        targetValue,
        diffValue,
        diffPct,
      }
    })
  }, [assets, rebalancePortfolioTotal, targets])

  // Aportes prioritários (categorias com maior déficit)
  const neededContributions = categoryGroups
    .filter(g => g.diffValue > 0)
    .sort((a, b) => b.diffValue - a.diffValue)

  const handleTargetChange = (cat: string, value: number) => {
    setTargets(prev => ({
      ...prev,
      [cat]: value
    }))
  }

  return (
    <section id="balanceamento-investimentos" className="scroll-mt-24 space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-5 md:p-6 shadow-sm">
        {/* Header com Totais */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <PieChart className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                Carteira de Investimentos & Rebalanceamento
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Base de 13 ativos conciliados. As metas consideram o patrimônio ativo livre da Reserva de Emergência.
            </p>
          </div>

          {/* Seletor de visualização */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('REBALANCE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'REBALANCE' 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Rebalanceamento & Metas
              </button>
              <button
                onClick={() => setActiveTab('TABLE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'TABLE' 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                13 Ativos Detalhados
              </button>
            </div>
          </div>
        </div>

        {/* 3 Cards de Resumo da Carteira */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Patrimônio Total Atual
            </span>
            <div className="font-mono text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({totalProfitPct.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-1">
              Portfólio em Rebalanceamento
            </span>
            <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              R$ {rebalancePortfolioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              100% da base das metas (Ações, FIIs, Caixa, Cripto, Inter)
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              Reserva de Emergência
            </span>
            <div className="font-mono text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
              R$ {emergencyReserve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Itaú • Blindada contra rebalanceamento
            </div>
          </div>
        </div>

        {activeTab === 'REBALANCE' ? (
          <div className="space-y-6">
            {/* Box Estratégico de Próximos Aportes */}
            <div className="p-4.5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Recomendação de Aportes para Equilíbrio da Carteira:
                </strong>
                Para convergir para suas metas sem precisar vender ativos, concentre os próximos aportes prioritariamente em:
                <div className="flex flex-wrap gap-2 mt-2">
                  {neededContributions.map(c => (
                    <span key={c.category} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-bold font-mono text-slate-900 dark:text-white">
                      {c.category}: +R$ {c.diffValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sliders e Metas de Alocação (Estilo Imagem do Usuário) */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex justify-between px-1">
                <span>Grupo de Ativos</span>
                <span>Objetivo (%)</span>
              </div>

              {categoryGroups.map((group) => {
                const isUnder = group.diffValue > 0
                return (
                  <div key={group.category} className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{group.category}</span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          R$ {group.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({group.currentPct.toFixed(1)}%)
                        </span>
                      </div>

                      {/* Controle Numérico do Objetivo */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleTargetChange(group.category, Math.max(0, group.targetPct - 1))}
                          className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white w-10 text-center">
                          {group.targetPct}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTargetChange(group.category, Math.min(100, group.targetPct + 1))}
                          className="w-6 h-6 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Barra de Progresso Comparativa */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isUnder ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (group.currentPct / (group.targetPct || 1)) * 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        Meta em R$: <strong>R$ {group.targetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      {isUnder ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Faltam R$ {group.diffValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Sobrealocado (+R$ {Math.abs(group.diffValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Tabela Completa dos 13 Ativos da Imagem do Usuário */
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-500 text-white font-bold">
                  <th className="p-3">Ativo</th>
                  <th className="p-3">Qtd</th>
                  <th className="p-3">Preço Médio</th>
                  <th className="p-3">Corretora</th>
                  <th className="p-3">Total Investido</th>
                  <th className="p-3">Preço Atual</th>
                  <th className="p-3">Total Atual</th>
                  <th className="p-3">Ganho (R$)</th>
                  <th className="p-3">% Ganho</th>
                  <th className="p-3">Categoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 bg-white dark:bg-slate-950/40">
                {assets.map((asset, i) => {
                  const isPositive = asset.profit >= 0
                  return (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{asset.name}</td>
                      <td className="p-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {asset.quantity !== undefined ? asset.quantity.toLocaleString('pt-BR') : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {asset.avgPrice !== undefined ? `R$ ${asset.avgPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{asset.broker}</td>
                      <td className="p-3 font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        R$ {asset.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {asset.currentPrice !== undefined ? `R$ ${asset.currentPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                        R$ {asset.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 font-mono tabular-nums font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isPositive ? '+' : ''}R$ {asset.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 font-mono tabular-nums font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isPositive ? '▲ ' : '▼ '}{asset.profitPct.toFixed(2)}%
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                          {asset.category}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-900 font-bold border-t border-slate-300 dark:border-white/10">
                  <td className="p-3" colSpan={4}>13 Ativos (Total)</td>
                  <td className="p-3 font-mono tabular-nums">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3">-</td>
                  <td className="p-3 font-mono tabular-nums text-emerald-600 dark:text-emerald-400">R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-mono tabular-nums text-emerald-600 dark:text-emerald-400">+R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-mono tabular-nums text-emerald-600 dark:text-emerald-400">+{totalProfitPct.toFixed(2)}%</td>
                  <td className="p-3">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
