// The authenticated session boundary sets this from the server-validated user ID.
// Never infer ownership from email, a legacy cache, or browser profile metadata.
let financialUserId: string | null = null
let scopeVersion = 0

export function setFinancialUserScope(userId: string | null): void {
  const next = userId?.trim() || null
  if (next === financialUserId) return
  financialUserId = next
  scopeVersion++
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('leaomed_financial_scope_changed'))
  }
}

export function getFinancialUserScope(): string | null {
  return financialUserId
}

export function getFinancialScopeVersion(): number {
  return scopeVersion
}

function scopedKey(key: string): string | null {
  if (typeof window === 'undefined' || !financialUserId) return null
  return `leaomed_scoped_v1:${encodeURIComponent(financialUserId)}:${key}`
}

// Legacy unscoped data is intentionally not read or migrated: its owner is unknown.
export const financialStorage = {
  getItem(key: string): string | null {
    const scoped = scopedKey(key)
    if (!scoped) return null
    try { return window.localStorage.getItem(scoped) } catch { return null }
  },
  setItem(key: string, value: string): void {
    const scoped = scopedKey(key)
    if (!scoped) return
    try { window.localStorage.setItem(scoped, value) } catch {}
  },
  removeItem(key: string): void {
    const scoped = scopedKey(key)
    if (!scoped) return
    try { window.localStorage.removeItem(scoped) } catch {}
  }
}
