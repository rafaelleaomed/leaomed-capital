# Validação da reforma visual

Validação realizada em 08/10/2026 com Chrome headless, React real do projeto e um harness local isolado em `scratch/layout-qa`. O harness não faz parte do app, usa fixture sintética e os dados demonstrativos já presentes nos componentes, substitui `fetch` por respostas locais e bloqueia rede externa. A autenticação da rota `/dashboard` não foi alterada nem contornada.

## Resultado

- Início: 360, 390, 430, 1280 e 1440 px, temas claro e escuro. Dez casos sem erros de página e sem rolagem lateral.
- Auditoria, orçamento/cartões, investimentos, parcelamentos, importação e histórico: sessenta verificações de largura/tema. Foram detectados estouros nas abas de investimentos em 360 px e no cabeçalho de parcelamentos em 360/390 px. Após correção, doze verificações dos dois módulos em 360/390/430 px nos dois temas passaram, sem elementos fora da largura.
- Menu “Mais”: abertura, Escape e devolução de foco ao botão confirmados.
- Conta, novo lançamento, upload e busca: diálogo modal aberto, foco inicial dentro, foco ainda dentro após dez Tab e fechamento por Escape confirmados. Estes testes não enviaram formulários.
- Rosca: Enter na fatia Moradia abre `#auditoria`, categoria Moradia e período `2026-10`. “Auditar tudo” limpa a categoria mantendo o período.
- Tema claro sem preferência foi confirmado. As capturas separadas confirmam aplicação da preferência salva clara/escura.

## Preservação dos simuladores

O bundle anterior foi compilado a partir de `git show HEAD:<arquivo>`; o atual usa os arquivos de trabalho. Ambos usam os mesmos dados demonstrativos locais, sem consulta a contas reais.

- Aporte de R$ 2.000,00: Internacional R$ 1.409,97; Real Estate R$ 333,85; Cripto R$ 256,17. Todos os valores monetários renderizados pelo simulador são idênticos antes/depois.
- Custo fixo R$ 2.000,00 e dez meses: meta R$ 20.000,00; reserva demonstrativa R$ 33.500,00; meta atingida. As opções de seis/oito/dez/doze meses e os valores de alocação também são idênticos.
- A comparação AST das instruções anteriores ao retorno JSX de `InvestmentRebalance` confirmou lógica idêntica, ignorando comentários. A revisão adicional dos contratos está registrada em `layout-preservation-review.md`.

## Evidência visual e adaptações

Capturas anteriores e da prévia: `scratch/layout-qa/baseline/captures/`; capturas atuais: `scratch/layout-qa/final/captures/`. Resultados: `baseline/results.json`, `baseline/interactions.json`, `final/results.json`, `final/interactions.json` e `final/recheck.json`, sob a mesma pasta. O recheck substitui os resultados de largura dos dois módulos corrigidos na primeira matriz.

Foram inspecionadas visualmente as capturas do início móvel claro, desktop claro, prévia móvel e parcelamentos. As capturas representativas finais de 390/1440 px foram feitas com foco removido e página no topo. Capturas de testes de teclado e diálogos registram o estado de interação deliberadamente.

Diferenças intencionais: rosca clicável preservada no lugar da lista única da prévia; comparação de receitas/despesas mantida ao lado; orçamento, parcelas, filtros e simuladores completos mantidos; navegação móvel com “Mais” para alcançar as sete abas. Dados e números da prévia não foram importados. O layout anterior tinha estouro em 1280 px no harness equivalente; o novo início não apresenta esse problema.

## Limites

Esta evidência valida renderização e interação de componentes com dados locais. Não valida sessão real, persistência no banco, importação/OCR real, integrações bancárias ou envio dos formulários. Leitor de tela e navegação por toque em dispositivo físico não foram testados. Não foi declarada conformidade WCAG completa nem realizado teste abrangente de contraste de todos os estados. O atalho anual foi acionado no navegador e também revisado estaticamente; o conteúdo financeiro anual depende da integração real. Build, TypeScript e `git diff --check` foram executados pelo agente coordenador.
