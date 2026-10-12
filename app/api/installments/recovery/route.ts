import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { sql } from '@/utils/db'
import { canRecoverLegacyInstallments, installmentDates, isRecoverableInstallment, legacyInstallmentId } from '@/services/installmentPersistence'
import { installmentEndDate } from '@/utils/installmentStore'

export const dynamic = 'force-dynamic'
const privateHeaders = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  const { user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse
  return NextResponse.json({ success: true, eligible: canRecoverLegacyInstallments(user), userId: user?.id, email: user?.email }, { headers: privateHeaders })
}

export async function POST(req: Request) {
  const { user, userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse
  if (!userId || !canRecoverLegacyInstallments(user)) return NextResponse.json({ success: false, error: 'Recuperação indisponível para esta conta.' }, { status: 403, headers: privateHeaders })
  try {
    const body = await req.json()
    if (body.expectedUserId && body.expectedUserId !== userId) return NextResponse.json({ success: false, error: 'A sessão de recuperação mudou.' }, { status: 403, headers: privateHeaders })
    if (!Array.isArray(body.installments) || body.installments.length > 300 || !body.installments.every(isRecoverableInstallment)) {
      return NextResponse.json({ success: false, error: 'Dados de recuperação inválidos.' }, { status: 400, headers: privateHeaders })
    }
    await sql`INSERT INTO public.users (id, email) VALUES (${userId}, ${user!.email!.trim().toLowerCase()}) ON CONFLICT (id) DO NOTHING`
    const mappings: { legacyId: string; id: string }[] = []
    for (const item of body.installments) {
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
    return NextResponse.json({ success: true, mappings }, { headers: privateHeaders })
  } catch {
    return NextResponse.json({ success: false, error: 'Não foi possível recuperar os parcelamentos. O cache original foi preservado.' }, { status: 500, headers: privateHeaders })
  }
}
