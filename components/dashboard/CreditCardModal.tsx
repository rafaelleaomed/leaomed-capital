'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CreditCard, Check, Trash2, Plus, Sparkles, Building2 } from 'lucide-react'
import { CreditCardItem, CreditCardStore } from '@/utils/creditCardStore'

interface CreditCardModalProps {
  isOpen: boolean
  onClose: () => void
  cardToEdit?: CreditCardItem | null
  onSaved?: () => void
}

const COLOR_OPTIONS = [
  { label: 'Black / Carbon', value: 'bg-[var(--capital-card,#f8fafc)]', border: 'border-[var(--capital-line,#e4dfd3)]', text: 'text-[var(--capital-text,#242a2e)]' },
  { label: 'Laranja (Itaú)', value: 'bg-orange-600', border: 'border-[var(--capital-warning,#8b5b15)]', text: 'text-[var(--capital-text,#242a2e)]' },
  { label: 'Roxo (Nubank)', value: 'bg-[var(--capital-button,#c7a354)]', border: 'border-[var(--capital-accent,#927025)]', text: 'text-[var(--capital-text,#242a2e)]' },
  { label: 'Azul (BTG / Caixa / Inter)', value: 'bg-[var(--capital-button,#c7a354)]', border: 'border-[var(--capital-accent,#927025)]', text: 'text-[var(--capital-text,#242a2e)]' },
  { label: 'Esmeralda (Sicredi / Safra)', value: 'bg-[var(--capital-button,#c7a354)]', border: 'border-[var(--capital-accent,#927025)]', text: 'text-[var(--capital-text,#242a2e)]' },
  { label: 'Vermelho (Bradesco / Santander)', value: 'bg-rose-600', border: 'border-[var(--capital-danger,#ad3333)]', text: 'text-[var(--capital-text,#242a2e)]' },
  { label: 'Dourado / Gold', value: 'bg-amber-600', border: 'border-[var(--capital-warning,#8b5b15)]', text: 'text-[var(--capital-text,#242a2e)]' },
]

const BADGE_PRESETS = [
  'Principal (PF) - Veículo & Pessoal',
  'Casa & Eletro (PF)',
  'Tecnologia & Família (PF)',
  'Supermercado & Alimentação',
  'Viagens & Milhas',
  'Despesas Médicas & Consultório',
  'Uso Geral',
]

const INSTITUTION_OPTIONS = [
  'C6 Bank',
  'Banco Itaú',
  'Nubank',
  'Banco Inter',
  'BTG Pactual',
  'XP Investimentos',
  'Bradesco',
  'Santander',
  'Banco do Brasil',
  'Caixa Econômica',
  'Outro'
]

export default function CreditCardModal({
  isOpen,
  onClose,
  cardToEdit,
  onSaved
}: CreditCardModalProps) {
  const isEditing = Boolean(cardToEdit)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('C6 Bank')
  const [limit, setLimit] = useState(20000)
  const [spent, setSpent] = useState(0)
  const [closingDay, setClosingDay] = useState(20)
  const [dueDay, setDueDay] = useState(28)
  const [additionalCards, setAdditionalCards] = useState('Nenhum')
  const [cardholder, setCardholder] = useState('Titular do cartão')
  const [lastDigits, setLastDigits] = useState('4821')
  const [badge, setBadge] = useState('Principal (PF) - Veículo & Pessoal')
  const [color, setColor] = useState('bg-[var(--capital-card,#f8fafc)]')
  const [entityType, setEntityType] = useState<'PF' | 'PJ'>('PF')
  const [notes, setNotes] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name)
      setInstitution(cardToEdit.institution || 'C6 Bank')
      setLimit(cardToEdit.limit || 0)
      setSpent(cardToEdit.spent || 0)
      setClosingDay(cardToEdit.closingDay || 20)
      setDueDay(cardToEdit.dueDay || 28)
      setAdditionalCards(cardToEdit.additionalCards || 'Nenhum')
      setCardholder(cardToEdit.cardholder || 'Titular do cartão')
      setLastDigits(cardToEdit.lastDigits || '4821')
      setBadge(cardToEdit.badge || 'Principal (PF)')
      setColor(cardToEdit.color || 'bg-[var(--capital-card,#f8fafc)]')
      setEntityType(cardToEdit.entityType || 'PF')
      setNotes(cardToEdit.notes || '')
    } else {
      setName('')
      setInstitution('C6 Bank')
      setLimit(15000)
      setSpent(0)
      setClosingDay(15)
      setDueDay(22)
      setAdditionalCards('Nenhum')
      setCardholder('Titular do cartão')
      setLastDigits('1234')
      setBadge('Principal (PF)')
      setColor('bg-[var(--capital-card,#f8fafc)]')
      setEntityType('PF')
      setNotes('')
    }
    setIsDeleting(false)
  }, [cardToEdit, isOpen])

  if (!isOpen || !mounted) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (isEditing && cardToEdit) {
      CreditCardStore.updateCard(cardToEdit.id, {
        name: name.trim(),
        institution,
        limit: Number(limit) || 0,
        spent: Number(spent) || 0,
        closingDay: Number(closingDay) || 1,
        dueDay: Number(dueDay) || 1,
        additionalCards: additionalCards.trim(),
        cardholder: cardholder.trim(),
        lastDigits: lastDigits.trim(),
        badge: badge.trim(),
        color,
        entityType,
        notes: notes.trim()
      })
    } else {
      CreditCardStore.addCard({
        name: name.trim(),
        institution,
        limit: Number(limit) || 0,
        spent: Number(spent) || 0,
        closingDay: Number(closingDay) || 1,
        dueDay: Number(dueDay) || 1,
        additionalCards: additionalCards.trim(),
        cardholder: cardholder.trim(),
        lastDigits: lastDigits.trim(),
        badge: badge.trim(),
        color,
        entityType,
        status: 'Fatura auditada',
        notes: notes.trim()
      })
    }

    onSaved?.()
    onClose()
  }

  const handleDelete = () => {
    if (!cardToEdit) return
    CreditCardStore.deleteCard(cardToEdit.id)
    onSaved?.()
    onClose()
  }

  const handleAdjustLimit = (delta: number) => {
    setLimit(prev => Math.max(1000, prev + delta))
  }

  return createPortal(
    <div 
      onClick={onClose}
      className="capital-dialog fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-xl rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] shadow-sm overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] border border-[var(--capital-accent,#927025)]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                {isEditing ? 'Editar Cartão de Crédito' : 'Adicionar Novo Cartão de Crédito'}
              </h2>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                Ajuste de limite, adicionais, vencimento e preferências
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-muted,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pré-visualização do Cartão Físico/Virtual */}
        <div className="p-5 bg-[var(--capital-soft,#f6f0df)] from-slate-100 to-slate-50 dark:from-slate-950 dark:to-slate-900/50 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex justify-center">
          <div className={`w-full max-w-md h-44 rounded-2xl ${color} p-4 shadow-sm text-[var(--capital-text,#242a2e)] flex flex-col justify-between relative overflow-hidden border border-[var(--capital-line,#e4dfd3)]`}>
            {/* Efeito metalizado */}
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[var(--capital-card,#fff)] blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-5 rounded bg-[var(--capital-warning-soft,#fcf1dc)] flex items-center justify-center shadow-xs">
                  <div className="w-5 h-3.5 border border-[var(--capital-warning,#8b5b15)] rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="border-r border-[var(--capital-warning,#8b5b15)]"></div>
                    <div></div>
                  </div>
                </div>
                <span className="text-[11px] font-bold tracking-wide uppercase opacity-80">{institution}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--capital-card,#fff)] backdrop-blur-xs border border-[var(--capital-line,#e4dfd3)]">
                {badge || 'Cartão'}
              </span>
            </div>

            <div className="space-y-1 z-10">
              <div className="font-mono text-sm tracking-widest flex items-center gap-3 opacity-90">
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span className="font-bold">{lastDigits || '0000'}</span>
              </div>
              <div className="text-[11px] font-medium tracking-wide uppercase truncate">
                {name || 'Nome do Cartão'}
              </div>
            </div>

            <div className="flex items-end justify-between text-xs z-10 pt-1 border-t border-[var(--capital-line,#e4dfd3)]">
              <div>
                <span className="text-[9px] uppercase tracking-wider block opacity-70">Titular</span>
                <span className="font-bold text-[11px] truncate">{cardholder || 'Titular do cartão'}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider block opacity-70">Limite Total</span>
                <span className="font-mono font-semibold text-sm text-[var(--capital-success,#157449)]">
                  R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Nome e Instituição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Nome de Identificação *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cartão C6 Carbon Black PF"
                className="w-full px-3 py-2 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Banco / Instituição Emissora
              </label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)] cursor-pointer"
              >
                {INSTITUTION_OPTIONS.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Limite de Crédito com Ajuste Rápido */}
          <div className="p-3.5 rounded-2xl bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--capital-accent,#927025)]" />
                <span>Limite Total de Crédito (R$) *</span>
              </label>
              <span className="font-mono font-semibold text-sm text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)]">
                R$ {limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--capital-muted,#242a2e)] font-mono font-bold">R$</span>
                <input
                  type="number"
                  step="100"
                  min="500"
                  required
                  value={limit || ''}
                  onChange={(e) => setLimit(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-accent,#927025)] dark:border-[var(--capital-accent,#927025)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--capital-accent,#927025)]"
                />
              </div>

              {/* Botões rápidos para aumentar limite */}
              <button
                type="button"
                onClick={() => handleAdjustLimit(5000)}
                className="px-2.5 py-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] hover:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] font-bold text-[11px] border border-[var(--capital-accent,#927025)] cursor-pointer"
                title="Aumentar R$ 5.000 no limite"
              >
                +5k
              </button>
              <button
                type="button"
                onClick={() => handleAdjustLimit(10000)}
                className="px-2.5 py-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] hover:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] font-bold text-[11px] border border-[var(--capital-accent,#927025)] cursor-pointer"
                title="Aumentar R$ 10.000 no limite"
              >
                +10k
              </button>
              <button
                type="button"
                onClick={() => handleAdjustLimit(20000)}
                className="px-2.5 py-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] hover:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] font-bold text-[11px] border border-[var(--capital-accent,#927025)] cursor-pointer"
                title="Aumentar R$ 20.000 no limite"
              >
                +20k
              </button>
            </div>
          </div>

          {/* Vencimento e Fechamento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Fechamento
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">Dia</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={(e) => setClosingDay(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-center font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Vencimento
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">Dia</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-center font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Fim do Número
              </label>
              <input
                type="text"
                maxLength={4}
                value={lastDigits}
                onChange={(e) => setLastDigits(e.target.value)}
                placeholder="4821"
                className="w-full px-2 py-1.5 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-center font-mono font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Adicionais
              </label>
              <input
                type="text"
                value={additionalCards}
                onChange={(e) => setAdditionalCards(e.target.value)}
                placeholder="Ex: 1 (Esposa)"
                className="w-full px-2 py-1.5 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
              />
            </div>
          </div>

          {/* Titular e Rótulo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Titular do Cartão
              </label>
              <input
                type="text"
                value={cardholder}
                onChange={(e) => setCardholder(e.target.value)}
                placeholder="Titular do cartão"
                className="w-full px-3 py-2 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
                Finalidade / Rótulo
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Principal (PF) - Veículo & Pessoal"
                className="w-full px-3 py-2 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
              />
            </div>
          </div>

          {/* Chips de Sugestões de Rótulos */}
          <div>
            <span className="text-[10px] text-[var(--capital-muted,#242a2e)] block mb-1.5 font-medium">Sugestões rápidas de finalidade:</span>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBadge(p)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                    badge === p 
                      ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)]'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Cor do Cartão */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1.5">
              Cor Visual do Cartão
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    color === c.value 
                      ? 'border-[var(--capital-accent,#927025)] ring-2 ring-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)]'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-line,#e4dfd3)]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${c.value} shrink-0 border border-[var(--capital-line,#e4dfd3)]`} />
                  <span className="text-[10px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Observações / Notas */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">
              Observações (Ex: Parcelamentos vinculados)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Parcela Lava e Seca Midea (R$ 355,00) / Entrada Veículo"
              className="w-full px-3 py-2 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]"
            />
          </div>

          {/* Rodapé / Ações */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
            {isEditing && (
              <div>
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[var(--capital-danger,#ad3333)] font-bold">Confirmar exclusão?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
                    >
                      Sim, Excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-2 py-1.5 text-xs text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)]"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="flex items-center gap-1.5 text-[var(--capital-danger,#ad3333)] hover:text-[var(--capital-danger,#ad3333)] font-bold text-xs cursor-pointer p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Cartão</span>
                  </button>
                )}
              </div>
            )}

            <div className={`flex items-center gap-2.5 ${!isEditing ? 'ml-auto' : ''}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)] text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-none cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Salvar Alterações' : 'Criar Cartão'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
