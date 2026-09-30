import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://matwnfjaopdiwnmimweo.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHduZmphb3BkaXdubWltd2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTk4OTUsImV4cCI6MjEwNjEzNTg5NX0.LfyoTG1HI2Ae8kX2QMtNpez3moodA9uRf7uTFCNrP3k';

/**
 * Proxy/Middleware de autenticação Next.js
 * CRÍTICO: quando o arquivo se chama proxy.ts, Next.js exige exportar 'proxy', não 'middleware'
 * - Protege /dashboard/* e /api/* (exceto /api/auth/* e /api/webhooks/*)
 * - Redireciona não autenticados para /login
 * - Renova o token de sessão em cada request (sliding session)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Renova a sessão (importante para tokens JWT expirando)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Rotas públicas — nunca redirecionar
    const isPublic =
      pathname === '/login' ||
      pathname === '/cadastro' ||
      pathname === '/demo' ||
      pathname.startsWith('/demo/') ||
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/api/webhooks/') ||
      pathname === '/';

    // Rotas protegidas — exige sessão válida
    const isProtected =
      pathname.startsWith('/dashboard') ||
      (pathname.startsWith('/api/') && !isPublic);

    if (isProtected && !user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Não autorizado. Autentique-se para acessar este recurso.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Usuário logado tentando acessar /login — redireciona para dashboard
    if (pathname === '/login' && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (e) {
    console.error('[Proxy Middleware] Erro inesperado:', e);
    // Em caso de falha, deixa passar — o Server Component decidirá
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas exceto:
     * - Arquivos estáticos (_next/static, _next/image, favicon)
     * - Assets públicos (imagens, fontes, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
