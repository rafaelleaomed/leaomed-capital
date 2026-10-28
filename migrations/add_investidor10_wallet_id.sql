-- Migração: adiciona campo investidor10_wallet_id na tabela public.users
-- Executar uma única vez no banco de dados Neon/Postgres do projeto.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS investidor10_wallet_id TEXT;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_investidor10_wallet_id_format;

ALTER TABLE public.users
  ADD CONSTRAINT users_investidor10_wallet_id_format
  CHECK (investidor10_wallet_id IS NULL OR investidor10_wallet_id ~ '^\d{5,15}$');

-- Comentário explicativo da coluna
COMMENT ON COLUMN public.users.investidor10_wallet_id IS
  'ID numérico da carteira restrita ou pública do Investidor10. Isolado por user_id.';
