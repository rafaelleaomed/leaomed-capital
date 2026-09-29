import React from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { UserAccountHeader } from '@/components/dashboard/UserAccountHeader'
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex min-h-[100dvh] flex-col bg-slate-50 dark:bg-[#070B12] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Topbar Executiva com Glassmorphism */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 px-4 md:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-900 shadow-lg shadow-emerald-500/20">
              <img src="/logo.jpg" alt="LeãoMed Capital Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="font-display text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                LeãoMed Capital
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">
                Gestão Patrimonial & IA Consultiva
              </span>
            </div>
          </div>

          {/* Status de Conexão das Contas + Theme Toggle + Perfil Interativo */}
          <div className="flex items-center gap-2.5 md:gap-3">
            {/* Botão de Alternar Modo Claro / Escuro */}
            <ThemeToggle />

            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Inter PJ + Itaú + Nubank + C6</span>
            </div>

            {/* Cabeçalho Interativo do Usuário com Mini Registro e Configurações */}
            <UserAccountHeader initialName="Dr. Rafael Leão" initialEmail="rafaelleaobh@gmail.com" />
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
