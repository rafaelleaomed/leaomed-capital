'use client'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              currentAction === 'APORTE' 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
              {currentAction === 'APORTE' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base md:text-lg text-slate-900 dark:text-white leading-tight">
                  {currentAction === 'APORTE' ? 'Vincular Aplicação em Investimento' : 'Vincular Resgate de Investimento'}
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  currentAction === 'APORTE' 
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}>
                  {currentAction === 'APORTE' ? 'Aporte de Capital' : 'Resgate / Saída'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentAction === 'APORTE'
                  ? 'Selecione abaixo em qual ativo ou fundo este valor foi aplicado'
                  : 'Selecione abaixo de qual ativo ou fundo este valor foi retirado'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Valor da Operação */}
        <div className="px-5 py-3.5 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Valor da Operação:</span>
            <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
              R$ {absAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {transactionDescription && (
              <span className="text-[11px] text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-xs">
                {transactionDescription}
              </span>
            )}
          </div>

          {/* Toggle de Ação (Aporte vs Resgate) */}
          <div className="inline-flex rounded-xl p-1 bg-slate-200 dark:bg-slate-800 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setCurrentAction('APORTE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currentAction === 'APORTE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Aplicação (Aporte)
            </button>
            <button
              type="button"
              onClick={() => setCurrentAction('RESGATE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                currentAction === 'RESGATE'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar ativo por nome, classe ou corretora (ex: CDB, Tesouro, Ações, FIIs)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="px-3 py-2 rounded-xl border border-dashed border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Novo Ativo</span>
                </button>
              </div>

              {/* Grid / Lista de Ativos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredAssets.length === 0 ? (
                  <div className="col-span-2 py-8 text-center text-slate-400 text-xs">
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
                            ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 ring-2 ring-emerald-500/30 shadow-md'
                            : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate" title={asset.name}>
                              {asset.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 shrink-0">
                              {asset.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{asset.broker}</span>
                            <span>•</span>
                            <span className={asset.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {asset.profit >= 0 ? '+' : ''}{asset.profitPct.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Saldo Atual</span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                              R$ {asset.current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="text-right animate-in fade-in">
                              <span className="text-[10px] text-emerald-500 font-bold block">
                                {currentAction === 'APORTE' ? 'Saldo Projetado' : 'Saldo Restante'}
                              </span>
                              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
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
            <form onSubmit={handleCreateAndSelect} className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  Cadastrar Novo Ativo na Carteira
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Voltar à lista
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome do Ativo / Fundo
                </label>
                <input
                  type="text"
                  placeholder="Ex: CDB Banco XP 110% CDI, FII MXRF11, Tesouro IPCA+ 2035..."
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Classe de Ativo
                  </label>
                  <select
                    value={newAssetCategory}
                    onChange={(e) => setNewAssetCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
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
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Corretora / Banco
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: XP, BTG, Itaú Íon, B3..."
                    value={newAssetBroker}
                    onChange={(e) => setNewAssetBroker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  Salvar Ativo e Vincular
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer com Botão de Confirmação */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {selectedAsset ? (
              <span>Ativo Selecionado: <strong className="text-slate-900 dark:text-white">{selectedAsset.name}</strong></span>
            ) : (
              <span>Selecione um ativo para vincular</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
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
