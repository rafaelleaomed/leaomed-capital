'use client';

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Singleton do cliente Supabase para uso em Client Components.
 * Reutiliza a mesma instância para evitar múltiplas conexões e previne crashes se variáveis estiverem ausentes.
 */
export function createSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://matwnfjaopdiwnmimweo.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

  try {
    client = createBrowserClient(url, key);
  } catch (e) {
    console.error('[Supabase Browser] Erro ao inicializar cliente Supabase no navegador:', e);
    client = createBrowserClient('https://matwnfjaopdiwnmimweo.supabase.co', 'dummy');
  }

  return client;
}
