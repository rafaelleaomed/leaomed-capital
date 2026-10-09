# Correção de importação — 9 de outubro de 2026

Os logs de produção de `/api/parse-document` confirmaram `ReferenceError: DOMMatrix is not defined`, precedido de `Cannot find module '@napi-rs/canvas'`. A falha ocorria ao avaliar o módulo, antes da autenticação e do tratamento de erros. Por isso bloqueava também arquivos Excel e texto.

## Correção

- Externalizar `pdf-parse`, `pdfjs-dist` e `@napi-rs/canvas` no build Next.js, conforme a orientação do mantenedor de pdf-parse.
- Declarar canvas como dependência direta para incluir o módulo nativo no artefato da função.
- Carregar o worker/canvas antes do parser, apenas quando um PDF for processado. Usar o worker embutido, sem download ou dependência de caminho externo.
- Limpar o temporizador de leitura após o processamento.

Não foram alterados autenticação, classificação, valores ou persistência de transações.

## Validação

`node tests/document_upload_runtime.test.cjs` testa o handler real com autenticação simulada somente dentro do processo de teste, sem acesso a banco ou credenciais. PDF, XLSX e XLS sintéticos retornaram 200 com dois lançamentos e valores 25,90 e 112,40. Excel não inicializa PDF.js. Requisição sem autenticação retorna 401. A suíte existente de interpretação de documentos também passou.

`npx tsc --noEmit`, `npm run build` e `git diff --check` passaram. O manifesto de arquivos do endpoint inclui canvas, seu binário nativo e pdf-parse. Os arquivos financeiros enviados pelo usuário não foram acessados; a confirmação dos documentos específicos dependerá de uma nova tentativa no aplicativo.

Referência técnica: https://github.com/mehmet-kozan/pdf-parse/blob/main/docs/troubleshooting.md
