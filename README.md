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

### 2. Controle Tributário e Despesas Fixas PJ (Alíquota Efetiva)
- **Segregação de Impostos Médicos:** Acompanhamento rigoroso de guias tributárias (Simples Nacional / DAS, ISSQN, IRPJ/CSLL) e honorários contábeis.
- **Cálculo da Alíquota Efetiva:** Exibição da carga tributária real em percentual sobre o faturamento bruto PJ, com alternância para incluir ou excluir custos contábeis.
- **Histórico Mensal de Impostos:** Comparativo mês a mês da evolução dos encargos da pessoa jurídica.

### 3. Categorização Inteligente com Memória de Regras & Sugestão Preditiva
- **IA Preditiva & Heurística Médica:** Sugere a categoria e subcategoria exata para cada lançamento ao importar faturas de cartões ou extratos bancários.
- **Aprendizado de Máquina Contínuo:** Opção de memorizar *"Sempre categorizar lançamentos contendo '[Nome]' nesta categoria"* (ex: McDonald's em Alimentação, DARF em Impostos PJ, Drogaria em Saúde).
- **Zero Trabalho Repetitivo:** Em faturas futuras, o sistema detecta os padrões e aplica as regras automaticamente.

### 4. Extrato Item a Item, Seleção Múltipla & Categorização em Lote
- **Auditoria Granular:** Aba dedicada na planilha com extrato completo transação por transação (data, estabelecimento, conta/cartão, categoria e valor).
- **Seleção em Massa:** Checkboxes individuais e botão de "Selecionar todos os pendentes" para aplicar categoria e subcategoria a dezenas de itens em lote com 1 clique.
- **Edição & Exclusão Individual:** Possibilidade de editar valor, data e descrição ou excluir qualquer lançamento individual com confirmação de segurança.
- **Prevenção Antiduplicação (Cartão vs Conta):** Detecta e remove duplicidades quando o débito da fatura integral na conta concorre com os lançamentos individuais do cartão (conforme Seção 2 do `GEMINI.md`).

### 5. Alerta de Transações Não Categorizadas / Pendentes
- **Banner de Conciliação Ativa:** Alerta visual instantâneo destacando despesas que ainda não possuem categoria ou subcategoria vinculada.
- **Filtro Rápido de Pendências:** 1 clique para isolar apenas os itens sem classificação e resolver em segundos.

### 6. Subdivisão Nível 3 (Detalhamento por Hospital / Unidade)
- **Granularidade Médica Avançada:** Em subcategorias como *Transporte > Estacionamento* ou *Alimentação em Serviço*, é possível discriminar a unidade específica (ex: Hospital Madre Teresa, Mater Dei, Vila da Serra, IPSEMG).
- **Relatório por Unidade:** Rastreabilidade exata do custo operacional em cada centro de atuação médica.

### 7. Aporte & Resgate Vinculados Inteligentes
- **Conexão Direta com Carteira:** Ao categorizar um lançamento como *Aplicação em Investimento* ou *Resgate*, o sistema abre um fluxo assistido para vincular diretamente o ativo da carteira patrimonial (Renda Fixa, FIIs, Ações Nacionais, Stocks/BDRs, Cripto).
- **Sincronização Patrimonial:** O aporte ou resgate atualiza o saldo e a alocação de ativos em tempo real.

### 8. Gestão Dinâmica de Cartões de Crédito
- **Adição de Novos Cartões:** Modal completo para cadastrar novos cartões de crédito (bandeira, banco emissor, limite total, limite disponível, dia de fechamento e dia de vencimento).
- **Edição e Manutenção:** Ajuste ágil de limites, inclusão e exclusão de cartões adicionais, personalização de apelidos e cores visuais do cartão.
- **Controle de Faturas Reais:** Monitoramento fiel das faturas de PF sem inventar cartões inexistentes na PJ.

### 9. Navegação Temporal Dinâmica Mês a Mês (Estilo Mobills)
- Seletor de mês/ano com setas rápidas e modal de calendário completo (Dezembro/25 a Dezembro/26).
- **Recálculo instantâneo:** Receitas brutas, despesas totais, fatura de cartão de crédito, saldo líquido, gráficos Donut e distribuição de picos diários se adaptam dinamicamente ao mês selecionado.

### 10. Consolidado Anual com Gráficos Evolutivos
- Aba executiva com a evolução financeira acumulada de todo o exercício.
- Gráficos comparativos de faturamento bruto vs. despesas totais vs. faturas de cartão vs. resultado líquido mês a mês.

### 11. Edição e Exclusão Inline na Planilha Oficial
- **Edição Clicável:** Qualquer subcategoria de despesa ou receita pode ser clicada para editar valor monetário, nome ou classificação (fixa/obrigatória vs. variável).
- **Exclusão de Inconsistências:** Botão de lixeira rápida e opção de exclusão com confirmação em duas etapas no modal.
- **Persistência Reativa:** Recálculo instantâneo da categoria pai, custos fixos e projeção de reserva.

### 12. Simulador do Teto Diário Seguro & Meta de Aporte (10% Padrão)
- **Engenharia de Saúde Financeira:** Responde à pergunta central: *"Quanto posso gastar hoje sem comprometer minhas contas fixas e meus investimentos?"*.
- **Fórmula Matemática Contábil:**
  $$\text{Teto Diário Seguro} = \frac{\text{Faturamento} - \text{Custos Fixos Blindados} - \text{Meta de Novos Aportes}}{\text{Dias Restantes ou Ciclo Total}}$$
- **Simulador Interativo (`DailySpendModal`):**
  - Slider de percentual de aporte mensal (0% a 40%, com presets de 5%, 10%, 15%, 20%).
  - Demonstração em cascata transparente: Faturamento (-) Custos Fixos (-) Meta de Aportes (=) Orçamento Livre (÷) Dias (=) Teto Seguro Diário.
  - Alternância entre dias restantes do mês ou ciclo cheio de 30 dias.

### 13. Calculadora de Reserva de Emergência Sugerida (6 a 12x Custo Fixo)
- **Sincronização Automática:** Campo de custo fixo mensal alimentado diretamente pelo somatório das despesas obrigatórias da planilha.
- **Perfis Médicos Estruturados:**
  - **10 Meses (Recomendado):** Médico autônomo, plantonista e consultório particular.
  - **12 Meses (Blindagem Total):** Clínica médica própria / PJ com folha e insumos.
  - **8 Meses:** CLT / Contratos longos.
  - **6 Meses:** Servidor público concursado.
- Diagnóstico em tempo real com barra de progresso, déficit patrimonial e meses cobertos.

### 14. Central Multicanal de Ingestão de Dados (Drag & Drop Múltiplo)
- **Arrastar e Soltar Múltiplo:** Suporte a upload simultâneo de vários arquivos (PDFs de faturas de meses ou cartões distintos, planilhas Excel `.xlsx` ou extratos `.csv`).
- **Pré-visualização & Parsing:** Validação de faturas, identificação do emissor (Itaú, Pessoa Jurídica, C6, Nubank, XP) e conciliação bancária assistida.

### 15. Lançamento Rápido Manual (Header & Botão Flutuante FAB)
- Modal acessível pelo botão executivo no topo ou pelo FAB flutuante no canto inferior direito.
- Registro de despesas e receitas com seleção de conta de origem, PF/PJ e tipo de gasto:
  - **À Vista / Pontual**
  - **Despesa Fixa / Obrigatória**
  - **Parcelada:** Seletor de 2x a 48x com cálculo em tempo real do valor da parcela mensal e data da 1ª parcela.

### 16. Rebalanceamento Estratégico de Carteira (13 Ativos Multi-Mercado)
- Alocação estratégica: **Ações (25%)**, **Internacional (25%)**, **Caixa (30%)**, **Real Estate/FIIs (15%)** e **Criptoativos (5%)**.
- Isolamento contábil da **Reserva de Emergência** (não afeta o perfil de risco de investimento).
- Motor de cálculo de superávit/déficit para direcionar novos aportes.

### 17. Previsibilidade de Parcelamentos & Alívio de Caixa
- Monitoramento de parcelas de financiamentos e contratos de longo prazo (veículos, equipamentos médicos, reformas).
- Linha do tempo de descompressão financeira ao longo dos meses.

### 18. Mini Registro de Conta & Perfil do Usuário
- Modal acessível ao clicar no nome/avatar do usuário no topo da tela:
  - Alteração de nome completo de exibição.
  - Atualização de e-mail cadastrado.
  - Atualização e troca segura de senha (com confirmação e validação de requisitos de força).
  - Gestão de contas bancárias vinculadas (adicionar nova conta ou remover contas antigas).

### 19. Menu Lateral Fixo & Responsivo
- Menu de navegação fixo à esquerda, sempre visível para alternância rápida entre abas e painéis sem perda de contexto ou rolagem excessiva.

---

## 🔌 Status das Integrações & Limitações Conhecidas

Para total transparência arquitetural e operacional, segue o quadro de prontidão das integrações externas:

| Funcionalidade / Integração | Status Atual | Detalhamento Operacional |
|---|---|---|
| **Gestão Orçamentária & Planilha Interativa** | 🟢 **100% Operacional** | Edição inline, cálculo de custos fixos/variáveis, segregação PF/PJ e alíquota de impostos ativa. |
| **Extrato Granular & Seleção em Lote** | 🟢 **100% Operacional** | Auditoria item a item, categorização em lote com memória de regras e antiduplicação de fatura/conta. |
| **Gestão de Cartões de Crédito** | 🟢 **100% Operacional** | Cadastro de cartões, alteração de limites, cartões adicionais e monitoramento de faturas reais. |
| **Investimentos & Aportes Vinculados** | 🟢 **100% Operacional** | Rebalanceamento de 13 ativos, calculadora de reserva de emergência e fluxo de vínculo direto com transações. |
| **Autenticação & Controle de Sessão** | 🟢 **100% Operacional** | Supabase Auth com SSR cookies HTTP-Only, rota de cadastro e modal de perfil/troca de senha. |
| **Banco de Dados Relacional** | 🟢 **100% Operacional** | Neon Serverless PostgreSQL com pooling de conexões e queries parametrizadas. |
| **API Open Finance (Pluggy)** | 🟡 **Arquitetura Pronta (Aguardando Chaves de Produção)** | A infraestrutura completa de Route Handlers (`/api/connect-token`), Webhooks idempotentes (`/api/webhooks/pluggy`) e Worker de sincronização (`tools/sync_worker.py`) está codificada e pronta. No entanto, **a sincronização automática de contas via Open Finance não opera em tempo real no deploy público**, pois exige credenciais bancárias ativas da Pluggy em ambiente de produção (contrato comercial de Open Finance). O sistema opera no momento via conciliação por extratos/faturas (CSV/XLSX/PDF) e lançamentos auditados. |
| **OCR Automático de Boletos PJ** | 🟡 **Em Desenvolvimento / Ingestão Assistida** | A extração automática de dados de boletos bancários via OCR (Gemini Vision / AWS Textract) está em fase de modelagem de serviço; atualmente o controle de tributos PJ é realizado via conciliação assistida e lançamento direto. |

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

- ✅ **Zero Secrets no Código Ativo**: Nenhuma chave, credencial ou string de conexão ativa versionada. Variáveis injetadas via `.env.local` e ambiente seguro de produção na Vercel.
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
