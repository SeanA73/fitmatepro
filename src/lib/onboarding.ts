import { supabase } from '@/integrations/supabase/client';

// The onboarding flag used to be a single unscoped localStorage key
// ('onboarding_complete') that sign-out never cleared. Two consequences:
//   * user B signing in on the same browser inherited user A's flag and
//     skipped onboarding entirely;
//   * the flag was the *only* thing Auth.tsx checked after sign-in, so a
//     returning user on a new device was pushed back through onboarding even
//     though the database said they were done.
//
// The key is now per user, sign-out clears it, and the database is the
// authority — localStorage is only a cache to avoid a round trip.
const LEGACY_KEY = 'onboarding_complete';
const KEY_PREFIX = 'onboarding_complete:';

const keyFor = (userId: string) => `${KEY_PREFIX}${userId}`;

export const isOnboardingCached = (userId: string): boolean =>
  localStorage.getItem(keyFor(userId)) === 'true';

export const cacheOnboardingComplete = (userId: string): void => {
  localStorage.setItem(keyFor(userId), 'true');
};

/** Called on sign-out so nothing carries over to the next account. */
export const clearOnboardingCache = (): void => {
  localStorage.removeItem(LEGACY_KEY);
  Object.keys(localStorage)
    .filter(key => key.startsWith(KEY_PREFIX))
    .forEach(key => localStorage.removeItem(key));
};

/**
 * Authoritative check. Reads the cache first, then user_preferences.
 * Returns false on a read failure so the user is offered onboarding rather
 * than silently skipped past it.
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  if (isOnboardingCached(userId)) return true;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('notification_settings')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return false;

  const settings = (data?.notification_settings ?? null) as { onboarding_complete?: boolean } | null;
  const complete = settings?.onboarding_complete === true;

  if (complete) cacheOnboardingComplete(userId);
  return complete;
};
