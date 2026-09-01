-- =============================================================================
-- update_ai_chat_limits — adjust AI coaching interaction limits
-- =============================================================================
-- Applied remotely on 2026-08-27 as part of the AI coach chat feature
-- deployment. The plan_limits rows for ai_interactions_per_day remain at
-- 3/day for free and NULL (unlimited) for premium.
--
-- NOTE: The exact SQL for this migration was reconstructed from schema
-- inspection. If the original did more than this, it was a no-op on the
-- data that persists today.
-- =============================================================================

-- Ensure the free tier AI interaction limit is recorded.
-- (The initial schema already seeds this; this is a safety upsert.)
INSERT INTO public.plan_limits (plan_type, feature_name, limit_value, limit_period)
VALUES ('free', 'ai_interactions_per_day', 3, 'daily')
ON CONFLICT DO NOTHING;
