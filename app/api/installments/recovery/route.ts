import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { canRecoverLegacyInstallments } from '@/services/installmentPersistence'
import { isInstallmentBackup, persistAuthenticatedInstallmentBackup } from '@/services/installmentBackupPersistence'

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
    if (!isInstallmentBackup(body.installments)) {
      return NextResponse.json({ success: false, error: 'Dados de recuperação inválidos.' }, { status: 400, headers: privateHeaders })
    }
    const mappings = await persistAuthenticatedInstallmentBackup(userId, user!.email!, body.installments)
    return NextResponse.json({ success: true, mappings }, { headers: privateHeaders })
  } catch {
    return NextResponse.json({ success: false, error: 'Não foi possível recuperar os parcelamentos. O cache original foi preservado.' }, { status: 500, headers: privateHeaders })
  }
}
