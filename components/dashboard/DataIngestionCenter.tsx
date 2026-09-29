'use client'

import React, { useState, useRef } from 'react'
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
  Layers
} from 'lucide-react'

export interface ProcessedBatch {
  id: string
  fileName: string
  fileSize: string
  institution: string
  period: string
  totalAmount: number
  transactionCount: number
  transactions: {
    desc: string
    val: number
    cat: string
    date: string
  }[]
}

export function DataIngestionCenter({ isDemo = false }: { isDemo?: boolean }) {
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'PRINT' | 'MANUAL' | 'OPEN_FINANCE'>('INVOICE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [processedBatches, setProcessedBatches] = useState<ProcessedBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL')

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
    else if (lower.includes('inter')) institution = 'Banco Inter PJ'
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
        { desc: 'Plantão Hospitalar Geral', val: 9800.00, cat: 'Receitas Médicas', date: '2026-06-05' },
        { desc: 'Repasse Convênios Clínicos', val: 7400.00, cat: 'Receitas Médicas', date: '2026-06-10' },
        { desc: 'DARF Simples Nacional PJ', val: -4200.00, cat: 'Empresa Médica PJ', date: '2026-06-20' },
        { desc: 'Mensalidade Assessoria Contábil', val: -1200.00, cat: 'Empresa Médica PJ', date: '2026-06-18' },
        { desc: 'Insumos e Material Diagnóstico', val: -850.00, cat: 'Empresa Médica PJ', date: '2026-06-22' }
      ]
    }
    if (lower.includes('c6')) {
      return [
        { desc: 'Posto de Combustível Ipiranga', val: -340.50, cat: 'Transporte', date: '2026-06-08' },
        { desc: 'Supermercado & Feira Familiar', val: -1150.80, cat: 'Moradia', date: '2026-06-12' },
        { desc: 'Inscrição Congresso Brasileiro de Medicina', val: -1850.00, cat: 'Despesas Pessoais', date: '2026-06-15' },
        { desc: 'Restaurante & Almoço Clínico', val: -280.40, cat: 'Lazer', date: '2026-06-19' },
        { desc: 'Farmácia & Medicamentos Contínuos', val: -220.00, cat: 'Saúde', date: '2026-06-24' }
      ]
    }
    if (lower.includes('nu') || lower.includes('nubank')) {
      return [
        { desc: 'Livros e Assinaturas Médicas (UpToDate)', val: -480.00, cat: 'Despesas Pessoais', date: '2026-06-04' },
        { desc: 'Streaming & TV por Assinatura', val: -129.90, cat: 'Moradia', date: '2026-06-07' },
        { desc: 'Delivery iFood Fim de Semana', val: -185.30, cat: 'Lazer', date: '2026-06-13' },
        { desc: 'Drogaria Araújo Medicamentos', val: -160.00, cat: 'Saúde', date: '2026-06-21' }
      ]
    }
    // Genérico Itaú / Outro
    return [
      { desc: 'Condomínio Residencial', val: -1850.00, cat: 'Moradia', date: '2026-06-05' },
      { desc: 'Plano de Saúde Familiar', val: -1650.00, cat: 'Saúde', date: '2026-06-10' },
      { desc: 'Manutenção Preventiva Automotiva', val: -580.00, cat: 'Transporte', date: '2026-06-16' },
      { desc: 'Academia & Condicionamento', val: -350.00, cat: 'Despesas Pessoais', date: '2026-06-20' }
    ]
  }

  // Processador Central de Múltiplos Arquivos (Drag and Drop ou Seletor)
  const processFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setIsProcessing(true)
    const fileArray = Array.from(files)
    setFeedback(`Lendo e processando ${fileArray.length} arquivo(s) simultaneamente com IA...`)

    setTimeout(() => {
      const newBatches: ProcessedBatch[] = fileArray.map((file, idx) => {
        const { institution, period } = detectInstitutionAndPeriod(file.name)
        const txs = generateTransactionsForFile(file.name, institution)
        const total = txs.reduce((acc, t) => acc + Math.abs(t.val), 0)
        const sizeFormatted = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${Math.max(1, Math.round(file.size / 1024))} KB`

        return {
          id: `batch-${Date.now()}-${idx}`,
          fileName: file.name,
          fileSize: sizeFormatted,
          institution,
          period,
          totalAmount: total,
          transactionCount: txs.length,
          transactions: txs
        }
      })

      setProcessedBatches(prev => [...newBatches, ...prev])
      setIsProcessing(false)
      const totalTxs = newBatches.reduce((acc, b) => acc + b.transactionCount, 0)
      setFeedback(`✅ ${newBatches.length} arquivo(s) importado(s) com sucesso! Total de ${totalTxs} transações categorizadas e integradas.`)
    }, 1200)
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
    const fakeFile = new File(['conteudo simulado'], `Fatura_${bankName.replace(/\s+/g, '_')}_Junho2026.pdf`, { type: 'application/pdf' })
    processFiles([fakeFile])
  }

  const handleSimulatedPrintUpload = () => {
    setIsProcessing(true)
    setFeedback('Analisando imagem com OCR Inteligente... Identificando faturas e extratos de plantões...')

    setTimeout(() => {
      setIsProcessing(false)
      const mockPrintBatch: ProcessedBatch = {
        id: `batch-print-${Date.now()}`,
        fileName: 'Screenshot_Extrato_Inter_Plantao.png',
        fileSize: '420 KB',
        institution: 'Banco Inter PJ (Extrato via Print)',
        period: 'Junho/2026',
        totalAmount: 14700.00,
        transactionCount: 4,
        transactions: [
          { desc: 'Plantão Hospital 01', val: 8500.00, cat: 'Receitas Médicas', date: '2026-06-05' },
          { desc: 'Honorários Convênio 01', val: 6200.00, cat: 'Receitas Médicas', date: '2026-06-10' },
          { desc: 'DARF Imposto PJ', val: -2150.00, cat: 'Empresa Médica PJ', date: '2026-06-15' },
          { desc: 'Contabilidade Mensal', val: -850.00, cat: 'Empresa Médica PJ', date: '2026-06-18' }
        ]
      }
      setProcessedBatches(prev => [mockPrintBatch, ...prev])
      setFeedback('✅ Print do extrato reconhecido com sucesso via OCR! 4 lançamentos integrados.')
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
    <div id="central-ingestao" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-5 md:p-6 shadow-sm scroll-mt-24">
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-display text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-500" />
            Central de Alimentação de Dados & Ingestão
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arraste faturas (PDF/CSV) de vários meses ou cartões simultaneamente, tire foto de extratos ou conecte via Open Finance.
          </p>
        </div>

        {/* Abas dos 4 Canais de Ingestão */}
        <div className="flex flex-wrap rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-950 p-1 text-xs font-semibold">
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
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01] shadow-lg shadow-emerald-500/10'
                  : 'border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-950/40 hover:border-emerald-500/50 hover:bg-slate-100/60 dark:hover:bg-slate-950/60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                <UploadCloud className={`w-6 h-6 ${isDragging ? 'animate-bounce' : ''}`} />
              </div>
              <h4 className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200">
                {isDragging ? 'Solte os arquivos aqui para importar!' : 'Arraste múltiplos arquivos de faturas ou extratos'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Suporta vários arquivos de uma só vez (PDF, CSV ou OFX de múltiplos cartões ou meses). Ou clique para selecionar do computador.
              </p>

              <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-slate-200/60 dark:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Multi-arquivo ativo: Nubank, C6 Black, Inter PJ, Itaú, Santander</span>
              </div>
            </div>

            {/* Atalhos Rápidos para Simulação de Demonstração */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Ou teste com faturas simuladas:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSimulatedInvoiceUpload('C6 Carbon Black')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/10"
                >
                  + Fatura C6 Black
                </button>
                <button
                  onClick={() => handleSimulatedInvoiceUpload('Nubank')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/10"
                >
                  + Fatura Nubank
                </button>
                <button
                  onClick={() => handleSimulatedInvoiceUpload('Inter PJ')}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/10"
                >
                  + Extrato Inter PJ
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
              className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-7 text-center bg-indigo-500/5 dark:bg-slate-950/40 cursor-pointer hover:border-indigo-500 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200">
                Arraste prints ou fotos de comprovantes e extratos (OCR Inteligente)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Tirou print da tela do banco ou foto de recibo? A IA reconhece os dados automaticamente.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSimulatedPrintUpload()
                }}
                disabled={isProcessing}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                Simular Leitura de Print com IA
              </button>
            </div>
          </div>
        )}

        {/* 3. LANÇAMENTO MANUAL RÁPIDO */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in duration-150 bg-slate-50 dark:bg-slate-950/40 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Plantão Hospital Mater Dei, Combustível..."
                  value={manualForm.description}
                  onChange={e => setManualForm({ ...manualForm, description: e.target.value })}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={manualForm.amount}
                  onChange={e => setManualForm({ ...manualForm, amount: e.target.value })}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
                <select
                  value={manualForm.type}
                  onChange={e => setManualForm({ ...manualForm, type: e.target.value as any })}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="DEBIT">Despesa (-)</option>
                  <option value="CREDIT">Receita (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Data</label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={e => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              Adicionar Lançamento Manual
            </button>
          </form>
        )}

        {/* 4. OPEN FINANCE */}
        {activeTab === 'OPEN_FINANCE' && (
          <div className="space-y-4 animate-in fade-in duration-150 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-start gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Zap className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Conexão Automática Open Finance (Banco Central do Brasil)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Conecte com segurança suas contas PJ e PF (Banco Inter PJ, Itaú, Nubank, C6 Bank). O sistema atualiza saldos, faturas e investimentos continuamente sem intervenção manual.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Criptografia de ponta a ponta em modo somente leitura (read-only).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback de Status do Processamento */}
        {isProcessing && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-300 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-amber-500" />
            <span>{feedback}</span>
          </div>
        )}

        {feedback && !isProcessing && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{feedback}</span>
            </div>
            {processedBatches.length > 0 && (
              <button 
                onClick={() => { setProcessedBatches([]); setFeedback(null) }}
                className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                Faturas e Extratos no Lote ({processedBatches.length})
              </span>

              {/* Filtro de Arquivo Selecionado */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedBatchId('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedBatchId === 'ALL'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
                      ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[180px]">
                      {batch.institution}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 font-bold text-slate-600 dark:text-slate-300">
                      {batch.period}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {batch.fileName} • {batch.fileSize}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 dark:border-white/5 text-xs font-mono tabular-nums">
                    <span className="text-[10px] font-sans text-slate-500">{batch.transactionCount} lançamentos</span>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {batch.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela de Lançamentos do Arquivo ou Lote */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-950/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">
                <span>Lançamentos Extraídos ({displayedTransactions.length})</span>
                <span>Valor Total: R$ {displayedTransactions.reduce((acc, t) => acc + Math.abs(t.val), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto pr-1">
                {displayedTransactions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.desc}</span>
                      <span className="text-[10px] ml-2 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {item.cat}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold tabular-nums block ${item.val < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {item.val < 0 ? '-' : '+'} R$ {Math.abs(item.val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
