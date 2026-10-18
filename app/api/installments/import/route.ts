import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { isInstallmentBackup, persistAuthenticatedInstallmentBackup } from '@/services/installmentBackupPersistence'

export const dynamic = 'force-dynamic'
const privateHeaders = { 'Cache-Control': 'private, no-store' }

// Explicit user-selected backup import. This endpoint never reads browser
// caches, bundled defaults or server files, and grants no cross-user access.
export async function POST(req: Request) {
  const { user, userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse
  if (!userId || !user?.email) return NextResponse.json({ success: false, error: 'Identidade autenticada indisponível.' }, { status: 401, headers: privateHeaders })
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ success: false, error: 'Backup inválido.' }, { status: 400, headers: privateHeaders })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ success: false, error: 'Backup inválido.' }, { status: 400, headers: privateHeaders })
  const input = body as Record<string, unknown>
  if (input.expectedUserId !== userId || input.ownershipConfirmed !== true) {
    return NextResponse.json({ success: false, error: 'Confirme que o arquivo contém seus dados e que a sessão atual é a sua.' }, { status: 403, headers: privateHeaders })
  }
  if (!isInstallmentBackup(input.installments)) {
    return NextResponse.json({ success: false, error: 'Dados de parcelamentos inválidos. Envie entre 1 e 300 registros.' }, { status: 400, headers: privateHeaders })
  }
  try {
    const mappings = await persistAuthenticatedInstallmentBackup(userId, user.email, input.installments)
    return NextResponse.json({ success: true, mappings }, { headers: privateHeaders })
  } catch {
    return NextResponse.json({ success: false, error: 'Não foi possível importar o backup. O arquivo original foi preservado.' }, { status: 500, headers: privateHeaders })
  }
}
