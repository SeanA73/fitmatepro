-- Fix plan_limits: migration 20260827000000 was recorded as applied but its
-- data changes did not persist. Re-apply the intended values:
--   Free:    ai_interactions_per_day  3 → 7
--   Premium: remove stale unlimited daily row, add 150/month

UPDATE public.plan_limits
SET limit_value = 7
WHERE plan_type = 'free' AND feature_name = 'ai_interactions_per_day';

DELETE FROM public.plan_limits
WHERE plan_type = 'premium' AND feature_name = 'ai_interactions_per_day';

INSERT INTO public.plan_limits (plan_type, feature_name, limit_value, limit_period)
SELECT 'premium', 'ai_interactions_per_month', 150, 'monthly'
WHERE NOT EXISTS (
  SELECT 1 FROM public.plan_limits
  WHERE plan_type = 'premium' AND feature_name = 'ai_interactions_per_month'
);

-- Fix check_usage_limit and increment_usage: the PL/pgSQL variable
-- `period_start` collided with the usage_tracking column of the same name,
-- causing Postgres error 42702 ("column reference is ambiguous") on every
-- call. Both functions were completely non-functional — free-tier limits were
-- never enforced and usage was never recorded. Renamed the variable to
-- v_period_start.

CREATE OR REPLACE FUNCTION public.check_usage_limit(
  user_uuid UUID,
  feature TEXT,
  period TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_plan TEXT;
  limit_value INTEGER;
  current_usage INTEGER;
  v_period_start TIMESTAMP WITH TIME ZONE;
BEGIN
  user_plan := public.get_user_plan(user_uuid);

  SELECT pl.limit_value INTO limit_value
  FROM public.plan_limits pl
  WHERE pl.plan_type = user_plan
    AND pl.feature_name = feature;

  -- NULL limit (or no matching row) means unlimited.
  IF limit_value IS NULL THEN
    RETURN TRUE;
  END IF;

  CASE period
    WHEN 'daily' THEN
      v_period_start := date_trunc('day', NOW());
    WHEN 'weekly' THEN
      v_period_start := date_trunc('week', NOW());
    WHEN 'monthly' THEN
      v_period_start := date_trunc('month', NOW());
    ELSE
      v_period_start := NOW() - INTERVAL '1 day';
  END CASE;

  SELECT COALESCE(SUM(ut.usage_count), 0) INTO current_usage
  FROM public.usage_tracking ut
  WHERE ut.user_id = user_uuid
    AND ut.feature_type = feature
    AND ut.period_start >= v_period_start;

  RETURN current_usage < limit_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_usage(
  user_uuid UUID,
  feature TEXT,
  period TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
BEGIN
  CASE period
    WHEN 'daily' THEN
      v_period_start := date_trunc('day', NOW());
    WHEN 'weekly' THEN
      v_period_start := date_trunc('week', NOW());
    WHEN 'monthly' THEN
      v_period_start := date_trunc('month', NOW());
    ELSE
      v_period_start := NOW();
  END CASE;

  INSERT INTO public.usage_tracking (user_id, feature_type, usage_count, reset_period, period_start)
  VALUES (user_uuid, feature, 1, period, v_period_start)
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET
    usage_count = usage_tracking.usage_count + 1,
    last_reset = NOW();
END;
$$;
