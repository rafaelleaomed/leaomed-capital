'use client'

import { financialStorage } from '@/utils/userScopedStorage'

import React, { useState } from 'react'
import { 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  CreditCard, 
  UploadCloud, 
  Camera, 
  Edit3, 
  Layers, 
  PieChart, 
  CalendarClock, 
  Plus, 
  Trash2, 
  X,
  FileText,
  Sliders,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { DEFAULT_MEDICAL_TAXONOMY, USER_INVESTMENT_TARGETS, CategoryDef } from '@/utils/taxonomy'

interface OnboardingWizardModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (config: any) => void
  isDemo?: boolean
}

export function OnboardingWizardModal({ 
  isOpen, 
  onClose, 
  onSave,
  isDemo = false 
}: OnboardingWizardModalProps) {
  const [currentStep, setCurrentStep] = useState(1)

  // Etapa 1: Contas e Vínculos
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [newAccountName, setNewAccountName] = useState('')

  // Etapa 2: Método de Ingestão de Dados
  const [selectedIngestionMethod, setSelectedIngestionMethod] = useState<
    'INVOICE_IMPORT' | 'SCREENSHOT_OCR' | 'MANUAL_ENTRY' | 'OPEN_FINANCE'
  >('INVOICE_IMPORT')

  // Etapa 3: Categorias Iniciais (baseadas na Planilha Médica Oficial)
  const [categories, setCategories] = useState<CategoryDef[]>(DEFAULT_MEDICAL_TAXONOMY)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')

  // Etapa 4: Financiamentos e Parcelamentos
  const [installments, setInstallments] = useState<Array<{ name: string; category: string; monthlyValue: number; currentInstallment: number; totalInstallments: number; endMonthYear: string }>>([])
  const [newInstallment, setNewInstallment] = useState({
    name: '',
    category: 'Transporte',
    monthlyValue: '',
    totalInstallments: '',
    endMonthYear: ''
  })

  // Etapa 5: Metas de Alocação de Investimentos
  const [investmentTargets, setInvestmentTargets] = useState(USER_INVESTMENT_TARGETS)

  // Carregar dados prévios do localStorage ao inicializar
  React.useEffect(() => {
    try {
      const stored = financialStorage.getItem('leaomed_user_custom_setup')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.accounts && Array.isArray(parsed.accounts)) setSelectedAccounts(parsed.accounts)
        if (parsed.ingestionMethod) setSelectedIngestionMethod(parsed.ingestionMethod)
        if (parsed.categories && Array.isArray(parsed.categories)) setCategories(parsed.categories)
        if (parsed.installments && Array.isArray(parsed.installments)) setInstallments(parsed.installments)
        if (parsed.investmentTargets && Array.isArray(parsed.investmentTargets)) setInvestmentTargets(parsed.investmentTargets)
      }
    } catch (_) {}
  }, [])

  // Handlers de interação
  const handleAddAccount = () => {
    if (newAccountName.trim() && !selectedAccounts.includes(newAccountName.trim())) {
      setSelectedAccounts([...selectedAccounts, newAccountName.trim()])
      setNewAccountName('')
    }
  }

  const handleRemoveAccount = (acc: string) => {
    setSelectedAccounts(selectedAccounts.filter(a => a !== acc))
  }

  const handleAddSubcategory = (catIndex: number) => {
    if (!newSubcategoryName.trim()) return
    const updated = [...categories]
    updated[catIndex].subcategories.push({
      name: newSubcategoryName.trim(),
      isFixed: false,
      keywords: [newSubcategoryName.trim().toLowerCase()]
    })
    setCategories(updated)
    setNewSubcategoryName('')
  }

  const handleRemoveSubcategory = (catIndex: number, subIndex: number) => {
    const updated = [...categories]
    updated[catIndex].subcategories.splice(subIndex, 1)
    setCategories(updated)
  }

  const handleAddInstallment = () => {
    if (!newInstallment.name.trim() || !newInstallment.monthlyValue) return
    setInstallments([
      ...installments,
      {
        name: newInstallment.name.trim(),
        category: newInstallment.category,
        monthlyValue: parseFloat(newInstallment.monthlyValue) || 0,
        currentInstallment: 1,
        totalInstallments: parseInt(newInstallment.totalInstallments) || 12,
        endMonthYear: newInstallment.endMonthYear || '2027-12'
      }
    ])
    setNewInstallment({
      name: '',
      category: 'Transporte',
      monthlyValue: '',
      totalInstallments: '',
      endMonthYear: ''
    })
  }

  const handleRemoveInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index))
  }

  const handleTargetChange = (index: number, newPct: number) => {
    const updated = [...investmentTargets]
    updated[index].targetPercentage = Math.max(0, Math.min(100, newPct))
    setInvestmentTargets(updated)
  }

  if (!isOpen) return null

  const handleSaveAndComplete = () => {
    const config = {
      accounts: selectedAccounts,
      ingestionMethod: selectedIngestionMethod,
      categories,
      installments,
      investmentTargets
    }
    // Salva no localStorage para persistência imediata
    try {
      financialStorage.setItem('leaomed_user_custom_setup', JSON.stringify(config))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('leaomed_setup_updated', { detail: config }))
      }
    } catch (_) {}

    if (onSave) onSave(config)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] shadow-sm overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        {/* Header Superior do Wizard */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--capital-warning-soft,#fcf1dc)] text-[var(--capital-warning,#8b5b15)] border border-[var(--capital-warning,#8b5b15)]">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h2 id="wizard-title" className="font-display font-bold text-base md:text-lg text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                Personalização da Plataforma & Setup Inicial
                {isDemo && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] border border-[var(--capital-accent,#927025)]">
                    Modo Portfólio / Teste
                  </span>
                )}
              </h2>
              <p className="text-xs text-[var(--capital-muted,#242a2e)]">
                Configure suas contas, método de ingestão, categorias médicas e metas de patrimônio.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-2 rounded-xl text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] hover:bg-[var(--capital-card,#fff)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper / Indicador de Etapas */}
        <div className="grid grid-cols-5 border-b border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-[11px] font-bold">
          {[
            { step: 1, label: '1. Contas & Vínculos' },
            { step: 2, label: '2. Ingestão' },
            { step: 3, label: '3. Categorias' },
            { step: 4, label: '4. Financiamentos' },
            { step: 5, label: '5. Investimentos' },
          ].map(s => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`py-3 px-2 text-center transition-all border-b-2 flex flex-col items-center gap-1 ${
                currentStep === s.step 
                  ? 'border-[var(--capital-warning,#8b5b15)] text-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)]'
                  : currentStep > s.step
                    ? 'border-[var(--capital-accent,#927025)] text-[var(--capital-success,#157449)]'
                    : 'border-transparent text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)]'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo Dinâmico por Etapa (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">

          {/* ===================== ETAPA 1 ===================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[var(--capital-warning,#8b5b15)]" />
                  Quais contas e instituições você utiliza?
                </h3>
                <p className="text-xs text-[var(--capital-muted,#242a2e)] mt-1">
                  Defina a segregação entre sua Pessoa Jurídica (receitas médicas, plantões e tributos) e suas contas de Pessoa Física.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedAccounts.map(acc => (
                  <div 
                    key={acc}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-[var(--capital-success,#157449)]" />
                      <span className="text-xs font-semibold text-[var(--capital-text,#242a2e)]">{acc}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAccount(acc)}
                      className="text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] p-1 transition-colors"
                      title="Remover conta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Input para Adicionar Nova Conta */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Ex: XP Investimentos, BTG Pactual, Santander PJ..."
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddAccount()}
                  className="flex-1 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-4 py-2.5 text-xs text-[var(--capital-text,#242a2e)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  onClick={handleAddAccount}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--capital-button-text,#242a2e)] font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          )}

          {/* ===================== ETAPA 2 ===================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[var(--capital-success,#157449)]" />
                  Como prefere puxar seus dados para o app?
                </h3>
                <p className="text-xs text-[var(--capital-muted,#242a2e)] mt-1">
                  A plataforma foi construída para atender tanto quem quer 100% de automação quanto quem prefere importar faturas ou fotos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'INVOICE_IMPORT',
                    title: 'Importação de Faturas (PDF / CSV)',
                    desc: 'Faça upload da fatura do cartão ou extrato bancário. A IA lê cada linha, valor e categoriza automaticamente.',
                    icon: FileText,
                    badge: 'Recomendado'
                  },
                  {
                    id: 'SCREENSHOT_OCR',
                    title: 'Captura por Print / Extrato (OCR)',
                    desc: 'Envie um print da tela do seu app bancário ou Mobills pelo celular. Nosso parser visual consolida os totais.',
                    icon: Camera,
                    badge: 'Prático no Celular'
                  },
                  {
                    id: 'OPEN_FINANCE',
                    title: 'Open Finance Automático (Pluggy)',
                    desc: 'Conexão bancária oficial autorizada pelo Banco Central. Atualização contínua de saldos e transações.',
                    icon: Zap,
                    badge: '100% Automático'
                  },
                  {
                    id: 'MANUAL_ENTRY',
                    title: 'Lançamento Manual Rápido',
                    desc: 'Para despesas em dinheiro, transferências pontuais ou médicos que preferem total discrição e controle avulso.',
                    icon: Edit3,
                    badge: 'Sem Dependências'
                  },
                ].map(method => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedIngestionMethod(method.id as any)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      selectedIngestionMethod === method.id
                        ? 'border-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)] shadow-sm shadow-none'
                        : 'border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] hover:bg-[var(--capital-card,#f8fafc)] hover:border-[var(--capital-line,#e4dfd3)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`p-2 rounded-xl ${selectedIngestionMethod === method.id ? 'bg-amber-400 text-[var(--capital-button-text,#242a2e)]' : 'bg-[var(--capital-card,#fff)] text-[var(--capital-text,#242a2e)]'}`}>
                          <method.icon className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--capital-card,#fff)] text-[var(--capital-text,#242a2e)]">
                          {method.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--capital-text,#242a2e)] mb-1">{method.title}</h4>
                      <p className="text-xs text-[var(--capital-muted,#242a2e)] leading-relaxed">{method.desc}</p>
                    </div>
                    {selectedIngestionMethod === method.id && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--capital-warning,#8b5b15)] mt-3 pt-3 border-t border-[var(--capital-warning,#8b5b15)]">
                        <CheckCircle2 className="w-4 h-4" />
                        Método Ativo Selecionado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================== ETAPA 3 ===================== */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[var(--capital-accent,#927025)]" />
                  Categorias Médicas Padrão (Customizáveis)
                </h3>
                <p className="text-xs text-[var(--capital-muted,#242a2e)] mt-1">
                  Inicializado com o blueprint médico padrão da planilha (Hospital 01/02, Convênios, Consultório, Moradia, Transporte, etc.). Personalize os nomes como desejar.
                </p>
              </div>

              {/* Seletor de Categoria Pai */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[var(--capital-line,#e4dfd3)]">
                {categories.map((cat, idx) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategoryIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeCategoryIndex === idx
                        ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] shadow-xs'
                        : 'bg-[var(--capital-card,#f8fafc)] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-button-text,#211f19)]'
                    }`}
                  >
                    {cat.name} ({cat.subcategories.length})
                  </button>
                ))}
              </div>

              {/* Subcategorias da Categoria Selecionada */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--capital-text,#242a2e)] uppercase tracking-wider">
                    Subcategorias de {categories[activeCategoryIndex]?.name}:
                  </h4>
                  <span className="text-[11px] text-[var(--capital-muted,#242a2e)]">
                    Escopo: {categories[activeCategoryIndex]?.scope}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {categories[activeCategoryIndex]?.subcategories.map((sub, sIdx) => (
                    <div
                      key={sub.name}
                      className="flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-2 h-2 rounded-full ${sub.isFixed ? 'bg-amber-400' : 'bg-[var(--capital-button,#c7a354)]'}`} />
                        <span className="font-medium text-[var(--capital-text,#242a2e)] truncate">{sub.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveSubcategory(activeCategoryIndex, sIdx)}
                        className="text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] p-1 transition-colors"
                        title="Remover subcategoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adicionar Nova Subcategoria */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder={`Adicionar nova subcategoria em ${categories[activeCategoryIndex]?.name}...`}
                    value={newSubcategoryName}
                    onChange={e => setNewSubcategoryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddSubcategory(activeCategoryIndex)}
                    className="flex-1 rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-4 py-2 text-xs text-[var(--capital-text,#242a2e)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                  />
                  <button
                    onClick={() => handleAddSubcategory(activeCategoryIndex)}
                    className="px-4 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== ETAPA 4 ===================== */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-[var(--capital-accent,#927025)]" />
                  Financiamentos, Contratos & Parcelamentos Ativos
                </h3>
                <p className="text-xs text-[var(--capital-muted,#242a2e)] mt-1">
                  Cadastre seus compromissos de longo prazo (veículo, consultório, imóvel, cartões) para que a plataforma calcule o alívio mensal futuro do seu fluxo de caixa.
                </p>
              </div>

              {/* Lista Atual de Parcelamentos */}
              <div className="space-y-2">
                {installments.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[var(--capital-text,#242a2e)]">{item.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)] font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--capital-muted,#242a2e)] mt-0.5">
                        Término: {item.endMonthYear} • {item.totalInstallments} parcelas contratadas
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="font-mono font-bold text-sm text-[var(--capital-success,#157449)]">
                        {item.monthlyValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
                      </span>
                      <button
                        onClick={() => handleRemoveInstallment(idx)}
                        className="text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário para Adicionar Novo Financiamento */}
              <div className="p-4 rounded-2xl border border-dashed border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--capital-text,#242a2e)] uppercase tracking-wider">
                  Adicionar Novo Contrato ou Parcelamento:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <input
                    type="text"
                    placeholder="Descrição do Financiamento"
                    value={newInstallment.name}
                    onChange={e => setNewInstallment({ ...newInstallment, name: e.target.value })}
                    className="rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                  />
                  <input
                    type="number"
                    placeholder="Valor Mensal (R$)"
                    value={newInstallment.monthlyValue}
                    onChange={e => setNewInstallment({ ...newInstallment, monthlyValue: e.target.value })}
                    className="rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                  />
                  <input
                    type="number"
                    placeholder="Total de Parcelas"
                    value={newInstallment.totalInstallments}
                    onChange={e => setNewInstallment({ ...newInstallment, totalInstallments: e.target.value })}
                    className="rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                  />
                  <input
                    type="month"
                    placeholder="Mês de Término"
                    value={newInstallment.endMonthYear}
                    onChange={e => setNewInstallment({ ...newInstallment, endMonthYear: e.target.value })}
                    className="rounded-xl bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                  />
                </div>
                <button
                  onClick={handleAddInstallment}
                  className="w-full py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Incluir Financiamento
                </button>
              </div>
            </div>
          )}

          {/* ===================== ETAPA 5 ===================== */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="font-display font-bold text-lg text-[var(--capital-text,#242a2e)] flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[var(--capital-warning,#8b5b15)]" />
                  Metas de Balanceamento de Investimentos
                </h3>
                <p className="text-xs text-[var(--capital-muted,#242a2e)] mt-1">
                  Defina a meta percentual ideal para cada classe da sua carteira (da planilha: CDB, Ações, FIIs, Tesouro, Internacional, Cripto).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {investmentTargets.map((item, idx) => (
                  <div
                    key={item.assetClass}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]"
                  >
                    <span className="text-xs font-semibold text-[var(--capital-text,#242a2e)]">{item.assetClass}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.targetPercentage}
                        onChange={e => handleTargetChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-16 rounded-lg bg-[var(--capital-card,#f8fafc)] border border-[var(--capital-line,#e4dfd3)] px-2 py-1 text-xs text-center font-mono font-bold text-[var(--capital-warning,#8b5b15)] focus:outline-none focus:ring-1 focus:ring-amber-400"
                      />
                      <span className="text-xs text-[var(--capital-muted,#242a2e)] font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] flex items-center gap-2.5 text-xs text-[var(--capital-success,#157449)]">
                <ShieldCheck className="w-4 h-4 text-[var(--capital-success,#157449)] shrink-0" />
                <span>
                  Soma atual das metas:{' '}
                  <strong>{investmentTargets.reduce((a, b) => a + b.targetPercentage, 0)}%</strong>. O motor de rebalanceamento usará essas proporções para orientar seus aportes.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé do Wizard com Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#f8fafc)]">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-xl border border-[var(--capital-line,#e4dfd3)] text-xs font-bold text-[var(--capital-text,#242a2e)] hover:text-[var(--capital-text,#242a2e)] hover:bg-[var(--capital-card,#fff)] flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-none"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSaveAndComplete}
              className="px-6 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              Concluir & Aplicar Personalização
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
