import crypto from 'crypto'
import type { InstallmentItem } from '@/utils/installmentStore'

export function canRecoverLegacyInstallments(user: { id: string; email?: string | null; email_confirmed_at?: string | null } | null): boolean {
  if (!user) return false
  const ownerEmail = (process.env.JEV_PLATFORM_OWNER_EMAIL || '').trim().toLowerCase()
  const ownerId = (process.env.JEV_PLATFORM_OWNER_USER_ID || '').trim()
  return Boolean(ownerEmail && user.email?.trim().toLowerCase() === ownerEmail && (ownerId ? ownerId === user.id : user.email_confirmed_at))
}

export function legacyInstallmentId(userId: string, legacyId: string): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(['installment-recovery-v1', userId, legacyId])).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}

export function isRecoverableInstallment(value: unknown): value is InstallmentItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && item.id.length > 0 && item.id.length <= 200 &&
    typeof item.name === 'string' && item.name.trim().length > 0 && item.name.length <= 255 &&
    typeof item.category === 'string' && item.category.length <= 100 &&
    typeof item.paymentMethod === 'string' && item.paymentMethod.length <= 50 &&
    typeof item.endMonthYear === 'string' && item.endMonthYear.length <= 40 &&
    typeof item.monthlyValue === 'number' && Number.isFinite(item.monthlyValue) && item.monthlyValue >= 0 && item.monthlyValue < 1e10 &&
    Number.isInteger(item.currentInstallment) && Number.isInteger(item.totalInstallments) &&
    Number(item.currentInstallment) >= 1 && Number(item.totalInstallments) >= Number(item.currentInstallment) && Number(item.totalInstallments) <= 1200
}

export function installmentDates(current: number, total: number, start?: string, end?: string): { start: string; end: string } {
  const now = new Date()
  const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const from = new Date(month); from.setUTCMonth(from.getUTCMonth() - current + 1)
  const to = new Date(month); to.setUTCMonth(to.getUTCMonth() + total - current)
  const valid = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)))
  if (valid(end) && !valid(start)) {
    const final = new Date(`${end}T00:00:00Z`)
    from.setUTCFullYear(final.getUTCFullYear(), final.getUTCMonth() - total + 1, 1)
  }
  return { start: valid(start) ? start! : from.toISOString().slice(0, 10), end: valid(end) ? end! : to.toISOString().slice(0, 10) }
}
