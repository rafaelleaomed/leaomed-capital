import fs from 'fs';
import crypto from 'crypto';
import { extractTextFromPdf } from '../services/pdfExtractor';
import { parseInvoiceFromTextOrOCR } from '../services/aiDocumentParser';

function generateHash(date: string, amount: number, desc: string, accountId: string): string {
  const normDesc = desc.trim().toLowerCase().replace(/\s+/g, ' ');
  const raw = `${date}|${Number(amount).toFixed(2)}|${normDesc}|${accountId}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function main() {
  const pdfPath = 'C:\\Users\\racle\\.gemini\\antigravity\\brain\\394e4dc3-b0c0-475b-87dc-f313abc32009\\.user_uploaded\\media_1791477533179_82c73b27.pdf';
  const buf = fs.readFileSync(pdfPath);
  const text = await extractTextFromPdf(buf);
  const res = parseInvoiceFromTextOrOCR(text);

  console.log('Total transactions:', res.transactions.length);
  const userId = '54d97c2c-c722-46bc-8f82-409c12593eef';
  const itauAccountId = '6ca6298c-0421-5392-b47f-4b096aced3c5';

  const rows: string[] = [];

  for (let i = 0; i < res.transactions.length; i++) {
    const t = res.transactions[i];
    // Para a fatura de vencimento 13/10/2026, atribuir a data do mês de competência (2026-10)
    // Extrai o dia original do lançamento (ex: '2026-09-05' -> '05')
    const day = t.date.split('-')[2] || '01';
    const txDate = `2026-10-${day.padStart(2, '0')}`;
    const rawId = `itau_inv_202610_${i + 1}`;
    
    // Se for Google One crédito (-10,83)
    const isCredit = t.description.toLowerCase().includes('google one') && t.amount === 10.83 && i === 0;
    const amount = isCredit ? 10.83 : -Math.abs(t.amount);
    
    const hash = generateHash(txDate, amount, t.description, itauAccountId);
    const safeDesc = t.description.replace(/'/g, "''");
    const safeCat = t.category.replace(/'/g, "''");
    const safeSub = (t.subcategory || 'Geral').replace(/'/g, "''");
    const isFixed = Boolean(t.is_fixed);
    const isIgnored = Boolean(t.is_card_bill_payment);

    rows.push(`(
      '${userId}', '${rawId}', '${itauAccountId}', ${amount}, '${txDate}', '2026-10-13',
      '${safeDesc}', '${safeCat}', '${safeSub}', ${isFixed}, ${isIgnored}, '${hash}'
    )`);
  }

  const fullSql = `
    INSERT INTO public.transactions (
      user_id, raw_id, account_id, amount, date, competence_date,
      description, category, subcategory, is_fixed, is_ignored, hash
    ) VALUES 
    ${rows.join(',\n')}
    ON CONFLICT (hash) DO UPDATE SET
      category = EXCLUDED.category,
      subcategory = EXCLUDED.subcategory,
      is_fixed = EXCLUDED.is_fixed,
      is_ignored = EXCLUDED.is_ignored;
  `;

  fs.writeFileSync('tests/bulk_insert_october.sql', fullSql);
  console.log('Successfully written tests/bulk_insert_october.sql with', rows.length, 'values.');
}

main().catch(console.error);
