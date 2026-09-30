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
  document_type: 'C6_FATURA_PDF' | 'C6_FATURA_PRINT' | 'MOBILLS_PRINT' | 'EXTRATO_BANCARIO' | 'OUTRO'
  period: string // 'YYYY-MM'
  institution: string
  total_amount: number
  transactions: ExtractedTransaction[]
  raw_summary?: Record<string, number>
}

/**
 * Converte data de fatura no formato "15 mai", "04 abr", "13 jul" para "YYYY-MM-DD"
 */
export function parseInvoiceDate(dateStr: string, defaultYear = 2026): string {
  const monthsMap: Record<string, string> = {
    jan: '01', fev: '02', mar: '03', abr: '04',
    mai: '05', jun: '06', jul: '07', ago: '08',
    set: '09', out: '10', nov: '11', dez: '12'
  }

  const clean = dateStr.trim().toLowerCase()
  const match = clean.match(/(\d{1,2})\s+([a-z]{3})/i)
  if (match) {
    const day = match[1].padStart(2, '0')
    const month = monthsMap[match[2]] || '06'
    return `${defaultYear}-${month}-${day}`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean
  }

  return `${defaultYear}-07-15`
}

/**
 * Prompt de sistema com a taxonomia personalizada do usuário.
 */
export function buildDocumentParserPrompt(): string {
  const taxonomySummary = USER_TAXONOMY.map(c => 
    `- ${c.name} (${c.scope}): [${c.subcategories.map(s => s.name).join(', ')}]`
  ).join('\n')

  return `Você é um especialista em conciliação contábil e auditoria financeira.
Sua missão é extrair transações financeiras REAIS de faturas ou prints enviados (ex: C6 Bank Carbon Black, Nubank, Itaú, extratos bancários).

TAXONOMIA OFICIAL OBRIGATÓRIA DO USUÁRIO:
${taxonomySummary}

REGRAS RÍGIDAS DE EXTRAÇÃO:
1. Extraia TODAS as transações visíveis na imagem ou documento exatamente como escritas, sem inventar nenhum dado ou valor.
2. Identifique compras parceladas no formato "X/Y" ou "Parcela X de Y" (ex: "PORTO SEGURO CIA SEG G - Parcela 3/10", "MP *BARBIERIPARTS - Parcela 3/5", "SHOPEE*MOVEIS - Parcela 4/12").
3. Para Faturas de Cartão C6 Carbon:
   - Identifique os cartões titulares e adicionais (ex: "C6 Carbon Final 3774", "C6 Carbon Virtual Final 9074", "C6 Carbon Final 4317 - BARBARA").
   - Saídas/compras de cartão devem ter amount POSITIVO (ex: 336.76, 500.00, 39.97, 332.00).
   - Identifique pagamentos de fatura (ex: "Inclusao de Pagamento") e estornos (ex: "Estorno Tarifa").
4. Extraia o período de vencimento ou competência no formato "YYYY-MM" (ex: "Vencimento 10 de Agosto" -> "2026-08").

RETORNE APENAS JSON VÁLIDO no seguinte formato:
{
  "document_type": "C6_FATURA_PRINT",
  "period": "YYYY-MM",
  "institution": "C6 Carbon Black Mastercard",
  "total_amount": 0.00,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": 0.00,
      "account_or_card": "string",
      "category": "string",
      "subcategory": "string",
      "is_fixed": boolean,
      "installment_current": number | null,
      "installment_total": number | null
    }
  ]
}`
}

/**
 * Parser Inteligente de Texto/OCR de Faturas de Cartão C6 Carbon e Outros Bancos
 */
export function parseInvoiceFromTextOrOCR(rawText: string): DocumentParseResult {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const transactions: ExtractedTransaction[] = []

  let currentCard = 'C6 Carbon Black Mastercard'
  let period = '2026-08'
  let totalAmount = 0

  // Regex para linha de transação de fatura:
  // Ex: "15 mai  PORTO SEGURO CIA SEG G - Parcela 3/10   336,76"
  // Ex: "13 jul  ARAUJO LOJA                             39,97"
  // Ex: "23 jul  SUPERMERCADOS BH                        332,00"
  // Ex: "19 mai  MP *BARBIERIPARTS - Parcela 3/5        500,00"
  // Ex: "04 abr  SHOPEE*MOVEIS B P LTDA - Parcela 4/12  197,00"
  // Ex: "15 jul  TIM POS                                 139,99"
  const txRegex = /(\d{1,2}\s+[a-z]{3})\s+(.+?)\s+([0-9\.\,]+)$/i

  for (const line of lines) {
    // Detecta mudança de cartão
    if (/c6 carbon.*final\s+(\d+)/i.test(line)) {
      const match = line.match(/c6 carbon.*final\s+(\d+)(?:\s*-\s*([A-Za-z\s]+))?/i)
      const lastDigits = match?.[1] || ''
      const cardHolder = match?.[2] ? ` (${match[2].trim()})` : ''
      currentCard = `C6 Carbon Final ${lastDigits}${cardHolder}`
      continue
    }

    // Detecta total da fatura
    if (/valor da fatura:\s*r\$\s*([0-9\.\,]+)/i.test(line)) {
      const totalMatch = line.match(/valor da fatura:\s*r\$\s*([0-9\.\,]+)/i)
      if (totalMatch) {
        totalAmount = parseFloat(totalMatch[1].replace(/\./g, '').replace(',', '.')) || 0
      }
      continue
    }

    // Match de linha de transação
    const match = line.match(txRegex)
    if (match) {
      const rawDate = match[1]
      const rawDesc = match[2].trim()
      const rawVal = parseFloat(match[3].replace(/\./g, '').replace(',', '.')) || 0

      // Detecta parcelas
      let installmentCurrent: number | null = null
      let installmentTotal: number | null = null
      const parcelMatch = rawDesc.match(/parcela\s+(\d+)\/(\d+)/i) || rawDesc.match(/(\d+)\/(\d+)$/)
      if (parcelMatch) {
        installmentCurrent = parseInt(parcelMatch[1], 10)
        installmentTotal = parseInt(parcelMatch[2], 10)
      }

      // Predição inteligente com USER_TAXONOMY
      const pred = CategoryRulesEngine.predict(rawDesc, 'PF')

      transactions.push({
        date: parseInvoiceDate(rawDate),
        description: rawDesc,
        amount: rawVal,
        accountOrCard: currentCard,
        category: pred.category,
        subcategory: pred.subcategory,
        subdivision: pred.subdivision,
        is_fixed: pred.isCardBillPayment || Boolean(installmentTotal && installmentTotal > 1),
        is_card_bill_payment: pred.isCardBillPayment,
        installment_current: installmentCurrent,
        installment_total: installmentTotal
      })
    }
  }

  // Se o total não foi capturado do cabeçalho, calcula pela soma das despesas
  if (totalAmount === 0 && transactions.length > 0) {
    totalAmount = transactions.reduce((acc, t) => acc + (t.is_card_bill_payment ? 0 : t.amount), 0)
  }

  return {
    document_type: 'C6_FATURA_PRINT',
    period,
    institution: currentCard,
    total_amount: totalAmount,
    transactions
  }
}
