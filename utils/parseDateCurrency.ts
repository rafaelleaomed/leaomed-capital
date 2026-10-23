/**
 * Shared date and currency parsing utilities.
 *
 * Extracted here to avoid circular imports between aiDocumentParser and
 * the bank-specific CSV parsers that need these helpers.
 */

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
