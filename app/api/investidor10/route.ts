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
  const match = input.match(/\b(\d{5,})\b/)
  return match ? match[1] : null
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
        { configured: true, error: 'Falha ao buscar dados do Investidor10. Tente novamente mais tarde.' },
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
      { configured: false, error: 'Falha ao buscar carteira de investimentos.' },
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
  const { userId, errorResponse } = await getAuthenticatedUserId()
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
        { success: false, error: 'ID da carteira inválido. Use o link público da carteira ou apenas o número.' },
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
        { success: false, error: 'Carteira não encontrada no Investidor10. Verifique se o link está correto e se a carteira é pública.' },
        { status: 422 }
      )
    }

    // Verifica se o corpo contém dados válidos (não uma resposta de erro)
    const verifyData = await verifyRes.json()
    if (!verifyData?.equity && !verifyData?.applied) {
      return NextResponse.json(
        { success: false, error: 'Não foi possível confirmar os dados da carteira. Verifique se ela é pública.' },
        { status: 422 }
      )
    }

    // Salva o wallet_id no perfil do usuário (upsert seguro por user_id)
    await sql`
      INSERT INTO public.users (id, investidor10_wallet_id)
      VALUES (${userId}, ${walletId})
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
