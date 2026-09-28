# 💎 Aethel Wealth — Plataforma Financeira Inteligente

> Dashboard financeiro pessoal com gestão unificada PJ + PF, IA consultiva, rebalanceamento de portfólio e projeções automáticas.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Stack](https://img.shields.io/badge/Stack-Next.js_16_+_TypeScript-blue?logo=next.js)](https://nextjs.org)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-green?logo=postgresql)](https://neon.tech)
[![Auth](https://img.shields.io/badge/Auth-Supabase-orange?logo=supabase)](https://supabase.com)

---

## 🚀 Demo

| Ambiente | URL | Dados |
|---|---|---|
| **Privado** | `[Em configuração]` | Dados reais do usuário |
| **Demo Pública** | `[Em configuração]` | Dados sintéticos — sem dados reais |

---

## ✨ Funcionalidades

- **Dashboard consolidado** PJ + PF com filtro global
- **Gráficos interativos**: Donut de despesas, barras de categorias, fluxo de caixa mensal
- **Análise de parcelamentos**: Projeção de alívio contratual (T-Cross, Gramado Parks, etc.)
- **Rebalanceamento de portfólio**: Metas vs. atual por classe de ativo
- **Tema claro e escuro** com persistência local
- **Mobile-first**: Layout responsivo para 360–430px
- **Autenticação segura** via Supabase Auth (sessão server-side, cookies HTTP-only)

---

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Next.js Route Handlers (serverless) |
| Banco de dados | Neon PostgreSQL (serverless) |
| Autenticação | Supabase Auth (SSR cookies) |
| Open Finance | Pluggy SDK |
| Deploy | Vercel Hobby |

---

## ⚙️ Configuração Local

### 1. Clone o repositório

```bash
git clone https://github.com/rafaelleaomed/aethel-wealth.git
cd aethel-wealth
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas credenciais reais
```

### 4. Execute em desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## 🔒 Segurança

- Credenciais **nunca** estão no código — apenas em variáveis de ambiente
- Sessão de autenticação gerenciada **server-side** via cookies HTTP-only
- Middleware Next.js protege todas as rotas `/dashboard/*` e `/api/*`
- Row Level Security (RLS) configurado no Supabase

---

## 📊 Arquitetura de Dados

```
Planilha Excel → Importação/Seed → Neon PostgreSQL
                                         ↓
                              Financial Engine (TypeScript)
                                         ↓
                              Dashboard Payload Builder
                                         ↓
                              DashboardUI (React Server Components)
```

---

## 🗂 Estrutura do Projeto

```
app/
  dashboard/       # Dashboard principal (SSR protegido)
  login/           # Página de login
  api/
    budget/        # Orçamento por categoria
    investments/   # Carteira de investimentos
    installments/  # Parcelamentos e contratos
    history/       # Histórico mensal
    auth/          # Callbacks e signout
    webhooks/      # Webhooks Pluggy
components/
  dashboard/       # Módulos do dashboard
  ThemeProvider    # Tema claro/escuro
  LogoutButton     # Logout client-side
utils/
  db.ts            # Cliente Neon serverless
  supabase-server  # Cliente Supabase SSR
  auth-helpers     # Helpers de autenticação para APIs
  financialEngine  # Motor de cálculos financeiros
  dashboardData    # Builder do payload do dashboard
```

---

## ⚠️ Aviso

Este repositório contém **apenas código**. Nenhum dado financeiro real, planilha, extrato bancário, contrato, ou credencial está incluído. Veja `.gitignore` para a lista completa de arquivos excluídos.

---

*Desenvolvido por Rafael Leão — Uso privado e demonstração de portfólio.*
