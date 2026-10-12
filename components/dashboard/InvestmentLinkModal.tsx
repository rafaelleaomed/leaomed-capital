'use client'

import { getFinancialScopeVersion } from '@/utils/userScopedStorage'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  PlusCircle, 
  Coins, 
  ArrowRight,
  PieChart,
  Landmark,
  Wallet
} from 'lucide-react'
import { 
  InvestmentPortfolioStore, 
  PortfolioAsset 
} from '@/utils/investmentPortfolioStore'

interface InvestmentLinkModalProps {
  isOpen: boolean
  onClose: () => void
  actionType?: 'APORTE' | 'RESGATE'
  transactionAmount: number
  transactionDate?: string
  transactionDescription?: string
  onSelectAsset: (assetName: string, actionType: 'APORTE' | 'RESGATE', updatedAsset?: PortfolioAsset) => void
}

export function InvestmentLinkModal({
  isOpen,
  onClose,
  actionType = 'APORTE',
  transactionAmount = 0,
  transactionDate = new Date().toISOString().split('T')[0],
  transactionDescription = '',
  onSelectAsset
}: InvestmentLinkModalProps) {
  const financialScopeVersion = React.useRef(getFinancialScopeVersion()).current
  const [currentAction, setCurrentAction] = useState<'APORTE' | 'RESGATE'>(actionType)
  const [assets, setAssets] = useState<PortfolioAsset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  
  // Novo ativo rápido
  const [newAssetName, setNewAssetName] = useState('')
  const [newAssetCategory, setNewAssetCategory] = useState<PortfolioAsset['category']>('Caixa')
  const [newAssetBroker, setNewAssetBroker] = useState('XP Investimentos')

  useEffect(() => {
    setCurrentAction(actionType)
  }, [actionType])

  useEffect(() => {
    if (isOpen) {
      const list = InvestmentPortfolioStore.getAssets()
      setAssets(list)
      setSelectedAsset(null)
      setIsCreatingNew(false)
    }
  }, [isOpen])

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (!searchTerm.trim()) return true
      const q = searchTerm.toLowerCase()
      return (
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.broker.toLowerCase().includes(q)
      )
    })
  }, [assets, searchTerm])

  if (!isOpen) return null

  const absAmount = Math.abs(transactionAmount)

  const handleConfirm = () => {
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    if (!selectedAsset) return

    let updated: PortfolioAsset | null = null
    if (currentAction === 'APORTE') {
      updated = InvestmentPortfolioStore.applyContribution(
        selectedAsset.name,
        absAmount,
        transactionDate,
        transactionDescription
      )
    } else {
      updated = InvestmentPortfolioStore.applyRedemption(
        selectedAsset.name,
        absAmount,
        transactionDate,
        transactionDescription
      ) || selectedAsset
    }

    onSelectAsset(selectedAsset.name, currentAction, updated || selectedAsset)
    onClose()
  }

  const handleCreateAndSelect = (e: React.FormEvent) => {
    if (getFinancialScopeVersion() !== financialScopeVersion) return
    e.preventDefault()
    if (!newAssetName.trim()) return

    const newAsset: PortfolioAsset = {
      name: newAssetName.trim(),
      category: newAssetCategory,
      broker: newAssetBroker.trim() || 'Corretora',
      invested: currentAction === 'APORTE' ? absAmount : 0,
      current: currentAction === 'APORTE' ? absAmount : 0,
      profit: 0,
      profitPct: 0,
      operation: 'Comprado'
    }

    InvestmentPortfolioStore.addCustomAsset(newAsset)
    onSelectAsset(newAsset.name, currentAction, newAsset)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-xl overflow-hidden shadow-sm border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              currentAction === 'APORTE' 
                ? 'bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]'
                : 'bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)]'
            }`}>
              {currentAction === 'APORTE' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-base md:text-lg text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] leading-tight">
                  {currentAction === 'APORTE' ? 'Vincular Aplicação em Investimento' : 'Vincular Resgate de Investimento'}
                </h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentAction === 'APORTE' 
                    ? 'bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
                    : 'bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]'
                }`}>
                  {currentAction === 'APORTE' ? 'Aporte de Capital' : 'Resgate / Saída'}
                </span>
              </div>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-0.5">
                {currentAction === 'APORTE'
                  ? 'Selecione abaixo em qual ativo ou fundo este valor foi aplicado'
                  : 'Selecione abaixo de qual ativo ou fundo este valor foi retirado'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Valor da Operação */}
        <div className="px-5 py-3.5 bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-medium">Valor da Operação:</span>
            <span className="font-mono text-base font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
              R$ {absAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {transactionDescription && (
              <span className="text-[11px] text-[var(--capital-muted,#242a2e)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] px-2 py-0.5 rounded-md truncate max-w-xs">
                {transactionDescription}
              </span>
            )}
          </div>

          {/* Toggle de Ação (Aporte vs Resgate) */}
          <div className="inline-flex rounded-xl p-1 bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setCurrentAction('APORTE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currentAction === 'APORTE'
                  ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] shadow-xs'
                  : 'text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)]'
              }`}
            >
              Aplicação (Aporte)
            </button>
            <button
              type="button"
              onClick={() => setCurrentAction('RESGATE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currentAction === 'RESGATE'
                  ? 'bg-amber-600 text-[var(--capital-text,#242a2e)] shadow-xs'
                  : 'text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)]'
              }`}
            >
              Resgate (Saída)
            </button>
          </div>
        </div>

        {/* Conteúdo com Lista de Investimentos Atuais */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!isCreatingNew ? (
            <>
              {/* Barra de Busca e Botão de Novo Ativo */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--capital-muted,#242a2e)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar ativo por nome, classe ou corretora (ex: CDB, Tesouro, Ações, FIIs)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-muted,#242a2e)]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="px-3 py-2 rounded-xl border border-dashed border-[var(--capital-accent,#927025)] hover:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Novo Ativo</span>
                </button>
              </div>

              {/* Grid / Lista de Ativos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredAssets.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-[var(--capital-muted,#242a2e)] text-xs">
                    Nenhum investimento correspondente encontrado.
                  </div>
                ) : (
                  filteredAssets.map((asset) => {
                    const isSelected = selectedAsset?.name === asset.name
                    const projectedBalance = currentAction === 'APORTE' 
                      ? asset.current + absAmount 
                      : Math.max(0, asset.current - absAmount)

                    return (
                      <div
                        key={asset.name}
                        onClick={() => setSelectedAsset(asset)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] ring-2 ring-[var(--capital-accent,#927025)] shadow-md'
                            : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] hover:border-[var(--capital-line,#e4dfd3)] dark:hover:border-[var(--capital-line,#e4dfd3)]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] truncate" title={asset.name}>
                              {asset.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] shrink-0">
                              {asset.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--capital-muted,#242a2e)] flex items-center gap-2">
                            <span>{asset.broker}</span>
                            <span>•</span>
                            <span className={asset.profit >= 0 ? 'text-[var(--capital-success,#157449)]' : 'text-[var(--capital-danger,#ad3333)]'}>
                              {asset.profit >= 0 ? '+' : ''}{asset.profitPct.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[var(--capital-muted,#242a2e)] block">Saldo Atual</span>
                            <span className="font-mono font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                              R$ {asset.current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="text-right animate-in fade-in">
                              <span className="text-[10px] text-[var(--capital-success,#157449)] font-bold block">
                                {currentAction === 'APORTE' ? 'Saldo Projetado' : 'Saldo Restante'}
                              </span>
                              <span className="font-mono font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                                R$ {projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          ) : (
            /* Formulário de Criação Rápida de Novo Ativo */
            <form onSubmit={handleCreateAndSelect} className="p-4 rounded-2xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  Cadastrar Novo Ativo na Carteira
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-muted,#242a2e)]"
                >
                  Voltar à lista
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
                  Nome do Ativo / Fundo
                </label>
                <input
                  type="text"
                  placeholder="Ex: CDB Banco XP 110% CDI, FII MXRF11, Tesouro IPCA+ 2035..."
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
                    Classe de Ativo
                  </label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
                  >
                    <option value="Caixa">Caixa / Renda Fixa</option>
                    <option value="Ações">Ações</option>
                    <option value="Real Estate">FIIs (Real Estate)</option>
                    <option value="Internacional">Internacional / Global</option>
                    <option value="Cripto">Criptomoedas</option>
                    <option value="Reserva Emergência">Reserva de Emergência</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block mb-1">
                    Corretora / Banco
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: XP, BTG, Itaú Íon, B3..."
                    value={newAssetBroker}
                    onChange={(e) => setNewAssetBroker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--capital-muted,#242a2e)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] text-xs font-bold shadow-xs"
                >
                  Salvar Ativo e Vincular
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer com Botão de Confirmação */}
        <div className="p-4 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] flex items-center justify-between">
          <div className="text-xs text-[var(--capital-muted,#242a2e)]">
            {selectedAsset ? (
              <span>Ativo Selecionado: <strong className="text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">{selectedAsset.name}</strong></span>
            ) : (
              <span>Selecione um ativo para vincular</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedAsset}
              onClick={handleConfirm}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedAsset
                  ? currentAction === 'APORTE'
                    ? 'bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] shadow-md shadow-none'
                    : 'bg-amber-500 hover:bg-amber-400 text-[var(--capital-button-text,#242a2e)] shadow-md shadow-none'
                  : 'bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-muted,#242a2e)] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {currentAction === 'APORTE' ? 'Confirmar Aplicação no Ativo' : 'Confirmar Resgate do Ativo'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
