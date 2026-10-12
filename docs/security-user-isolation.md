# Revisão de isolamento financeiro por usuário

## 1. Riscos críticos

O navegador deve receber exclusivamente dados do usuário autenticado. Dados financeiros padrão, caches locais compartilhados e migração automática de caches sem proprietário permitem cruzamento de informações, mesmo quando o endpoint SQL filtra `user_id`. O servidor e o armazenamento local precisam validar o proprietário independentemente.

O worker Pluggy reutilizava o ID de uma conta em conflito externo sem verificar seu proprietário. `tools/sync_worker.py` agora limita o upsert ao mesmo usuário e item externo e interrompe o processamento antes de buscar transações se a conta pertencer a outro usuário. Os erros não registram a mensagem da exceção ou o nome da conta.

## 2. Riscos médios

`utils/db.ts` executa consultas diretas ao Neon com `DATABASE_URL`; não propaga JWT ou `auth.uid()`. A existência de políticas em `database/04_security_rls_and_investments.sql` não comprova que estejam instaladas no banco atual nem que o papel de conexão seja sujeito a elas. Toda consulta direta deve continuar filtrando o usuário da sessão no servidor. Não habilitar `FORCE ROW LEVEL SECURITY` indiscriminadamente: sem identidade propagada, isso pode bloquear todas as consultas atuais.

O esquema Supabase original referencia `auth.users`; o migrador Neon referencia `public.users`. Uma migração de autorização exige confirmar qual banco e papel estão ativos, sem divulgar a URL de conexão.

O vínculo original `transactions.account_id -> accounts.id` não garante igualdade de `user_id`. A migração opcional `database/06_account_user_integrity.sql` acrescenta FK composta `(account_id, user_id)` com `NOT VALID`, sem modificar registros históricos. Mesmo com `NOT VALID`, novas gravações ficam sujeitas à restrição; aplicar somente após corrigir os produtores de dados e revisar a contagem de vínculos inconsistentes.

## 3. Recomendações

Aplicar primeiro o código revisado, confirmar deploy e testar duas contas sintéticas em navegadores distintos e no mesmo navegador. Uma conta vazia deve exibir dados vazios; entrar, sair, trocar conta e abrir `/demo` não devem transportar parcelamentos, cartões, investimentos, regras ou documentos.

Um operador autorizado deve conferir políticas e privilégios efetivos do banco e obter somente a contagem de inconsistências indicada na migração. Corrigir vínculos históricos exige verificar a origem dos dados; nunca transferir linhas automaticamente para o usuário atual. Validar a FK em uma janela de manutenção após tratar as inconsistências.

Os históricos pessoais em `utils/pfMobillsTransactionsHistory.ts` e `utils/pjTransactionsHistory.ts` foram esvaziados, assim como os padrões pessoais de parcelamentos, cartões, carteira e projeções. Evitar reintroduzi-los em módulos cliente ou demonstrações. Caches antigos sem proprietário ficam preservados localmente, mas não são lidos nem atribuídos automaticamente. Recuperá-los exige identificar o proprietário com segurança.

O webhook Pluggy agora exige `Authorization: Bearer` e a variável server-side `PLUGGY_WEBHOOK_SECRET`. Quando a integração está habilitada e esse segredo não está configurado, retorna 503 e não enfileira eventos. Configurar o mesmo header no provedor antes de habilitar o webhook. A integração segue a [documentação oficial de webhooks](https://v2.docs.pluggy.ai/en/docs/developer-tools/webhooks-ref).

A sessão é validada no servidor com `getUser()` e novamente antes de montar o conteúdo financeiro no navegador, conforme a [orientação oficial do Supabase](https://supabase.com/docs/guides/auth/server-side/creating-a-client). Falhas de autenticação bloqueiam acesso; respostas privadas usam `Cache-Control: private, no-store`. Trocar a sessão desmonta a tela e descarta respostas antigas por geração do escopo.

## 4. Arquivos afetados

- `tools/sync_worker.py`: helper `upsert_owned_account`, processamento de contas e mensagens de erro.
- `database/06_account_user_integrity.sql`: índice composto, FK e consulta de contagem para revisão.
- `tests/sync_worker_isolation_test.py`: regressão com proprietário igual, conflito e retorno de proprietário estrangeiro.
- `utils/db.ts` e `database/04_security_rls_and_investments.sql`: fronteira entre SQL direto e políticas baseadas em JWT, revisados sem alterar o banco real.

## 5. Correção e validação

O upsert usa `WHERE accounts.user_id = EXCLUDED.user_id AND accounts.pluggy_item_id = EXCLUDED.pluggy_item_id` e verifica o proprietário retornado. O teste sintético extrai somente esse helper via AST: não importa o worker, não carrega `.env`, não lê credenciais e não conecta a serviços.

Executar `python tests/sync_worker_isolation_test.py`. O teste verifica o fluxo e a recusa de proprietários diferentes com um cursor simulado. As políticas, privilégios e restrições em produção não foram executados nem verificados por este teste.
