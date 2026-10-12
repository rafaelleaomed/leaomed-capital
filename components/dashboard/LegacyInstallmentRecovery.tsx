'use client'
import { useEffect, useState } from 'react'
import { InstallmentItem, InstallmentStore } from '@/utils/installmentStore'
import { getFinancialScopeVersion, getFinancialUserScope } from '@/utils/userScopedStorage'
import { financialStorage } from '@/utils/userScopedStorage'
import { getVerifiedOwnerLegacyTransactions, hasVerifiedLegacyOwner, recoverVerifiedOwnerCaches } from '@/utils/legacyFinancialRecovery'
import type { ReactNode } from 'react'
import type { OwnerRecoveryCapability } from '@/utils/legacyFinancialRecovery'

// Server capability is checked before reading the unscoped legacy cache. It is
// never claimed by whichever account happens to log in on a shared browser.
export function LegacyFinancialRecovery({ children }: { children?: ReactNode }) {
  const [message, setMessage] = useState('')
  const [checked, setChecked] = useState(false)
  const [ownerCapability, setOwnerCapability] = useState<OwnerRecoveryCapability | null>(null)
  const [restoringBackup, setRestoringBackup] = useState(false)
  useEffect(() => {
    let active = true
    const version = getFinancialScopeVersion()
    const stillCurrent = () => active && version === getFinancialScopeVersion()
    async function recover() {
      try {
        const capability = await fetch('/api/installments/recovery', { cache: 'no-store', signal: AbortSignal.timeout(15000) }).then(r => r.json())
        if (!stillCurrent() || !capability.eligible || capability.userId !== getFinancialUserScope()) return
        setOwnerCapability(capability)
        if (!hasVerifiedLegacyOwner(capability)) return
        const settingsCount = recoverVerifiedOwnerCaches(capability)
        const transactions = getVerifiedOwnerLegacyTransactions(capability)
        for (let index = 0; index < transactions.length; index += 200) {
          if (!stillCurrent()) return
          const saved = await fetch('/api/transactions', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(60000),
            body: JSON.stringify({ transactions: transactions.slice(index, index + 200), recoverLegacy: true, expectedUserId: capability.userId }),
          })
          if (!saved.ok || !(await saved.json()).success) throw new Error('recovery_failed')
        }
        if (!stillCurrent()) return
        if (transactions.length) financialStorage.setItem('leaomed_owner_transactions_recovery_v1', 'complete')
        if (settingsCount || transactions.length) setMessage('Dados anteriores deste navegador recuperados para sua conta.')
        const raw = window.localStorage.getItem('leaomed_installment_store_v2')
        if (!raw) return
        const legacy: InstallmentItem[] = JSON.parse(raw)
        if (!Array.isArray(legacy) || legacy.length === 0) return
        if (!stillCurrent()) return
        const response = await fetch('/api/installments/recovery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(60000), body: JSON.stringify({ installments: legacy, expectedUserId: capability.userId }) })
        const result = await response.json()
        if (!stillCurrent()) return
        if (!response.ok || !result.success) throw new Error('recovery_failed')
        const mappings = new Map<string, string>((result.mappings || []).map((entry: { legacyId: string; id: string }) => [entry.legacyId, entry.id]))
        const restored = legacy.filter(item => mappings.has(item.id)).map(item => ({ ...item, id: mappings.get(item.id)! }))
        const existing = InstallmentStore.getInstallments()
        InstallmentStore.saveInstallments([...existing, ...restored.filter(item => !existing.some(old => old.id === item.id))])
        setMessage(`${restored.length} parcelamentos anteriores recuperados para sua conta.${restored.length < legacy.length ? ' Registros excluídos anteriormente não foram reativados.' : ''}`)
      } catch {
        if (stillCurrent()) setMessage('Não foi possível recuperar o cache anterior. Os dados originais foram preservados; tente recarregar a página.')
      } finally {
        if (stillCurrent()) setChecked(true)
      }
    }
    void recover()
    return () => { active = false }
  }, [])
  const restoreBackup = async (file?: File) => {
    if (!file || !ownerCapability || ownerCapability.userId !== getFinancialUserScope()) return
    const version = getFinancialScopeVersion()
    setRestoringBackup(true)
    try {
      if (file.size > 1_000_000) throw new Error('backup_too_large')
      const parsed = JSON.parse(await file.text())
      const legacy: InstallmentItem[] = Array.isArray(parsed) ? parsed : parsed.installments
      if (!Array.isArray(legacy) || !legacy.length || version !== getFinancialScopeVersion()) throw new Error('invalid_backup')
      const response = await fetch('/api/installments/recovery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(60000),
        body: JSON.stringify({ installments: legacy, expectedUserId: ownerCapability.userId }),
      })
      const result = await response.json()
      if (version !== getFinancialScopeVersion()) return
      if (!response.ok || !result.success || result.mappings?.length !== legacy.length) throw new Error('recovery_failed')
      const ids = new Map<string, string>(result.mappings.map((item: { legacyId: string; id: string }) => [item.legacyId, item.id]))
      const restored = legacy.map(item => ({ ...item, id: ids.get(item.id)! }))
      const existing = InstallmentStore.getInstallments()
      InstallmentStore.saveInstallments([...existing, ...restored.filter(item => !existing.some(old => old.id === item.id))])
      setMessage(`${restored.length} parcelamentos do backup recuperados para sua conta.`)
    } catch {
      if (version === getFinancialScopeVersion()) setMessage('Não foi possível recuperar esse backup. Nenhum arquivo original foi removido.')
    } finally { if (version === getFinancialScopeVersion()) setRestoringBackup(false) }
  }
  if (!checked) return <p role="status" className="p-6">Verificando os dados da sua conta…</p>
  return <>
    {message && <p role="status" className="text-sm text-[var(--capital-muted)]">{message}</p>}
    {ownerCapability && <details className="m-4 text-sm">
      <summary className="cursor-pointer">Recuperar dados anteriores</summary>
      <p className="my-2">Se o navegador antigo não estiver disponível, escolha seu backup de parcelamentos. A recuperação fica vinculada somente à sua conta.</p>
      <label>Backup de parcelamentos <input aria-label="Backup de parcelamentos" type="file" accept=".json,application/json" disabled={restoringBackup} onChange={event => { void restoreBackup(event.target.files?.[0]); event.target.value = '' }} /></label>
    </details>}
    {children}
  </>
}
