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
  PlusCircle,
  Calculator
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

  // Listener dedicado e ininterrupto para ativação direta da Reserva de Emergência
  React.useEffect(() => {
    const handleEmergencyOpen = () => {
      setActiveTab('EMERGENCY')
      setTimeout(() => {
        const el = document.getElementById('reserva-emergencia') || document.getElementById('balanceamento-investimentos')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }

    const checkHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#reserva-emergencia') {
        setActiveTab('EMERGENCY')
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('leaomed_open_emergency_reserve', handleEmergencyOpen)
      window.addEventListener('hashchange', checkHash)
      checkHash()
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('leaomed_open_emergency_reserve', handleEmergencyOpen)
        window.removeEventListener('hashchange', checkHash)
      }
    }
  }, [])

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

  // Simulador de Aporte Proporcional conforme valor disponível
  const [contributionAmountInput, setContributionAmountInput] = useState<string>('2000')

  const contributionAmount = useMemo(() => {
    const cleaned = contributionAmountInput.replace(/[^\d.,]/g, '')
    let val = 0
    if (cleaned.includes(',') && cleaned.includes('.')) {
      val = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
    } else if (cleaned.includes(',')) {
      val = parseFloat(cleaned.replace(',', '.'))
    } else {
      val = parseFloat(cleaned)
    }
    return isNaN(val) || val < 0 ? 0 : val
  }, [contributionAmountInput])

  const totalDeficit = useMemo(() => {
    return neededContributions.reduce((acc, c) => acc + c.diffValue, 0)
  }, [neededContributions])

  const proportionalContributions = useMemo(() => {
    if (contributionAmount <= 0) return []
    if (totalDeficit <= 0) {
      // Sem déficit atual: sugere alocação de acordo com as metas percentuais-alvo
      return categoryGroups.map(g => ({
        category: g.category,
        suggestedAmount: (g.targetPct / 100) * contributionAmount,
        proportionPct: g.targetPct,
        currentValue: g.currentValue,
        projectedValue: g.currentValue + ((g.targetPct / 100) * contributionAmount),
        diffValue: g.diffValue,
        remainingDeficit: 0,
        targetPct: g.targetPct
      }))
    }

    return neededContributions.map(c => {
      const proportion = c.diffValue / totalDeficit
      const suggestedAmount = contributionAmount * proportion
      const proportionPct = proportion * 100
      const projectedValue = c.currentValue + suggestedAmount
      const remainingDeficit = Math.max(0, c.diffValue - suggestedAmount)

      return {
        category: c.category,
        suggestedAmount,
        proportionPct,
        currentValue: c.currentValue,
        projectedValue,
        diffValue: c.diffValue,
        remainingDeficit,
        targetPct: c.targetPct
      }
    })
  }, [neededContributions, totalDeficit, contributionAmount, categoryGroups])

  const handleTargetChange = (cat: string, value: number) => {
    setTargets(prev => ({
      ...prev,
      [cat]: value
    }))
  }

  return (
    <section id="balanceamento-investimentos" className="scroll-mt-24 space-y-6 relative">
      <div id="reserva-emergencia" className="absolute -top-24 left-0 w-1 h-1 pointer-events-none" />
      <div className="rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] p-5 md:p-6 shadow-sm">
        {/* Header com Totais */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
                <PieChart className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg md:text-xl font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                Carteira de Investimentos & Rebalanceamento
              </h2>
            </div>
            <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-1">
              Base de 13 ativos conciliados. As metas consideram o patrimônio ativo livre da Reserva de Emergência.
            </p>
          </div>

          {/* Seletor de visualização & Ações */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsInvestModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Registrar nova aplicação ou resgate direto na carteira"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Aporte / Resgate</span>
            </button>

            <div className="grid w-full min-w-0 grid-cols-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] p-1 text-xs font-semibold sm:flex sm:w-auto">
              <button
                onClick={() => setActiveTab('REBALANCE')}
                className={`col-span-2 px-3 py-1.5 rounded-lg transition-all sm:col-span-1 ${
                  activeTab === 'REBALANCE' 
                    ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold shadow-xs'
                    : 'text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)]'
                }`}
              >
                Rebalanceamento & Metas
              </button>
              <button
                onClick={() => setActiveTab('TABLE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'TABLE' 
                    ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold shadow-xs'
                    : 'text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)]'
                }`}
              >
                13 Ativos Detalhados
              </button>
              <button
                onClick={() => setActiveTab('EMERGENCY')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'EMERGENCY' 
                    ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold shadow-xs'
                    : 'text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)]'
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
          <div className="p-4 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
              Patrimônio Total Atual
            </span>
            <div className="font-mono text-2xl font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] tabular-nums">
              R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-bold mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({totalProfitPct.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] block mb-1">
              Portfólio em Rebalanceamento
            </span>
            <div className="font-mono text-2xl font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] tabular-nums">
              R$ {rebalancePortfolioTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-1">
              100% da base das metas (Ações, FIIs, Caixa, Cripto, Inter)
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] block mb-1 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--capital-accent,#927025)]" />
              Reserva de Emergência
            </span>
            <div className="font-mono text-2xl font-semibold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] tabular-nums">
              R$ {emergencyReserve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-1">
              Itaú • Blindada contra rebalanceamento
            </div>
          </div>
        </div>

        {activeTab === 'REBALANCE' ? (
          <div className="space-y-6">
            {/* Box Estratégico de Próximos Aportes & Simulador Proporcional */}
            <div className="rounded-2xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] from-emerald-500/10 via-teal-500/5 to-slate-50 dark:to-slate-900/60 p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--capital-accent,#927025)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] shrink-0 mt-0.5">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm md:text-base text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
                      Simulador de Aportes Proporcionais
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                        Rebalanceamento Ativo
                      </span>
                    </h3>
                    <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-0.5">
                      Defina quanto irá aportar este mês. O sistema calcula a divisão ideal proporcional ao déficit de cada categoria para equilibrar sua carteira.
                    </p>
                  </div>
                </div>

                {/* Input de Valor Disponível com Atalhos Rápidos */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-stretch md:self-auto">
                  <div className="relative w-full sm:w-44">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-[var(--capital-muted,#242a2e)]">
                      R$
                    </span>
                    <input
                      aria-label="Valor disponível para aportes proporcionais"
                      type="text"
                      value={contributionAmountInput}
                      onChange={(e) => setContributionAmountInput(e.target.value)}
                      placeholder="2.000,00"
                      className="w-full pl-8 pr-3 py-2 text-sm font-mono font-semibold rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                      title="Valor total disponível para aporte este mês"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {[1000, 2000, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setContributionAmountInput(amt.toString())}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          contributionAmount === amt
                            ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] shadow-xs'
                            : 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-accent,#927025)]'
                        }`}
                      >
                        R$ {amt >= 1000 ? `${amt / 1000}k` : amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cards de Proporção de Aporte Sugerida por Categoria */}
              {proportionalContributions.length > 0 && contributionAmount > 0 ? (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-2 flex items-center justify-between">
                    <span>Divisão Sugerida para R$ {contributionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}:</span>
                    <span className="text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-bold">
                      Déficit total a cobrir: R$ {totalDeficit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {proportionalContributions.map((item) => (
                      <div
                        key={item.category}
                        className="p-3 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-accent,#927025)] shadow-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="font-bold text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
                            {item.proportionPct.toFixed(1)}% do aporte
                          </span>
                        </div>

                        <div className="my-1">
                          <span className="text-[10px] text-[var(--capital-muted,#242a2e)] block">Aporte Sugerido</span>
                          <span className="font-mono text-base font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                            + R$ {item.suggestedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="pt-1.5 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between text-[10px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-mono">
                          <span>Atual: R$ {item.currentValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                          <span>➔ Novo: R$ {item.projectedValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--capital-success,#157449)]" />
                  <span>
                    Digite um valor acima para ver a sugestão matemática de aporte proporcional para cada classe.
                  </span>
                </div>
              )}

              {/* Badges de Próximos Aportes Prioritários */}
              <div className="pt-2 text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] flex flex-wrap items-center gap-2">
                <span className="font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                  Déficits prioritários da carteira:
                </span>
                {neededContributions.map(c => (
                  <span key={c.category} className="px-2.5 py-0.5 rounded-lg bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] font-bold font-mono text-[11px] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                    {c.category}: +R$ {c.diffValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                ))}
              </div>
            </div>

            {/* Sliders e Metas de Alocação (Estilo Imagem do Usuário) */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] uppercase tracking-wider flex justify-between px-1">
                <span>Grupo de Ativos</span>
                <span>Objetivo (%)</span>
              </div>

              {categoryGroups.map((group) => {
                const isUnder = group.diffValue > 0
                return (
                  <div key={group.category} className="p-4 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">{group.category}</span>
                        <span className="text-[11px] font-mono text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                          R$ {group.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({group.currentPct.toFixed(1)}%)
                        </span>
                      </div>

                      {/* Controle Numérico do Objetivo */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleTargetChange(group.category, Math.max(0, group.targetPct - 1))}
                          aria-label={`Diminuir meta de ${group.category} em um ponto percentual`}
                          className="w-6 h-6 rounded-md bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-center font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] w-10 text-center">
                          {group.targetPct}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTargetChange(group.category, Math.min(100, group.targetPct + 1))}
                          aria-label={`Aumentar meta de ${group.category} em um ponto percentual`}
                          className="w-6 h-6 rounded-md bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-center font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Barra de Progresso Comparativa */}
                    <div className="w-full bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] rounded-full h-2.5 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isUnder ? 'bg-amber-500' : 'bg-[var(--capital-button,#c7a354)]'
                        }`}
                        style={{ width: `${Math.min(100, (group.currentPct / (group.targetPct || 1)) * 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                        Meta em R$: <strong>R$ {group.targetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </span>
                      {isUnder ? (
                        <span className="text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] font-bold flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> Faltam R$ {group.diffValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] font-bold flex items-center gap-1">
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
          <div className="overflow-x-auto rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold">
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
              <tbody className="divide-y divide-[var(--capital-line,#e4dfd3)] dark:divide-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)]">
                {assets.map((asset, i) => {
                  const isPositive = asset.profit >= 0
                  return (
                    <tr key={i} className="hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors">
                      <td className="p-3 font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">{asset.name}</td>
                      <td className="p-3 font-mono tabular-nums text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                        {asset.quantity !== undefined ? asset.quantity.toLocaleString('pt-BR') : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                        {asset.avgPrice !== undefined ? `R$ ${asset.avgPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3 text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-medium">{asset.broker}</td>
                      <td className="p-3 font-mono tabular-nums font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                        R$ {asset.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                        {asset.currentPrice !== undefined ? `R$ ${asset.currentPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="p-3 font-mono tabular-nums font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                        R$ {asset.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 font-mono tabular-nums font-bold ${isPositive ? 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]' : 'text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]'}`}>
                        {isPositive ? '+' : ''}R$ {asset.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 font-mono tabular-nums font-bold ${isPositive ? 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]' : 'text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]'}`}>
                        {isPositive ? '▲ ' : '▼ '}{asset.profitPct.toFixed(2)}%
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                          {asset.category}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] font-bold border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
                  <td className="p-3" colSpan={4}>13 Ativos (Total)</td>
                  <td className="p-3 font-mono tabular-nums">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3">-</td>
                  <td className="p-3 font-mono tabular-nums text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">R$ {totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-mono tabular-nums text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">+R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 font-mono tabular-nums text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">+{totalProfitPct.toFixed(2)}%</td>
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
            <div className="p-5 md:p-6 rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[var(--capital-success,#157449)]" />
                    Calculadora de Reserva de Emergência Sugerida
                  </h3>
                  <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-0.5">
                    Defina quantos meses de custo fixo garantem a segurança total da sua família ou da sua clínica médica.
                  </p>
                </div>

                {/* Input de Custo Fixo Mensal alimentado pelas despesas obrigatórias da planilha */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2 bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-1.5 rounded-xl shadow-xs">
                    <label htmlFor="capital-reserve-fixed-cost" className="text-xs font-semibold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">Custo Fixo Estimado:</label>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-[var(--capital-muted,#242a2e)] mr-1">R$</span>
                      <input 
                        id="capital-reserve-fixed-cost"
                        type="number"
                        value={fixedCostInput}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0)
                          setFixedCostInput(val)
                          setIsSyncedWithBudget(Math.abs(val - obligatoryBudgetTotal) < 0.01)
                        }}
                        className="w-28 text-xs font-mono font-bold bg-transparent border-none text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none tabular-nums"
                      />
                    </div>
                  </div>

                  {isSyncedWithBudget ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[11px] font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--capital-success,#157449)] shrink-0" />
                      <span>Sincronizado com Despesas Obrigatórias da Planilha (R$ {obligatoryBudgetTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setFixedCostInput(obligatoryBudgetTotal)
                        setIsSyncedWithBudget(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--capital-warning-soft,#fcf1dc)] hover:bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] text-[11px] font-semibold text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] transition-colors cursor-pointer"
                      title="Clique para restaurar o somatório das despesas obrigatórias da planilha"
                    >
                      <RefreshCw className="w-3 h-3 text-[var(--capital-warning,#8b5b15)] shrink-0" />
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
                          ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] shadow-md shadow-none'
                          : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] hover:border-[var(--capital-line,#e4dfd3)] dark:hover:border-[var(--capital-line,#e4dfd3)]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-base font-semibold font-display ${isSelected ? 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]' : 'text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]'}`}>
                            {item.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected 
                              ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold'
                              : 'bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]'
                          }`}>
                            {item.badge}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] mb-1">
                          {item.profile}
                        </div>
                        <p className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] line-clamp-2">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[var(--capital-muted,#242a2e)]">Meta:</span>
                        <span className="font-mono font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] tabular-nums">
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
                  <div className="lg:col-span-2 p-5 rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] uppercase tracking-wider">
                          Progresso da Blindagem Patrimonial
                        </span>
                        <div className="text-xl font-semibold font-display text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] mt-0.5">
                          {progressPct.toFixed(1)}% da Reserva Meta Concluída
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        progressPct >= 100 
                          ? 'bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]'
                          : progressPct >= 60
                          ? 'bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)]'
                          : 'bg-[var(--capital-danger-soft,#fcecec)] text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)] border border-[var(--capital-danger,#ad3333)]'
                      }`}>
                        {progressPct >= 100 ? 'Blindagem Concluída' : progressPct >= 60 ? 'Em Consolidação' : 'Construção Inicial'}
                      </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] h-3.5 rounded-full overflow-hidden p-0.5 border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
                      <div 
                        className="bg-[var(--capital-soft,#f6f0df)] from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-xs"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Métricas lado a lado */}
                    <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                      <div className="p-3 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
                        <span className="text-[10px] text-[var(--capital-muted,#242a2e)] font-bold block mb-1">RESERVA ATUAL</span>
                        <span className="font-mono text-base font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] tabular-nums">
                          R$ {currentReserve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-[var(--capital-muted,#242a2e)] block mt-0.5">
                          ({monthsCovered} meses de cobertura)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
                        <span className="text-[10px] text-[var(--capital-muted,#242a2e)] font-bold block mb-1">META SUGERIDA ({emergencyMonths}x)</span>
                        <span className="font-mono text-base font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] tabular-nums">
                          R$ {targetReserve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-[var(--capital-muted,#242a2e)] block mt-0.5">
                          ({emergencyMonths} meses de custo fixo)
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
                        <span className="text-[10px] text-[var(--capital-muted,#242a2e)] font-bold block mb-1">DÉFICIT / FALTAM</span>
                        <span className={`font-mono text-base font-semibold tabular-nums ${shortfall === 0 ? 'text-[var(--capital-success,#157449)]' : 'text-[var(--capital-warning,#8b5b15)]'}`}>
                          {shortfall === 0 ? 'Meta Atingida!' : `R$ ${shortfall.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </span>
                        <span className="text-[10px] text-[var(--capital-muted,#242a2e)] block mt-0.5">
                          {shortfall === 0 ? 'Proteção 100%' : 'Para fechar a reserva'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Estratégia de Alocação da Reserva Sugerida */}
                  <div className="p-5 rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] space-y-3.5">
                    <h4 className="font-display text-sm font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[var(--capital-success,#157449)]" />
                      Onde Alocar a Reserva Sugerida
                    </h4>
                    <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                      A reserva de emergência nunca deve buscar risco de mercado. A regra de ouro é **Liquidez Imediata (D+0)** e **Risco Zero**.
                    </p>

                    <div className="space-y-2.5 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">Tesouro Selic (50%)</div>
                          <div className="text-[10px] text-[var(--capital-muted,#242a2e)]">Risco soberano Brasil • Resgate D+1</div>
                        </div>
                        <span className="font-mono font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                          R$ {(targetReserve * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">CDB 100% a 105% CDI (40%)</div>
                          <div className="text-[10px] text-[var(--capital-muted,#242a2e)]">Bancos sólidos • Liquidez Diária D+0</div>
                        </div>
                        <span className="font-mono font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                          R$ {(targetReserve * 0.4).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">Conta Remunerada (10%)</div>
                          <div className="text-[10px] text-[var(--capital-muted,#242a2e)]">Resgate 24/7 incluindo fins de semana</div>
                        </div>
                        <span className="font-mono font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
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
