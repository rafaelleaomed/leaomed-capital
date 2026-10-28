-- Migração: adiciona campo investidor10_wallet_id na tabela public.users
-- Executar uma única vez no banco de dados Neon/Postgres do projeto.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS investidor10_wallet_id TEXT;

-- Comentário explicativo da coluna
COMMENT ON COLUMN public.users.investidor10_wallet_id IS
  'ID numérico da carteira pública do Investidor10 do usuário. Isolado por user_id — cada usuário vê apenas seus próprios dados.';
