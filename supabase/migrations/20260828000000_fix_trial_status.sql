-- =============================================================================
-- fix_trial_status — add 'trialing' to subscriptions.status CHECK
-- =============================================================================
-- The initial schema only allowed ('active', 'canceled', 'past_due', 'unpaid').
-- Stripe sends 'trialing' for subscriptions in their trial period, so the
-- webhook would fail to insert rows for trial users.  This adds the missing
-- status value.
-- =============================================================================

ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid'));
