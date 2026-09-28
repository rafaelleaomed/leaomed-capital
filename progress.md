# Progress

## Fase 1: Blueprint
- Esquemas de dados definidos e salvos em `gemini.md`.
- Regras de negócio e comportamento da IA estabelecidos.
- Arquitetura A.N.T e pastas definidas.

## Fase 2: Link
- Configuração das variáveis de ambiente (`.env`).
- Criação e execução do `tools/handshake.py`.
- Integração Supabase via pacote Python `supabase` OK.
- Autenticação Pluggy via `requests` OK.
- Setup inicial do frontend (Next.js) em `package.json` criado e dependências instaladas.
- Criados os endpoints Iniciais: `app/api/connect-token/route.ts` e `app/api/webhooks/pluggy/route.ts`.
- Componente frontend `app/components/OpenFinanceConnect.tsx` montado.

## Fase 3: Architect
- **Banco de Dados (Supabase):** Tabelas `webhook_events`, `accounts`, `transactions` estruturadas e migração `01_initial_schema.sql` executada via CLI (`tools/migrate.py`).
- **SOPs de Arquitetura (Layer 1):**
  - `ingestion_sop.md`: Criado com regras de Hash único, Sinais de valores e Normalização.
  - `categorization_sop.md`: Criado com matriz de Categorias e detecção de Recorrência.
- **Ferramentas e Webhooks (Layer 3):**
  - Webhook configurado para gravar na tabela `webhook_events` garantindo idempotência e restrição de timeout (5s).
  - Script determinístico Python (`tools/sync_worker.py`) construído para processar os webhooks assincronamente (fila).
  - Frontend atualizado (`OpenFinanceConnect.tsx`) para injetar corretamente o `supabase.auth.user.id` no token da Pluggy.

**Status atual:** Fase 3 Completa! Banco populado estruturalmente, Webhooks isolados em fila e Worker autônomo preparado para Sync de transações. Prontos para a Fase 4 (Stylize / Frontend Flow).
