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
TYPESAFE_API_KEY=your_typesafe_api_key_here
TYPESAFE_API_ENDPOINT=https://api.typesafe.ai/v1/systemone
TYPESAFE_MODEL=jev-latest
JEV_PLATFORM_OWNER_EMAIL=rafaelleaobh@gmail.com
JEV_PLATFORM_OWNER_USER_ID=
JEV_CREDENTIAL_ENCRYPTION_KEY=BASE64_32_BYTE_KEY

# Configurações de Governança
ENABLE_JEV_CATEGORIZATION=true
NEXT_PUBLIC_SHADOW_MODE=true
STORE_AI_INPUTS=false
AI_LOG_RETENTION_DAYS=90
```

## 6. Acesso por conta e BYOK

- A chave global da plataforma é resolvida somente no servidor e apenas quando o usuário autenticado corresponde ao e-mail proprietário configurado e, quando informado, ao UUID proprietário.
- Demais usuários não recebem nem reutilizam a chave global. Eles podem registrar uma chave própria em **Minha Conta → IA / Jev**.
- Chaves pessoais são validadas com uma chamada sintética, cifradas com AES-256-GCM e AAD vinculado ao `user_id`; a interface recebe somente estado de disponibilidade.
- Sem uma chave própria válida, o Jev fica desabilitado automaticamente e nenhuma requisição é enviada ao TypeSafe.
- A rota de leitura de faturas envia somente rótulos estruturais, contagens e marcadores de exclusão de blocos ambíguos. Não envia PDF, texto bruto, nomes, datas, valores, cartões ou senhas.

## 7. Rotação e publicação do código

Nunca versione uma chave real. Use placeholders nos exemplos, mantenha `.env*` fora do Git e rotacione uma credencial caso ela apareça em um commit, log ou documento. Antes de abrir o repositório ao público, purge o segredo do histórico remoto ou publique um repositório novo sem esse histórico.

---

## 8. Como Executar o Benchmark e Testes

Para rodar a suíte de testes de integridade e o benchmark de 105 transações:

```bash
# Executar Testes
npx tsx tests/categorization.test.ts

# Executar Benchmark
npx tsx scripts/benchmark_categorizer.ts
```
