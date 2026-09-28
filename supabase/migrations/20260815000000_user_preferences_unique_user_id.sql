-- user_preferences is 1:1 with profiles — the on_profile_created trigger seeds
-- exactly one row per profile, and src/pages/Index.tsx reads it with
-- .maybeSingle(), which errors outright if a user ever ends up with two rows.
-- That invariant was never enforced in the schema: user_id had a foreign key but
-- no unique constraint.
--
-- The visible symptom was onboarding. src/pages/Onboarding.tsx wrote its
-- completion flag with .upsert({ onConflict: 'user_id' }); Postgres validates the
-- ON CONFLICT target when it plans the statement, before RLS or any row is
-- touched, so every call failed with 42P10 ("there is no unique or exclusion
-- constraint matching the ON CONFLICT specification"). Onboarding could never be
-- completed. The client no longer upserts, but the invariant is worth enforcing
-- so the next writer cannot silently create a duplicate.

-- Collapse any pre-existing duplicates onto the oldest row per user before the
-- constraint is added. Expected to be a no-op: the only writer that could have
-- created duplicates is the upsert above, which never executed successfully.
DELETE FROM public.user_preferences a
USING public.user_preferences b
WHERE a.user_id IS NOT NULL
  AND a.user_id = b.user_id
  AND (a.created_at, a.id) > (b.created_at, b.id);

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);
