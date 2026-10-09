/** Synthetic, sanitized invoice text fixtures. No customer document content. */
export const C6_SANITIZED_INVOICE = `
C6 Bank
Vencimento: 10/10/2026
Total da fatura R$ 1.843,68

C6 Carbon Final 3774 - PORTADOR DEMO  Subtotal deste cartão R$ 336,76
15 mai SEGURO DEMO - Parcela 5/10 336,76
10 set Inclusão de Pagamento 1.949,41
29 set Estorno de tarifa - Estorno 98,00
29 set Anuidade Diferenciada - Parcela 9/12 98,00

Parcelamento de fatura
Entrada + 2x de R$ 638,95  R$ 1.916,85
CET do financiamento 64,05% a.a.
IOF do parcelamento 0,38%

C6 Carbon Virtual Final 9074 - PORTADOR DEMO  Subtotal deste cartão R$ 366,79
04 abr LOJA ONLINE DEMO - Parcela 6/12 197,00
26 abr INVESTIMENTO DEMO - Parcela 6/12 29,80
15 set TELECOM DEMO 139,99

Transações dos cartões adicionais
C6 Carbon Final 4317 - PORTADOR ADICIONAL  Subtotal deste cartão R$ 1.140,13
19 mai OFICINA DEMO - Parcela 5/5 500,00
17 set MERCADO DEMO 127,28
21 set DISTRIBUIDORA DEMO 249,39
28 set MERCADO DEMO CENTRO 263,46
`

export const GENERIC_BANK_FIXTURES: Record<string, string> = {
  caixa: `CAIXA Cartões\nVencimento 12/10/2026\n15/09 Mercado Exemplo 120,00\n16/09 Transporte Exemplo 30,00`,
  banco_do_brasil: `Ourocard Banco do Brasil\nVencimento 12/10/2026\n15/09 Restaurante Exemplo 82,00`,
  bradesco: `Bradesco Cartões\nVencimento 12/10/2026\n15/09 Farmácia Exemplo 46,00`,
  itau: `Itaú Cartões\nVencimento 12/10/2026\nPagamento mínimo R$ 100,00\n15/09 Assinatura Exemplo 25,00`,
  nubank: `Nubank\nVencimento 12/10/2026\n15/09 Aplicativo Exemplo 18,00`,
  inter: `Banco Inter\nVencimento 12/10/2026\n15/09 Loja Exemplo 50,00`,
  santander: `Santander\nVencimento 12/10/2026\n15/09 Padaria Exemplo 15,00`,
}

export const C6_JANUARY_ROLLOVER = `
C6 Bank
Vencimento: 10/01/2026
Total da fatura R$ 40,00
C6 Carbon Final 0001  Subtotal deste cartão R$ 40,00
28 dez Compra de dezembro 40,00
`
