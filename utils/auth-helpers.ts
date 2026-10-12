import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

type AuthenticatedUserResult = {
  userId: string | null;
  user: User | null;
  errorResponse: NextResponse | null;
};

export async function getAuthenticatedUserId(): Promise<AuthenticatedUserResult> {
  try {
    return await resolveAuthenticatedUserId();
  } catch {
    return {
      userId: null,
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Não foi possível validar a sessão.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } }
      ),
    };
  }
}

/**
 * Helper para Route Handlers: extrai o userId autenticado da sessão
 * e valida se o usuário possui autorização no ambiente pessoal.
 *
 * Retorna { userId, user, errorResponse } — se errorResponse não for null, retorne-o imediatamente.
 */
async function resolveAuthenticatedUserId(): Promise<AuthenticatedUserResult> {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      userId: null,
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Configuração de autenticação ausente no servidor.' },
        { status: 500 }
      ),
    };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch { /* ignorar em RSC */ }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      userId: null,
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      ),
    };
  }

  // Verificação de autorização estrita: se AUTHORIZED_USER_IDS ou AUTHORIZED_EMAILS estiver configurado,
  // restringe o acesso aos identificadores explicitamente autorizados
  const authorizedIds = (process.env.AUTHORIZED_USER_IDS || process.env.AUTHORIZED_USER_ID || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const authorizedEmails = (process.env.AUTHORIZED_EMAILS || process.env.AUTHORIZED_EMAIL || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const hasIdRestriction = authorizedIds.length > 0;
  const hasEmailRestriction = authorizedEmails.length > 0;

  if (hasIdRestriction || hasEmailRestriction) {
    const isIdAllowed = hasIdRestriction && authorizedIds.includes(user.id.toLowerCase());
    const userEmail = (user.email || '').toLowerCase();
    const isEmailAllowed = hasEmailRestriction && Boolean(userEmail) && authorizedEmails.includes(userEmail);

    if (!isIdAllowed && !isEmailAllowed) {
      return {
        userId: null,
        user: null,
        errorResponse: NextResponse.json(
          { success: false, error: 'Acesso restrito ao proprietário autorizado.' },
          { status: 403 }
        ),
      };
    }
  }

  return { userId: user.id, user, errorResponse: null };
}

/**
 * Valida se um usuário específico é o proprietário autorizado da plataforma.
 */
export function isUserAuthorized(user: { id: string; email?: string } | null | undefined): boolean {
  if (!user) return false;

  const authorizedIds = (process.env.AUTHORIZED_USER_IDS || process.env.AUTHORIZED_USER_ID || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const authorizedEmails = (process.env.AUTHORIZED_EMAILS || process.env.AUTHORIZED_EMAIL || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const hasIdRestriction = authorizedIds.length > 0;
  const hasEmailRestriction = authorizedEmails.length > 0;

  // Se não houver restrição explícita configurada no ambiente, considera autorizado se autenticado
  if (!hasIdRestriction && !hasEmailRestriction) {
    return true;
  }

  const isIdAllowed = hasIdRestriction && authorizedIds.includes(user.id.toLowerCase());
  const userEmail = (user.email || '').toLowerCase();
  const isEmailAllowed = hasEmailRestriction && Boolean(userEmail) && authorizedEmails.includes(userEmail);

  return isIdAllowed || isEmailAllowed;
}

