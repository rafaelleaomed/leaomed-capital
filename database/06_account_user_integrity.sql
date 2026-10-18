-- Optional defense in depth. Apply after deploying server ownership checks.
-- This script performs no data reassignment and enables no additional RLS.
-- NOT VALID preserves existing rows and enforces ownership for new/updated rows.
-- Review existing mismatches by count before separately validating the constraint.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS accounts_id_user_id_key
    ON public.accounts (id, user_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'transactions_account_user_fk'
          AND conrelid = 'public.transactions'::regclass
    ) THEN
        ALTER TABLE public.transactions
            ADD CONSTRAINT transactions_account_user_fk
            FOREIGN KEY (account_id, user_id)
            REFERENCES public.accounts (id, user_id)
            ON DELETE CASCADE
            NOT VALID;
    END IF;
END $$;

COMMIT;

-- Run separately by an authorized operator; expose counts only:
-- SELECT COUNT(*) AS ownership_mismatches
-- FROM public.transactions t
-- JOIN public.accounts a ON a.id = t.account_id
-- WHERE t.user_id IS DISTINCT FROM a.user_id;
-- After independently resolving mismatches, validate in a maintenance window:
-- ALTER TABLE public.transactions VALIDATE CONSTRAINT transactions_account_user_fk;
