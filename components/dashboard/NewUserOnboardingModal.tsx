'use client'

import React, { useState } from 'react'
import { 
  Sparkles, 
  User, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Trash2, 
  CreditCard, 
  BrainCircuit, 
  BriefcaseMedical,
  FileBadge,
  Lock
} from 'lucide-react'

interface AccountItem {
  id?: string
  name: string
  institution: string
  type: 'PF' | 'PJ'
}

interface NewUserOnboardingModalProps {
  isOpen: boolean
  userEmail: string
  initialName?: string
  onCompleted: (updatedName: string) => void
}

export function NewUserOnboardingModal({
  isOpen,
  userEmail,
  initialName = '',
  onCompleted
}: NewUserOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  
  // Etapa 1: Dados Pessoais
  const [fullName, setFullName] = useState(initialName || '')
  const [specialty, setSpecialty] = useState('')
  const [crm, setCrm] = useState('')
  
  // Etapa 2: Contas Bancárias
  const [accounts, setAccounts] = useState<AccountItem[]>([
    { name: 'Conta Principal PF', institution: 'Nubank / Itaú', type: 'PF' },
    { name: 'Conta Clínica / PJ', institution: 'Banco Inter PJ', type: 'PJ' }
  ])
  const [newAccName, setNewAccName] = useState('')
  const [newAccInst, setNewAccInst] = useState('')
  const [newAccType, setNewAccType] = useState<'PF' | 'PJ'>('PF')

  // Feedback e Loading
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccName.trim()) return
    setAccounts([
      ...accounts,
      {
        name: newAccName.trim(),
        institution: newAccInst.trim() || 'Banco',
        type: newAccType
      }
    ])
    setNewAccName('')
    setNewAccInst('')
  }

  const handleRemoveAccount = (index: number) => {
    setAccounts(accounts.filter((_, idx) => idx !== index))
  }

  const handleFinalize = async () => {
    setIsLoading(true)
    setErrorMsg('')

    try {
      // 1. Salva o perfil do usuário
      const resProfile = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim() || 'Usuário',
          specialty: specialty.trim() || undefined,
          crm: crm.trim() || undefined,
          onboardingCompleted: true
        })
      })

      if (!resProfile.ok) {
        throw new Error('Não foi possível salvar os dados do perfil.')
      }

      // 2. Salva as contas cadastradas
      for (const acc of accounts) {
        try {
          await fetch('/api/user/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: acc.name,
              institution: acc.institution,
              type: acc.type
            })
          })
        } catch (_) {}
      }

      // Notifica o sistema que o perfil foi configurado
      window.dispatchEvent(new CustomEvent('leaomed_profile_updated', {
        detail: { fullName: fullName.trim() || 'Usuário', email: userEmail, specialty, crm }
      }))

      onCompleted(fullName.trim() || 'Usuário')
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao concluir configuração inicial.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[var(--capital-card,#ffffff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header Elegante */}
        <div className="p-6 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] flex items-center justify-center text-[var(--capital-accent,#927025)] shadow-xs">
              <Sparkles className="w-5 h-5 text-[var(--capital-accent,#927025)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
                Bem-vindo ao LeãoMed Capital
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]">
                  Configuração Inicial
                </span>
              </h2>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-0.5">
                Configure seus dados pessoais e contas bancárias para personalizar o seu ambiente executivo.
              </p>
            </div>
          </div>

          {/* Indicador de Passos */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 1 ? 'bg-[var(--capital-button,#c7a354)]' : 'bg-[var(--capital-success,#157449)]'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all ${step === 2 ? 'bg-[var(--capital-button,#c7a354)]' : 'bg-[var(--capital-line,#e4dfd3)]'}`} />
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[var(--capital-danger-soft,#fcecec)] border border-[var(--capital-danger,#ad3333)] text-[var(--capital-danger,#ad3333)] text-xs flex items-center gap-2 font-medium">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Conteúdo Dinâmico por Etapa */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                <User className="w-4 h-4 text-[var(--capital-accent,#927025)]" />
                <span>1. Como você gostaria de ser chamado?</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                  Nome Completo / Exibição *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Dr. Roberto Alencar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                  E-mail da sua Conta
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-muted,#242a2e)] text-xs font-mono">
                  <Lock className="w-3.5 h-3.5 opacity-60" />
                  <span>{userEmail}</span>
                </div>
                <span className="text-[10px] text-[var(--capital-muted,#242a2e)] mt-1 block">
                  Identificador autenticado exclusivo da sua sessão.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                    Especialidade Médica
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder="Ex: Cirurgia Geral, Dermatologia..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                    />
                    <BriefcaseMedical className="w-4 h-4 text-[var(--capital-muted,#242a2e)] absolute left-3 top-3 opacity-60" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                    CRM / UF
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      placeholder="Ex: CRM-SP 123456"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                    />
                    <FileBadge className="w-4 h-4 text-[var(--capital-muted,#242a2e)] absolute left-3 top-3 opacity-60" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim()) {
                      setErrorMsg('Por favor, informe seu nome completo antes de prosseguir.')
                      return
                    }
                    setErrorMsg('')
                    setStep(2)
                  }}
                  className="w-full py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Continuar para Contas Bancárias</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                  <Building2 className="w-4 h-4 text-[var(--capital-accent,#927025)]" />
                  <span>2. Suas Contas e Cartões</span>
                </div>
                <span className="text-[11px] text-[var(--capital-muted,#242a2e)]">
                  {accounts.length} conta(s) configurada(s)
                </span>
              </div>

              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                O LeãoMed separa rigidamente suas contas de <strong>Pessoa Física (PF)</strong> e <strong>Pessoa Jurídica (PJ)</strong> para auditoria contábil precisa.
              </p>

              {/* Lista das Contas Pré-adicionadas */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {accounts.map((acc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-[var(--capital-accent,#927025)]" />
                      <div>
                        <div className="text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                          {acc.name}
                        </div>
                        <div className="text-[10px] text-[var(--capital-muted,#242a2e)]">
                          {acc.institution} • <span className="font-semibold text-[var(--capital-accent,#927025)]">{acc.type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(index)}
                      className="p-1 rounded-lg hover:bg-[var(--capital-danger-soft,#fcecec)] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] transition-colors"
                      title="Remover conta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulário Rápido para Adicionar Outra Conta */}
              <form onSubmit={handleAddAccount} className="p-3 rounded-2xl border border-dashed border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] space-y-2.5">
                <span className="text-[11px] font-bold text-[var(--capital-text,#242a2e)] block">Adicionar outra conta</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    placeholder="Apelido (ex: XP PF)"
                    className="px-3 py-1.5 rounded-lg border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] text-xs"
                  />
                  <input
                    type="text"
                    value={newAccInst}
                    onChange={(e) => setNewAccInst(e.target.value)}
                    placeholder="Banco (ex: XP, Itaú)"
                    className="px-3 py-1.5 rounded-lg border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] text-xs"
                  />
                  <div className="flex gap-1.5">
                    <select
                      value={newAccType}
                      onChange={(e) => setNewAccType(e.target.value as 'PF' | 'PJ')}
                      className="px-2 py-1.5 rounded-lg border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] text-xs flex-1"
                    >
                      <option value="PF">PF</option>
                      <option value="PJ">PJ</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[var(--capital-neutral,#f8fafc)] hover:bg-[var(--capital-line,#e4dfd3)] border border-[var(--capital-line,#e4dfd3)] text-xs font-bold text-[var(--capital-text,#242a2e)] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Botões de Navegação */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] text-xs font-bold text-[var(--capital-muted,#242a2e)] hover:bg-[var(--capital-neutral,#f8fafc)]"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleFinalize}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Salvando suas preferências...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluir e Acessar Meu Painel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Segurança */}
        <div className="p-4 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] flex items-center justify-between text-[11px] text-[var(--capital-muted,#242a2e)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--capital-success,#157449)]" />
            <span>Isolamento estrito de dados por ID de usuário</span>
          </div>
          <span>LeãoMed Capital</span>
        </div>
      </div>
    </div>
  )
}
