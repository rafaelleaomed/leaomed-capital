# Graph Report - leaomed-capital  (2026-10-27)

## Corpus Check
- 197 files · ~143,613 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 12 file(s) not represented in the graph (top: (none) 6, .css 4, .example 1)

## Summary
- 1064 nodes · 2397 edges · 68 communities (55 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20e3b40a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- aiDocumentParser.ts
- InstallmentsProjection.tsx
- api_user_isolation.test.cjs
- psycopg2
- financialCategorizationService.ts
- getAuthenticatedUserId
- bankCsvParsers.ts
- client-financial-isolation.test.cjs
- financial_security_validation.test.ts
- next
- dashboardData.ts
- getFinancialScopeVersion
- DashboardUI.tsx
- BudgetBreakdown.tsx
- recovery/route.ts
- userJevAccess.ts
- dashboardData.ts
- react
- ✨ Funcionalidades Principais do App
- dependencies
- getFinancialUserScope
- package.json
- MobillsAnalytics.tsx
- compilerOptions
- auth-helpers.ts
- cn
- postgres
- manifest.json
- sync_worker_isolation_test.py
- Revisão de preservação funcional do layout
- userScopedStorage.ts
- AppleMobileTabBar.tsx
- app/layout.tsx
- split_batches.ts
- parse/route.ts
- vercel.json
- typescript
- scripts
- class-variance-authority
- tailwindcss
- pjTransactionsHistory.ts
- invoice_profiles.test.ts
- sw.js
- invoice_profiles.test.ts
- demo/page.tsx
- 2. Behavioral Rules
- 🦁 Documentação de Governança: Categorização Inteligente com Jev (TypeSafe AI)
- LeaoMed Capital — Contexto para agentes
- lucide-react
- Procedimento Operacional Padrão (SOP): Ingestão de Dados e Deduplicação
- B.L.A.S.T. Task Plan
- installment_backup_import.test.cjs
- installment_recovery.test.cjs
- transactions/route.ts
- Procedimento Operacional Padrão (SOP): Categorização e Recorrência
- Validação da reforma visual
- ref_node_assert
- Progress
- parse-investment/route.ts
- Correção de importação — 9 de outubro de 2026
- assets/README.md
- findings.md
- contexto/README.md
- installment-recovery.md
- react-dom
- tesseract.js

## God Nodes (most connected - your core abstractions)
1. `react` - 51 edges
2. `getAuthenticatedUserId()` - 50 edges
3. `lucide-react` - 44 edges
4. `next` - 40 edges
5. `sql` - 40 edges
6. `getFinancialScopeVersion()` - 26 edges
7. `DashboardUI()` - 24 edges
8. `InstallmentsProjection()` - 23 edges
9. `getFinancialUserScope()` - 23 edges
10. `parseInvoiceFromTextOrOCR()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `3. Modo Privacidade (Ocultação de Valores Confidenciais)` --references--> `PrivacyToggle()`  [INFERRED]
  README.md → components/PrivacyToggle.tsx
- `Evidência de preservação` --references--> `AccessibleDialog()`  [INFERRED]
  docs/layout-preservation-review.md → components/dashboard/AccessibleDialog.tsx
- `Preservação dos simuladores` --references--> `InvestmentRebalance()`  [INFERRED]
  docs/layout-reform-validation.md → components/dashboard/InvestmentRebalance.tsx
- `Exceções intencionais e navegação` --references--> `AnnualConsolidatedView()`  [INFERRED]
  docs/layout-preservation-review.md → components/dashboard/AnnualConsolidatedView.tsx
- `Task 1: Componente de Visão Orçamentária Completa (Obrigatórias vs Não Obrigatórias)` --references--> `BudgetBreakdown()`  [INFERRED]
  docs/plans/2026-09-24-mobile-hosting-and-budget-breakdown.md → components/dashboard/BudgetBreakdown.tsx

## Import Cycles
- None detected.

## Communities (68 total, 13 thin omitted)

### Community 0 - "aiDocumentParser.ts"
Cohesion: 0.06
Nodes (62): dynamic, maxDuration, parseDocumentWithLayoutReview(), POST(), pdf-parse, beginsExcludedSection(), buildTransaction(), CardReconciliation (+54 more)

### Community 1 - "InstallmentsProjection.tsx"
Cohesion: 0.14
Nodes (28): formatBRL(), InstallmentsProjection(), InstallmentsProjectionProps, PT_MONTHS_MAP, ReliefCard(), ReliefCardProps, TieredCockpitView(), usePrivacy() (+20 more)

### Community 2 - "api_user_isolation.test.cjs"
Cohesion: 0.18
Nodes (9): getSupabaseAdmin(), POST(), accounts, installments, main(), queries, req(), root (+1 more)

### Community 3 - "psycopg2"
Cohesion: 0.06
Nodes (29): 1. Responsabilidade (Separation of Concerns), 2. Visão Consolidada vs. Separada (PF/PJ), 3. Algoritmo de Projeção (End Balance), 4. Cálculo do Safe Daily Spend, 5. Regra de Limite de Dados, Procedimento Operacional Padrão (SOP): Projeção de Fluxo de Caixa, 1. Riscos críticos, 2. Riscos médios (+21 more)

### Community 4 - "financialCategorizationService.ts"
Cohesion: 0.12
Nodes (22): dynamic, POST(), dynamic, POST(), CATEGORIZATION_CONFIG, CategorizationThresholds, isSensitiveCategory(), BENCHMARK_DATASET (+14 more)

### Community 5 - "getAuthenticatedUserId"
Cohesion: 0.14
Nodes (25): dynamic, GET(), DELETE(), dynamic, GET(), POST(), dynamic, GET() (+17 more)

### Community 6 - "bankCsvParsers.ts"
Cohesion: 0.18
Nodes (31): detectDelimiter(), makeInvestmentTx(), normaliseHeader(), parseBankSpecificCsv(), parseBybitCsv(), parseC6ExtraoCsv(), parseInterCsv(), parseInterGlobalCsv() (+23 more)

### Community 7 - "client-financial-isolation.test.cjs"
Cohesion: 0.19
Nodes (9): InvestmentLinkModal(), InvestmentLinkModalProps, AssetRow, InvestmentRebalance(), cache, DEFAULT_PORTFOLIO_ASSETS, InvestmentMovementLog, InvestmentPortfolioStore (+1 more)

### Community 8 - "financial_security_validation.test.ts"
Cohesion: 0.08
Nodes (26): billPayment, cardTxs, demoSummary, demoText, emptyMonthSummary, fullAggregatedTotal, hashA, hashB (+18 more)

### Community 9 - "next"
Cohesion: 0.13
Nodes (14): dynamic, GET(), POST(), DashboardPage(), dynamic, getEmptyUserPayload(), SearchParamsProps, dynamic (+6 more)

### Community 10 - "dashboardData.ts"
Cohesion: 0.17
Nodes (12): OpenFinanceConnect(), PluggyConnect, DashboardErrorBoundary(), GoogleIcon(), LoginForm(), LoginPage(), AccountSettingsModal(), loadUser() (+4 more)

### Community 11 - "getFinancialScopeVersion"
Cohesion: 0.05
Nodes (50): BudgetBreakdown(), BudgetBreakdownProps, BudgetScopeTab, CategoryGroup, getCategoryColor(), getCategoryIcon(), INITIAL_PJ_HISTORY, PjMonthTaxData (+42 more)

### Community 12 - "DashboardUI.tsx"
Cohesion: 0.18
Nodes (15): AnnualConsolidatedView(), CashFlowChart(), CashFlowChartProps, CategoryChart(), DataIngestionCenter(), HistoricalOverview(), MonthRecord, InsightsPanel() (+7 more)

### Community 13 - "BudgetBreakdown.tsx"
Cohesion: 0.16
Nodes (14): AccessibleDialog(), compressImageIfNeeded(), DocumentUploadModal(), DocumentUploadModalProps, GlobalQuickFinder(), GlobalQuickFinderProps, QuickFinderItem, FULL_MONTH_NAMES (+6 more)

### Community 14 - "recovery/route.ts"
Cohesion: 0.22
Nodes (15): dynamic, POST(), privateHeaders, dynamic, GET(), POST(), privateHeaders, isInstallmentBackup() (+7 more)

### Community 15 - "userJevAccess.ts"
Cohesion: 0.19
Nodes (19): allowCredentialUpdate(), attempts, DELETE(), dynamic, GET(), PUT(), validateTypesafeKey(), decryptApiKey() (+11 more)

### Community 16 - "dashboardData.ts"
Cohesion: 0.13
Nodes (18): AnnualConsolidatedViewProps, DEMO_ANNUAL_DATA_2026, ExecutiveHubCards(), ExecutiveHubCardsProps, InsightsPanelProps, TieredCockpitViewProps, buildDashboardPayload(), DashboardFilter (+10 more)

### Community 17 - "react"
Cohesion: 0.13
Nodes (11): DashboardLayout(), dynamic, CategoryChartProps, CategoryData, PALETTE, MobileQuickNavProps, PrivacyToggle(), PrivacyContext (+3 more)

### Community 18 - "✨ Funcionalidades Principais do App"
Cohesion: 0.07
Nodes (29): 10. Simulador do Teto Diário Seguro & Meta de Aporte (10% Padrão), 11. Calculadora de Reserva de Emergência Sugerida (6 a 12x Custo Fixo), 12. Rebalanceamento Estratégico de Carteira (13 Ativos Multi-Mercado), 1. Clonar o repositório, 1. Ingestão Multimodal com OCR & Reconhecimento de Faturas Reais, 2. Categorização Inteligente em 2 Camadas (Jev TypeSafe AI & Regras), 2. Instalar dependências, 3. Configurar variáveis de ambiente (+21 more)

### Community 19 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, clsx@^2.1.1, lucide-react@^1.11.0, @neondatabase/serverless@^1.1.0, next@16.4.3, openai@^6.34.0, pdf-parse@^2.4.5, pluggy-sdk@^0.92.0 (+11 more)

### Community 20 - "getFinancialUserScope"
Cohesion: 0.19
Nodes (16): LegacyFinancialRecovery(), recover(), FinancialSessionBoundary(), flush(), listeners, main(), navigations, root (+8 more)

### Community 21 - "package.json"
Cohesion: 0.15
Nodes (18): devDependencies, autoprefixer@^10.6.1, postcss@^8.5.28, tailwindcss-animate@^1.0.7, @types/node@latest, @types/pdf-parse@^1.1.5, @types/react@latest, @types/react-dom@latest (+10 more)

### Community 22 - "MobillsAnalytics.tsx"
Cohesion: 0.18
Nodes (12): BADGE_PRESETS, COLOR_OPTIONS, CreditCardModal(), CreditCardModalProps, INSTITUTION_OPTIONS, CategoryItem, MobillsAnalytics(), MobillsAnalyticsProps (+4 more)

### Community 23 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 24 - "auth-helpers.ts"
Cohesion: 0.16
Nodes (12): dynamic, POST(), @supabase/ssr@^0.10.2, @supabase/supabase-js@^2.104.1, config, copyCookies(), proxy(), @supabase/ssr (+4 more)

### Community 25 - "cn"
Cohesion: 0.28
Nodes (10): Badge(), BadgeProps, badgeVariants, Card, CardContent, CardDescription, CardFooter, CardHeader (+2 more)

### Community 26 - "postgres"
Cohesion: 0.13
Nodes (14): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, container_name, environment, image, ports, restart (+6 more)

### Community 27 - "manifest.json"
Cohesion: 0.13
Nodes (14): background_color, categories, display, display_override, icons, id, lang, name (+6 more)

### Community 29 - "Revisão de preservação funcional do layout"
Cohesion: 0.33
Nodes (5): Evidência de preservação, Exceções intencionais e navegação, Revisão de preservação funcional do layout, Verificações e limites, normalizeCategoryName()

### Community 30 - "userScopedStorage.ts"
Cohesion: 0.16
Nodes (10): DEFAULT_SUBCATEGORIES_BY_CATEGORY, QuickTransactionModalProps, UserAccountHeaderProps, LogoutButton(), cache, owner, recoveredTransactions, DEFAULT_CREDIT_CARDS (+2 more)

### Community 31 - "AppleMobileTabBar.tsx"
Cohesion: 0.36
Nodes (9): AppleMobileTabBar(), aliases, dashboardNavigation, navigateDashboard(), NavigationTab, resolveDashboardTab(), resolveNavigationTab(), SidebarNavigation() (+1 more)

### Community 32 - "app/layout.tsx"
Cohesion: 0.19
Nodes (10): metadata, outfit, plusJakarta, RootLayout(), viewport, PwaRegister(), Theme, ThemeContext (+2 more)

### Community 33 - "split_batches.ts"
Cohesion: 0.22
Nodes (7): b1, b2, cleanItems, items, rawValues, sql, valuesMatch

### Community 34 - "parse/route.ts"
Cohesion: 0.36
Nodes (6): detectCompetence(), MONTH_MAP, parseCurrency(), ParsedDasBreakdown, parsePdfStreams(), POST()

### Community 35 - "vercel.json"
Cohesion: 0.29
Nodes (6): buildCommand, framework, headers, installCommand, outputDirectory, regions

### Community 36 - "typescript"
Cohesion: 0.21
Nodes (7): typescript@^7.0.2, typescript, currentUser, root, main(), root, syntheticPdf()

### Community 37 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 39 - "tailwindcss"
Cohesion: 0.50
Nodes (3): tailwindcss@^3.4.19, tailwindcss, config

### Community 45 - "invoice_profiles.test.ts"
Cohesion: 0.19
Nodes (11): invoice, ledger, preview, C6_JANUARY_ROLLOVER, C6_SANITIZED_INVOICE, GENERIC_BANK_FIXTURES, c6, fee (+3 more)

### Community 46 - "demo/page.tsx"
Cohesion: 0.43
Nodes (6): DemoPage(), dynamic, getDemoPayload(), UserAccountHeader(), useTheme(), ThemeToggle()

### Community 47 - "2. Behavioral Rules"
Cohesion: 0.15
Nodes (12): 1.1 Input: Raw Transaction (Pluggy/Belvo), 1.2 Core: Processed Transaction, 1.3 Output: Delivery Payload (Dashboard & IA), 1. Data Schemas, 2. Behavioral Rules, 3. Architectural Invariants, 4. Maintenance Log, Cálculo e Lógica (+4 more)

### Community 48 - "🦁 Documentação de Governança: Categorização Inteligente com Jev (TypeSafe AI)"
Cohesion: 0.17
Nodes (11): 1. Escopo e Limites Operacionais do Jev, 2. Arquitetura em Cascata (5 Níveis de Decisão), 3. Modo Sombra (Shadow Mode), 4. Privacidade e Sanitização de PII (Zero-Leak), 5. Variáveis de Ambiente & Configuração, 6. Acesso por conta e BYOK, 7. Rotação e publicação do código, 8. Como Executar o Benchmark e Testes (+3 more)

### Community 49 - "LeaoMed Capital — Contexto para agentes"
Cohesion: 0.22
Nodes (8): Estrutura principal, Finalidade, graphify, LeaoMed Capital — Contexto para agentes, Links, Regras importantes, Skills disponíveis neste projeto, Stack

### Community 50 - "lucide-react"
Cohesion: 0.31
Nodes (6): ErrorBoundary(), DailySpendModal(), DailySpendModalProps, SummaryCards(), SummaryCardsProps, lucide-react

### Community 51 - "Procedimento Operacional Padrão (SOP): Ingestão de Dados e Deduplicação"
Cohesion: 0.29
Nodes (6): 1. Regra do Sinal de Valores (Amount), 2. Normalização de Descrição (Description), 3. Geração do Hash Único (Deduplicação), 4. Atualização de Competência, 5. Idempotência do Webhook, Procedimento Operacional Padrão (SOP): Ingestão de Dados e Deduplicação

### Community 52 - "B.L.A.S.T. Task Plan"
Cohesion: 0.29
Nodes (6): B.L.A.S.T. Task Plan, Fase 1: Blueprint (Visão & Lógica), Fase 2: Link (Conectividade), Fase 3: Architect (A Construção em 3 Camadas), Fase 4: Stylize (Refinamento & UI), Fase 5: Trigger (Implantação e Automação)

### Community 53 - "installment_backup_import.test.cjs"
Cohesion: 0.33
Nodes (6): item, main(), req(), root, saved, user

### Community 54 - "installment_recovery.test.cjs"
Cohesion: 0.33
Nodes (6): item, main(), request(), root, saved, user

### Community 55 - "transactions/route.ts"
Cohesion: 0.40
Nodes (5): dynamic, generateTransactionHash(), GET(), POST(), PUT()

### Community 56 - "Procedimento Operacional Padrão (SOP): Categorização e Recorrência"
Cohesion: 0.33
Nodes (5): 1. Separação PF e PJ, 2. Categorização Automática por Regra (MVP), 3. Detecção de Despesas Fixas (Recorrência), 4. Evolução com IA (Próximas Fases), Procedimento Operacional Padrão (SOP): Categorização e Recorrência

### Community 57 - "Validação da reforma visual"
Cohesion: 0.33
Nodes (5): Evidência visual e adaptações, Limites, Preservação dos simuladores, Resultado, Validação da reforma visual

### Community 58 - "ref_node_assert"
Cohesion: 0.33
Nodes (4): excludedTable, fragmented, incomplete, invalidCsv

### Community 59 - "Progress"
Cohesion: 0.40
Nodes (4): Fase 1: Blueprint, Fase 2: Link, Fase 3: Architect, Progress

### Community 60 - "parse-investment/route.ts"
Cohesion: 0.50
Nodes (3): dynamic, maxDuration, POST()

### Community 61 - "Correção de importação — 9 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Correção, Correção de importação — 9 de outubro de 2026, Validação

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `aiDocumentParser.ts`, `app/layout.tsx`, `parse/route.ts`, `financialCategorizationService.ts`, `getAuthenticatedUserId`, `typescript`, `dashboardData.ts`, `getFinancialScopeVersion`, `DashboardUI.tsx`, `recovery/route.ts`, `userJevAccess.ts`, `react`, `lucide-react`, `dependencies`, `package.json`, `transactions/route.ts`, `auth-helpers.ts`, `parse-investment/route.ts`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Should `aiDocumentParser.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056962025316455694 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `app/layout.tsx`, `InstallmentsProjection.tsx`, `client-financial-isolation.test.cjs`, `dashboardData.ts`, `getFinancialScopeVersion`, `DashboardUI.tsx`, `BudgetBreakdown.tsx`, `demo/page.tsx`, `dashboardData.ts`, `lucide-react`, `dependencies`, `getFinancialUserScope`, `package.json`, `MobillsAnalytics.tsx`, `cn`, `userScopedStorage.ts`, `AppleMobileTabBar.tsx`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Should `InstallmentsProjection.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14487179487179488 - nodes in this community are weakly interconnected._
- **Why does `PrivacyToggle()` connect `react` to `InstallmentsProjection.tsx`, `✨ Funcionalidades Principais do App`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `psycopg2` be split into smaller, more focused modules?**
  _Cohesion score 0.061507936507936505 - nodes in this community are weakly interconnected._
- **Should `financialCategorizationService.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11846689895470383 - nodes in this community are weakly interconnected._