-- =============================================================================
-- FitMatePro — consolidated initial schema
-- =============================================================================
-- Squash of the 13 migrations now archived under supabase/migrations/_archive/.
-- Ordered by dependency, not by original filename. Safe to apply to a clean
-- database in a single pass.
--
-- Deliberate changes from the archived set (see also the notes at each site):
--   * profiles is created FIRST; the old 20240523000000_revamp_foundation.sql
--     sorted earliest but referenced profiles, which is why the set could not
--     apply to a fresh project.
--   * usage_tracking gains UNIQUE (user_id, feature_type, period_start), which
--     increment_usage()'s ON CONFLICT clause requires. Without it every call
--     raised 42P10.
--   * All seed INSERTs into profiles/subscriptions/user_roles/usage_tracking/
--     wellness_checkins/meals/user_goals are dropped. They violated the
--     activity_level CHECK, referenced a nonexistent `age` column, and had no
--     matching auth.users rows. Seeding is scripts/create-test-users.ts.
--   * The 'pro' tier is gone: subscriptions.plan_type and
--     profiles.subscription_plan are CHECK ('free','premium').
--   * ad_interactions, temporary_access and has_temporary_access() are removed
--     along with the reward-ad path.
--   * Ten tables and one view that no code in src/ references are not carried
--     forward: meal_plans, meal_plan_items, recipes, workout_logs,
--     exercise_logs, progress_reports, shopping_lists, biometric_data,
--     coaching_interactions, recommendation_generations, and the
--     active_product_recommendations view. user_notifications, user_roles and
--     workout_plans are kept (the last two are reached via the has_role() RPC
--     and a nested select respectively, not a direct query).
--   * revenue_events.user_id is ON DELETE SET NULL so deleting a user does not
--     fail on, or erase, their financial history.
--   * affiliate_products ships EMPTY. The old sample rows carried example.com
--     affiliate URLs with invented ratings and review counts that rendered to
--     users as real product data.
--   * RLS corrections: no client-writable subscriptions, WITH CHECK on every
--     UPDATE/ALL policy, usage_tracking is SELECT-only for clients, and no
--     WITH CHECK (true) INSERT policies.
--   * handle_updated_at() is dropped as a duplicate of
--     update_updated_at_column(); the profiles trigger uses the latter.
--
-- Writes to the entitlement tables (subscriptions, revenue_events) are
-- service-role only and must come from the Stripe webhook or another trusted
-- server context. Everything else a client writes is scoped to auth.uid().
-- =============================================================================


-- =============================================================================
-- SECTION 1 — Types and shared trigger functions
-- =============================================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- =============================================================================
-- SECTION 2 — profiles (root of nearly every FK below)
-- =============================================================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    height_cm INTEGER,
    weight_kg NUMERIC(5,2),
    activity_level TEXT,
    fitness_goals TEXT[] DEFAULT '{}',
    health_conditions TEXT[] DEFAULT '{}',
    subscription_plan TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT profiles_gender_check
        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say') OR gender IS NULL),
    CONSTRAINT profiles_activity_level_check
        CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active') OR activity_level IS NULL),
    CONSTRAINT profiles_height_check
        CHECK ((height_cm > 0 AND height_cm < 300) OR height_cm IS NULL),
    CONSTRAINT profiles_weight_check
        CHECK ((weight_kg > 0 AND weight_kg < 1000) OR weight_kg IS NULL),
    CONSTRAINT profiles_subscription_plan_check
        CHECK (subscription_plan IN ('free', 'premium'))
);

CREATE INDEX idx_profiles_activity_level ON public.profiles(activity_level);
CREATE INDEX idx_profiles_subscription_plan ON public.profiles(subscription_plan);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- WITH CHECK stops a user reassigning a row to another id. It does NOT stop
-- them writing their own subscription_plan column — that needs column
-- privileges, applied immediately below.
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Column-level lockdown of profiles.subscription_plan.
--
-- IMPORTANT: `REVOKE UPDATE (subscription_plan) ... FROM authenticated, anon`
-- on its own is a no-op here. Supabase grants these roles table-level UPDATE
-- on public tables, and per the Postgres REVOKE semantics a column-level
-- revoke cannot subtract from a table-level grant — the statement succeeds and
-- changes nothing. The effective form is to drop the table-level privilege and
-- then re-grant UPDATE on precisely the columns clients may write.
--
-- Column list = every field written by useAuth.updateProfile() from
-- src/pages/Profile.tsx:83 and src/pages/Onboarding.tsx:91, plus avatar_url.
-- Deliberately excluded: subscription_plan (entitlement), email (identity,
-- set once at insert), id, created_at, updated_at (trigger-maintained;
-- triggers do not require column privileges on the caller).
REVOKE UPDATE ON public.profiles FROM authenticated, anon;

GRANT UPDATE (
  full_name,
  avatar_url,
  date_of_birth,
  gender,
  height_cm,
  weight_kg,
  activity_level,
  fitness_goals,
  health_conditions
) ON public.profiles TO authenticated;

-- Belt and braces: harmless against the table-level revoke above, and it keeps
-- the intent greppable if someone later re-grants UPDATE on the whole table.
REVOKE UPDATE (subscription_plan) ON public.profiles FROM authenticated, anon;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- SECTION 3 — user_preferences (+ the new-profile trigger that populates it)
-- =============================================================================

CREATE TABLE public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    notification_settings JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    workout_reminders BOOLEAN DEFAULT true,
    meal_reminders BOOLEAN DEFAULT true,
    preferred_workout_times TIME[],
    metric_units BOOLEAN DEFAULT true,
    privacy_settings JSONB DEFAULT '{}',
    coach_communication_style TEXT DEFAULT 'encouraging'
        CHECK (coach_communication_style IN ('encouraging', 'direct', 'gentle', 'motivational')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- SECTION 4 — Workouts and meals (core logging)
-- =============================================================================

CREATE TABLE public.workout_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER,
    workout_type TEXT[],
    exercises JSONB NOT NULL,
    is_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout plans"
ON public.workout_plans
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_workout_plans_updated_at
    BEFORE UPDATE ON public.workout_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workout_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_plan_id UUID REFERENCES public.workout_plans(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false,
    exercises_completed JSONB,
    heart_rate_data JSONB,
    calories_burned INTEGER,
    perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout sessions"
ON public.workout_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    consumed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    description TEXT,
    total_calories INTEGER,
    macros JSONB,
    food_items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own meals"
ON public.meals
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON public.meals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- SECTION 5 — Wellness, goals, food reference data
-- =============================================================================

CREATE TABLE public.wellness_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
    notes TEXT,
    activities JSONB,
    checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.wellness_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wellness check-ins"
ON public.wellness_checkins
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals"
ON public.user_goals
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.food_database (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    serving_size TEXT,
    calories_per_serving INTEGER,
    macros JSONB,
    micronutrients JSONB,
    categories TEXT[],
    barcode TEXT UNIQUE,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food database is readable by all authenticated users"
ON public.food_database
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Reference data, not user data: kept.
INSERT INTO public.food_database (name, serving_size, calories_per_serving, macros, categories) VALUES
('Greek Yogurt', '1 cup (245g)', 130, '{"protein": 23, "carbs": 9, "fat": 0, "fiber": 0}', ARRAY['dairy', 'protein']),
('Banana', '1 medium (118g)', 105, '{"protein": 1, "carbs": 27, "fat": 0, "fiber": 3}', ARRAY['fruit']),
('Chicken Breast', '100g', 165, '{"protein": 31, "carbs": 0, "fat": 4, "fiber": 0}', ARRAY['protein', 'meat']),
('Brown Rice', '1 cup cooked (195g)', 216, '{"protein": 5, "carbs": 45, "fat": 2, "fiber": 4}', ARRAY['grain', 'carbs']),
('Spinach', '1 cup raw (30g)', 7, '{"protein": 1, "carbs": 1, "fat": 0, "fiber": 1}', ARRAY['vegetable', 'leafy-green']),
('Almonds', '1 oz (28g)', 164, '{"protein": 6, "carbs": 6, "fat": 14, "fiber": 4}', ARRAY['nuts', 'healthy-fat']),
('Avocado', '1 medium (150g)', 234, '{"protein": 3, "carbs": 12, "fat": 21, "fiber": 10}', ARRAY['fruit', 'healthy-fat']),
('Oatmeal', '1 cup cooked (234g)', 147, '{"protein": 6, "carbs": 25, "fat": 3, "fiber": 4}', ARRAY['grain', 'fiber']);


-- =============================================================================
-- SECTION 6 — Notifications
-- (all that remains of the old 20240523000000_revamp_foundation.sql; its other
--  seven tables were never referenced by the app and are not carried forward)
-- =============================================================================

CREATE TABLE public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL, -- 'workout_reminder', 'meal_time', 'streak', 'system', ...
  title TEXT NOT NULL,
  body TEXT NOT NULL,

  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

  action_url TEXT,
  action_text TEXT,
  action_data JSONB,

  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,

  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Rows are created server-side; clients read them and mark them read/clicked.
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- SECTION 7 — Subscriptions, usage metering, revenue
-- =============================================================================

CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- usage_tracking: the UNIQUE constraint below is what increment_usage()'s
-- ON CONFLICT target requires. Without it every call raises 42P10 and metering
-- silently never increments.
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- matches plan_limits.feature_name
  usage_count INTEGER DEFAULT 0,
  reset_period TEXT NOT NULL,  -- 'daily', 'weekly', 'monthly'
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT usage_tracking_user_feature_period_key
    UNIQUE (user_id, feature_type, period_start)
);

CREATE TABLE public.revenue_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'subscription_start', 'subscription_cancel', 'upgrade', ...
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  platform TEXT,             -- 'stripe', 'app_store', ...
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.plan_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  limit_value INTEGER, -- NULL means unlimited
  limit_period TEXT,   -- 'daily', 'weekly', 'monthly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (plan_type, feature_name)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- subscriptions: READ ONLY for clients. The old client UPDATE policy let any
-- user set their own plan_type to 'premium'. All writes now come from the
-- Stripe webhook using the service role key, which bypasses RLS.
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- usage_tracking: READ ONLY for clients. The old FOR ALL policy let users
-- delete or zero their own counters to reset free-tier limits. Writes go
-- through increment_usage(), which is SECURITY DEFINER.
CREATE POLICY "Users can view their own usage tracking"
ON public.usage_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own revenue events"
ON public.revenue_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Plan limits are readable by authenticated users"
ON public.plan_limits
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Two tiers only. NULL limit_value = unlimited.
INSERT INTO public.plan_limits (plan_type, feature_name, limit_value, limit_period) VALUES
('free',    'workouts_per_week',       3,    'weekly'),
('free',    'ai_interactions_per_day', 3,    'daily'),
('free',    'group_classes_per_week',  2,    'weekly'),
('premium', 'workouts_per_week',       NULL, NULL),
('premium', 'ai_interactions_per_day', NULL, NULL),
('premium', 'group_classes_per_week',  NULL, NULL);

CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT plan_type FROM public.subscriptions
     WHERE user_id = user_uuid AND status = 'active'
     ORDER BY created_at DESC LIMIT 1),
    'free'
  );
$$;

-- Temporary-access (reward ad) branch removed along with the ad path.
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

-- Mirrors subscriptions.plan_type onto profiles.subscription_plan for display
-- and admin listing. Never read this column for entitlement decisions.
CREATE OR REPLACE FUNCTION public.update_profile_subscription_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET subscription_plan = NEW.plan_type
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profile_plan_trigger
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_subscription_plan();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- SECTION 8 — Roles
-- =============================================================================

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- =============================================================================
-- SECTION 9 — Affiliate catalogue
-- =============================================================================

CREATE TABLE public.affiliate_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  price_cents INTEGER NOT NULL,
  original_price_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  affiliate_url TEXT NOT NULL,
  affiliate_network TEXT NOT NULL DEFAULT 'custom',
  commission_rate NUMERIC(5,2),
  image_url TEXT,
  additional_images JSONB DEFAULT '[]'::jsonb,
  brand TEXT,
  rating NUMERIC(3,2),
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  features JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_status TEXT DEFAULT 'in_stock',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.affiliate_products(id) ON DELETE CASCADE,
  session_id UUID,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  referrer_page TEXT,
  user_agent TEXT,
  converted BOOLEAN DEFAULT false,
  conversion_amount_cents INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_category_id UUID REFERENCES public.product_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
ON public.affiliate_products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Categories are viewable by everyone"
ON public.product_categories
FOR SELECT
USING (is_active = true);

-- Was: SELECT USING (auth.uid() = user_id OR user_id IS NULL), which exposed
-- every anonymous click row (user_agent, referrer) to every user.
CREATE POLICY "Users can view their own clicks"
ON public.affiliate_clicks
FOR SELECT
USING (auth.uid() = user_id);

-- Was: INSERT WITH CHECK (true), i.e. anyone could forge attribution rows for
-- any user. /shop is authenticated, so binding to auth.uid() is sufficient.
CREATE POLICY "Users can track their own clicks"
ON public.affiliate_clicks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_affiliate_products_updated_at
  BEFORE UPDATE ON public.affiliate_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Catalogue reference data, not user data: kept.
INSERT INTO public.product_categories (name, slug, description, icon, display_order) VALUES
  ('Fitness Equipment', 'fitness-equipment', 'Workout gear and exercise equipment', '🏋️', 1),
  ('Supplements', 'supplements', 'Nutritional supplements and vitamins', '💊', 2),
  ('Apparel', 'apparel', 'Workout clothes and activewear', '👕', 3),
  ('Accessories', 'accessories', 'Fitness accessories and gadgets', '⌚', 4),
  ('Recovery', 'recovery', 'Recovery and wellness products', '🧘', 5),
  ('Nutrition', 'nutrition', 'Healthy food and meal prep', '🥗', 6);

-- =============================================================================
-- SECTION 10 — Product recommendations
-- =============================================================================

CREATE TABLE public.product_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.affiliate_products(id) ON DELETE CASCADE,

  recommendation_reason TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  recommendation_context TEXT, -- 'workout_planning', 'post_workout', 'goal_based', ...

  user_workout_patterns JSONB DEFAULT '{}',
  user_goals_alignment JSONB DEFAULT '{}',
  user_preferences_match JSONB DEFAULT '{}',

  displayed_at TIMESTAMP WITH TIME ZONE,
  clicked BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,
  purchased BOOLEAN DEFAULT false,

  priority INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.recommendation_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES public.product_recommendations(id) ON DELETE CASCADE,

  feedback_type TEXT NOT NULL
    CHECK (feedback_type IN ('helpful', 'not_helpful', 'already_own', 'wrong_category', 'too_expensive', 'other')),
  feedback_text TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_product_recommendations_user_id ON public.product_recommendations(user_id);
CREATE INDEX idx_product_recommendations_product_id ON public.product_recommendations(product_id);
CREATE INDEX idx_product_recommendations_context ON public.product_recommendations(recommendation_context);
CREATE INDEX idx_product_recommendations_displayed ON public.product_recommendations(displayed_at DESC);
CREATE INDEX idx_product_recommendations_priority ON public.product_recommendations(priority DESC, display_order);

ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
ON public.product_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
ON public.product_recommendations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Was: "Service can insert recommendations" INSERT WITH CHECK (true), which
-- despite its name let any client write recommendations for ANY user_id.
-- Scoped to the caller instead, which keeps the existing client-side generator
-- in src/hooks/useProductRecommendations.tsx working while making cross-user
-- forgery impossible.
CREATE POLICY "Users can insert their own recommendations"
ON public.product_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own feedback"
ON public.recommendation_feedback
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_product_recommendations_updated_at
  BEFORE UPDATE ON public.product_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
