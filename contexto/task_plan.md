# B.L.A.S.T. Task Plan

## Fase 1: Blueprint (Visão & Lógica)
- [x] Extrair 5 Perguntas de Descoberta (North Star, Integrações, Source of Truth, Payload, Regras).
- [x] Definir Data Schemas JSON em `gemini.md`.
- [x] Documentar Regras e Invariáveis em `gemini.md`.
- [x] Aprovação do Blueprint pelo usuário.

## Fase 2: Link (Conectividade)
- [x] Configurar chaves no `.env` (Pluggy/Belvo para Open Finance, chaves do PostgreSQL local/remoto).
- [x] Criar script determinístico mínimo em `tools/` para testar autenticação nas APIs bancárias (Handshake).
- [x] Testar conexão com o banco de dados PostgreSQL.

## Fase 3: Architect (A Construção em 3 Camadas)
- [x] Escrever SOPs técnicos em `architecture/` para: Ingestão de Transações, Categorização, Projeção de Fluxo de Caixa.
- [x] Desenvolver ferramentas de processamento em `tools/` (Python):
  - [x] Extrator de transações (Open Finance).
  - [x] Motor de categorização e deduplicação.
  - [x] Gerador do "Delivery Payload".
- [x] Integrar lógica de persistência no PostgreSQL usando `.tmp/` como stage intermediário.

## Fase 4: Stylize (Refinamento & UI)
- [x] Modelar a entrega dos dados em JSON pronto para consumo (`financialEngine` -> `dashboardData`).
- [x] Desenvolver estrutura de Frontend (Web App Mobile-Ready) para consumir o "Delivery Payload" gerado.
- [ ] Configurar IA para ler o payload e formular relatórios consultivos.
- [ ] Validar UI/UX e output com o usuário.

## Fase 5: Trigger (Implantação e Automação)
- [ ] Configurar rotina automatizada (Cron/Webhook) para sincronização diária.
- [ ] Subir para ambiente de Produção/Cloud.
- [ ] Atualizar Maintenance Log em `gemini.md`.
