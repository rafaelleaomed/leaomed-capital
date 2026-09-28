import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cria um cliente Supabase autenticado para uso em Server Components e Route Handlers.
 * Lê a sessão do usuário a partir dos cookies HTTP-only (seguro contra XSS).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component — ignorar erros de cookie set (só ocorre em RSC)
          }
        },
      },
    }
  );
}

/**
 * Retorna o usuário autenticado atual ou null se não estiver logado.
 * Use em Server Components para proteger dados sensíveis.
 */
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
