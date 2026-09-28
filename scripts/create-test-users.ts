/**
 * Script to create test users for FitMatePro
 * 
 * This script creates:
 * 1. Free user (free.user@test.com)
 * 2. Premium user (premium.user@test.com)
 * 3. Admin user (admin@fitmatepro.com)
 * 
 * Usage:
 * Run this script using: npx tsx scripts/create-test-users.ts
 * 
 * Note: You need to have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in your environment
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables - check both VITE_ and non-VITE_ prefixed versions
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📝 To set these up:');
  console.error('   1. Create a .env file in the project root (if you don\'t have one)');
  console.error('   2. Add your Supabase credentials:');
  console.error('      SUPABASE_URL=https://your-project.supabase.co');
  console.error('      SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.error('\n   Note: SUPABASE_SERVICE_ROLE_KEY is different from VITE_SUPABASE_PUBLISHABLE_KEY');
  console.error('   You can find it in: Supabase Dashboard > Settings > API > service_role key');
  console.error('\n   ⚠️  Keep the service role key secret! Never commit it to git.\n');
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  plan: 'free' | 'premium';
  isAdmin?: boolean;
}

const testUsers: TestUser[] = [
  {
    email: 'free.user@test.com',
    password: 'TestUser123!',
    fullName: 'Free Test User',
    plan: 'free'
  },
  {
    email: 'premium.user@test.com',
    password: 'TestUser123!',
    fullName: 'Premium Test User',
    plan: 'premium'
  },
  {
    email: 'admin@fitmatepro.com',
    password: 'Admin123!',
    fullName: 'Admin User',
    plan: 'premium',
    isAdmin: true
  },
  // Also create admin@test.com for backward compatibility
  {
    email: 'admin@test.com',
    password: 'Admin123!',
    fullName: 'Admin Test User',
    plan: 'premium',
    isAdmin: true
  }
];

async function createTestUsers() {
  console.log('🚀 Starting test user creation...\n');

  for (const userData of testUsers) {
    try {
      console.log(`Creating user: ${userData.email}...`);

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === userData.email);

      let userId: string;

      if (existingUser) {
        console.log(`   ⚠️  User ${userData.email} already exists, skipping creation.`);
        userId = existingUser.id;
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: userData.fullName
          }
        });

        if (authError) {
          console.error(`   ❌ Error creating auth user: ${authError.message}`);
          if (authError.message.includes('already registered')) {
            console.log(`   ℹ️  User might already exist, checking...`);
            const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
            const found = existing.users.find(u => u.email === userData.email);
            if (found) {
              userId = found.id;
              console.log(`   ✅ Found existing user: ${userId}`);
            } else {
              continue;
            }
          } else {
            continue;
          }
        } else {
          userId = authData.user.id;
          console.log(`   ✅ Auth user created: ${userId}`);
        }

      }

      // Create or update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: userData.email,
          full_name: userData.fullName,
          subscription_plan: userData.plan === 'premium' ? 'premium' : 'free',
          fitness_goals: ['general_health'],
          activity_level: 'moderately_active',
          gender: 'prefer_not_to_say',
          height_cm: 170,
          weight_kg: 70
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error(`   ❌ Error creating profile: ${profileError.message}`);
        continue;
      }
      console.log(`   ✅ Profile created/updated`);

      // Create subscription for premium users
      if (userData.plan === 'premium') {
        const { error: subError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_type: 'premium',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            stripe_customer_id: `cus_test_${userId.substring(0, 8)}`,
            stripe_subscription_id: `sub_test_${userId.substring(0, 8)}`
          }, {
            onConflict: 'user_id'
          });

        if (subError) {
          console.error(`   ❌ Error creating subscription: ${subError.message}`);
        } else {
          console.log(`   ✅ Premium subscription created`);
        }
      }

      // Create user preferences
      const { error: prefError } = await supabaseAdmin
        .from('user_preferences')
        .upsert({
          user_id: userId
        }, {
          onConflict: 'user_id'
        });

      if (prefError && !prefError.message.includes('duplicate')) {
        console.error(`   ⚠️  Error creating preferences: ${prefError.message}`);
      }

      // Assign admin role if needed
      if (userData.isAdmin) {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'admin'
          }, {
            onConflict: 'user_id,role'
          });

        if (roleError) {
          console.error(`   ❌ Error assigning admin role: ${roleError.message}`);
        } else {
          console.log(`   ✅ Admin role assigned`);
        }
      } else {
        // Assign user role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role: 'user'
          }, {
            onConflict: 'user_id,role'
          });

        if (roleError && !roleError.message.includes('duplicate')) {
          console.error(`   ⚠️  Error assigning user role: ${roleError.message}`);
        }
      }

      console.log(`   ✅ User ${userData.email} setup complete!\n`);
    } catch (error: any) {
      console.error(`   ❌ Unexpected error for ${userData.email}:`, error.message);
      console.error('\n');
    }
  }

  console.log('\n📋 Test Users Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Free User:');
  console.log('   Email: free.user@test.com');
  console.log('   Password: TestUser123!');
  console.log('   Plan: Free');
  console.log('\nPremium User:');
  console.log('   Email: premium.user@test.com');
  console.log('   Password: TestUser123!');
  console.log('   Plan: Premium');
  // The admin role grants no UI — there is no admin dashboard. See scripts/README.md.
  console.log('\nAdmin Users (admin role in user_roles; no admin UI exists):');
  console.log('   Email: admin@fitmatepro.com');
  console.log('   Password: Admin123!');
  console.log('   Plan: Premium');
  console.log('\n   Email: admin@test.com (backward compatible)');
  console.log('   Password: Admin123!');
  console.log('   Plan: Premium');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Test users created successfully!');
  console.log('   You can now sign in with any of these accounts.\n');
}

// Run the script
createTestUsers().catch(console.error);

