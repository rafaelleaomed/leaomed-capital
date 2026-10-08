export interface InstallmentContract {
  id: string
  title: string
  account: string
  category: string
  scope: 'PF' | 'PJ'
  kind: 'credit-card' | 'loan' | 'recurring'
  amountCents: number
  firstBillingMonth: string
  totalInstallments?: number
  status: 'active' | 'cancelled' | 'settled'
  reviewed: boolean
}

export function monthNumber(month: string): number {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    // Fallback gracioso para data ISO
    if (month && month.length >= 7) {
      const slice = month.slice(0, 7)
      if (/^\d{4}-(0[1-9]|1[0-2])$/.test(slice)) {
        const [y, v] = slice.split('-').map(Number)
        return y * 12 + v - 1
      }
    }
    const now = new Date()
    return now.getFullYear() * 12 + now.getMonth()
  }
  const [year, value] = month.split('-').map(Number)
  return year * 12 + value - 1
}

export function addMonths(month: string, count: number): string {
  const value = monthNumber(month) + count
  return `${Math.floor(value / 12)}-${String((value % 12) + 1).padStart(2, '0')}`
}

export function currentMonthInSaoPaulo(now = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit'
    }).formatToParts(now)
    const year = parts.find(p => p.type === 'year')?.value || String(now.getFullYear())
    const month = parts.find(p => p.type === 'month')?.value || String(now.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  } catch (_) {
    return now.toISOString().slice(0, 7)
  }
}

export function monthLabel(month: string): string {
  try {
    const safeMonth = month.length === 7 ? month : month.slice(0, 7)
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${safeMonth}-15T12:00:00Z`))
  } catch (_) {
    return month
  }
}

export function lastBillingMonth(contract: InstallmentContract): string | null {
  if (
    contract.kind === 'recurring' ||
    !contract.firstBillingMonth ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(contract.firstBillingMonth.slice(0, 7)) ||
    !Number.isSafeInteger(contract.totalInstallments) ||
    (contract.totalInstallments ?? 0) <= 0
  ) {
    return null
  }
  return addMonths(contract.firstBillingMonth.slice(0, 7), contract.totalInstallments! - 1)
}

export function reliefForMonth(
  contracts: InstallmentContract[],
  month: string,
  scope: 'PF' | 'PJ' = 'PF'
) {
  const safeMonth = month.slice(0, 7)
  const unique = [...new Map(contracts.map(contract => [contract.id, contract])).values()]
  const scoped = unique.filter(
    contract => contract.scope === scope && contract.kind === 'credit-card' && contract.status === 'active'
  )

  const hasValidAmount = (contract: InstallmentContract) =>
    Number.isSafeInteger(contract.amountCents) && contract.amountCents > 0

  const incomplete = scoped.filter(
    contract => !hasValidAmount(contract) || !lastBillingMonth(contract)
  ).length

  const items = scoped.filter(
    contract => hasValidAmount(contract) && lastBillingMonth(contract) === safeMonth
  )

  const amountCents = items.reduce((total, item) => total + item.amountCents, 0)
  const unreviewed = items.filter(item => !item.reviewed).length

  return {
    month: safeMonth,
    startsIn: addMonths(safeMonth, 1),
    items,
    amountCents,
    unreviewed,
    incomplete
  }
}

export function remainingAfterMonth(contract: InstallmentContract, month: string): number | null {
  const end = lastBillingMonth(contract)
  if (!end || contract.status !== 'active') return null
  const remaining = Math.min(
    contract.totalInstallments!,
    Math.max(0, monthNumber(end) - monthNumber(month))
  )
  return remaining * contract.amountCents
}

const PT_MONTHS_MAP: Record<string, number> = {
  'janeiro': 0, 'fevereiro': 1, 'março': 2, 'marco': 2, 'abril': 3,
  'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7, 'setembro': 8,
  'outubro': 9, 'novembro': 10, 'dezembro': 11
}

export function convertInstallmentItemsToContracts(items: any[]): InstallmentContract[] {
  if (!Array.isArray(items)) return []

  return items.map(item => {
    let endMonthISO = ''
    if (item.endMonthYear && typeof item.endMonthYear === 'string') {
      const match = item.endMonthYear.toLowerCase().match(/([a-zç]+)\/(\d{4})/)
      if (match) {
        const mIdx = PT_MONTHS_MAP[match[1]]
        if (mIdx !== undefined) {
          endMonthISO = `${match[2]}-${String(mIdx + 1).padStart(2, '0')}`
        }
      }
    }

    let firstBillingMonth = item.startDate ? item.startDate.slice(0, 7) : ''
    const totalInst = item.totalInstallments && Number.isSafeInteger(item.totalInstallments) ? item.totalInstallments : 1
    if (!firstBillingMonth && endMonthISO && totalInst > 1) {
      firstBillingMonth = addMonths(endMonthISO, -(totalInst - 1))
    }

    const payMethod = (item.paymentMethod || '').toLowerCase()
    const isLoan = payMethod.includes('financiamento') || payMethod.includes('safra') || item.category === 'Financiamento' || item.subcategory?.includes('Financiamento')
    const isRecurring = Boolean(item.isPerpetual) || item.endMonthYear === 'Mensal Contínuo'
    const isCreditCard = !isLoan && !isRecurring

    return {
      id: item.id || `contract-${Math.random()}`,
      title: item.name || 'Contrato',
      account: item.paymentMethod || 'Cartão',
      category: item.category || 'Geral',
      scope: (item.entityType === 'PJ' ? 'PJ' : 'PF') as 'PF' | 'PJ',
      kind: isRecurring ? 'recurring' : (isLoan ? 'loan' : 'credit-card'),
      amountCents: Math.round((Math.abs(item.monthlyValue) || 0) * 100),
      firstBillingMonth: firstBillingMonth || '2026-01',
      totalInstallments: isRecurring ? undefined : totalInst,
      status: 'active' as const,
      reviewed: true
    }
  })
}

