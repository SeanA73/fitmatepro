-- =============================================================================
-- user_preferences: enforce one row per user
-- =============================================================================
-- 20260812000000_initial_schema.sql creates user_preferences with a surrogate
-- `id` PRIMARY KEY and a bare `user_id UUID REFERENCES profiles(id)` — nothing
-- prevents two preferences rows for the same user.  The handle_new_user()
-- trigger inserts one row per user, but a second INSERT (e.g. a retry, or a
-- direct SQL call) would silently create a duplicate that confuses every
-- downstream query.
--
-- A UNIQUE index on user_id closes that gap.  The application already assumes
-- at most one row per user (useAuth reads .maybeSingle()), so this makes the
-- database match the code.
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS user_preferences_user_id_key
    ON public.user_preferences (user_id);
