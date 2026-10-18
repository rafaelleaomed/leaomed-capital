# Project Constitution (gemini.md)

## 1. Data Schemas

### 1.1 Input: Raw Transaction (Pluggy/Belvo)
```json
{
  "raw_id": "string",
  "account_id": "string",
  "amount": "number",
  "date": "YYYY-MM-DD",
  "description": "string",
  "type": "CREDIT | DEBIT",
  "status": "PENDING | POSTED",
  "provider": "PLUGGY | BELVO"
}
```

### 1.2 Core: Processed Transaction
```json
{
  "transaction_id": "string",
  "raw_id": "string",
  "entity_type": "PF | PJ",
  "amount": "number",
  "date": "YYYY-MM-DD",
  "description": "string",
  "category": "string",
  "subcategory": "string",
  "is_fixed_expense": "boolean",
  "is_ignored": "boolean",
  "created_at": "timestamp"
}
```

### 1.3 Output: Delivery Payload (Dashboard & IA)
```json
{
  "period": "YYYY-MM",
  "balances": {
    "consolidated": "number",
    "pf": "number",
    "pj": "number",
    "investments": "number"
  },
  "cash_flow": {
    "total_income": "number",
    "total_expenses": "number",
    "fixed_expenses": "number",
    "variable_expenses": "number"
  },
  "categories": [
    {
      "name": "string",
      "total": "number",
      "percentage": "number"
    }
  ],
  "investments_detail": {
    "total_value": "number",
    "by_class": [
      {
        "class": "renda_fixa | renda_variavel | fundos | cripto",
        "value": "number",
        "percentage": "number"
      }
    ],
    "profitability": "number"
  },
  "projections": {
    "projected_end_balance": "number",
    "safe_daily_spend": "number",
    "available_to_invest": "number"
  },
  "alerts": [
    {
      "type": "warning | danger | opportunity",
      "message": "string",
      "impact": "high | medium | low"
    }
  ]
}
```

## 2. Behavioral Rules

### Funcionais
- **Reconciliação e Deduplicação (Crítico):** O sistema deve criar um mecanismo robusto de deduplicação usando hashes únicos por transação baseados em: valor, data e similaridade de descrição (para evitar duplicação entre lançamentos de conta, cartões e Open Finance).
- **Separar** rigorosamente PF e PJ no banco, unindo apenas na visão consolidada (Dashboard).
- Priorizar categorização automática baseada em regras; aprender com correções do usuário.

### Cálculo e Lógica
- Despesas fixas devem ser identificadas automaticamente por recorrência.
- Projeções devem considerar o histórico de gastos e padrões mensais.
- Sempre calcular: saldo projetado e capacidade de investimento ao final do período.

### Interface (UX) e IA
- IA atua como **consultor financeiro**: Respostas baseadas em dados reais, objetivas e diretas (sem linguagem genérica).
- Mostrar apenas métricas acionáveis e simples.
- Sugerir melhorias financeiras proativamente.
- Utilizar **shadcn/ui** como base dos componentes, com customização via **TailwindCSS**.
- O dashboard deve iniciar com **visão consolidada** (PF + PJ + investimentos), com filtro global para alternar entre Consolidado, PF e PJ.

### O que o sistema NÃO deve fazer
- NÃO exigir input manual constante (foco em automação total).
- NÃO misturar dados PF e PJ sem clara distinção de contexto.
- NÃO apresentar dados crus sem análise.
- NÃO gerar projeções se não houver base histórica mínima (informar "dados insuficientes").
- NÃO misturar o cálculo de regras de negócio (financial engine) com a formatação de apresentação (payload). Devem ser separados (ex: `financialEngine.ts` vs `dashboardData.ts`).

## 3. Architectural Invariants
- **A.N.T. 3-Layer Architecture**:
  - `Layer 1 (Architecture)`: SOPs em Markdown definindo regras.
  - `Layer 2 (Navigation)`: LLM roteando chamadas e tomando decisões probabilísticas baseadas no Payload.
  - `Layer 3 (Tools)`: Scripts Python locais (determinísticos e atômicos).
- **Fonte da Verdade**: Após ingestão e sanitização, o PostgreSQL é a fonte primária de dados. Planilhas de backup/setup não sobrescrevem transações já confirmadas no DB.
- **Workflow Intermediário**: Todos os dados temporários ou payloads em processamento devem passar pela pasta `.tmp/` e nunca poluir o ambiente persistente.

## 4. Maintenance Log
*(A ser preenchido após os primeiros deploys e atualizações de ferramentas)*
