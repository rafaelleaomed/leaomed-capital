/**
 * Dedicated investment CSV parser for Nuinvest, NuCripto, Bybit, MEXC, and Inter Global.
 *
 * Returns a structured InvestmentParseResult that captures per-transaction
 * asset, operation, quantity, price, and currency metadata — richer than the
 * generic ExtractedTransaction shape.
 */

import { parseCurrencyValue, parseInvoiceDate } from '@/utils/parseDateCurrency'

// ─── Public types ─────────────────────────────────────────────────────────

export interface InvestmentTransaction {
  date: string               // YYYY-MM-DD
  asset: string              // e.g. 'BTC', 'PETR4'
  operation: 'buy' | 'sell' | 'dividend' | 'income' | 'fee' | 'transfer'
  quantity: number
  price: number              // unit price
  total_brl: number          // total value in BRL
  fee?: number
  currency?: string          // 'BRL', 'USD', 'USDT', etc.
  exchange?: string          // 'Bybit', 'MEXC', 'Nuinvest', 'NuCripto', 'Inter Global'
  raw_symbol?: string
}

export interface InvestmentParseResult {
  source: string             // exchange/broker name
  period_start: string       // YYYY-MM
  period_end: string         // YYYY-MM
  transactions: InvestmentTransaction[]
  total_invested_brl: number
  total_sold_brl: number
  profile_id: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function splitLine(line: string, delimiter: string): string[] {
  const cols: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++ }
      else quoted = !quoted
    } else if (ch === delimiter && !quoted) {
      cols.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  cols.push(cur.trim())
  return quoted ? [] : cols
}

function detectDelimiter(header: string): string {
  const s = (header.match(/;/g) || []).length
  const c = (header.match(/,/g) || []).length
  const t = (header.match(/\t/g) || []).length
  if (s >= c && s >= t) return ';'
  if (t >= c) return '\t'
  return ','
}

function normalise(h: string): string {
  return h.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function parseRows(text: string): { header: string[]; rows: string[][]; delimiter: string } | null {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return null
  const delimiter = detectDelimiter(lines[0])
  const header = splitLine(lines[0], delimiter).map(normalise)
  const rows = lines.slice(1).map(l => splitLine(l, delimiter)).filter(r => r.length >= 2)
  return { header, rows, delimiter }
}

function periodOf(date: string): string {
  return date.slice(0, 7)
}

function buildResult(
  source: string,
  profileId: string,
  txs: InvestmentTransaction[]
): InvestmentParseResult {
  const dates = txs.map(t => t.date).sort()
  const period_start = dates.length ? periodOf(dates[0]) : new Date().toISOString().slice(0, 7)
  const period_end = dates.length ? periodOf(dates[dates.length - 1]) : period_start

  const total_invested_brl = txs
    .filter(t => t.operation === 'buy')
    .reduce((s, t) => s + t.total_brl, 0)
  const total_sold_brl = txs
    .filter(t => t.operation === 'sell')
    .reduce((s, t) => s + t.total_brl, 0)

  return { source, period_start, period_end, transactions: txs, total_invested_brl, total_sold_brl, profile_id: profileId }
}

// ─── Nuinvest (XP/Rico) ──────────────────────────────────────────────────
// Headers: Data Negócio,Tipo,Mercado,Prazo,Instituição,Código,Quantidade,Preço,Valor,DC

function parseNuinvest(text: string): InvestmentParseResult | null {
  const parsed = parseRows(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => /data.*neg[oó]cio|data.*negoc/.test(h))
  if (dateIdx < 0) return null

  const codeIdx = header.findIndex(h => h === 'codigo' || /^cod/.test(h))
  const qtyIdx = header.findIndex(h => /quantidade|qty/.test(h))
  const priceIdx = header.findIndex(h => /pre[cç]o/.test(h))
  const totalIdx = header.findIndex(h => h === 'valor' || h === 'total')
  const dcIdx = header.findIndex(h => h === 'dc' || h === 'd/c')

  if (codeIdx < 0 || totalIdx < 0) return null

  const txs: InvestmentTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const code = row[codeIdx] || 'ATIVO'
    const dc = (row[dcIdx] || '').trim().toUpperCase()
    const total = parseCurrencyValue(row[totalIdx] || '')
    // Skip rows with missing date, zero value, or unrecognised DC field (prevents silent misclassification)
    if (!rawDate || total === 0) continue
    if (dcIdx >= 0 && dc !== 'C' && dc !== 'D') continue

    txs.push({
      date: parseInvoiceDate(rawDate),
      asset: code,
      operation: dc === 'C' ? 'sell' : 'buy',
      quantity: qtyIdx >= 0 ? parseCurrencyValue(row[qtyIdx] || '') : 0,
      price: priceIdx >= 0 ? parseCurrencyValue(row[priceIdx] || '') : 0,
      total_brl: Math.abs(total),
      currency: 'BRL',
      exchange: 'Nuinvest',
      raw_symbol: code,
    })
  }
  return txs.length > 0 ? buildResult('Nuinvest', 'nuinvest', txs) : null
}

// ─── NuCripto ──────────────────────────────────────────────────────────────
// Headers: Data,Descrição,Quantidade,Valor em BRL

function parseNuCripto(text: string): InvestmentParseResult | null {
  const parsed = parseRows(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => h === 'data' || h === 'date')
  const descIdx = header.findIndex(h => /descri|description/.test(h))
  const qtyIdx = header.findIndex(h => /quantidade|amount/.test(h))
  const brlIdx = header.findIndex(h => /valor.*brl|value|brl/.test(h))

  if (dateIdx < 0 || brlIdx < 0) return null
  if (!header.some(h => /valor.*brl|brl/.test(h))) return null

  const txs: InvestmentTransaction[] = []
  for (const row of rows) {
    const rawDate = row[dateIdx] || ''
    const description = descIdx >= 0 ? (row[descIdx] || '') : ''
    const rawBrl = row[brlIdx] || ''

    if (!rawDate || !rawBrl) continue
    const brlValue = parseCurrencyValue(rawBrl)
    if (brlValue === 0) continue

    // Infer asset from description (e.g. "Compra BTC" → "BTC")
    const assetMatch = description.match(/\b([A-Z]{2,10})\b/)
    const asset = assetMatch ? assetMatch[1] : 'CRIPTO'
    const isBuy = /compra|buy|recebido/i.test(description) || brlValue < 0

    txs.push({
      date: parseInvoiceDate(rawDate),
      asset,
      operation: isBuy ? 'buy' : 'sell',
      quantity: qtyIdx >= 0 ? parseCurrencyValue(row[qtyIdx] || '') : 0,
      price: 0,
      total_brl: Math.abs(brlValue),
      currency: 'BRL',
      exchange: 'NuCripto',
      raw_symbol: description,
    })
  }
  return txs.length > 0 ? buildResult('NuCripto', 'nucripto', txs) : null
}

// ─── Bybit ────────────────────────────────────────────────────────────────
// Headers: Date(UTC),Symbol,Side,Price,Quantity,Fee,Total,Order ID

function parseBybit(text: string): InvestmentParseResult | null {
  const parsed = parseRows(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => /date.*utc|datetime/.test(h))
  if (dateIdx < 0) return null

  const symbolIdx = header.findIndex(h => h === 'symbol')
  const sideIdx = header.findIndex(h => h === 'side')
  const priceIdx = header.findIndex(h => h === 'price')
  const qtyIdx = header.findIndex(h => h === 'quantity' || h === 'qty')
  const feeIdx = header.findIndex(h => h === 'fee')
  const totalIdx = header.findIndex(h => h === 'total')

  if (symbolIdx < 0 || sideIdx < 0 || totalIdx < 0) return null

  const txs: InvestmentTransaction[] = []
  for (const row of rows) {
    const rawDate = (row[dateIdx] || '').split(' ')[0]
    const symbol = row[symbolIdx] || 'CRYPTO'
    const side = (row[sideIdx] || '').toLowerCase()
    const rawTotal = row[totalIdx] || ''

    if (!rawDate || !rawTotal) continue
    const total = parseFloat(rawTotal.replace(/,/g, ''))
    if (isNaN(total) || total === 0) continue

    const price = priceIdx >= 0 ? parseFloat(row[priceIdx] || '0') : 0
    const qty = qtyIdx >= 0 ? parseFloat(row[qtyIdx] || '0') : 0
    const fee = feeIdx >= 0 ? parseFloat(row[feeIdx] || '0') : 0

    // Detect quote currency (e.g. BTCUSDT → USDT, ETHBTC → BTC)
    const quoteCurrency = symbol.endsWith('USDT') ? 'USDT' :
                          symbol.endsWith('BTC') ? 'BTC' :
                          symbol.endsWith('ETH') ? 'ETH' : 'USD'

    const baseAsset = symbol.replace(/USDT$|BTC$|ETH$|BUSD$/, '')

    txs.push({
      date: parseInvoiceDate(rawDate),
      asset: baseAsset || symbol,
      operation: side === 'buy' ? 'buy' : 'sell',
      quantity: qty,
      price,
      total_brl: Math.abs(total),
      fee: fee > 0 ? fee : undefined,
      currency: quoteCurrency,
      exchange: 'Bybit',
      raw_symbol: symbol,
    })
  }
  return txs.length > 0 ? buildResult('Bybit', 'bybit', txs) : null
}

// ─── MEXC ─────────────────────────────────────────────────────────────────
// Headers: Time,Symbol,Side,Price,Amount,Total,Fee,Fee Coin

function parseMexc(text: string): InvestmentParseResult | null {
  const parsed = parseRows(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const timeIdx = header.findIndex(h => h === 'time' || h === 'hora')
  const symbolIdx = header.findIndex(h => h === 'symbol')
  const sideIdx = header.findIndex(h => h === 'side')
  const priceIdx = header.findIndex(h => h === 'price')
  const amtIdx = header.findIndex(h => h === 'amount')
  const totalIdx = header.findIndex(h => h === 'total')
  const feeIdx = header.findIndex(h => h === 'fee')
  const feeCoinIdx = header.findIndex(h => /fee.?coin/.test(h))

  if (timeIdx < 0 || symbolIdx < 0 || sideIdx < 0 || totalIdx < 0) return null
  if (amtIdx < 0 && feeCoinIdx < 0) return null

  const txs: InvestmentTransaction[] = []
  for (const row of rows) {
    const rawDate = (row[timeIdx] || '').split(' ')[0]
    const symbol = row[symbolIdx] || 'CRYPTO'
    const side = (row[sideIdx] || '').toLowerCase()
    const rawTotal = row[totalIdx] || ''

    if (!rawDate || !rawTotal) continue
    const total = parseFloat(rawTotal.replace(/,/g, ''))
    if (isNaN(total) || total === 0) continue

    const price = priceIdx >= 0 ? parseFloat(row[priceIdx] || '0') : 0
    const amount = amtIdx >= 0 ? parseFloat(row[amtIdx] || '0') : 0
    const fee = feeIdx >= 0 ? parseFloat(row[feeIdx] || '0') : 0
    const feeCoin = feeCoinIdx >= 0 ? row[feeCoinIdx] || '' : ''

    const quoteCurrency = symbol.endsWith('USDT') ? 'USDT' :
                          symbol.endsWith('BTC') ? 'BTC' : 'USD'
    const baseAsset = symbol.replace(/USDT$|BTC$|ETH$|BUSD$/, '')

    txs.push({
      date: parseInvoiceDate(rawDate),
      asset: baseAsset || symbol,
      operation: side === 'buy' ? 'buy' : 'sell',
      quantity: amount,
      price,
      total_brl: Math.abs(total),
      fee: fee > 0 ? fee : undefined,
      currency: feeCoin || quoteCurrency,
      exchange: 'MEXC',
      raw_symbol: symbol,
    })
  }
  return txs.length > 0 ? buildResult('MEXC', 'mexc', txs) : null
}

// ─── Inter Global ─────────────────────────────────────────────────────────
// Headers: Data,Ativo,Operação,Quantidade,Preço,Valor Total

function parseInterGlobal(text: string): InvestmentParseResult | null {
  const parsed = parseRows(text)
  if (!parsed) return null
  const { header, rows } = parsed

  const dateIdx = header.findIndex(h => h === 'data' || h === 'date')
  const assetIdx = header.findIndex(h => h === 'ativo' || h === 'asset' || h === 'codigo')
  const opIdx = header.findIndex(h => /opera[cç][aã]o|operation|tipo/.test(h))
  const qtyIdx = header.findIndex(h => /quantidade|qty/.test(h))
  const priceIdx = header.findIndex(h => /pre[cç]o|price/.test(h))
  const totalIdx = header.findIndex(h => /valor.*total|total.*valor|total|value/.test(h))

  if (dateIdx < 0 || assetIdx < 0 || opIdx < 0 || totalIdx < 0) return null

  const firstData = rows[0]
  if (!firstData) return null
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(firstData[dateIdx] || '')) return null

  const txs: InvestmentTransaction[] = []
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

    txs.push({
      date: parseInvoiceDate(rawDate),
      asset,
      operation: isBuy ? 'buy' : 'sell',
      quantity: qty,
      price,
      total_brl: Math.abs(total),
      currency: 'BRL',
      exchange: 'Inter Global',
      raw_symbol: asset,
    })
  }
  return txs.length > 0 ? buildResult('Inter Global', 'inter_global', txs) : null
}

// ─── Main export ──────────────────────────────────────────────────────────

/**
 * Parse an investment CSV from any supported source.
 * Attempts Bybit → MEXC → Nuinvest → NuCripto → Inter Global in order.
 * Returns null if no parser matches.
 */
export function parseInvestmentCsv(text: string): InvestmentParseResult | null {
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/)[0] || ''

  // Bybit: Date(UTC) header
  if (/date\(utc\)/i.test(firstLine)) {
    const r = parseBybit(text)
    if (r) return r
  }

  // MEXC: Time,Symbol,Side,... with Fee Coin
  if (/^time,symbol,side/i.test(firstLine) && /fee.?coin/i.test(firstLine)) {
    const r = parseMexc(text)
    if (r) return r
  }

  // Nuinvest: Data Negócio
  if (/data.*neg[oó]cio/i.test(firstLine)) {
    const r = parseNuinvest(text)
    if (r) return r
  }

  // NuCripto: Valor em BRL
  if (/valor.*em.*brl/i.test(firstLine)) {
    const r = parseNuCripto(text)
    if (r) return r
  }

  // Inter Global: Ativo + Operação columns
  if (/ativo/i.test(firstLine) && /opera[cç][aã]o/i.test(firstLine)) {
    const r = parseInterGlobal(text)
    if (r) return r
  }

  // Second pass: try all parsers if no header hint matched
  return parseBybit(text) ?? parseMexc(text) ?? parseNuinvest(text) ?? parseNuCripto(text) ?? parseInterGlobal(text) ?? null
}
