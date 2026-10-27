import React from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PrivacyProvider } from '@/context/PrivacyContext'
import { PrivacyToggle } from '@/components/PrivacyToggle'
import { UserAccountHeader } from '@/components/dashboard/UserAccountHeader'
import { SidebarNavigation } from '@/components/dashboard/SidebarNavigation'
import { getAuthenticatedUser } from '@/utils/supabase-server'
import { isUserAuthorized } from '@/utils/auth-helpers'
import { redirect } from 'next/navigation'
import { FinancialSessionBoundary } from '@/components/FinancialSessionBoundary'
import { sql } from '@/utils/db'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()
  if (!user || !isUserAuthorized(user)) redirect('/login')
  const userEmail = user.email || ''

  // Busca perfil específico do usuário no banco PostgreSQL com isolamento por ID
  let userName = ''
  try {
    const userRows = await sql`
      SELECT name, email FROM public.users WHERE id = ${user.id}
    `
    if (userRows[0]?.name) {
      userName = userRows[0].name
    }
  } catch (_) {}

  if (!userName) {
    userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário'
  }

  return (
    <FinancialSessionBoundary key={user.id} userId={user.id}>
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
            <SidebarNavigation userName={userName} userEmail={userEmail} />
            <main id="capital-main-content" tabIndex={-1} className="capital-main flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </PrivacyProvider>
    </ThemeProvider>
    </FinancialSessionBoundary>
  )
}
