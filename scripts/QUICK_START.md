# Quick Start: Creating Test Users

## Setup (One-Time)

1. **Get your Supabase Service Role Key**:
   - Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API
   - Copy the `service_role` key (secret) - NOT the anon key

2. **Create `.env` file** in project root:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Install dependencies** (if not already):
   ```bash
   npm install
   ```

## Create Test Users

Run the seed script:
```bash
npm run seed:users
```

## Test Accounts Created

After running the script, you can sign in with:

| User Type | Email | Password | Access |
|-----------|-------|----------|--------|
| **Free** | `free.user@test.com` | `TestUser123!` | Free plan features |
| **Premium** | `premium.user@test.com` | `TestUser123!` | All premium features |
| **Admin** | `admin@fitmatepro.com` | `Admin123!` | Premium, plus an `admin` row in `user_roles` |

## About the admin role

The script writes an `admin` row to `user_roles`, but **there is no admin UI**.
The only thing the role changes is the plan badge on the Profile page, which
reads `ADMIN` instead of `PREMIUM`. There is no `/admin` route, and the admin
RLS policies a dashboard would need are not in the applied schema. Treat this
account as a premium account for testing purposes.

## Troubleshooting

**Error: "Missing environment variables"**
- Make sure `.env` file exists in project root
- Verify variable names are exactly: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Don't use `VITE_` prefix for the service role key

**Error: "Failed to create user"**
- Verify your service role key is correct
- Check Supabase project is active
- Ensure you're using service_role key, not anon key

**Profile badge doesn't say ADMIN**
- Check that the `has_role` function exists in your database
- Verify the user has an `admin` row in the `user_roles` table



