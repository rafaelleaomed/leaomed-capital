import assert from 'assert'
import { parseInvoiceFromTextOrOCR, parseInvoiceDate, parseCurrencyValue } from '../services/aiDocumentParser'

console.log('===============================================================')
console.log('🧪 TESTES DO MOTOR DE EXTRAÇÃO DE FATURAS E DOCUMENTOS')
console.log('===============================================================\n')

// 1. Teste de Conversão de Moeda Brasileira
console.log('1. Testando parseCurrencyValue...')
assert.strictEqual(parseCurrencyValue('336,76'), 336.76)
assert.strictEqual(parseCurrencyValue('R$ 1.250,50'), 1250.50)
assert.strictEqual(parseCurrencyValue('-150,00'), -150.00)
assert.strictEqual(parseCurrencyValue('(800,00)'), -800.00)
console.log('   ✓ Conversão de moeda validada com sucesso.\n')

// 2. Teste de Datas em Faturas Brasileiras
console.log('2. Testando parseInvoiceDate...')
assert.strictEqual(parseInvoiceDate('15 mai', 2026), '2026-05-15')
assert.strictEqual(parseInvoiceDate('15/05/2026'), '2026-05-15')
assert.strictEqual(parseInvoiceDate('15/05/26'), '2026-05-15')
assert.strictEqual(parseInvoiceDate('15/05', 2026), '2026-05-15')
assert.strictEqual(parseInvoiceDate('2026-05-15'), '2026-05-15')
console.log('   ✓ Conversão de múltiplos formatos de data validada.\n')

// 3. Teste de Fatura C6 Bank
console.log('3. Testando fatura C6 Bank...')
const sampleC6Text = `
C6 Carbon Black Mastercard
Valor da Fatura: R$ 1.326,76
15 mai  PORTO SEGURO CIA SEG G - Parcela 3/10   336,76
13 jul  ARAUJO LOJA                             39,97
23 jul  SUPERMERCADOS BH                        332,00
10 jul  Pagamento de fatura C6 Bank Cartão       800,00
`

const c6Result = parseInvoiceFromTextOrOCR(sampleC6Text)
assert.strictEqual(c6Result.transactions.length, 4, 'Deve extrair 4 transações do C6')
assert.strictEqual(c6Result.transactions[0].description, 'PORTO SEGURO CIA SEG G - Parcela 3/10')
assert.strictEqual(c6Result.transactions[0].amount, 336.76)
assert.strictEqual(c6Result.transactions[0].installment_current, 3)
assert.strictEqual(c6Result.transactions[0].installment_total, 10)
assert.strictEqual(c6Result.transactions[3].is_card_bill_payment, true, 'Pagamento de fatura deve ser detectado')
console.log('   ✓ Fatura C6 Bank com parcelas e pagamento de fatura validada.\n')

// 4. Teste de Fatura Nubank / Padrão com Barras e R$
console.log('4. Testando Fatura Nubank / Extrato com barras e R$...')
const sampleNuText = `
Nubank Ultravioleta
15/05/2026  Uber *Trip  R$ 25,90
18/05/2026  Drogaria Pacheco  R$ 112,40
20/05/2026  Posto Shell  R$ 250,00
`

const nuResult = parseInvoiceFromTextOrOCR(sampleNuText)
assert.strictEqual(nuResult.transactions.length, 3, 'Deve extrair 3 transações do Nubank')
assert.strictEqual(nuResult.transactions[0].amount, 25.90)
assert.strictEqual(nuResult.transactions[1].amount, 112.40)
assert.strictEqual(nuResult.transactions[2].amount, 250.00)
console.log('   ✓ Fatura Nubank com formato DD/MM/YYYY e R$ validada.\n')

// 5. Teste de Extrato CSV
console.log('5. Testando Extrato CSV...')
const sampleCsv = `Data;Estabelecimento;Valor;Categoria
15/05/2026;Supermercado BH;332,00;Casa
18/05/2026;Posto Ipiranga;150,00;Transporte
20/05/2026;Hospital Madre Teresa - Plantão;8500,00;Receita`

const csvResult = parseInvoiceFromTextOrOCR(sampleCsv)
assert.strictEqual(csvResult.transactions.length, 3, 'Deve extrair 3 transações do CSV')
assert.strictEqual(csvResult.transactions[0].amount, 332.00)
assert.strictEqual(csvResult.transactions[1].amount, 150.00)
assert.strictEqual(csvResult.transactions[2].amount, 8500.00)
console.log('   ✓ Extrato CSV delimitado por ponto-e-vírgula validado.\n')

// 6. Teste de Rejeição de Cabeçalhos Bancários e Ruídos de Boleto (Caso Real Itaú/Boleto)
console.log('6. Testando Rejeição de Metadados Bancários e Extração de Compras...')
const mixedInvoiceText = `
ITAU UNIBANCO HOLDING S.A. - CNPJ: 60.872.504/0001-23
P  , =K 7\`> 420 ITA U UNI BANC O HO LD I NG S.A. - 60.872 .504 /0001- 23   R$ 13,00
Autenticação Mecânica - Recibo do Pagador
 =b K Ln M N Og P Q  Q Rv S S T ... R$ 0,00
15/09 DROGARIA ARAUJO 45,90
18/09/2026 POSTO IPIRANGA R$ 150,00
25/09 PORTO SEGURO Parcela 03/10 336,76
`

const mixedResult = parseInvoiceFromTextOrOCR(mixedInvoiceText)
assert.strictEqual(mixedResult.transactions.length, 3, 'Deve extrair exatamente as 3 compras reais e ignorar os metadados de holding e valores zerados')
assert.strictEqual(mixedResult.transactions[0].description, 'DROGARIA ARAUJO')
assert.strictEqual(mixedResult.transactions[0].amount, 45.90)
assert.strictEqual(mixedResult.transactions[1].description, 'POSTO IPIRANGA')
assert.strictEqual(mixedResult.transactions[1].amount, 150.00)
assert.strictEqual(mixedResult.transactions[2].description, 'PORTO SEGURO Parcela 03/10')
assert.strictEqual(mixedResult.transactions[2].amount, 336.76)
assert.strictEqual(mixedResult.transactions[2].installment_current, 3)
assert.strictEqual(mixedResult.transactions[2].installment_total, 10)
console.log('   ✓ Metadados bancários ignorados com sucesso e compras legítimas extraídas com precisão.\n')

console.log('===============================================================')
console.log('🎉 TODOS OS TESTES DO MOTOR DE EXTRAÇÃO FORAM APROVADOS!')
console.log('===============================================================\n')
