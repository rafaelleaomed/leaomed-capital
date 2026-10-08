import { PDFParse, PasswordException } from 'pdf-parse'

export class PdfPasswordException extends Error {
  code: number // 1: NEED_PASSWORD, 2: INCORRECT_PASSWORD
  constructor(message: string, code: number = 1) {
    super(message)
    this.name = 'PdfPasswordException'
    this.code = code
  }
}

/**
 * Sanitiza o texto extraído do PDF:
 * 1. Remove caracteres de controle binários e caracteres não imprimíveis (CMap/font glyph drift).
 * 2. Normaliza quebras de linha e normalização Unicode NFKC.
 * 3. Remove linhas que contenham apenas caracteres corrompidos ou ruído de desenho.
 */
export function sanitizePdfText(rawText: string): string {
  if (!rawText) return ''

  return rawText
    // Remove caracteres de controle invisíveis e binários, preservando \n e \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, ' ')
    // Normalização canônica Unicode
    .normalize('NFKC')
    // Normaliza múltiplos espaços horizontais
    .replace(/[ \t]+/g, ' ')
    // Separa por linhas e filtra linhas limpas
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => {
      if (line.length === 0) return false
      // Deve conter pelo menos um caractere alfanumérico
      return /[a-zA-Z0-9]/.test(line)
    })
    .join('\n')
}

/**
 * Serviço de extração confiável de texto de PDFs financeiros.
 * Utiliza o motor PDFParse oficial com suporte a ToUnicode CMaps, senha para arquivos protegidos e timeout de 8 segundos.
 */
export async function extractTextFromPdf(buffer: Buffer, password?: string): Promise<string> {
  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error('Tempo limite para leitura do PDF excedido (8s)')), 8000)
  )

  const parsePromise = (async (): Promise<string> => {
    let parser: PDFParse | null = null
    try {
      parser = new PDFParse({
        data: buffer,
        password: password ? String(password).trim() : undefined
      })
      const textResult = await parser.getText()
      await parser.destroy().catch(() => {})

      const rawExtracted = typeof textResult === 'string'
        ? textResult
        : (textResult && typeof textResult.text === 'string' ? textResult.text : '')

      const clean = sanitizePdfText(rawExtracted)
      return clean || ''
    } catch (parseErr: any) {
      if (parser) {
        await parser.destroy().catch(() => {})
      }

      const errName = parseErr?.name || ''
      const errMsg = (parseErr?.message || '').toLowerCase()
      const errCode = parseErr?.code

      // Verifica se o PDF está criptografado e precisa de senha ou a senha foi incorreta
      if (
        parseErr instanceof PasswordException ||
        errName === 'PasswordException' ||
        errMsg.includes('password') ||
        errMsg.includes('senha') ||
        errCode === 1 ||
        errCode === 2
      ) {
        const isWrong = errCode === 2 || errMsg.includes('incorrect') || errMsg.includes('bad password')
        throw new PdfPasswordException(
          isWrong
            ? 'A senha fornecida para o PDF está incorreta.'
            : 'Este PDF está protegido por senha bancária.',
          isWrong ? 2 : 1
        )
      }

      console.warn('Falha na extração de texto do PDF via PDFParse:', parseErr?.message || parseErr)
      return ''
    }
  })()

  return await Promise.race([parsePromise, timeoutPromise])
}
