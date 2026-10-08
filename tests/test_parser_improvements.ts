import fs from 'fs';
import { extractTextFromPdf } from '../services/pdfExtractor';
import { parseInvoiceFromTextOrOCR } from '../services/aiDocumentParser';

async function test() {
  const pdfPath = 'C:\\Users\\racle\\.gemini\\antigravity\\brain\\394e4dc3-b0c0-475b-87dc-f313abc32009\\.user_uploaded\\media_1791477533179_82c73b27.pdf';
  const buf = fs.readFileSync(pdfPath);
  const text = await extractTextFromPdf(buf);
  const res = parseInvoiceFromTextOrOCR(text);
  console.log('Result summary:', {
    institution: res.institution,
    period: res.period,
    total_amount: res.total_amount,
    transactions_count: res.transactions.length
  });

  const cats: Record<string, number> = {};
  for (const t of res.transactions) {
    cats[t.category] = (cats[t.category] || 0) + 1;
  }
  console.log('Category distribution:', cats);
}

test().catch(console.error);
