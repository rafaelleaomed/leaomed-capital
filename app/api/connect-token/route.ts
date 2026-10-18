import { NextResponse } from 'next/server';
import { PluggyClient } from 'pluggy-sdk';
import { getAuthenticatedUserId } from '@/utils/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { userId, errorResponse } = await getAuthenticatedUserId();
  if (errorResponse) return errorResponse;

  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, error: 'Serviço de Open Finance não configurado no servidor.' },
      { status: 503 }
    );
  }

  try {
    const pluggy = new PluggyClient({
      clientId,
      clientSecret,
    });

    // Prevenção contra IDOR/BOLA: força o clientUserId do usuário autenticado na sessão
    const connectToken = await pluggy.createConnectToken(undefined, {
      clientUserId: userId!,
    });

    return NextResponse.json({ success: true, accessToken: connectToken.accessToken });
  } catch (error) {
    console.error('Erro ao gerar connect token Pluggy:', error instanceof Error ? error.name : 'unknown_error');
    return NextResponse.json(
      { success: false, error: 'Falha ao iniciar conexão segura com o Open Finance.' },
      { status: 500 }
    );
  }
}
