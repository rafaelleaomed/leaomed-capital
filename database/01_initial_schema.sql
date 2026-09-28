-- ==============================================================================
-- DATABASE SCHEMA: Fase 3 (Architect)
-- ==============================================================================

-- 1. Webhook Events (Fila Assíncrona e Idempotência)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_event_id VARCHAR NOT NULL, -- Para controle de idempotência do webhook
    event_type VARCHAR NOT NULL,        -- ex: 'item/created', 'item/updated'
    item_id VARCHAR NOT NULL,           -- ID do item na Pluggy
    payload JSONB NOT NULL,
    status VARCHAR DEFAULT 'pending',   -- 'pending', 'processing', 'completed', 'error'
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT webhook_events_external_event_id_key UNIQUE (external_event_id)
);

-- 2. Accounts (Vínculo PF/PJ e Rastreabilidade)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(2) NOT NULL CHECK (type IN ('PF', 'PJ')),
    pluggy_item_id VARCHAR NOT NULL,
    pluggy_account_id VARCHAR UNIQUE NOT NULL, -- ID original da conta dentro da instituição na Pluggy
    name VARCHAR NOT NULL,
    institution VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Transactions (Fonte da Verdade e Deduplicação)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_id VARCHAR NOT NULL, -- ID original da transação na Pluggy
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency VARCHAR DEFAULT 'BRL',
    date DATE NOT NULL,
    competence_date DATE NOT NULL, -- Para análise mensal (podendo diferir da date de pagamento)
    description TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    is_fixed BOOLEAN DEFAULT FALSE, -- Preenchido automaticamente para assinaturas/recorrência
    is_ignored BOOLEAN DEFAULT FALSE,
    hash VARCHAR NOT NULL, -- UNIQUE para evitar duplicação em syncs sucessivos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT transactions_hash_key UNIQUE (hash),
    CONSTRAINT unique_raw_per_account UNIQUE (account_id, raw_id)
);

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE E CONSULTAS COMUNS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_webhook_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON public.transactions(account_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_competence ON public.transactions(competence_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_competence ON public.transactions(user_id, competence_date);
