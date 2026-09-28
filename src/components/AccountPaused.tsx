import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PauseCircle, PlayCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAccountStatus } from '@/hooks/useAccountStatus';

/**
 * Shown in place of the app while account_status = 'paused'.
 *
 * Reactivation is here rather than buried in settings on purpose: the whole
 * value of pause over deletion is that undoing it is trivial. Signing out is
 * offered too, so a paused account is not a trap.
 */
export const AccountPaused = () => {
  const { profile, signOut } = useAuth();
  const { working, reactivateAccount, pausedAt } = useAccountStatus();

  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <PauseCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">
            {firstName ? `Your account is paused, ${firstName}` : 'Your account is paused'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Nothing has been deleted. Your workouts, meals, check-ins and goals are all still
            here, exactly as you left them.
            {pausedAt ? ` Paused on ${new Date(pausedAt).toLocaleDateString()}.` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" size="lg" onClick={reactivateAccount} disabled={working}>
            <PlayCircle className="w-5 h-5 mr-2" />
            {working ? 'Reactivating…' : 'Reactivate my account'}
          </Button>
          <Button variant="outline" className="w-full" onClick={signOut} disabled={working}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPaused;
