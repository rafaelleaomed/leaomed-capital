import { NextRequest, NextResponse } from 'next/server'
import { parseInvoiceFromTextOrOCR, DocumentParseResult } from '@/services/aiDocumentParser'
import { extractTextFromPdf, PdfPasswordException } from '@/services/pdfExtractor'
import Tesseract from 'tesseract.js'
import * as XLSX from 'xlsx'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'
import { reviewSanitizedInvoiceBlocks, SanitizedInvoiceBlock } from '@/services/invoiceLayoutProvider'
import { getJevAccessForUser } from '@/services/userJevAccess'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // limite compatível com Vercel Hobby

const MAX_FILES_PER_REQUEST = 10
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 // 15MB por arquivo

async function parseDocumentWithLayoutReview(text: string, apiKey?: string): Promise<DocumentParseResult> {
  const parsed = parseInvoiceFromTextOrOCR(text)
  const diagnostics = parsed.diagnostics as (DocumentParseResult['diagnostics'] & {
    ambiguous_blocks?: SanitizedInvoiceBlock[]
    jev_layout_review?: unknown
  }) | undefined
  const blocks = Array.isArray(diagnostics?.ambiguous_blocks) ? diagnostics.ambiguous_blocks : []

  if (!diagnostics || blocks.length === 0) return parsed

  const review = await reviewSanitizedInvoiceBlocks(diagnostics.profile_id, blocks, apiKey)
  diagnostics.jev_layout_review = {
    used: review.used,
    requires_review: review.requiresReview,
    decisions: review.decisions
  }
  if (review.requiresReview) {
    diagnostics.requiresReview = true
    diagnostics.requires_review = true
    diagnostics.confidence = 'low'
  }
  return parsed
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUserId()
  if (auth.errorResponse || !auth.userId || !auth.user) return auth.errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  const { userId, user } = auth
  const jevAccess = await getJevAccessForUser({ id: userId, email: user.email })

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
      diagnostics?: DocumentParseResult['diagnostics']
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
        entryType?: string
        signedAmount?: number
        direction?: 'debit' | 'credit'
      }>
    }> = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const files = formData.getAll('files') as File[]
      const password = (formData.get('password') as string)?.trim() || undefined

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
        const rawFileName = file.name || `Arquivo_${i + 1}.pdf`
        const safeFileName = rawFileName.replace(/[^a-zA-Z0-9_\-\.\s]/g, '')
        const sizeFormatted = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`

        let extractedText = ''

        // 1. Caso o arquivo seja PDF
        if (file.type === 'application/pdf' || /\.pdf$/i.test(safeFileName)) {
          try {
            extractedText = await extractTextFromPdf(buffer, password)
          } catch (pdfErr: any) {
            if (pdfErr instanceof PdfPasswordException || pdfErr?.name === 'PdfPasswordException') {
              return NextResponse.json({
                success: false,
                requiresPassword: true,
                isWrongPassword: pdfErr.code === 2,
                fileName: safeFileName,
                error: pdfErr.code === 2
                  ? `A senha informada para "${safeFileName}" está incorreta. Verifique e tente novamente.`
                  : `O arquivo "${safeFileName}" está protegido por senha do banco. Digite a senha da fatura (geralmente os primeiros dígitos do seu CPF ou data de nascimento) para desbloquear a leitura.`
              }, { status: 422 })
            }
            throw pdfErr
          }
          
          if (!extractedText || extractedText.trim().length < 20) {
            return NextResponse.json({
              success: false,
              error: `O arquivo "${safeFileName}" parece ser uma digitalização ou imagem sem camada de texto pesquisável. Se o PDF estiver protegido por senha, certifique-se de informá-la. Caso contrário, utilize a opção "Colar Texto".`
            }, { status: 422 })
          }
        } 
        // 2. Caso seja Planilha Excel (.xlsx, .xls)
        else if (/\.(xlsx|xls)$/i.test(safeFileName) || file.type.includes('spreadsheet') || file.type.includes('excel')) {
          try {
            const workbook = XLSX.read(buffer, { type: 'buffer' })
            const sheetTexts: string[] = []
            for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName]
              if (sheet) {
                const csvData = XLSX.utils.sheet_to_csv(sheet, { FS: ';' })
                if (csvData && csvData.trim().length > 10) {
                  sheetTexts.push(csvData)
                }
              }
            }
            extractedText = sheetTexts.join('\n\n')
          } catch (excelErr: any) {
            console.warn(`Falha na extração de Excel para ${safeFileName}:`, excelErr?.message || excelErr)
            return NextResponse.json({
              success: false,
              fileName: safeFileName,
              error: `Não foi possível ler os dados da planilha Excel "${safeFileName}". Certifique-se de que o arquivo não está corrompido ou protegido por senha do Excel.`
            }, { status: 422 })
          }
        }
        // 3. Caso seja Imagem (Print do Celular ou Foto de Fatura)
        else if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(safeFileName)) {
          try {
            // Limite de segurança de 8 segundos para evitar estourar os 15s da Vercel
            const ocrTimeout = new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('TIMEOUT_OCR')), 8000)
            )

            const ocrProcess = (async () => {
              const { data } = await Tesseract.recognize(buffer, 'por', {
                logger: () => {}
              })
              return data?.text || ''
            })()

            extractedText = await Promise.race([ocrProcess, ocrTimeout])
          } catch (ocrErr: any) {
            console.warn(`OCR não concluído para imagem ${safeFileName}:`, ocrErr?.message || ocrErr)
            return NextResponse.json({
              success: false,
              isOcrTimeout: true,
              fileName: safeFileName,
              error: `A leitura da imagem demorou mais do que o limite do servidor. Se você possui o arquivo PDF com senha, anexe o PDF original e digite a senha no campo desbloqueio. Ou copie o texto da fatura e use a aba "Colar Texto".`
            }, { status: 422 })
          }
        } 
        // 4. Caso seja texto, CSV, OFX
        else {
          try {
            extractedText = buffer.toString('utf-8')
            if (!extractedText.includes(';') && !extractedText.includes(',') && !extractedText.includes('<OFX>')) {
              // Tenta codificação latin1
              const latin1 = buffer.toString('latin1')
              if (latin1.includes(';') || latin1.includes(',')) {
                extractedText = latin1
              }
            }
          } catch (_) {
            extractedText = buffer.toString('utf-8')
          }
        }

        // Parsing das transações
        const parseResult = await parseDocumentWithLayoutReview(extractedText, jevAccess.apiKey)

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
          installmentTotal: t.installment_total,
          entryType: t.entryType,
          signedAmount: t.signedAmount,
          direction: t.direction
        }))

        allBatches.push({
          id: `batch-${Date.now()}-${i}`,
          fileName: safeFileName,
          fileSize: sizeFormatted,
          institution: parseResult.institution,
          period: parseResult.period,
          totalAmount: parseResult.total_amount,
          transactionCount: batchTxs.length,
          diagnostics: parseResult.diagnostics,
          transactions: batchTxs
        })
      }
    } else {
      // Recebe JSON com texto bruto
      const body = await req.json()
      const rawText = typeof body.text === 'string' ? body.text : ''
      const safeFileName = typeof body.fileName === 'string' ? body.fileName.replace(/[^a-zA-Z0-9_\-\.\s]/g, '') : 'Extrato_Digitado.txt'

      const parseResult = await parseDocumentWithLayoutReview(rawText, jevAccess.apiKey)
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
        installmentTotal: t.installment_total,
        entryType: t.entryType,
        signedAmount: t.signedAmount,
        direction: t.direction
      }))

      allBatches.push({
        id: `batch-${Date.now()}-0`,
        fileName: safeFileName,
        fileSize: '1 KB',
        institution: parseResult.institution,
        period: parseResult.period,
        totalAmount: parseResult.total_amount,
        transactionCount: batchTxs.length,
        diagnostics: parseResult.diagnostics,
        transactions: batchTxs
      })
    }

    const totalTransactions = allBatches.reduce((acc, b) => acc + b.transactionCount, 0)

    // Se nenhum lançamento foi detectado em nenhum arquivo
    if (totalTransactions === 0) {
      return NextResponse.json({
        success: false,
        error: 'Não foi possível extrair lançamentos legíveis do documento. Certifique-se de que a fatura contém linhas com data (ex: 15 mai ou 15/05), descrição e valor monetário.',
        batches: allBatches,
        totalBatches: allBatches.length,
        totalTransactions: 0
      }, { status: 422 })
    }

    return NextResponse.json({
      success: true,
      batches: allBatches,
      totalBatches: allBatches.length,
      totalTransactions
    })
  } catch (error: unknown) {
    console.error('Erro na rota /api/parse-document:', error instanceof Error ? error.name : 'unknown_error')
    return NextResponse.json(
      { success: false, error: 'Erro no processamento do documento. Tente novamente.' },
      { status: 422 }
    )
  }
}

