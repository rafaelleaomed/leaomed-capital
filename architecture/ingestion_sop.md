# Procedimento Operacional Padrão (SOP): Ingestão de Dados e Deduplicação

Este documento estabelece as regras obrigatórias para a ingestão de transações da API (Pluggy) para o Banco de Dados (PostgreSQL).

## 1. Regra do Sinal de Valores (Amount)
O sistema deve padronizar obrigatoriamente a direção do fluxo financeiro:
- **Despesas (Saídas):** Valores Negativos (`< 0`)
- **Receitas (Entradas):** Valores Positivos (`> 0`)

*Importante:* A Pluggy geralmente traz despesas como negativo, mas toda integração nova deve ser validada contra essa regra.

## 2. Normalização de Descrição (Description)
A descrição bruta (`description`) muitas vezes contém ruídos que impedem a categorização ou geram variação indesejada para o cálculo de recorrência e hash.

A string `clean_description` deve ser gerada seguindo as regras, na exata ordem:
1. **Lowercase:** Transformar tudo para caixa baixa.
2. **Remover Números:** Retirar toda pontuação de número (ex: `123`, datas no nome, parcelas `01/12`).
3. **Remover Caracteres Especiais:** Remover `*`, `-`, `/`, e espaços duplos.
4. **Trim:** Remover espaços em branco nas extremidades.

*Exemplo:* `IFOOD *123` -> `ifood`.

## 3. Geração do Hash Único (Deduplicação)
Para evitar que a mesma transação seja inserida duas vezes em caso de mudança de `raw_id` pela Pluggy, o sistema gera um `hash` único determinístico.

**Fórmula de Entrada do Hash:**
`hash_string = {account_id}_{date.strftime('%Y-%m-%d')}_{abs(amount)}_{clean_description}`

**Geração:**
Aplicar `MD5` (ou similar) na `hash_string`.

## 4. Atualização de Competência
Para despesas de cartão de crédito:
- A `date` será a data da transação real.
- A `competence_date` será o mês da fatura (ou seja, o mês em que a despesa impacta efetivamente o fluxo de caixa).
- Para débito/Pix, `date` e `competence_date` geralmente coincidem.

## 5. Idempotência do Webhook
- O Webhook deve gravar o payload recebido na tabela `webhook_events`.
- A chave de idempotência (`external_event_id`) deve garantir que o mesmo evento da Pluggy não crie múltiplos registros na fila, sendo ignorado (ou atualizado) caso já exista.
