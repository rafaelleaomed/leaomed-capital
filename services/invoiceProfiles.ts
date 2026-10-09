/**
 * Deterministic, public-document based hints for Brazilian card invoices.
 *
 * A profile describes document structure only. It is deliberately kept free of
 * customer examples so parsers and tests never need to retain a real invoice.
 */
export type InvoiceProfileId =
  | 'c6'
  | 'caixa'
  | 'banco_do_brasil'
  | 'bradesco'
  | 'itau'
  | 'nubank'
  | 'inter'
  | 'santander'
  | 'generic'

export interface InvoiceProfile {
  id: InvoiceProfileId
  label: string
  /** Markers which identify a document, in preference order. */
  documentAnchors: RegExp[]
  /** Headers that start a real, posted transaction table. */
  transactionAnchors: RegExp[]
  /** Headers that stop a current transaction table. */
  excludedSectionAnchors: RegExp[]
  /** Text which is never a posted purchase, even when it has a currency value. */
  excludedLineAnchors: RegExp[]
  supportsCardSubtotals: boolean
  maturity: 'specialized' | 'generic_semantic'
}

const financialOfferAnchors = [
  /parcelamento\s+(?:da\s+)?fatura/i,
  /op[cç][oõ]es\s+de\s+parcelamento/i,
  /pagamento\s+m[ií]nimo/i,
  /encargos?\s+(?:do|de)\s+parcelamento/i,
  /juros\s+do\s+parcelamento/i,
  /cet\b/i,
  /iof\s+do\s+parcelamento/i,
  /compras?\s+parceladas?\s*-?\s*pr[oó]ximas?\s+faturas?/i,
]

const commonExcludedLines = [
  /linha\s+digit[aá]vel/i,
  /c[oó]digo\s+de\s+barras/i,
  /autentica[cç][aã]o/i,
  /benefici[aá]rio/i,
  /pagador/i,
  /ag[eê]ncia/i,
  /limite\s+(?:de\s+)?cr[eé]dito/i,
  /limite\s+dispon[ií]vel/i,
]

export const INVOICE_PROFILES: Record<InvoiceProfileId, InvoiceProfile> = {
  c6: {
    id: 'c6',
    label: 'C6 Bank',
    documentAnchors: [/\bc6\b/i, /c6\s+carbon/i],
    transactionAnchors: [/c6\s+carbon(?:\s+virtual)?\s+final\s+\d{4}/i, /transa[cç][oõ]es\s+dos\s+cart[oõ]es\s+adicionais/i],
    excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines,
    supportsCardSubtotals: true,
    maturity: 'specialized',
  },
  caixa: {
    id: 'caixa', label: 'CAIXA', documentAnchors: [/cart[oõ]es?\s+caixa/i, /\bcaixa\b/i],
    transactionAnchors: [/lan[cç]amentos|compras/i], excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines, supportsCardSubtotals: true, maturity: 'generic_semantic',
  },
  banco_do_brasil: {
    id: 'banco_do_brasil', label: 'Banco do Brasil / Ourocard', documentAnchors: [/ourocard/i, /banco\s+do\s+brasil/i],
    transactionAnchors: [/lan[cç]amentos|compras/i], excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines, supportsCardSubtotals: true, maturity: 'generic_semantic',
  },
  bradesco: {
    id: 'bradesco', label: 'Bradesco', documentAnchors: [/bradesco/i],
    transactionAnchors: [/lan[cç]amentos|despesas|compras/i], excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines, supportsCardSubtotals: true, maturity: 'generic_semantic',
  },
  itau: {
    id: 'itau', label: 'Itaú', documentAnchors: [/ita[uú]/i, /itaucard/i],
    transactionAnchors: [/lan[cç]amentos|compras|saques/i], excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines, supportsCardSubtotals: false, maturity: 'generic_semantic',
  },
  nubank: {
    id: 'nubank', label: 'Nubank', documentAnchors: [/nubank/i, /ultravioleta/i],
    transactionAnchors: [/compras|lan[cç]amentos/i], excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines, supportsCardSubtotals: false, maturity: 'generic_semantic',
  },
  inter: {
    id: 'inter', label: 'Banco Inter', documentAnchors: [/banco\s+inter/i, /\binter\b/i],
    transactionAnchors: [/compras|lan[cç]amentos/i], excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines, supportsCardSubtotals: false, maturity: 'generic_semantic',
  },
  santander: {
    id: 'santander', label: 'Santander', documentAnchors: [/santander/i],
    transactionAnchors: [/compras|lan[cç]amentos/i], excludedSectionAnchors: financialOfferAnchors,
    excludedLineAnchors: commonExcludedLines, supportsCardSubtotals: false, maturity: 'generic_semantic',
  },
  generic: {
    id: 'generic', label: 'Fatura bancária genérica', documentAnchors: [], transactionAnchors: [],
    excludedSectionAnchors: financialOfferAnchors, excludedLineAnchors: commonExcludedLines,
    supportsCardSubtotals: false, maturity: 'generic_semantic',
  },
}

export function detectInvoiceProfile(text: string): InvoiceProfile {
  return (Object.values(INVOICE_PROFILES) as InvoiceProfile[])
    .filter(profile => profile.id !== 'generic')
    .find(profile => profile.documentAnchors.some(anchor => anchor.test(text))) ?? INVOICE_PROFILES.generic
}
