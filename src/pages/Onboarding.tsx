import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Target, 
  Activity, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Dumbbell,
  Apple,
  Brain,
  X
} from "lucide-react";
import FitMateHeader from "@/components/FitMateHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { cacheOnboardingComplete } from "@/lib/onboarding";

interface OnboardingData {
  fitness_goals: string[];
  activity_level: string;
  preferred_workout_time: string;
  workout_frequency: string;
  primary_focus: string;
  nutrition_priority: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fitness_goals: [],
    activity_level: "",
    preferred_workout_time: "",
    workout_frequency: "",
    primary_focus: "",
    nutrition_priority: "",
  });

  const totalSteps = 4;

  const fitnessGoals = [
    { id: "weight_loss", label: "Weight Loss", icon: "📉" },
    { id: "muscle_gain", label: "Build Muscle", icon: "💪" },
    { id: "endurance", label: "Improve Endurance", icon: "🏃" },
    { id: "flexibility", label: "Flexibility", icon: "🧘" },
    { id: "strength", label: "Strength Training", icon: "🏋️" },
    { id: "general_health", label: "General Health", icon: "❤️" },
  ];

  const toggleGoal = (goalId: string) => {
    setData(prev => ({
      ...prev,
      fitness_goals: prev.fitness_goals.includes(goalId)
        ? prev.fitness_goals.filter(g => g !== goalId)
        : [...prev.fitness_goals, goalId]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // user_preferences has no unique constraint on user_id, so .upsert({ onConflict:
  // 'user_id' }) is rejected at plan time (42P10) — it can never succeed. The
  // on_profile_created trigger already seeds one row per profile, so update that
  // row and only insert when it is genuinely missing (accounts predating the
  // trigger). notification_settings is merged, not replaced, so this never drops
  // keys written elsewhere.
  const saveOnboardingPreferences = async (settings: Record<string, Json>) => {
    const { data: existing, error: readError } = await supabase
      .from('user_preferences')
      .select('id, notification_settings')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (readError) throw readError;

    const merged: Record<string, Json> = {
      ...((existing?.notification_settings as Record<string, Json> | null) ?? {}),
      ...settings,
    };

    if (existing) {
      const { error } = await supabase
        .from('user_preferences')
        .update({ notification_settings: merged })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_preferences')
        .insert({ user_id: user!.id, notification_settings: merged });
      if (error) throw error;
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile with onboarding data
      await updateProfile({
        fitness_goals: data.fitness_goals,
        activity_level: data.activity_level as string | undefined,
      });

      // Save onboarding completion to user_preferences
      await saveOnboardingPreferences({
        onboarding_complete: true,
        onboarding_completed_at: new Date().toISOString(),
        preferred_workout_time: data.preferred_workout_time,
        workout_frequency: data.workout_frequency,
        primary_focus: data.primary_focus,
      });

      // Cache under this user's key so the next page load skips the DB round
      // trip. Sign-out clears it; it is not shared between accounts.
      cacheOnboardingComplete(user.id);
      sessionStorage.setItem('onboarding_just_completed', 'true');
      
      toast({
        title: "Welcome to FitMatePro! 🎉",
        description: "Your profile is set up. Let's start your fitness journey!",
      });
      
      navigate("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save your preferences. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) {
      navigate("/");
      return;
    }
    
    try {
      // Mark as skipped in preferences
      await saveOnboardingPreferences({
        onboarding_complete: true,
        onboarding_skipped: true,
      });

      cacheOnboardingComplete(user.id);
      navigate("/");
    } catch (error) {
      // Even if save fails, allow skip
      cacheOnboardingComplete(user.id);
      navigate("/");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.fitness_goals.length > 0;
      case 2:
        return data.activity_level !== "";
      case 3:
        return data.workout_frequency !== "" && data.preferred_workout_time !== "";
      case 4:
        return data.primary_focus !== "";
      default:
        return false;
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Welcome to FitMatePro!</h2>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {currentStep === 1 && "What are your fitness goals?"}
              {currentStep === 2 && "What's your activity level?"}
              {currentStep === 3 && "When do you like to workout?"}
              {currentStep === 4 && "What's your primary focus?"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 py-8">
            {/* Step 1: Fitness Goals */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground mb-6">
                  Select all that apply. We'll personalize your experience based on your goals.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fitnessGoals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-6 rounded-lg border-2 transition-all text-center ${
                        data.fitness_goals.includes(goal.id)
                          ? 'border-primary bg-primary/10 scale-105'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{goal.icon}</div>
                      <div className="font-medium">{goal.label}</div>
                      {data.fitness_goals.includes(goal.id) && (
                        <CheckCircle2 className="w-5 h-5 text-primary mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Activity Level */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground mb-6">
                  Help us understand your current fitness level to recommend appropriate workouts.
                </p>
                <div className="space-y-3">
                  {[
                    { value: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
                    { value: "light", label: "Lightly Active", desc: "Light exercise 1-3 days/week" },
                    { value: "moderate", label: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
                    { value: "very_active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
                    { value: "extremely_active", label: "Extremely Active", desc: "Physical job or 2x training" },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setData(prev => ({ ...prev, activity_level: level.value }))}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        data.activity_level === level.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.desc}</div>
                        </div>
                        {data.activity_level === level.value && (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Workout Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-center text-muted-foreground mb-6">
                  Let's schedule your workouts around your lifestyle.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      How often do you want to workout?
                    </Label>
                    <Select
                      value={data.workout_frequency}
                      onValueChange={(value) => setData(prev => ({ ...prev, workout_frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 days per week</SelectItem>
                        <SelectItem value="3">3 days per week</SelectItem>
                        <SelectItem value="4">4 days per week</SelectItem>
                        <SelectItem value="5">5 days per week</SelectItem>
                        <SelectItem value="6">6 days per week</SelectItem>
                        <SelectItem value="7">Every day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Preferred workout time
                    </Label>
                    <Select
                      value={data.preferred_workout_time}
                      onValueChange={(value) => setData(prev => ({ ...prev, preferred_workout_time: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (6-9 AM)</SelectItem>
                        <SelectItem value="mid_morning">Mid-Morning (9-12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5-9 PM)</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Primary Focus */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground mb-6">
                  What matters most to you right now? We'll prioritize this in your dashboard.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      id: "workouts", 
                      label: "Workouts", 
                      icon: <Dumbbell className="w-8 h-8" />,
                      desc: "Focus on training and exercise"
                    },
                    { 
                      id: "nutrition", 
                      label: "Nutrition", 
                      icon: <Apple className="w-8 h-8" />,
                      desc: "Focus on meal planning and tracking"
                    },
                    { 
                      id: "wellness", 
                      label: "Wellness", 
                      icon: <Brain className="w-8 h-8" />,
                      desc: "Focus on mental health and balance"
                    },
                  ].map((focus) => (
                    <button
                      key={focus.id}
                      onClick={() => setData(prev => ({ ...prev, primary_focus: focus.id }))}
                      className={`p-6 rounded-lg border-2 transition-all text-center ${
                        data.primary_focus === focus.id
                          ? 'border-primary bg-primary/10 scale-105'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-primary mb-3 flex justify-center">{focus.icon}</div>
                      <div className="font-medium text-lg mb-2">{focus.label}</div>
                      <div className="text-sm text-muted-foreground">{focus.desc}</div>
                      {data.primary_focus === focus.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary mx-auto mt-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-2" />
                  Skip for now
                </Button>
              </div>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
                className="min-w-[120px]"
                variant="wellness"
              >
                {loading ? (
                  "Saving..."
                ) : currentStep === totalSteps ? (
                  <>
                    Complete Setup
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Helper Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't worry, you can change these settings anytime in your profile.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
