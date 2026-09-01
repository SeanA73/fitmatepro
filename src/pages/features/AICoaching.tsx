import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Zap, Clock, Brain, TrendingUp, Star } from "lucide-react";
import FitMateHeader from "@/components/FitMateHeader";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from '@/components/Seo';

const AICoaching = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Public marketing page. Signed-in users go to the chat; the upgrade CTA
  // sends them to pricing rather than back to the login screen.
  const startHere = () => navigate(user ? "/chat" : "/auth?plan=free");
  const upgradeHere = () => navigate(user ? "/pricing" : "/auth?trial=true&plan=premium");

  const features = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Availability",
      description: "Get instant answers to your fitness questions anytime, anywhere, without waiting for appointments."
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Personalized Advice",
      description: "Receive tailored recommendations based on your goals, progress, and personal preferences."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Insights",
      description: "Get detailed analysis of your fitness journey with actionable insights for improvement."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Motivation",
      description: "Receive encouragement, tips, and motivation exactly when you need it most."
    }
  ];

  const coachingTopics = [
    "Workout form and technique",
    "Nutrition and meal planning",
    "Goal setting and achievement",
    "Overcoming plateaus",
    "Injury prevention",
    "Motivation and mindset",
    "Sleep and recovery",
    "Supplement guidance"
  ];

  const testimonials: { name: string; text: string; rating: number }[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Coaching — Fitness Answers Whenever You Need Them"
        description="Ask about training, form, nutrition and goal setting, and get guidance shaped by the workouts and meals you have actually logged, not generic advice."
        path="/features/ai-coaching"
        noindex
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
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-accent" />
              </div>
              <div>
                <Badge variant="default" className="mb-2">Premium Feature</Badge>
                <h1 className="text-4xl md:text-5xl font-bold">Personal Coach</h1>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              Get unlimited access to your personal fitness coach. Ask questions, receive personalized
              advice, and get motivation whenever you need it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={startHere}>
                <MessageCircle className="w-5 h-5 mr-2" />
                {user ? "Open Coach Chat" : "Try Coach Chat"}
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
            <h2 className="text-3xl font-bold text-center mb-12">Your Personal Coach</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
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

        {/* Coaching Topics */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What You Can Ask About</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {coachingTopics.map((topic, index) => (
                <Card key={index} className="text-center p-4">
                  <CardContent className="pt-4">
                    <MessageCircle className="w-8 h-8 text-accent mx-auto mb-3" />
                    <p className="font-medium">{topic}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                    <p className="font-semibold">- {testimonial.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How Coaching Works</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ask Your Question</h3>
                  <p className="text-muted-foreground">Type your fitness question in natural language - no need for special commands.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">We Analyze Your Profile</h3>
                  <p className="text-muted-foreground">We consider your goals, fitness level, and progress history to provide personalized advice.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Instant Response</h3>
                  <p className="text-muted-foreground">Receive detailed, actionable advice tailored specifically to your situation and goals.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Get Your Personal Coach
              </h3>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Upgrade to Premium and get unlimited access to personalized fitness coaching.
              </p>
              <Button size="lg" variant="secondary" onClick={upgradeHere}>
                {user ? "See Plans" : "Start Premium Trial"}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AICoaching;