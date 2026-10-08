import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cria um cliente Supabase autenticado para uso em Server Components e Route Handlers.
 * Lê a sessão do usuário a partir dos cookies HTTP-only (seguro contra XSS).
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Server] Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias.');
    return null;
  }

  try {
    const cookieStore = await cookies();

    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,

      {
        cookieOptions: {
          maxAge: 60 * 60 * 24 * 365,
          path: '/',
          sameSite: 'lax',
        },
        cookies: {
          getAll() {
            try {
              return cookieStore.getAll();
            } catch {
              return [];
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, {
                  ...options,
                  maxAge: 60 * 60 * 24 * 365,
                  path: '/',
                  sameSite: 'lax',
                });
              });
            } catch {
              // Server Component — ignorar erros de cookie set (só ocorre em RSC)
            }
          },
        },
      }
    );
  } catch (err) {
    console.error('[Supabase Server] Falha ao inicializar cliente:', err);
    return null;
  }
}

/**
 * Retorna o usuário autenticado atual ou null se não estiver logado.
 * 100% blindado contra erros de runtime para evitar telas de 500 no Next.js.
 */
export async function getAuthenticatedUser() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    
    return user;
  } catch (err) {
    console.error('[Supabase Server] Erro ao recuperar sessão do usuário:', err);
    return null;
  }
}
