import fs from 'fs';
import { extractTextFromPdf } from '../services/pdfExtractor';
import { parseCurrencyValue, parseInvoiceDate } from '../services/aiDocumentParser';

async function simulate() {
  const pdfPath = 'C:\\Users\\racle\\.gemini\\antigravity\\brain\\394e4dc3-b0c0-475b-87dc-f313abc32009\\.user_uploaded\\media_1791477533179_82c73b27.pdf';
  const buf = fs.readFileSync(pdfPath);
  const text = await extractTextFromPdf(buf);
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let currentCard = 'Itaú Personnalité Mastercard Black';
  let detectedPeriod = '';
  let inFutureInstallments = false;
  const transactions: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/compras parceladas\s*-\s*pr[oó]ximas faturas/i.test(line)) {
      inFutureInstallments = true;
      continue;
    }
    if (inFutureInstallments) {
      if (/limites de cr[eé]dito|encargos cobrados|autentica/i.test(line)) {
        inFutureInstallments = false;
      } else {
        continue;
      }
    }

    if (/total desta fatura/i.test(line)) {
      const m = line.match(/(?:r\$\s*)?([0-9\.\,]+)$/i);
      if (m) console.log('Total desta fatura matched:', m[1]);
      continue;
    }

    if (/vencimento:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i.test(line)) {
      const m = line.match(/vencimento:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (m && !detectedPeriod) {
        const [d, mo, yr] = m[1].split('/');
        detectedPeriod = `${yr}-${mo}`;
      }
    }

    // Skip summary lines
    if (/^(total\s+|resumo\s+|saldo\s+|previs[aã]o\s+|comprovante|demonstrativo|ficha de|sacador|autentica)/i.test(line)) {
      continue;
    }

    // Match payment line
    if (/pagamento efetuado|12\/09\s+pagamento/i.test(line)) {
      console.log('Skipping previous bill payment line:', line);
      continue;
    }

    // Match regular expense line: Date DD/MM Description Value
    const valMatch = line.match(/(?:r\$\s*)?(-?\s*\d{1,3}(?:\.\d{3})*,\d{2}|-?\s*\d+,\d{2})$/i);
    const dateMatch = line.match(/^(\d{1,2}[\/\.-]\d{1,2}(?:[\/\.-]\d{2,4})?)/);

    if (valMatch && dateMatch) {
      const rawVal = parseCurrencyValue(valMatch[0]);
      if (rawVal !== 0) {
        const desc = line.replace(dateMatch[0], '').replace(valMatch[0], '').trim();
        if (desc.length >= 2) {
          transactions.push({
            date: dateMatch[0],
            desc,
            val: Math.abs(rawVal)
          });
        }
      }
    }
  }

  console.log('Total extracted:', transactions.length);
  const sum = transactions.reduce((acc, t) => acc + t.val, 0);
  console.log('Sum of transactions:', sum.toFixed(2));
}

simulate().catch(console.error);
