import { NextResponse } from 'next/server'
import { sql } from '@/utils/db'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { createSupabaseServerClient } from '@/utils/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/profile
 * Retorna os dados do perfil do usuário logado:
 * - nome, email, especialidade médica, CRM
 * - status de onboarding_completed
 * - contas bancárias cadastradas
 */
export async function GET() {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId || !user) {
    return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    // 1. Busca perfil na tabela public.users
    const userRows = await sql`
      SELECT id, email, name, specialty, crm, onboarding_completed
      FROM public.users
      WHERE id = ${userId}
    `
    const dbUser = userRows[0] || null

    // Fallbacks a partir dos metadados de autenticação do Supabase
    const meta = user.user_metadata || {}
    const email = user.email || dbUser?.email || ''
    const name = dbUser?.name || meta.full_name || meta.name || email.split('@')[0] || 'Usuário'
    const specialty = dbUser?.specialty || meta.specialty || ''
    const crm = dbUser?.crm || meta.crm || ''
    const onboardingCompleted = Boolean(dbUser?.onboarding_completed)

    // 2. Busca contas bancárias do usuário
    const accountRows = await sql`
      SELECT id, name, institution, type, pluggy_account_id
      FROM public.accounts
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `

    const accounts = (accountRows || []).map((acc: any) => ({
      id: acc.id,
      name: acc.name,
      institution: acc.institution,
      type: acc.type as 'PF' | 'PJ',
      pluggyAccountId: acc.pluggy_account_id
    }))

    return NextResponse.json({
      success: true,
      profile: {
        id: userId,
        email,
        name,
        specialty,
        crm,
        onboardingCompleted
      },
      accounts
    }, {
      headers: { 'Cache-Control': 'private, no-store' }
    })
  } catch (error: any) {
    console.error('[API /api/user/profile GET] Erro ao carregar perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar perfil do usuário.' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile
 * Atualiza os dados pessoais do perfil (nome, especialidade, CRM, onboarding_completed).
 * Sincroniza tanto no Neon Postgres quanto no Supabase Auth (user_metadata).
 */
export async function PUT(req: Request) {
  const { userId, user, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse || !userId || !user) {
    return errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined
    const specialty = typeof body?.specialty === 'string' ? body.specialty.trim() : undefined
    const crm = typeof body?.crm === 'string' ? body.crm.trim() : undefined
    const onboardingCompleted = typeof body?.onboardingCompleted === 'boolean' ? body.onboardingCompleted : undefined

    if (name && name.length > 255) {
      return NextResponse.json({ success: false, error: 'Nome muito longo (máx. 255 caracteres).' }, { status: 400 })
    }

    // 1. Atualizar ou inserir registro em public.users
    await sql`
      INSERT INTO public.users (id, email, name, specialty, crm, onboarding_completed)
      VALUES (
        ${userId},
        ${user.email || ''},
        ${name ?? null},
        ${specialty ?? null},
        ${crm ?? null},
        ${onboardingCompleted ?? false}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, public.users.name),
        specialty = COALESCE(EXCLUDED.specialty, public.users.specialty),
        crm = COALESCE(EXCLUDED.crm, public.users.crm),
        onboarding_completed = COALESCE(EXCLUDED.onboarding_completed, public.users.onboarding_completed);
    `

    // 2. Sincroniza metadados no Supabase Auth para consistência
    try {
      const supabase = await createSupabaseServerClient()
      if (supabase) {
        await supabase.auth.updateUser({
          data: {
            full_name: name || undefined,
            name: name || undefined,
            specialty: specialty || undefined,
            crm: crm || undefined,
            onboarding_completed: onboardingCompleted ?? undefined
          }
        })
      }
    } catch (authErr) {
      console.warn('[API /api/user/profile PUT] Aviso: falha ao atualizar user_metadata no Supabase:', authErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso!'
    })
  } catch (error: any) {
    console.error('[API /api/user/profile PUT] Erro:', error)
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar alterações do perfil.' },
      { status: 500 }
    )
  }
}
