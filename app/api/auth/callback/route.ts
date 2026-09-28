import { createSupabaseServerClient } from '@/utils/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Rota de callback OAuth e Magic Link do Supabase.
 * Troca o código de autorização por uma sessão válida.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Em caso de erro, redireciona para login com mensagem
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
