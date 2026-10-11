'use client'

import { AccessibleDialog } from './AccessibleDialog'

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
  const [parseDiagnostics, setParseDiagnostics] = useState<any[]>([])
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false)
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
    setParseDiagnostics([])
    setReviewAcknowledged(false)
    setIsSaved(false)

    try {
      // Validação prévia de tamanho para evitar erro 413 da Vercel
      for (let i = 0; i < filesToProcess.length; i++) {
        const f = filesToProcess[i]
        if (f.size > 4.2 * 1024 * 1024 && !f.type.startsWith('image/')) {
          throw new Error(`O arquivo "${f.name}" possui ${(f.size / (1024 * 1024)).toFixed(1)} MB e ultrapassa o limite de 4.2 MB do servidor. Por favor, divida o arquivo ou use a aba "Colar Texto".`)
        }
      }

      const formData = new FormData()
      for (let i = 0; i < filesToProcess.length; i++) {
        const rawFile = filesToProcess[i]
        const fileToUpload = await compressImageIfNeeded(rawFile)
        formData.append('files', fileToUpload)
      }

      if (passwordToUse || pdfPassword.trim()) {
        formData.append('password', (passwordToUse || pdfPassword).trim())
      }

      setStatusMessage('Lendo lançamentos da fatura ou planilha...')
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData
      }).catch(() => {
        throw new Error('Falha de conexão ao enviar o arquivo. Verifique sua rede ou use a aba "Colar Texto".')
      })

      let data: any = null
      const rawText = await res.text()
      try {
        data = JSON.parse(rawText)
      } catch (_) {
        if (res.status === 413) {
          throw new Error('O arquivo enviado ultrapassa o limite de 4.2 MB permitido pelo servidor. Por favor, envie um arquivo menor ou copie o texto para a aba "Colar Texto".')
        }
        if (res.status === 504) {
          throw new Error('O servidor excedeu o tempo limite para processar este arquivo. Tente enviar a fatura oficial ou use a aba "Colar Texto".')
        }
        throw new Error(`Falha no servidor (${res.status}). Verifique o arquivo e tente novamente.`)
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
      const diagnostics: any[] = []
      if (Array.isArray(data.batches)) {
        for (const batch of data.batches) {
          if (batch.diagnostics) diagnostics.push(batch.diagnostics)
          if (Array.isArray(batch.transactions)) {
            allTxs.push(...batch.transactions)
          }
        }
      }

      if (allTxs.length === 0) {
        setStatusMessage('Arquivo lido, porém nenhum lançamento com valor foi identificado.')
      } else {
        setParsedTransactions(allTxs)
        setParseDiagnostics(diagnostics)
        const needsReview = diagnostics.some(diagnostic => diagnostic?.requiresReview || diagnostic?.requires_review)
        setStatusMessage(needsReview
          ? `⚠️ ${allTxs.length} lançamentos extraídos. Revise a conciliação antes de salvar.`
          : `✅ ${allTxs.length} lançamentos extraídos da fatura com sucesso!`)
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
    setParseDiagnostics([])
    setReviewAcknowledged(false)
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
      const diagnostics: any[] = []
      if (Array.isArray(data.batches)) {
        for (const batch of data.batches) {
          if (batch.diagnostics) diagnostics.push(batch.diagnostics)
          if (Array.isArray(batch.transactions)) {
            allTxs.push(...batch.transactions)
          }
        }
      }

      if (allTxs.length === 0) {
        setStatusMessage('Texto processado, mas nenhum lançamento com valor foi identificado.')
      } else {
        setParsedTransactions(allTxs)
        setParseDiagnostics(diagnostics)
        const needsReview = diagnostics.some(diagnostic => diagnostic?.requiresReview || diagnostic?.requires_review)
        setStatusMessage(needsReview
          ? `⚠️ ${allTxs.length} lançamentos identificados. Revise a conciliação antes de salvar.`
          : `✅ ${allTxs.length} lançamentos identificados com sucesso!`)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao analisar texto colado.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveToDatabase = async () => {
    if (parsedTransactions.length === 0) return
    const needsReview = parseDiagnostics.some(diagnostic => diagnostic?.requiresReview || diagnostic?.requires_review)
    if (needsReview && !reviewAcknowledged) {
      setErrorMessage('Confirme que revisou a conciliação e os itens rejeitados antes de salvar.')
      return
    }

    setIsUploading(true)
    setStatusMessage('Salvando e categorizando lançamentos no banco de dados...')
    try {
      const formatted = parsedTransactions.flatMap(t => {
        const rawAmount = typeof t.val === 'number' ? t.val : parseFloat(t.val) || 0
        const entryType = t.entryType || (t.isCardBillPayment ? 'bill_payment' : 'purchase')
        if (entryType === 'bill_payment' || t.isCardBillPayment) return []
        const signedAmount = typeof t.signedAmount === 'number' ? t.signedAmount : rawAmount
        const isCredit = t.direction === 'credit' || entryType === 'refund' || signedAmount < 0
        const amount = isCredit ? Math.abs(signedAmount) : -Math.abs(signedAmount)

        return [{
          date: t.date,
          description: t.desc,
          amount,
          accountOrCard: t.accountOrCard,
          category: t.cat || 'Outros',
          subcategory: t.subcategory || 'Geral',
          isFixed: Boolean(t.isFixed),
          isIgnored: false
        }]
      })

      if (formatted.length === 0) throw new Error('A fatura não possui compras ou créditos elegíveis para salvar.')

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
    <AccessibleDialog onClose={onClose} labelledBy="document-upload-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--capital-card,#f8fafc)] backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-xl overflow-hidden shadow-sm border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] transition-all p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
              <UploadCloud className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 id="document-upload-title" className="font-display text-base font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                Anexar Fatura
              </h3>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                Faturas em PDF, fotos ou texto direto do extrato bancário
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Fechar janela"
            className="p-1.5 rounded-full hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alternador de Modo: Arquivo ou Colar Texto */}
        {!isSaved && parsedTransactions.length === 0 && (
          <div className="grid grid-cols-2 p-1 bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] rounded-xl text-xs font-bold border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
            <button
              onClick={() => setActiveTab('FILE')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'FILE'
                  ? 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] shadow-xs'
                  : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Arquivo (PDF / Foto)</span>
            </button>
            <button
              onClick={() => setActiveTab('PASTE')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'PASTE'
                  ? 'bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] shadow-xs'
                  : 'text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#242a2e)]'
              }`}
            >
              <ClipboardType className="w-3.5 h-3.5" />
              <span>Colar Texto da Fatura</span>
            </button>
          </div>
        )}

        {/* Input Oculto de Arquivo */}
        <input 
          aria-label="Selecionar documentos para importação"
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xlsx,.xls,image/png,image/jpeg,image/webp,.csv,.txt"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Modo 1: Área de Seleção de Arquivo */}
        {!isSaved && parsedTransactions.length === 0 && activeTab === 'FILE' && (
          <button type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] hover:border-[var(--capital-accent,#927025)] rounded-2xl p-8 text-center cursor-pointer bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] hover:bg-[var(--capital-soft,#f6f0df)] dark:hover:bg-[var(--capital-soft,#f6f0df)] transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-4 rounded-2xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] group-hover:scale-105 transition-transform shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] group-hover:text-[var(--capital-success,#157449)] dark:group-hover:text-[var(--capital-success,#157449)] transition-colors">
                Toque para selecionar a fatura ou planilha
              </p>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] mt-1">
                Suporta PDF original (com ou sem senha), Excel (.xlsx/.xls) ou fotos
              </p>
            </div>
          </button>
        )}

        {/* Opção Prévia de Senha do Banco */}
        {!isSaved && parsedTransactions.length === 0 && activeTab === 'FILE' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] px-1">
              <button
                type="button"
                onClick={() => setShowAdvancePassword(!showAdvancePassword)}
                className="flex items-center gap-1.5 hover:text-[var(--capital-success,#157449)] dark:hover:text-[var(--capital-success,#157449)] transition-colors cursor-pointer font-medium"
              >
                <Lock className="w-3.5 h-3.5 text-[var(--capital-warning,#8b5b15)]" />
                <span>{showAdvancePassword ? 'Ocultar campo de senha' : 'O PDF possui senha? Clique para informar'}</span>
              </button>
              <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">Itaú, Bradesco, Santander, XP, etc.</span>
            </div>

            {showAdvancePassword && (
              <div className="p-3 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] space-y-1.5 animate-in fade-in">
                <label className="text-[11px] font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-[var(--capital-success,#157449)]" />
                  Senha de abertura do PDF (opcional)
                </label>
                <input
                  type="text"
                  aria-label="Senha de abertura do PDF"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Ex: Primeiros dígitos do CPF ou data de nascimento"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* Alerta e Desbloqueio de Senha Obrigatória */}
        {requiresPassword && (
          <div className="p-4 rounded-2xl bg-[var(--capital-warning-soft,#fcf1dc)] dark:bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] dark:border-[var(--capital-warning,#8b5b15)] space-y-3 animate-in fade-in slide-in-from-top-2 shadow-xs">
            <div className="flex items-center gap-2 text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] font-bold text-xs">
              <Lock className="w-4 h-4 text-[var(--capital-warning,#8b5b15)] shrink-0" />
              <span>{isWrongPassword ? 'Senha incorreta para a fatura' : 'Fatura protegida por senha'}</span>
            </div>
            <p className="text-[11px] text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] leading-relaxed">
              {isWrongPassword
                ? 'A senha informada não conseguiu abrir este arquivo. Geralmente são os primeiros 4 a 6 dígitos do seu CPF ou sua data de nascimento (ex: 15051980).'
                : 'O seu banco protegeu este arquivo por senha. Digite a senha abaixo para que possamos extrair todos os lançamentos instantaneamente.'}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                autoFocus
                aria-label="Senha de abertura do PDF"
                value={pdfPassword}
                onChange={(e) => setPdfPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && pdfPassword.trim() && !isUploading) {
                    handleUnlockWithPassword()
                  }
                }}
                placeholder="Digite a senha da fatura"
                className="w-full flex-1 px-3 py-2 rounded-xl border border-[var(--capital-warning,#8b5b15)] dark:border-[var(--capital-warning,#8b5b15)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder:text-[var(--capital-muted,#242a2e)] focus:outline-hidden focus:border-[var(--capital-warning,#8b5b15)] font-mono shadow-inner"
              />
              <button
                onClick={handleUnlockWithPassword}
                disabled={isUploading || !pdfPassword.trim()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs active:scale-95 shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
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
              aria-label="Texto da fatura ou extrato"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Cole aqui o texto copiado da sua fatura ou extrato do app bancário..."
              className="w-full h-36 p-3 rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] placeholder:text-[var(--capital-muted,#242a2e)] focus:outline-hidden focus:border-[var(--capital-accent,#927025)] font-mono resize-none"
            />
            <button
              onClick={handleProcessPastedText}
              disabled={isUploading || !pastedText.trim()}
              className="w-full py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-none cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Processar Texto da Fatura</span>
            </button>
          </div>
        )}

        {/* Mensagens de Carregamento e Erro */}
        {isUploading && (
          <div role="status" className="p-4 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] flex items-center gap-3 text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && !requiresPassword && (
          <div role="alert" className="p-3.5 rounded-xl bg-[var(--capital-danger-soft,#fcecec)] dark:bg-[var(--capital-danger-soft,#fcecec)] border border-[var(--capital-danger,#ad3333)] dark:border-[var(--capital-danger,#ad3333)] flex items-center gap-2.5 text-xs text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Listagem Prévia dos Lançamentos Extraídos */}
        {parsedTransactions.length > 0 && !isSaved && (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
              <span>Prévia dos Lançamentos ({parsedTransactions.length})</span>
              <span className={parseDiagnostics.some(diagnostic => diagnostic?.requiresReview || diagnostic?.requires_review) ? 'text-[var(--capital-warning,#8b5b15)]' : 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'}>
                {parseDiagnostics.some(diagnostic => diagnostic?.requiresReview || diagnostic?.requires_review) ? 'Revisão necessária' : 'Pronto para importar'}
              </span>
            </div>

            {parseDiagnostics.map((diagnostic, index) => (
              <div key={`${diagnostic.profile_id || diagnostic.profile?.id || 'perfil'}-${index}`} className="rounded-xl border border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] px-3 py-2 text-[11px] text-[var(--capital-muted,#242a2e)]">
                <strong className="text-[var(--capital-text,#242a2e)]">Perfil: {diagnostic.profile_label || diagnostic.profile?.label || 'Genérico'}</strong>
                {' · '}Conciliação: {typeof diagnostic.delta === 'number' ? `diferença de R$ ${Math.abs(diagnostic.delta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'sem total declarado'}
                {Array.isArray(diagnostic.rejected) && diagnostic.rejected.length > 0 ? ` · ${diagnostic.rejected.reduce((sum: number, item: any) => sum + (item.count || 0), 0)} itens rejeitados` : ''}
              </div>
            ))}

            {parseDiagnostics.some(diagnostic => diagnostic?.requiresReview || diagnostic?.requires_review) && (
              <label className="flex items-start gap-2 rounded-xl border border-[var(--capital-warning,#8b5b15)] bg-[var(--capital-warning-soft,#fcf1dc)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)]">
                <input type="checkbox" checked={reviewAcknowledged} onChange={event => setReviewAcknowledged(event.target.checked)} className="mt-0.5" />
                <span>Revisei a conciliação e confirmo os lançamentos exibidos antes de gravá-los.</span>
              </label>
            )}

            <div className="flex-1 overflow-y-auto border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] rounded-xl divide-y divide-[var(--capital-line,#e4dfd3)] dark:divide-[var(--capital-line,#e4dfd3)] max-h-56">
              {parsedTransactions.map((tx, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <span className="font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] truncate block">
                      {tx.desc}
                    </span>
                    <span className="text-[10px] text-[var(--capital-muted,#242a2e)]">
                      {tx.date} • {tx.cat || 'Geral'}
                    </span>
                  </div>
                  <span className={`font-mono font-bold shrink-0 ${tx.val < 0 ? 'text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]' : 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'}`}>
                    R$ {Math.abs(tx.val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setParsedTransactions([]); setParseDiagnostics([]); setReviewAcknowledged(false) }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--capital-muted,#242a2e)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveToDatabase}
                disabled={isUploading || (parseDiagnostics.some(diagnostic => diagnostic?.requiresReview || diagnostic?.requires_review) && !reviewAcknowledged)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold text-xs transition-all shadow-md shadow-none active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span>Confirmar & Salvar no Banco</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {isSaved && (
          <div className="p-6 rounded-2xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] mx-auto" />
            <h4 className="font-bold text-sm text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
              Fatura Importada com Sucesso!
            </h4>
            <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
              Os lançamentos foram consolidados e integrados ao seu banco de dados.
            </p>
          </div>
        )}
      </div>
    </AccessibleDialog>
  )
}
