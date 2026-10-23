/**
 * Specialized bank-specific CSV parsers for Brazilian banks and investment platforms.
 *
 * Each parser recognises a specific CSV export format. Returns null when the
 * format doesn't match so the caller can fall back to the generic CSV parser.
 */

import { ExtractedTransaction } from '@/services/aiDocumentParser'
import { parseCurrencyValue, parseInvoiceDate } from '@/utils/parseDateCurrency'
import { CategoryRulesEngine } from '@/utils/categoryRulesEngine'

// ─── helpers ────────────────────────────────────────────────────────────────

function splitCsvLine(line: string, delimiter: string): string[] {
  const cols: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++ }
      else quoted = !quoted
    } else if (ch === delimiter && !quoted) {
      cols.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cols.push(current.trim())
  return quoted ? [] : cols
}

function detectDelimiter(header: string): string {
  const semicolons = (header.match(/;/g) || []).length
  const commas = (header.match(/,/g) || []).length
  const tabs = (header.match(/\t/g) || []).length
  if (semicolons >= commas && semicolons >= tabs) return ';'
  if (tabs >= commas) return '\t'
  return ','
}

function normaliseHeader(h: string): string {
  return h
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function parseLines(text: string): { header: string[]; rows: string[][]; delimiter: string } | null {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return null
  const delimiter = detectDelimiter(lines[0])
  const header = splitCsvLine(lines[0], delimiter).map(normaliseHeader)
  const rows = lines.slice(1).map(l => splitCsvLine(l, delimiter)).filter(r => r.length >= 2)
  return { header, rows, delimiter }
}

function makeInvestmentTx(params: {
  date: string
  description: string
  amount: number
  direction: 'debit' | 'credit'
  subcategory: string
}): ExtractedTransaction {
  return {
    date: params.date,
    description: params.description,
    amount: Math.abs(params.amount),
    category: 'Investimentos',
    subcategory: params.subcategory,
    is_fixed: false,
    is_card_bill_payment: false,
    installment_current: null,
    installment_total: null,
    direction: params.direction,
    transaction_type: params.direction === 'debit' ? 'purchase' : 'refund',
    signed_amount: params.direction === 'debit' ? Math.abs(params.amount) : -Math.abs(params.amount),
    signedAmount: params.direction === 'debit' ? Math.abs(params.amount) : -Math.abs(params.amount),
    entryType: params.direction === 'debit' ? 'purchase' : 'refund',
  }
}

// ─── Nubank PF extrato + credit card fatura ─────────────────────────────────
// Headers: Data,Categoria,Titulo,Valor  OR  date,category,title,amount
// Date: YYYY-MM-DD, amount: dot-decimal (positive = credit, negative = debit)

function parseNubankCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => h === 'data' || h === 'date')
  const descIdx = header.findIndex(h => h === 'titulo' || h === 'title' || h === 'descricao' || h === 'description')
  const amtIdx = header.findIndex(h => h === 'valor' || h === 'amount')

  if (dateIdx < 0 || descIdx < 0 || amtIdx < 0) return null

  // Validate date format: YYYY-MM-DD
  const firstData = rows[0]
  if (!firstData) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(firstData[dateIdx] || '')) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const rawAmt = row[amtIdx] || ''
    const description = row[descIdx] || ''
    if (!rawDate || !rawAmt || !description) continue

    const amount = parseFloat(rawAmt)
    if (isNaN(amount)) continue

    const pred = CategoryRulesEngine.predict(description, 'PF')
    const absAmt = Math.abs(amount)
    // Nubank: negative = debit (expense), positive = credit (income/refund)
    const direction: 'debit' | 'credit' = amount < 0 ? 'debit' : 'credit'

    txs.push({
      date: parseInvoiceDate(rawDate),
      description,
      amount: absAmt,
      category: pred.category,
      subcategory: pred.subcategory,
      subdivision: pred.subdivision,
      is_fixed: pred.isCardBillPayment,
      is_card_bill_payment: pred.isCardBillPayment,
      installment_current: null,
      installment_total: null,
      direction,
      transaction_type: amount < 0 ? 'purchase' : 'refund',
      signed_amount: amount,
      signedAmount: amount,
      entryType: amount < 0 ? 'purchase' : 'refund',
    })
  }
  return txs.length > 0 ? txs : null
}

// ─── Itaú extrato conta corrente CSV ────────────────────────────────────────
// Headers: Data,Histórico,Docto.,Crédito,Débito,Saldo  OR  Data,Descrição,Valor
// Date: DD/MM/YYYY

function parseItauCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => h === 'data' || h === 'date')
  if (dateIdx < 0) return null

  // Validate Itaú date: DD/MM/YYYY
  const firstData = rows[0]
  if (!firstData) return null
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(firstData[dateIdx] || '')) return null

  const descIdx = header.findIndex(h => /historico|descri|estabelecimento/.test(h))
  if (descIdx < 0) return null

  // Detect separate credit/debit columns vs single valor column
  const creditIdx = header.findIndex(h => /credito|credit/.test(h))
  const debitIdx = header.findIndex(h => /debito|debit/.test(h))
  const amtIdx = header.findIndex(h => h === 'valor' || h === 'amount' || h === 'quantia')

  const hasSplitCols = creditIdx >= 0 && debitIdx >= 0
  if (!hasSplitCols && amtIdx < 0) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const description = row[descIdx] || ''
    if (!rawDate || !description) continue

    let amount = 0
    let direction: 'debit' | 'credit' = 'debit'

    if (hasSplitCols) {
      const credit = parseCurrencyValue(row[creditIdx] || '')
      const debit = parseCurrencyValue(row[debitIdx] || '')
      if (credit > 0) { amount = credit; direction = 'credit' }
      else if (debit > 0) { amount = debit; direction = 'debit' }
      else continue
    } else {
      const raw = parseCurrencyValue(row[amtIdx] || '')
      if (raw === 0) continue
      amount = Math.abs(raw)
      direction = raw < 0 ? 'debit' : 'credit'
    }

    const pred = CategoryRulesEngine.predict(description, 'PF')
    txs.push({
      date: parseInvoiceDate(rawDate),
      description,
      amount,
      category: pred.category,
      subcategory: pred.subcategory,
      subdivision: pred.subdivision,
      is_fixed: pred.isCardBillPayment,
      is_card_bill_payment: pred.isCardBillPayment,
      installment_current: null,
      installment_total: null,
      direction,
      transaction_type: direction === 'credit' ? 'refund' : 'purchase',
      signed_amount: direction === 'debit' ? amount : -amount,
      signedAmount: direction === 'debit' ? amount : -amount,
      entryType: direction === 'credit' ? 'refund' : 'purchase',
    })
  }
  return txs.length > 0 ? txs : null
}

// ─── Inter PF/PJ extrato CSV ──────────────────────────────────────────────
// Headers: Data Lançamento,Histórico,Descrição,Valor  OR  Data,Descrição,Valor
// Date: DD/MM/YYYY, comma decimal (Brazilian)

function parseInterCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  // Inter often uses semicolon-delimited with "Data Lançamento" header
  const dateIdx = header.findIndex(h => /^data(\s|$)/.test(h) || /lancamento/.test(h))
  if (dateIdx < 0) return null

  const firstData = rows[0]
  if (!firstData) return null
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(firstData[dateIdx] || '')) return null

  // Must have "historico" or "descri" to distinguish from generic
  const descIdx = header.findIndex(h => /historico|descri/.test(h))
  if (descIdx < 0) return null

  const amtIdx = header.findIndex(h => h === 'valor' || h === 'amount')
  if (amtIdx < 0) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const description = row[descIdx] || ''
    const rawAmt = row[amtIdx] || ''
    if (!rawDate || !description || !rawAmt) continue

    const amount = parseCurrencyValue(rawAmt)
    if (amount === 0) continue

    const pred = CategoryRulesEngine.predict(description, 'PF')
    const absAmt = Math.abs(amount)
    const direction: 'debit' | 'credit' = amount < 0 ? 'debit' : 'credit'

    txs.push({
      date: parseInvoiceDate(rawDate),
      description,
      amount: absAmt,
      category: pred.category,
      subcategory: pred.subcategory,
      subdivision: pred.subdivision,
      is_fixed: pred.isCardBillPayment,
      is_card_bill_payment: pred.isCardBillPayment,
      installment_current: null,
      installment_total: null,
      direction,
      transaction_type: direction === 'credit' ? 'refund' : 'purchase',
      signed_amount: amount,
      signedAmount: amount,
      entryType: direction === 'credit' ? 'refund' : 'purchase',
    })
  }
  return txs.length > 0 ? txs : null
}

// ─── C6 extrato conta CSV ──────────────────────────────────────────────────
// Headers: DATA,DESCRIÇÃO,VALOR  or  Data,Descrição,Valor
// Date: DD/MM/YYYY

function parseC6ExtraoCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => h === 'data' || h === 'date')
  const descIdx = header.findIndex(h => /^descri/.test(h))
  const amtIdx = header.findIndex(h => h === 'valor' || h === 'amount')

  if (dateIdx < 0 || descIdx < 0 || amtIdx < 0) return null

  // Must be exactly 3 columns (DATA, DESCRIÇÃO, VALOR) to avoid ambiguity with fatura
  if (header.length !== 3) return null

  const firstData = rows[0]
  if (!firstData) return null
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(firstData[dateIdx] || '')) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const description = row[descIdx] || ''
    const rawAmt = row[amtIdx] || ''
    if (!rawDate || !description) continue

    const amount = parseCurrencyValue(rawAmt)
    if (amount === 0) continue

    const pred = CategoryRulesEngine.predict(description, 'PF')
    const absAmt = Math.abs(amount)
    const direction: 'debit' | 'credit' = amount < 0 ? 'debit' : 'credit'

    txs.push({
      date: parseInvoiceDate(rawDate),
      description,
      amount: absAmt,
      category: pred.category,
      subcategory: pred.subcategory,
      subdivision: pred.subdivision,
      is_fixed: pred.isCardBillPayment,
      is_card_bill_payment: pred.isCardBillPayment,
      installment_current: null,
      installment_total: null,
      direction,
      transaction_type: direction === 'credit' ? 'refund' : 'purchase',
      signed_amount: amount,
      signedAmount: amount,
      entryType: direction === 'credit' ? 'refund' : 'purchase',
    })
  }
  return txs.length > 0 ? txs : null
}

// ─── Nuinvest (XP/Rico) negociações CSV ────────────────────────────────────
// Headers: Data Negócio,Tipo,Mercado,Prazo,Instituição,Código,Quantidade,Preço,Valor,DC

function parseNuinvestCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => /data.*neg[oó]cio|data.*negoc/.test(h))
  if (dateIdx < 0) return null

  const codeIdx = header.findIndex(h => h === 'codigo' || h === 'code' || /^cod/.test(h))
  const qtyIdx = header.findIndex(h => /quantidade|qty|quantity/.test(h))
  const priceIdx = header.findIndex(h => /pre[cç]o|price/.test(h))
  const totalIdx = header.findIndex(h => h === 'valor' || h === 'total' || h === 'value')
  const dcIdx = header.findIndex(h => h === 'dc' || h === 'd/c')

  if (codeIdx < 0 || totalIdx < 0) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const code = row[codeIdx] || 'ATIVO'
    const rawTotal = row[totalIdx] || ''
    const dc = (row[dcIdx] || '').trim().toUpperCase()

    if (!rawDate || !rawTotal) continue

    const total = parseCurrencyValue(rawTotal)
    if (total === 0) continue

    const qty = qtyIdx >= 0 ? parseCurrencyValue(row[qtyIdx] || '') : 0
    const price = priceIdx >= 0 ? parseCurrencyValue(row[priceIdx] || '') : 0

    // D = Débito (compra), C = Crédito (venda)
    const isBuy = dc !== 'C'
    const description = `${code} ${isBuy ? 'Compra' : 'Venda'}${qty > 0 ? ` ${qty}x` : ''}${price > 0 ? ` @ R$${price.toFixed(2)}` : ''}`

    txs.push(makeInvestmentTx({
      date: parseInvoiceDate(rawDate),
      description,
      amount: total,
      direction: isBuy ? 'debit' : 'credit',
      subcategory: isBuy ? 'Aporte' : 'Resgate',
    }))
  }
  return txs.length > 0 ? txs : null
}

// ─── NuCripto CSV ─────────────────────────────────────────────────────────
// Headers: Data,Descrição,Quantidade,Valor em BRL  OR  Date,Description,Amount,Value

function parseNuCriptoCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => h === 'data' || h === 'date')
  const descIdx = header.findIndex(h => /descri|description/.test(h))
  const qtyIdx = header.findIndex(h => /quantidade|amount/.test(h))
  const brlIdx = header.findIndex(h => /valor.*brl|value|brl/.test(h))

  if (dateIdx < 0 || descIdx < 0 || brlIdx < 0) return null

  // Must have "valor em brl" or "value" to distinguish from other formats
  if (!header.some(h => /valor.*brl|brl/.test(h))) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const description = row[descIdx] || ''
    const rawBrl = row[brlIdx] || ''

    if (!rawDate || !description || !rawBrl) continue

    const brlValue = parseCurrencyValue(rawBrl)
    if (brlValue === 0) continue

    const qty = qtyIdx >= 0 ? parseCurrencyValue(row[qtyIdx] || '') : 0
    const isBuy = /compra|buy|recebido/i.test(description) || brlValue < 0
    const descFull = `${description}${qty > 0 ? ` ${qty}` : ''}`

    txs.push(makeInvestmentTx({
      date: parseInvoiceDate(rawDate),
      description: descFull,
      amount: Math.abs(brlValue),
      direction: isBuy ? 'debit' : 'credit',
      subcategory: isBuy ? 'Aporte' : 'Resgate',
    }))
  }
  return txs.length > 0 ? txs : null
}

// ─── Bybit Trade History CSV ──────────────────────────────────────────────
// Headers: Date(UTC),Symbol,Side,Price,Quantity,Fee,Total,Order ID

function parseBybitCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  // Bybit-specific header detection
  const dateIdx = header.findIndex(h => /date.*utc|datetime/.test(h))
  if (dateIdx < 0) return null

  const symbolIdx = header.findIndex(h => h === 'symbol' || h === 'par')
  const sideIdx = header.findIndex(h => h === 'side' || h === 'tipo')
  const priceIdx = header.findIndex(h => h === 'price' || h === 'preco')
  const qtyIdx = header.findIndex(h => h === 'quantity' || h === 'qty' || h === 'quantidade')
  const totalIdx = header.findIndex(h => h === 'total' || h === 'valor')
  const feeIdx = header.findIndex(h => h === 'fee' || h === 'taxa')

  if (symbolIdx < 0 || sideIdx < 0 || totalIdx < 0) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = (row[dateIdx] || '').split(' ')[0]  // strip time
    const symbol = row[symbolIdx] || 'CRYPTO'
    const side = (row[sideIdx] || '').toLowerCase()
    const rawTotal = row[totalIdx] || ''

    if (!rawDate || !rawTotal) continue

    const total = parseFloat(rawTotal.replace(/,/g, ''))
    if (isNaN(total) || total === 0) continue

    const price = priceIdx >= 0 ? parseFloat(row[priceIdx] || '0') : 0
    const qty = qtyIdx >= 0 ? parseFloat(row[qtyIdx] || '0') : 0
    const fee = feeIdx >= 0 ? parseFloat(row[feeIdx] || '0') : 0

    const isBuy = side === 'buy' || side === 'compra'
    const description = `${symbol} ${isBuy ? 'Buy' : 'Sell'}${qty > 0 ? ` ${qty}` : ''}${price > 0 ? ` @ ${price}` : ''}${fee > 0 ? ` (fee: ${fee})` : ''}`

    txs.push(makeInvestmentTx({
      date: parseInvoiceDate(rawDate),
      description,
      amount: Math.abs(total),
      direction: isBuy ? 'debit' : 'credit',
      subcategory: isBuy ? 'Aporte' : 'Resgate',
    }))
  }
  return txs.length > 0 ? txs : null
}

// ─── MEXC Spot Trade CSV ─────────────────────────────────────────────────
// Headers: Time,Symbol,Side,Price,Amount,Total,Fee,Fee Coin

function parseMexcCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const timeIdx = header.findIndex(h => h === 'time' || h === 'hora' || h === 'data')
  const symbolIdx = header.findIndex(h => h === 'symbol' || h === 'par')
  const sideIdx = header.findIndex(h => h === 'side' || h === 'tipo' || h === 'direcao')
  const totalIdx = header.findIndex(h => h === 'total' || h === 'valor')
  const feeIdx = header.findIndex(h => h === 'fee' || h === 'taxa')
  const feeCoinIdx = header.findIndex(h => /fee.?coin|moeda.?taxa/.test(h))

  if (timeIdx < 0 || symbolIdx < 0 || sideIdx < 0 || totalIdx < 0) return null

  // MEXC-specific: must have fee coin column or "amount" column
  const amtIdx = header.findIndex(h => h === 'amount' || h === 'quantidade')
  if (amtIdx < 0 && feeCoinIdx < 0) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = (row[timeIdx] || '').split(' ')[0]
    const symbol = row[symbolIdx] || 'CRYPTO'
    const side = (row[sideIdx] || '').toLowerCase()
    const rawTotal = row[totalIdx] || ''

    if (!rawDate || !rawTotal) continue

    const total = parseFloat(rawTotal.replace(/,/g, ''))
    if (isNaN(total) || total === 0) continue

    const amount = amtIdx >= 0 ? parseFloat(row[amtIdx] || '0') : 0
    const fee = feeIdx >= 0 ? parseFloat(row[feeIdx] || '0') : 0
    const feeCoin = feeCoinIdx >= 0 ? row[feeCoinIdx] || '' : ''

    const isBuy = side === 'buy' || side === 'compra'
    const description = `${symbol} ${isBuy ? 'Buy' : 'Sell'}${amount > 0 ? ` ${amount}` : ''}${fee > 0 ? ` (fee: ${fee} ${feeCoin})` : ''}`

    txs.push(makeInvestmentTx({
      date: parseInvoiceDate(rawDate),
      description,
      amount: Math.abs(total),
      direction: isBuy ? 'debit' : 'credit',
      subcategory: isBuy ? 'Aporte' : 'Resgate',
    }))
  }
  return txs.length > 0 ? txs : null
}

// ─── Inter Global (Inter Invest) CSV ────────────────────────────────────────
// Headers: Data,Ativo,Operação,Quantidade,Preço,Valor Total

function parseInterGlobalCsv(text: string): ExtractedTransaction[] | null {
  const parsed = parseLines(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => h === 'data' || h === 'date')
  const assetIdx = header.findIndex(h => h === 'ativo' || h === 'asset' || h === 'codigo')
  const opIdx = header.findIndex(h => /opera[cç][aã]o|operation|tipo/.test(h))
  const qtyIdx = header.findIndex(h => /quantidade|qty|quantity/.test(h))
  const priceIdx = header.findIndex(h => /pre[cç]o|price/.test(h))
  const totalIdx = header.findIndex(h => /valor.*total|total.*valor|total|value/.test(h))

  if (dateIdx < 0 || assetIdx < 0 || opIdx < 0 || totalIdx < 0) return null

  const firstData = rows[0]
  if (!firstData) return null
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(firstData[dateIdx] || '')) return null

  const txs: ExtractedTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const asset = row[assetIdx] || 'ATIVO'
    const operation = (row[opIdx] || '').toLowerCase()
    const rawTotal = row[totalIdx] || ''

    if (!rawDate || !rawTotal) continue

    const total = parseCurrencyValue(rawTotal)
    if (total === 0) continue

    const qty = qtyIdx >= 0 ? parseCurrencyValue(row[qtyIdx] || '') : 0
    const price = priceIdx >= 0 ? parseCurrencyValue(row[priceIdx] || '') : 0

    const isBuy = /compra|buy|subscri|aplica/i.test(operation)
    const description = `${asset} ${isBuy ? 'Compra' : 'Venda'}${qty > 0 ? ` ${qty}x` : ''}${price > 0 ? ` @ R$${price.toFixed(2)}` : ''}`

    txs.push(makeInvestmentTx({
      date: parseInvoiceDate(rawDate),
      description,
      amount: Math.abs(total),
      direction: isBuy ? 'debit' : 'credit',
      subcategory: isBuy ? 'Aporte' : 'Resgate',
    }))
  }
  return txs.length > 0 ? txs : null
}

// ─── Main dispatcher ────────────────────────────────────────────────────────

/**
 * Try all specialized bank CSV parsers in priority order.
 * Returns null when no parser matches, so callers can fall back to the generic CSV parser.
 */
export function parseBankSpecificCsv(text: string, profileId?: string): ExtractedTransaction[] | null {
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/)[0] || ''
  const headerLower = firstLine.toLowerCase()

  // ── Investment platforms (check before bank parsers, they have unique headers) ──

  // Bybit: Date(UTC) in header
  if (profileId === 'bybit' || /date\(utc\)/i.test(firstLine)) {
    const result = parseBybitCsv(text)
    if (result) return result
  }

  // MEXC: Time,Symbol,Side,Price,Amount,Total,Fee,Fee Coin
  if (profileId === 'mexc' || (/time,symbol,side/i.test(firstLine) && /fee.?coin/i.test(firstLine))) {
    const result = parseMexcCsv(text)
    if (result) return result
  }

  // Nuinvest / XP / Rico: Data Negócio
  if (profileId === 'nuinvest' || /data.*neg[oó]cio/i.test(firstLine)) {
    const result = parseNuinvestCsv(text)
    if (result) return result
  }

  // NuCripto: Valor em BRL
  if (profileId === 'nucripto' || /valor.*em.*brl/i.test(firstLine)) {
    const result = parseNuCriptoCsv(text)
    if (result) return result
  }

  // Inter Global: Ativo + Operação columns
  if (profileId === 'inter_global' || (/ativo/i.test(firstLine) && /opera[cç][aã]o/i.test(firstLine))) {
    const result = parseInterGlobalCsv(text)
    if (result) return result
  }

  // ── Bank statement parsers ──

  // Nubank: YYYY-MM-DD date format + titulo/category
  if (profileId === 'nubank' || /\bdata\b.*\bcategoria\b/i.test(firstLine) || /\bdata\b.*\btitulo\b/i.test(firstLine) ||
      /\bdate\b.*\bcategory\b/i.test(firstLine) || /\bdate\b.*\btitle\b/i.test(firstLine)) {
    const result = parseNubankCsv(text)
    if (result) return result
  }

  // Inter: Data Lançamento or Histórico columns
  if (profileId === 'inter' || /lan[cç]amento/i.test(headerLower) || (/historico/i.test(headerLower) && /\binter\b/i.test(text.slice(0, 500)))) {
    const result = parseInterCsv(text)
    if (result) return result
  }

  // Itaú: Histórico + Crédito + Débito headers
  if (profileId === 'itau' || /hist[oó]rico/i.test(headerLower) || (/cr[eé]dito/i.test(headerLower) && /d[eé]bito/i.test(headerLower))) {
    const result = parseItauCsv(text)
    if (result) return result
  }

  // C6 extrato: exactly DATA,DESCRIÇÃO,VALOR (3 columns, DD/MM/YYYY)
  if (profileId === 'c6') {
    const result = parseC6ExtraoCsv(text)
    if (result) return result
  }

  // Try C6 extrato without profile hint: 3-column CSV with date-like header
  if (/^data[,;]descri/i.test(firstLine)) {
    const result = parseC6ExtraoCsv(text)
    if (result) return result
  }

  return null
}
