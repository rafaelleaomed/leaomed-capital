import assert from 'node:assert/strict'
import { parseInvoiceFromTextOrOCR } from '../services/aiDocumentParser'

// Synthetic first-page prose and payment offers precede the actual card tables.
const invoice = `Olá, cliente! Sua fatura com vencimento em Outubro chegou
C6BANK Mastercard
no valor de R$ 703,55.
Data do vencimento: 10 de Outubro
10/10/2026
Opções de pagamento
Parcelamento de fatura
Entrada + 2x de R$ 243,95 R$ 731,85
Entrada + 9x de R$ 83,40 R$ 834,00
Juros do parcelamento em 11x 3,49% a.m. 50,93% a.a.
Transações do cartão principal
C6 Carbon Final 0001 - PORTADOR DEMO Subtotal deste cartão R$ 336,76
15 mai SEGURO DEMO - Parcela 5/10 336,76
10 set Inclusão de Pagamento 1.949,41
29 set Estorno Tarifa - Estorno 98,00
29 set Anuidade Diferenciada - Parcela 9/12 98,00
C6 Carbon Virtual Final 0002 - PORTADOR DEMO Subtotal deste cartão R$ 366,79
04 abr LOJA DEMO - Parcela 6/12 197,00
26 abr SERVIÇO DEMO - Parcela 6/12 29,80
15 set TELECOM DEMO 139,99`

for (const text of [invoice, invoice.replace(/ (?:SEGURO|LOJA|SERVIÇO|TELECOM)/g, '\t$&')]) {
  const result = parseInvoiceFromTextOrOCR(text)
  assert.equal(result.document_type, 'C6_FATURA_PDF', 'prose commas and monetary decimals do not identify CSV')
  assert.equal(result.diagnostics?.profile_id, 'c6')
  assert.equal(result.period, '2026-10')
  assert.equal(result.transactions.length, 7)
  assert.equal(result.transactions.some(tx => /entrada|juros|cet/i.test(tx.description)), false)
  assert.equal(result.transactions.find(tx => tx.transaction_type === 'bill_payment')?.signed_amount, -1949.41)
  assert.equal(result.transactions.find(tx => tx.transaction_type === 'refund')?.signed_amount, -98)
  assert.equal(result.diagnostics?.extractedTotal, 703.55)
}

const fragmented = invoice.replace('15 mai SEGURO DEMO - Parcela 5/10 336,76', '15 mai\nSEGURO DEMO - Parcela 5/10\n336,76')
  .replace('C6 Carbon Virtual Final 0002 - PORTADOR DEMO Subtotal deste cartão R$ 366,79', 'C6 Carbon Virtual Final 0002 - PORTADOR DEMO\nSubtotal deste cartão\nR$ 366,79')
assert.equal(parseInvoiceFromTextOrOCR(fragmented).transactions.length, 7, 'PDF text extraction may separate date, description and value')
assert.equal(parseInvoiceFromTextOrOCR(fragmented).diagnostics?.cardReconciliations[1].difference, 0)

const incomplete = invoice.replace('15 mai SEGURO DEMO - Parcela 5/10 336,76', '15 mai\nDESCRIÇÃO INCOMPLETA')
assert.equal(parseInvoiceFromTextOrOCR(incomplete).transactions.length, 6, 'an incomplete row cannot consume the next dated transaction')
assert.equal(parseInvoiceFromTextOrOCR(incomplete).transactions[0].transaction_type, 'bill_payment')

const excludedTable = invoice.replace('C6 Carbon Virtual Final 0002', 'Parcelamento de fatura\nJuros do parcelamento 3,49%\n15 set OFERTA FINANCEIRA 100,00\nC6 Carbon Virtual Final 0002')
assert.equal(parseInvoiceFromTextOrOCR(excludedTable).transactions.length, 7, 'individual offer rows do not reopen an excluded section')

for (const csv of [
  'Data;Descrição;Valor\n15/09/2026;LOJA C6 DEMO;25,90\n16/09/2026;MERCADO DEMO;112,40',
  'Date,Description,Amount\n2026-09-15,"LOJA, DEMO",25.90\n2026-09-16,MERCADO DEMO,112.40',
  'Data,Descrição,Valor\n15/09/2026,"LOJA ""DEMO""","25,90"\n16/09/2026,MERCADO DEMO,"112,40"',
  'Data\tDescrição\tValor\n15/09/2026\tLOJA DEMO\t25,90\n16/09/2026\tMERCADO DEMO\t112,40',
  '15/09/2026;LOJA DEMO;25,90\n16/09/2026;MERCADO DEMO;112,40',
]) {
  const parsed = parseInvoiceFromTextOrOCR(csv)
  assert.equal(parsed.document_type, 'CSV_EXTRATO')
  assert.equal(parsed.transactions.length, 2)
  assert.deepEqual(parsed.transactions.map(tx => tx.amount), [25.9, 112.4])
}
const invalidCsv = parseInvoiceFromTextOrOCR('Data;Descrição;Valor\nTexto;Entrada + 2x;638,95\n32/13/2026;Oferta;217,34')
assert.equal(invalidCsv.transactions.length, 0, 'invalid CSV dates cannot silently become a default transaction date')
console.log('PDF prose, offers, fragmented C6 rows and genuine CSV regressions passed')
