import { USER_TAXONOMY, USER_TAXONOMY_MAP, getSubcategoriesForCategory } from '@/utils/taxonomy'
import { CategoryRulesEngine } from '@/utils/categoryRulesEngine'
import { detectInvoiceProfile, InvoiceProfile, InvoiceProfileId } from '@/services/invoiceProfiles'
import { parseBankSpecificCsv } from '@/services/bankCsvParsers'
import { parseInvoiceDate as _parseInvoiceDate, parseCurrencyValue as _parseCurrencyValue } from '@/utils/parseDateCurrency'

export type InvoiceTransactionType = 'purchase' | 'refund' | 'fee' | 'bill_payment' | 'cash_withdrawal' | 'adjustment'

export interface InvoiceRejectedLine {
  reason: 'financial_offer' | 'future_installment' | 'institutional' | 'outside_transaction_section' | 'invalid_transaction'
  /** Structural marker only; never the source document text. */
  marker: string
}

export interface CardReconciliation {
  card: string
  expected_subtotal?: number
  extracted_subtotal: number
  difference?: number
  transaction_count: number
}

export interface InvoiceParseDiagnostics {
  profile: { id: InvoiceProfileId, label: string, maturity: 'specialized' | 'generic_semantic' }
  profile_id: InvoiceProfileId
  profile_label: string
  profile_maturity: 'specialized' | 'generic_semantic'
  confidence: 'high' | 'medium' | 'low'
  requires_review: boolean
  requiresReview: boolean
  excluded_lines: InvoiceRejectedLine[]
  /** Aggregated rejections, safe to expose without retaining invoice text. */
  rejected: Array<{ reason: InvoiceRejectedLine['reason'], count: number }>
  card_reconciliations: CardReconciliation[]
  cardReconciliations: CardReconciliation[]
  expected_invoice_total?: number
  declaredTotal?: number
  extracted_invoice_total: number
  extractedTotal: number
  invoice_difference?: number
  delta?: number
  /** Structural-only candidates for a future semantic provider. Never source text. */
  ambiguous_blocks?: Array<{ id: string, labels: string[], candidate_count: number, exclusion_markers: string[] }>
}

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
  /** Optional semantics for review UI; legacy import fields remain unchanged. */
  transaction_type?: InvoiceTransactionType
  /** Signed value for reconciliation. `amount` stays backwards compatible. */
  signed_amount?: number
  entryType?: InvoiceTransactionType
  signedAmount?: number
  direction?: 'debit' | 'credit'
}

export interface DocumentParseResult {
  document_type: 'C6_FATURA_PDF' | 'C6_FATURA_PRINT' | 'MOBILLS_PRINT' | 'EXTRATO_BANCARIO' | 'CSV_EXTRATO' | 'OFX_EXTRATO' | 'OUTRO'
  period: string // 'YYYY-MM'
  institution: string
  total_amount: number
  transactions: ExtractedTransaction[]
  raw_summary?: Record<string, number>
  diagnostics?: InvoiceParseDiagnostics
}

/**
 * Converte qualquer representaÃ§Ã£o de data em formato "YYYY-MM-DD".
 * Suporta:
 * - "15 mai", "04 abr", "13 jul"
 * - "15/05/2026", "15/05/26", "15/05"
 * - "2026-05-15"
 * - "15 de maio", "15 de maio de 2026"
 */
export function parseInvoiceDate(dateStr: string, defaultYear = new Date().getFullYear()): string {
  return _parseInvoiceDate(dateStr, defaultYear)
}

/**
 * Converte strings numÃ©ricas em formato monetÃ¡rio brasileiro para float.
 * Suporta: "1.250,50", "336,76", "-50,00", "R$ 450,20", "1250.50", "(800,00)"
 */
export function parseCurrencyValue(raw: string): number {
  return _parseCurrencyValue(raw)
}

/**
 * Parser para formato OFX bancÃ¡rio
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
      const desc = memoMatch ? memoMatch[1].trim() : 'LanÃ§amento BancÃ¡rio'
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
 * Parser para linhas CSV (delimItaúas por vÃ­rgula, ponto-e-vÃ­rgula ou tab)
 */
function splitDelimitedLine(line: string, delimiter: string): string[] {
  const columns: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { current += '"'; index++ }
      else quoted = !quoted
    } else if (char === delimiter && !quoted) {
      columns.push(current.trim())
      current = ''
    } else current += char
  }
  columns.push(current.trim())
  return quoted ? [] : columns
}

function isValidTransactionDate(raw: string): boolean {
  if (!/^(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\s+(?:de\s+)?(?:jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)(?:\s+(?:de\s+)?\d{2,4})?)$/i.test(raw)) return false
  const [year, month, day] = parseInvoiceDate(raw).split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
}

function isCurrencyColumn(raw: string): boolean {
  // Aceita: 145.20, 145,20, 1.250,50, R$ 145,20, -145.20, 1250.5, 1250, etc.
  // O Excel pode exportar valores com ponto decimal, vírgula decimal, ou sem casas decimais.
  return /^(?:r\$\s*)?-?(?:\d{1,3}(?:\.\d{3})*|\d+)(?:[.,]\d{1,2})?$/i.test(raw.trim())
}

function parseCsvContent(text: string): ExtractedTransaction[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  if (lines.length < 2) return []
  // A comma in prose or a monetary decimal is not a delimited table.
  for (const delimiter of [';', '\t', ',']) {
    const rows = lines.map(line => splitDelimitedLine(line, delimiter))
    const header = rows[0].map(value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
    const dateHeader = header.findIndex(value => /^(?:data|date|dia)(?:\s|$)/.test(value))
    const descHeader = header.findIndex(value => /desc|historico|estabelecimento|titulo|memo/.test(value))
    const amountHeader = header.findIndex(value => /^(?:valor|amount|quantia)(?:\s|$)/.test(value))
    const hasHeader = dateHeader >= 0 && descHeader >= 0 && amountHeader >= 0
    const dateIndex = hasHeader ? dateHeader : 0
    const descriptionIndex = hasHeader ? descHeader : 1
    const amountIndex = hasHeader ? amountHeader : 2
    const firstDataRow = hasHeader ? 1 : 0
    const validRow = (row: string[]) => row.length === rows[0].length && row.length >= 3 &&
      isValidTransactionDate(row[dateIndex] || '') && Boolean(row[descriptionIndex]) && isCurrencyColumn(row[amountIndex] || '')
    if (!hasHeader && !rows.every(validRow)) continue
    if (hasHeader && !rows.slice(firstDataRow).some(validRow)) continue
    return rows.slice(firstDataRow).filter(validRow).map(row => {
      const amount = parseCurrencyValue(row[amountIndex])
      const description = row[descriptionIndex]
      const pred = CategoryRulesEngine.predict(description, 'PF')
      const installment = extractInstallment(description)
      const type = transactionKind(description)
      const signedAmount = signedAmountFor(type, Math.abs(amount), amount)
      return {
        date: parseInvoiceDate(row[dateIndex]), description, amount: Math.abs(amount),
        category: pred.category, subcategory: pred.subcategory, subdivision: pred.subdivision,
        is_fixed: pred.isCardBillPayment || Boolean(installment.total && installment.total > 1),
        is_card_bill_payment: type === 'bill_payment' || pred.isCardBillPayment,
        installment_current: installment.current, installment_total: installment.total,
        transaction_type: type, signed_amount: signedAmount, entryType: type, signedAmount,
        direction: signedAmount < 0 ? 'credit' : 'debit',
      }
    })
  }
  return []
}

function normalizePdfLine(line: string): string {
  return line
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function findLastCurrencyValue(line: string): number | undefined {
  const amounts = line.match(/(?:r\$\s*)?-?\s*(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2}/gi)
  if (!amounts?.length) return undefined
  const value = parseCurrencyValue(amounts[amounts.length - 1])
  return value === 0 ? undefined : value
}

function transactionKind(description: string): InvoiceTransactionType {
  if (/estorno|reembolso|devolu[cÃ§][aÃ£]o|cr[eÃ©]dito\s+(?:de|em)\s+fatura/i.test(description)) return 'refund'
  if (/pagamento|inclus[aÃ£]o\s+de\s+pagamento|pgto\b/i.test(description)) return 'bill_payment'
  if (/saque|cash\s+advance/i.test(description)) return 'cash_withdrawal'
  if (/anuidade|tarifa|iof\b|encargo|multa/i.test(description)) return 'fee'
  if (/ajuste|lan[cÃ§]amento\s+manual/i.test(description)) return 'adjustment'
  return 'purchase'
}

function signedAmountFor(kind: InvoiceTransactionType, absoluteValue: number, rawValue: number): number {
  if (rawValue < 0 || kind === 'refund' || kind === 'bill_payment') return -Math.abs(absoluteValue)
  return Math.abs(absoluteValue)
}

function extractInstallment(description: string): { current: number | null, total: number | null } {
  const match = description.match(/(?:parcela\s+|parc\.?\s*)?(\d{1,2})\s*\/\s*(\d{1,2})/i)
  if (!match) return { current: null, total: null }
  const current = Number(match[1])
  const total = Number(match[2])
  return current > 0 && total >= current ? { current, total } : { current: null, total: null }
}

function inferInvoiceYear(lines: string[]): number {
  for (const line of lines) {
    const match = line.match(/(?:vencimento|fechamento|fatura)\D{0,20}(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(?:de\s+)?[a-z]{3,9}\s+(?:de\s+)?\d{4})/i)
    if (match) return Number(parseInvoiceDate(match[1]).slice(0, 4))
  }
  const explicitYear = lines.join(' ').match(/\b(20\d{2})\b/)
  return explicitYear ? Number(explicitYear[1]) : new Date().getFullYear()
}

function transactionYear(dateText: string, invoiceYear: number, invoicePeriod: string): number {
  if (/\b20\d{2}\b/.test(dateText)) return invoiceYear
  const transactionMonth = Number(parseInvoiceDate(dateText, invoiceYear).slice(5, 7))
  const invoiceMonth = Number(invoicePeriod.slice(5, 7))
  // A January statement commonly includes December purchases. Dates explicitly
  // carrying a year are handled by parseInvoiceDate itself.
  return transactionMonth > invoiceMonth ? invoiceYear - 1 : invoiceYear
}

function detectInvoicePeriod(lines: string[], fallbackYear: number): string {
  for (const line of lines) {
    const match = line.match(/(?:vencimento|fechamento|fatura)\D{0,20}(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(?:de\s+)?[a-z]{3,9}\s+(?:de\s+)?\d{4})/i)
    if (match) return parseInvoiceDate(match[1], fallbackYear).slice(0, 7)
  }
  return `${fallbackYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
}

function buildTransaction(input: {
  dateText: string
  description: string
  rawValue: number
  defaultYear: number
  card: string
  invoicePeriod?: string
}): ExtractedTransaction | null {
  const description = input.description.replace(/[\*â€¢|]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (description.length < 2) return null
  const installment = extractInstallment(description)
  const type = transactionKind(description)
  const amount = Math.abs(input.rawValue)
  const pred = CategoryRulesEngine.predict(description, 'PF')
  const signedAmount = signedAmountFor(type, amount, input.rawValue)
  return {
    date: parseInvoiceDate(input.dateText, input.invoicePeriod ? transactionYear(input.dateText, input.defaultYear, input.invoicePeriod) : input.defaultYear),
    description,
    amount,
    accountOrCard: input.card,
    category: pred.category,
    subcategory: pred.subcategory,
    subdivision: pred.subdivision,
    is_fixed: pred.isCardBillPayment || Boolean(installment.total && installment.total > 1),
    is_card_bill_payment: type === 'bill_payment' || pred.isCardBillPayment,
    installment_current: installment.current,
    installment_total: installment.total,
    transaction_type: type,
    signed_amount: signedAmount,
    entryType: type,
    signedAmount,
    direction: signedAmount < 0 ? 'credit' : 'debit',
  }
}

function lineHasDateAndValue(line: string): { date: string, description: string, value: number } | null {
  const dateMatch = line.match(/^\s*(\d{1,2}[\/\.-]\d{1,2}(?:[\/\.-]\d{2,4})?|\d{1,2}\s+(?:de\s+)?[a-z]{3,9}(?:\s+\d{2,4})?)(?:\s+|$)/i)
  const value = findLastCurrencyValue(line)
  if (!dateMatch || value === undefined) return null
  const valueText = line.match(/(?:r\$\s*)?-?\s*(?:\d{1,3}(?:\.\d{3})*|\d+),\d{2}\s*$/i)?.[0]
  if (!valueText) return null
  const description = line.slice(dateMatch[0].length, line.length - valueText.length).replace(/\br\$\s*/gi, '').trim()
  return description ? { date: dateMatch[1], description, value } : null
}

function isFinancialOffer(line: string, profile: InvoiceProfile): boolean {
  return profile.excludedSectionAnchors.some(anchor => anchor.test(line))
}

function beginsExcludedSection(line: string): boolean {
  return /parcelamento\s+(?:d[ae]\s+)?fatura|op[cÃ§][oÃµ]es\s+de\s+parcelamento|encargos?\s+(?:do|de)\s+parcelamento|compras?\s+parceladas?\s*-?\s*pr[oÃ³]ximas?\s+faturas?/i.test(line)
}

function isInstitutionalLine(line: string, profile: InvoiceProfile): boolean {
  return profile.excludedLineAnchors.some(anchor => anchor.test(line)) ||
    /h\s*o\s*l\s*d\s*i\s*n\s*g|u\s*n\s*i\s*b\s*a\s*n\s*c\s*o|\d{2}[\.\s]*\d{3}[\.\s]*\d{3}[\/\s]*\d{4}[-\s]*\d{2}/i.test(line)
}

function rejectedSummary(items: InvoiceRejectedLine[]): Array<{ reason: InvoiceRejectedLine['reason'], count: number }> {
  const counts = new Map<InvoiceRejectedLine['reason'], number>()
  for (const item of items) counts.set(item.reason, (counts.get(item.reason) || 0) + 1)
  return [...counts.entries()].map(([reason, count]) => ({ reason, count }))
}

function makeDiagnostics(input: {
  profile: InvoiceProfile
  confidence: InvoiceParseDiagnostics['confidence']
  requiresReview: boolean
  excluded: InvoiceRejectedLine[]
  cards?: CardReconciliation[]
  declaredTotal?: number
  extractedTotal: number
  candidateCount?: number
}): InvoiceParseDiagnostics {
  const delta = input.declaredTotal === undefined ? undefined : Number((input.extractedTotal - input.declaredTotal).toFixed(2))
  const cards = input.cards || []
  const rejected = rejectedSummary(input.excluded)
  return {
    profile: { id: input.profile.id, label: input.profile.label, maturity: input.profile.maturity },
    profile_id: input.profile.id,
    profile_label: input.profile.label,
    profile_maturity: input.profile.maturity,
    confidence: input.confidence,
    requires_review: input.requiresReview,
    requiresReview: input.requiresReview,
    excluded_lines: input.excluded,
    rejected,
    card_reconciliations: cards,
    cardReconciliations: cards,
    expected_invoice_total: input.declaredTotal,
    declaredTotal: input.declaredTotal,
    extracted_invoice_total: input.extractedTotal,
    extractedTotal: input.extractedTotal,
    invoice_difference: delta,
    delta,
    ambiguous_blocks: input.requiresReview ? [{
      id: 'deterministic-review',
      labels: [input.profile.id, input.profile.maturity],
      candidate_count: input.candidateCount || 0,
      exclusion_markers: rejected.map(item => item.reason),
    }] : [],
  }
}

function parseC6Invoice(lines: string[], profile: InvoiceProfile, defaultYear: number, invoicePeriod: string): {
  transactions: ExtractedTransaction[]
  expectedTotal?: number
  expectedSubtotals: Map<string, number>
  excluded: InvoiceRejectedLine[]
} {
  const transactions: ExtractedTransaction[] = []
  const expectedSubtotals = new Map<string, number>()
  const excluded: InvoiceRejectedLine[] = []
  let expectedTotal: number | undefined
  // Text-mode exports sometimes omit the per-card header. Preserve the legacy
  // import path, but mark it for review because it cannot be reconciled.
  let currentCard: string | null = lines.some(line => /c6\s+carbon(?:\s+virtual)?\s+final\s+\d{4}/i.test(line))
    ? null
    : 'C6 CartÃ£o de CrÃ©dito'
  let insideExcludedSection = false

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const totalMatch = line.match(/(?:valor|total)(?:\s+da|\s+desta)?\s+fatura\D{0,25}(r?\$?\s*[\d.,]+)/i)
    if (totalMatch) expectedTotal = parseCurrencyValue(totalMatch[1])

    const cardMatch = line.match(/c6\s+carbon(?:\s+virtual)?\s+final\s+(\d{4})/i)
    if (cardMatch) {
      const virtual = /virtual/i.test(line) ? ' Virtual' : ''
      currentCard = `C6 Carbon${virtual} Final ${cardMatch[1]}`
      const subtotalMatch = line.match(/subtotal\s+(?:deste|do)\s+cart[aÃ£]o\D{0,25}(r?\$?\s*[\d.,]+)/i)
      if (subtotalMatch) expectedSubtotals.set(currentCard, parseCurrencyValue(subtotalMatch[1]))
      insideExcludedSection = false
      continue
    }

    if (currentCard && /subtotal\s+(?:deste|do)\s+cart[aã]o/i.test(line)) {
      const subtotal = findLastCurrencyValue(line) ?? (/^(?:r\$\s*)?[\d.,]+$/i.test(lines[index + 1] || '') ? findLastCurrencyValue(lines[index + 1]) : undefined)
      if (subtotal !== undefined) expectedSubtotals.set(currentCard, subtotal)
      continue
    }

    if (/transa[cÃ§][oÃµ]es\s+dos\s+cart[oÃµ]es\s+adicionais/i.test(line)) {
      insideExcludedSection = false
      continue
    }

    if (isFinancialOffer(line, profile)) {
      insideExcludedSection = insideExcludedSection || beginsExcludedSection(line)
      excluded.push({ reason: /pr[oÃ³]ximas?\s+faturas?/i.test(line) ? 'future_installment' : 'financial_offer', marker: 'section_anchor' })
      continue
    }
    if (isInstitutionalLine(line, profile)) {
      excluded.push({ reason: 'institutional', marker: 'institutional_anchor' })
      continue
    }
    if (insideExcludedSection) {
      if (lineHasDateAndValue(line)) excluded.push({ reason: 'financial_offer', marker: 'transaction_inside_excluded_section' })
      continue
    }
    if (!currentCard) {
      if (lineHasDateAndValue(line)) excluded.push({ reason: 'outside_transaction_section', marker: 'missing_card_anchor' })
      continue
    }

    let candidate = lineHasDateAndValue(line)
    // PDF.js may emit a row as date / merchant / amount on adjacent lines.
    // Join only within a posted card section, stopping at the next row/header.
    if (!candidate && /^(?:\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?|\d{1,2}\s+(?:de\s+)?[a-z]{3,9})(?:\s|$)/i.test(line)) {
      let combined = line
      for (let offset = 1; offset <= 3 && index + offset < lines.length; offset++) {
        const next = lines[index + offset]
        if (/^(?:\d{1,2}[\/.-]\d{1,2}|\d{1,2}\s+(?:de\s+)?(?:jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez))\b/i.test(next) ||
          profile.transactionAnchors.some(anchor => anchor.test(next)) || isFinancialOffer(next, profile) || isInstitutionalLine(next, profile) || /subtotal/i.test(next)) break
        combined += ` ${next}`
        candidate = lineHasDateAndValue(combined)
        if (candidate) { index += offset; break }
      }
    }
    if (!candidate) continue
    const transaction = buildTransaction({ dateText: candidate.date, description: candidate.description, rawValue: candidate.value, defaultYear, card: currentCard, invoicePeriod })
    if (transaction) transactions.push(transaction)
    else excluded.push({ reason: 'invalid_transaction', marker: 'incomplete_transaction' })
  }
  return { transactions, expectedTotal, expectedSubtotals, excluded }
}

function parseTextInvoice(rawText: string): DocumentParseResult {
  const lines = rawText.split(/\r?\n/).map(normalizePdfLine).filter(Boolean)
  const profile = detectInvoiceProfile(rawText)
  const defaultYear = inferInvoiceYear(lines)
  const expectedPeriod = detectInvoicePeriod(lines, defaultYear)

  if (profile.id === 'c6') {
    const c6 = parseC6Invoice(lines, profile, defaultYear, expectedPeriod)
    const cards = new Map<string, ExtractedTransaction[]>()
    for (const tx of c6.transactions) {
      const key = tx.accountOrCard || 'CartÃ£o de CrÃ©dito'
      cards.set(key, [...(cards.get(key) || []), tx])
    }
    const cardReconciliations = [...cards.entries()].map(([card, txs]) => {
      const extracted = txs
        .filter(tx => tx.transaction_type !== 'bill_payment')
        .reduce((sum, tx) => sum + (tx.signed_amount ?? tx.amount), 0)
      const expected = c6.expectedSubtotals.get(card)
      return {
        card,
        expected_subtotal: expected,
        extracted_subtotal: Number(extracted.toFixed(2)),
        difference: expected === undefined ? undefined : Number((extracted - expected).toFixed(2)),
        transaction_count: txs.length,
      }
    })
    const extractedInvoiceTotal = cardReconciliations.reduce((sum, card) => sum + card.extracted_subtotal, 0)
    const invoiceDifference = c6.expectedTotal === undefined ? undefined : Number((extractedInvoiceTotal - c6.expectedTotal).toFixed(2))
    const requiresReview = c6.expectedTotal === undefined || cardReconciliations.some(card => card.expected_subtotal === undefined || (card.difference !== undefined && Math.abs(card.difference) > 0.01)) || (invoiceDifference !== undefined && Math.abs(invoiceDifference) > 0.01)
    return {
      document_type: 'C6_FATURA_PDF',
      period: expectedPeriod,
      institution: profile.label,
      total_amount: c6.expectedTotal ?? Number(extractedInvoiceTotal.toFixed(2)),
      transactions: c6.transactions,
      diagnostics: makeDiagnostics({ profile, confidence: requiresReview ? 'medium' : 'high', requiresReview, excluded: c6.excluded, cards: cardReconciliations, declaredTotal: c6.expectedTotal, extractedTotal: Number(extractedInvoiceTotal.toFixed(2)), candidateCount: c6.transactions.length }),
    }
  }

  const transactions: ExtractedTransaction[] = []
  const excluded: InvoiceRejectedLine[] = []
  let insideExcludedSection = false
  let currentCard = profile.label === 'Fatura bancÃ¡ria genÃ©rica' ? 'CartÃ£o de CrÃ©dito' : profile.label
  let expectedTotal: number | undefined

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const totalMatch = line.match(/(?:valor|total)(?:\s+da|\s+desta)?\s+fatura\D{0,25}(r?\$?\s*[\d.,]+)/i)
    if (totalMatch) expectedTotal = parseCurrencyValue(totalMatch[1])
    if (insideExcludedSection && (
      profile.transactionAnchors.some(anchor => anchor.test(line)) ||
      /^(?:lan[cÃ§]amentos|compras|transa[cÃ§][oÃµ]es|cart[aÃ£]o\s+(?:final|virtual|adicional))/i.test(line)
    )) {
      insideExcludedSection = false
    }
    if (isFinancialOffer(line, profile)) {
      insideExcludedSection = beginsExcludedSection(line)
      excluded.push({ reason: /pr[oÃ³]ximas?\s+faturas?/i.test(line) ? 'future_installment' : 'financial_offer', marker: 'section_anchor' })
      continue
    }
    if (isInstitutionalLine(line, profile)) {
      excluded.push({ reason: 'institutional', marker: 'institutional_anchor' })
      continue
    }
    if (insideExcludedSection) {
      if (lineHasDateAndValue(line)) excluded.push({ reason: 'financial_offer', marker: 'transaction_inside_excluded_section' })
      continue
    }
    const candidate = lineHasDateAndValue(line)
    if (candidate) {
      const transaction = buildTransaction({ dateText: candidate.date, description: candidate.description, rawValue: candidate.value, defaultYear, card: currentCard, invoicePeriod: expectedPeriod })
      if (transaction) transactions.push(transaction)
      continue
    }
    // PDF extractors occasionally put date on a line by itself.
    const dateOnly = line.match(/^(\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?|\d{1,2}\s+(?:de\s+)?[a-z]{3,9})$/i)
    const next = lines[index + 1] ? lineHasDateAndValue(`01/01 ${lines[index + 1]}`) : null
    if (dateOnly && next) {
      const transaction = buildTransaction({ dateText: dateOnly[1], description: next.description, rawValue: next.value, defaultYear, card: currentCard, invoicePeriod: expectedPeriod })
      if (transaction) transactions.push(transaction)
      index++
    }
  }

  const extractedInvoiceTotal = transactions
    .filter(tx => tx.transaction_type !== 'bill_payment')
    .reduce((sum, tx) => sum + (tx.signed_amount ?? tx.amount), 0)
  const invoiceDifference = expectedTotal === undefined ? undefined : Number((extractedInvoiceTotal - expectedTotal).toFixed(2))
  const requiresReview = profile.maturity === 'generic_semantic' || (invoiceDifference !== undefined && Math.abs(invoiceDifference) > 0.01)
  return {
    document_type: 'EXTRATO_BANCARIO',
    period: transactions[0]?.date.slice(0, 7) || expectedPeriod,
    institution: profile.label,
    total_amount: expectedTotal ?? Number(extractedInvoiceTotal.toFixed(2)),
    transactions,
      diagnostics: makeDiagnostics({ profile, confidence: transactions.length ? (requiresReview ? 'medium' : 'high') : 'low', requiresReview, excluded, declaredTotal: expectedTotal, extractedTotal: Number(extractedInvoiceTotal.toFixed(2)), candidateCount: transactions.length }),
  }
}

/**
 * Parser determinÃ­stico de texto/OCR. O contrato legado (transactions,
 * institution, period e total_amount) Ã© preservado; `diagnostics` Ã© opcional
 * para a prÃ©via de revisÃ£o e para uma futura camada semÃ¢ntica sanitizada.
 */
export function parseInvoiceFromTextOrOCR(rawText: string): DocumentParseResult {
  const genericProfile = detectInvoiceProfile('')
  if (!rawText || rawText.trim().length === 0) {
    return {
      document_type: 'OUTRO', period: new Date().toISOString().slice(0, 7), institution: 'Fatura BancÃ¡ria', total_amount: 0, transactions: [],
      diagnostics: makeDiagnostics({ profile: genericProfile, confidence: 'low', requiresReview: true, excluded: [], extractedTotal: 0 }),
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
        institution: 'Extrato BancÃ¡rio OFX',
        total_amount: totalAmount,
        transactions: ofxTxs,
        diagnostics: makeDiagnostics({ profile: { ...genericProfile, label: 'Extrato OFX estruturado', maturity: 'specialized' }, confidence: 'high', requiresReview: false, excluded: [], extractedTotal: totalAmount })
      }
    }
  }

  // 2. Tenta formato CSV estruturado
  if (/[;,\t]/.test(rawText)) {
    // 2.5. Tenta parsers especializados de bancos antes do CSV genérico
    const bankSpecific = parseBankSpecificCsv(rawText)
    if (bankSpecific && bankSpecific.length > 0) {
      const period = bankSpecific[0].date.slice(0, 7)
      const totalAmount = bankSpecific.reduce((sum, t) => sum + t.amount, 0)
      return {
        document_type: 'CSV_EXTRATO',
        period,
        institution: 'Extrato Bancário CSV',
        total_amount: totalAmount,
        transactions: bankSpecific,
        diagnostics: makeDiagnostics({ profile: { ...genericProfile, label: 'Extrato CSV bancário especializado', maturity: 'specialized' }, confidence: 'high', requiresReview: false, excluded: [], extractedTotal: totalAmount })
      }
    }

    const csvTxs = parseCsvContent(rawText)
    if (csvTxs.length > 0) {
      const period = csvTxs[0].date.slice(0, 7)
      const totalAmount = csvTxs.reduce((sum, t) => sum + t.amount, 0)
      return {
        document_type: 'CSV_EXTRATO',
        period,
        institution: 'Fatura/Extrato CSV',
        total_amount: totalAmount,
        transactions: csvTxs,
        diagnostics: makeDiagnostics({ profile: { ...genericProfile, label: 'Extrato CSV estruturado', maturity: 'specialized' }, confidence: 'high', requiresReview: false, excluded: [], extractedTotal: totalAmount })
      }
    }
  }

  return parseTextInvoice(rawText)

  /* Retired legacy line-by-line parser. Kept temporarily only to make the
   * migration diff reviewable; it is intentionally outside the build. */
  /*
  // Blacklist institucional: Termos de cabeÃ§alho bancÃ¡rio, dados de boleto, agÃªncia e holdings que NUNCA sÃ£o compras
  const INSTITUTIONAL_BLACKLIST = [
    /h\s*o\s*l\s*d\s*i\s*n\s*g/i,
    /u\s*n\s*i\s*b\s*a\s*n\s*c\s*o/i,
    /i\s*t\s*a\s*u/i,
    /\d{2}[\.\s]*\d{3}[\.\s]*\d{3}[\/\s]*\d{4}[-\s]*\d{2}/, // CNPJs em geral
    /b\s*a\s*n\s*c\s*o/i,
    /ouvidoria/i,
    /sac\s*0800/i,
    /autentica/i,
    /linha\s+digit[aÃ¡]vel/i,
    /c[oÃ³]digo\s+de\s+barras/i,
    /benefici[aÃ¡]rio/i,
    /pagador/i,
    /ag[eÃª]ncia/i,
    /limite\s+de\s+cr[eÃ©]dito/i,
    /limite\s+dispon[iÃ­]vel/i,
    /pagamento\s+m[iÃ­]nimo/i,
    /encargos\s+financeiros/i,
    /cet\s+anual/i,
    /comprovante\s+de\s+pagamento/i,
    /demonstrativo\s+de\s+pagamento/i
  ]

  // 3. Parser de Texto Livre / Linhas de PDF / OCR
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const transactions: ExtractedTransaction[] = []

  let currentCard = 'CartÃ£o de CrÃ©dito'
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

    // Detecta inÃ­cio de compras parceladas futuras e encerra lanÃ§amentos correntes
    if (/compras parceladas\s*-\s*pr[oÃ³]ximas faturas/i.test(line)) {
      break
    }

    // Ignora linhas de pagamentos efetuados de fatura anterior
    if (/pagamento efetuado|total dos pagamentos|\b\d{1,2}\/\d{1,2}\s+pagamento\s+-/i.test(line)) {
      continue
    }

    // Captura repasse de IOF em faturas com lanÃ§amentos internacionais
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

    // Detecta menÃ§Ã£o a cartÃµes ou bancos no cabeÃ§alho
    if (/c6 carbon/i.test(line)) {
      currentCard = 'C6 Carbon Black Mastercard'
    } else if (/nubank|ultravioleta/i.test(line)) {
      currentCard = 'Nubank Ultravioleta'
    } else if (/Itaú.*Personnalité|Personnalité.*black|Itaú.*black/i.test(line) || (line.includes('Black') && /Itaú/i.test(rawText))) {
      currentCard = 'Itaúº Personnalité© Mastercard Black'
    } else if (/Itaú|Personnalité/i.test(line)) {
      if (!currentCard.includes('Black')) currentCard = 'Itaúº Personnalité©'
    } else if (/inter/i.test(line) && !currentCard.includes('Itaúº') && !currentCard.includes('C6')) {
      currentCard = 'Banco Inter'
    }

    // Detecta mudanÃ§a de cartÃ£o especÃ­fico
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

    // Detecta competÃªncia ou vencimento no cabeÃ§alho
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

    // â”€â”€ HeurÃ­stica PrimÃ¡ria: DetecÃ§Ã£o na Mesma Linha â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Procura valor monetÃ¡rio brasileiro na linha (ex: R$ 336,76 ou 45,90 ou 1.250,00)
    const valueRegex = /(?:r\$\s*)?(-?\s*\d{1,3}(?:\.\d{3})*,\d{2}|-?\s*\d+,\d{2})/i
    const valMatch = line.match(valueRegex)

    if (valMatch) {
      const rawVal = parseCurrencyValue(valMatch[0])
      // Ignora valores zerados (R$ 0,00) que geralmente sÃ£o metadados ou ruÃ­do
      if (rawVal !== 0) {
        // Procura data na linha: "15/05/2026", "15/05", "15 mai", "15 de maio", "15.05"
        const dateRegex = /\b(\d{1,2}[\/\.-]\d{1,2}(?:[\/\.-]\d{2,4})?|\d{1,2}\s+(?:de\s+)?[a-z]{3,9}(?:\s+\d{2,4})?)\b/i
        const dateMatch = line.match(dateRegex)

        if (dateMatch) {
          const formattedDate = parseInvoiceDate(dateMatch[0])

          if (!detectedPeriod) {
            detectedPeriod = formattedDate.slice(0, 7)
          }

          // A descriÃ§Ã£o Ã© o que sobra ao remover a data e o valor da linha
          let descText = line
            .replace(dateMatch[0], '')
            .replace(valMatch[0], '')
            .replace(/r\$/gi, '')
            .replace(/[\*â€¢|]+/g, ' ')
            .trim()

          // Detecta parcelas (ex: "Parcela 03/10" ou "03/10")
          let installmentCurrent: number | null = null
          let installmentTotal: number | null = null
          const parcelMatch = descText.match(/(?:parcela\s+|parc\s+)?(\d{1,2})\/(\d{1,2})/i)
          if (parcelMatch) {
            installmentCurrent = parseInt(parcelMatch[1], 10)
            installmentTotal = parseInt(parcelMatch[2], 10)
          }

          // Limpa pontuaÃ§Ã£o ou dÃ­gitos isolados no inÃ­cio
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

    // â”€â”€ HeurÃ­stica SecundÃ¡ria: Linhas Divididas (Data em uma linha, DescriÃ§Ã£o e Valor na seguinte) â”€â”€
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
            i++ // Consumiu a prÃ³xima linha
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
  */
}
