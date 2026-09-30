# 🦁 Documentação de Governança: Categorização Inteligente com Jev (TypeSafe AI)

## 1. Escopo e Limites Operacionais do Jev

O **Jev** (TypeSafe AI) foi integrado à plataforma **LeãoMed Capital** exclusivamente como um **classificador e roteador semântico estruturado de apoio**.

### ⚠️ O que o Jev NÃO É e NÃO FAZ:
1. **NÃO é um consultor financeiro:** Não fornece conselhos de investimento, não recomenda compra/venda de ativos e não substitui a prudência do usuário.
2. **NÃO toma decisões de investimento ou alocação:** Não define metas de carteira (Tesouro, FIIs, Ações, Cripto).
3. **NÃO calcula valores monetários:** Não calcula teto diário, reserva de emergência ou alíquotas tributárias efetivas (responsabilidade exclusiva do `financialEngine.ts`).
4. **NÃO substitui o controle do usuário:** A categorização manual e as regras salvas pelo usuário sempre prevalecem de forma absoluta sobre qualquer sugestão da IA.
5. **NÃO executa auto-aplicação em dados sensíveis:** Lançamentos de impostos, aportes, resgates, transferências, faturas de cartão e pró-labore são bloqueados de auto-apply.

---

## 2. Arquitetura em Cascata (5 Níveis de Decisão)

O fluxo de categorização avalia cada lançamento sequencialmente:

```
[1. Regra Exata (Postgres)] 
       ↓ (Se não houver match)
[2. Regra Memorizada por Substring (Postgres)] 
       ↓ (Se não houver match)
[3. Heurística Local Médica/Comercial] 
       ↓ (Se não houver match)
[4. Jev TypeSafe AI (Modo Sombra)] 
       ↓ (Se confiança < 0.70 ou ambíguo)
[5. Revisão Manual Obrigatória (needs_review)]
```

### Distinção Estrita de Métricas:
- **Regras Locais / Heurísticas:** `decision_type = 'deterministic'`, `certainty_label = 'regra local exata' | 'regra memorizada' | 'heurística local'`.
- **Jev (TypeSafe AI):** `decision_type = 'probabilistic'`, com métricas separadas:
  - **Primitiva Choice:** `choice_confidence` (0.00 a 1.00).
  - **Primitiva Noul (Despesa Fixa):** `is_fixed_probability` (0.00 a 1.00).
  - **Primitiva Noul (Necessidade de Revisão):** `needs_review_probability` (0.00 a 1.00).

---

## 3. Modo Sombra (Shadow Mode)

O sistema opera por padrão em **Modo Sombra** (`SHADOW_MODE=true`):
- O Jev avalia lançamentos não categorizados e gera sugestões em `ai_suggested_category` e `ai_suggested_subcategory`.
- **Nenhuma transação tem sua categoria oficial alterada automaticamente.**
- Na interface, o usuário visualiza o badge com a sugestão e o nível de confiança, podendo aceitar, rejeitar ou transformar em regra com 1 clique.
- A autoaplicação para categorias de baixo risco só é ativada após validação de benchmark com pelo menos 100 transações.

---

## 4. Privacidade e Sanitização de PII (Zero-Leak)

Nenhum dado pessoal sensível é transmitido para o Jev:
- **Sanitização Prévia:** CPFs, números de cartão e tokens são expurgados antes da chamada HTTP.
- **Contexto Mínimo:** Apenas a descrição limpa, valor, data e escopo (PF/PJ) são enviados.
- **Governança de Logs:**
  - `STORE_AI_INPUTS=false`: Apenas o hash SHA-256 do lançamento é armazenado para auditoria e cache.
  - `AI_LOG_RETENTION_DAYS=90`: Retenção configurável de logs de auditoria.

---

## 5. Variáveis de Ambiente & Configuração

```env
# TypeSafe AI (Jev) - Apenas Server-Side
TYPESAFE_API_KEY=apikey_224462dee28596dd4c26b8b3d1a1c635f12f_c7674dd6df5eba95f4e05e544266e6f3e698a14b36f239d581126e22bdb52c79
TYPESAFE_API_ENDPOINT=https://api.typesafe.ai/v1/systemone
TYPESAFE_MODEL=jev-latest

# Configurações de Governança
ENABLE_JEV_CATEGORIZATION=true
NEXT_PUBLIC_SHADOW_MODE=true
STORE_AI_INPUTS=false
AI_LOG_RETENTION_DAYS=90
```

---

## 6. Como Executar o Benchmark e Testes

Para rodar a suíte de testes de integridade e o benchmark de 105 transações:

```bash
# Executar Testes
npx tsx tests/categorization.test.ts

# Executar Benchmark
npx tsx scripts/benchmark_categorizer.ts
```
