-- Allow 'trialing' as a valid subscription status.
-- Stripe sets status='trialing' during free trial periods. Without this,
-- the webhook's upsert fails on checkout because the CHECK constraint
-- rejects 'trialing', breaking the entire subscription flow.
ALTER TABLE public.subscriptions DROP CONSTRAINT subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid'));
