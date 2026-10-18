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

export function getVerifiedOwnerLegacyTransactions(capability: OwnerRecoveryCapability): LegacyTransaction[] {
  if (!hasVerifiedLegacyOwner(capability) || financialStorage.getItem('leaomed_owner_transactions_recovery_v1')) return []
  const raw = window.localStorage.getItem('leaomed_granular_txs_user')
  if (!raw || raw.length > 10_000_000) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length > 25000) return []
    return parsed.filter((value): value is LegacyTransaction => Boolean(value && typeof value === 'object' &&
      typeof value.id === 'string' && typeof value.description === 'string' && value.description.trim() &&
      typeof value.amount === 'number' && Number.isFinite(value.amount) && value.amount !== 0 &&
      typeof value.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date)))
  } catch { return [] }
}
