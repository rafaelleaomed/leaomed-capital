-- ==============================================================================
-- DATABASE SCHEMA: Fase 4 (Taxonomia Real, Histórico, Parcelas e Investimentos)
-- ==============================================================================

-- 1. Categorias e Subcategorias Oficiais (Taxonomia do Usuário)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    scope VARCHAR(10) NOT NULL DEFAULT 'PF' CHECK (scope IN ('PF', 'PJ', 'AMBOS')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_category_name_scope UNIQUE (name, scope)
);

CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    is_fixed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_subcategory_per_category UNIQUE (category_id, name)
);

-- 2. Tabela de Projeção de Parcelamentos (T-Cross, Eletrônicos, Imóveis)
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    total_installments INT NOT NULL,
    current_installment INT NOT NULL,
    installment_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'C6 Carbon', 'Financiamento', 'Itaú', etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Histórico Mensal Consolidado (Migração da Planilha Dezembro/25 a Julho/26+)
CREATE TABLE IF NOT EXISTS public.monthly_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Formato 'YYYY-MM'
    
    -- Módulo PJ (Inter PJ)
    pj_gross_revenue NUMERIC(12, 2) DEFAULT 0,
    pj_taxes NUMERIC(12, 2) DEFAULT 0,
    pj_accounting_fee NUMERIC(12, 2) DEFAULT 0,
    pj_other_expenses NUMERIC(12, 2) DEFAULT 0,
    pj_net_profit NUMERIC(12, 2) DEFAULT 0,
    pj_prolabore_withdrawn NUMERIC(12, 2) DEFAULT 0,
    
    -- Módulo PF
    pf_total_income NUMERIC(12, 2) DEFAULT 0,
    pf_total_expenses NUMERIC(12, 2) DEFAULT 0,
    pf_fixed_expenses NUMERIC(12, 2) DEFAULT 0,
    pf_variable_expenses NUMERIC(12, 2) DEFAULT 0,
    pf_invested_amount NUMERIC(12, 2) DEFAULT 0,
    pf_net_savings NUMERIC(12, 2) DEFAULT 0,
    
    -- Detalhe por categorias principais em JSONB
    categories_breakdown JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_month UNIQUE (user_id, month_year)
);

-- 4. Balanceamento de Metas de Investimentos (Otimizador de Aportes)
CREATE TABLE IF NOT EXISTS public.investment_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_class VARCHAR(50) NOT NULL, -- 'Ações', 'CDB', 'Tesouro Selic', 'Cripto', etc.
    target_percentage NUMERIC(5, 2) NOT NULL, -- Ex: 15.00 para 15%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_asset_class UNIQUE (user_id, asset_class)
);

-- 5. Posições Atuais de Investimentos (Sincronizado via Print/MyProfit)
CREATE TABLE IF NOT EXISTS public.investment_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_class VARCHAR(50) NOT NULL,
    current_value NUMERIC(12, 2) DEFAULT 0,
    profitability_monthly NUMERIC(6, 2) DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_current_position UNIQUE (user_id, asset_class)
);

-- 6. Cache de Processamento de IA (Faturas C6 / Prints)
CREATE TABLE IF NOT EXISTS public.ai_document_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'C6_FATURA_PDF', 'MOBILLS_PRINT', 'MYPROFIT_EXCEL', 'INVESTIDOR10_PRINT'
    period_reference VARCHAR(7) NOT NULL,
    raw_hash VARCHAR(64) UNIQUE NOT NULL,
    extracted_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_installments_user ON public.installments(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_monthly_history_user ON public.monthly_history(user_id, month_year);
