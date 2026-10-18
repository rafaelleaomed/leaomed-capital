import { sql } from '@/utils/db'
import { installmentDates, isRecoverableInstallment, legacyInstallmentId } from '@/services/installmentPersistence'
import { installmentEndDate } from '@/utils/installmentStore'
import type { InstallmentItem } from '@/utils/installmentStore'

export function isInstallmentBackup(value: unknown): value is InstallmentItem[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 300 && value.every(isRecoverableInstallment)
}

/** Caller must obtain userId and email from the authenticated server session. */
export async function persistAuthenticatedInstallmentBackup(userId: string, email: string, items: InstallmentItem[]) {
    await sql`INSERT INTO public.users (id, email) VALUES (${userId}, ${email.trim().toLowerCase()}) ON CONFLICT (id) DO NOTHING`
    const mappings: { legacyId: string; id: string }[] = []
    for (const item of items) {
      const id = legacyInstallmentId(userId, item.id)
      const dates = installmentDates(item.currentInstallment, item.totalInstallments, item.startDate, installmentEndDate(item))
      // A recovered record may have been edited or deleted since the first
      // recovery. Its stable ID takes precedence over the old cached schedule.
      const findExisting = () => sql`
        SELECT id, is_active FROM public.installments
        WHERE user_id = ${userId} AND (
          id = ${id}::uuid OR (
            description = ${item.name} AND installment_amount = ${item.monthlyValue}
            AND payment_method = ${item.paymentMethod} AND total_installments = ${item.totalInstallments}
            AND start_date = ${dates.start}::date AND end_date = ${dates.end}::date
          )
        )
        ORDER BY CASE WHEN id = ${id}::uuid THEN 0 ELSE 1 END, is_active DESC
        LIMIT 1
      `
      const prior = await findExisting()
      if (prior[0]) {
        if (prior[0].is_active) mappings.push({ legacyId: item.id, id: String(prior[0].id) })
        continue
      }
      const rows = await sql`
        INSERT INTO public.installments (id, user_id, description, category, subcategory, total_installments, current_installment, installment_amount, payment_method, start_date, end_date)
        SELECT ${id}::uuid, ${userId}::uuid, ${item.name}, ${item.category || 'Outros'}, ${item.subcategory || 'Geral'}, ${item.totalInstallments}, ${item.currentInstallment}, ${item.monthlyValue}, ${item.paymentMethod}, ${dates.start}::date, ${dates.end}::date
        WHERE NOT EXISTS (SELECT 1 FROM public.installments WHERE user_id = ${userId} AND description = ${item.name} AND installment_amount = ${item.monthlyValue} AND payment_method = ${item.paymentMethod} AND total_installments = ${item.totalInstallments} AND start_date = ${dates.start}::date AND end_date = ${dates.end}::date)
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `
      if (rows[0]) mappings.push({ legacyId: item.id, id: String(rows[0].id) })
      else {
        const existing = await findExisting()
        if (existing[0]?.is_active) mappings.push({ legacyId: item.id, id: String(existing[0].id) })
      }
    }

    return mappings
}
