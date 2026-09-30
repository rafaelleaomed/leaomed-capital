import { createSupabaseServerClient } from '@/utils/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Rota de callback OAuth (Google) e Magic Link / Confirmação do Supabase.
 * Troca o código de autorização por uma sessão válida nos cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  // Determina o host público correto (Vercel ou custom domain)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost 
    ? `${forwardedProto}://${forwardedHost}` 
    : (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin);

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.session) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (error) {
        console.error('Erro ao trocar código por sessão no Supabase:', error.message);
      }
    } catch (e) {
      console.error('Exceção no auth callback:', e);
    }
  }

  // Fallback: redireciona para login com mensagem clara
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
