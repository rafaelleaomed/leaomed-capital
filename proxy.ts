import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware de autenticação Next.js
 * - Protege /dashboard/* e /api/* (exceto /api/auth/* e /api/webhooks/*)
 * - Redireciona não autenticados para /login
 * - Renova o token de sessão em cada request (sliding session)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  return response;
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas exceto:
     * - Arquivos estáticos (_next/static, _next/image, favicon)
     * - Assets públicos (imagens, fontes, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
