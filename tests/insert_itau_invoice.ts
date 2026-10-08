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

  console.log('Total transactions extracted:', res.transactions.length);
  const userId = '54d97c2c-c722-46bc-8f82-409c12593eef';
  const itauAccountId = '6ca6298c-0421-5392-b47f-4b096aced3c5';

  const sqlStatements: string[] = [];

  for (let i = 0; i < res.transactions.length; i++) {
    const t = res.transactions[i];
    const rawId = `itau_inv_${t.date}_${i + 1}`;
    const amount = -Math.abs(t.amount); // Despesa é negativa
    const hash = generateHash(t.date, amount, t.description, itauAccountId);
    const safeDesc = t.description.replace(/'/g, "''");
    const safeCat = t.category.replace(/'/g, "''");
    const safeSub = (t.subcategory || 'Geral').replace(/'/g, "''");
    const isFixed = Boolean(t.is_fixed);
    const isIgnored = Boolean(t.is_card_bill_payment);

    sqlStatements.push(`
      INSERT INTO public.transactions (
        user_id, raw_id, account_id, amount, date, competence_date,
        description, category, subcategory, is_fixed, is_ignored, hash
      ) VALUES (
        '${userId}', '${rawId}', '${itauAccountId}', ${amount}, '${t.date}', '${t.date}',
        '${safeDesc}', '${safeCat}', '${safeSub}', ${isFixed}, ${isIgnored}, '${hash}'
      )
      ON CONFLICT (hash) DO UPDATE SET
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        is_fixed = EXCLUDED.is_fixed,
        is_ignored = EXCLUDED.is_ignored;
    `);
  }

  fs.writeFileSync('tests/insert_statements.sql', sqlStatements.join('\n'));
  console.log('Generated tests/insert_statements.sql with', sqlStatements.length, 'statements.');
}

main().catch(console.error);
