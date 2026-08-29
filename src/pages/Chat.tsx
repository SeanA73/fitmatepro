import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Heart, Zap, Moon, Brain, Target, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePrompt } from "@/components/subscription/UpgradePrompt";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Chat = () => {
  const navigate = useNavigate();
  const { hasPremiumAccess, canUseFeature, incrementUsage, getCurrentUsage } = useSubscription();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [dailyUsage, setDailyUsage] = useState(0);
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [userDismissedPrompt, setUserDismissedPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "fitmate",
      content: "Hi there! 👋 I'm FitMatePro, your personal wellness coach. I'm here to help you with workouts, nutrition, mental wellness, and building healthy habits. How are you feeling today?",
      time: "Just now"
    }
  ]);

  const quickActions = [
    { icon: Heart, label: "Daily Check-in", color: "text-accent" },
    { icon: Zap, label: "Workout Plan", color: "text-primary" },
    { icon: Moon, label: "Sleep Tracking", color: "text-success" },
    { icon: Brain, label: "Mental Wellness", color: "text-wellness" },
    { icon: Target, label: "Goal Setting", color: "text-motivation" },
  ];

  useEffect(() => {
    const checkUsage = async () => {
      try {
        if (hasPremiumAccess()) {
          const usage = await getCurrentUsage('ai_interactions_per_month', 'monthly');
          setMonthlyUsage(usage);
          const canUse = await canUseFeature('ai_interactions_per_month', 'monthly');
          if (!canUse && !userDismissedPrompt) {
            setShowUpgradePrompt(true);
          }
        } else {
          const usage = await getCurrentUsage('ai_interactions_per_day', 'daily');
          setDailyUsage(usage);
          const canUse = await canUseFeature('ai_interactions_per_day', 'daily');
          if (!canUse && !userDismissedPrompt) {
            setShowUpgradePrompt(true);
          }
        }
      } catch {
        setDailyUsage(0);
        setMonthlyUsage(0);
      }
    };
    checkUsage();
  }, [hasPremiumAccess, canUseFeature, getCurrentUsage, userDismissedPrompt]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Check usage limits
    if (hasPremiumAccess()) {
      try {
        const canUse = await canUseFeature('ai_interactions_per_month', 'monthly');
        if (!canUse) {
          setShowUpgradePrompt(true);
          setUserDismissedPrompt(false);
          toast({
            title: "Monthly limit reached",
            description: "You've used all 150 coach chat messages this month. Contact us if you need more.",
            variant: "destructive",
          });
          return;
        }
      } catch {
        // If check fails, allow the message (fail open)
      }
      try {
        await incrementUsage('ai_interactions_per_month', 'monthly');
        const newUsage = await getCurrentUsage('ai_interactions_per_month', 'monthly');
        setMonthlyUsage(newUsage);
      } catch {
        // Increment failure is non-blocking
      }
    } else {
      try {
        const canUse = await canUseFeature('ai_interactions_per_day', 'daily');
        if (!canUse) {
          setShowUpgradePrompt(true);
          setUserDismissedPrompt(false);
          toast({
            title: "Daily limit reached",
            description: "You've used all 7 free messages today. Upgrade to Premium for 150 messages per month.",
            variant: "destructive",
          });
          return;
        }
      } catch {
        // If check fails, allow the message (fail open)
      }
      try {
        await incrementUsage('ai_interactions_per_day', 'daily');
        const newUsage = await getCurrentUsage('ai_interactions_per_day', 'daily');
        setDailyUsage(newUsage);
      } catch {
        // Increment failure is non-blocking
      }
    }

    const userMessage = message.trim();
    setMessage("");

    setMessages(prev => [...prev, {
      type: "user",
      content: userMessage,
      time: "Just now"
    }]);

    setIsLoading(true);

    try {
      // Build conversation history (include the greeting + all messages)
      const conversationHistory = messages
        .filter(m => m.type === 'fitmate' || m.type === 'user')
        .map(m => ({ type: m.type, content: m.content }))
        .concat({ type: 'user', content: userMessage });

      const { data, error } = await supabase.functions.invoke('ai-coach-chat', {
        body: { messages: conversationHistory },
      });

      if (error) {
        console.error('AI chat error:', error);
        throw error;
      }

      setMessages(prev => [...prev, {
        type: "fitmate",
        content: data?.reply || "I'm here to help! Could you try rephrasing that?",
        time: "Just now"
      }]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setMessages(prev => [...prev, {
        type: "fitmate",
        content: "I'm having a bit of trouble right now — could you try again in a moment?",
        time: "Just now"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(`Tell me about ${action.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Coach Chat</h1>
              <p className="text-sm text-muted-foreground">
                {hasPremiumAccess()
                  ? monthlyUsage >= 150
                    ? 'Monthly limit reached'
                    : `${150 - monthlyUsage}/150 messages remaining this month`
                  : dailyUsage >= 7
                    ? 'Daily limit reached — upgrade for more'
                    : `Free: ${7 - dailyUsage}/7 messages remaining today`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6 flex flex-col">
        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-3 flex flex-col gap-2"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-wellness-gradient text-white'
                  : 'bg-card border border-border'
              }`}>
                {msg.type === 'fitmate' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-success">FitMatePro</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-xs mt-2 block ${
                  msg.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                }`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-success">FitMatePro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="flex gap-3">
          <Input
            placeholder="Type your message to FitMatePro..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} variant="wellness" disabled={isLoading || !message.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        {/* Upgrade Prompt */}
        {showUpgradePrompt && !hasPremiumAccess() && (
          <div className="mt-4">
            <UpgradePrompt
              trigger="ai_limit_reached"
              featureName="ai_interactions_per_day"
              onClose={() => {
                setShowUpgradePrompt(false);
                setUserDismissedPrompt(true);
              }}
            />
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 p-3 bg-calm-gradient rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Ask FitMatePro about workouts, nutrition advice, goal setting, or just how you're feeling today. 
            I'm here to support your wellness journey!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;