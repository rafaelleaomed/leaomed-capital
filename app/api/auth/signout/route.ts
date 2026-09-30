import { createSupabaseServerClient } from '@/utils/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('Erro ao deslogar:', err);
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const origin = forwardedHost 
    ? `${forwardedProto}://${forwardedHost}` 
    : (process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin);

  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}
