# Revisão de preservação funcional do layout

Revisão estática feita com a skill `agency-code-reviewer`, comparando a árvore de trabalho com `HEAD`. O escopo é a apresentação do app autenticado, a navegação e a passagem opcional da categoria para a auditoria.

## Evidência de preservação

- Nenhum arquivo de `app/api`, `utils`, `context` ou migrações entrou no diff revisado. Autenticação, consultas financeiras, taxonomia, armazenamento de dados e contratos de API mantiveram suas implementações.
- A comparação pelo parser TypeScript, removendo comentários e atributos JSX `className`/`style`, encontrou identidade estrutural em orçamento, consolidado anual, gastos diários, histórico, vínculo de investimentos, onboarding e cabeçalho de usuário. Alterações adicionais em modais são de acessibilidade: rótulos e o contêiner `AccessibleDialog`; não mudam operações de salvar/importar.
- Os inicializadores das variáveis `emergencyReserve`, `categoryGroups`, `contributionAmount`, `totalDeficit`, `proportionalContributions`, `targetReserve`, `progressPct`, `shortfall` e `monthsCovered` foram comparados individualmente pelo parser TypeScript e permanecem idênticos.
- Reserva: a meta continua sendo custo fixo multiplicado pelos meses escolhidos; falta e cobertura seguem as expressões existentes. Aportes: a divisão continua proporcional ao déficit e usa as metas percentuais quando não existe déficit. Entradas, limites existentes e controles dos dois simuladores permanecem no componente.
- O cálculo do alívio continua usando o período selecionado, os contratos existentes e o escopo original. A rosca conserva a composição de até sete categorias e o mesmo total exibido; o título central esclarece esse limite.

## Exceções intencionais e navegação

- Valores fixos demonstrativos da camada PJ foram removidos da apresentação. Fora do escopo PJ, o card oferece acesso ao escopo correto; não calcula nem busca um novo total.
- A ação de consolidado anual passou a abrir o `AnnualConsolidatedView` já existente. Sua implementação financeira não mudou.
- `initialCategory` é uma propriedade opcional da auditoria. O valor recebido passa por `normalizeCategoryName`, o mesmo mecanismo das transações; a subdivisão é reiniciada. Abrir a auditoria sem categoria pela navegação limpa essa seleção, inclusive em “Auditar tudo”.
- O resolvedor estrito do dashboard ignora hashes desconhecidos, incluindo o alvo do link “Ir para o conteúdo”. O resolvedor de indicação visual conserva o fallback do início. Aliases antigos e atalhos para reserva/consolidado são mantidos.
- Fatias e legenda da rosca recebem interação de teclado. Valores monetários do início, gráficos e alívio usam o modo privacidade, inclusive rótulos acessíveis.

## Verificações e limites

- As quatro questões identificadas na primeira revisão foram corrigidas: categoria sem normalização, branco sobre fundo claro na auditoria, hash do link de salto trocando módulo e filtro anterior em “Auditar tudo”. As ocorrências restantes de `text-white` nos módulos revisados estão associadas a botões de fundo vermelho.
- Assertions locais passaram para os sete módulos, aliases de reserva/consolidado/lançamentos, hash desconhecido e categorias antigas. Não efetuaram requisições externas nem gravação em storage.
- `npx tsc --noEmit` passou nesta revisão.
- Evidência estática de fórmulas idênticas não equivale a testes com contas reais. Persistência, autenticação, upload real, conferência de documentos e comportamento com leitor de tela dependem de validação integrada autorizada. Esta revisão não acessou nem alterou dados reais.
- Inconsistências financeiras anteriores, inclusive a composição truncada do gráfico e fórmulas existentes com metas/entradas extremas, não foram corrigidas pela reforma visual. Não houve alteração de limites ou regra financeira.
