'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X, ArrowRight } from 'lucide-react'
import { GranularTransactionStore } from '@/utils/granularTransactionStore'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentUploadModal({ isOpen, onClose, onSuccess }: DocumentUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [parsedTransactions, setParsedTransactions] = useState<any[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setStatusMessage('Lendo arquivo e extraindo dados com precisão...')
    setErrorMessage(null)
    setParsedTransactions([])
    setIsSaved(false)

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao processar o arquivo enviado.')
      }

      const allTxs: any[] = []
      if (Array.isArray(data.batches)) {
        for (const batch of data.batches) {
          if (Array.isArray(batch.transactions)) {
            allTxs.push(...batch.transactions)
          }
        }
      }

      if (allTxs.length === 0) {
        setStatusMessage('Arquivo processado, mas nenhum lançamento com valor foi identificado.')
      } else {
        setParsedTransactions(allTxs)
        setStatusMessage(`✅ ${allTxs.length} lançamentos extraídos da fatura com sucesso!`)
      }
    } catch (err: any) {
      console.error('Erro no upload de fatura:', err)
      setErrorMessage(err.message || 'Erro ao processar arquivo. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveToDatabase = async () => {
    if (parsedTransactions.length === 0) return

    setIsUploading(true)
    setStatusMessage('Salvando e categorizando lançamentos no banco de dados...')
    setErrorMessage(null)

    try {
      const formatted = parsedTransactions.map(t => ({
        date: t.date,
        description: t.desc,
        amount: t.val,
        category: t.cat || 'Outros',
        subcategory: t.subcategory || 'Geral',
        isFixed: Boolean(t.isFixed),
        isIgnored: Boolean(t.isCardBillPayment)
      }))

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: formatted })
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Erro ao persistir transações.')
      }

      setIsSaved(true)
      setStatusMessage(`✅ ${result.insertedCount || formatted.length} lançamentos gravados com sucesso!`)
      if (onSuccess) onSuccess()

      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 1200)
    } catch (err: any) {
      console.error('Erro ao salvar no banco:', err)
      setErrorMessage(err.message || 'Falha ao salvar no banco.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all p-6 space-y-4 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UploadCloud className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Anexar Fatura
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faturas em PDF ou imagens de comprovantes e extratos
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Oculto de Arquivo */}
        <input 
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp,.csv,.txt"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Área de Seleção */}
        {!isSaved && parsedTransactions.length === 0 && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-white/15 hover:border-emerald-500/50 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Toque para selecionar a fatura ou comprovante
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Suporta PDF, PNG, JPG de faturas bancárias ou extratos
              </p>
            </div>
          </div>
        )}

        {/* Mensagens de Carregamento e Erro */}
        {isUploading && (
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Listagem Prévia dos Lançamentos Extraídos */}
        {parsedTransactions.length > 0 && !isSaved && (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Prévia dos Lançamentos ({parsedTransactions.length})</span>
              <span className="text-emerald-600 dark:text-emerald-400">Pronto para importar</span>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-white/10 rounded-xl divide-y divide-slate-100 dark:divide-white/5 max-h-56">
              {parsedTransactions.map((tx, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {tx.desc}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {tx.date} • {tx.cat || 'Geral'}
                    </span>
                  </div>
                  <span className={`font-mono font-bold shrink-0 ${tx.val < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    R$ {Math.abs(tx.val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setParsedTransactions([])}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveToDatabase}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span>Confirmar & Salvar no Banco</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {isSaved && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Fatura Importada com Sucesso!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Os lançamentos foram consolidados e integrados ao seu banco de dados.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
