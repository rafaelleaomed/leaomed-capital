import { USER_TAXONOMY } from '@/utils/taxonomy';

export interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string;
  is_fixed: boolean;
  installment_current?: number;
  installment_total?: number;
}

export interface DocumentParseResult {
  document_type: 'C6_FATURA_PDF' | 'MOBILLS_PRINT' | 'INVESTIDOR10_PRINT' | 'OUTRO';
  period: string; // 'YYYY-MM'
  total_amount: number;
  transactions: ExtractedTransaction[];
  raw_summary?: Record<string, number>;
}

/**
 * Prompt de sistema com a taxonomia personalizada do usuário.
 */
export function buildDocumentParserPrompt(): string {
  const taxonomySummary = USER_TAXONOMY.map(c => 
    `- ${c.name} (${c.scope}): [${c.subcategories.map(s => s.name).join(', ')}]`
  ).join('\n');

  return `Você é um especialista em conciliação contábil e financeira pessoal/PJ.
Sua missão é extrair transações financeiras de documentos (faturas em PDF do C6 Bank Carbon Black ou prints de telas do app Mobills e Investidor10).

TAXONOMIA OFICIAL OBRIGATÓRIA DO USUÁRIO:
${taxonomySummary}

REGRAS RÍGIDAS DE EXTRAÇÃO:
1. Mapeie cada lançamento estritamente para uma Categoria e Subcategoria da lista acima.
2. Identifique compras parceladas no formato "X/Y" ou "Parcela X de Y" (ex: "S26Ultra 04/10", "T-Cross 06/36", "Lava e Seca 03/10").
3. Para Faturas de Cartão (C6 Carbon Black):
   - Cada linha de compra deve ser um item de despesa (valor positivo para saídas no JSON).
   - Ignorar "Pagamento de fatura anterior" ou lançamentos de crédito/estorno (ou sinalizar adequadamente).
4. Para Prints do Mobills:
   - Extraia o valor total do cabeçalho/donut.
   - Extraia a lista de categorias e seus respectivos valores em Reais (R$).
5. Extraia o mês de referência no formato "YYYY-MM" (ex: "Junho 2026" -> "2026-06").

RETORNE APENAS JSON VÁLIDO no seguinte formato:
{
  "document_type": "C6_FATURA_PDF" | "MOBILLS_PRINT" | "INVESTIDOR10_PRINT" | "OUTRO",
  "period": "YYYY-MM",
  "total_amount": 0.00,
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": 0.00,
      "category": "string",
      "subcategory": "string",
      "is_fixed": boolean,
      "installment_current": number | null,
      "installment_total": number | null
    }
  ],
  "raw_summary": {
    "Categoria": 0.00
  }
}`;
}
