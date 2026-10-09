-- ==============================================================================
-- Optional per-user TypeSafe/Jev credentials
--
-- Ciphertext is written only by authenticated server routes. Direct client access
-- is denied by RLS; the plaintext key is never selected or returned to a browser.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_jev_credentials (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    api_key_ciphertext TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    encryption_tag TEXT NOT NULL,
    key_fingerprint CHAR(64) NOT NULL,
    key_version SMALLINT NOT NULL DEFAULT 1 CHECK (key_version > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_jev_credentials ENABLE ROW LEVEL SECURITY;

-- No RLS policies are intentionally created. Browsers cannot read or mutate the
-- encrypted material; server routes use the service database connection.

CREATE INDEX IF NOT EXISTS idx_user_jev_credentials_updated_at
    ON public.user_jev_credentials(updated_at DESC);
