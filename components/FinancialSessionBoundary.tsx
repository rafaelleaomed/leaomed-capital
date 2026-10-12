'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/utils/supabase-client'
import { getFinancialUserScope, setFinancialUserScope } from '@/utils/userScopedStorage'
import type { AuthChangeEvent, AuthError, Session, User } from '@supabase/supabase-js'

/** Mount financial views only after checking that the browser matches the server session. */
export function FinancialSessionBoundary({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    setFinancialUserScope(null)
    setReady(false)
    const supabase = createSupabaseBrowserClient()

    const invalidate = () => {
      active = false
      setFinancialUserScope(null)
      setReady(false)
      // A full navigation also discards React state and the Next client router cache.
      window.location.replace('/login')
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (active && session?.user.id !== userId) invalidate()
    })
    const handleScopeChange = () => {
      if (getFinancialUserScope() !== userId) setReady(false)
    }
    window.addEventListener('leaomed_financial_scope_changed', handleScopeChange)

    void supabase.auth.getUser().then(({ data: { user }, error }: { data: { user: User | null }; error: AuthError | null }) => {
      if (!active) return
      if (error || user?.id !== userId) return invalidate()
      setFinancialUserScope(userId)
      setReady(true)
    }).catch(() => { if (active) invalidate() })

    return () => {
      active = false
      subscription.unsubscribe()
      window.removeEventListener('leaomed_financial_scope_changed', handleScopeChange)
      setFinancialUserScope(null)
    }
  }, [userId])

  if (!ready) return <div role="status" className="p-6">Verificando sessão…</div>
  return children
}
