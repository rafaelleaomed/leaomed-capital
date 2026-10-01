import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const DEFAULT_SUPABASE_URL = 'https://matwnfjaopdiwnmimweo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdHduZmphb3BkaXdubWltd2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTk4OTUsImV4cCI6MjEwNjEzNTg5NX0.LfyoTG1HI2Ae8kX2QMtNpez3moodA9uRf7uTFCNrP3k';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const cookieStore = await cookies()

    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            try {
              return cookieStore.getAll()
            } catch {
              return []
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Server Component - Cookies não podem ser definidos em render estático/RSC
            }
          },
        },
      }
    )
  } catch (err) {
    console.error('[Supabase Server] Falha ao criar cliente server:', err);
    return null;
  }
}
