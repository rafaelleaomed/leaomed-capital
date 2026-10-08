'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X, ArrowRight, ClipboardType, FileUp, Lock, KeyRound } from 'lucide-react'
import { GranularTransactionStore } from '@/utils/granularTransactionStore'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Comprime imagens no navegador antes do upload para evitar estouro de 4.5MB na Vercel
 */
async function compressImageIfNeeded(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (file.size < 600 * 1024) return file // Menor que 600KB não precisa de compressão

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_DIM = 1600
        let { width, height } = img

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width)
          width = MAX_DIM
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height)
          height = MAX_DIM
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                resolve(compressed)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            0.82
          )
        } else {
          resolve(file)
        }
      }
      img.onerror = () => resolve(file)
      img.src = e.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

export function DocumentUploadModal({ isOpen, onClose, onSuccess }: DocumentUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'FILE' | 'PASTE'>('FILE')
  const [pastedText, setPastedText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [parsedTransactions, setParsedTransactions] = useState<any[]>([])
  const [isSaved, setIsSaved] = useState(false)
  
  // Suporte a PDFs protegidos por senha
  const [pdfPassword, setPdfPassword] = useState('')
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [isWrongPassword, setIsWrongPassword] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [showAdvancePassword, setShowAdvancePassword] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const executeUpload = async (filesToProcess: File[], passwordToUse?: string) => {
    if (!filesToProcess || filesToProcess.length === 0) return

    setIsUploading(true)
    setStatusMessage('Otimizando e analisando documento...')
    setErrorMessage(null)
    setParsedTransactions([])
    setIsSaved(false)

    try {
      const formData = new FormData()
      for (let i = 0; i < filesToProcess.length; i++) {
        const rawFile = filesToProcess[i]
        const fileToUpload = await compressImageIfNeeded(rawFile)
        formData.append('files', fileToUpload)
      }

      if (passwordToUse || pdfPassword.trim()) {
        formData.append('password', (passwordToUse || pdfPassword).trim())
      }

      setStatusMessage('Lendo lançamentos da fatura no servidor...')
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData
      }).catch(() => {
        throw new Error('Falha de conexão ao enviar o arquivo. Se estiver no celular, certifique-se de usar o PDF oficial ou use a aba "Colar Texto".')
      })

      let data: any = null
      const rawText = await res.text()
      try {
        data = JSON.parse(rawText)
      } catch (_) {
        if (!res.ok) {
          throw new Error('O servidor excedeu o tempo limite para processar este arquivo. Tente enviar o PDF oficial com a senha ou utilize a opção "Colar Texto".')
        }
        throw new Error('Resposta do servidor em formato inesperado.')
      }

      if (!res.ok || !data?.success) {
        if (data?.requiresPassword) {
          setRequiresPassword(true)
          setIsWrongPassword(Boolean(data?.isWrongPassword))
          setPendingFiles(filesToProcess)
          setErrorMessage(data?.error || 'Este PDF exige senha de abertura.')
          return
        }
        throw new Error(data?.error || 'Falha ao processar o arquivo enviado.')
      }

      // Sucesso na extração
      setRequiresPassword(false)
      setIsWrongPassword(false)
      setPendingFiles([])

      const allTxs: any[] = []
      if (Array.isArray(data.batches)) {
        for (const batch of data.batches) {
          if (Array.isArray(batch.transactions)) {
            allTxs.push(...batch.transactions)
          }
        }
      }

      if (allTxs.length === 0) {
        setStatusMessage('Arquivo lido, porém nenhum lançamento com valor foi identificado.')
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const fileArray = Array.from(files)
    setPendingFiles(fileArray)
    await executeUpload(fileArray)
  }

  const handleUnlockWithPassword = async () => {
    if (!pdfPassword.trim() || pendingFiles.length === 0) return
    await executeUpload(pendingFiles, pdfPassword)
  }

  const handleProcessPastedText = async () => {
    if (!pastedText.trim()) {
      setErrorMessage('Por favor, cole o texto do extrato ou fatura antes de continuar.')
      return
    }

    setIsUploading(true)
    setStatusMessage('Processando texto e identificando lançamentos...')
    setErrorMessage(null)
    setParsedTransactions([])
    setIsSaved(false)

    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedText,
          fileName: 'Texto_Colado_Fatura.txt'
        })
      }).catch(() => {
        throw new Error('Falha de conexão com o servidor.')
      })

      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Não foi possível encontrar transações no texto colado.')
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
        setStatusMessage('Texto processado, mas nenhum lançamento com valor foi identificado.')
      } else {
        setParsedTransactions(allTxs)
        setStatusMessage(`✅ ${allTxs.length} lançamentos identificados com sucesso!`)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao analisar texto colado.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveToDatabase = async () => {
    if (parsedTransactions.length === 0) return

    setIsUploading(true)
    setStatusMessage('Salvando e categorizando lançamentos no banco de dados...')
    try {
      const formatted = parsedTransactions.map(t => {
        const rawAmount = typeof t.val === 'number' ? t.val : parseFloat(t.val) || 0
        const isPayment = Boolean(t.isCardBillPayment)
        const amount = isPayment ? Math.abs(rawAmount) : -Math.abs(rawAmount)

        return {
          date: t.date,
          description: t.desc,
          amount,
          category: t.cat || 'Outros',
          subcategory: t.subcategory || 'Geral',
          isFixed: Boolean(t.isFixed),
          isIgnored: isPayment
        }
      })

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
      
      // Notifica componentes para sincronização imediata
      window.dispatchEvent(new CustomEvent('leaomed_transactions_updated'))
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
                Faturas em PDF, fotos ou texto direto do extrato bancário
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

        {/* Alternador de Modo: Arquivo ou Colar Texto */}
        {!isSaved && parsedTransactions.length === 0 && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs font-bold border border-slate-200/80 dark:border-white/5">
            <button
              onClick={() => setActiveTab('FILE')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'FILE'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Arquivo (PDF / Foto)</span>
            </button>
            <button
              onClick={() => setActiveTab('PASTE')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'PASTE'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ClipboardType className="w-3.5 h-3.5" />
              <span>Colar Texto da Fatura</span>
            </button>
          </div>
        )}

        {/* Input Oculto de Arquivo */}
        <input 
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp,.csv,.txt"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Modo 1: Área de Seleção de Arquivo */}
        {!isSaved && parsedTransactions.length === 0 && activeTab === 'FILE' && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-white/15 hover:border-emerald-500/50 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Toque para selecionar a fatura ou extrato
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Suporta PDF original (inclusive com senha do banco) ou fotos
              </p>
            </div>
          </div>
        )}

        {/* Opção Prévia de Senha do Banco */}
        {!isSaved && parsedTransactions.length === 0 && activeTab === 'FILE' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <button
                type="button"
                onClick={() => setShowAdvancePassword(!showAdvancePassword)}
                className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>{showAdvancePassword ? 'Ocultar campo de senha' : 'O PDF possui senha? Clique para informar'}</span>
              </button>
              <span className="text-[10px] text-slate-400">Itaú, Bradesco, Santander, XP, etc.</span>
            </div>

            {showAdvancePassword && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1.5 animate-in fade-in">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                  Senha de abertura do PDF (opcional)
                </label>
                <input
                  type="text"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Ex: Primeiros dígitos do CPF ou data de nascimento"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* Alerta e Desbloqueio de Senha Obrigatória */}
        {requiresPassword && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-xs">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{isWrongPassword ? 'Senha incorreta para a fatura' : 'Fatura protegida por senha'}</span>
            </div>
            <p className="text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed">
              {isWrongPassword
                ? 'A senha informada não conseguiu abrir este arquivo. Geralmente são os primeiros 4 a 6 dígitos do seu CPF ou sua data de nascimento (ex: 15051980).'
                : 'O seu banco protegeu este arquivo por senha. Digite a senha abaixo para que possamos extrair todos os lançamentos instantaneamente.'}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={pdfPassword}
                onChange={(e) => setPdfPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pdfPassword.trim() && !isUploading) {
                    handleUnlockWithPassword()
                  }
                }}
                placeholder="Digite a senha da fatura"
                className="flex-1 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 font-mono shadow-inner"
              />
              <button
                onClick={handleUnlockWithPassword}
                disabled={isUploading || !pdfPassword.trim()}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5" />
                )}
                <span>Desbloquear Fatura</span>
              </button>
            </div>
          </div>
        )}

        {/* Modo 2: Área de Colar Texto */}
        {!isSaved && parsedTransactions.length === 0 && activeTab === 'PASTE' && (
          <div className="space-y-3">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Cole aqui o texto copiado da sua fatura ou extrato do app bancário..."
              className="w-full h-36 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 font-mono resize-none"
            />
            <button
              onClick={handleProcessPastedText}
              disabled={isUploading || !pastedText.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Processar Texto da Fatura</span>
            </button>
          </div>
        )}

        {/* Mensagens de Carregamento e Erro */}
        {isUploading && (
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && !requiresPassword && (
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
