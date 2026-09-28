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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Dumbbell, User, Mail, Lock, Calendar, Ruler, Weight, ArrowLeft, X, Zap, Target, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { validateSignUp, validateEmail } from "@/lib/validation";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { Seo } from "@/components/Seo";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, signIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("signin");

  // Plan selection state. Only 'free' is reachable: the Premium option is shown
  // for information but is not selectable, because nothing can charge for it
  // yet. billingCycle is gone with the checkout call that consumed it.
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');

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

  // Set to the signed-up address when the account was created but no session
  // came back, i.e. the confirmation email is the next step. Replaces the whole
  // form so the instruction can't be missed.
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

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
      // Ask the database, not just localStorage. Checking only the local flag
      // sent every returning user on a new browser back through onboarding,
      // because this navigate() fires before Index's own DB check can run.
      const userId = data.user?.id;
      const onboardingComplete = userId ? await hasCompletedOnboarding(userId) : false;
      navigate(onboardingComplete ? "/" : "/onboarding");
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
      // Only a real session can get through /onboarding's ProtectedRoute.
      //
      // With email confirmation enabled, signUp returns a user but session:
      // null. Navigating anyway sent the visitor straight into ProtectedRoute,
      // which bounced them back here with no explanation — the account existed
      // but nothing said why they'd been returned to the login page. So branch
      // on the session rather than assuming one.
      //
      // (There is no checkout branch here any more either: it awaited
      // createCheckoutSession then `return`ed, and because that call swallowed
      // its own rejection the early return always won.)
      if (data.session) {
        navigate("/onboarding");
      } else {
        setPendingConfirmationEmail(signUpData.email.trim());
      }
    }
  };

  // Deep links only choose the tab now. They used to be able to pre-select the
  // premium plan (/auth?trial=true&plan=premium), which set up a purchase the
  // app cannot complete.
  useEffect(() => {
    if (searchParams.get('trial') || searchParams.get('plan')) {
      setActiveTab("signup");
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

  // Public, but deliberately kept out of search results: a sign-in form has no
  // search value and would compete with the pages that do. noindex still allows
  // link following, so it does not strand the pages it links to.
  const seo = (
    <Seo
      title="FitMatePro — Sign In or Create a Free Account Today"
      description="Sign in to FitMatePro, or create a free account to start following workout programs, logging your meals and recording daily wellness check-ins."
      path="/auth"
      noindex
    />
  );
  // Account created, but no session — the confirmation link is the next step.
  // This replaces the form entirely rather than sitting alongside it: the
  // previous behaviour navigated to /onboarding, got bounced back here by
  // ProtectedRoute, and left the visitor staring at the signup form they had
  // just submitted with no idea what had happened.
  if (pendingConfirmationEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {seo}
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">FitMatePro</h1>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Confirm your email address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your account was created, but you're not signed in yet. We sent a
                confirmation link to:
              </p>

              <p className="font-medium break-all p-3 rounded-md bg-muted text-sm">
                {pendingConfirmationEmail}
              </p>

              <p className="text-sm text-muted-foreground">
                Open that email and click the link to activate your account, then
                come back and sign in. If it hasn't arrived in a few minutes,
                check your spam folder.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="wellness"
                  className="w-full"
                  onClick={() => {
                    setPendingConfirmationEmail(null);
                    setActiveTab("signin");
                  }}
                >
                  Back to sign in
                </Button>
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-2"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to FitMatePro
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {seo}
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
                  <p className="text-sm text-muted-foreground">Free is the only plan available right now</p>
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

                    {/* Premium Plan Option — informational only.
                        Not selectable: billing is not live, so choosing it here
                        could only ever produce a free account behind a paid
                        promise. The billing-cycle toggle and the "7-day free
                        trial" note are gone with it; no code implements either.
                        "Advanced meal planning" is also gone — that feature is
                        still a static mock. */}
                    <div className="relative border-2 border-muted border-dashed rounded-lg p-4 block opacity-75">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <span className="text-lg font-semibold flex items-center gap-2">
                              <Zap className="w-5 h-5 text-muted-foreground" />
                              FitMatePro Premium
                            </span>
                            <Badge variant="secondary">Coming soon</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Paid plans aren't available yet. Sign up free — you won't
                            need a card, and nothing here will charge you.
                          </p>

                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              <span>Unlimited workout tracking</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              <span>Custom workout builder</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              <span>Health data export</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
                    Sign up for free and start your fitness journey today
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

              {/* The "Payment Information" card that used to sit here is gone.
                  It promised a Stripe redirect, a 7-day trial, PCI-DSS handling
                  and "Cancel anytime" — none of which exists: no edge function
                  is deployed, so no payment was ever collected or attempted. */}

              {/* Submit Button */}
              <div className="space-y-3">
                <Button type="submit" className="w-full" variant="wellness" size="lg" disabled={loading}>
                  {loading ? (
                    "Creating Account..."
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