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

export function InvestmentRebalance({ isDemo = false }: { isDemo?: boolean }) {
  // Metas oficiais de alocação estratégica de portfólio
  const [targets, setTargets] = useState({
    'Ações': 25,
    'Real Estate': 15,
    'Caixa': 30,
    'Cripto': 5,
    'Internacional': 25,
  })

  const [activeTab, setActiveTab] = useState<'REBALANCE' | 'TABLE'>('REBALANCE')

  // Portfólio demonstrativo sanitizado para visualização de portfólio
  const demoAssets: AssetRow[] = [
    { name: 'Tesouro Selic / Caixa', category: 'Caixa', broker: 'Custódia B3', invested: 30000.00, current: 33400.00, profit: 3400.00, profitPct: 11.33, operation: 'Comprado' },
    { name: 'ETF S&P 500 Global', category: 'Internacional', broker: 'Corretora Global', quantity: 250, avgPrice: 65.00, currentPrice: 78.50, invested: 16250.00, current: 19625.00, profit: 3375.00, profitPct: 20.77, operation: 'Comprado' },
    { name: 'Ações Blue Chips (B3)', category: 'Ações', broker: 'Corretora Nacional', quantity: 1800, avgPrice: 14.00, currentPrice: 16.20, invested: 25200.00, current: 29160.00, profit: 3960.00, profitPct: 15.71, operation: 'Comprado' },
    { name: 'Reserva de Emergência (Liquidez)', category: 'Reserva Emergência', broker: 'Conta Remunerada', invested: 32000.00, current: 33500.00, profit: 1500.00, profitPct: 4.69, operation: 'Comprado', isEmergencyReserve: true },
    { name: 'Bitcoin (BTC)', category: 'Cripto', broker: 'Custódia Fria', quantity: 0.08, avgPrice: 50000.00, currentPrice: 68500.00, invested: 4000.00, current: 5480.00, profit: 1480.00, profitPct: 37.00, operation: 'Comprado' },
    { name: 'ETF Renda Fixa Global (BNDX)', category: 'Internacional', broker: 'Corretora Global', quantity: 35, avgPrice: 280.00, currentPrice: 310.00, invested: 9800.00, current: 10850.00, profit: 1050.00, profitPct: 10.71, operation: 'Comprado' },
    { name: 'CDB Liquidez Diária', category: 'Caixa', broker: 'Banco Primário', invested: 10000.00, current: 10450.00, profit: 450.00, profitPct: 4.50, operation: 'Comprado' },
    { name: 'Ethereum (ETH)', category: 'Cripto', broker: 'Custódia Fria', quantity: 0.5, avgPrice: 1200.00, currentPrice: 1350.00, invested: 600.00, current: 675.00, profit: 75.00, profitPct: 12.50, operation: 'Comprado' },
    { name: 'Ações Dividendos Brasil', category: 'Ações', broker: 'Corretora Nacional', quantity: 950, avgPrice: 6.00, currentPrice: 6.20, invested: 5700.00, current: 5890.00, profit: 190.00, profitPct: 3.33, operation: 'Comprado' },
    { name: 'FIIs Imobiliários Papel & Tijolo', category: 'Real Estate', broker: 'Corretora Nacional', quantity: 950, avgPrice: 21.00, currentPrice: 20.50, invested: 19950.00, current: 19475.00, profit: -475.00, profitPct: -2.38, operation: 'Comprado' },
  ]

  const [assets, setAssets] = useState<AssetRow[]>(demoAssets)

  // Carregar metas personalizadas do Setup Wizard
  const loadCustomTargets = React.useCallback(() => {
    try {
      const stored = localStorage.getItem('leaomed_user_custom_setup')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.investmentTargets && Array.isArray(parsed.investmentTargets)) {
          const mappedTargets: Record<string, number> = {}
          parsed.investmentTargets.forEach((t: any) => {
            if (t.assetClass && t.targetPercentage !== undefined) {
              mappedTargets[t.assetClass] = Number(t.targetPercentage)
            }
          })
          setTargets(prev => ({ ...prev, ...mappedTargets }))
        }
      }
    } catch (_) {}
  }, [])

  // Sincronização com API e listener reativo do Wizard
  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      const config = e.detail
      if (config?.investmentTargets?.length) {
        const mappedTargets: Record<string, number> = {}
        config.investmentTargets.forEach((t: any) => {
          if (t.assetClass && t.targetPercentage !== undefined) {
            mappedTargets[t.assetClass] = Number(t.targetPercentage)
          }
        })
        setTargets(prev => ({ ...prev, ...mappedTargets }))
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('leaomed_setup_updated', handleUpdate)
    }

    if (isDemo) {
      loadCustomTargets()
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('leaomed_setup_updated', handleUpdate)
        }
      }
    }

    let isMounted = true
    fetch('/api/investments')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (data.success && data.data) {
          if (Array.isArray(data.data.assets) && data.data.assets.length > 0) {
            const mappedAssets: AssetRow[] = data.data.assets.map((a: any) => ({
              name: a.asset_name,
              category: a.category,
              broker: a.broker,
              quantity: a.quantity ? parseFloat(a.quantity) : undefined,
              avgPrice: a.avg_price ? parseFloat(a.avg_price) : undefined,
              currentPrice: a.current_price ? parseFloat(a.current_price) : undefined,
              invested: parseFloat(a.total_invested) || 0,
              current: parseFloat(a.current_total) || 0,
              profit: parseFloat(a.profit_loss) || 0,
              profitPct: parseFloat(a.profit_loss_pct) || 0,
              operation: (a.operation === 'Vendido' ? 'Vendido' : 'Comprado') as 'Comprado' | 'Vendido',
              isEmergencyReserve: Boolean(a.is_emergency_reserve)
            }))
            setAssets(mappedAssets)
          }
          if (Array.isArray(data.data.targets) && data.data.targets.length > 0) {
            const mappedTargets: Record<string, number> = {}
            data.data.targets.forEach((t: any) => {
              mappedTargets[t.asset_class] = parseFloat(t.target_percentage) || 0
            })
            setTargets(prev => ({ ...prev, ...mappedTargets }))
          } else {
            loadCustomTargets()
          }
        }
      })
      .catch(() => {
        if (isMounted) loadCustomTargets()
      })
    return () => { 
      isMounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('leaomed_setup_updated', handleUpdate)
      }
    }
  }, [isDemo, loadCustomTargets])

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
