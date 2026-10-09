'use client'

import { AccessibleDialog } from './AccessibleDialog'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, User, KeyRound, Building2, Trash2, Plus, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, CreditCard, BrainCircuit } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/utils/supabase-client'

export interface UserAccountItem {
  id: string
  name: string
  institution: string
  type: 'PF' | 'PJ'
  category: 'CHECKING' | 'CREDIT_CARD' | 'INVESTMENT'
  status: 'ACTIVE' | 'INACTIVE'
}

interface AccountSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  isDemo?: boolean
}

const DEFAULT_ACCOUNTS: UserAccountItem[] = [
  { id: 'pj', name: 'Pessoa Jurídica', institution: 'Banco Inter', type: 'PJ', category: 'CHECKING', status: 'ACTIVE' },
  { id: 'c6-carbon', name: 'C6 Carbon Black', institution: 'C6 Bank', type: 'PF', category: 'CREDIT_CARD', status: 'ACTIVE' },
  { id: 'itau-pf', name: 'Itaú Uniclass', institution: 'Banco Itaú', type: 'PF', category: 'CHECKING', status: 'ACTIVE' },
  { id: 'nu-pf', name: 'Nubank', institution: 'Nubank', type: 'PF', category: 'CHECKING', status: 'ACTIVE' },
]

export function AccountSettingsModal({ isOpen, onClose, isDemo = false }: AccountSettingsModalProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'accounts' | 'jev'>('profile')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Perfil
  const [fullName, setFullName] = useState('Dr. Usuário')
  const [email, setEmail] = useState('usuario@leaomed.com')
  const [specialty, setSpecialty] = useState('Cirurgião Geral / Médico')
  const [crm, setCrm] = useState('CRM-MG')
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          if (data.user.email) setEmail(data.user.email)
          if (data.user.user_metadata?.full_name) setFullName(data.user.user_metadata.full_name)
        }
      } catch (err) {
        // fallback
      }
    }
    loadUser()
  }, [])

  // Senha
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('')
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('')

  // Contas
  const [accounts, setAccounts] = useState<UserAccountItem[]>(DEFAULT_ACCOUNTS)
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [newAccName, setNewAccName] = useState('')
  const [newAccInstitution, setNewAccInstitution] = useState('')
  const [newAccType, setNewAccType] = useState<'PF' | 'PJ'>('PF')
  const [newAccCategory, setNewAccCategory] = useState<'CHECKING' | 'CREDIT_CARD' | 'INVESTMENT'>('CHECKING')
  const [accountSuccessMsg, setAccountSuccessMsg] = useState('')

  // Jev: the browser only receives status. Personal keys are submitted once to
  // the authenticated server route and never placed in localStorage.
  const [jevStatus, setJevStatus] = useState<{ enabled: boolean, source: string, acceptsPersonalKey: boolean } | null>(null)
  const [personalJevKey, setPersonalJevKey] = useState('')
  const [jevMessage, setJevMessage] = useState('')
  const [isSavingJev, setIsSavingJev] = useState(false)

  const loadJevStatus = async () => {
    if (isDemo) return
    try {
      const response = await fetch('/api/settings/jev', { cache: 'no-store' })
      const data = await response.json()
      if (response.ok && data?.success) setJevStatus(data.status)
    } catch {
      setJevStatus({ enabled: false, source: 'disabled', acceptsPersonalKey: false })
    }
  }

  useEffect(() => {
    if (isOpen) void loadJevStatus()
  }, [isOpen, isDemo])

  const handleSavePersonalJevKey = async (event: React.FormEvent) => {
    event.preventDefault()
    setJevMessage('')
    setIsSavingJev(true)
    try {
      const response = await fetch('/api/settings/jev', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: personalJevKey })
      })
      const data = await response.json()
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Não foi possível validar a chave.')
      setPersonalJevKey('')
      setJevStatus(data.status)
      setJevMessage('Chave validada e armazenada de forma cifrada no servidor.')
    } catch (error: any) {
      setJevMessage(error?.message || 'Não foi possível salvar a chave.')
    } finally {
      setIsSavingJev(false)
    }
  }

  const handleRemovePersonalJevKey = async () => {
    setJevMessage('')
    setIsSavingJev(true)
    try {
      const response = await fetch('/api/settings/jev', { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Não foi possível remover a chave.')
      setJevStatus(data.status)
      setJevMessage('Chave pessoal removida. O app continuará com regras locais.')
    } catch (error: any) {
      setJevMessage(error?.message || 'Não foi possível remover a chave.')
    } finally {
      setIsSavingJev(false)
    }
  }

  // Carregar dados salvos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('leaomed_user_profile')
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          if (parsed.fullName) setFullName(parsed.fullName)
          if (parsed.email) setEmail(parsed.email)
          if (parsed.specialty) setSpecialty(parsed.specialty)
          if (parsed.crm) setCrm(parsed.crm)
        } catch (e) {
          console.error(e)
        }
      }

      const savedAccounts = localStorage.getItem('leaomed_connected_accounts')
      if (savedAccounts) {
        try {
          const parsed = JSON.parse(savedAccounts)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAccounts(parsed)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  // Buscar usuário do Supabase caso autenticado
  useEffect(() => {
    if (!isDemo) {
      try {
        const supabase = createSupabaseBrowserClient()
        supabase.auth.getUser().then(({ data }: { data: any }) => {
          if (data?.user) {
            if (data.user.email) setEmail(data.user.email)
            if (data.user.user_metadata?.full_name) {
              setFullName(data.user.user_metadata.full_name)
            }
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  }, [isDemo])

  if (!isOpen || !mounted) return null

  // Salvar Perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccessMsg('')

    const profileData = { fullName, email, specialty, crm }
    localStorage.setItem('leaomed_user_profile', JSON.stringify(profileData))
    window.dispatchEvent(new CustomEvent('leaomed_profile_updated', { detail: profileData }))

    if (!isDemo) {
      try {
        const supabase = createSupabaseBrowserClient()
        await supabase.auth.updateUser({
          data: { full_name: fullName, specialty, crm }
        })
      } catch (err) {
        console.error(err)
      }
    }

    setProfileSuccessMsg('Dados do perfil atualizados com sucesso!')
    setTimeout(() => setProfileSuccessMsg(''), 4000)
  }

  // Atualizar Senha
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccessMsg('')
    setPasswordErrorMsg('')

    if (newPassword.length < 6) {
      setPasswordErrorMsg('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('As senhas não coincidem.')
      return
    }

    setIsUpdatingPassword(true)

    if (isDemo) {
      setTimeout(() => {
        setIsUpdatingPassword(false)
        setPasswordSuccessMsg('Senha atualizada em modo de demonstração!')
        setNewPassword('')
        setConfirmPassword('')
      }, 700)
      return
    }

    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPasswordErrorMsg(error.message || 'Erro ao atualizar a senha.')
      } else {
        setPasswordSuccessMsg('Sua senha foi alterada com sucesso!')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      setPasswordErrorMsg(err?.message || 'Falha na comunicação com o servidor de autenticação.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Adicionar Conta
  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccName.trim() || !newAccInstitution.trim()) return

    const newAcc: UserAccountItem = {
      id: `acc-${Date.now()}`,
      name: newAccName.trim(),
      institution: newAccInstitution.trim(),
      type: newAccType,
      category: newAccCategory,
      status: 'ACTIVE'
    }

    const updated = [...accounts, newAcc]
    setAccounts(updated)
    localStorage.setItem('leaomed_connected_accounts', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('leaomed_accounts_updated', { detail: updated }))

    setNewAccName('')
    setNewAccInstitution('')
    setIsAddingAccount(false)
    setAccountSuccessMsg(`Conta "${newAcc.name}" adicionada com sucesso!`)
    setTimeout(() => setAccountSuccessMsg(''), 4000)
  }

  // Remover Conta
  const handleRemoveAccount = (id: string, name: string) => {
    if (!confirm(`Deseja remover a conta "${name}" da sua gestão?`)) return

    const updated = accounts.filter(a => a.id !== id)
    setAccounts(updated)
    localStorage.setItem('leaomed_connected_accounts', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('leaomed_accounts_updated', { detail: updated }))

    setAccountSuccessMsg(`Conta "${name}" removida.`)
    setTimeout(() => setAccountSuccessMsg(''), 4000)
  }

  return createPortal(
    <AccessibleDialog onClose={onClose} labelledBy="account-settings-title" closeOnBackdrop
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
    >
      <div 
        className="w-full max-w-2xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] shadow-sm overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--capital-soft,#f6f0df)] from-emerald-500 to-teal-700 flex items-center justify-center text-[var(--capital-accent,#927025)] font-semibold text-base shadow-md shadow-none">
              {fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'RL'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="account-settings-title" className="text-lg font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                  Minha Conta & Preferências
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)] uppercase tracking-wider">
                  Executivo
                </span>
              </div>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                Gerencie seus dados de acesso, credenciais e contas conectadas
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-2 rounded-xl text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-muted,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-6 bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
                : 'border-transparent text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil & Nome</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
                : 'border-transparent text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Atualizar Senha</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
                : 'border-transparent text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Contas Bancárias ({accounts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('jev')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'jev'
                ? 'border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
                : 'border-transparent text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>IA / Jev</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ABA 1: PERFIL */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--capital-success,#157449)]" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                  Nome Completo / Exibição
                </label>
                <input
                  type="text"
                  aria-label="Nome completo ou nome de exibição"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                  E-mail da Conta
                </label>
                <input
                  type="email"
                  aria-label="E-mail da conta"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-muted,#242a2e)] text-xs font-mono cursor-not-allowed"
                />
                <span className="text-[10px] text-[var(--capital-muted,#242a2e)] mt-1 block">O e-mail é o identificador único da sua sessão segura.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                    Especialidade Médica
                  </label>
                  <input
                    type="text"
                    aria-label="Especialidade médica"
                  value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ex: Cardiologista, Cirurgião..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                    CRM / UF
                  </label>
                  <input
                    type="text"
                    aria-label="CRM"
                  value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                    placeholder="Ex: CRM-MG 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs transition-all shadow-md shadow-none cursor-pointer"
                >
                  Salvar Alterações do Perfil
                </button>
              </div>
            </form>
          )}

          {/* ABA 2: SENHA */}
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {passwordSuccessMsg && (
                <div className="p-3 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--capital-success,#157449)]" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3 rounded-xl bg-[var(--capital-danger-soft,#fcecec)] border border-[var(--capital-danger,#ad3333)] text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)] text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[var(--capital-danger,#ad3333)]" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] text-xs text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)]">
                <span className="font-bold block mb-1">Atualização de Senha de Acesso</span>
                Defina uma senha forte com no mínimo 6 caracteres. A nova senha será necessária no próximo login.
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  aria-label="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  aria-label="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha exatamente igual"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs transition-all shadow-md shadow-none cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Atualizando senha...</span>
                    </>
                  ) : (
                    <span>Salvar Nova Senha</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'jev' && (
            <section className="space-y-4">
              <div className="rounded-2xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] p-4 text-xs text-[var(--capital-muted,#242a2e)]">
                <div className="flex items-center gap-2 font-bold text-[var(--capital-text,#242a2e)]"><BrainCircuit className="w-4 h-4" /> Assistente Jev</div>
                <p className="mt-2 leading-relaxed">O Jev sugere classificações em modo de revisão. Sem uma chave habilitada, o app usa somente regras locais e não envia dados ao serviço de IA.</p>
              </div>
              {jevMessage && <div className="rounded-xl border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)]">{jevMessage}</div>}
              {jevStatus?.source === 'platform_owner' ? (
                <div className="rounded-xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] p-4 text-xs text-[var(--capital-text,#242a2e)]">A credencial protegida da plataforma está disponível para esta conta. Ela não pode ser exibida nem alterada aqui.</div>
              ) : jevStatus?.acceptsPersonalKey ? (
                <form onSubmit={handleSavePersonalJevKey} className="space-y-3">
                  <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)]">Sua chave TypeSafe API</label>
                  <input type="password" autoComplete="new-password" value={personalJevKey} onChange={event => setPersonalJevKey(event.target.value)} placeholder="Cole sua chave pessoal" className="w-full px-3 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] text-xs" required />
                  <p className="text-[11px] text-[var(--capital-muted,#242a2e)]">A chave é validada e cifrada no servidor. Nunca é mostrada novamente nem gravada neste navegador.</p>
                  <div className="flex gap-2">
                    <button type="submit" disabled={isSavingJev} className="px-4 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] text-xs font-bold disabled:opacity-60">{isSavingJev ? 'Validando...' : jevStatus?.enabled ? 'Substituir chave' : 'Ativar Jev'}</button>
                    {jevStatus?.enabled && <button type="button" onClick={handleRemovePersonalJevKey} disabled={isSavingJev} className="px-4 py-2 rounded-xl border border-[var(--capital-danger,#ad3333)] text-[var(--capital-danger,#ad3333)] text-xs font-bold disabled:opacity-60">Desativar</button>}
                  </div>
                </form>
              ) : <div className="rounded-xl border border-[var(--capital-line,#e4dfd3)] p-4 text-xs text-[var(--capital-muted,#242a2e)]">Jev indisponível para esta conta. O app continua usando regras locais.</div>}
            </section>
          )}

          {/* ABA 3: GERENCIAR CONTAS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {accountSuccessMsg && (
                <div className="p-3 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--capital-success,#157449)]" />
                  <span>{accountSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                    Contas e Cartões Cadastrados
                  </h3>
                  <p className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                    Contas monitoradas no painel. Adicione novas ou remova contas antigas.
                  </p>
                </div>
                {!isAddingAccount && (
                  <button
                    onClick={() => setIsAddingAccount(true)}
                    className="px-3 py-1.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Conta</span>
                  </button>
                )}
              </div>

              {/* Formulário para Adicionar Conta */}
              {isAddingAccount && (
                <form onSubmit={handleAddAccount} className="p-4 rounded-2xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">Nova Conta Bancária ou Cartão</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingAccount(false)}
                      className="text-xs text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-muted,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)]"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                        Apelido da Conta
                      </label>
                      <input
                        type="text"
                        aria-label="Nome da conta"
                  value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        placeholder="Ex: XP Investimentos, BB PJ..."
                        className="w-full px-3 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:ring-2 focus:ring-[var(--capital-accent,#927025)] outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                        Instituição / Banco
                      </label>
                      <input
                        type="text"
                        aria-label="Instituição financeira"
                  value={newAccInstitution}
                        onChange={(e) => setNewAccInstitution(e.target.value)}
                        placeholder="Ex: XP Investimentos, Bradesco..."
                        className="w-full px-3 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:ring-2 focus:ring-[var(--capital-accent,#927025)] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                        Titularidade
                      </label>
                      <select
                        aria-label="Tipo de pessoa da conta"
                  value={newAccType}
                        onChange={(e) => setNewAccType(e.target.value as 'PF' | 'PJ')}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:ring-2 focus:ring-[var(--capital-accent,#927025)] outline-none"
                      >
                        <option value="PF">Pessoa Física (PF)</option>
                        <option value="PJ">Pessoa Jurídica (PJ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                        Categoria
                      </label>
                      <select
                        aria-label="Categoria da conta"
                  value={newAccCategory}
                        onChange={(e) => setNewAccCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:ring-2 focus:ring-[var(--capital-accent,#927025)] outline-none"
                      >
                        <option value="CHECKING">Conta Corrente</option>
                        <option value="CREDIT_CARD">Cartão de Crédito</option>
                        <option value="INVESTMENT">Corretora / Investimentos</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold text-xs transition-all cursor-pointer"
                    >
                      Salvar Conta
                    </button>
                  </div>
                </form>
              )}

              {/* Lista das Contas */}
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-2xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center justify-between shadow-xs hover:border-[var(--capital-line,#e4dfd3)] dark:hover:border-[var(--capital-line,#e4dfd3)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        acc.type === 'PJ' 
                          ? 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'
                          : acc.category === 'CREDIT_CARD'
                          ? 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'
                          : 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'
                      }`}>
                        {acc.category === 'CREDIT_CARD' ? <CreditCard className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">{acc.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            acc.type === 'PJ'
                              ? 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'
                              : 'bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]'
                          }`}>
                            {acc.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] block">
                          {acc.institution} • {
                            acc.category === 'CHECKING' ? 'Conta Corrente' :
                            acc.category === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Investimentos'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] px-2 py-0.5 rounded-md border border-[var(--capital-accent,#927025)]">
                        Ativa
                      </span>
                      <button
                        onClick={() => handleRemoveAccount(acc.id, acc.name)}
                        className="p-1.5 rounded-lg text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] hover:bg-[var(--capital-danger-soft,#fcecec)] dark:hover:bg-[var(--capital-danger-soft,#fcecec)] transition-colors cursor-pointer"
                        title="Remover conta da visualização"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] flex items-center justify-between text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--capital-success,#157449)]" />
            <span>Dados protegidos por criptografia de ponta a ponta</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </AccessibleDialog>,
    document.body
  )
}
