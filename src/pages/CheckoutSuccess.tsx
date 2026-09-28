import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import FitMateHeader from '@/components/FitMateHeader';
// Auth gating lives on the route in src/App.tsx, not in here.

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, fetchSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId && user) {
      // Poll for subscription — the webhook may take a few seconds to process
      const maxRetries = 10;
      const pollInterval = 2000;

      const poll = async () => {
        await fetchSubscription();
        setRetryCount(prev => prev + 1);
      };

      poll();
      const interval = setInterval(async () => {
        setRetryCount(prev => {
          if (prev >= maxRetries) {
            clearInterval(interval);
            setLoading(false);
            return prev;
          }
          poll();
          return prev;
        });
      }, pollInterval);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user]);

  useEffect(() => {
    if (subscription && retryCount > 0) {
      setLoading(false);
    }
  }, [subscription, retryCount]);

  useEffect(() => {
    if (retryCount >= 10) {
      setLoading(false);
    }
  }, [retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Landed here without a checkout session at all.
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background">
        <FitMateHeader />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">No checkout session found</CardTitle>
              <CardDescription className="text-base mt-2">
                This page confirms a completed checkout. There's no checkout to confirm here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/')} className="flex-1" size="lg">
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/premium')} variant="outline" className="flex-1" size="lg">
                  View Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasSubscription = subscription && ['active', 'trialing'].includes(subscription.status);

  return (
      <div className="min-h-screen bg-background">
        <FitMateHeader />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="border-2">
            <CardHeader className="text-center">
              {hasSubscription ? (
                <>
                  <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">Welcome to Premium! 🎉</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Your subscription is active. Enjoy enhanced access to FitMatePro!
                  </CardDescription>
                </>
              ) : (
                <>
                  <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                  <CardTitle className="text-3xl">Payment Received! 🎉</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Your account is being activated. This usually takes a few seconds.
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Premium Features
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ 150 AI coach chat messages per month</li>
                  <li>✓ Full workout and nutrition logging</li>
                  <li>✓ Wellness tracking and insights</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  More premium features are being added regularly — custom workout plans, advanced meal planning, health data export, and more. Stay tuned!
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => navigate('/')} className="flex-1" size="lg">
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/premium')} variant="outline" className="flex-1" size="lg">
                  View Premium
                </Button>
              </div>

              {!hasSubscription && (
                <p className="text-xs text-center text-muted-foreground">
                  If your premium features don't appear within a minute, try refreshing the page.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default CheckoutSuccess;

