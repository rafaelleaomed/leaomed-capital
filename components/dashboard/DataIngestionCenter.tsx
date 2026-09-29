'use client'

import React, { useState } from 'react'
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
  Tag
} from 'lucide-react'

export function DataIngestionCenter({ isDemo = false }: { isDemo?: boolean }) {
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'PRINT' | 'MANUAL' | 'OPEN_FINANCE'>('INVOICE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [extractedItems, setExtractedItems] = useState<any[] | null>(null)

  // Formulário Manual Rápido
  const [manualForm, setManualForm] = useState({
    description: '',
    amount: '',
    category: 'Alimentação',
    type: 'DEBIT',
    date: new Date().toISOString().split('T')[0]
  })

  const handleSimulatedInvoiceUpload = (bankName: string) => {
    setIsProcessing(true)
    setFeedback(`Lendo fatura em PDF/CSV de ${bankName} com IA... Extraindo lançamentos e cruzando com categorias médicas...`)
    setExtractedItems(null)

    setTimeout(() => {
      setIsProcessing(false)
      const mockTransactions = [
        { desc: 'Posto de Combustível Shell', val: 320.50, cat: 'Transporte', date: '2026-06-12' },
        { desc: 'Supermercado & Feira', val: 890.15, cat: 'Moradia', date: '2026-06-14' },
        { desc: 'Farmácia & Medicamentos', val: 145.20, cat: 'Saúde', date: '2026-06-15' },
        { desc: 'Anuidade Sociedade Médica / CRM', val: 189.60, cat: 'Despesas Pessoais', date: '2026-06-18' },
        { desc: 'Inscrição Congresso Médico', val: 1250.00, cat: 'Despesas Pessoais', date: '2026-06-20' },
        { desc: 'Restaurante & Almoço Clínico', val: 210.40, cat: 'Lazer', date: '2026-06-22' },
      ]
      setExtractedItems(mockTransactions)
      setFeedback(`✅ Fatura de ${bankName} processada com sucesso! 6 transações identificadas e categorizadas.`)
    }, 1500)
  }

  const handleSimulatedPrintUpload = () => {
    setIsProcessing(true)
    setFeedback('Analisando imagem com OCR Inteligente... Identificando valores, datas e saldos bancários...')
    setExtractedItems(null)

    setTimeout(() => {
      setIsProcessing(false)
      const mockPrintData = [
        { desc: 'Plantão Hospital 01', val: 8500.00, cat: 'Receitas Médicas', date: '2026-06-05' },
        { desc: 'Honorários Convênio 01', val: 6200.00, cat: 'Receitas Médicas', date: '2026-06-10' },
        { desc: 'DARF Imposto PJ', val: 2150.00, cat: 'Empresa Médica - Despesas Fixas', date: '2026-06-15' },
        { desc: 'Contabilidade Mensal', val: 850.00, cat: 'Empresa Médica - Despesas Fixas', date: '2026-06-18' }
      ]
      setExtractedItems(mockPrintData)
      setFeedback('✅ Print do extrato reconhecido com sucesso! Valores e faturamento consolidado importados.')
    }, 1600)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.description || !manualForm.amount) return
    setIsProcessing(true)
    setFeedback('Registrando lançamento...')

    setTimeout(() => {
      setIsProcessing(false)
      const val = parseFloat(manualForm.amount) || 0
      setExtractedItems([
        {
          desc: manualForm.description,
          val: manualForm.type === 'DEBIT' ? -Math.abs(val) : Math.abs(val),
          cat: manualForm.category,
          date: manualForm.date
        }
      ])
      setFeedback(`✅ Lançamento "${manualForm.description}" no valor de R$ ${val.toFixed(2)} cadastrado com sucesso!`)
      setManualForm({
        description: '',
        amount: '',
        category: 'Alimentação',
        type: 'DEBIT',
        date: new Date().toISOString().split('T')[0]
      })
    }, 500)
  }

  return (
    <div id="central-ingestao" className="rounded-2xl border border-white/10 bg-white dark:bg-slate-900/60 p-5 md:p-6 shadow-sm scroll-mt-24">
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-display text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-500" />
            Central de Alimentação de Dados & Ingestão
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Escolha como prefere atualizar suas contas: importação de fatura, captura por foto/print, lançamento manual ou Open Finance.
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
              onClick={() => { setActiveTab(tab.id as any); setFeedback(null); setExtractedItems(null) }}
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

        {/* 1. FATURA (PDF / CSV) */}
        {activeTab === 'INVOICE' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950/40">
              <FileText className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Arraste a fatura do cartão ou extrato bancário
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Compatível com PDF e CSV de qualquer banco (Itaú, Nubank, C6 Carbon Black, Inter PJ, Santander, Bradesco).
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button
                  onClick={() => handleSimulatedInvoiceUpload('C6 Carbon Black')}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all border border-white/10"
                >
                  Exemplo: Fatura C6 Black
                </button>
                <button
                  onClick={() => handleSimulatedInvoiceUpload('Nubank')}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all border border-white/10"
                >
                  Exemplo: Fatura Nubank
                </button>
                <button
                  onClick={() => handleSimulatedInvoiceUpload('Inter PJ')}
                  disabled={isProcessing}
                  className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all border border-white/10"
                >
                  Exemplo: Extrato Inter PJ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRINT / SCREENSHOT OCR */}
        {activeTab === 'PRINT' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-2 border-dashed border-indigo-500/30 rounded-2xl p-6 text-center bg-indigo-500/5 dark:bg-slate-950/40">
              <Camera className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Captura por Print da Tela do Celular (OCR com IA)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Tirou print da fatura fechada ou do extrato no celular? Nossa IA lê a imagem, reconhece os valores e sincroniza.
              </p>

              <button
                onClick={handleSimulatedPrintUpload}
                disabled={isProcessing}
                className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
              >
                Simular Leitura de Print Bancário
              </button>
            </div>
          </div>
        )}

        {/* 3. LANÇAMENTO MANUAL RÁPIDO */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in duration-150 bg-slate-50 dark:bg-slate-950/40 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Plantão Hospital Mater Dei, Abastecimento..."
                  value={manualForm.description}
                  onChange={e => setManualForm({ ...manualForm, description: e.target.value })}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Valor (R$)</label>
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
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Tipo</label>
                <select
                  value={manualForm.type}
                  onChange={e => setManualForm({ ...manualForm, type: e.target.value })}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="DEBIT">Despesa (-)</option>
                  <option value="CREDIT">Receita (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Data</label>
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
              <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <Zap className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Conexão Automática Open Finance (Banco Central)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Conecte com segurança suas contas PJ e PF (Banco Inter PJ, Itaú, Nubank, C6 Bank). O sistema atualiza saldos, faturas e investimentos continuamente.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Conexão criptografada ponta a ponta sem acesso a senhas transacionais.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback de Status do Processamento */}
        {isProcessing && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {feedback && !isProcessing && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            {feedback}
          </div>
        )}

        {/* Pré-visualização de Itens Extraídos */}
        {extractedItems && extractedItems.length > 0 && (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
              <span>Lançamentos Reconhecidos</span>
              <span>{extractedItems.length} registros</span>
            </div>

            <div className="divide-y divide-white/5">
              {extractedItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{item.desc}</span>
                    <span className="text-[10px] ml-2 px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                      {item.cat}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${item.val < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {Math.abs(item.val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
