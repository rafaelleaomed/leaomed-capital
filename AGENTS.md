# LeaoMed Capital — Contexto para agentes

**Projeto:** LeaoMed Capital (pasta: "Projeto Plataforma Financeira")
**Status:** Repositório privado com demo sintética, uso pessoal
**Dono:** Rafael Leão (rafaelleaomed)

## Finalidade
Plataforma pessoal de inteligência financeira e consolidação patrimonial PF/PJ. OCR de prints do Mobills, categorização, projeção de fluxo de caixa. Futuro SaaS é possibilidade, não compromisso.

## Stack
Next.js · TypeScript · Neon/Postgres · Supabase Auth · Vercel (deploy)

## Estrutura principal
- `app/` — rotas Next.js (App Router)
- `Novo layout/` — protótipo alternativo (Vite)
- `assets/` — screenshots e materiais visuais
- `contexto/` — notas e decisões

## Skills disponíveis neste projeto
- `supabase`, `supabase-postgres-best-practices` — auth e banco
- `neon`, `neon-postgres` — Postgres Neon
- `better-auth-best-practices` — autenticação
- `insta` (Projeto Plataforma Financeira:insta) — infraestrutura InstaCloud

## Regras importantes
- Dados financeiros pessoais são sensíveis: LGPD
- Screenshots na raiz (Screenshot_1.jpg a 15) devem ser movidos para `assets/screenshots/` quando reorganizar
- Repositório privado: manter assim

## Links
- Demo: https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app/demo

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
