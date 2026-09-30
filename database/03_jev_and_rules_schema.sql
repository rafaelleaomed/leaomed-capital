-- ==============================================================================
-- DATABASE SCHEMA: Fase 5 (Regras no PostgreSQL, Jev TypeSafe & Auditoria)
-- ==============================================================================

-- 1. Regras de Categorização Persistidas no Banco (Migração do LocalStorage)
CREATE TABLE IF NOT EXISTS public.category_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern VARCHAR(255) NOT NULL,
    match_type VARCHAR(20) DEFAULT 'contains' CHECK (match_type IN ('exact', 'contains', 'starts_with', 'regex')),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    subdivision VARCHAR(100),
    entity_type VARCHAR(2) DEFAULT 'PF' CHECK (entity_type IN ('PF', 'PJ')),
    always_apply BOOLEAN DEFAULT TRUE,
    hit_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_rule_pattern UNIQUE (user_id, pattern, entity_type)
);

-- 2. Enriquecimento da Tabela de Transações (Idempotente)
ALTER TABLE public.transactions
    ADD COLUMN IF NOT EXISTS decision_type VARCHAR(20) DEFAULT 'unclassified'
        CHECK (decision_type IN ('deterministic', 'probabilistic', 'manual', 'unclassified')),
    ADD COLUMN IF NOT EXISTS certainty_label VARCHAR(50),
    ADD COLUMN IF NOT EXISTS category_source VARCHAR(20) DEFAULT 'unknown' 
        CHECK (category_source IN ('manual', 'local_rule', 'jev', 'llm', 'imported', 'unknown')),
    ADD COLUMN IF NOT EXISTS subcategory_source VARCHAR(20) DEFAULT 'unknown',
    ADD COLUMN IF NOT EXISTS category_confidence NUMERIC(4, 3), -- Reservado para Choice/Score do Jev
    ADD COLUMN IF NOT EXISTS subcategory_confidence NUMERIC(4, 3), -- Reservado para Choice/Score do Jev
    ADD COLUMN IF NOT EXISTS ai_is_fixed_probability NUMERIC(4, 3), -- Reservado para Noul do Jev
    ADD COLUMN IF NOT EXISTS ai_needs_review_probability NUMERIC(4, 3), -- Reservado para Noul do Jev
    ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ai_model VARCHAR(50),
    ADD COLUMN IF NOT EXISTS ai_question_version VARCHAR(20),
    ADD COLUMN IF NOT EXISTS categorization_status VARCHAR(20) DEFAULT 'pending'
        CHECK (categorization_status IN ('pending', 'suggested', 'confirmed', 'auto_applied', 'needs_review', 'rejected', 'error')),
    ADD COLUMN IF NOT EXISTS ai_suggested_category TEXT,
    ADD COLUMN IF NOT EXISTS ai_suggested_subcategory TEXT,
    ADD COLUMN IF NOT EXISTS ai_suggested_is_fixed BOOLEAN,
    ADD COLUMN IF NOT EXISTS ai_review_required BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_reviewed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS ai_reviewed_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS categorization_error TEXT;

-- 3. Tabela de Auditoria de IA com Retenção & Privacidade de Logs
CREATE TABLE IF NOT EXISTS public.ai_categorization_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    input_hash VARCHAR(64) NOT NULL,
    sanitized_input JSONB, -- NULL quando STORE_AI_INPUTS=false
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    question_version VARCHAR(20) NOT NULL,
    output_json JSONB NOT NULL,
    category_suggestion TEXT,
    subcategory_suggestion TEXT,
    choice_confidence NUMERIC(4, 3),
    is_fixed_probability NUMERIC(4, 3),
    needs_review_probability NUMERIC(4, 3),
    review_required BOOLEAN DEFAULT FALSE,
    final_category TEXT,
    final_subcategory TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- 4. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_category_rules_user ON public.category_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cat_status ON public.transactions(categorization_status);
CREATE INDEX IF NOT EXISTS idx_transactions_review_req ON public.transactions(ai_review_required);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_hash ON public.ai_categorization_logs(user_id, input_hash);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_categorization_logs(created_at);
