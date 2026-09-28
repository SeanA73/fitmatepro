# Test Users Script

This script creates test users for FitMatePro application testing.

## Prerequisites

1. Make sure you have your Supabase credentials set up:
   - `VITE_SUPABASE_URL` or `SUPABASE_URL` in your environment
   - `SUPABASE_SERVICE_ROLE_KEY` in your environment

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the script using:

```bash
npm run seed:users
```

Or directly with tsx:

```bash
npx tsx scripts/create-test-users.ts
```

## Created Test Users

The script creates the following test users:

### 1. Free User
- **Email**: `free.user@test.com`
- **Password**: `TestUser123!`
- **Plan**: Free
- **Access**: Basic features only

### 2. Premium User
- **Email**: `premium.user@test.com`
- **Password**: `TestUser123!`
- **Plan**: Premium
- **Access**: All premium features

### 3. Admin User (Primary)
- **Email**: `admin@fitmatepro.com`
- **Password**: `Admin123!`
- **Plan**: Premium, plus an `admin` row in `user_roles`
- **Access**: All premium features (see "The admin role" below)

### 4. Admin User (Backward Compatible)
- **Email**: `admin@test.com`
- **Password**: `Admin123!`
- **Plan**: Premium, plus an `admin` row in `user_roles`
- **Access**: All premium features (see "The admin role" below)

## What the Script Does

1. Creates auth users in Supabase Auth
2. Creates user profiles with default settings
3. Creates active subscriptions for premium users
4. Assigns admin role to admin users
5. Creates user preferences
6. Skips users that already exist (won't duplicate)

## The admin role

The `admin` role grants no additional UI. There is no admin dashboard and no
`/admin` route — the pages that served one were deleted because the RLS policies
they needed (`profiles`, `subscriptions`, `revenue_events` and `usage_tracking`
are all self-row-only) are not in the applied schema. The role's only visible
effect is the Profile page plan badge, which reads `ADMIN`.

## Troubleshooting

If you encounter errors:
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set correctly (not the anon key)
- Ensure your Supabase project has the required tables and migrations applied
- Check that the `has_role` function exists in your database



