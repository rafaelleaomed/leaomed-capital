import React from 'react'
import { LayoutDashboard, Receipt, TrendingUp, PieChart, Sparkles, Building2, UserCheck, ShieldCheck, BarChart3 } from 'lucide-react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LogoutButton } from '@/components/LogoutButton'

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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                Aethel Wealth
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold block">
                PJ Inter & PF Multicontas
              </span>
            </div>
          </div>

          {/* Status de Conexão das Contas + Theme Toggle + Perfil */}
          <div className="flex items-center gap-2.5 md:gap-3">
            {/* Botão de Alternar Modo Claro / Escuro */}
            <ThemeToggle />

            <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Inter PJ + Itaú + Nubank + C6</span>
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-white/10">
              <div className="text-right hidden md:block">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 block">Dr. Rafael Leão</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Perfil Executivo</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-900 border border-slate-300 dark:border-white/20 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white">
                RL
              </div>
              <LogoutButton className="ml-1 hidden md:flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors text-xs" />
            </div>
          </div>
        </header>

        {/* Main Container */}
        <div className="flex flex-1">
          {/* Sidebar Moderna */}
          <aside className="hidden w-64 flex-col border-r border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/40 p-4 md:flex justify-between">
            <nav className="flex flex-col gap-1.5">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Módulos Principais
              </div>
              <a href="#visao-geral-graficos" className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-all">
                <BarChart3 className="h-4 w-4" />
                Gráficos & Dashboard
              </a>
              <a href="#categorias-planilha" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
                <LayoutDashboard className="h-4 w-4" />
                Categorias & Planilha
              </a>
              <a href="#parcelamentos-dividas" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
                <Receipt className="h-4 w-4" />
                Parcelamentos & Dívidas
              </a>
              <a href="#balanceamento-investimentos" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
                <PieChart className="h-4 w-4" />
                Investimentos & Rebalance
              </a>
              <a href="#historico-mensal" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all">
                <TrendingUp className="h-4 w-4" />
                Histórico Mensal
              </a>

              <div className="mt-6 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Separação de Entidades
              </div>
              <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-xs text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                    Inter PJ
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Ativa</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-xs text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2 font-medium">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    PF (Itaú, Nu, C6)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Ativa</span>
                </div>
              </div>
            </nav>

            {/* Rodapé da Sidebar */}
            <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 p-3 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                Modo Portfólio Ativo
              </div>
              Conciliação automática via Open Finance e extração de faturas.
            </div>
          </aside>

          {/* Área de Conteúdo */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
