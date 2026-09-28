-- =============================================================================
-- plan_limits: remove the group_classes_per_week rows
-- =============================================================================
-- 20260812000000_initial_schema.sql seeds three features per plan:
-- workouts_per_week, ai_interactions_per_day and group_classes_per_week. The
-- first two are real — check_usage_limit()/increment_usage() are called for them
-- from src/hooks/useSubscription.tsx. The third is not: nothing in the app
-- books, lists or counts a group class, no feature_type of that name is ever
-- written to usage_tracking, and no code path names it.
--
-- The rows are not inert. fetchUsageLimits() selects every plan_limits row for
-- the current plan and then issues a usage_tracking query per row, so each
-- session pays a round-trip to count usage of a feature that does not exist.
-- Worse, the row is a stored claim: anything that renders the returned
-- usageLimits array would tell a free user they get 2 group classes a week and
-- a premium user unlimited ones.
--
-- The applied migration is deliberately left untouched. If group classes are
-- ever built, re-seed the rows in the migration that adds the feature.
-- =============================================================================

DELETE FROM public.plan_limits
WHERE feature_name = 'group_classes_per_week';
