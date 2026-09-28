import { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FitMateHeader from '@/components/FitMateHeader';
import { Lock, ArrowLeft } from 'lucide-react';

interface PremiumRouteProps {
  children: ReactNode;
  showUpgrade?: boolean;
}

export const PremiumRoute = ({ children, showUpgrade = true }: PremiumRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasPremiumAccess, loading: subLoading } = useSubscription();
  const navigate = useNavigate();

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasPremiumAccess()) {
    if (showUpgrade) {
      return (
        // The upgrade panel renders inline now. It used to be a fixed
        // full-screen overlay with no close handler, which covered this card
        // and left the browser back button as the only way out.
        <div className="min-h-screen bg-background">
          <FitMateHeader />
          <div className="max-w-2xl mx-auto px-6 py-12">
            <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back
            </Button>

            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Premium Feature</CardTitle>
                <CardDescription className="text-base mt-2">
                  This feature is available with FitMatePro Premium
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UpgradePrompt
                  trigger="premium_feature_access"
                  featureName="premium_feature"
                />
                <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>
                  Compare plans
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return <Navigate to="/premium" replace />;
  }

  return <>{children}</>;
};
