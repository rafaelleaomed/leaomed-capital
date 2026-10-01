'use client'

import React, { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, LogIn, ChevronDown, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/utils/supabase-client'

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    console.error('[Dashboard ErrorBoundary] Erro capturado:', error)
  }, [error])

  const handleCleanReload = async () => {
    setIsResetting(true)
    try {
      // Se houver service worker corrompido, tenta atualizar
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        for (const reg of regs) {
          reg.update().catch(() => {})
        }
      }
    } catch (_) {}
    reset()
  }

  const handleSignOutAndLogin = async () => {
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.signOut()
    } catch (_) {}
    window.location.href = '/login'
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/5">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
          Atualização no Painel
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          Identificamos uma pequena oscilação ao carregar os dados financeiros ou atualizar o aplicativo. Toque abaixo para sincronizar.
        </p>

        {error?.message && (
          <div className="w-full text-left mb-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 font-mono">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-slate-300 font-semibold cursor-pointer"
            >
              <span>Detalhes técnicos</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            {showDetails && (
              <div className="mt-2 pt-2 border-t border-slate-700/50 break-all whitespace-pre-wrap text-rose-300">
                {error.message}
                {error.digest && <div className="text-slate-500 mt-1">Digest: {error.digest}</div>}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleCleanReload}
            disabled={isResetting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Sincronizando...' : 'Recarregar Painel'}</span>
          </button>

          <button
            onClick={handleSignOutAndLogin}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Reconectar com Google</span>
          </button>

          <Link
            href="/demo"
            className="text-xs text-slate-400 hover:text-emerald-400 pt-2 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Explorar versão de demonstração</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
