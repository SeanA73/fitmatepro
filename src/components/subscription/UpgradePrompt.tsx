import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Zap,
  Crown,
  Star,
  X,
  Clock
} from 'lucide-react';

interface UpgradePromptProps {
  trigger: 'workout_limit_reached' | 'ai_limit_reached' | 'advanced_feature_attempt' | 'premium_feature_access';
  featureName?: string;
  onClose?: () => void;
  className?: string;
}

const UPGRADE_SCENARIOS = {
  'workout_limit_reached': {
    icon: <Zap className="h-6 w-6" />,
    title: "You're on fire! 🔥",
    message: "You've hit your 3 workout limit this week. Want to keep the momentum going?",
    benefits: ["Unlimited workouts", "Advanced tracking", "Custom workout plans"],
    cta: "Upgrade to Premium",
    alternativeCta: "Maybe later",
    urgency: "high"
  },
  'ai_limit_reached': {
    icon: <Star className="h-6 w-6" />,
    title: "FitMatePro wants to help more! 🤖",
    message: "You've used your 7 daily coach chat messages. Upgrade to Premium for 150 messages per month!",
    benefits: ["150 coach chats per month", "Custom workout builder", "Advanced meal planning"],
    cta: "Get Premium Coaching",
    alternativeCta: "Maybe later",
    urgency: "medium"
  },
  'advanced_feature_attempt': {
    icon: <Crown className="h-6 w-6" />,
    title: "Premium Feature Detected! ✨",
    message: "This advanced analytics feature is available with Premium.",
    benefits: ["Detailed insights", "Progress predictions", "Goal optimization"],
    cta: "Try Premium Free",
    alternativeCta: "View Basic Version",
    urgency: "low"
  },
  'premium_feature_access': {
    icon: <Crown className="h-6 w-6" />,
    title: "Unlock Your Full Potential! 💪",
    message: "Take your fitness journey to the next level with premium features.",
    benefits: ["Unlimited workout tracking", "Custom workout plans", "Export your health data"],
    cta: "Start Free Trial",
    alternativeCta: "Continue with Free",
    urgency: "low"
  }
};

export const UpgradePrompt = ({ trigger, featureName, onClose, className }: UpgradePromptProps) => {
  const { createCheckoutSession, hasPremiumAccess } = useSubscription();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const scenario = UPGRADE_SCENARIOS[trigger];

  // Don't show to premium users
  if (hasPremiumAccess()) return null;

  const handleUpgrade = async (planType: 'premium' = 'premium') => {
    setIsUpgrading(true);
    try {
      await createCheckoutSession(planType, false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upgrade. Please try again.';
      toast({
        title: "Upgrade Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleAlternative = () => {
    onClose?.();
  };

  return (
    <motion.div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="relative p-6 bg-gradient-to-br from-background via-background to-primary/5">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <div className="text-center space-y-6">
            {/* Icon and urgency indicator */}
            <div className="relative inline-flex">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                {scenario.icon}
              </div>
              {scenario.urgency === 'high' && (
                <div className="absolute -top-1 -right-1">
                  <Badge variant="destructive" className="text-xs px-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Limited
                  </Badge>
                </div>
              )}
            </div>

            {/* Title and message */}
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{scenario.title}</h3>
              <p className="text-muted-foreground">{scenario.message}</p>
            </div>

            {/* Benefits list */}
            <div className="space-y-2">
              {scenario.benefits.map((benefit, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-3 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Pricing highlight */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$4.99/month</div>
                <div className="text-sm text-muted-foreground">
                  or $47.99/year (save 20%)
                </div>
                <Badge variant="secondary" className="mt-2">
                  7-day free trial
                </Badge>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => handleUpgrade('premium')}
                disabled={isUpgrading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isUpgrading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    {scenario.cta}
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleAlternative}
                className="w-full"
              >
                {scenario.alternativeCta}
              </Button>
            </div>

            {/* Trust indicators — "Cancel anytime" and the money-back guarantee are
                removed until a cancel endpoint and a refund process actually exist. */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>✓ No hidden fees</div>
              <div>✓ 7-day free trial</div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};