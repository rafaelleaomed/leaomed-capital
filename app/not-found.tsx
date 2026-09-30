'use client'

import React from 'react'
import Link from 'next/link'
import { FileQuestion, Home, LogIn } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Página não encontrada
        </h2>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          A página ou recurso que você tentou acessar não existe ou mudou de endereço.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/dashboard"
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Ir para o Dashboard</span>
          </Link>

          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Fazer Login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
