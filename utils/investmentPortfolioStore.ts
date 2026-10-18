'use client'

import { financialStorage, getFinancialUserScope } from './userScopedStorage'

export interface PortfolioAsset {
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
  lastMovementDate?: string
}

export interface InvestmentMovementLog {
  id: string
  assetName: string
  type: 'APORTE' | 'RESGATE'
  amount: number
  date: string
  notes?: string
}

const ASSETS_STORAGE_KEY = 'leaomed_portfolio_assets_v2'
const MOVEMENTS_STORAGE_KEY = 'leaomed_portfolio_movements_v2'

// Portfólio oficial conciliado
export const DEFAULT_PORTFOLIO_ASSETS: PortfolioAsset[] = []

export class InvestmentPortfolioStore {
  static getAssets(): PortfolioAsset[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = financialStorage.getItem(ASSETS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          return parsed
        }
      }
    } catch (_) {}
    return []
  }

  static saveAssets(assets: PortfolioAsset[]): void {
    if (typeof window === 'undefined' || !getFinancialUserScope()) return
    try {
      financialStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets))
      window.dispatchEvent(new CustomEvent('leaomed_investments_updated', { detail: { assets } }))
    } catch (_) {}
  }

  static getMovements(): InvestmentMovementLog[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = financialStorage.getItem(MOVEMENTS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (_) {}
    return []
  }

  static logMovement(movement: InvestmentMovementLog): void {
    if (typeof window === 'undefined' || !getFinancialUserScope()) return
    try {
      const list = this.getMovements()
      list.unshift(movement)
      financialStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(list))
    } catch (_) {}
  }

  /**
   * Aplicação em Investimento (Aporte)
   * Aumenta o valor investido e o saldo atual do ativo selecionado
   */
  static applyContribution(assetName: string, amount: number, date: string, notes?: string): PortfolioAsset {
    const assets = this.getAssets()
    const targetIdx = assets.findIndex(a => a.name.toLowerCase().trim() === assetName.toLowerCase().trim())

    const positiveAmount = Math.abs(amount)
    let updatedAsset: PortfolioAsset

    if (targetIdx >= 0) {
      const currentAsset = assets[targetIdx]
      const newInvested = currentAsset.invested + positiveAmount
      const newCurrent = currentAsset.current + positiveAmount
      const newProfit = newCurrent - newInvested
      const newProfitPct = newInvested > 0 ? (newProfit / newInvested) * 100 : 0

      updatedAsset = {
        ...currentAsset,
        invested: newInvested,
        current: newCurrent,
        profit: newProfit,
        profitPct: newProfitPct,
        lastMovementDate: date
      }
      assets[targetIdx] = updatedAsset
    } else {
      // Cria novo ativo se não existia
      updatedAsset = {
        name: assetName,
        category: 'Caixa',
        broker: 'Corretora Vinculada',
        invested: positiveAmount,
        current: positiveAmount,
        profit: 0,
        profitPct: 0,
        operation: 'Comprado',
        lastMovementDate: date
      }
      assets.push(updatedAsset)
    }

    this.saveAssets(assets)
    this.logMovement({
      id: `mov-${Date.now()}`,
      assetName,
      type: 'APORTE',
      amount: positiveAmount,
      date,
      notes
    })

    return updatedAsset
  }

  /**
   * Resgate de Investimento
   * Deduz do saldo atual do ativo selecionado
   */
  static applyRedemption(assetName: string, amount: number, date: string, notes?: string): PortfolioAsset | null {
    const assets = this.getAssets()
    const targetIdx = assets.findIndex(a => a.name.toLowerCase().trim() === assetName.toLowerCase().trim())

    if (targetIdx < 0) return null

    const currentAsset = assets[targetIdx]
    const positiveAmount = Math.abs(amount)

    const newCurrent = Math.max(0, currentAsset.current - positiveAmount)
    const newInvested = Math.max(0, currentAsset.invested - positiveAmount)
    const newProfit = newCurrent - newInvested
    const newProfitPct = newInvested > 0 ? (newProfit / newInvested) * 100 : 0

    const updatedAsset: PortfolioAsset = {
      ...currentAsset,
      current: newCurrent,
      invested: newInvested,
      profit: newProfit,
      profitPct: newProfitPct,
      lastMovementDate: date
    }

    assets[targetIdx] = updatedAsset
    this.saveAssets(assets)
    this.logMovement({
      id: `mov-${Date.now()}`,
      assetName,
      type: 'RESGATE',
      amount: positiveAmount,
      date,
      notes
    })

    return updatedAsset
  }

  static addCustomAsset(asset: PortfolioAsset): void {
    const assets = this.getAssets()
    assets.push(asset)
    this.saveAssets(assets)
  }
}
