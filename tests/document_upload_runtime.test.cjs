// Isolated route test: synthetic documents, no credentials or database writes.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const XLSX = require('xlsx')
const root = path.resolve(__dirname, '..')
const originalLoad = Module._load
let authenticated = true

Module._load = function (request, parent, isMain) {
  if (request === '@/utils/auth-helpers') {
    return { getAuthenticatedUserId: async () => ({
      userId: authenticated ? 'synthetic-test-user' : null,
      user: authenticated ? { id: 'synthetic-test-user', email: 'synthetic@example.test' } : null,
      errorResponse: authenticated ? null : Response.json({ success: false }, { status: 401 }),
    }) }
  }
  return originalLoad.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, isMain)
}
require.extensions['.ts'] = function (module, file) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  })
  module._compile(outputText, file)
}

function syntheticPdf() {
  const stream = 'BT /F1 12 Tf 50 750 Td (Nubank) Tj 0 -20 Td (15/05/2026 Uber Trip 25,90) Tj 0 -20 Td (18/05/2026 Drogaria Teste 112,40) Tj ET'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n` })
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return Buffer.from(pdf)
}

async function main() {
  const { POST } = require('../app/api/parse-document/route.ts')
  assert.equal(Object.keys(require.cache).some(file => file.includes('pdf-parse')), false, 'Loading the route must not initialize PDF.js')
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['Data', 'Estabelecimento', 'Valor'],
    ['15/05/2026', 'Uber Trip', '25,90'],
    ['18/05/2026', 'Drogaria Teste', '112,40'],
  ]), 'Extrato')
  for (const format of ['xlsx', 'xls', 'pdf']) {
    const form = new FormData()
    const buffer = format === 'pdf' ? syntheticPdf() : XLSX.write(workbook, { type: 'buffer', bookType: format === 'xls' ? 'biff8' : 'xlsx' })
    form.append('files', new File([buffer], `synthetic.${format}`, { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' }))
    const response = await POST(new Request('http://localhost/api/parse-document', { method: 'POST', body: form }))
    const body = await response.json()
    assert.equal(response.status, 200, JSON.stringify(body))
    assert.equal(body.totalTransactions, 2)
    assert.deepEqual(body.batches[0].transactions.map(t => t.val), [25.9, 112.4])
    if (format !== 'pdf') assert.equal(Object.keys(require.cache).some(file => file.includes('pdf-parse')), false, 'Excel must work independently of PDF.js')
    console.log(`${format}: 200, two transactions with correct amounts`)
  }
  authenticated = false
  const response = await POST(new Request('http://localhost/api/parse-document', { method: 'POST', body: '{}' }))
  assert.equal(response.status, 401)
  console.log('Unauthenticated upload remains rejected (401)')
  require('../tests/document_parser.test.ts')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
