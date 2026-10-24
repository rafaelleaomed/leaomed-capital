import { financialStorage, getFinancialUserScope } from './userScopedStorage'

export interface OwnerRecoveryCapability {
  eligible: boolean
  userId: string
  email: string
}

// This capability must come from the authenticated server, never browser metadata.
export function hasVerifiedLegacyOwner(capability: OwnerRecoveryCapability): boolean {
  if (typeof window === 'undefined' || !capability.eligible || capability.userId !== getFinancialUserScope()) return false
  const marker = window.localStorage.getItem('leaomed_current_user_email')?.trim().toLowerCase()
  return Boolean(marker && marker === capability.email?.trim().toLowerCase())
}

const LEGACY_KEYS = [
  'leaomed_credit_cards_v3', 'leaomed_portfolio_assets_v2', 'leaomed_portfolio_movements_v2',
  'leaomed_user_profile', 'leaomed_connected_accounts', 'leaomed_user_custom_setup',
  'leaomed_custom_budget_edits_v2', 'leaomed_deleted_budget_items', 'leaomed_pj_tax_history_v2',
  'leaomed_pj_uploaded_boletos', 'leaomed_categorization_rules', 'leaomed_custom_expense_categories',
  'leaomed_custom_income_categories', 'leaomed_custom_subcategories_map', 'leaomed_invest_target_pct',
] as const

/** Restore local-only settings after verifying both the owner and the legacy marker. */
export function recoverVerifiedOwnerCaches(capability: OwnerRecoveryCapability): number {
  if (!hasVerifiedLegacyOwner(capability)) return 0
  if (financialStorage.getItem('leaomed_owner_cache_recovery_v1')) return 0
  let recovered = 0
  let complete = true
  for (const key of LEGACY_KEYS) {
    const raw = window.localStorage.getItem(key)
    if (!raw || raw.length > 5_000_000) continue
    try {
      const legacy: unknown = JSON.parse(raw)
      const currentRaw = financialStorage.getItem(key)
      const current: unknown = currentRaw ? JSON.parse(currentRaw) : null
      if (current !== null && !(Array.isArray(current) && current.length === 0) &&
          !(typeof current === 'object' && !Array.isArray(current) && Object.keys(current).length === 0)) continue
      if (legacy === null) continue
      financialStorage.setItem(key, raw)
      if (financialStorage.getItem(key) === raw) recovered++
      else complete = false
    } catch { /* Keep malformed legacy data untouched for manual recovery. */ }
  }
  if (complete) financialStorage.setItem('leaomed_owner_cache_recovery_v1', 'complete')
  return recovered
}

export interface LegacyTransaction {
  id: string
  date: string
  description: string
  amount: number
  accountOrCard?: string
  entityType?: 'PF' | 'PJ'
  category?: string
  subcategory?: string
  isFixed?: boolean
  isIgnored?: boolean
}

const LEGACY_OWNER_TRANSACTION_KEYS = [
  'leaomed_granular_txs_user',
  'leaomed_granular_transactions_user',
  'leaomed_granular_transactions_v5',
  'leaomed_granular_transactions_v4',
  'leaomed_granular_transactions_v3',
  'leaomed_granular_transactions_v2',
  'leaomed_granular_txs',
] as const

export function getVerifiedOwnerLegacyTransactions(capability: OwnerRecoveryCapability): LegacyTransaction[] {
  // O marcador v1 cobria apenas uma chave. A geração v2 reabre a recuperação
  // para procurar todas as versões históricas; a API deduplica pelo hash da
  // transação e o marcador v2 impede novas tentativas após sucesso.
  if (!hasVerifiedLegacyOwner(capability) || financialStorage.getItem('leaomed_owner_transactions_recovery_v2')) return []

  const recovered = new Map<string, LegacyTransaction>()
  for (const key of LEGACY_OWNER_TRANSACTION_KEYS) {
    if (recovered.size >= 25000) break
    const raw = window.localStorage.getItem(key)
    if (!raw || raw.length > 10_000_000) continue
    try {
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) continue
      for (const value of parsed) {
        if (recovered.size >= 25000) break
        if (!value || typeof value !== 'object') continue
        const candidate = value as Partial<LegacyTransaction>
        if (typeof candidate.id !== 'string' || !candidate.id || recovered.has(candidate.id) ||
            typeof candidate.description !== 'string' || !candidate.description.trim() ||
            typeof candidate.amount !== 'number' || !Number.isFinite(candidate.amount) || candidate.amount === 0 ||
            typeof candidate.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.date)) continue
        recovered.set(candidate.id, candidate as LegacyTransaction)
      }
    } catch { /* Keep malformed legacy data untouched for manual recovery. */ }
  }
  return [...recovered.values()]
}
