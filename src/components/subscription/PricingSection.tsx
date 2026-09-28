import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
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
      // 'Advanced meal planning' is not sold here: AdvancedMealPlanning is a
      // static mock, and meal_plans/meal_plan_items/recipes/shopping_lists were
      // dropped in the schema squash, so there is nothing to persist it to.
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

// The purchase path is switched off here until Stripe is wired: no edge
// functions are deployed to this project, so create-checkout-session 404s and
// the price IDs on both sides are placeholders. To re-enable, restore a
// handleSelectPlan that calls useSubscription().createCheckoutSession — it
// rejects honestly now — and drop the `plan.id === 'premium'` guards below.
export const PricingSection = ({ showTitle = true, className }: PricingSectionProps) => {
  const { getCurrentPlan } = useSubscription();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);

  const currentPlan = getCurrentPlan();

  const getButtonText = (plan: PricingPlan) => {
    // Premium is never actionable while billing is off.
    if (plan.id === 'premium') {
      return currentPlan === 'premium' ? 'Current Plan' : 'Coming Soon';
    }

    if (!user) return 'Get Started Free';

    return currentPlan === 'free' ? 'Current Plan' : 'Downgrade';
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
            <div
              key={plan.id}
              // CSS, not framer-motion. This component is imported directly by
              // the landing page, so framer sat on the critical path of the most
              // performance-sensitive route in the app — 113 kB raw / 37 kB gzip
              // to fade two cards in. tailwindcss-animate was already a
              // dependency and does the same thing with no JS.
              className="relative animate-in fade-in slide-in-from-bottom-5 duration-500 fill-mode-backwards"
              style={{ animationDelay: `${index * 100}ms` }}
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

                  {/* CTA Button.
                      Premium cannot be bought yet, so its button is inert. The
                      old handler sent signed-out visitors to
                      /auth?trial=true&plan=premium, which pre-selected a plan
                      nothing could fulfil; signed-out visitors now get plain
                      /auth. */}
                  <Button
                    className="w-full"
                    variant={getButtonVariant(plan)}
                    size="lg"
                    disabled={
                      plan.id === 'premium' ||
                      (user && plan.id === 'free' && currentPlan === 'free')
                    }
                    onClick={() => {
                      if (plan.id === 'premium') return;
                      if (!user) window.location.href = '/auth';
                    }}
                  >
                    {getButtonText(plan)}
                  </Button>

                  {plan.id === 'premium' && !isCurrentPlan && (
                    <p className="text-xs text-center text-muted-foreground">
                      Premium isn't purchasable yet — billing isn't live. Everything
                      in the Free plan works today.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Trust indicators.
          Removed: "Cancel anytime" (no cancel endpoint is deployed — restore when
          the billing portal ships), "30-day guarantee" (no refund mechanism),
          "secure data encryption and GDPR compliance" (no DPA, no erasure flow),
          and "7-day free trial" (trial_period_days only exists inside an
          undeployed edge function — nothing implements it).
          Only claims we can actually honour belong here. */}
      <div className="text-center space-y-4 pt-8">
        <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span>No setup fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span>Free plan, no card required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;