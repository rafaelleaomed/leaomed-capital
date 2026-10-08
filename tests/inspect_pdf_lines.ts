import fs from 'fs';
import { extractTextFromPdf } from '../services/pdfExtractor';

async function main() {
  const pdfPath = 'C:\\Users\\racle\\.gemini\\antigravity\\brain\\394e4dc3-b0c0-475b-87dc-f313abc32009\\.user_uploaded\\media_1791477533179_82c73b27.pdf';
  const buf = fs.readFileSync(pdfPath);
  const text = await extractTextFromPdf(buf);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  console.log('Total extracted lines:', lines.length);
  for (let i = 0; i < lines.length; i++) {
    console.log(`[${i}] ${lines[i]}`);
  }
}

main().catch(console.error);
