# 🦁 LeãoMed Capital — Private Wealth & Financial Intelligence Platform

> Plataforma moderna de inteligência financeira e consolidação patrimonial com gestão unificada PJ + PF, classificação contínua por IA (Jev - TypeSafe AI), OCR inteligente de faturas, rebalanceamento multi-ativos, projeção contratual de fluxo de caixa, simulação de teto diário seguro e modo privacidade.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel_Production-black?logo=vercel&style=for-the-badge)](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app)
[![Demo](https://img.shields.io/badge/Live_Demo-Disponível-10B981?style=for-the-badge&logo=safari)](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app/demo)
[![Next.js](https://img.shields.io/badge/Next.js_16-Turbopack-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-Strict_Mode-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon_Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Auth](https://img.shields.io/badge/Auth-Supabase_SSR-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeSafe AI](https://img.shields.io/badge/AI_Classifier-Jev_TypeSafe-8B5CF6?style=for-the-badge)](https://typesafe.ai)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS_+_shadcn-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

## 🌐 Acesso Rápido & Ambientes

| Ambiente | URL | Descrição / Dados |
|---|---|---|
| 🟢 **Demonstração Pública (Portfólio)** | [**leaomed-capital.vercel.app/demo**](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app/demo) | **Acesso Livre**: Dados 100% sintéticos e modelados para demonstração de portfólio. Nenhuma credencial ou dado privado é exigido. |
| 🔒 **Ambiente Privado Autenticado** | [**leaomed-capital.vercel.app/dashboard**](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app/dashboard) | **Acesso Restrito**: Protegido por Supabase Auth, middleware SSR e isolamento rigoroso por `user_id` no Neon PostgreSQL. |
| 📦 **Repositório GitHub** | [**github.com/rafaelleaomed/leaomed-capital**](https://github.com/rafaelleaomed/leaomed-capital) | Código-fonte auditado, sem segredos e pronto para auditoria técnica. |

---

## 🏛️ Arquitetura do Sistema (A.N.T. 3-Layer)

A plataforma adota a arquitetura **A.N.T. (Architecture, Navigation, Tools)** com separação estrita de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Architecture (SOPs em Markdown & Invariantes)     │
│  • SOP de Ingestão e Deduplicação                           │
│  • SOP de Categorização e Taxonomia Customizada             │
│  • SOP de Projeções de Fluxo de Caixa                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Layer 2: Navigation & Presentation (Next.js 16 + Turbopack) │
│  • Route Handlers com Validação de Sessão Server-Side       │
│  • Financial Engine (Separação entre Regra e Formatação)   │
│  • Dashboard Bento Grid (Consolidado, PF e PJ)              │
│  • Modo Demonstração Isolado (/demo)                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│  Layer 3: Tools & Data Layer (Neon Postgres + Jev + OCR)     │
│  • Neon Serverless PostgreSQL (Queries Parametrizadas)       │
│  • Supabase Auth (Cookies HTTP-Only + RLS)                  │
│  • Jev TypeSafe AI Provider (Classificação Estruturada)      │
│  • Engine OCR Multimodal de Faturas e Extratos              │
│  • Pluggy Open Finance SDK & Webhook Idempotente            │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades Principais do App

### 1. Ingestão Multimodal com OCR & Reconhecimento de Faturas Reais
- **Upload de Prints & PDFs:** Processamento inteligente via OCR de alta precisão (`/api/parse-document`) para faturas de cartão (C6 Carbon Black, Nubank Ultravioleta, Itaú Personnalité) e extratos de plantões PJ.
- **Detecção de Titulares & Adicionais:** Reconhecimento automático de múltiplos cartões na mesma fatura (cartão titular, virtual e adicionais).
- **Tratamento Contábil de Parcelas:** Extração e identificação de compras parceladas (`Parcela X/Y`) e segregação de pagamentos de fatura para prevenir duplicidades no fluxo de caixa.

### 2. Categorização Inteligente em 2 Camadas (Jev TypeSafe AI & Regras)
- **Camada 1 (Regras Determinísticas & PostgreSQL `category_rules`):** Avaliação em cascata: regra exata do usuário ➔ regra de estabelecimento por substring ➔ heurísticas de negócio alinhadas à taxonomia oficial (`USER_TAXONOMY`).
- **Camada 2 (Jev System One - TypeSafe AI):** Classificador semântico estruturado para transações não resolvidas localmente:
  - **Primitiva Choice:** Sugere categoria e subcategoria estritamente restritas à taxonomia do usuário, sem alucinar categorias inexistentes.
  - **Primitiva Noul:** Identifica a probabilidade de despesa fixa/recorrente e o grau de ambiguidade que requer revisão.
- **Modo Sombra (Shadow Mode):** O Jev opera como assistente de sugestão probabilística — nenhuma transação é alterada automaticamente sem validação ou confirmação manual do usuário.
- **Blindagem de Categorias Sensíveis:** Tributos (DARF/Simples), pró-labore, pagamentos de fatura e aportes de investimento nunca são autoaplicados e exigem aprovação explícita.

### 3. Modo Privacidade (Ocultação de Valores Confidenciais)
- **Botão de Visibilidade no Header (`PrivacyToggle`):** Alternância instantânea com 1 clique para mascarar saldos, receitas e patrimônio (`••••••`).
- **Apresentação Segura:** Permite demonstrar o funcionamento e a interface do aplicativo a terceiros ou em reuniões sem expor valores confidenciais.

### 4. Executive Hub & Hero Banner de Ingestão Superior
- **Destaque Nobre no Topo:** Acesso rápido e direto à Central de Ingestão Multimodal de Faturas logo no início da dashboard.
- **Grade Executiva com Scroll Suave:**
  - 📥 **Importar Faturas & OCR:** Rolagem direta para a área de upload.
  - 📊 **Painel Geral:** Visão do saldo líquido, receitas e despesas.
  - 📑 **Planilha Orçamentária:** Metas de gastos fixos vs variáveis por categoria.
  - 📈 **Carteira & Alocação:** Acompanhamento do aporte ideal e rentabilidade anual.
  - ⏳ **Fim dos Parcelamentos:** Cronograma de quitação de financiamentos e compras parceladas.

### 5. Visão Consolidada & Segregação Rigorosa PF / PJ
- Alternância instantânea entre **Consolidado**, **Pessoa Física (PF)** e **Pessoa Jurídica (PJ)**.
- Despesas e receitas são segregadas no banco de dados e unificadas sem duplicidade contábil na visão executiva (pró-labore não bitributa faturamento).

### 6. Controle Tributário e Despesas Fixas PJ (Alíquota Efetiva)
- **Segregação de Impostos Médicos:** Acompanhamento rigoroso de guias tributárias (Simples Nacional / DAS, ISSQN, IRPJ/CSLL) e honorários contábeis.
- **Cálculo da Alíquota Efetiva:** Exibição da carga tributária real em percentual sobre o faturamento bruto PJ, com alternância para incluir ou excluir custos contábeis.
- **Histórico Mensal de Impostos:** Comparativo mês a mês da evolução dos encargos da pessoa jurídica.

### 7. Extrato Item a Item, Seleção Múltipla & Categorização em Lote
- **Auditoria Granular:** Aba dedicada na planilha com extrato completo transação por transação (data, estabelecimento, conta/cartão, categoria e valor).
- **Seleção em Massa:** Checkboxes individuais e botão de "Selecionar todos os pendentes" para aplicar categoria e subcategoria a dezenas de itens em lote com 1 clique.
- **Edição & Exclusão Individual:** Possibilidade de editar valor, data e descrição ou excluir qualquer lançamento individual com confirmação de segurança.

### 8. Gestão Dinâmica de Cartões de Crédito
- **Adição de Novos Cartões:** Modal completo para cadastrar novos cartões de crédito (bandeira, banco emissor, limite total, limite disponível, dia de fechamento e dia de vencimento).
- **Edição e Manutenção:** Ajuste ágil de limites, inclusão e exclusão de cartões adicionais, personalização de apelidos e cores visuais do cartão.

### 9. Navegação Temporal Dinâmica Mês a Mês (Estilo Mobills)
- Seletor de mês/ano com setas rápidas e modal de calendário completo (Dezembro/25 a Dezembro/26).
- **Recálculo instantâneo:** Receitas brutas, despesas totais, fatura de cartão de crédito, saldo líquido, gráficos Donut e distribuição de picos diários se adaptam dinamicamente ao mês selecionado.

### 10. Simulador do Teto Diário Seguro & Meta de Aporte (10% Padrão)
- **Engenharia de Saúde Financeira:** Responde à pergunta central: *"Quanto posso gastar hoje sem comprometer minhas contas fixas e meus investimentos?"*.
- **Fórmula Matemática Contábil:**
  $$\text{Teto Diário Seguro} = \frac{\text{Faturamento} - \text{Custos Fixos Blindados} - \text{Meta de Novos Aportes}}{\text{Dias Restantes ou Ciclo Total}}$$

### 11. Calculadora de Reserva de Emergência Sugerida (6 a 12x Custo Fixo)
- **Sincronização Automática:** Campo de custo fixo mensal alimentado diretamente pelo somatório das despesas obrigatórias da planilha.
- **Perfis Médicos Estruturados:** 10 meses (médico autônomo/plantonista), 12 meses (clínica própria PJ), 8 meses (CLT) e 6 meses (concursado).

### 12. Rebalanceamento Estratégico de Carteira (13 Ativos Multi-Mercado)
- Alocação estratégica: **Ações (25%)**, **Internacional (25%)**, **Caixa (30%)**, **Real Estate/FIIs (15%)** e **Criptoativos (5%)**.
- Isolamento contábil da **Reserva de Emergência** (não afeta o perfil de risco de investimento).

---

## 🔌 Status das Integrações & Limitações Conhecidas

| Funcionalidade / Integração | Status Atual | Detalhamento Operacional |
|---|---|---|
| **Classificador Jev (TypeSafe AI)** | 🟢 **100% Operacional** | SDK/HTTP Provider integrado com primitives Choice e Noul, cascata de 5 etapas e modo sombra. |
| **OCR de Faturas & Prints de Extrato** | 🟢 **100% Operacional** | Processamento via Tesseract OCR server-side (`/api/parse-document`) com suporte a C6, Nubank e Itaú. |
| **Gestão Orçamentária & Planilha Interativa** | 🟢 **100% Operacional** | Edição inline, cálculo de custos fixos/variáveis, segregação PF/PJ e alíquota de impostos ativa. |
| **Extrato Granular & Seleção em Lote** | 🟢 **100% Operacional** | Auditoria item a item, categorização em lote com memória de regras e antiduplicação de fatura/conta. |
| **Gestão de Cartões de Crédito** | 🟢 **100% Operacional** | Cadastro de cartões, alteração de limites, cartões adicionais e monitoramento de faturas reais. |
| **Investimentos & Aportes Vinculados** | 🟢 **100% Operacional** | Rebalanceamento de 13 ativos, calculadora de reserva de emergência e fluxo de vínculo direto com transações. |
| **Autenticação & Controle de Sessão** | 🟢 **100% Operacional** | Supabase Auth com SSR cookies HTTP-Only, rota de cadastro e modal de perfil/troca de senha. |
| **Banco de Dados Relacional** | 🟢 **100% Operacional** | Neon Serverless PostgreSQL com pooling de conexões e queries parametrizadas. |
| **API Open Finance (Pluggy)** | 🟡 **Arquitetura Pronta (Aguardando Produção)** | Infraestrutura de Route Handlers e Webhooks pronta; aguarda chaves de produção de Open Finance. |

---

## 🛡️ Segurança & Auditoria Técnica (Zero Trust)

O projeto segue rigorosamente os padrões de segurança e Clean Architecture:

- ✅ **Zero Secrets no Código Ativo**: Nenhuma chave, credencial (`TYPESAFE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) versionada. Todas injetadas via variáveis de ambiente server-side protegidas no `.gitignore`.
- ✅ **Isolamento e Sanitização de PII**: A rota pública `/demo` opera exclusivamente com dados sintéticos sanitizados; dados reais e contratos privados permanecem restritos à conta autenticada no Neon PostgreSQL.
- ✅ **Proteção contra IDOR / BOLA**: Endpoints autenticados validam a sessão server-side e forçam o `user_id` criptografado via cookie HTTP-Only.
- ✅ **Sessões Seguras**: Autenticação gerenciada via `@supabase/ssr` com cookies criptografados, `httpOnly`, `sameSite: lax` e renovação automática de sliding session.
- ✅ **Defesa em Profundidade contra SQL Injection**: Consultas parametrizadas via tagged template literals do `@neondatabase/serverless`.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+, 20+ ou 24+
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- Projeto no [Supabase](https://supabase.com) (Auth)
- Chave de API da [TypeSafe AI](https://typesafe.ai) (Jev)

### 1. Clonar o repositório
```bash
git clone https://github.com/rafaelleaomed/leaomed-capital.git
cd leaomed-capital
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env.local` na raiz:
```env
# Banco de Dados (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host.neon.tech/neondb?sslmode=require"

# Autenticação (Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima-jwt"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"

# TypeSafe AI (Jev Classifier)
TYPESAFE_API_KEY="apikey_sua_chave_typesafe_aqui"
STORE_AI_INPUTS=false
AI_LOG_RETENTION_DAYS=90

# Open Finance (Pluggy - Opcional)
PLUGGY_CLIENT_ID="seu-pluggy-client-id"
PLUGGY_CLIENT_SECRET="seu-pluggy-client-secret"
```

### 4. Executar em modo desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` (ou `http://localhost:3000/demo` para ver a demonstração pública).

### 5. Build de produção
```bash
npm run build
npm run start
```

---

## 👨‍💻 Autor & Direitos

Desenvolvido por **Dr. Rafael Leão** como solução completa de engenharia de software fullstack aplicada a gestão de patrimônio privado e inteligência financeira médica.

*Todos os direitos reservados. Código disponível para fins de avaliação técnica e portfólio.*
