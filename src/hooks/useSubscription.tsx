import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium';
  status: 'active' | 'trialing' | 'canceled' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

export interface UsageLimit {
  feature_name: string;
  limit_value: number | null;
  limit_period: string;
  current_usage: number;
  can_use: boolean;
}

export const useSubscription = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageLimits, setUsageLimits] = useState<UsageLimit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's subscription
  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data as Subscription);
    } catch (error) {
      // Silent fail for subscription fetch
    }
  };

  // Get current plan
  const getCurrentPlan = (): 'free' | 'premium' => {
    return subscription?.plan_type === 'premium' ? 'premium' : 'free';
  };

  // Check if user can use a feature
  const canUseFeature = async (featureName: string, period: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_usage_limit', {
        user_uuid: user.id,
        feature: featureName,
        period: period
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      return false;
    }
  };

  // Increment usage for a feature.
  //
  // NEVER swallow failures here. A silent catch is how the missing
  // UNIQUE (user_id, feature_type, period_start) constraint hid for months:
  // increment_usage() raised 42P10 on every call, usage never incremented, and
  // free-tier limits therefore never enforced. An unmetered free tier is a
  // revenue leak, so this has to be loud.
  const incrementUsage = async (featureName: string, period: string) => {
    if (!user) return;

    const { error } = await supabase.rpc('increment_usage', {
      user_uuid: user.id,
      feature: featureName,
      period: period
    });

    if (error) {
      console.error(
        `[metering] increment_usage failed for feature="${featureName}" period="${period}" user=${user.id}.`,
        `Usage was NOT recorded, so plan limits are not being enforced.`,
        error
      );
      toast({
        title: "Usage tracking failed",
        description: `We couldn't record your usage of ${featureName}. Please report this — code ${error.code || 'unknown'}.`,
        variant: "destructive"
      });
    }
  };

  // Get usage limits for current plan
  const fetchUsageLimits = async () => {
    if (!user) return;

    const currentPlan = getCurrentPlan();
    
    try {
      const { data: limits, error } = await supabase
        .from('plan_limits')
        .select('*')
        .eq('plan_type', currentPlan);

      if (error) throw error;

      // Get current usage for each feature
      const limitsWithUsage = await Promise.all(
        (limits || []).map(async (limit) => {
          const currentUsage = await getCurrentUsage(limit.feature_name, limit.limit_period);
          const canUse = limit.limit_value === null || currentUsage < limit.limit_value;
          
          return {
            feature_name: limit.feature_name,
            limit_value: limit.limit_value,
            limit_period: limit.limit_period,
            current_usage: currentUsage,
            can_use: canUse
          };
        })
      );

      setUsageLimits(limitsWithUsage);
    } catch (error) {
      // Silent fail for usage limits
    }
  };

  // Get current usage for a feature
  const getCurrentUsage = async (featureName: string, period: string): Promise<number> => {
    if (!user) return 0;

    try {
      let periodStart: Date;
      const now = new Date();
      
      switch (period) {
        case 'daily':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const dayOfWeek = now.getDay();
          periodStart = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          periodStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
          break;
        case 'monthly':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature_type', featureName)
        .gte('period_start', periodStart.toISOString());

      if (error) throw error;

      return data?.reduce((sum, record) => sum + (record.usage_count || 0), 0) || 0;
    } catch (error) {
      return 0;
    }
  };

  // Create Stripe checkout session.
  //
  // This rejects on failure rather than swallowing the error. It used to catch
  // its own rejection and toast "Please try again", which made the promise
  // resolve — so Auth's `await createCheckoutSession(); return;` looked like a
  // successful redirect, created the account, and stranded the user on /auth
  // with no navigation. Every caller already has its own catch, so the honest
  // failure surfaces exactly once and the caller can stop.
  //
  // No edge function is deployed to this project yet, so in practice this
  // always rejects with a 404. The UI purchase path is disabled accordingly;
  // this stays wired so it works the moment the function and real Stripe price
  // IDs ship.
  const createCheckoutSession = async (planType: 'premium', isAnnual: boolean = false) => {
    const priceMap = {
      'premium-monthly': 'price_premium_monthly',
      'premium-annual': 'price_premium_annual'
    };

    const priceKey = `${planType}-${isAnnual ? 'annual' : 'monthly'}` as keyof typeof priceMap;
    const priceId = priceMap[priceKey];

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId, userId: user?.id }
    });

    if (error) {
      console.error('[billing] create-checkout-session invocation failed:', error);
      throw new Error(
        `Checkout is unavailable (${error.message || 'endpoint not reachable'}). No payment was started.`
      );
    }

    if (!data?.url) {
      throw new Error('Checkout session came back without a redirect URL. No payment was started.');
    }

    window.location.href = data.url;
  };

  const cancelSubscription = async () => {
    if (!subscription?.stripe_subscription_id) {
      toast({
        title: "No active subscription",
        description: "We couldn't find a Stripe subscription on your account to cancel.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId: subscription.stripe_subscription_id }
    });

    if (error) {
      console.error('[billing] cancel-subscription invocation failed:', error);
      toast({
        title: "Cancellation could not be processed",
        description: `Self-service cancellation is unavailable (${error.message || 'endpoint not reachable'}). Your subscription is still active and will renew. Please contact support to cancel.`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Subscription Canceled",
      description: "Your subscription has been canceled and will end at the current period.",
    });

    await fetchSubscription();
  };

  // Check if user has access to premium features
  const hasPremiumAccess = (): boolean => {
    const plan = getCurrentPlan();
    return plan === 'premium';
  };

  // The same race as useAuth's, one layer up. This used to call
  // setLoading(false) synchronously alongside two un-awaited fetches, so
  // PremiumRoute dropped its spinner while `subscription` was still null and
  // flashed the upgrade wall at paying customers. Await the fetches, and clear
  // loading in a finally so a failed fetch can't strand the spinner.
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Re-raised on every user change: after a sign-out/sign-in the previous
    // user's `false` would otherwise still be in state during the refetch.
    setLoading(true);

    let active = true;
    (async () => {
      try {
        await fetchSubscription();
        await fetchUsageLimits();
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [user, profile]);

  return {
    subscription,
    usageLimits,
    loading,
    getCurrentPlan,
    canUseFeature,
    incrementUsage,
    getCurrentUsage,
    createCheckoutSession,
    cancelSubscription,
    hasPremiumAccess,
    fetchSubscription,
    fetchUsageLimits
  };
};