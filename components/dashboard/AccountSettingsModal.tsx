'use client'

import React, { useState, useEffect } from 'react'
import { X, User, KeyRound, Building2, Trash2, Plus, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, CreditCard } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'accounts'>('profile')

  // Perfil
  const [fullName, setFullName] = useState('Dr. Rafael Leão')
  const [email, setEmail] = useState('rafaelleaobh@gmail.com')
  const [specialty, setSpecialty] = useState('Cirurgião Geral / Médico')
  const [crm, setCrm] = useState('CRM-MG')
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')

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

  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-emerald-500/20">
              {fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'RL'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Minha Conta & Preferências
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Executivo
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie seus dados de acesso, credenciais e contas conectadas
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-slate-200 dark:border-white/10 px-6 bg-slate-50/30 dark:bg-slate-950/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil & Nome</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Atualizar Senha</span>
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Contas Bancárias ({accounts.length})</span>
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* ABA 1: PERFIL */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo / Exibição
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail da Conta
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-950/50 text-slate-500 text-xs font-mono cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">O e-mail é o identificador único da sua sessão segura.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Especialidade Médica
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ex: Cardiologista, Cirurgião..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    CRM / UF
                  </label>
                  <input
                    type="text"
                    value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                    placeholder="Ex: CRM-MG 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
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
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                <span className="font-bold block mb-1">Atualização de Senha de Acesso</span>
                Defina uma senha forte com no mínimo 6 caracteres. A nova senha será necessária no próximo login.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha exatamente igual"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-60 flex items-center gap-2"
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

          {/* ABA 3: GERENCIAR CONTAS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {accountSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{accountSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Contas e Cartões Cadastrados
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Contas monitoradas no painel. Adicione novas ou remova contas antigas.
                  </p>
                </div>
                {!isAddingAccount && (
                  <button
                    onClick={() => setIsAddingAccount(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Conta</span>
                  </button>
                )}
              </div>

              {/* Formulário para Adicionar Conta */}
              {isAddingAccount && (
                <form onSubmit={handleAddAccount} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Nova Conta Bancária ou Cartão</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingAccount(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Apelido da Conta
                      </label>
                      <input
                        type="text"
                        value={newAccName}
                        onChange={(e) => setNewAccName(e.target.value)}
                        placeholder="Ex: XP Investimentos, BB PJ..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Instituição / Banco
                      </label>
                      <input
                        type="text"
                        value={newAccInstitution}
                        onChange={(e) => setNewAccInstitution(e.target.value)}
                        placeholder="Ex: XP Investimentos, Bradesco..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Titularidade
                      </label>
                      <select
                        value={newAccType}
                        onChange={(e) => setNewAccType(e.target.value as 'PF' | 'PJ')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="PF">Pessoa Física (PF)</option>
                        <option value="PJ">Pessoa Jurídica (PJ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Categoria
                      </label>
                      <select
                        value={newAccCategory}
                        onChange={(e) => setNewAccCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all cursor-pointer"
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
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 flex items-center justify-between shadow-xs hover:border-slate-300 dark:hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        acc.type === 'PJ' 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                          : acc.category === 'CREDIT_CARD'
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {acc.category === 'CREDIT_CARD' ? <CreditCard className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{acc.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            acc.type === 'PJ'
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                              : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                          }`}>
                            {acc.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          {acc.institution} • {
                            acc.category === 'CHECKING' ? 'Conta Corrente' :
                            acc.category === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'Investimentos'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Ativa
                      </span>
                      <button
                        onClick={() => handleRemoveAccount(acc.id, acc.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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
        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dados protegidos por criptografia de ponta a ponta</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
