'use client';

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Singleton do cliente Supabase para uso em Client Components.
 * Reutiliza a mesma instância e utiliza variáveis de ambiente com segurança.
 */
export function createSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      console.warn('[Supabase Browser] Variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas.');
    }
  }

  const cookieOptions = {
    maxAge: 60 * 60 * 24 * 365, // 1 ano (login persistente garantido)
    path: '/',
    sameSite: 'lax' as const,
  };

  const authOptions = {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  };

  try {
    client = createBrowserClient(url || '', key || '', {
      cookieOptions,
      auth: authOptions,
    });
  } catch (e) {
    console.error('[Supabase Browser] Erro ao inicializar cliente Supabase no navegador:', e);
    client = createBrowserClient('https://placeholder.supabase.co', 'placeholder', {
      cookieOptions,
      auth: authOptions,
    });
  }

  return client;
}

