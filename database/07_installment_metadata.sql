-- Optional, additive migration. Review/apply to the financial DB independently.
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS contract_notes TEXT;
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS is_perpetual BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.installments ADD COLUMN IF NOT EXISTS entity_type VARCHAR(2) NOT NULL DEFAULT 'PF' CHECK (entity_type IN ('PF', 'PJ'));
