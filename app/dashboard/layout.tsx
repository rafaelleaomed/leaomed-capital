import React from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserAccountHeader } from '@/components/dashboard/UserAccountHeader'
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation'

import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userName = 'Dr. Usuário'
  let userEmail = 'usuario@leaomed.com'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userEmail = user.email || userEmail
      userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Dr. Rafael Leão'
    }
  } catch (e) {
    // fallback seguro caso sem sessao ativa
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-[100dvh] flex-col bg-slate-50 dark:bg-[#070B12] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Topbar Executiva com Glassmorphism */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/85 dark:bg-slate-950/85 px-3 sm:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-900 shadow-md shrink-0">
              <img src="/logo.jpg" alt="LeãoMed Capital Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="font-display text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                LeãoMed Capital
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                Gestão Patrimonial & IA Consultiva
              </span>
              <span className="sm:hidden text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                Gestão Patrimonial
              </span>
            </div>
          </div>

          {/* Status de Conexão das Contas + Theme Toggle + Perfil Interativo */}
          <div className="flex items-center gap-2.5 md:gap-3">
            {/* Botão de Alternar Modo Claro / Escuro */}
            <ThemeToggle />

            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pessoa Jurídica + Itaú + Nubank + C6</span>
            </div>

            {/* Cabeçalho Interativo do Usuário com Mini Registro e Configurações */}
            <UserAccountHeader initialName={userName} initialEmail={userEmail} />
          </div>
        </header>

        {/* Main Container com Menu Lateral Fixo */}
        <div className="flex flex-1 relative items-start">
          {/* Sidebar Fixo e Sticky (Permanente ao rolar a página) */}
          <SidebarNavigation />

          {/* Área de Conteúdo */}
          <main className="flex-1 p-4 md:p-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
