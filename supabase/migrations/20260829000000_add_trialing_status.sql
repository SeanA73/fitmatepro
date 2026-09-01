-- =============================================================================
-- add_trialing_status — ensure 'trialing' is in subscriptions.status CHECK
-- =============================================================================
-- Follow-up to 20260828000000. Both migrations produce the same constraint;
-- the second was applied to guarantee the change landed after the subscription
-- flow fixes on 2026-08-29.
-- =============================================================================

ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid'));
