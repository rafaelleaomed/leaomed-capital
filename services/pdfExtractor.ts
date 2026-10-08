/**
 * Serviço de extração de texto de PDFs financeiros.
 * Processa buffers de faturas e extratos bancários de forma robusta e limpa.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const pdfModule = await import('pdf-parse');
    
    // Suporte para pdf-parse v2 (orientado a objetos com PDFParse class)
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const textResult = await parser.getText();
      await parser.destroy().catch(() => {});
      
      if (typeof textResult === 'string') {
        return textResult;
      }
      if (textResult && typeof (textResult as any).text === 'string') {
        return (textResult as any).text;
      }
    }

    // Suporte para pdf-parse v1 (função direta)
    if (typeof pdfModule === 'function') {
      const data = await (pdfModule as any)(buffer);
      return data?.text || '';
    }

    if (typeof (pdfModule as any).default === 'function') {
      const data = await (pdfModule as any).default(buffer);
      return data?.text || '';
    }

    return '';
  } catch (err: any) {
    console.warn('Aviso: falha na extração direta do PDF via pdf-parse:', err?.message || err);
    return '';
  }
}
