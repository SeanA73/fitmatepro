import { useState, useEffect, type ReactNode } from 'react';
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

type UpgradeTrigger =
  | 'workout_limit_reached'
  | 'ai_limit_reached'
  | 'advanced_feature_attempt'
  | 'premium_feature_access';

interface UpgradePromptBaseProps {
  trigger: UpgradeTrigger;
  featureName?: string;
  className?: string;
}

// Two presentations, because the six in-page call sites were never modals —
// they render this inside an existing card, and the old hardcoded
// `fixed inset-0` turned each of them into a full-screen overlay that covered
// the very card explaining the feature.
//
// The modal variant *requires* onClose. Previously it was optional, the X only
// rendered when it was supplied, and "Continue with Free" called `onClose?.()`
// — so a modal opened without one had no way out but the browser back button.
// Making it required means the type checker catches that, not the user.
type UpgradePromptProps = UpgradePromptBaseProps &
  (
    | { variant?: 'inline'; onClose?: never }
    | { variant: 'modal'; onClose: () => void }
  );

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
    title: "Premium Feature ✨",
    message: "This advanced analytics feature is available with Premium.",
    benefits: ["Detailed insights", "Progress predictions", "Goal optimization"],
    cta: "Try Premium Free",
    alternativeCta: "Not now",
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
} as const;

export const UpgradePrompt = ({
  trigger,
  featureName,
  onClose,
  className,
  variant = 'inline',
}: UpgradePromptProps) => {
  const { createCheckoutSession, hasPremiumAccess } = useSubscription();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isModal = variant === 'modal';

  // Escape always closes the modal, so it can never trap the user.
  useEffect(() => {
    if (!isModal || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModal, onClose]);

  const scenario = UPGRADE_SCENARIOS[trigger];

  // Don't show to premium users
  if (hasPremiumAccess()) return null;

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await createCheckoutSession('premium', false);
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

  const body = (
    <Card className={`relative p-6 bg-gradient-to-br from-background via-background to-primary/5 ${isModal ? '' : className ?? ''}`}>
      {isModal && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8"
          onClick={onClose}
          aria-label="Close"
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
            <div
              key={index}
              className="flex items-center gap-3 text-sm animate-in fade-in slide-in-from-left-5 duration-500 fill-mode-backwards"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              <span>{benefit}</span>
            </div>
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
            onClick={handleUpgrade}
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

          {/* Only offered in the modal, where there is something to dismiss. */}
          {isModal && (
            <Button variant="outline" onClick={onClose} className="w-full">
              {scenario.alternativeCta}
            </Button>
          )}
        </div>

        {/* Trust indicators — "Cancel anytime" and the money-back guarantee are
            removed until a cancel endpoint and a refund process actually exist. */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>✓ No hidden fees</div>
          <div>✓ 7-day free trial</div>
        </div>
      </div>
    </Card>
  );

  if (!isModal) return body;

  // The former framer `exit` animations are not reproduced here because they
  // never ran: exit transitions require an <AnimatePresence> ancestor and there
  // was none anywhere in the app, so the modal always disappeared instantly.
  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 ${className ?? ''}`}
      // Clicking the backdrop closes too.
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md animate-in fade-in zoom-in-95 slide-in-from-bottom-5 duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        {body as ReactNode}
      </div>
    </div>
  );
};
