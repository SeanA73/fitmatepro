-- Update AI chat limits:
--   Free:    3/day  → 7/day
--   Premium: unlimited → 150/month

-- Free tier: 3 → 7 daily
UPDATE public.plan_limits
SET limit_value = 7
WHERE plan_type = 'free' AND feature_name = 'ai_interactions_per_day';

-- Premium tier: remove old unlimited daily row, insert monthly limit
DELETE FROM public.plan_limits
WHERE plan_type = 'premium' AND feature_name = 'ai_interactions_per_day';

INSERT INTO public.plan_limits (plan_type, feature_name, limit_value, limit_period)
VALUES ('premium', 'ai_interactions_per_month', 150, 'monthly');
