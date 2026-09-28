# Mobile Hosting & Budget Breakdown (Obrigatórias vs Não Obrigatórias) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Disponibilizar o frontend na nuvem/web pública para acesso imediato via celular e construir a visão hierárquica completa da planilha original dividida entre Despesas Obrigatórias e Não Obrigatórias com todas as categorias e subcategorias.

**Architecture:** 
1. Criar o componente `BudgetBreakdown.tsx` com accordion/drill-down hierárquico (Obrigatórias vs Não Obrigatórias ➔ Categorias ➔ Subcategorias) integrado aos dados históricos e mensais do `historical_summary.json`.
2. Otimizar a viewport e layout mobile no `DashboardLayout.tsx` e `DashboardUI.tsx` para exibição perfeita em smartphones.
3. Hospedar e disponibilizar URL pública HTTPS (via Vercel CLI e túnel instantâneo) para acesso imediato pelo celular do usuário.

**Tech Stack:** Next.js 15, TypeScript, TailwindCSS v3.4, Lucide Icons, Vercel / Cloudflare Tunnel / LocalTunnel.

---

### Task 1: Componente de Visão Orçamentária Completa (Obrigatórias vs Não Obrigatórias)

**Files:**
- Create: `components/dashboard/BudgetBreakdown.tsx`
- Modify: `components/DashboardUI.tsx`

**Step 1: Implementar o componente `BudgetBreakdown.tsx`**
Criar interface com abas ou seções para:
- Total Despesas Obrigatórias (Transporte, Casa, Saúde, Financiamento, Pets, Impostos, etc.) com suas subcategorias e valores.
- Total Despesas Não Obrigatórias (Assinaturas, Compras, Lazer, Restaurantes, Viagem) com suas subcategorias e valores.
- Seletor de mês de competência (Dez/25 a Jul/26).

**Step 2: Integrar em `components/DashboardUI.tsx`**
Posicionar o `BudgetBreakdown` com destaque logo abaixo dos SummaryCards, tornando-se o coração do painel.

---

### Task 2: Responsividade Mobile Extrema (Mobile-First Polish)

**Files:**
- Modify: `app/dashboard/layout.tsx`
- Modify: `components/DashboardUI.tsx`
- Modify: `components/dashboard/SummaryCards.tsx`

**Step 1: Otimizar menus e grids para telas de 360px a 420px (smartphones)**
- Garantir que a sidebar recolha em drawer/menu hambúrguer ou botões compactos no topo.
- Ajustar tamanhos de fonte e paddings para evitar quebras horizontais no celular.

---

### Task 3: Hospedagem e Disponibilização Pública para Acesso Mobile

**Files:**
- Command: Iniciar túnel público HTTPS imediato (ex: LocalTunnel / Cloudflare)
- Command: Deploy na Vercel para link definitivo de portfólio

**Step 1: Iniciar túnel público seguro com URL HTTPS**
Executar o túnel na porta 3000 do Next.js e obter a URL pública para o usuário abrir no celular no mesmo instante.

**Step 2: Configurar deploy no Vercel (se credenciais presentes) ou fornecer passo a passo de 1 clique**

---

### Task 4: Verificação e Validação

**Step 1: Testar visualmente a hierarquia das categorias**
Confirmar que todas as categorias da planilha (Alimentação, Casa, Pets, Saúde, Financiamento, Assinaturas, Compras, Lazer, Restaurantes, Viagem) aparecem com seus valores reais de Junho/26.

**Step 2: Testar acessibilidade via link externo no celular**
Validar status code 200 e renderização completa dos cards e tabelas.
