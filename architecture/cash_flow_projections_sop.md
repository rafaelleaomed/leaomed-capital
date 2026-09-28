# Procedimento Operacional Padrão (SOP): Projeção de Fluxo de Caixa

Este documento estabelece as regras e o algoritmo para gerar projeções financeiras (Dashboard Payload), separando a lógica (Engine) da apresentação.

## 1. Responsabilidade (Separation of Concerns)
- **Engine (`financialEngine.ts` ou backend script):** Responsável pelos cálculos pesados, médias históricas, e lógica de previsão.
- **Payload (`dashboardData.ts` ou endpoints API):** Responsável pela formatação da apresentação em JSON padronizado para consumo pelo Frontend e pela IA.
- **Server Components:** Apenas realizam o *fetching* do Payload. NUNCA misturar cálculos de negócio nos componentes do Frontend.

## 2. Visão Consolidada vs. Separada (PF/PJ)
Todas as projeções e agregações devem ser calculadas isoladamente para cada escopo de visão:
- `Consolidado` (PF + PJ + Investimentos)
- `PF` (Pessoa Física isolada)
- `PJ` (Pessoa Jurídica isolada)

O sistema deve ter a capacidade de alternar o Payload instantaneamente de acordo com o filtro (Consolidado, PF ou PJ).

## 3. Algoritmo de Projeção (End Balance)
Para o saldo final projetado (`projected_end_balance`) de um mês em andamento, o Engine deve:
1. **Calcular o Saldo Atual:** Soma dos saldos de todas as contas aplicáveis.
2. **Identificar Entradas Futuras:** Receitas recorrentes previstas ainda não recebidas + média histórica de entradas não recorrentes (considerar dados passados com ressalva "dados insuficientes" caso menor que 3 meses).
3. **Identificar Saídas Futuras:**
   - Despesas Fixas (identificadas via `is_fixed_expense`) ainda não pagas no mês.
   - Projeção de Despesas Variáveis: Média de despesas variáveis por dia útil no histórico recente multiplicada pelos dias restantes do mês.
4. **Fórmula:** `Saldo Atual + Entradas Futuras - Saídas Futuras`

## 4. Cálculo do Safe Daily Spend
O `safe_daily_spend` indica quanto o usuário pode gastar diariamente sem comprometer as despesas fixas e a meta de investimento.
- **Disponível para Variável:** `Saldo Atual + Entradas Futuras - Despesas Fixas Pendentes - Available to Invest (Meta)`.
- **Fórmula:** `Max(0, Disponível para Variável) / Dias Restantes no Mês`.

## 5. Regra de Limite de Dados
Se houver menos de um ciclo mensal fechado, os campos `projections` e `safe_daily_spend` devem retornar valores nulos ou um aviso no Frontend ("Dados Insuficientes para Projeção"), em vez de extrapolar incorretamente a partir de amostras curtas.
