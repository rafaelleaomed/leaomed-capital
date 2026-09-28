# Procedimento Operacional Padrão (SOP): Categorização e Recorrência

Este documento estabelece as regras para a classificação automática das transações em categorias e para a detecção de despesas fixas (recorrência).

## 1. Separação PF e PJ
A separação não é baseada em categorias, mas sim na tabela `accounts` (tipo de conta).
- As regras de categorização abaixo se aplicam igualmente para PF e PJ, mas a análise e dashboard irão segregar os dados usando `account_id -> accounts.type`.

## 2. Categorização Automática por Regra (MVP)
A base de categorias é estruturada em `category` e `subcategory`.
O script Python (`tools/sync_worker.py`) utilizará uma lista de substrings na `clean_description` para mapear categorias padrão.

**Matriz Inicial de Categorias:**
- **Alimentação:**
  - `Mercado`: contém "supermercado", "carrefour", "pao de acucar", "atacadao".
  - `Delivery`: contém "ifood", "rappi", "uber eats".
  - `Restaurante`: contém "restaurante", "padaria", "mcdonalds", "bk".
- **Transporte:**
  - `Aplicativo`: contém "uber", "99", "cabify".
  - `Combustível`: contém "posto", "ipiranga", "shell", "petrobras".
- **Moradia:**
  - `Contas Fixas`: contém "light", "enel", "sabesp", "copasa", "vivo", "claro", "tim".
  - `Aluguel/Condomínio`: contém "condominio", "quintoandar".
- **Saúde:**
  - `Farmácia`: contém "farmacia", "drogasil", "droga raia", "pacheco".
  - `Plano/Convênio`: contém "amil", "unimed", "sulamerica", "bradesco saude".
- **Educação:**
  - `Mensalidade/Cursos`: contém "faculdade", "udemy", "alura", "escola".
- **Investimentos:**
  - `Aportes`: contém "xp", "rico", "clear", "nu invest", "avenue", "btg".
- **Receitas:**
  - `Salário/Pró-labore`: contém "salario", "pro labore", "adiantamento".
  - `Rendimentos`: contém "rendimento", "juros", "dividendos".

*Regra:* Se não houver correspondência, classificar como `category = 'Outros'`, `subcategory = 'Não Identificado'`.

## 3. Detecção de Despesas Fixas (Recorrência)
Para alimentar a projeção, despesas que ocorrem regularmente devem ter `is_fixed = TRUE`.

**Algoritmo Determinístico de Detecção:**
Para cada nova despesa inserida:
1. Buscar o histórico de transações nos últimos 3 meses para a mesma conta (`account_id`), com a mesma `clean_description`.
2. **Critério 1 (Mensalidade exata):** Se a `clean_description` bate 100% e o valor tem uma variação menor que 5% nos últimos 2 meses.
3. **Critério 2 (Contas de Consumo):** Se a `clean_description` pertence a `Moradia > Contas Fixas` (luz, água, internet), é automaticamente marcada como `is_fixed = TRUE`, independentemente da variação de valor.
4. **Critério 3 (Assinaturas Globais):** Se a descrição contiver palavras-chave exclusivas de assinatura (ex: "netflix", "spotify", "amazon prime", "gympass", "smartfit"), marcar `is_fixed = TRUE`.

## 4. Evolução com IA (Próximas Fases)
Numa fase futura (A.N.T. Layer 2), as transações classificadas como `Outros` passarão por uma LLM em lote (batching) que inferirá a categoria baseada no contexto global do usuário e aprenderá através de feedback (correções manuais feitas pelo usuário no frontend).
