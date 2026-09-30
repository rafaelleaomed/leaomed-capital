import { createSupabaseServerClient } from '@/utils/supabase-server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Rota universal de callback OAuth (Google), Magic Link e Confirmação de E-mail do Supabase.
 * Troca o código de autorização ou token OTP por uma sessão válida persistida em cookies seguros.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  // Determina o host público correto (Vercel ou custom domain)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost 
    ? `${forwardedProto}://${forwardedHost}` 
    : (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin);

  // Se o Supabase retornou um erro explícito
  if (errorParam) {
    console.error(`[Auth Callback] Erro retornado pelo provedor: ${errorParam} - ${errorDescription}`);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || errorParam)}`);
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      console.error('[Auth Callback] Supabase Server Client não pôde ser instanciado');
      return NextResponse.redirect(`${origin}/login?error=auth_config_error`);
    }

    // 1. Fluxo OAuth / PKCE (Google Login ou link com ?code=...)
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.session) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (error) {
        console.error('[Auth Callback] Erro exchangeCodeForSession:', error.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }
    }

    // 2. Fluxo de Confirmação por Token Hash (?token_hash=...&type=signup|email|invite|recovery)
    if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });

      if (!error && data?.session) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (error) {
        console.error('[Auth Callback] Erro verifyOtp:', error.message);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }
    }
  } catch (e: any) {
    console.error('[Auth Callback] Exceção inesperada:', e);
    return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
  }

  // Fallback: se nenhum parâmetro de autorização for encontrado
  return NextResponse.redirect(`${origin}/login?error=missing_auth_parameters`);
}
