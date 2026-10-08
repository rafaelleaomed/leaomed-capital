import { USER_TAXONOMY, USER_TAXONOMY_MAP, getSubcategoriesForCategory } from '@/utils/taxonomy'
import { CategoryRulesEngine } from '@/utils/categoryRulesEngine'

export interface ExtractedTransaction {
  date: string
  description: string
  amount: number
  accountOrCard?: string
  category: string
  subcategory: string
  subdivision?: string
  is_fixed: boolean
  is_card_bill_payment?: boolean
  installment_current?: number | null
  installment_total?: number | null
}

export interface DocumentParseResult {
  document_type: 'C6_FATURA_PDF' | 'C6_FATURA_PRINT' | 'MOBILLS_PRINT' | 'EXTRATO_BANCARIO' | 'CSV_EXTRATO' | 'OFX_EXTRATO' | 'OUTRO'
  period: string // 'YYYY-MM'
  institution: string
  total_amount: number
  transactions: ExtractedTransaction[]
  raw_summary?: Record<string, number>
}

/**
 * Converte qualquer representação de data em formato "YYYY-MM-DD".
 * Suporta:
 * - "15 mai", "04 abr", "13 jul"
 * - "15/05/2026", "15/05/26", "15/05"
 * - "2026-05-15"
 * - "15 de maio", "15 de maio de 2026"
 */
export function parseInvoiceDate(dateStr: string, defaultYear = new Date().getFullYear()): string {
  const monthsMap: Record<string, string> = {
    jan: '01', fev: '02', mar: '03', abr: '04',
    mai: '05', jun: '06', jul: '07', ago: '08',
    set: '09', out: '10', nov: '11', dez: '12'
  }

  const clean = (dateStr || '').trim().toLowerCase().replace(/\./g, '')

  // Formato ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean
  }

  // Formato DD/MM/YYYY ou DD/MM/YY
  const slashFullMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (slashFullMatch) {
    const day = slashFullMatch[1].padStart(2, '0')
    const month = slashFullMatch[2].padStart(2, '0')
    let year = slashFullMatch[3]
    if (year.length === 2) {
      year = `20${year}`
    }
    return `${year}-${month}-${day}`
  }

  // Formato DD/MM
  const slashShortMatch = clean.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (slashShortMatch) {
    const day = slashShortMatch[1].padStart(2, '0')
    const month = slashShortMatch[2].padStart(2, '0')
    return `${defaultYear}-${month}-${day}`
  }

  // Formato "15 mai" ou "15 mai 2026" ou "15 de maio"
  const textMonthMatch = clean.match(/(\d{1,2})\s*(?:de\s+)?([a-z]{3,9})(?:\s*(?:de\s+)?(\d{2,4}))?/i)
  if (textMonthMatch) {
    const day = textMonthMatch[1].padStart(2, '0')
    const monthStr = textMonthMatch[2].substring(0, 3)
    const month = monthsMap[monthStr] || '01'
    let year = textMonthMatch[3] || String(defaultYear)
    if (year.length === 2) {
      year = `20${year}`
    }
    return `${year}-${month}-${day}`
  }

  return `${defaultYear}-05-15`
}

/**
 * Converte strings numéricas em formato monetário brasileiro para float.
 * Suporta: "1.250,50", "336,76", "-50,00", "R$ 450,20", "1250.50", "(800,00)"
 */
export function parseCurrencyValue(raw: string): number {
  if (!raw) return 0

  let clean = raw.trim().replace(/^r\$\s*/i, '').replace(/\s+/g, '')
  let isNegative = false

  if (clean.startsWith('-') || (clean.startsWith('(') && clean.endsWith(')'))) {
    isNegative = true
    clean = clean.replace(/[\(\)\-]/g, '')
  }

  // Se tiver tanto ponto quanto vírgula (ex: 1.250,50)
  if (clean.includes('.') && clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.')
  } else if (clean.includes(',')) {
    // Apenas vírgula decimal (ex: 350,75)
    clean = clean.replace(',', '.')
  }

  const val = parseFloat(clean)
  if (isNaN(val)) return 0
  return isNegative ? -Math.abs(val) : Math.abs(val)
}

/**
 * Parser para formato OFX bancário
 */
function parseOfxContent(text: string): ExtractedTransaction[] {
  const txs: ExtractedTransaction[] = []
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match: RegExpExecArray | null

  while ((match = stmtTrnRegex.exec(text)) !== null) {
    const block = match[1]
    const amountMatch = block.match(/<TRNAMT>([^\r\n<]+)/i)
    const dateMatch = block.match(/<DTPOSTED>(\d{8})/i)
    const memoMatch = block.match(/<MEMO>([^\r\n<]+)/i) || block.match(/<NAME>([^\r\n<]+)/i)

    if (amountMatch && dateMatch) {
      const rawAmt = parseFloat(amountMatch[1].trim())
      const rawDate = dateMatch[1] // YYYYMMDD
      const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
      const desc = memoMatch ? memoMatch[1].trim() : 'Lançamento Bancário'
      const pred = CategoryRulesEngine.predict(desc, 'PF')

      txs.push({
        date,
        description: desc,
        amount: Math.abs(rawAmt),
        category: pred.category,
        subcategory: pred.subcategory,
        subdivision: pred.subdivision,
        is_fixed: pred.isCardBillPayment,
        is_card_bill_payment: pred.isCardBillPayment,
        installment_current: null,
        installment_total: null
      })
    }
  }

  return txs
}

/**
 * Parser para linhas CSV (delimitadas por vírgula, ponto-e-vírgula ou tab)
 */
function parseCsvContent(text: string): ExtractedTransaction[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const txs: ExtractedTransaction[] = []
  
  // Identifica delimitador principal
  const firstLine = lines[0]
  let delimiter = ';'
  if ((firstLine.match(/,/g) || []).length > (firstLine.match(/;/g) || []).length) {
    delimiter = ','
  } else if (firstLine.includes('\t')) {
    delimiter = '\t'
  }

  // Verifica se a primeira linha é cabeçalho
  const header = firstLine.toLowerCase().split(delimiter).map(s => s.trim().replace(/['"]/g, ''))
  let dateIdx = header.findIndex(h => h.includes('data') || h.includes('date') || h.includes('dia'))
  let descIdx = header.findIndex(h => h.includes('desc') || h.includes('historico') || h.includes('estabelecimento') || h.includes('titulo') || h.includes('memo'))
  let amountIdx = header.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('quantia'))

  // Se não identificou cabeçalhos exatos, usa posições padrão comuns
  if (dateIdx === -1) dateIdx = 0
  if (descIdx === -1) descIdx = 1
  if (amountIdx === -1) amountIdx = 2

  const startLine = (header.some(h => isNaN(parseFloat(h)))) ? 1 : 0

  for (let i = startLine; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''))
    if (cols.length <= Math.max(dateIdx, descIdx, amountIdx)) continue

    const rawDate = cols[dateIdx]
    const rawDesc = cols[descIdx]
    const rawVal = cols[amountIdx]

    if (!rawDate || !rawDesc || !rawVal) continue

    const amount = parseCurrencyValue(rawVal)
    if (amount === 0 && !rawVal.includes('0')) continue

    const formattedDate = parseInvoiceDate(rawDate)
    const pred = CategoryRulesEngine.predict(rawDesc, 'PF')

    // Detecta parcelas
    let installmentCurrent: number | null = null
    let installmentTotal: number | null = null
    const parcelMatch = rawDesc.match(/parcela\s+(\d+)\/(\d+)/i) || rawDesc.match(/(\d+)\/(\d+)$/)
    if (parcelMatch) {
      installmentCurrent = parseInt(parcelMatch[1], 10)
      installmentTotal = parseInt(parcelMatch[2], 10)
    }

    txs.push({
      date: formattedDate,
      description: rawDesc,
      amount: Math.abs(amount),
      category: pred.category,
      subcategory: pred.subcategory,
      subdivision: pred.subdivision,
      is_fixed: pred.isCardBillPayment || Boolean(installmentTotal && installmentTotal > 1),
      is_card_bill_payment: pred.isCardBillPayment,
      installment_current: installmentCurrent,
      installment_total: installmentTotal
    })
  }

  return txs
}

/**
 * Parser Inteligente de Texto/OCR de Faturas de Cartão e Extratos
 */
export function parseInvoiceFromTextOrOCR(rawText: string): DocumentParseResult {
  if (!rawText || rawText.trim().length === 0) {
    return {
      document_type: 'OUTRO',
      period: new Date().toISOString().slice(0, 7),
      institution: 'Fatura Bancária',
      total_amount: 0,
      transactions: []
    }
  }

  // 1. Tenta formato OFX
  if (rawText.includes('<OFX>') || rawText.includes('<STMTTRN>')) {
    const ofxTxs = parseOfxContent(rawText)
    if (ofxTxs.length > 0) {
      const period = ofxTxs[0].date.slice(0, 7)
      const totalAmount = ofxTxs.reduce((sum, t) => sum + t.amount, 0)
      return {
        document_type: 'OFX_EXTRATO',
        period,
        institution: 'Extrato Bancário OFX',
        total_amount: totalAmount,
        transactions: ofxTxs
      }
    }
  }

  // 2. Tenta formato CSV estruturado
  if (rawText.includes(';') || (rawText.includes(',') && rawText.split('\n')[0].includes(','))) {
    const csvTxs = parseCsvContent(rawText)
    if (csvTxs.length > 0) {
      const period = csvTxs[0].date.slice(0, 7)
      const totalAmount = csvTxs.reduce((sum, t) => sum + t.amount, 0)
      return {
        document_type: 'CSV_EXTRATO',
        period,
        institution: 'Fatura/Extrato CSV',
        total_amount: totalAmount,
        transactions: csvTxs
      }
    }
  }

  // Blacklist institucional: Termos de cabeçalho bancário, dados de boleto, agência e holdings que NUNCA são compras
  const INSTITUTIONAL_BLACKLIST = [
    /h\s*o\s*l\s*d\s*i\s*n\s*g/i,
    /u\s*n\s*i\s*b\s*a\s*n\s*c\s*o/i,
    /i\s*t\s*a\s*u/i,
    /\d{2}[\.\s]*\d{3}[\.\s]*\d{3}[\/\s]*\d{4}[-\s]*\d{2}/, // CNPJs em geral
    /b\s*a\s*n\s*c\s*o/i,
    /ouvidoria/i,
    /sac\s*0800/i,
    /autentica/i,
    /linha\s+digit[aá]vel/i,
    /c[oó]digo\s+de\s+barras/i,
    /benefici[aá]rio/i,
    /pagador/i,
    /ag[eê]ncia/i,
    /limite\s+de\s+cr[eé]dito/i,
    /limite\s+dispon[ií]vel/i,
    /pagamento\s+m[ií]nimo/i,
    /encargos\s+financeiros/i,
    /cet\s+anual/i,
    /comprovante\s+de\s+pagamento/i,
    /demonstrativo\s+de\s+pagamento/i
  ]

  // 3. Parser de Texto Livre / Linhas de PDF / OCR
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const transactions: ExtractedTransaction[] = []

  let currentCard = 'Cartão de Crédito'
  let detectedPeriod = ''
  let totalAmount = 0

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    // Higieniza caracteres de controle
    const line = rawLine
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim()

    if (!line || line.length < 5) continue

    // Detecta início de compras parceladas futuras e encerra lançamentos correntes
    if (/compras parceladas\s*-\s*pr[oó]ximas faturas/i.test(line)) {
      break
    }

    // Ignora linhas de pagamentos efetuados de fatura anterior
    if (/pagamento efetuado|total dos pagamentos|\b\d{1,2}\/\d{1,2}\s+pagamento\s+-/i.test(line)) {
      continue
    }

    // Captura repasse de IOF em faturas com lançamentos internacionais
    if (/repasse de iof.*r\$\s*([0-9\.\,]+)/i.test(line)) {
      const iofMatch = line.match(/repasse de iof.*r\$\s*([0-9\.\,]+)/i)
      if (iofMatch) {
        const iofVal = parseCurrencyValue(iofMatch[1])
        transactions.push({
          date: detectedPeriod ? `${detectedPeriod}-04` : '2026-10-04',
          description: 'Repasse de IOF',
          amount: iofVal,
          accountOrCard: currentCard,
          category: 'Impostos e Taxas PF',
          subcategory: 'IOF',
          is_fixed: false,
          is_card_bill_payment: false,
          installment_current: null,
          installment_total: null
        })
      }
      continue
    }

    // Detecta menção a cartões ou bancos no cabeçalho
    if (/c6 carbon/i.test(line)) {
      currentCard = 'C6 Carbon Black Mastercard'
    } else if (/nubank|ultravioleta/i.test(line)) {
      currentCard = 'Nubank Ultravioleta'
    } else if (/itau.*personnalite|personnalite.*black|itau.*black/i.test(line) || (line.includes('Black') && /itau/i.test(rawText))) {
      currentCard = 'Itaú Personnalité Mastercard Black'
    } else if (/itau|personnalite/i.test(line)) {
      if (!currentCard.includes('Black')) currentCard = 'Itaú Personnalité'
    } else if (/inter/i.test(line) && !currentCard.includes('Itaú') && !currentCard.includes('C6')) {
      currentCard = 'Banco Inter'
    }

    // Detecta mudança de cartão específico
    if (/carbon.*final\s+(\d+)/i.test(line)) {
      const match = line.match(/carbon.*final\s+(\d+)(?:\s*-\s*([A-Za-z\s]+))?/i)
      const lastDigits = match?.[1] || ''
      const cardHolder = match?.[2] ? ` (${match[2].trim()})` : ''
      currentCard = `C6 Carbon Final ${lastDigits}${cardHolder}`
      continue
    }

    // Detecta total da fatura
    if (/valor da fatura|total da fatura|total desta fatura/i.test(line)) {
      const totalMatch = line.match(/(?:r\$\s*)?([0-9\.\,]+)$/i)
      if (totalMatch) {
        totalAmount = parseCurrencyValue(totalMatch[1])
      }
      continue
    }

    // Detecta competência ou vencimento no cabeçalho
    if (!detectedPeriod) {
      const vencMatch = line.match(/vencimento\s*(?:em\s*)?:?\s*(\d{1,2}\s+[a-z]{3,9}\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/i)
      if (vencMatch) {
        const parsed = parseInvoiceDate(vencMatch[1])
        detectedPeriod = parsed.slice(0, 7)
      }
    }

    // Descarta linhas com termos institucionais de bancos e boletos
    if (INSTITUTIONAL_BLACKLIST.some(regex => regex.test(line))) {
      continue
    }

    // ── Heurística Primária: Detecção na Mesma Linha ───────────────────────
    // Procura valor monetário brasileiro na linha (ex: R$ 336,76 ou 45,90 ou 1.250,00)
    const valueRegex = /(?:r\$\s*)?(-?\s*\d{1,3}(?:\.\d{3})*,\d{2}|-?\s*\d+,\d{2})/i
    const valMatch = line.match(valueRegex)

    if (valMatch) {
      const rawVal = parseCurrencyValue(valMatch[0])
      // Ignora valores zerados (R$ 0,00) que geralmente são metadados ou ruído
      if (rawVal !== 0) {
        // Procura data na linha: "15/05/2026", "15/05", "15 mai", "15 de maio", "15.05"
        const dateRegex = /\b(\d{1,2}[\/\.-]\d{1,2}(?:[\/\.-]\d{2,4})?|\d{1,2}\s+(?:de\s+)?[a-z]{3,9}(?:\s+\d{2,4})?)\b/i
        const dateMatch = line.match(dateRegex)

        if (dateMatch) {
          const formattedDate = parseInvoiceDate(dateMatch[0])

          if (!detectedPeriod) {
            detectedPeriod = formattedDate.slice(0, 7)
          }

          // A descrição é o que sobra ao remover a data e o valor da linha
          let descText = line
            .replace(dateMatch[0], '')
            .replace(valMatch[0], '')
            .replace(/r\$/gi, '')
            .replace(/[\*•|]+/g, ' ')
            .trim()

          // Detecta parcelas (ex: "Parcela 03/10" ou "03/10")
          let installmentCurrent: number | null = null
          let installmentTotal: number | null = null
          const parcelMatch = descText.match(/(?:parcela\s+|parc\s+)?(\d{1,2})\/(\d{1,2})/i)
          if (parcelMatch) {
            installmentCurrent = parseInt(parcelMatch[1], 10)
            installmentTotal = parseInt(parcelMatch[2], 10)
          }

          // Limpa pontuação ou dígitos isolados no início
          descText = descText.replace(/\s+/g, ' ').replace(/^[\d\s\.\,\-]+/, '').trim()

          if (descText.length >= 2) {
            const pred = CategoryRulesEngine.predict(descText, 'PF')

            transactions.push({
              date: formattedDate,
              description: descText,
              amount: Math.abs(rawVal),
              accountOrCard: currentCard,
              category: pred.category,
              subcategory: pred.subcategory,
              subdivision: pred.subdivision,
              is_fixed: pred.isCardBillPayment || Boolean(installmentTotal && installmentTotal > 1),
              is_card_bill_payment: pred.isCardBillPayment,
              installment_current: installmentCurrent,
              installment_total: installmentTotal
            })
            continue
          }
        }
      }
    }

    // ── Heurística Secundária: Linhas Divididas (Data em uma linha, Descrição e Valor na seguinte) ──
    const dateAtStartRegex = /^(\d{1,2}\s+(?:de\s+)?[a-z]{3,9}(?:\s+\d{2,4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})\b/i
    if (dateAtStartRegex.test(line) && i + 1 < lines.length) {
      const nextLine = lines[i + 1]
      const nextValMatch = nextLine.match(valueRegex)

      if (nextValMatch) {
        const val = parseCurrencyValue(nextValMatch[0])
        if (val !== 0) {
          const desc = nextLine.replace(nextValMatch[0], '').replace(/r\$/gi, '').trim()
          if (desc.length >= 2 && !INSTITUTIONAL_BLACKLIST.some(r => r.test(desc))) {
            const formattedDate = parseInvoiceDate(line)
            const pred = CategoryRulesEngine.predict(desc, 'PF')

            transactions.push({
              date: formattedDate,
              description: desc,
              amount: Math.abs(val),
              accountOrCard: currentCard,
              category: pred.category,
              subcategory: pred.subcategory,
              subdivision: pred.subdivision,
              is_fixed: pred.isCardBillPayment,
              is_card_bill_payment: pred.isCardBillPayment,
              installment_current: null,
              installment_total: null
            })
            i++ // Consumiu a próxima linha
            continue
          }
        }
      }
    }
  }

  const finalPeriod = detectedPeriod || (transactions.length > 0 ? transactions[0].date.slice(0, 7) : new Date().toISOString().slice(0, 7))

  if (totalAmount === 0 && transactions.length > 0) {
    totalAmount = transactions.reduce((acc, t) => acc + (t.is_card_bill_payment ? 0 : t.amount), 0)
  }

  return {
    document_type: currentCard.toLowerCase().includes('c6') ? 'C6_FATURA_PDF' : 'EXTRATO_BANCARIO',
    period: finalPeriod,
    institution: currentCard,
    total_amount: totalAmount,
    transactions
  }
}
