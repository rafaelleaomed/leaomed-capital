'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Erro no Carregamento
          </h2>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Houve uma falha inesperada na renderização da aplicação. Clique abaixo para reiniciar ou reconectar.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recarregar Aplicação</span>
            </button>

            <a
              href="/login"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700"
            >
              <LogIn className="w-4 h-4" />
              <span>Ir para Login</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
