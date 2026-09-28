import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Apple,
  Brain,
  MessageCircle,
  Users,
  Zap,
  Heart,
  Trophy
} from "lucide-react";

const FeaturesSection = () => {
  const navigate = useNavigate();
  // Each card carries its own destination. This used to be an index lookup into
  // a separate array whose order didn't match, so "Custom Workout Plans" opened
  // the personal-coaching page. Cards for deleted pages (advanced analytics,
  // goal setting, wearable integration, personal coaching) are gone with them.
  const features = [
    {
      icon: <Dumbbell className="w-8 h-8 text-primary" />,
      title: "Workout Planning",
      description: "Follow structured programs or build your own, and track every session.",
      badge: "Free",
      route: "/features/workout-planning",
      highlights: ["Structured programs", "Exercise library", "Session tracking"]
    },
    {
      icon: <Apple className="w-8 h-8 text-primary" />,
      title: "Nutrition Tracking",
      description: "Log meals and track calories and macros against your daily targets.",
      badge: "Free",
      route: "/features/nutrition-tracking",
      highlights: ["Meal logging", "Macro tracking", "Daily targets"]
    },
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Mental Wellness",
      description: "Daily check-ins for mood, energy, sleep and stress, with trends over time.",
      badge: "Free",
      route: "/features/mental-wellness",
      highlights: ["Mood tracking", "Sleep and stress", "Wellness trends"]
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-accent" />,
      title: "Coach Chat",
      description: "A guided chat space for your fitness questions.",
      badge: "Free",
      route: "/features/ai-coaching",
      highlights: ["Quick prompts", "Fitness guidance", "Wellness support"]
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Community Features",
      description: "Share achievements and connect with like-minded people.",
      badge: "Premium",
      route: "/features/community-features",
      highlights: ["Social sharing", "Challenges", "Shared goals"]
    },
    {
      icon: <Trophy className="w-8 h-8 text-accent" />,
      title: "Custom Workout Plans",
      description: "Create and save your own personalized workout routines tailored to your goals.",
      badge: "Premium",
      route: "/premium",
      highlights: ["Custom routines", "Exercise builder", "Saved to your account"]
    }
  ];

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "Free": return "secondary";
      case "Premium": return "default";
      default: return "secondary";
    }
  };

  return (
    <section id="features" className="py-24 bg-muted/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="block">Everything You Need for</span>
            <span className="block text-primary">Complete Wellness</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From workout tracking to meal planning, FitMatePro provides comprehensive tools 
            to support your fitness journey at every step.
          </p>
        </div>

        {/* Group features by access level for better visual organization */}
        <div className="space-y-12">
          {/* Free Features */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border"></div>
              <h3 className="text-lg font-semibold text-muted-foreground">Free Features</h3>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.filter(f => f.badge === "Free").map((feature, index) => {

                return (
                  <Card 
                    key={index} 
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-muted cursor-pointer"
                    onClick={() => navigate(feature.route)}
                  >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <Badge variant={getBadgeVariant(feature.badge)}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Heart className="w-3 h-3 text-accent" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Premium Features */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border"></div>
              <h3 className="text-lg font-semibold text-primary">Premium Features</h3>
              <div className="h-px flex-1 bg-border"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.filter(f => f.badge === "Premium").map((feature, index) => {

                return (
                  <Card 
                    key={index} 
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20 cursor-pointer bg-gradient-to-br from-primary/5 to-transparent"
                    onClick={() => navigate(feature.route)}
                  >
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <Badge variant={getBadgeVariant(feature.badge)}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Heart className="w-3 h-3 text-accent" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Ready to Start Your Transformation?
            </h3>
            <p className="text-base sm:text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Build your routine with workout tracking, meal planning, and daily check-ins. 
              Start your free trial today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-white text-primary hover:bg-white/90 transition-colors px-8 py-4 rounded-full font-semibold text-lg"
                onClick={() => navigate("/auth?trial=true&plan=premium")}
              >
                Start Free Trial
              </button>
              {/* Was scrolling to [data-section="pricing"], which no element
                  carries — the button silently did nothing. */}
              <button
                className="border-2 border-white/30 text-white hover:bg-white/10 transition-colors px-8 py-4 rounded-full font-semibold text-lg"
                onClick={() => navigate("/pricing")}
              >
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;