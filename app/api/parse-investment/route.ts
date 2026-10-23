import { NextRequest, NextResponse } from 'next/server'
import { parseInvestmentCsv } from '@/services/investmentCsvParser'
import { getAuthenticatedUserId } from '@/utils/auth-helpers'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * POST /api/parse-investment
 *
 * Accepts a multipart/form-data upload with field name "file" (single CSV).
 * Also accepts a JSON body with { text: string, fileName?: string }.
 *
 * Returns: { success: true, result: InvestmentParseResult }
 *       or { success: false, error: string }
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUserId()
  if (auth.errorResponse || !auth.userId) {
    return auth.errorResponse || NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let rawText = ''
    let fileName = 'investment.csv'

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado. Use o campo "file".' }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `Arquivo excede o tamanho máximo de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` },
          { status: 400 }
        )
      }

      fileName = file.name || fileName
      const buffer = Buffer.from(await file.arrayBuffer())

      // UTF-8 with BOM handling
      rawText = buffer.toString('utf-8')
      if (rawText.charCodeAt(0) === 0xFEFF) {
        rawText = rawText.slice(1)
      }

      // Fallback to latin1 for Brazilian bank exports that use accents without UTF-8
      if (!rawText.includes(',') && !rawText.includes(';') && !rawText.includes('\t')) {
        rawText = buffer.toString('latin1')
      }
    } else {
      // Accept JSON body as well
      const body = await req.json() as { text?: string; fileName?: string }
      rawText = typeof body.text === 'string' ? body.text : ''
      fileName = typeof body.fileName === 'string' ? body.fileName : fileName
    }

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Conteúdo do arquivo vazio ou ilegível.' }, { status: 400 })
    }

    const result = parseInvestmentCsv(rawText)

    if (!result) {
      return NextResponse.json({
        success: false,
        error: `Formato de arquivo não reconhecido. Certifique-se de que o arquivo é um CSV exportado de Bybit, MEXC, Nuinvest, NuCripto ou Inter Global. Arquivo: ${fileName}`,
        fileName,
      }, { status: 422 })
    }

    return NextResponse.json({ success: true, result, fileName })
  } catch (err: unknown) {
    console.error('Erro na rota /api/parse-investment:', err instanceof Error ? err.message : 'unknown_error')
    return NextResponse.json(
      { success: false, error: 'Erro inesperado ao processar o arquivo de investimentos. Tente novamente.' },
      { status: 500 }
    )
  }
}
