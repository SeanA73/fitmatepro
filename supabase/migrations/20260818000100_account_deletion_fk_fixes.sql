-- =============================================================================
-- FK fixes required for atomic account deletion
-- =============================================================================
-- Account deletion is implemented as a SINGLE `DELETE FROM auth.users` and lets
-- Postgres cascade. That is a deliberate choice over issuing fourteen sequential
-- DELETE statements from the edge function: one statement is one transaction, so
-- it either removes everything or removes nothing. Fourteen round trips can fail
-- on the eighth and leave an account half-deleted, which is precisely the
-- outcome a privacy policy promising "immediate and complete" cannot survive.
--
-- Two foreign keys stood in the way. Both are corrected here.
--
-- 1. affiliate_clicks.user_id was ON DELETE SET NULL.
--
--    The cascade would have left every click row in place with user_id set to
--    NULL — and those rows carry user_agent (the full navigator.userAgent
--    string, a browser fingerprint), referrer_page, session_id and clicked_at.
--    A fingerprint plus a timestamped browsing trail is not anonymous, so
--    "complete deletion" would have been false. CASCADE deletes them.
--
--    Note the contrast with revenue_events, which stays SET NULL deliberately:
--    that row holds an amount and a currency and no device or behavioural data,
--    and it must be retained for Australian tax purposes. Severing the link is
--    the right answer there and the wrong answer here.
--
-- 2. workout_sessions.workout_plan_id had no ON DELETE action, i.e. NO ACTION.
--
--    NO ACTION is checked at the end of the statement, so the cascade would
--    most likely have succeeded — both the plans and the sessions referencing
--    them are children of the same profiles row and go in the same statement.
--    "Most likely" is not a basis for a deletion guarantee, so the ambiguity is
--    removed rather than reasoned about.
--
--    This also fixes a live bug unrelated to deletion: with NO ACTION, the
--    deletePlan path in src/hooks/useWorkoutPlans.tsx raises a foreign key
--    violation whenever the user has ever logged a session from that plan, so
--    any plan you have actually used cannot be deleted. SET NULL (not CASCADE)
--    is correct: deleting a plan should not erase the history of workouts you
--    genuinely performed.
-- =============================================================================

-- 1. affiliate_clicks.user_id -> CASCADE
ALTER TABLE public.affiliate_clicks
    DROP CONSTRAINT IF EXISTS affiliate_clicks_user_id_fkey;

ALTER TABLE public.affiliate_clicks
    ADD CONSTRAINT affiliate_clicks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. workout_sessions.workout_plan_id -> SET NULL
ALTER TABLE public.workout_sessions
    DROP CONSTRAINT IF EXISTS workout_sessions_workout_plan_id_fkey;

ALTER TABLE public.workout_sessions
    ADD CONSTRAINT workout_sessions_workout_plan_id_fkey
    FOREIGN KEY (workout_plan_id) REFERENCES public.workout_plans(id) ON DELETE SET NULL;
