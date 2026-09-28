'use client'

import React, { useState } from 'react'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react'

export function DocumentUploadModal() {
  const [isUploading, setIsUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<any | null>(null)

  const handleSimulatedUpload = (docType: string) => {
    setIsUploading(true)
    setStatusMessage(`Processando ${docType} com IA... Extraindo lançamentos e aplicando sua taxonomia...`)

    setTimeout(() => {
      setIsUploading(false)
      if (docType === 'Fatura C6 Carbon Black') {
        setExtractedData({
          type: 'C6_FATURA_PDF',
          period: '2026-06',
          total: 8749.96,
          items: [
            { desc: 'Parcela T-Cross Cartão (06/16)', val: 6837.22, cat: 'Transporte', subcat: 'Parcela T-Cross Cartão' },
            { desc: 'Posto Ipiranga Savassi', val: 320.50, cat: 'Transporte', subcat: 'Combustível' },
            { desc: 'Almoço/Jantar GRI', val: 204.30, cat: 'Restaurantes', subcat: 'Almoço/Jantar GRI' },
            { desc: 'Supermercado Verdemar', val: 890.15, cat: 'Casa', subcat: 'Supermercado' },
            { desc: 'Drogaria Araújo', val: 115.27, cat: 'Saúde', subcat: 'Remédios' },
            { desc: 'Netflix / Spotify', val: 74.70, cat: 'Serviços de assinaturas', subcat: 'Netflix' },
            { desc: 'Uber Viagens', val: 81.15, cat: 'Transporte', subcat: 'Táxi/Uber' },
            { desc: 'Outros pequenos lançamentos', val: 226.67, cat: 'Compras', subcat: 'Aliexpress/Shopee' }
          ]
        })
        setStatusMessage('✅ Fatura do C6 Carbon Black lida com 100% de precisão! 8 lançamentos categorizados.')
      } else {
        setExtractedData({
          type: 'MOBILLS_PRINT',
          period: '2026-06',
          total: 28729.64,
          items: [
            { desc: 'Transporte Total', val: 13163.55, cat: 'Transporte', subcat: 'Consolidado' },
            { desc: 'Casa Total', val: 5662.62, cat: 'Casa', subcat: 'Consolidado' },
            { desc: 'Compras Total', val: 2773.75, cat: 'Compras', subcat: 'Consolidado' },
            { desc: 'Financiamento Total', val: 2302.90, cat: 'Financiamento', subcat: 'Consolidado' },
            { desc: 'Saúde Total', val: 1278.01, cat: 'Saúde', subcat: 'Consolidado' }
          ]
        })
        setStatusMessage('✅ Print do Mobills processado! Totais consolidados sincronizados.')
      }
    }, 1800)
  }

  return (
    <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 dark:bg-slate-900/40 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Importador Inteligente com IA (Fatura C6 Carbon & Prints)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arraste o <strong>PDF da fatura do C6 Carbon</strong> ou <strong>prints do Mobills / Investidor10</strong>. A IA mapeia para suas categorias automaticamente sem digitação manual.
          </p>
        </div>
        <span className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="h-3.5 w-3.5" /> Zero Digitação Manual
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => handleSimulatedUpload('Fatura C6 Carbon Black')}
          className="border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 p-4 rounded-xl cursor-pointer bg-white dark:bg-slate-950/40 hover:bg-emerald-500/5 dark:hover:bg-emerald-950/20 transition-all flex items-center gap-3.5 group shadow-2xs"
        >
          <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              Subir Fatura PDF do C6 Carbon
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Extrai parcelas de T-Cross, combustível, mercado e almoços
            </p>
          </div>
        </div>

        <div 
          onClick={() => handleSimulatedUpload('Print Mobills / Investidor10')}
          className="border border-slate-200 dark:border-white/10 hover:border-blue-500/40 p-4 rounded-xl cursor-pointer bg-white dark:bg-slate-950/40 hover:bg-blue-500/5 dark:hover:bg-blue-950/20 transition-all flex items-center gap-3.5 group shadow-2xs"
        >
          <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
              Subir Print Mobills / Investidor10
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Sincroniza Itaú, Nubank e fotos de carteira de ativos
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {extractedData && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-slate-500 dark:text-slate-400 border-b border-emerald-500/20">
                <tr>
                  <th className="py-1">Descrição</th>
                  <th className="py-1">Categoria</th>
                  <th className="py-1">Subcategoria</th>
                  <th className="py-1 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {extractedData.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-1.5 font-medium text-slate-800 dark:text-slate-200">{item.desc}</td>
                    <td className="py-1.5 text-slate-600 dark:text-slate-400">{item.cat}</td>
                    <td className="py-1.5 text-slate-500 dark:text-slate-400">{item.subcat}</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      R$ {item.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
