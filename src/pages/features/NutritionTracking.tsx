import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Apple, Camera, Search, BarChart3, Clock, Heart } from "lucide-react";
import FitMateHeader from "@/components/FitMateHeader";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from '@/components/Seo';

const NutritionTracking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Public marketing page: signed-in users go to the feature, not to sign-up.
  const startHere = () => navigate(user ? "/nutrition" : "/auth?plan=free");
  const ctaLabel = user ? "Open Nutrition Log" : "Begin Your Journey";

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Photo Food Logging",
      description: "Simply take a photo of your meal and our AI will identify ingredients and calculate nutrition."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Extensive Food Database",
      description: "Access to over 11 million foods with detailed nutritional information and serving sizes."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Macro & Micro Tracking",
      description: "Track proteins, carbs, fats, vitamins, minerals, and custom nutrition goals."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Meal Planning",
      description: "Plan your meals in advance with AI-suggested recipes that match your nutrition goals."
    }
  ];

  const nutritionGoals = [
    { goal: "Weight Loss", calories: "1,500-1,800", protein: "25-30%", carbs: "35-40%", fats: "25-30%" },
    { goal: "Muscle Gain", calories: "2,200-2,800", protein: "30-35%", carbs: "40-45%", fats: "20-25%" },
    { goal: "Maintenance", calories: "1,800-2,200", protein: "20-25%", carbs: "45-50%", fats: "25-30%" },
    { goal: "Athletic Performance", calories: "2,500-3,500", protein: "25-30%", carbs: "50-55%", fats: "20-25%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Nutrition Tracking — Log Meals, Calories and Macros"
        description="Log what you eat and watch calories, protein, carbs and fat add up against your daily goals, with a searchable food database and daily nutrition totals."
        path="/features/nutrition-tracking"
      />
      <FitMateHeader />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Apple className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Free Feature</Badge>
                <h1 className="text-4xl md:text-5xl font-bold">Nutrition Tracking</h1>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              Take control of your nutrition with intelligent food logging, macro tracking, and personalized 
              meal recommendations. Make every bite count towards your health goals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={startHere}>
                <Apple className="w-5 h-5 mr-2" />
                {user ? "Open Nutrition Log" : "Start Tracking Nutrition"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                View All Features
              </Button>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Smart Nutrition Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Nutrition Goals */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Personalized Nutrition Goals</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {nutritionGoals.map((plan, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-accent" />
                      {plan.goal}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Calories:</span>
                      <span className="font-semibold">{plan.calories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protein:</span>
                      <span className="font-semibold">{plan.protein}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carbohydrates:</span>
                      <span className="font-semibold">{plan.carbs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fats:</span>
                      <span className="font-semibold">{plan.fats}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Master Your Nutrition Today
              </h3>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Start tracking your meals and discover how proper nutrition can transform your health.
              </p>
              <Button size="lg" variant="secondary" onClick={startHere}>
                {ctaLabel}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default NutritionTracking;