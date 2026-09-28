import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Helper para Route Handlers: extrai o userId autenticado da sessão.
 * Retorna { userId, errorResponse } — se errorResponse não for null, retorne-o imediatamente.
 *
 * Exemplo de uso em route.ts:
 *   const { userId, errorResponse } = await getAuthenticatedUserId();
 *   if (errorResponse) return errorResponse;
 */
export async function getAuthenticatedUserId(): Promise<{
  userId: string | null;
  errorResponse: NextResponse | null;
}> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      errorResponse: NextResponse.json(
        { success: false, error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      ),
    };
  }

  return { userId: user.id, errorResponse: null };
}
