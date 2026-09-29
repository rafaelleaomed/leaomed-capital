'use client'

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
export const DEFAULT_PORTFOLIO_ASSETS: PortfolioAsset[] = [
  { name: 'Tesouro Selic / Caixa', category: 'Caixa', broker: 'Custódia B3', invested: 30000.00, current: 33400.00, profit: 3400.00, profitPct: 11.33, operation: 'Comprado' },
  { name: 'CDB Liquidez Diária', category: 'Caixa', broker: 'Banco Primário', invested: 10000.00, current: 10450.00, profit: 450.00, profitPct: 4.50, operation: 'Comprado' },
  { name: 'Reserva de Emergência (Liquidez)', category: 'Reserva Emergência', broker: 'Conta Remunerada', invested: 32000.00, current: 33500.00, profit: 1500.00, profitPct: 4.69, operation: 'Comprado', isEmergencyReserve: true },
  { name: 'Ações Blue Chips (B3)', category: 'Ações', broker: 'Corretora Nacional', quantity: 1800, avgPrice: 14.00, currentPrice: 16.20, invested: 25200.00, current: 29160.00, profit: 3960.00, profitPct: 15.71, operation: 'Comprado' },
  { name: 'Ações Dividendos Brasil', category: 'Ações', broker: 'Corretora Nacional', quantity: 950, avgPrice: 6.00, currentPrice: 6.20, invested: 5700.00, current: 5890.00, profit: 190.00, profitPct: 3.33, operation: 'Comprado' },
  { name: 'FIIs Imobiliários Papel & Tijolo', category: 'Real Estate', broker: 'Corretora Nacional', quantity: 950, avgPrice: 21.00, currentPrice: 20.50, invested: 19950.00, current: 19475.00, profit: -475.00, profitPct: -2.38, operation: 'Comprado' },
  { name: 'ETF S&P 500 Global', category: 'Internacional', broker: 'Corretora Global', quantity: 250, avgPrice: 65.00, currentPrice: 78.50, invested: 16250.00, current: 19625.00, profit: 3375.00, profitPct: 20.77, operation: 'Comprado' },
  { name: 'ETF Renda Fixa Global (BNDX)', category: 'Internacional', broker: 'Corretora Global', quantity: 35, avgPrice: 280.00, currentPrice: 310.00, invested: 9800.00, current: 10850.00, profit: 1050.00, profitPct: 10.71, operation: 'Comprado' },
  { name: 'Bitcoin (BTC)', category: 'Cripto', broker: 'Custódia Fria', quantity: 0.08, avgPrice: 50000.00, currentPrice: 68500.00, invested: 4000.00, current: 5480.00, profit: 1480.00, profitPct: 37.00, operation: 'Comprado' },
  { name: 'Ethereum (ETH)', category: 'Cripto', broker: 'Custódia Fria', quantity: 0.5, avgPrice: 1200.00, currentPrice: 1350.00, invested: 600.00, current: 675.00, profit: 75.00, profitPct: 12.50, operation: 'Comprado' }
]

export class InvestmentPortfolioStore {
  static getAssets(): PortfolioAsset[] {
    if (typeof window === 'undefined') return DEFAULT_PORTFOLIO_ASSETS
    try {
      const stored = localStorage.getItem(ASSETS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (_) {}
    return DEFAULT_PORTFOLIO_ASSETS
  }

  static saveAssets(assets: PortfolioAsset[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets))
      window.dispatchEvent(new CustomEvent('leaomed_investments_updated', { detail: { assets } }))
    } catch (_) {}
  }

  static getMovements(): InvestmentMovementLog[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(MOVEMENTS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (_) {}
    return []
  }

  static logMovement(movement: InvestmentMovementLog): void {
    if (typeof window === 'undefined') return
    try {
      const list = this.getMovements()
      list.unshift(movement)
      localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(list))
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
