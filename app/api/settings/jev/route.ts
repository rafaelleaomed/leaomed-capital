import { NextResponse } from 'next/server'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { deletePersonalJevKey, getJevAccessStatusForUser, savePersonalJevKey } from '@/services/userJevAccess'

export const dynamic = 'force-dynamic'

const attempts = new Map<string, number[]>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 3

function allowCredentialUpdate(userId: string): boolean {
  const now = Date.now()
  const recent = (attempts.get(userId) || []).filter(timestamp => now - timestamp < WINDOW_MS)
  if (recent.length >= MAX_ATTEMPTS) return false
  recent.push(now)
  attempts.set(userId, recent)
  return true
}

async function validateTypesafeKey(apiKey: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(process.env.TYPESAFE_API_ENDPOINT || 'https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.TYPESAFE_MODEL || 'jev-latest',
        state: { verification: 'synthetic' },
        questions: {
          valid: {
            type: 'choice',
            instructions: 'Select the only valid option.',
            criteria: { ok: 'The only permitted answer.' }
          }
        }
      }),
      signal: controller.signal
    })
    return response.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId || !user) return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  const status = await getJevAccessStatusForUser({ id: userId, email: user.email })
  return NextResponse.json({ success: true, status: { enabled: status.enabled, source: status.source, acceptsPersonalKey: status.acceptsPersonalKey } })
}

export async function PUT(req: Request) {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId || !user) return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  if (!allowCredentialUpdate(userId)) return NextResponse.json({ success: false, error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' }, { status: 429 })

  try {
    const body = await req.json()
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey : ''
    if (apiKey.length < 16 || apiKey.length > 512 || /\s/.test(apiKey)) {
      return NextResponse.json({ success: false, error: 'Chave da API inválida.' }, { status: 400 })
    }
    const status = await getJevAccessStatusForUser({ id: userId, email: user.email })
    if (!status.acceptsPersonalKey) return NextResponse.json({ success: false, error: 'Esta conta usa a credencial protegida da plataforma.' }, { status: 403 })
    if (!await validateTypesafeKey(apiKey)) return NextResponse.json({ success: false, error: 'A chave não foi validada pelo TypeSafe. Verifique e tente novamente.' }, { status: 422 })
    await savePersonalJevKey({ id: userId, email: user.email }, apiKey)
    return NextResponse.json({ success: true, status: { enabled: true, source: 'user_managed', acceptsPersonalKey: true } })
  } catch {
    return NextResponse.json({ success: false, error: 'Não foi possível salvar a credencial. Verifique a configuração do servidor.' }, { status: 500 })
  }
}

export async function DELETE() {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId || !user) return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  const status = await getJevAccessStatusForUser({ id: userId, email: user.email })
  if (!status.acceptsPersonalKey) return NextResponse.json({ success: false, error: 'Esta conta usa a credencial protegida da plataforma.' }, { status: 403 })
  try {
    await deletePersonalJevKey({ id: userId })
    return NextResponse.json({ success: true, status: { enabled: false, source: 'disabled', acceptsPersonalKey: true } })
  } catch {
    return NextResponse.json({ success: false, error: 'Não foi possível remover a credencial.' }, { status: 500 })
  }
}
