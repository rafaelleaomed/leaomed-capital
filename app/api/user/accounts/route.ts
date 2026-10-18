import { NextResponse } from 'next/server'
import { sql } from '@/utils/db'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/accounts
 * Lista todas as contas cadastradas do usuário logado.
 */
export async function GET() {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId) {
    return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const rows = await sql`
      SELECT id, name, institution, type, pluggy_account_id, created_at
      FROM public.accounts
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `
    return NextResponse.json({ success: true, accounts: rows }, {
      headers: { 'Cache-Control': 'private, no-store' }
    })
  } catch (error: any) {
    console.error('[API /api/user/accounts GET] Erro:', error)
    return NextResponse.json({ success: false, error: 'Falha ao buscar contas.' }, { status: 500 })
  }
}

/**
 * POST /api/user/accounts
 * Adiciona uma nova conta bancária para o usuário logado.
 */
export async function POST(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId) {
    return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const institution = typeof body?.institution === 'string' ? body.institution.trim() : 'Instituição Financeira'
    const type = body?.type === 'PJ' ? 'PJ' : 'PF'

    if (!name) {
      return NextResponse.json({ success: false, error: 'O nome da conta é obrigatório.' }, { status: 400 })
    }

    const pluggyAccountId = `manual_${type.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const rows = await sql`
      INSERT INTO public.accounts (user_id, name, institution, type, pluggy_account_id)
      VALUES (${userId}, ${name}, ${institution}, ${type}, ${pluggyAccountId})
      RETURNING id, name, institution, type, pluggy_account_id
    `

    return NextResponse.json({ success: true, account: rows[0] })
  } catch (error: any) {
    console.error('[API /api/user/accounts POST] Erro:', error)
    return NextResponse.json({ success: false, error: 'Falha ao criar conta bancária.' }, { status: 500 })
  }
}

/**
 * DELETE /api/user/accounts?id=UUID
 * Remove uma conta cadastrada pelo usuário.
 */
export async function DELETE(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId) {
    return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da conta é obrigatório.' }, { status: 400 })
    }

    await sql`
      DELETE FROM public.accounts
      WHERE id = ${id} AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API /api/user/accounts DELETE] Erro:', error)
    return NextResponse.json({ success: false, error: 'Falha ao remover conta.' }, { status: 500 })
  }
}
