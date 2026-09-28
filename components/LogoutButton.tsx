'use client';

import { createSupabaseBrowserClient } from '@/utils/supabase-client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={className ?? 'flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm'}
      title="Sair da conta"
    >
      <LogOut className="w-4 h-4" />
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
}
