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
  Info,
  RefreshCw,
  PlusCircle
} from 'lucide-react'
import { InvestmentPortfolioStore, PortfolioAsset } from '@/utils/investmentPortfolioStore'
import { InvestmentLinkModal } from './InvestmentLinkModal'

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

  const [activeTab, setActiveTab] = useState<'REBALANCE' | 'TABLE' | 'EMERGENCY'>('REBALANCE')
  const [emergencyMonths, setEmergencyMonths] = useState<number>(10)
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  
  // O custo fixo mensal estimado deve vir principalmente do somatório das despesas obrigatórias da planilha (R$ 25.528,57)
  const [obligatoryBudgetTotal, setObligatoryBudgetTotal] = useState<number>(25528.57)
  const [fixedCostInput, setFixedCostInput] = useState<number>(25528.57)
  const [isSyncedWithBudget, setIsSyncedWithBudget] = useState<boolean>(true)

  // Portfólio oficial conciliado integrado com o Store central
  const [assets, setAssets] = useState<AssetRow[]>(() => {
    return InvestmentPortfolioStore.getAssets() as AssetRow[]
  })

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

    // Carregar despesas obrigatórias da planilha (Base principal para reserva)
    try {
      const savedObligatory = localStorage.getItem('leaomed_obligatory_expenses')
      if (savedObligatory) {
        const val = parseFloat(savedObligatory)
        if (!isNaN(val) && val > 0) {
          setObligatoryBudgetTotal(val)
          setFixedCostInput(val)
        }
      }
    } catch (_) {}

    const handleObligatoryUpdate = (e: any) => {
      if (e.detail?.obligatoryTotal) {
        const val = Number(e.detail.obligatoryTotal)
        setObligatoryBudgetTotal(val)
        setFixedCostInput(val)
        setIsSyncedWithBudget(true)
      }
    }

    const handlePortfolioUpdate = () => {
      const fresh = InvestmentPortfolioStore.getAssets()
      setAssets(fresh as AssetRow[])
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('leaomed_setup_updated', handleUpdate)
      window.addEventListener('leaomed_budget_obligatory_updated', handleObligatoryUpdate)
      window.addEventListener('leaomed_investments_updated', handlePortfolioUpdate)
    }

    if (isDemo) {
      loadCustomTargets()
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('leaomed_setup_updated', handleUpdate)
          window.removeEventListener('leaomed_budget_obligatory_updated', handleObligatoryUpdate)
          window.removeEventListener('leaomed_investments_updated', handlePortfolioUpdate)
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
        window.removeEventListener('leaomed_budget_obligatory_updated', handleObligatoryUpdate)
        window.removeEventListener('leaomed_investments_updated', handlePortfolioUpdate)
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

          {/* Seletor de visualização & Ações */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsInvestModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Registrar nova aplicação ou resgate direto na carteira"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Aporte / Resgate</span>
            </button>

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
              <button
                onClick={() => setActiveTab('EMERGENCY')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'EMERGENCY' 
                    ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Reserva de Emergência</span>
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

        {/* Visualização 3: Calculadora de Reserva de Emergência Sugerida (6 a 12x Custo Fixo) */}
        {activeTab === 'EMERGENCY' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Bloco de Seleção de Perfil / Multiplicador */}
            <div className="p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Calculadora de Reserva de Emergência Sugerida
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Defina quantos meses de custo fixo garantem a segurança total da sua família ou da sua clínica médica.
                  </p>
                </div>

                {/* Input de Custo Fixo Mensal alimentado pelas despesas obrigatórias da planilha */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl shadow-xs">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Custo Fixo Estimado:</span>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-slate-400 mr-1">R$</span>
                      <input 
                        type="number"
                        value={fixedCostInput}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0)
                          setFixedCostInput(val)
                          setIsSyncedWithBudget(Math.abs(val - obligatoryBudgetTotal) < 0.01)
                        }}
                        className="w-28 text-xs font-mono font-bold bg-transparent border-none text-slate-900 dark:text-white focus:outline-none tabular-nums"
                      />
                    </div>
                  </div>

                  {isSyncedWithBudget ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Sincronizado com Despesas Obrigatórias da Planilha (R$ {obligatoryBudgetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setFixedCostInput(obligatoryBudgetTotal)
                        setIsSyncedWithBudget(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-semibold text-amber-600 dark:text-amber-400 transition-colors cursor-pointer"
                      title="Clique para restaurar o somatório das despesas obrigatórias da planilha"
                    >
                      <RefreshCw className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>Usar Despesas Obrigatórias (R$ {obligatoryBudgetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Seletor de Perfis Médicos (6x, 8x, 10x, 12x) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {[
                  {
                    months: 6,
                    title: '6 Meses',
                    profile: 'Concursado / Renda Fixa',
                    desc: 'Estabilidade máxima com vencimentos previsíveis e sem variação.',
                    badge: 'Mínimo Seguro'
                  },
                  {
                    months: 8,
                    title: '8 Meses',
                    profile: 'CLT / Contrato Longo',
                    desc: 'Previsibilidade com aviso prévio e segurança contratual intermediária.',
                    badge: 'Equilibrado'
                  },
                  {
                    months: 10,
                    title: '10 Meses',
                    profile: 'Médico Autônomo / Plantões',
                    desc: 'Ideal para quem atua em escalas, plantões extras e consultório particular.',
                    badge: 'Recomendado para Você'
                  },
                  {
                    months: 12,
                    title: '12 Meses',
                    profile: 'Clínica Própria / Empresário PJ',
                    desc: 'Máxima blindagem: cobre custos fixos pessoais e folha/insumos da clínica.',
                    badge: 'Blindagem Total'
                  }
                ].map(item => {
                  const isSelected = emergencyMonths === item.months
                  return (
                    <button
                      key={item.months}
                      onClick={() => setEmergencyMonths(item.months)}
                      className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-md shadow-emerald-500/10'
                          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-base font-black font-display ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {item.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-emerald-500 text-slate-950 font-black' 
                              : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                          }`}>
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                          {item.profile}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500">Meta:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          R$ {(fixedCostInput * item.months).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Diagnóstico da Reserva Atual vs Meta */}
            {(() => {
              const targetReserve = fixedCostInput * emergencyMonths
              const currentReserve = emergencyReserve > 0 ? emergencyReserve : 43450.00
              const progressPct = Math.min(100, (currentReserve / targetReserve) * 100)
              const shortfall = Math.max(0, targetReserve - currentReserve)
              const monthsCovered = fixedCostInput > 0 ? (currentReserve / fixedCostInput).toFixed(1) : '0'

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Card 1: Termômetro e Barra de Progresso */}
                  <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Progresso da Blindagem Patrimonial
                        </span>
                        <div className="text-xl font-black font-display text-slate-900 dark:text-white mt-0.5">
                          {progressPct.toFixed(1)}% da Reserva Meta Concluída
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        progressPct >= 100 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40' 
                          : progressPct >= 60
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40'
                      }`}>
                        {progressPct >= 100 ? 'Blindagem Concluída' : progressPct >= 60 ? 'Em Consolidação' : 'Construção Inicial'}
                      </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-xs"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Métricas lado a lado */}
                    <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">RESERVA ATUAL</span>
                        <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          R$ {currentReserve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          ({monthsCovered} meses de cobertura)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">META SUGERIDA ({emergencyMonths}x)</span>
                        <span className="font-mono text-base font-black text-slate-900 dark:text-white tabular-nums">
                          R$ {targetReserve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          ({emergencyMonths} meses de custo fixo)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">DÉFICIT / FALTAM</span>
                        <span className={`font-mono text-base font-black tabular-nums ${shortfall === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {shortfall === 0 ? 'Meta Atingida!' : `R$ ${shortfall.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {shortfall === 0 ? 'Proteção 100%' : 'Para fechar a reserva'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Estratégia de Alocação da Reserva Sugerida */}
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 space-y-3.5">
                    <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Onde Alocar a Reserva Sugerida
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      A reserva de emergência nunca deve buscar risco de mercado. A regra de ouro é **Liquidez Imediata (D+0)** e **Risco Zero**.
                    </p>

                    <div className="space-y-2.5 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Tesouro Selic (50%)</div>
                          <div className="text-[10px] text-slate-500">Risco soberano Brasil • Resgate D+1</div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {(targetReserve * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">CDB 100% a 105% CDI (40%)</div>
                          <div className="text-[10px] text-slate-500">Bancos sólidos • Liquidez Diária D+0</div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {(targetReserve * 0.4).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Conta Remunerada (10%)</div>
                          <div className="text-[10px] text-slate-500">Resgate 24/7 incluindo fins de semana</div>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {(targetReserve * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Modal Interativo de Vínculo de Investimentos (Aporte e Resgate) */}
      <InvestmentLinkModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        actionType="APORTE"
        transactionAmount={0}
        onSelectAsset={() => {
          const fresh = InvestmentPortfolioStore.getAssets()
          setAssets(fresh as AssetRow[])
        }}
      />
    </section>
  )
}
