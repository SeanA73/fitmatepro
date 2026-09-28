import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

/**
 * Every table holding data for this user, with the column that points at them.
 *
 * Used only to VERIFY the deletion after the fact — nothing here issues the
 * deletes. See the comment on the delete call below for why.
 *
 * revenue_events is in the list on purpose. It is never emptied (its rows are
 * retained for Australian tax purposes) but its user_id must have been set to
 * NULL, so a count of rows still carrying this user_id must be zero. That is the
 * same assertion as for every other table: no row anywhere still points at this
 * person.
 */
const USER_TABLES: Array<{ table: string; column: string }> = [
  { table: 'meals', column: 'user_id' },
  { table: 'workout_sessions', column: 'user_id' },
  { table: 'workout_plans', column: 'user_id' },
  { table: 'wellness_checkins', column: 'user_id' },
  { table: 'user_goals', column: 'user_id' },
  { table: 'user_preferences', column: 'user_id' },
  { table: 'user_notifications', column: 'user_id' },
  { table: 'product_recommendations', column: 'user_id' },
  { table: 'recommendation_feedback', column: 'user_id' },
  { table: 'affiliate_clicks', column: 'user_id' },
  { table: 'usage_tracking', column: 'user_id' },
  { table: 'subscriptions', column: 'user_id' },
  { table: 'user_roles', column: 'user_id' },
  { table: 'revenue_events', column: 'user_id' },
  { table: 'profiles', column: 'id' },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    // -----------------------------------------------------------------------
    // Identity comes from the JWT and NOWHERE ELSE.
    //
    // The request body is never read. There is no userId parameter to accept,
    // so there is nothing to forge — the endpoint is incapable of deleting
    // anyone other than its caller.
    //
    // Contrast create-checkout-session, which does `const { userId } =
    // await req.json()` and then queries with the service role key. That
    // pattern turns an authenticated endpoint into a privilege escalation:
    // anyone who can reach it can act as any user id they can guess. Applied
    // to account deletion it would be a remote account-wipe primitive.
    //
    // getUser() is a verification call against the auth server, not a local
    // decode, so a tampered or expired token fails here rather than being
    // trusted.
    // -----------------------------------------------------------------------
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error('[delete-account] missing required environment variables')
      return json({ error: 'Server misconfigured' }, 500)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()

    if (authError || !user) {
      return json({ error: 'Not authenticated' }, 401)
    }

    const userId = user.id

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // -----------------------------------------------------------------------
    // One statement. One transaction. All of it or none of it.
    //
    // deleteUser issues `DELETE FROM auth.users WHERE id = ...`, and every
    // table above is reachable from that row by ON DELETE CASCADE — directly
    // (user_roles, product_recommendations, recommendation_feedback,
    // affiliate_clicks) or through profiles, which cascades to the remaining
    // nine. revenue_events.user_id is SET NULL by design.
    //
    // This is why the implementation is a cascade rather than the sequence of
    // per-table deletes in the brief: a sequence is fourteen separate
    // transactions and can fail on the eighth, leaving an account that is
    // half-gone and a policy promise that is false. A cascade cannot end up
    // half-applied.
    //
    // Two foreign keys had to be corrected first — see
    // 20260818000100_account_deletion_fk_fixes.sql. Without that migration
    // affiliate_clicks rows survive this call with their user_agent
    // fingerprint intact, so DO NOT deploy this function without it.
    // -----------------------------------------------------------------------
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error(`[delete-account] deleteUser failed for ${userId}:`, deleteError)
      return json(
        {
          error: 'Deletion failed. Nothing was deleted — your account is intact. ' +
            'Please try again, and contact support if it keeps failing.',
          detail: deleteError.message,
        },
        500,
      )
    }

    // -----------------------------------------------------------------------
    // Verify before reporting success.
    //
    // The requirement is to return success only when the whole thing actually
    // completed, which means checking rather than assuming. If a future
    // migration adds a table whose FK is not CASCADE, that table shows up here
    // as a non-zero count and this call reports failure — instead of silently
    // leaving data behind under a policy that says otherwise.
    // -----------------------------------------------------------------------
    const remaining: Record<string, number> = {}
    const verificationErrors: Record<string, string> = {}

    for (const { table, column } of USER_TABLES) {
      const { count, error } = await admin
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(column, userId)

      if (error) {
        verificationErrors[table] = error.message
        continue
      }
      if (count && count > 0) {
        remaining[table] = count
      }
    }

    // A verification query that could not run is not a pass.
    if (Object.keys(verificationErrors).length > 0) {
      console.error(`[delete-account] could not verify ${userId}:`, verificationErrors)
      return json(
        {
          error: 'Your account was deleted but the result could not be fully verified. ' +
            'Please contact support so we can confirm nothing was left behind.',
          verificationErrors,
        },
        500,
      )
    }

    if (Object.keys(remaining).length > 0) {
      console.error(`[delete-account] INCOMPLETE deletion for ${userId}:`, remaining)
      return json(
        {
          error: 'Your account was deleted but some records remain. ' +
            'Please contact support so we can remove them.',
          remaining,
        },
        500,
      )
    }

    console.log(`[delete-account] deleted and verified ${userId} across ${USER_TABLES.length} tables`)

    return json({
      success: true,
      tablesVerified: USER_TABLES.length,
    })
  } catch (error) {
    console.error('[delete-account] unexpected error:', error)
    return json(
      { error: error instanceof Error ? error.message : 'Unexpected error' },
      500,
    )
  }
})
