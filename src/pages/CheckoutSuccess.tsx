import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import FitMateHeader from '@/components/FitMateHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId && user) {
      // Refresh subscription data
      fetchSubscription().finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [searchParams, user, fetchSubscription]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <FitMateHeader />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-3xl">Welcome to Premium! 🎉</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your subscription is active. Enjoy enhanced access to FitMatePro!
              </CardDescription>
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
                  Explore Premium Features
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CheckoutSuccess;





