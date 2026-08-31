# FitMatePro — Project Context for Qwen AI

## What is FitMatePro
A fitness coaching web app with AI chat. Built with Vite + React + Supabase. Deployed on a VPS (IP: 72.60.42.216). The site serves from `/var/www/fitmatepro/` (static frontend build). Source code lives at `/root/fmp-src/`.

## Tech Stack
- **Frontend:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Edge Functions, RLS)
- **AI Chat:** Qwen (qwen-turbo) via Alibaba Cloud DashScope API (Singapore region, Workspace ID: 1100475)
- **Payments:** Stripe (live mode)
- **Supabase Project:** `atfdumplvyhwcptybrt` (Oceania/Sydney region)
- **Supabase CLI:** installed at `/usr/bin/supabase`, linked to project from `/root/fmp-src/`

## Infrastructure
- VPS: 72.60.42.216
- Frontend deployed to: `/var/www/fitmatepro/` (built from `/root/fmp-src/dist/`)
- Source code: `/root/fmp-src/`
- Supabase CLI project link: `/root/fmp-src/supabase/.temp/linked-project.json`
- **NOTE:** This VPS has a DNS issue — it cannot resolve `*.supabase.co` domains. You cannot curl/wget Supabase URLs from this server. Use `supabase` CLI commands instead (they work fine).

## Edge Functions (all deployed and ACTIVE)
| Function | Purpose | Auth |
|----------|---------|------|
| `ai-coach-chat` | AI fitness chat via Qwen/DashScope | `--no-verify-jwt` |
| `create-checkout-session` | Creates Stripe Checkout sessions | JWT verified |
| `stripe-webhook` | Handles Stripe webhook events | `--no-verify-jwt` |
| `cancel-subscription` | Cancels Stripe subscription at period end | JWT verified |

Source: `/root/fmp-src/supabase/functions/<name>/index.ts`

## Supabase Secrets (all set)
- `STRIPE_SECRET_KEY` — live key (`sk_live_...`)
- `STRIPE_WEBHOOK_SECRET` — (`whsec_...`)
- `STRIPE_PRICE_PREMIUM_MONTHLY` — `price_1U9LtSLmd6PEYPgZzutuafZG`
- `STRIPE_PRICE_PREMIUM_ANNUAL` — `price_1U9LtSLmd6PEYPgZHCXWDAZg`
- `DASHSCOPE_API_KEY` — Qwen API key
- `DASHSCOPE_WORKSPACE_ID` — `1100475`

## Stripe Configuration
- **Mode:** LIVE
- **Webhook destination name:** `energetic-legacy` (ID: `we_1U9uAjLmd6PEYPgZiut09pjk`)
- **Webhook URL:** `https://atfdumplvyhwcptybrt.supabase.co/functions/v1/stripe-webhook`
- **Events listened to:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- **API version on webhook:** `2025-05-28.basil`
- **Products:** FitMatePro Premium — $4.99/mo or $47.99/yr, both with 7-day free trial

## Database Schema (key tables)
- `profiles` — user profiles, has `subscription_plan` column (CHECK: 'free','premium')
- `subscriptions` — Stripe subscription records. Status CHECK constraint: `('active', 'trialing', 'canceled', 'past_due', 'unpaid')` (fixed on 2026-08-29 to include 'trialing')
- `usage_tracking` — feature usage metering
- `plan_limits` — per-plan feature limits
- `revenue_events` — payment tracking

## Key RPC Functions
- `get_user_plan(user_uuid)` — returns 'free' or 'premium' based on subscriptions with status IN ('active', 'trialing')
- `check_usage_limit(user_uuid, feature, period)` — checks if user can use a feature
- `increment_usage(user_uuid, feature, period)` — increments usage counter

## Frontend Subscription Flow
1. User clicks "Start Free Trial" on `PricingSection.tsx`
2. `useSubscription.createCheckoutSession()` calls `create-checkout-session` edge function with `priceId` = `price_premium_monthly` or `price_premium_annual`
3. Edge function creates Stripe Checkout session with 7-day trial, redirects user to Stripe
4. After payment, Stripe redirects to `/checkout/success?session_id=...`
5. Stripe sends `checkout.session.completed` webhook → `stripe-webhook` function upserts subscription record + updates `profiles.subscription_plan` to 'premium'
6. Frontend `useSubscription` hook queries `subscriptions` table with `.in('status', ['active', 'trialing'])` to determine plan

## Key Frontend Files
- `/root/fmp-src/src/hooks/useSubscription.tsx` — subscription hook (checkout, cancel, usage)
- `/root/fmp-src/src/components/subscription/PricingSection.tsx` — pricing UI
- `/root/fmp-src/src/components/subscription/SubscriptionSettings.tsx` — manage/cancel subscription
- `/root/fmp-src/src/components/subscription/UpgradePrompt.tsx` — gated feature prompt
- `/root/fmp-src/src/pages/CheckoutSuccess.tsx` — post-checkout success page
- `/root/fmp-src/src/pages/CheckoutCancel.tsx` — cancelled checkout page

## What Was Done (2026-08-28 to 2026-08-29)
1. Fixed trial users not recognized — `useSubscription.tsx` now queries `.in('status', ['active', 'trialing'])`
2. Fixed placeholder Stripe price IDs — replaced with real IDs via env vars
3. Fixed wrong success URL — `create-checkout-session` redirects to `/checkout/success`
4. Created `cancel-subscription` edge function (cancel at period end)
5. Fixed CheckoutSuccess page copy — "unlimited access" → "premium access"
6. Deployed all 4 edge functions
7. Set all Stripe secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PREMIUM_MONTHLY`, `STRIPE_PRICE_PREMIUM_ANNUAL`)
8. Created Stripe webhook destination in dashboard
9. Fixed database CHECK constraint to include `'trialing'` status (migration `20260829000000`)

## CURRENT BUG — Webhook Not Updating Subscription (2026-08-29)
**Problem:** User completed a real Stripe Checkout payment (live mode, 7-day trial). Stripe redirected to `/checkout/success`. But the app still shows the user as FREE (7 daily coach messages used, upgrade prompt shown). The webhook did not update the subscription in the database.

**Suspected cause:** Stripe webhook API version mismatch. The webhook destination is configured with API version `2025-05-28.basil` but the edge function uses Stripe SDK v14.21.0 which expects API version `2023-10-16`. This may cause signature verification to fail silently.

**Not yet verified:** Check Stripe Dashboard → Webhooks → Event deliveries to see if events are failing (non-200 response).

**Possible fixes:**
1. Change the webhook destination API version in Stripe Dashboard to match the SDK (`2023-10-16`)
2. OR upgrade the Stripe SDK in the edge function to match `2025-05-28.basil`
3. Check if the webhook signature verification is actually failing

## Useful Commands
```bash
# List deployed functions
cd /root/fmp-src && supabase functions list

# List secrets
cd /root/fmp-src && supabase secrets list

# Set a secret
cd /root/fmp-src && supabase secrets set KEY=value

# Deploy a function
cd /root/fmp-src && supabase functions deploy <name>
cd /root/fmp-src && supabase functions deploy <name> --no-verify-jwt

# Push database migrations
cd /root/fmp-src && supabase db push --yes

# Check migration status
cd /root/fmp-src && supabase migration list --linked

# Rebuild frontend
cd /root/fmp-src && npm run build
# Then copy to deploy dir:
cp -r /root/fmp-src/dist/* /var/www/fitmatepro/
```

## Decisions Made
- Tier name is "Premium" (not "Pro")
- 7-day free trial on all Premium subscriptions
- Using Qwen/DashScope for AI (cheapest option, ~$0.00003/message)
- Do NOT use Lovable platform — user rejected it, prefers direct API integrations
- Do NOT check API credit/balance levels — user manages their own billing
