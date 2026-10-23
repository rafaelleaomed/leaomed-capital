import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de sessão Supabase.
 *
 * OBRIGATÓRIO para o @supabase/ssr funcionar corretamente no Next.js App Router.
 * Sem este arquivo, a sessão OAuth não é propagada entre o callback e os Server Components,
 * causando redirect silencioso de volta ao /login após o Google Login.
 *
 * Responsabilidades:
 * 1. Ler os cookies de sessão do request (access token, refresh token)
 * 2. Validar / renovar automaticamente o token expirado
 * 3. Escrever os cookies atualizados na response (necessário para SSR)
 * 4. Redirecionar para /login quando não há sessão válida em rotas protegidas
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Atualiza o request (para Server Components lerem no mesmo ciclo)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 2. Cria nova response com o request atualizado
          supabaseResponse = NextResponse.next({ request });
          // 3. Escreve os cookies na response (para o browser os armazenar)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: não coloque lógica entre createServerClient e getUser().
  // Qualquer await aqui pode causar bugs de sessão difíceis de depurar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas públicas — nunca redirecionar para login
  const isPublicPath =
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname);

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('error', 'session_expired');
    return NextResponse.redirect(loginUrl);
  }

  // IMPORTANTE: sempre retorne supabaseResponse (contém os cookies atualizados).
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Executa em todas as rotas exceto arquivos estáticos e imagens do Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
