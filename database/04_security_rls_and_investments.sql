-- ==============================================================================
-- DATABASE SCHEMA: Fase 6 (Segurança RLS, Ativos de Investimentos & Despesas Obrigatórias)
-- ==============================================================================

-- 1. Criação Oficial da Tabela de Ativos Individuais de Investimento
CREATE TABLE IF NOT EXISTS public.investment_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    broker VARCHAR(50) NOT NULL,
    quantity NUMERIC(16, 4) DEFAULT 0,
    avg_price NUMERIC(12, 2) DEFAULT 0,
    current_price NUMERIC(12, 2) DEFAULT 0,
    total_invested NUMERIC(14, 2) NOT NULL DEFAULT 0,
    current_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
    profit_loss NUMERIC(14, 2) NOT NULL DEFAULT 0,
    profit_loss_pct NUMERIC(8, 2) NOT NULL DEFAULT 0,
    operation VARCHAR(20) DEFAULT 'Comprado',
    is_emergency_reserve BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Suporte a Despesas Obrigatórias vs Não-Obrigatórias
ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS is_obligatory BOOLEAN DEFAULT FALSE;

ALTER TABLE public.subcategories
    ADD COLUMN IF NOT EXISTS is_obligatory BOOLEAN DEFAULT FALSE;

-- 3. Habilitação de ROW LEVEL SECURITY (RLS) em Todas as Tabelas de Negócio
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_document_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_categorization_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Isolamento por Usuário (RLS: USING e WITH CHECK)

-- Accounts
DROP POLICY IF EXISTS "accounts_user_isolation" ON public.accounts;
CREATE POLICY "accounts_user_isolation" ON public.accounts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Transactions
DROP POLICY IF EXISTS "transactions_user_isolation" ON public.transactions;
CREATE POLICY "transactions_user_isolation" ON public.transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Installments
DROP POLICY IF EXISTS "installments_user_isolation" ON public.installments;
CREATE POLICY "installments_user_isolation" ON public.installments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Monthly History
DROP POLICY IF EXISTS "monthly_history_user_isolation" ON public.monthly_history;
CREATE POLICY "monthly_history_user_isolation" ON public.monthly_history
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Investment Targets
DROP POLICY IF EXISTS "investment_targets_user_isolation" ON public.investment_targets;
CREATE POLICY "investment_targets_user_isolation" ON public.investment_targets
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Investment Positions
DROP POLICY IF EXISTS "investment_positions_user_isolation" ON public.investment_positions;
CREATE POLICY "investment_positions_user_isolation" ON public.investment_positions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Investment Assets
DROP POLICY IF EXISTS "investment_assets_user_isolation" ON public.investment_assets;
CREATE POLICY "investment_assets_user_isolation" ON public.investment_assets
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Category Rules
DROP POLICY IF EXISTS "category_rules_user_isolation" ON public.category_rules;
CREATE POLICY "category_rules_user_isolation" ON public.category_rules
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- AI Document Logs
DROP POLICY IF EXISTS "ai_document_logs_user_isolation" ON public.ai_document_logs;
CREATE POLICY "ai_document_logs_user_isolation" ON public.ai_document_logs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- AI Categorization Logs
DROP POLICY IF EXISTS "ai_categorization_logs_user_isolation" ON public.ai_categorization_logs;
CREATE POLICY "ai_categorization_logs_user_isolation" ON public.ai_categorization_logs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_investment_assets_user ON public.investment_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
