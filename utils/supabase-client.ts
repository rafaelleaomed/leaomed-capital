'use client';

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

const DEFAULT_SUPABASE_URL = 'https://matwnfjaopdiwnmimweo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHduZmphb3BkaXdubWltd2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTk4OTUsImV4cCI6MjEwNjEzNTg5NX0.LfyoTG1HI2Ae8kX2QMtNpez3moodA9uRf7uTFCNrP3k';

/**
 * Singleton do cliente Supabase para uso em Client Components.
 * Reutiliza a mesma instância para evitar múltiplas conexões e previne crashes caso as variáveis de ambiente não tenham sido injetadas na build.
 */
export function createSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    client = createBrowserClient(url, key);
  } catch (e) {
    console.error('[Supabase Browser] Erro ao inicializar cliente Supabase no navegador:', e);
    client = createBrowserClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);
  }

  return client;
}
