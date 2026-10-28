import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/utils/db'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'

export const dynamic = 'force-dynamic'

const I10_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://investidor10.com.br/',
}

/**
 * Extrai o ID numérico de uma URL ou string do Investidor10.
 * Aceita: "1584990", "https://investidor10.com.br/wallet/public/1584990?h=null", etc.
 */
function extractWalletId(input: string): string | null {
  if (/^\d{5,15}$/.test(input)) return input

  try {
    const url = new URL(input)
    if (url.hostname !== 'investidor10.com.br' && url.hostname !== 'www.investidor10.com.br') return null
    const match = url.pathname.match(/\/wallet\/public\/(\d{5,15})(?:\/|$)/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

/**
 * GET /api/investidor10
 * Retorna os dados da carteira do Investidor10 do usuário autenticado.
 * O wallet_id é SEMPRE lido do perfil do usuário — nunca de query params ou corpo.
 */
export async function GET() {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    // Lê o wallet_id do perfil do usuário autenticado
    const rows = await sql`
      SELECT investidor10_wallet_id
      FROM public.users
      WHERE id = ${userId}
      LIMIT 1
    `
    const walletId: string | null = rows[0]?.investidor10_wallet_id ?? null

    if (!walletId) {
      return NextResponse.json({ configured: false }, {
        headers: { 'Cache-Control': 'private, no-store' }
      })
    }

    // Busca dados no Investidor10 em paralelo
    const [summaryRes, allocationRes] = await Promise.all([
      fetch(
        `https://investidor10.com.br/wallet/api/proxy/wallet-app/summary/metrics/${walletId}?type=without-earnings&raw=1`,
        { headers: I10_HEADERS, next: { revalidate: 0 } }
      ),
      fetch(
        `https://investidor10.com.br/wallet/api/proxy/wallet-app/summary/donutchart/${walletId}/all?groupBy=ticker`,
        { headers: I10_HEADERS, next: { revalidate: 0 } }
      ),
    ])

    if (!summaryRes.ok || !allocationRes.ok) {
      return NextResponse.json(
        { configured: null, error: 'Falha ao buscar dados do Investidor10. Tente novamente mais tarde.' },
        { status: 502, headers: { 'Cache-Control': 'private, no-store' } }
      )
    }

    const [summary, allocation] = await Promise.all([
      summaryRes.json(),
      allocationRes.json(),
    ])

    return NextResponse.json(
      { configured: true, summary, allocation },
      { headers: { 'Cache-Control': 'private, max-age=300' } }
    )
  } catch (error) {
    console.error('[GET /api/investidor10] Erro:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json(
      { configured: null, error: 'Falha ao buscar carteira de investimentos.' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } }
    )
  }
}

/**
 * POST /api/investidor10
 * Salva o wallet_id do Investidor10 no perfil do usuário autenticado.
 * Aceita o corpo: { walletUrl: string } — URL completa ou apenas o ID numérico.
 */
export async function POST(req: NextRequest) {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const body = await req.json()
    const walletUrl: string = typeof body?.walletUrl === 'string' ? body.walletUrl.trim() : ''

    if (!walletUrl) {
      return NextResponse.json(
        { success: false, error: 'Informe o link ou ID da carteira do Investidor10.' },
        { status: 400 }
      )
    }

    const walletId = extractWalletId(walletUrl)
    if (!walletId) {
      return NextResponse.json(
        { success: false, error: 'ID da carteira inválido. Use o link restrito/público da carteira ou apenas o número.' },
        { status: 400 }
      )
    }

    // Valida que o ID existe e responde na API do Investidor10
    const verifyRes = await fetch(
      `https://investidor10.com.br/wallet/api/proxy/wallet-app/summary/metrics/${walletId}?type=without-earnings&raw=1`,
      { headers: I10_HEADERS }
    )
    if (!verifyRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Carteira não encontrada. Verifique se o link está correto e se ela está como Restrita ou Pública.' },
        { status: 422 }
      )
    }

    // Verifica se o corpo contém dados válidos (não uma resposta de erro)
    const verifyData = await verifyRes.json()
    if (verifyData?.equity == null && verifyData?.applied == null) {
      return NextResponse.json(
        { success: false, error: 'Não foi possível confirmar os dados. Verifique se a carteira está como Restrita ou Pública.' },
        { status: 422 }
      )
    }

    if (!userId || !user?.email) {
      return NextResponse.json(
        { success: false, error: 'Identidade autenticada indisponível.' },
        { status: 401 }
      )
    }

    // Garante a identidade local e salva somente no registro do usuário autenticado.
    await sql`
      INSERT INTO public.users (id, email, investidor10_wallet_id)
      VALUES (${userId}, ${user.email.trim().toLowerCase()}, ${walletId})
      ON CONFLICT (id) DO UPDATE SET
        investidor10_wallet_id = EXCLUDED.investidor10_wallet_id
    `

    return NextResponse.json({ success: true, walletId })
  } catch (error) {
    console.error('[POST /api/investidor10] Erro:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar configuração da carteira.' },
      { status: 500 }
    )
  }
}
