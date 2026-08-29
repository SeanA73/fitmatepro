import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  Target,
  TrendingUp,
  Users,
  Headphones,
  Smartphone,
  BarChart3
} from 'lucide-react';

interface PricingPlan {
  id: 'free' | 'premium';
  name: string;
  icon: React.ReactNode;
  price: {
    monthly: number;
    annual: number;
  };
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  gradient: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'FitMatePro Free',
    icon: <Target className="h-6 w-6" />,
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for getting started',
    features: [
      'Basic workout tracking (3/week)',
      'Simple nutrition logging',
      'Coach chat (7 messages/day)',
      'Community access',
      'Basic progress charts',
      'Manual data entry'
    ],
    limitations: [
      'Limited workouts per week',
      'Basic reporting only'
    ],
    gradient: 'from-gray-50 to-gray-100'
  },
  {
    id: 'premium',
    name: 'FitMatePro Premium',
    icon: <Zap className="h-6 w-6" />,
    price: { monthly: 4.99, annual: 47.99 },
    description: 'Unlock everything FitMatePro has to offer',
    features: [
      'Unlimited workout and nutrition logging',
      'Coach chat (150 messages/month)',
      'Custom workout builder',
      'Advanced meal planning',
      'Health data export',
      'Premium themes'
    ],
    popular: true,
    gradient: 'from-primary/10 to-primary/5'
  }
];

interface PricingSectionProps {
  showTitle?: boolean;
  className?: string;
}

export const PricingSection = ({ showTitle = true, className }: PricingSectionProps) => {
  const { createCheckoutSession, getCurrentPlan, hasPremiumAccess } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlan = getCurrentPlan();

  const handleSelectPlan = async (planId: 'premium') => {
    setLoadingPlan(planId);
    try {
      await createCheckoutSession(planId, isAnnual);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start subscription. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonText = (plan: PricingPlan) => {
    if (!user) {
      if (plan.id === 'free') {
        return 'Get Started Free';
      }
      return 'Start Free Trial';
    }
    
    if (plan.id === 'free') {
      return currentPlan === 'free' ? 'Current Plan' : 'Downgrade';
    }
    
    if (currentPlan === plan.id) {
      return 'Current Plan';
    }
    
    return currentPlan === 'free' ? 'Start Free Trial' : 'Upgrade';
  };

  const getButtonVariant = (plan: PricingPlan) => {
    if (user && currentPlan === plan.id) return 'secondary';
    if (plan.popular) return 'default';
    return 'outline';
  };

  const calculateSavings = (plan: PricingPlan) => {
    if (plan.price.monthly === 0) return 0;
    const annualMonthly = plan.price.annual / 12;
    const savings = ((plan.price.monthly - annualMonthly) / plan.price.monthly) * 100;
    return Math.round(savings);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {showTitle && (
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Choose Your FitMatePro Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade when you're ready. All plans include our core fitness tracking features.
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={`text-sm ${!isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm ${isAnnual ? 'font-medium' : 'text-muted-foreground'}`}>
              Annual
            </span>
            <Badge variant="secondary" className="ml-2">
              Save 20% annually
            </Badge>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PRICING_PLANS.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.id;
          const savings = calculateSavings(plan);
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`relative p-6 h-full bg-gradient-to-br ${plan.gradient} ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${isCurrentPlan ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary">Current</Badge>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan header */}
                  <div className="text-center space-y-2">
                    <div className={`inline-flex p-3 rounded-full ${
                      plan.id === 'free' ? 'bg-gray-100' :
                      'bg-primary/10'
                    }`}>
                      <div className={`${
                        plan.id === 'free' ? 'text-gray-600' :
                        'text-primary'
                      }`}>
                        {plan.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center space-y-2">
                    {plan.price.monthly === 0 ? (
                      <div className="text-3xl font-bold">Free</div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold">
                          ${isAnnual ? (plan.price.annual / 12).toFixed(2) : plan.price.monthly}
                          <span className="text-lg font-normal text-muted-foreground">/month</span>
                        </div>
                        {isAnnual && (
                          <div className="text-sm text-muted-foreground">
                            Billed annually (${plan.price.annual}/year)
                            {savings > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                Save {savings}%
                              </Badge>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 text-sm">
                        <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations && (
                      <div className="pt-2 border-t border-border/50">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground">•</div>
                            <span>{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={getButtonVariant(plan)}
                    size="lg"
                    disabled={loadingPlan === plan.id || (user && plan.id === 'free' && currentPlan === 'free')}
                    onClick={() => {
                      if (!user) {
                        if (plan.id === 'free') {
                          window.location.href = '/auth';
                        } else {
                          window.location.href = `/auth?trial=true&plan=${plan.id}`;
                        }
                      } else if (plan.id !== 'free' && plan.id !== currentPlan) {
                        handleSelectPlan(plan.id);
                      }
                    }}
                  >
                    {loadingPlan === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      getButtonText(plan)
                    )}
                  </Button>

                  {plan.id !== 'free' && currentPlan === 'free' && (
                    <p className="text-xs text-center text-muted-foreground">
                      7-day free trial
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Trust indicators.
          Removed: "Cancel anytime" (no cancel endpoint is deployed — restore when
          the billing portal ships), "30-day guarantee" (no refund mechanism), and
          "secure data encryption and GDPR compliance" (no DPA, no erasure flow).
          Only claims we can actually honour belong here. */}
      <div className="text-center space-y-4 pt-8">
        <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span>No setup fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span>7-day free trial</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;