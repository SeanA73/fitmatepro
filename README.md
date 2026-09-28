# FitMatePro

Personal health and wellness coaching app — workout planning, nutrition tracking,
wellness check-ins, goal setting, and affiliate product recommendations.

**Live:** https://fitmatepro.com

## Stack

| Layer | Technology |
|---|---|
| Build | Vite 5 |
| UI | React 18 + TypeScript 5, React Router 6 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| Data / state | TanStack Query, React Hook Form + Zod |
| Backend | Supabase — Postgres, Auth, Edge Functions (Deno) |
| Payments | Stripe Checkout + webhooks |

## Local development

Requires Node.js and npm.

```sh
npm install
npm run dev
```

The dev server listens on **port 8080** (`vite.config.ts` sets `server.port`, and
`host: "::"` so it binds all interfaces): http://localhost:8080

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server on :8080 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build with development mode settings |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint over the repo |
| `npm run seed:users` | Create test users (needs service-role key, see below) |
| `npm run verify:users` | Check seeded test users exist |

Type checking is not part of `npm run build` — Vite does not typecheck. Run it
separately:

```sh
npx tsc --noEmit
```

## Environment variables

### Client (`.env` in the repo root)

Only `VITE_`-prefixed variables reach the browser bundle. **These are compiled
into the shipped JavaScript — never put a secret here.**

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key (safe to expose; RLS is the boundary) |
| `VITE_SUPABASE_PROJECT_ID` | Present in `.env` but not read by any code — legacy from project scaffolding |

`.env` is gitignored and must not be committed.

The current Supabase project is `atfdumpulvyhwcptybrt`, which is also pinned in
`supabase/config.toml`.

### Seed scripts (`scripts/`, shell environment — not `.env`)

These use plain `process.env`, without the `VITE_` prefix:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — bypasses RLS entirely. Never commit or expose. |

### Edge function secrets (set in Supabase, not `.env`)

```sh
supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... OPENAI_API_KEY=...
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected into the function
runtime automatically and do not need setting.

## Edge functions

| Function | `verify_jwt` | Secrets | Purpose |
|---|---|---|---|
| `create-checkout-session` | default (true) | `STRIPE_SECRET_KEY` | Creates a Stripe Checkout session for the premium plan |
| `stripe-webhook` | **false** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Applies subscription state from Stripe events. The sole writer of entitlement. |
| `recommend-products` | default (true) | `OPENAI_API_KEY` | AI product recommendations via `api.openai.com` (`gpt-4o-mini`) |

`stripe-webhook` sets `verify_jwt = false` deliberately: Stripe signs requests
with its own scheme and cannot present a Supabase JWT. With JWT verification on,
Supabase would reject the request with 401 before signature validation ran, and
no purchase would ever become an entitlement. The function validates
`stripe.webhooks.constructEvent()` itself.

Deploy a function with:

```sh
supabase functions deploy <name>
```

## Database

The schema is consolidated into a single migration:

```
supabase/migrations/20260812000000_initial_schema.sql
supabase/migrations/_archive/          # superseded migrations, kept for reference
```

Apply with `supabase db push`. Only the top-level migration is applied;
`_archive/` is historical and must not be re-run.

### Entitlement model

Premium access is owned entirely by the server:

- `subscriptions` is **SELECT-only** for authenticated clients. All writes come
  from `stripe-webhook` using the service-role key, which bypasses RLS.
- `profiles.subscription_plan` is excluded from the column-level `UPDATE` grant,
  so a client cannot promote itself. It is a display mirror of
  `subscriptions.plan_type` — never read it for an entitlement decision.
- `usage_tracking` is SELECT-only; counters are incremented through the
  `increment_usage()` `SECURITY DEFINER` function so users cannot reset their
  own free-tier limits.

Gate features on `hasPremiumAccess()` / `canUseFeature()` from
`src/hooks/useSubscription.tsx`. Do not add client-side shortcuts that grant
premium — including for admins.

### There is no admin UI

`AdminDashboard.tsx` and `AdminUsers.tsx` have been deleted — they were unrouted
and linked only to each other. The admin RLS policies they needed are not in the
applied schema: `profiles`, `subscriptions`, `revenue_events` and
`usage_tracking` are all self-row-only, so the dashboard could only ever display
the admin's own row. Writing those policies is a prerequisite for any `/admin`
surface; recover the pages from git history as a starting point.

The `admin` role in `user_roles` still exists and `has_role()` is still applied.
Its only effect in the app is the Profile page plan badge (`useAdmin` →
`ADMIN` label). It must never gate an entitlement.

## Build and deploy

```sh
npm run build
```

Output is a static bundle in `dist/`. Deployment is an rsync of that directory
into the nginx document root on the VPS:

```sh
rsync -av --delete dist/ /var/www/fitmatepro/
```

`--delete` removes files no longer present in the build. nginx serves
`/var/www/fitmatepro` and must fall back to `index.html` for unmatched paths, as
this is a client-side-routed SPA — without that, a deep link like
`/features/goal-setting` returns 404 on refresh.

Edge functions and migrations deploy separately via the Supabase CLI; they are
not part of the static bundle.
