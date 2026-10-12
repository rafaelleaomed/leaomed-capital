'use client'

import { getFinancialScopeVersion } from '@/utils/userScopedStorage'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UploadCloud, 
  Camera, 
  Edit3, 
  Zap, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileCheck2,
  Trash2,
  Layers,
  BrainCircuit
} from 'lucide-react'
import { SmartCategorizationModal, IncomingTransaction } from './SmartCategorizationModal'

export interface ProcessedBatch {
  id: string
  fileName: string
  fileSize: string
  institution: string
  period: string
  totalAmount: number
  transactionCount: number
  diagnostics?: {
    profile_label?: string
    confidence?: 'high' | 'medium' | 'low'
    requiresReview?: boolean
    requires_review?: boolean
    delta?: number
    rejected?: Array<{ reason: string, count: number }>
  }
  transactions: {
    desc: string
    val: number
    cat: string
    subcategory?: string
    subdivision?: string
    date: string
    accountOrCard?: string
    isFixed?: boolean
    isCardBillPayment?: boolean
    installmentCurrent?: number | null
    installmentTotal?: number | null
    entryType?: IncomingTransaction['entryType']
    signedAmount?: number
    direction?: IncomingTransaction['direction']
  }[]
}

export function DataIngestionCenter({ isDemo = false }: { isDemo?: boolean }) {
  const financialScopeVersion = React.useRef(getFinancialScopeVersion()).current
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'PRINT' | 'MANUAL' | 'OPEN_FINANCE'>('INVOICE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [processedBatches, setProcessedBatches] = useState<ProcessedBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL')

  // Modal de Categorização Inteligente e Aprendizado de Regras
  const [isSmartCatModalOpen, setIsSmartCatModalOpen] = useState(false)
  const [pendingReviewTransactions, setPendingReviewTransactions] = useState<IncomingTransaction[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Formulário Manual Rápido
  const [manualForm, setManualForm] = useState({
    description: '',
    amount: '',
    category: 'Alimentação',
    type: 'DEBIT',
    date: new Date().toISOString().split('T')[0]
  })

  // Detecta a instituição bancária e período com base no nome do arquivo
  const detectInstitutionAndPeriod = (fileName: string): { institution: string; period: string } => {
    const lower = fileName.toLowerCase()
    let institution = 'Fatura / Extrato Bancário'
    if (lower.includes('c6')) institution = 'C6 Carbon Black Mastercard'
    else if (lower.includes('nu') || lower.includes('nubank')) institution = 'Nubank Ultravioleta'
    else if (lower.includes('itau') || lower.includes('personnalite')) institution = 'Itaú Personnalité Black'
    else if (lower.includes('inter') || lower.includes('pj') || lower.includes('juridica')) institution = 'Pessoa Jurídica'
    else if (lower.includes('bradesco')) institution = 'Bradesco Prime'
    else if (lower.includes('santander')) institution = 'Santander Select'
    else if (lower.includes('safra')) institution = 'Banco Safra'

    let period = 'Junho/2026'
    if (lower.includes('mai') || lower.includes('05')) period = 'Maio/2026'
    else if (lower.includes('jun') || lower.includes('06')) period = 'Junho/2026'
    else if (lower.includes('jul') || lower.includes('07')) period = 'Julho/2026'
    else if (lower.includes('ago') || lower.includes('08')) period = 'Agosto/2026'
    else if (lower.includes('set') || lower.includes('09')) period = 'Setembro/2026'

    return { institution, period }
  }

  // Gera transações realistas da gestão médica para cada arquivo
  const generateTransactionsForFile = (fileName: string, institution: string): { desc: string; val: number; cat: string; date: string }[] => {
    const lower = fileName.toLowerCase()
    if (lower.includes('inter') || lower.includes('pj')) {
      return [
        { desc: 'Plantão Hospitalar Geral', val: 9800.00, cat: 'Empresa - Receitas', date: '2026-06-05' },
        { desc: 'Repasse Convênios Clínicos', val: 7400.00, cat: 'Empresa - Receitas', date: '2026-06-10' },
        { desc: 'DARF Simples Nacional PJ', val: -4200.00, cat: 'Empresa - Despesas Fixas', date: '2026-06-20' },
        { desc: 'Mensalidade Assessoria Contábil', val: -1200.00, cat: 'Empresa - Despesas Fixas', date: '2026-06-18' },
        { desc: 'Insumos e Material Diagnóstico', val: -850.00, cat: 'Empresa - Despesas Fixas', date: '2026-06-22' }
      ]
    }
    if (lower.includes('c6')) {
      return [
        { desc: 'Posto de Combustível Ipiranga', val: -340.50, cat: 'Transporte', date: '2026-06-08' },
        { desc: 'Supermercado & Feira Familiar', val: -1150.80, cat: 'Casa', date: '2026-06-12' },
        { desc: 'Inscrição Congresso Brasileiro de Medicina', val: -1850.00, cat: 'Compras', date: '2026-06-15' },
        { desc: 'Restaurante & Almoço Clínico', val: -280.40, cat: 'Restaurantes', date: '2026-06-19' },
        { desc: 'Farmácia & Medicamentos Contínuos', val: -220.00, cat: 'Saúde', date: '2026-06-24' }
      ]
    }
    if (lower.includes('nu') || lower.includes('nubank')) {
      return [
        { desc: 'Livros e Assinaturas Médicas (UpToDate)', val: -480.00, cat: 'Serviços de assinaturas', date: '2026-06-04' },
        { desc: 'Streaming & TV por Assinatura (Netflix)', val: -129.90, cat: 'Serviços de assinaturas', date: '2026-06-07' },
        { desc: 'Delivery iFood Fim de Semana', val: -185.30, cat: 'Restaurantes', date: '2026-06-13' },
        { desc: 'Drogaria Araújo Medicamentos', val: -160.00, cat: 'Saúde', date: '2026-06-21' }
      ]
    }
    // Genérico Itaú / Outro
    return [
      { desc: 'Condomínio Residencial', val: -1850.00, cat: 'Casa', date: '2026-06-05' },
      { desc: 'Plano de Saúde Familiar', val: -1650.00, cat: 'Saúde', date: '2026-06-10' },
      { desc: 'Manutenção Preventiva Automotiva', val: -580.00, cat: 'Transporte', date: '2026-06-16' },
      { desc: 'Academia & Condicionamento', val: -350.00, cat: 'Saúde', date: '2026-06-20' }
    ]
  }

  // Processador Central de Múltiplos Arquivos (Drag and Drop ou Seletor) com OCR e IA
  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setIsProcessing(true)
    const fileArray = Array.from(files)
    setFeedback(`Lendo e analisando ${fileArray.length} arquivo(s) com OCR e IA LeãoMed...`)

    try {
      const formData = new FormData()
      fileArray.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData
      })

      let data: any = null
      try {
        data = await response.json()
        if (getFinancialScopeVersion() !== financialScopeVersion) return
      } catch (_) {
        data = null
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Erro no processamento do documento (${response.status})`)
      }

      if (Array.isArray(data.batches) && data.batches.length > 0) {
        const newBatches: ProcessedBatch[] = data.batches
        const totalTxs = newBatches.reduce((acc, b) => acc + b.transactionCount, 0)

        if (totalTxs === 0) {
          setIsProcessing(false)
          setFeedback('⚠️ Nenhum lançamento foi detectado no documento. Certifique-se de que a fatura contém linhas legíveis com data e valor.')
          return
        }

        setProcessedBatches(prev => [...newBatches, ...prev])
        setIsProcessing(false)
        const requiresReview = newBatches.some(batch => batch.diagnostics?.requiresReview || batch.diagnostics?.requires_review)
        setFeedback(requiresReview
          ? `⚠️ ${newBatches.length} arquivo(s) lido(s). Confirme os lançamentos na revisão antes de salvar.`
          : `✅ ${newBatches.length} arquivo(s) importado(s) com sucesso! Total de ${totalTxs} lançamentos reais identificados.`)

        // Transações reais para o modal de categorização inteligente
        const extractedTxs: IncomingTransaction[] = newBatches.flatMap(b => b.transactions
          .filter(t => t.entryType !== 'bill_payment' && !t.isCardBillPayment)
          .map(t => ({
          date: t.date,
          description: t.desc,
          amount: t.signedAmount ?? t.val,
          accountOrCard: t.accountOrCard || b.institution,
          category: t.cat,
          subcategory: t.subcategory,
          entryType: t.entryType,
          signedAmount: t.signedAmount,
          direction: t.direction,
          entityType: (b.institution.toLowerCase().includes('jurídica') || b.institution.toLowerCase().includes('pj')) ? 'PJ' : 'PF'
        })))

        setPendingReviewTransactions(extractedTxs)
        setTimeout(() => {
          setIsSmartCatModalOpen(true)
        }, 400)
        return
      }

      throw new Error('Nenhuma transação identificada no documento.')
    } catch (err: any) {
      console.warn('Falha no processamento via API:', err)
      setIsProcessing(false)
      setFeedback(`❌ ${err.message || 'Falha ao processar arquivo. Verifique o formato do documento e tente novamente.'}`)
    }
  }

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleSimulatedInvoiceUpload = (bankName: string) => {
    if (!isDemo || getFinancialScopeVersion() !== financialScopeVersion) return
    const fakeFile = new File(['conteudo simulado'], `Fatura_${bankName.replace(/\s+/g, '_')}_Junho2026.pdf`, { type: 'application/pdf' })
    processFiles([fakeFile])
  }

  const handleSimulatedPrintUpload = () => {
    if (!isDemo || getFinancialScopeVersion() !== financialScopeVersion) return
    setIsProcessing(true)
    setFeedback('Analisando imagem com OCR Inteligente... Identificando faturas e extratos de plantões...')

    setTimeout(() => {
      setIsProcessing(false)
      const mockPrintBatch: ProcessedBatch = {
        id: `batch-print-${Date.now()}`,
        fileName: 'Screenshot_Extrato_PJ_Plantao.png',
        fileSize: '420 KB',
        institution: 'Pessoa Jurídica (Extrato via Print)',
        period: 'Junho/2026',
        totalAmount: 14700.00,
        transactionCount: 4,
        transactions: [
          { desc: 'Plantão Hospital 01', val: 8500.00, cat: 'Empresa - Receitas', date: '2026-06-05' },
          { desc: 'Honorários Convênio 01', val: 6200.00, cat: 'Empresa - Receitas', date: '2026-06-10' },
          { desc: 'DARF Imposto PJ', val: -2150.00, cat: 'Empresa - Despesas Fixas', date: '2026-06-15' },
          { desc: 'Contabilidade Mensal', val: -850.00, cat: 'Empresa - Despesas Fixas', date: '2026-06-18' }
        ]
      }
      setProcessedBatches(prev => [mockPrintBatch, ...prev])
      setFeedback('✅ Print do extrato reconhecido com sucesso via OCR! Abrindo categorização inteligente...')
      
      setPendingReviewTransactions([
        { date: '2026-06-05', description: 'Plantão Hospital 01', amount: 8500.00, accountOrCard: 'Pessoa Jurídica', category: 'Empresa - Receitas', entityType: 'PJ' },
        { date: '2026-06-10', description: 'Honorários Convênio 01', amount: 6200.00, accountOrCard: 'Pessoa Jurídica', category: 'Empresa - Receitas', entityType: 'PJ' },
        { date: '2026-06-15', description: 'DARF Imposto PJ', amount: -2150.00, accountOrCard: 'Pessoa Jurídica', category: 'Empresa - Despesas Fixas', entityType: 'PJ' },
        { date: '2026-06-18', description: 'Contabilidade Mensal', amount: -850.00, accountOrCard: 'Pessoa Jurídica', category: 'Empresa - Despesas Fixas', entityType: 'PJ' }
      ])
      setTimeout(() => {
        setIsSmartCatModalOpen(true)
      }, 500)
    }, 1200)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.description || !manualForm.amount) return
    setIsProcessing(true)
    setFeedback('Registrando lançamento...')

    setTimeout(() => {
      setIsProcessing(false)
      const val = parseFloat(manualForm.amount) || 0
      const isCredit = manualForm.type === 'CREDIT'
      const finalVal = isCredit ? Math.abs(val) : -Math.abs(val)

      const singleBatch: ProcessedBatch = {
        id: `batch-manual-${Date.now()}`,
        fileName: 'Lançamento Manual Avulso',
        fileSize: '1 registro',
        institution: 'Lançamento Manual',
        period: 'Junho/2026',
        totalAmount: Math.abs(val),
        transactionCount: 1,
        transactions: [
          {
            desc: manualForm.description,
            val: finalVal,
            cat: manualForm.category,
            date: manualForm.date
          }
        ]
      }

      setProcessedBatches(prev => [singleBatch, ...prev])
      setFeedback(`✅ Lançamento "${manualForm.description}" no valor de R$ ${val.toFixed(2)} cadastrado com sucesso!`)
      setManualForm({
        description: '',
        amount: '',
        category: 'Alimentação',
        type: 'DEBIT',
        date: new Date().toISOString().split('T')[0]
      })
    }, 400)
  }

  // Lançamentos filtrados para exibição
  const displayedTransactions = selectedBatchId === 'ALL'
    ? processedBatches.flatMap(b => b.transactions)
    : processedBatches.find(b => b.id === selectedBatchId)?.transactions || []

  return (
    <div id="central-ingestao" className="rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] p-5 md:p-6 shadow-sm scroll-mt-24">
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-display text-base md:text-lg font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[var(--capital-success,#157449)]" />
            Central de Alimentação de Dados & Ingestão
          </h3>
          <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-0.5">
            Arraste faturas (PDF/CSV) de vários meses ou cartões simultaneamente, tire foto de extratos ou conecte via Open Finance.
          </p>
        </div>

        {/* Abas dos 4 Canais de Ingestão */}
        <div className="flex flex-wrap rounded-xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] p-1 text-xs font-semibold">
          {[
            { id: 'INVOICE', label: 'Fatura (PDF/CSV)', icon: FileText },
            { id: 'PRINT', label: 'Foto / Print (OCR)', icon: Camera },
            { id: 'MANUAL', label: 'Manual Rápido', icon: Edit3 },
            { id: 'OPEN_FINANCE', label: 'Open Finance', icon: Zap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setFeedback(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-semibold shadow-xs'
                  : 'text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] hover:text-[var(--capital-text,#242a2e)] dark:hover:text-[var(--capital-text,#f6f3e9)]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo por Canal */}
      <div className="space-y-4">

        {/* 1. FATURA (PDF / CSV) COM DRAG AND DROP REAL E SUPORTE A MÚLTIPLOS ARQUIVOS */}
        {activeTab === 'INVOICE' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Input nativo escondido */}
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept=".pdf,.csv,.ofx,.xlsx,.xls"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files)
              }}
              className="hidden"
            />

            {/* Dropzone Interativo */}
            <div 
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer select-none ${
                isDragging
                  ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] scale-[1.01] shadow-sm shadow-none'
                  : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] hover:border-[var(--capital-accent,#927025)] hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] flex items-center justify-center mx-auto mb-3">
                <UploadCloud className={`w-6 h-6 ${isDragging ? 'animate-bounce' : ''}`} />
              </div>
              <h4 className="font-bold text-sm md:text-base text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                {isDragging ? 'Solte os arquivos aqui para importar!' : 'Arraste múltiplos arquivos de faturas ou extratos'}
              </h4>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-1 max-w-md mx-auto">
                Suporta vários arquivos de uma só vez (PDF, CSV ou OFX de múltiplos cartões ou meses). Ou clique para selecionar do computador.
              </p>

              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] text-[11px] font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                <FileCheck2 className="w-3.5 h-3.5 text-[var(--capital-success,#157449)]" />
                <span>Multi-arquivo ativo: Extratos PJ, Faturas de Cartão e Comprovantes</span>
              </div>
            </div>

            {/* Atalhos Rápidos para Simulação de Demonstração e Aprendizado */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] font-medium">Ou teste com faturas simuladas:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSimulatedInvoiceUpload('C6 Carbon Black')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] font-bold hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)] transition-all border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]"
                >
                  + Fatura C6 Black
                </button>
                <button
                  onClick={() => handleSimulatedInvoiceUpload('Nubank')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] font-bold hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)] transition-all border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]"
                >
                  + Fatura Nubank
                </button>
                <button
                  onClick={() => handleSimulatedInvoiceUpload('Pessoa Jurídica')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] font-bold hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#232a2e)] transition-all border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]"
                >
                  + Extrato Pessoa Jurídica
                </button>
                <button
                  onClick={() => {
                    const sampleTxs: IncomingTransaction[] = [
                      { date: '2026-06-25', description: "McDonald's Lanches Fim de Turno", amount: -145.90, accountOrCard: 'Cartão C6 Carbon Black', category: 'Alimentação' },
                      { date: '2026-06-21', description: 'Posto Ipiranga Combustível', amount: -340.50, accountOrCard: 'Cartão C6 Carbon Black', category: 'Transporte' },
                      { date: '2026-06-18', description: 'Drogaria Araújo Medicamentos', amount: -220.00, accountOrCard: 'Cartão C6 Carbon Black', category: 'Saúde' },
                      { date: '2026-06-20', description: 'DARF Simples Nacional PJ', amount: -550.00, accountOrCard: 'Pessoa Jurídica', category: 'Empresa - Despesas Fixas', entityType: 'PJ' }
                    ]
                    setPendingReviewTransactions(sampleTxs)
                    setIsSmartCatModalOpen(true)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--capital-soft,#f6f0df)] hover:bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] dark:text-[var(--capital-accent,#927025)] font-bold transition-all border border-[var(--capital-accent,#927025)] flex items-center gap-1.5"
                  title="Abrir tela de categorização inteligente para definir regras personalizadas"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>🧠 Treinar Regras de Categorização</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRINT / SCREENSHOT OCR */}
        {activeTab === 'PRINT' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <input 
              ref={imageInputRef}
              type="file" 
              multiple 
              accept=".png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files)
              }}
              className="hidden"
            />

            <div 
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => imageInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--capital-accent,#927025)] rounded-2xl p-7 text-center bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-card,#232a2e)] cursor-pointer hover:border-[var(--capital-accent,#927025)] transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-accent,#927025)] flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                Arraste prints ou fotos de comprovantes e extratos (OCR Inteligente)
              </h4>
              <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-1 max-w-md mx-auto">
                Tirou print da tela do banco ou foto de recibo? A IA reconhece os dados automaticamente.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSimulatedPrintUpload()
                }}
                disabled={isProcessing}
                className="mt-4 px-4 py-2 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)] text-xs font-bold transition-all shadow-md shadow-none"
              >
                Simular Leitura de Print com IA
              </button>
            </div>
          </div>
        )}

        {/* 3. LANÇAMENTO MANUAL RÁPIDO */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in duration-150 bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] p-4 md:p-5 rounded-2xl border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Plantão Hospital Mater Dei, Combustível..."
                  value={manualForm.description}
                  onChange={e => setManualForm({ ...manualForm, description: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={manualForm.amount}
                  onChange={e => setManualForm({ ...manualForm, amount: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">Tipo</label>
                <select
                  value={manualForm.type}
                  onChange={e => setManualForm({ ...manualForm, type: e.target.value as any })}
                  className="w-full rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                >
                  <option value="DEBIT">Despesa (-)</option>
                  <option value="CREDIT">Receita (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mb-1">Data</label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={e => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full rounded-xl bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] px-3 py-2 text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] focus:outline-none focus:ring-1 focus:ring-[var(--capital-accent,#927025)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--capital-button,#c7a354)] hover:bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#242a2e)] font-bold text-xs transition-all shadow-md shadow-none"
            >
              Adicionar Lançamento Manual
            </button>
          </form>
        )}

        {/* 4. OPEN FINANCE */}
        {activeTab === 'OPEN_FINANCE' && (
          <div className="space-y-4 animate-in fade-in duration-150 p-5 rounded-2xl border border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)]">
            <div className="flex items-start gap-3">
              <span className="p-2.5 rounded-xl bg-[var(--capital-soft,#f6f0df)] text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)] shrink-0">
                <Zap className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">
                  Conexão Automática Open Finance (Banco Central do Brasil)
                </h4>
                <p className="text-xs text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] mt-1 leading-relaxed">
                  Conecte com segurança suas contas PJ e PF (Bancos e Cartões). O sistema atualiza saldos, faturas e investimentos continuamente sem intervenção manual.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
                  <ShieldCheck className="w-4 h-4" />
                  Criptografia de ponta a ponta em modo somente leitura (read-only).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback de Status do Processamento */}
        {isProcessing && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--capital-warning-soft,#fcf1dc)] border border-[var(--capital-warning,#8b5b15)] text-xs font-semibold text-[var(--capital-warning,#8b5b15)] dark:text-[var(--capital-warning,#8b5b15)] animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[var(--capital-warning,#8b5b15)]" />
            <span>{feedback}</span>
          </div>
        )}

        {feedback && !isProcessing && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--capital-soft,#f6f0df)] border border-[var(--capital-accent,#927025)] text-xs font-semibold text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--capital-success,#157449)] shrink-0" />
              <span>{feedback}</span>
            </div>
            {processedBatches.length > 0 && (
              <button 
                onClick={() => { setProcessedBatches([]); setFeedback(null) }}
                className="text-[11px] text-[var(--capital-muted,#242a2e)] hover:text-[var(--capital-danger,#ad3333)] flex items-center gap-1 transition-colors"
                title="Limpar lote importado"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        )}

        {/* LISTAGEM DOS ARQUIVOS IMPORTADOS EM LOTE (MÚLTIPLOS CARTÕES/MESES) */}
        {processedBatches.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--capital-success,#157449)]" />
                Faturas e Extratos no Lote ({processedBatches.length})
              </span>

              {/* Filtro de Arquivo Selecionado */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedBatchId('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedBatchId === 'ALL'
                      ? 'bg-[var(--capital-card,#f8fafc)] text-[var(--capital-text,#242a2e)] dark:bg-[var(--capital-card,#fff)] dark:text-[var(--capital-text,#f6f3e9)]'
                      : 'bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]'
                  }`}
                >
                  Todos ({processedBatches.flatMap(b => b.transactions).length})
                </button>
                {processedBatches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBatchId(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all truncate max-w-[140px] ${
                      selectedBatchId === b.id
                        ? 'bg-[var(--capital-button,#c7a354)] text-[var(--capital-button-text,#211f19)]'
                        : 'bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]'
                    }`}
                  >
                    {b.fileName.replace(/\.[^/.]+$/, '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards dos Arquivos Importados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {processedBatches.map(batch => (
                <div 
                  key={batch.id} 
                  onClick={() => setSelectedBatchId(batch.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedBatchId === batch.id
                      ? 'border-[var(--capital-accent,#927025)] bg-[var(--capital-soft,#f6f0df)] dark:bg-[var(--capital-soft,#f6f0df)] shadow-xs'
                      : 'border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#232a2e)] hover:border-[var(--capital-line,#e4dfd3)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)] truncate max-w-[180px]">
                      {batch.institution}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                      {batch.period}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] truncate">
                    {batch.fileName} • {batch.fileSize}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] text-xs font-mono tabular-nums">
                    <span className="text-[10px] font-sans text-[var(--capital-muted,#242a2e)]">{batch.transactionCount} lançamentos</span>
                    <span className="font-bold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">R$ {batch.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela de Lançamentos do Arquivo ou Lote */}
            <div className="border border-[var(--capital-line,#e4dfd3)] dark:border-[var(--capital-line,#e4dfd3)] rounded-2xl overflow-hidden bg-[var(--capital-card,#fff)] dark:bg-[var(--capital-card,#232a2e)] p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)] uppercase tracking-wider px-2">
                <span>Lançamentos Extraídos ({displayedTransactions.length})</span>
                <span>Valor Total: R$ {displayedTransactions.reduce((acc, t) => acc + Math.abs(t.val), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="divide-y divide-[var(--capital-line,#e4dfd3)] dark:divide-[var(--capital-line,#e4dfd3)] max-h-72 overflow-y-auto pr-1">
                {displayedTransactions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-2 text-xs hover:bg-[var(--capital-neutral,#f8fafc)] dark:hover:bg-[var(--capital-card,#fff)] rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-[var(--capital-text,#242a2e)] dark:text-[var(--capital-text,#f6f3e9)]">{item.desc}</span>
                      <span className="text-[10px] ml-2 px-2 py-0.5 rounded-md bg-[var(--capital-neutral,#f8fafc)] dark:bg-[var(--capital-card,#fff)] text-[var(--capital-muted,#242a2e)] dark:text-[var(--capital-muted,#f6f3e9)]">
                        {item.cat}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold tabular-nums block ${item.val < 0 ? 'text-[var(--capital-danger,#ad3333)] dark:text-[var(--capital-danger,#ad3333)]' : 'text-[var(--capital-success,#157449)] dark:text-[var(--capital-success,#157449)]'}`}>
                        {item.val < 0 ? '-' : '+'} R$ {Math.abs(item.val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-[var(--capital-muted,#242a2e)] font-sans">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Modal de Categorização Inteligente com Aprendizado de Regras */}
      <SmartCategorizationModal
        isOpen={isSmartCatModalOpen}
        onClose={() => setIsSmartCatModalOpen(false)}
        transactions={pendingReviewTransactions}
        onCompleted={(count) => {
          setFeedback(`🎉 ${count} lançamentos categorizados e salvos com sucesso no banco de dados!`)
          router.refresh()
        }}
      />
      </div>
    </div>
  )
}
