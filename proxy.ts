import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano de persistência

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  to.headers.set('Cache-Control', 'private, no-store, max-age=0');
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, {
      ...cookie,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    });
  });
  return to;
}

/**
 * Proxy/Middleware de autenticação Next.js
 * Garante sessão 100% persistente (365 dias) sem desconectar ao fechar navegador:
 * - Renova token de sessão de forma transparente (sliding session)
 * - Encaminha cookies atualizados em TODOS os redirects (evita logout involuntário)
 * - Roteia raiz (/) imediatamente para /dashboard se logado, ou /login se deslogado
 * - Protege /dashboard/* e /api/*
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPrivate = pathname.startsWith('/dashboard') || (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/webhooks/') && !pathname.startsWith('/api/internal/'));
  const privateResponse = (result: NextResponse) => {
    if (isPrivate) {
      result.headers.set('Cache-Control', 'private, no-store, max-age=0');
      result.headers.set('Vary', 'Cookie');
    }
    return result;
  };
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Authentication unavailable');
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookieOptions: {
          maxAge: COOKIE_MAX_AGE,
          path: '/',
          sameSite: 'lax',
        },
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, {
                ...options,
                maxAge: COOKIE_MAX_AGE,
                path: '/',
                sameSite: 'lax',
              })
            );
          },
        },
      }
    );

    // Renova a sessão (importante para tokens JWT expirando)
    const {
      data: { user: authenticatedUser }, error,
    } = await supabase.auth.getUser();
    const user = error ? null : authenticatedUser;


    // Se o usuário já está logado e acessa a raiz (/), vai direto ao dashboard preservando cookies
    if (pathname === '/' && user) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return copyCookies(response, NextResponse.redirect(dashboardUrl));
    }

    // Se o usuário não está logado e acessa a raiz (/), vai para login preservando cookies
    if (pathname === '/' && !user) {
      const loginUrl = new URL('/login', request.url);
      return copyCookies(response, NextResponse.redirect(loginUrl));
    }

    // Usuário logado tentando acessar /login ou /cadastro — redireciona para dashboard
    if ((pathname === '/login' || pathname === '/cadastro') && user) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return copyCookies(response, NextResponse.redirect(dashboardUrl));
    }

    // Rotas públicas
    const isPublic =
      pathname === '/login' ||
      pathname === '/cadastro' ||
      pathname === '/demo' ||
      pathname.startsWith('/demo/') ||
      pathname.startsWith('/api/auth/') ||
      pathname.startsWith('/api/webhooks/');

    // Rotas protegidas — exige sessão válida
    const isProtected =
      pathname.startsWith('/dashboard') ||
      (pathname.startsWith('/api/') && !isPublic);

    if (isProtected && !user) {
      if (pathname.startsWith('/api/')) {
        return copyCookies(
          response,
          NextResponse.json(
            { success: false, error: 'Não autorizado. Autentique-se para acessar este recurso.' },
            { status: 401 }
          )
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return copyCookies(response, NextResponse.redirect(loginUrl));
    }

  } catch (e) {
    console.error('[Proxy Middleware] Autenticação indisponível');
    if (isPrivate) {
      return privateResponse(NextResponse.json(
        { success: false, error: 'Não foi possível validar a sessão. Tente novamente.' },
        { status: 503 }
      ));
    }
  }

  return privateResponse(response);
}

export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas exceto:
     * - Arquivos estáticos (_next/static, _next/image, favicon)
     * - Assets públicos (imagens, fontes, manifest, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
