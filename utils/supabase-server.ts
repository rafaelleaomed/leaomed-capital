import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const DEFAULT_SUPABASE_URL = 'https://matwnfjaopdiwnmimweo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHduZmphb3BkaXdubWltd2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTk4OTUsImV4cCI6MjEwNjEzNTg5NX0.LfyoTG1HI2Ae8kX2QMtNpez3moodA9uRf7uTFCNrP3k';

/**
 * Cria um cliente Supabase autenticado para uso em Server Components e Route Handlers.
 * Lê a sessão do usuário a partir dos cookies HTTP-only (seguro contra XSS).
 */
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const cookieStore = await cookies();

    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
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
                cookieStore.set(name, value, options);
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
