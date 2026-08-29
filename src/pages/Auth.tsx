import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Dumbbell, User, Mail, Lock, Calendar, Ruler, Weight, ArrowLeft, X, Zap, Target, Check, CreditCard, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { validateSignUp, validateEmail } from "@/lib/validation";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signIn, loading } = useAuth();
  const { createCheckoutSession } = useSubscription();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("signin");
  
  // Plan selection state
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    fitness_goals: [] as string[],
  });
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});
  const [signInErrors, setSignInErrors] = useState<Record<string, string>>({});

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    if (!signInData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(signInData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!signInData.password) {
      errors.password = 'Password is required';
    }
    
    setSignInErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    const { data, error } = await signIn(signInData.email, signInData.password);
    if (data && !error) {
      // Check if onboarding is complete
      const onboardingComplete = localStorage.getItem('onboarding_complete');
      if (!onboardingComplete) {
        navigate("/onboarding");
      } else {
        navigate("/");
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateSignUp({
      email: signUpData.email,
      password: signUpData.password,
      full_name: signUpData.full_name,
    });
    
    setSignUpErrors(validation.errors);
    if (!validation.isValid) return;
    
    // Create account first
    const { data, error } = await signUp(signUpData.email, signUpData.password, {
      full_name: signUpData.full_name,
      date_of_birth: signUpData.date_of_birth || null,
      gender: signUpData.gender || null,
      height_cm: signUpData.height_cm ? parseInt(signUpData.height_cm) : null,
      weight_kg: signUpData.weight_kg ? parseFloat(signUpData.weight_kg) : null,
      activity_level: signUpData.activity_level || null,
      fitness_goals: signUpData.fitness_goals,
    });
    
    if (data && !error) {
      if (selectedPlan === 'premium') {
        // Start Stripe checkout for Premium
        try {
          await createCheckoutSession('premium', billingCycle === 'annual');
          // User will be redirected to Stripe checkout
          return;
        } catch (error) {
          toast({
            title: "Error",
            description: "Account created but failed to start premium checkout. You can upgrade later.",
            variant: "destructive"
          });
        }
      }
      
      // For free plan, go to onboarding
      navigate("/onboarding");
    }
  };

  // Check URL parameters for trial signup
  useEffect(() => {
    const trial = searchParams.get('trial');
    const plan = searchParams.get('plan');
    if (trial === 'true' || plan === 'premium') {
      setActiveTab("signup");
      setSelectedPlan('premium');
    } else if (plan === 'free') {
      setActiveTab("signup");
      setSelectedPlan('free');
    }
  }, [searchParams]);

  const toggleFitnessGoal = (goal: string) => {
    setSignUpData(prev => ({
      ...prev,
      fitness_goals: prev.fitness_goals.includes(goal)
        ? prev.fitness_goals.filter(g => g !== goal)
        : [...prev.fitness_goals, goal]
    }));
  };

  const fitnessGoals = [
    "weight_loss",
    "muscle_gain", 
    "endurance",
    "flexibility",
    "strength",
    "general_health"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Skip/Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to FitMatePro
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Skip for now
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">FitMatePro</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Your Personal Health & Wellness Coach</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">Sign in to save your progress and get personalized coaching</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Welcome Back
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        value={signInData.password}
                        onChange={(e) => {
                          setSignInData({...signInData, password: e.target.value});
                          if (signInErrors.password) {
                            setSignInErrors({...signInErrors, password: ''});
                          }
                        }}
                        placeholder="••••••••"
                        className={`pl-10 ${signInErrors.password ? 'border-destructive' : ''}`}
                        required
                      />
                    </div>
                    {signInErrors.password && (
                      <p className="text-sm text-destructive mt-1">{signInErrors.password}</p>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full" variant="wellness" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Plan Selection */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Choose Your Plan
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Select Free or Premium to get started</p>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as 'free' | 'premium')} className="space-y-4">
                    {/* Free Plan Option */}
                    <label 
                      htmlFor="plan-free"
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all block ${
                        selectedPlan === 'free' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="free" id="plan-free" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="plan-free" className="text-lg font-semibold cursor-pointer flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" />
                              FitMatePro Free
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Perfect for getting started with basic fitness tracking</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span>Basic workout tracking (3/week)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span>Simple nutrition logging</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span>Coach chat preview (3 messages/day)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Premium Plan Option */}
                    <label 
                      htmlFor="plan-premium"
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all block ${
                        selectedPlan === 'premium' 
                          ? 'border-primary bg-primary/10 shadow-md' 
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value="premium" id="plan-premium" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="plan-premium" className="text-lg font-semibold cursor-pointer flex items-center gap-2">
                              <Zap className="w-5 h-5 text-primary" />
                              FitMatePro Premium
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Unlock everything FitMatePro has to offer</p>
                          
                          {/* Billing Cycle Toggle for Premium */}
                          {selectedPlan === 'premium' && (
                            <div className="mb-3 p-3 bg-muted rounded-md" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Billing Cycle</span>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setBillingCycle('monthly');
                                    }}
                                  >
                                    Monthly
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={billingCycle === 'annual' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setBillingCycle('annual');
                                    }}
                                  >
                                    Annual <span className="ml-1 text-xs">(Save 20%)</span>
                                  </Button>
                                </div>
                              </div>
                              <div className="text-lg font-bold text-primary">
                                ${billingCycle === 'monthly' ? '4.99' : '4.00'}/month
                                {billingCycle === 'annual' && (
                                  <span className="text-sm text-muted-foreground font-normal ml-2">
                                    (${47.99}/year)
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span>Unlimited workout tracking</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span>Advanced meal planning</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span>Custom workout builder</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-success" />
                              <span>All premium features included</span>
                            </div>
                            {selectedPlan === 'premium' && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <div className="flex items-center gap-2 text-xs text-primary">
                                  <Shield className="w-3 h-3" />
                                  <span>🎉 7-day free trial</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Create Your Account
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlan === 'free' 
                      ? 'Sign up for free and start your fitness journey today'
                      : 'Create your account to start your 7-day free trial of Premium'
                    }
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        value={signUpData.full_name}
                        onChange={(e) => {
                          setSignUpData({...signUpData, full_name: e.target.value});
                          if (signUpErrors.full_name) {
                            setSignUpErrors({...signUpErrors, full_name: ''});
                          }
                        }}
                        placeholder="John Doe"
                        required
                        className={signUpErrors.full_name ? 'border-destructive' : ''}
                      />
                      {signUpErrors.full_name && (
                        <p className="text-sm text-destructive mt-1">{signUpErrors.full_name}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          value={signUpData.email}
                          onChange={(e) => {
                            setSignUpData({...signUpData, email: e.target.value});
                            if (signUpErrors.email) {
                              setSignUpErrors({...signUpErrors, email: ''});
                            }
                          }}
                          placeholder="your@email.com"
                          className={`pl-10 ${signUpErrors.email ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {signUpErrors.email && (
                        <p className="text-sm text-destructive mt-1">{signUpErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          value={signUpData.password}
                          onChange={(e) => {
                            setSignUpData({...signUpData, password: e.target.value});
                            if (signUpErrors.password) {
                              setSignUpErrors({...signUpErrors, password: ''});
                            }
                          }}
                          placeholder="••••••••"
                          className={`pl-10 ${signUpErrors.password ? 'border-destructive' : ''}`}
                          minLength={6}
                          required
                        />
                      </div>
                      {signUpErrors.password && (
                        <p className="text-sm text-destructive mt-1">{signUpErrors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-dob">Date of Birth <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-dob"
                          type="date"
                          value={signUpData.date_of_birth}
                          onChange={(e) => setSignUpData({...signUpData, date_of_birth: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-gender">Gender <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Select value={signUpData.gender} onValueChange={(value) => setSignUpData({...signUpData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-height">Height (cm) <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-height"
                          type="number"
                          value={signUpData.height_cm}
                          onChange={(e) => setSignUpData({...signUpData, height_cm: e.target.value})}
                          placeholder="170"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="signup-weight">Weight (kg) <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-weight"
                          type="number"
                          value={signUpData.weight_kg}
                          onChange={(e) => setSignUpData({...signUpData, weight_kg: e.target.value})}
                          placeholder="70"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="signup-activity">Activity Level <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Select value={signUpData.activity_level} onValueChange={(value) => setSignUpData({...signUpData, activity_level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                          <SelectItem value="lightly_active">Lightly Active (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="very_active">Very Active (hard exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="extremely_active">Extremely Active (very hard exercise & physical job)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2">
                      <Label>Fitness Goals <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {fitnessGoals.map(goal => (
                          <div key={goal} className="flex items-center space-x-2">
                            <Checkbox
                              id={`goal-${goal}`}
                              checked={signUpData.fitness_goals.includes(goal)}
                              onCheckedChange={() => toggleFitnessGoal(goal)}
                            />
                            <Label htmlFor={`goal-${goal}`} className="text-sm capitalize">
                              {goal.replace('_', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information - Only for Premium */}
              {selectedPlan === 'premium' && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Payment Information
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected to secure payment after creating your account. No charge during your 7-day free trial.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Selected Plan</span>
                          <Badge variant="default">Premium</Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Billing Cycle</span>
                          <span className="text-sm font-semibold capitalize">{billingCycle}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Price</span>
                          <span className="text-lg font-bold text-primary">
                            ${billingCycle === 'monthly' ? '4.99' : '47.99'}
                            <span className="text-sm font-normal text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                        <Shield className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-success mb-1">Secure Payment Process</p>
                          <p className="text-muted-foreground">
                            After account creation, you'll be redirected to Stripe for secure payment processing. 
                            Your card won't be charged until after your 7-day free trial ends.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>256-bit SSL encryption • PCI-DSS compliant • Cancel anytime</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="space-y-3">
                <Button type="submit" className="w-full" variant="wellness" size="lg" disabled={loading}>
                  {loading ? (
                    "Creating Account..."
                  ) : selectedPlan === 'premium' ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Create Account & Start Free Trial
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Create Free Account
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
        {/* Footer message */}
        <div className="text-center mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            New to FitMatePro?{" "}
            <button 
              onClick={() => {
                setActiveTab("signup");
                setSelectedPlan('free');
              }}
              className="text-primary hover:underline font-medium"
            >
              Create a free account
            </button>
            {" "}to get started with basic features. Upgrade to Premium anytime for unlimited access to all features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;