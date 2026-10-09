import React from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PrivacyProvider } from '@/context/PrivacyContext'
import { PrivacyToggle } from '@/components/PrivacyToggle'
import { UserAccountHeader } from '@/components/dashboard/UserAccountHeader'
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userName = 'Dr. Usuário'
  let userEmail = 'usuario@leaomed.com'
  try {
    const supabase = await createClient()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userEmail = user.email || userEmail
        userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Doutor(a)'
      }
    }
  } catch {
    // O cabeçalho permanece disponível enquanto a sessão é recuperada.
  }

  return (
    <ThemeProvider>
      <PrivacyProvider>
        <div className="capital-shell min-h-[100dvh]">
          <a href="#capital-main-content" className="capital-skip-link">Ir para o conteúdo</a>
          <header className="capital-topbar">
            <div className="capital-brand">
              <span className="capital-brand-icon"><img src="/logo.jpg" alt="" width={43} height={43} /></span>
              <div><strong>LeãoMed <span>Capital</span></strong><small>Seu dinheiro, com mais clareza.</small></div>
            </div>
            <div className="capital-topbar-actions">
              <PrivacyToggle showLabel={false} />
              <ThemeToggle />
              <UserAccountHeader initialName={userName} initialEmail={userEmail} />
            </div>
          </header>
          <div className="capital-shell-body flex flex-1 items-start">
            <SidebarNavigation />
            <main id="capital-main-content" tabIndex={-1} className="capital-main flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </PrivacyProvider>
    </ThemeProvider>
  )
}
