import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Pause, reactivate, and delete the signed-in account.
 *
 * Pause and reactivate are ordinary profile updates under RLS — the user owns
 * the row and both directions are self-service. Deletion is not: it has to reach
 * auth.users, which no client key can touch, so it goes through the
 * delete-account edge function.
 */
export const useAccountStatus = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [working, setWorking] = useState(false);

  const isPaused = profile?.account_status === 'paused';

  const setStatus = async (status: 'active' | 'paused') => {
    if (!user) return false;

    setWorking(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: status,
          paused_at: status === 'paused' ? new Date().toISOString() : null,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: status === 'paused' ? 'Account paused' : 'Welcome back',
        description:
          status === 'paused'
            ? 'Your data is kept as it is. Sign in any time to pick up where you left off.'
            : 'Your account is active again and nothing was lost.',
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: status === 'paused' ? "Couldn't pause your account" : "Couldn't reactivate your account",
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setWorking(false);
    }
  };

  const pauseAccount = () => setStatus('paused');
  const reactivateAccount = () => setStatus('active');

  /**
   * Irreversible. Resolves false and surfaces the reason on any failure — the
   * caller must not navigate away or claim success unless this returns true.
   *
   * No arguments, deliberately: the function identifies the account from the
   * JWT attached by supabase-js. There is no user id to pass and therefore none
   * to get wrong.
   */
  const deleteAccount = async () => {
    setWorking(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
      });

      // A non-2xx response arrives as `error`, but the useful message is in the
      // body, which supabase-js exposes via FunctionsHttpError.context.
      if (error) {
        let detail = error.message;
        const response = (error as { context?: Response }).context;
        if (response && typeof response.json === 'function') {
          try {
            const body = await response.json();
            if (body?.error) detail = body.error;
          } catch {
            // Keep error.message.
          }
        }
        throw new Error(detail);
      }

      if (!data?.success) {
        throw new Error(data?.error ?? 'Deletion did not complete. Your account may still exist.');
      }

      // signOut clears the local session and the onboarding cache, then sends
      // the browser to "/". The JWT it is discarding is already dead — the user
      // behind it no longer exists.
      await signOut();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Account not deleted',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setWorking(false);
    }
  };

  return { isPaused, pausedAt: profile?.paused_at ?? null, working, pauseAccount, reactivateAccount, deleteAccount };
};
