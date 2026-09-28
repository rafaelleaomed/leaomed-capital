import os
import sys
import psycopg2

sys.stdout.reconfigure(encoding='utf-8')

NEON_URI = "postgresql://neondb_owner:REDACTED_PASSWORD@ep-bold-shape-awxwzyxn-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require"

SCHEMA_SQL = """
-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Usuários (para suportar Auth sem dependência do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usuário padrão do Rafael
INSERT INTO public.users (id, email, name)
VALUES ('d8225585-6cf1-4dc7-ba96-724bc2bb7cc0', 'rafaelleaobh@gmail.com', 'Dr. Rafael Leão')
ON CONFLICT (id) DO NOTHING;

-- 1. Webhook Events
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_event_id VARCHAR NOT NULL UNIQUE,
    event_type VARCHAR NOT NULL,
    item_id VARCHAR NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Accounts (Vínculo PF/PJ e Rastreabilidade)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(2) NOT NULL CHECK (type IN ('PF', 'PJ')),
    pluggy_item_id VARCHAR NOT NULL,
    pluggy_account_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    institution VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Transactions (Fonte da Verdade e Deduplicação)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    raw_id VARCHAR NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency VARCHAR DEFAULT 'BRL',
    date DATE NOT NULL,
    competence_date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    is_fixed BOOLEAN DEFAULT FALSE,
    is_ignored BOOLEAN DEFAULT FALSE,
    hash VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Categorias e Subcategorias Oficiais (Taxonomia do Usuário)
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

-- 5. Projeção de Parcelamentos
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100) NOT NULL,
    total_installments INT NOT NULL,
    current_installment INT NOT NULL,
    installment_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Histórico Mensal da Planilha
CREATE TABLE IF NOT EXISTS public.monthly_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL,
    pj_gross_revenue NUMERIC(12, 2) DEFAULT 0,
    pj_taxes NUMERIC(12, 2) DEFAULT 0,
    pj_accounting_fee NUMERIC(12, 2) DEFAULT 0,
    pj_other_expenses NUMERIC(12, 2) DEFAULT 0,
    pj_net_profit NUMERIC(12, 2) DEFAULT 0,
    pj_prolabore_withdrawn NUMERIC(12, 2) DEFAULT 0,
    pf_total_income NUMERIC(12, 2) DEFAULT 0,
    pf_total_expenses NUMERIC(12, 2) DEFAULT 0,
    pf_fixed_expenses NUMERIC(12, 2) DEFAULT 0,
    pf_variable_expenses NUMERIC(12, 2) DEFAULT 0,
    pf_invested_amount NUMERIC(12, 2) DEFAULT 0,
    pf_net_savings NUMERIC(12, 2) DEFAULT 0,
    categories_breakdown JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_month UNIQUE (user_id, month_year)
);

-- 7. Metas e Posições de Investimentos
CREATE TABLE IF NOT EXISTS public.investment_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    asset_class VARCHAR(50) NOT NULL,
    target_percentage NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_asset_class UNIQUE (user_id, asset_class)
);

CREATE TABLE IF NOT EXISTS public.investment_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    asset_class VARCHAR(50) NOT NULL,
    current_value NUMERIC(12, 2) DEFAULT 0,
    profitability_monthly NUMERIC(6, 2) DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_current_position UNIQUE (user_id, asset_class)
);

-- 8. Cache de Inteligência Artificial
CREATE TABLE IF NOT EXISTS public.ai_insights_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash TEXT UNIQUE NOT NULL,
    input JSONB NOT NULL,
    output JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
"""

def run_migration():
    print("🔌 Conectando ao Neon Serverless Postgres...")
    conn = psycopg2.connect(NEON_URI)
    conn.autocommit = True
    cursor = conn.cursor()

    print("🚀 Executando criação de tabelas e schemas...")
    cursor.execute(SCHEMA_SQL)
    print("✅ Todas as 8 tabelas criadas no Neon com sucesso!")

    # Inserir metas de investimentos
    print("📊 Inserindo metas de balanceamento da planilha...")
    targets = [
        ('Ações', 10.0), ('CDB', 15.0), ('LCI / LCA', 10.0),
        ('Tesouro Selic', 15.0), ('Tesouro IPCA', 10.0), ('Poupança', 5.0),
        ('Fundos Imobiliários', 5.0), ('Fundo DI', 5.0), ('Ações no Exterior', 5.0),
        ('Ouro', 5.0), ('Dólar', 5.0), ('Criptomoedas', 5.0), ('Previdência Privada', 5.0)
    ]
    for asset, pct in targets:
        cursor.execute("""
            INSERT INTO public.investment_targets (user_id, asset_class, target_percentage)
            VALUES ('d8225585-6cf1-4dc7-ba96-724bc2bb7cc0', %s, %s)
            ON CONFLICT (user_id, asset_class) DO UPDATE SET target_percentage = EXCLUDED.target_percentage;
        """, (asset, pct))

    print("✅ Metas de investimentos cadastradas!")

    # Inserir posições atuais
    positions = [
        ('Criptomoedas', 13608.07), ('Debêntures', 7788.62),
        ('Tesouro IPCA', 3935.19), ('Ações no Exterior', 3508.67),
        ('Ações', 937.35)
    ]
    for asset, val in positions:
        cursor.execute("""
            INSERT INTO public.investment_positions (user_id, asset_class, current_value)
            VALUES ('d8225585-6cf1-4dc7-ba96-724bc2bb7cc0', %s, %s)
            ON CONFLICT (user_id, asset_class) DO UPDATE SET current_value = EXCLUDED.current_value;
        """, (asset, val))

    print("✅ Posições atuais de investimentos cadastradas!")

    cursor.close()
    conn.close()
    print("🎉 Migração completa para o Neon Postgres concluída com sucesso!")

if __name__ == '__main__':
    run_migration()
