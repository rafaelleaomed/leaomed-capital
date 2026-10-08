import fs from 'fs';
import { extractTextFromPdf } from '../services/pdfExtractor';
import { parseInvoiceFromTextOrOCR } from '../services/aiDocumentParser';

async function main() {
  const pdfPath = 'C:\\Users\\racle\\.gemini\\antigravity\\brain\\394e4dc3-b0c0-475b-87dc-f313abc32009\\.user_uploaded\\media_1791477533179_82c73b27.pdf';
  if (!fs.existsSync(pdfPath)) {
    console.error('File not found:', pdfPath);
    return;
  }
  const buf = fs.readFileSync(pdfPath);
  console.log('Buffer size:', buf.length);
  const text = await extractTextFromPdf(buf);
  console.log('Extracted text length:', text.length);
  console.log('First 500 chars:', text.slice(0, 500));
  const res = parseInvoiceFromTextOrOCR(text);
  console.log('Result:', {
    institution: res.institution,
    period: res.period,
    total_amount: res.total_amount,
    transactions_count: res.transactions.length
  });
  if (res.transactions.length > 0) {
    console.log('First 5 transactions:', res.transactions.slice(0, 5));
    console.log('Last 5 transactions:', res.transactions.slice(-5));
  }
}

main().catch(err => {
  console.error('Error running test:', err);
});
