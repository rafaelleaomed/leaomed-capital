# 🦁 LeãoMed Capital — Private Wealth & Financial Intelligence Platform

> Plataforma moderna de inteligência financeira e consolidação patrimonial com gestão unificada PJ + PF, rebalanceamento multi-ativos, projeção contratual de fluxo de caixa, simulação de teto diário seguro e integração Open Finance.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel_Production-black?logo=vercel&style=for-the-badge)](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app)
[![Demo](https://img.shields.io/badge/Live_Demo-Disponível-10B981?style=for-the-badge&logo=safari)](https://leaomed-capital-rafael-leaos-projects-e3cb079d.vercel.app/demo)
[![Next.js](https://img.shields.io/badge/Next.js_16-Turbopack-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-Strict_Mode-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon_Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Auth](https://img.shields.io/badge/Auth-Supabase_SSR-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
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
│  Layer 3: Tools & Data Layer (Neon Postgres + Open Finance)  │
│  • Neon Serverless PostgreSQL (Queries Parametrizadas)       │
│  • Supabase Auth (Cookies HTTP-Only + RLS)                  │
│  • Pluggy Open Finance SDK & Webhook Idempotente            │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Funcionalidades Principais do App

### 1. Visão Consolidada & Segregação Rigorosa PF / PJ
- Alternância instantânea entre **Consolidado**, **Pessoa Física (PF)** e **Pessoa Jurídica**.
- Despesas e receitas são segregadas no banco de dados e unificadas sem duplicidade contábil na visão executiva (pró-labore não bitributa faturamento).

### 2. Categorização Inteligente com Memória de Regras
- **IA Preditiva & Heurística Médica:** Sugere a categoria e subcategoria exata para cada lançamento ao importar faturas de cartões ou extratos.
- **Aprendizado Contínuo:** Opção de memorizar *"Sempre categorizar lançamentos contendo '[Nome]' nesta categoria"* (ex: McDonald's em Alimentação, DARF em Impostos PJ, Drogaria em Saúde).
- **Zero Trabalho Repetitivo:** Nos meses seguintes ou em novos uploads, o sistema aplica automaticamente as regras aprendidas sem exigir revisão manual item a item.

### 3. Extrato Item a Item & Prevenção Antiduplicação (Cartão vs Conta)
- **Auditoria Granular:** Aba dedicada na planilha com extrato completo transação por transação (data, estabelecimento, conta/cartão, categoria e valor).
- **Edição & Exclusão Individual:** Possibilidade de editar ou excluir qualquer lançamento individual com 1 clique.
- **Detecção de Duplicidades Contábeis:** Identifica débitos de pagamento de fatura em conta corrente quando as despesas individuais do cartão já estão discriminadas, oferecendo deduplicação automática com 1 clique (conforme Seção 2 do `GEMINI.md`).

### 4. Navegação Temporal Dinâmica Mês a Mês (Estilo Mobills)
- Seletor de mês/ano com setas rápidas e modal de calendário completo (Dezembro/25 a Dezembro/26).
- **Recálculo instantâneo:** receitas brutas, despesas totais, fatura de cartão de crédito principal, saldo líquido, gráficos Donut e distribuição de picos diários se adaptam automaticamente ao mês selecionado.

### 5. Edição e Exclusão Inline na Planilha Oficial
- **Edição Clicável:** Qualquer subcategoria de despesa ou receita pode ser clicada para editar o valor monetário, nome ou classificação (fixa/obrigatória vs. variável).
- **Exclusão de Inconsistências:** Botão de lixeira rápida e opção de exclusão com confirmação em duas etapas no modal para remover linhas com inconsistências.
- **Persistência Reativa:** As alterações são salvas localmente e recalculam na hora a categoria pai, despesas obrigatórias e cálculos de reserva.

### 6. Simulador do Teto Diário Seguro & Meta de Aporte (10% Padrão)
- **Engenharia de Saúde Financeira:** Responde à pergunta central: *"Quanto posso gastar hoje sem comprometer minhas contas fixas e meus investimentos?"*.
- **Fórmula Matemática Contábil:**
  $$\text{Teto Diário Seguro} = \frac{\text{Faturamento} - \text{Custos Fixos Blindados} - \text{Meta de Novos Aportes}}{\text{Dias Restantes ou Ciclo Total}}$$
- **Simulador Interativo (`DailySpendModal`):**
  - Slider de percentual de aporte mensal (0% a 40%, com presets de 5%, 10%, 15%, 20%).
  - Demonstração em cascata transparente: Faturamento (-) Custos Fixos (-) Meta de Aportes (=) Orçamento Livre (÷) Dias (=) Teto Seguro Diário.
  - Alternância entre dias restantes do mês ou ciclo cheio de 30 dias.

### 7. Calculadora de Reserva de Emergência Sugerida (6 a 12x Custo Fixo)
- **Sincronização Automática:** Campo de custo fixo mensal alimentado diretamente pelo **somatório das despesas obrigatórias da planilha** (R$ 25.528,57).
- **Perfis Médicos Estruturados:**
  - **10 Meses (Recomendado):** Médico autônomo, plantonista e consultório particular.
  - **12 Meses (Blindagem Total):** Clínica médica própria / PJ com folha e insumos.
  - **8 Meses:** CLT / Contratos longos.
  - **6 Meses:** Servidor público concursado.
- Diagnóstico em tempo real com barra de progresso, déficit patrimonial e meses cobertos.

### 8. Central Multicanal de Ingestão de Dados (Drag & Drop Múltiplo)
- **Arrastar e Soltar Múltiplo:** Suporte a upload simultâneo de vários arquivos (PDFs de faturas de meses ou cartões distintos, planilhas Excel `.xlsx` ou extratos `.csv`).
- **Pré-visualização & Parsing:** Validação de faturas, identificação automática do emissor (Itaú, Pessoa Jurídica, C6, Nubank, XP) e conciliação bancária.
- **Open Finance:** Conexão direta via Pluggy com atualização automática de saldos e lançamentos.

### 7. Lançamento Rápido Manual (Header & Botão Flutuante FAB)
- Modal acessível pelo botão executivo no topo ou pelo FAB flutuante no canto inferior direito.
- Registro de despesas e receitas com seleção de conta de origem, PF/PJ e tipo de gasto:
  - **À Vista / Pontual**
  - **Despesa Fixa / Obrigatória**
  - **Parcelada:** Seletor de 2x a 48x com cálculo em tempo real do valor da parcela mensal e data da 1ª parcela.

### 8. Rebalanceamento Estratégico de Carteira (13 Ativos Multi-Mercado)
- Alocação estratégica: **Ações (25%)**, **Internacional (25%)**, **Caixa (30%)**, **Real Estate/FIIs (15%)** e **Criptoativos (5%)**.
- Isolamento contábil da **Reserva de Emergência** (não afeta o perfil de risco de investimento).
- Motor de cálculo de superávit/déficit para direcionar novos aportes.

### 9. Previsibilidade de Parcelamentos & Alívio de Caixa
- Monitoramento de parcelas de financiamentos e contratos de longo prazo (veículos, equipamentos médicos, reformas).
- Linha do tempo de descompressão financeira ao longo dos meses.

### 10. Onboarding Wizard & Personalização para Novos Usuários
- Modal completo para configuração de novas contas, personalização de categorias médicas, definição de metas de aporte e métodos preferidos de ingestão de dados.

---

## 🎨 Design System & UI/UX (5D Framework)

Inspirado nas melhores práticas de fintechs institucionais de alto padrão:

- **Modo Claro (Light Mode) Nativo**: Interface limpa, profissional e de alta legibilidade como padrão, com alternância para Dark Mode.
- **Pattern & Layout**: Bento Grid modular de alta densidade informativa, cards com hierarquia clara e mobile quick navigation.
- **Palette**: Esmeralda Financeiro (`#10B981`), Azul Royal (`#3B82F6`), Âmbar (`#F59E0B`), ardósia neutra e superfícies translúcidas com `backdrop-blur`.
- **Typography**: `Plus Jakarta Sans` (interface limpa e escalável) + `Outfit` (títulos e display) + monoespaçado tabular para números.
- **Interactions**: Micro-interações táteis (scale 1.02, elevação em hover, transições a 200ms com aceleração por GPU).

---

## 🛡️ Segurança & Auditoria Técnica (Zero Trust)

O projeto segue rigorosamente os padrões de segurança e Clean Architecture:

- ✅ **Zero Secrets no Código**: Nenhuma chave, credencial ou string de conexão versionada. Variáveis injetadas via `.env.local` e ambiente seguro de produção na Vercel.
- ✅ **Isolamento e Sanitização de PII**: A rota pública `/demo` opera exclusivamente com dados sintéticos sanitizados; dados reais e contratos privados permanecem restritos à conta autenticada do Dr. Rafael no Neon PostgreSQL.
- ✅ **Proteção contra IDOR / BOLA**: Endpoints autenticados validam a sessão server-side e forçam o `user_id` criptografado via cookie HTTP-Only.
- ✅ **Sessões Seguras**: Autenticação gerenciada via `@supabase/ssr` com cookies criptografados, `httpOnly`, `sameSite: lax` e renovação automática de sliding session.
- ✅ **Defesa em Profundidade contra SQL Injection**: Consultas parametrizadas via tagged template literals do `@neondatabase/serverless`.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+, 20+ ou 24+
- Conta no [Neon](https://neon.tech) (PostgreSQL)
- Projeto no [Supabase](https://supabase.com) (Auth)

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
