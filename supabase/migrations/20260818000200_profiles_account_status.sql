-- =============================================================================
-- profiles.account_status — pause an account without destroying it
-- =============================================================================
-- Deletion should not be the only exit. Most apps implement deletion badly
-- because it is the only option offered, so anyone who wants a break has to ask
-- for annihilation. A reversible pause absorbs most of that demand.
--
-- 'paused' hides the app and offers reactivation. It is NOT a soft delete: the
-- data is untouched and the user can undo it themselves at any time, which is
-- exactly why it must be presented as distinct from deletion rather than as a
-- gentler flavour of it.
-- =============================================================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_account_status_check;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_account_status_check
    CHECK (account_status IN ('active', 'paused'));

-- Required. 20260812000000_initial_schema.sql revoked table-level UPDATE on
-- profiles and re-granted it column by column, so a new column is NOT writable
-- by clients until it is named here. Without this grant the pause button would
-- fail silently for every user.
--
-- Self-service in both directions is the point: the user pauses and reactivates
-- without contacting anyone. Unlike subscription_plan there is no entitlement
-- at stake, so there is no reason to withhold the write.
GRANT UPDATE (account_status, paused_at) ON public.profiles TO authenticated;

-- Partial index: 'active' is the overwhelming majority and never needs looking
-- up by status, so only the paused rows are worth indexing.
CREATE INDEX IF NOT EXISTS idx_profiles_paused
    ON public.profiles (account_status)
    WHERE account_status = 'paused';
