# 🦁 LeãoMed Capital — Private Wealth & Financial Intelligence Platform

> Plataforma moderna de inteligência financeira e consolidação patrimonial com gestão unificada PJ + PF, rebalanceamento multi-ativos, projeção contratual de fluxo de caixa e integração Open Finance.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel_Production-black?logo=vercel&style=for-the-badge)](https://leaomed-capital.vercel.app)
[![Demo](https://img.shields.io/badge/Live_Demo-Disponível-10B981?style=for-the-badge&logo=safari)](https://leaomed-capital.vercel.app/demo)
[![Next.js](https://img.shields.io/badge/Next.js_16-Turbopack-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-Strict_Mode-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon_Serverless-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Auth](https://img.shields.io/badge/Auth-Supabase_SSR-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS_+_shadcn-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

## 🌐 Acesso Rápido & Ambientes

| Ambiente | URL | Descrição / Dados |
|---|---|---|
| 🟢 **Demonstração Pública (Portfólio)** | [**leaomed-capital.vercel.app/demo**](https://leaomed-capital.vercel.app/demo) | **Acesso Livre**: Dados 100% sintéticos e modelados para demonstração de portfólio. Nenhuma credencial ou dado privado é exigido. |
| 🔒 **Ambiente Privado Autenticado** | [**leaomed-capital.vercel.app/dashboard**](https://leaomed-capital.vercel.app/dashboard) | **Acesso Restrito**: Protegido por Supabase Auth, middleware SSR e isolamento rigoroso por `user_id` no Neon PostgreSQL. |
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

## ✨ Funcionalidades Principais

### 1. Visão Consolidada & Segregação Rigorosa PF / PJ
- Alternância instantânea entre **Consolidado**, **Pessoa Física** e **Pessoa Jurídica (Inter PJ)**.
- Despesas e receitas são segregadas no banco de dados e unificadas apenas sob demanda na visualização executiva.

### 2. Painel Executivo & Métricas Acionáveis (Bento Grid)
- **Saldo Projetado ao Fim do Período**: Considera histórico, despesas fixas recorrentes e parcelas contratadas.
- **Teto Seguro de Gasto Diário**: Calculado dinamicamente para preservar metas de poupança.
- **Capacidade Real de Investimento**: Excedente líquido projetado para aportes.

### 3. Matriz Orçamentária (Gastos Obrigatórios vs. Não Obrigatórios)
- Classificação automática de despesas fixas essenciais (moradia, transporte, tributos, saúde) versus variáveis e estilo de vida.
- Sistema de busca em tempo real, visualização colapsável e cálculo de peso percentual no orçamento total.

### 4. Rebalanceamento Estratégico de Carteira (13 Ativos Multi-Mercado)
- Matriz de alocação por classes de ativos: **Ações (25%)**, **Internacional (25%)**, **Caixa (30%)**, **Real Estate/FIIs (15%)** e **Criptoativos (5%)**.
- Isolamento contábil da **Reserva de Emergência** (não entra no cálculo de risco da carteira).
- Algoritmo de sugestão de aportes prioritários com cálculo de déficit/superávit por classe.

### 5. Previsibilidade de Parcelamentos & Alívio de Caixa
- Linha do tempo de descompressão financeira com monitoramento de quitação de parcelas de longo prazo.
- Suporte a reajuste acumulado de **IPCA** e encargos contínuos.

### 6. IA Consultiva & Alertas Proativos
- Recomendações determinísticas baseadas em regras e saúde financeira real, sem respostas genéricas.

---

## 🎨 Design System & UI/UX (5D Framework)

Inspirado nas melhores práticas de produtos de luxo e fintechs institucionais:

- **Pattern & Layout**: Bento Grid modular de alta densidade informativa, cards com hierarquia clara e mobile quick navigation.
- **Style & Aesthetic**: Dark Mode *Linear/Vercel-inspired* com bordas sutis (`border-slate-800`), cards `bg-slate-900/60` e `backdrop-blur-md`.
- **Palette**: Fundo Slate Profundo (`#0A0F1D`), Dourado Leão (`#EAB308` / `#F59E0B`), Verde Esmeralda institucional (`#10B981`) para liquidez positiva.
- **Typography**: `Plus Jakarta Sans` (interface limpa e escalável) + `Outfit` (títulos e pesos display).
- **Interactions**: Micro-interações táteis (scale 1.02, elevação em hover, transições a 200ms com aceleração por GPU).

---

## 🛡️ Segurança & Auditoria Técnica (Zero Trust)

O projeto foi auditado segundo as diretrizes das skills `code-reviewer` e `security-reviewer`:

- ✅ **Zero Secrets em Repositório**: Nenhuma credencial, token ou string de conexão está versionada. Todas as variáveis são injetadas via `.env.local` / ambiente seguro Vercel.
- ✅ **Proteção contra IDOR / BOLA**: Endpoints sensíveis (como `/api/connect-token`) validam a sessão server-side e forçam o `userId` autenticado, rejeitando parâmetros forjados pelo cliente.
- ✅ **Sanitização de PII**: A rota pública `/demo` opera exclusivamente com dados sintéticos mockados de alta fidelidade; dados reais e contratos privados permanecem restritos à conta autenticada.
- ✅ **Sessões Seguras**: Autenticação gerenciada via `@supabase/ssr` com cookies criptografados, `httpOnly`, `sameSite: lax` e renovação automática de sliding session.
- ✅ **Defesa em Profundidade contra SQL Injection**: Todas as interações com o banco utilizam tagged template literals com queries parametrizadas via `@neondatabase/serverless`.
- ✅ **Padronização de Erros**: Rotas de API não expõem stack traces ou mensagens internas do banco de dados em respostas HTTP.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ ou 20+
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
Acesse `http://localhost:3000` (ou `http://localhost:3000/demo` para ver a demonstração).

### 5. Build de produção
```bash
npm run build
npm run start
```

---

## 👨‍💻 Autor & Direitos

Desenvolvido por **Dr. Rafael Leão** como solução completa de engenharia de software fullstack aplicada a gestão de patrimônio privado e inteligência financeira médica.

*Todos os direitos reservados. Código disponível para fins de avaliação técnica e portfólio.*
