-- Fix get_user_plan to recognize trialing subscriptions as premium.
-- Previously only status='active' was checked, so Stripe trial subscriptions
-- (status='trialing') were treated as free tier.
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT plan_type FROM public.subscriptions
     WHERE user_id = user_uuid AND status IN ('active', 'trialing')
     ORDER BY created_at DESC LIMIT 1),
    'free'
  );
$$;
