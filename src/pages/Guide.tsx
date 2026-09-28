import FitMateHeader from "@/components/FitMateHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Apple, 
  MessageSquare, 
  TrendingUp, 
  Crown, 
  ShoppingBag,
  Heart,
  Target,
  Calendar,
  CheckCircle2,
  Zap,
  Users,
  Download,
  Palette,
  ChefHat,
  Award,
  DollarSign,
  Info,
  PlayCircle,
  Clock
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Seo } from '@/components/Seo';

const Guide = () => {
  const features = [
    {
      icon: Dumbbell,
      title: "Workout Planning",
      badge: "Free & Premium",
      description: "Track workouts and create custom plans",
      details: [
        "Browse pre-built workout programs for different fitness goals",
        "Free users: 3 workouts per week",
        "Premium users: Unlimited workout tracking",
        "Create custom workout plans with exercise builder",
        "Track sets, reps, and weights for each exercise",
        "Monitor workout history and progress over time"
      ]
    },
    {
      icon: Apple,
      title: "Nutrition Tracking",
      badge: "Free & Premium",
      description: "Log meals and track your nutrition",
      details: [
        "Simple meal logging for free users",
        "Search extensive food database",
        "Track calories and macros (protein, carbs, fat)",
        "Premium: Automated meal planning",
        "Premium: Weekly meal plans with shopping lists",
        "View daily nutrition summaries and trends"
      ]
    },
    {
      icon: Heart,
      title: "Mental Wellness",
      badge: "All Users",
      description: "Track your overall wellbeing",
      details: [
        "Daily wellness check-ins",
        "Rate your mood, energy, and stress levels",
        "Track sleep quality",
        "Log daily activities and notes",
        "View wellness trends over time",
        "Identify patterns between fitness and mental health"
      ]
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      badge: "Premium",
      description: "Detailed insights into your journey",
      details: [
        "Track weight, body measurements, and fitness metrics",
        "View workout volume and consistency",
        "Monitor nutrition adherence",
        "Identify strengths and areas for improvement",
        "Export health data in multiple formats"
      ]
    },
    {
      icon: ShoppingBag,
      title: "Fitness Shop",
      badge: "All Users",
      description: "Curated fitness products and gear",
      details: [
        "Browse equipment, supplements, and apparel",
        "Filter by category and price",
        "Read detailed product descriptions",
        "View ratings and reviews",
        "Get personalized product recommendations",
        "Shop from trusted fitness brands"
      ]
    },
    {
      icon: Award,
      title: "Coach's Picks",
      badge: "All Users",
      description: "Curated product recommendations from fitness experts",
      details: [
        "Browse hand-selected fitness products and gear",
        "Filter by category: Equipment, Nutrition, Recovery, Apparel",
        "View featured products with exclusive deals",
        "See contextual recommendations based on your workouts",
        "Get suggestions matched to your fitness goals",
        "Products earn commission to support app development"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do I upgrade to Premium?",
      answer: "Open the menu under your avatar in the header and choose \"Premium Features\" (the crown icon). That page lists what Premium includes and has an Upgrade button that takes you to Pricing, where you can compare plans and start checkout."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes. Go to Profile > Subscription and use \"Cancel Subscription\". You'll retain access until the end of your billing period."
    },
    {
      question: "How do I track a workout?",
      answer: "Go to Workouts > Start a Workout. Choose a pre-built program or create your own. During the workout, log each set by entering weight and reps. Complete the workout to save it to your history."
    },
    {
      question: "How do I log meals?",
      answer: "Navigate to Nutrition and click 'Add Meal'. Search our food database, select items, and log serving sizes. You can also add custom foods or use photo logging (Premium)."
    },
    {
      question: "What are the usage limits for free users?",
      answer: "Free users can track 3 workouts per week and have 3 coaching interactions per day. Simple meal logging is unlimited. Upgrade to Premium for unlimited access to all features."
    },
    {
      question: "How do I export my data?",
      answer: "Premium users can export their health data from the Premium Features page (avatar menu > Premium Features). Choose from PDF, CSV, or JSON formats to download your fitness history."
    },
    {
      question: "Can I use the app offline?",
      answer: "The app requires an internet connection for most features. However, your recent data is cached locally for quick access."
    },
    {
      question: "What is Coach's Picks?",
      answer: "Coach's Picks is a curated selection of fitness products recommended by our team. These include equipment, supplements, apparel, and recovery tools that align with your fitness journey. When you purchase through our links, we earn a small commission that helps support the app's development at no extra cost to you."
    },
    {
      question: "Are the product recommendations personalized?",
      answer: "Yes! Product recommendations are contextual based on your activities. For example, after logging strength workouts, you'll see equipment recommendations. After tracking meals, you'll see nutrition products. This ensures the suggestions are relevant to your current fitness focus."
    }
  ];

  const gettingStarted = [
    {
      step: 1,
      title: "Complete Your Profile",
      description: "Add your fitness goals, current stats, and preferences for personalized recommendations."
    },
    {
      step: 2,
      title: "Do a Wellness Check-In",
      description: "Start with a daily wellness check-in to establish baseline metrics for mood, energy, and sleep."
    },
    {
      step: 3,
      title: "Choose a Workout Program",
      description: "Browse workout programs that match your goals (strength, cardio, flexibility, etc.) and start your first workout."
    },
    {
      step: 4,
      title: "Log Your First Meal",
      description: "Track your nutrition by logging breakfast, lunch, or dinner. This helps you understand your eating patterns."
    },
    {
      step: 5,
      title: "Chat with Your Coach",
      description: "Ask questions, get workout tips, or request personalized advice from your coach."
    },
    {
      step: 6,
      title: "Consider Premium",
      description: "If you love the app, upgrade to Premium for unlimited workouts, coaching, and advanced meal planning."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="FitMatePro Guide — How to Track Workouts and Meals"
        description="A walkthrough of every feature: browsing workout programs, building custom plans, logging meals and macros, and what Free and Premium each include."
        path="/guide"
      />
      <FitMateHeader />
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
                <Target className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                User Guide
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to know to make the most of <span className="text-primary font-semibold">FitMatePro</span>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Dumbbell className="w-4 h-4 mr-2" />
                Workout Tracking
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Apple className="w-4 h-4 mr-2" />
                Nutrition Plans
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                Coaching
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progress Analytics
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  App Features Overview
                </CardTitle>
                <CardDescription>
                  Explore everything FitMatePro has to offer
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <Badge variant="secondary">{feature.badge}</Badge>
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Premium Features Highlight */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-primary" />
                  <CardTitle>Premium Exclusive Features</CardTitle>
                </div>
                <CardDescription>
                  Unlock the full potential of FitMatePro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Dumbbell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Unlimited Workouts</p>
                      <p className="text-sm text-muted-foreground">Track as many workouts as you need</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Unlimited Coaching</p>
                      <p className="text-sm text-muted-foreground">24/7 access to your coach</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChefHat className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Advanced Meal Planning</p>
                      <p className="text-sm text-muted-foreground">Weekly meal plans</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Data Export</p>
                      <p className="text-sm text-muted-foreground">Download your health data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Palette className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Theme Customization</p>
                      <p className="text-sm text-muted-foreground">Dark mode and custom colors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Your First Week
                </CardTitle>
                <CardDescription>
                  Follow these steps to get the most out of FitMatePro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {gettingStarted.map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">{item.step}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Log workouts immediately after completing them for accuracy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Take progress photos weekly to see visual changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Use the coach when you're unsure about form or technique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Check in daily for best wellness tracking results</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Community Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Join group classes for motivation and accountability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Share your progress in wellness check-ins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Browse the shop for quality fitness gear recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">Set realistic goals and celebrate small wins</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about FitMatePro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle>Still Have Questions?</CardTitle>
                <CardDescription>
                  We're here to help you succeed on your fitness journey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Chat with our coach for instant help, or reach out to our support team.
                </p>
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Coach Support</p>
                    <p className="text-sm text-muted-foreground">
                      Ask your coach any questions - available in the Chat section
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliates Tab */}
          <TabsContent value="affiliates" className="space-y-6">
            {/* Affiliate Disclosure */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600" />
                  <CardTitle>Affiliate Disclosure</CardTitle>
                </div>
                <CardDescription>
                  Transparency about our product recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  FitMatePro participates in affiliate marketing programs, including Amazon Associates and other fitness retailers. 
                  When you purchase products through our "Coach's Picks" or product recommendations, we may earn a small commission 
                  at no additional cost to you.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">No Extra Cost</p>
                      <p className="text-sm text-muted-foreground">
                        Prices remain the same whether you use our links or not
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Supports Development</p>
                      <p className="text-sm text-muted-foreground">
                        Commissions help us maintain and improve the app
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Honest Recommendations</p>
                      <p className="text-sm text-muted-foreground">
                        We only recommend products we believe will benefit your fitness journey
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Contextual & Personalized</p>
                      <p className="text-sm text-muted-foreground">
                        Suggestions are based on your workouts, nutrition, and goals
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affiliate Performance */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <CardTitle>Understanding Affiliate Metrics</CardTitle>
                </div>
                <CardDescription>
                  How we track and measure product recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Click Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        Every time you click on a product recommendation, we track which product 
                        was clicked and from which page. This helps us understand which recommendations 
                        are most helpful to users.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Conversion Tracking</p>
                      <p className="text-sm text-muted-foreground">
                        When a purchase is made through our affiliate links, it's recorded as a conversion. 
                        This helps us measure the effectiveness of our recommendations and earn commission.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Conversion Rate</p>
                      <p className="text-sm text-muted-foreground">
                        The percentage of clicks that result in purchases. A higher conversion rate means 
                        our recommendations are well-matched to user needs.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium mb-2">Top Products</p>
                      <p className="text-sm text-muted-foreground">
                        We track which products get the most clicks and conversions to feature the most 
                        popular and useful items in Coach's Picks.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>
                  Step-by-step video guides to help you master FitMatePro
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Getting Started Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Getting Started</CardTitle>
                <CardDescription>
                  New to FitMatePro? Start here with these essential tutorials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Account Setup & First Steps</p>
                        </div>
                      </div>
                      {/* Placeholder for video embed */}
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Account Setup & First Steps"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Account Setup & First Steps</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>5:30</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Learn how to create your account, complete your profile, and navigate the dashboard
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Setting Your Fitness Goals</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Setting Your Fitness Goals"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Setting Your Fitness Goals</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>4:15</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Define your fitness objectives and let FitMatePro create a personalized plan
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workout Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  Workout Tracking
                </CardTitle>
                <CardDescription>
                  Master workout logging and planning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">How to Log a Workout</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="How to Log a Workout"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">How to Log a Workout</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>6:45</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Step-by-step guide to tracking your workouts, sets, reps, and weight
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Creating Custom Workouts</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Creating Custom Workouts"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Creating Custom Workouts</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>8:20</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Build personalized workout plans tailored to your goals and preferences
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Apple className="w-5 h-5 text-primary" />
                  Nutrition Tracking
                </CardTitle>
                <CardDescription>
                  Learn to track your meals and hit your macro goals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Logging Your Meals</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Logging Your Meals"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Logging Your Meals</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>5:50</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quick and easy meal logging with barcode scanning and food database search
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Understanding Macros</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Understanding Macros"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Understanding Macros</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>7:30</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Learn about protein, carbs, and fats and how to balance them for your goals
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coaching Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Coaching
                </CardTitle>
                <CardDescription>
                  Get the most out of your coach
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Using Your Coach</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Using Your Coach"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Using Your Coach</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>6:00</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get personalized advice, workout suggestions, and form tips from your coach
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Analyzing Your Progress</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Analyzing Your Progress"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold">Analyzing Your Progress</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>5:15</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Review your progress reports and understand your fitness trends
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Features Videos */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Premium Features
                </CardTitle>
                <CardDescription>
                  Advanced tutorials for Premium subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Meal Planning</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Meal Planning"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Meal Planning</h3>
                        <Badge variant="default" className="text-xs">Premium</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>9:00</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Create personalized weekly meal plans with shopping lists
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border relative group">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <div className="text-center space-y-2">
                          <PlayCircle className="w-16 h-16 text-primary mx-auto" />
                          <p className="text-sm font-medium">Advanced Analytics</p>
                        </div>
                      </div>
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Advanced Analytics"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Advanced Analytics</h3>
                        <Badge variant="default" className="text-xs">Premium</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>7:45</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Deep dive into your progress reports and performance metrics
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Guide;
