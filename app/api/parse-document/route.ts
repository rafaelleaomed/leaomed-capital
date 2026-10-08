import { NextRequest, NextResponse } from 'next/server'
import { parseInvoiceFromTextOrOCR, ExtractedTransaction, DocumentParseResult } from '@/services/aiDocumentParser'
import Tesseract from 'tesseract.js'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // até 60s para processamento OCR de múltiplos prints

const MAX_FILES_PER_REQUEST = 10
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15MB por arquivo

export async function POST(req: NextRequest) {
  const { userId, errorResponse } = await getAuthenticatedUserId()
  if (errorResponse) return errorResponse

  try {
    const contentType = req.headers.get('content-type') || ''

    
    const allBatches: Array<{
      id: string
      fileName: string
      fileSize: string
      institution: string
      period: string
      totalAmount: number
      transactionCount: number
      transactions: Array<{
        desc: string
        val: number
        cat: string
        subcategory: string
        subdivision?: string
        date: string
        accountOrCard?: string
        isFixed?: boolean
        isCardBillPayment?: boolean
        installmentCurrent?: number | null
        installmentTotal?: number | null
      }>
    }> = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const files = formData.getAll('files') as File[]

      if (!files || files.length === 0) {
        return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 })
      }

      if (files.length > MAX_FILES_PER_REQUEST) {
        return NextResponse.json(
          { success: false, error: `Limite máximo de ${MAX_FILES_PER_REQUEST} arquivos por requisição excedido.` },
          { status: 400 }
        )
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (file.size > MAX_FILE_SIZE_BYTES) {
          return NextResponse.json(
            { success: false, error: `Arquivo ${file.name || 'enviado'} excede o tamanho máximo permitido de 15MB.` },
            { status: 400 }
          )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const rawFileName = file.name || `Arquivo_${i + 1}.png`
        const safeFileName = rawFileName.replace(/[^a-zA-Z0-9_\-\.\s]/g, '')
        const sizeFormatted = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`

        let extractedText = ''

        // Se for imagem, executa OCR
        if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(safeFileName)) {
          try {
            const { data } = await Tesseract.recognize(buffer, 'por+eng', {
              logger: () => {}
            })
            extractedText = data.text || ''
          } catch (ocrErr) {
            console.warn(`Tentando fallback de OCR para ${safeFileName}:`, ocrErr)
            const { data } = await Tesseract.recognize(buffer, 'eng', { logger: () => {} })
            extractedText = data.text || ''
          }
        } else {
          // Para texto ou PDF
          extractedText = buffer.toString('utf-8')
        }

        // Parsing das transações reais
        const parseResult: DocumentParseResult = parseInvoiceFromTextOrOCR(extractedText)

        const batchTxs = parseResult.transactions.map(t => ({
          desc: t.description,
          val: t.is_card_bill_payment ? -Math.abs(t.amount) : Math.abs(t.amount),
          cat: t.category,
          subcategory: t.subcategory,
          subdivision: t.subdivision,
          date: t.date,
          accountOrCard: t.accountOrCard || parseResult.institution,
          isFixed: t.is_fixed,
          isCardBillPayment: t.is_card_bill_payment,
          installmentCurrent: t.installment_current,
          installmentTotal: t.installment_total
        }))

        allBatches.push({
          id: `batch-${Date.now()}-${i}`,
          fileName: safeFileName,
          fileSize: sizeFormatted,
          institution: parseResult.institution,
          period: parseResult.period,
          totalAmount: parseResult.total_amount,
          transactionCount: batchTxs.length,
          transactions: batchTxs
        })
      }
    } else {
      // Recebe JSON com texto bruto
      const body = await req.json()
      const rawText = typeof body.text === 'string' ? body.text : ''
      const safeFileName = typeof body.fileName === 'string' ? body.fileName.replace(/[^a-zA-Z0-9_\-\.\s]/g, '') : 'Extrato_Digitado.txt'

      const parseResult = parseInvoiceFromTextOrOCR(rawText)
      const batchTxs = parseResult.transactions.map(t => ({
        desc: t.description,
        val: t.is_card_bill_payment ? -Math.abs(t.amount) : Math.abs(t.amount),
        cat: t.category,
        subcategory: t.subcategory,
        subdivision: t.subdivision,
        date: t.date,
        accountOrCard: t.accountOrCard || parseResult.institution,
        isFixed: t.is_fixed,
        isCardBillPayment: t.is_card_bill_payment,
        installmentCurrent: t.installment_current,
        installmentTotal: t.installment_total
      }))

      allBatches.push({
        id: `batch-${Date.now()}-0`,
        fileName: safeFileName,
        fileSize: '1 KB',
        institution: parseResult.institution,
        period: parseResult.period,
        totalAmount: parseResult.total_amount,
        transactionCount: batchTxs.length,
        transactions: batchTxs
      })
    }

    return NextResponse.json({
      success: true,
      batches: allBatches,
      totalBatches: allBatches.length,
      totalTransactions: allBatches.reduce((acc, b) => acc + b.transactionCount, 0)
    })
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Falha ao processar arquivo'
    console.error('Erro seguro na rota /api/parse-document:', errorMsg)
    return NextResponse.json(
      { success: false, error: 'Erro no processamento seguro do documento via OCR/IA.' },
      { status: 500 }
    )
  }
}
