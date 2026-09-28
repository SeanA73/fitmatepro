import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Heart, Moon, Sunrise, Wind, Smile } from "lucide-react";
import FitMateHeader from "@/components/FitMateHeader";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from '@/components/Seo';

const MentalWellness = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Public marketing page. The daily check-in lives on the dashboard.
  const startHere = () => navigate(user ? "/" : "/auth?plan=free");
  const ctaLabel = user ? "Go to Daily Check-In" : "Begin Wellness Program";

  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Daily Mood Tracking",
      description: "Monitor your emotional well-being with intuitive mood tracking and personalized insights."
    },
    {
      icon: <Wind className="w-6 h-6" />,
      title: "Guided Meditation",
      description: "Access a library of meditation sessions for stress relief, focus, and relaxation."
    },
    {
      icon: <Moon className="w-6 h-6" />,
      title: "Sleep Quality Analysis",
      description: "Track sleep patterns and get recommendations for better rest and recovery."
    },
    {
      icon: <Sunrise className="w-6 h-6" />,
      title: "Mindfulness Exercises",
      description: "Daily mindfulness practices to reduce stress and improve mental clarity."
    }
  ];

  const wellnessPrograms = [
    { 
      name: "Stress Management", 
      duration: "7 days", 
      sessions: "10-15 min",
      description: "Learn practical techniques to manage daily stress and anxiety"
    },
    { 
      name: "Better Sleep", 
      duration: "14 days", 
      sessions: "5-20 min",
      description: "Improve sleep quality with bedtime routines and relaxation techniques"
    },
    { 
      name: "Mindful Living", 
      duration: "21 days", 
      sessions: "10-25 min",
      description: "Develop mindfulness habits for greater presence and life satisfaction"
    },
    { 
      name: "Emotional Balance", 
      duration: "30 days", 
      sessions: "15-30 min",
      description: "Build emotional resilience and develop healthy coping strategies"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Mental Wellness — Daily Mood, Energy and Sleep Logs"
        description="Record how you feel each day with quick mood, energy and sleep check-ins, then look back over weeks of entries to see what really affects how you feel."
        path="/features/mental-wellness"
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
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Free Feature</Badge>
                <h1 className="text-4xl md:text-5xl font-bold">Mental Wellness</h1>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              Nurture your mental health with comprehensive wellness tools including mood tracking, 
              meditation guides, and personalized strategies for stress management and emotional balance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={startHere}>
                <Brain className="w-5 h-5 mr-2" />
                {user ? "Go to Daily Check-In" : "Start Wellness Journey"}
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
            <h2 className="text-3xl font-bold text-center mb-12">Holistic Wellness Tools</h2>
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

        {/* Wellness Programs */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Guided Wellness Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wellnessPrograms.map((program, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-3">
                        <Smile className="w-5 h-5 text-accent" />
                        {program.name}
                      </CardTitle>
                      <Badge variant="outline">{program.duration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground">{program.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Session Length:</span>
                      <span className="font-semibold">{program.sessions}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">Why Mental Wellness Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Better Physical Health</h3>
                <p className="text-muted-foreground">Mental wellness directly impacts physical health, immunity, and recovery.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Enhanced Performance</h3>
                <p className="text-muted-foreground">Improved focus and mental clarity lead to better workout performance.</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                  <Smile className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Life Satisfaction</h3>
                <p className="text-muted-foreground">Better stress management leads to increased happiness and life quality.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Prioritize Your Mental Health
              </h3>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Start your mental wellness journey today and discover the power of a balanced mind.
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

export default MentalWellness;