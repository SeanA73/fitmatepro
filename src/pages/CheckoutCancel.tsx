import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import FitMateHeader from '@/components/FitMateHeader';
// Auth gating lives on the route in src/App.tsx, not in here.
import { PricingSection } from '@/components/subscription/PricingSection';

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="border-2 border-muted">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Checkout Canceled</CardTitle>
            <CardDescription className="text-base mt-2">
              Your subscription was not completed. No charges were made.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Don't worry! You can upgrade to Premium anytime. Your free account is still active with all basic features.
            </p>

            <div className="flex gap-3">
              <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/premium')} className="flex-1">
                <CreditCard className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-4 text-center">Still Interested in Premium?</h3>
              <PricingSection />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutCancel;





