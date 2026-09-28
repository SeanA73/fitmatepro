import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, Play, Calendar, Target, Users, BarChart3 } from "lucide-react";
import FitMateHeader from "@/components/FitMateHeader";
import { PersonalizedRecommendations } from "@/components/shop/PersonalizedRecommendations";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from '@/components/Seo';

const WorkoutPlanning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // This page is public marketing. Signed-in users go straight to the feature;
  // only signed-out visitors are sent to sign-up.
  const startHere = () => navigate(user ? "/workouts" : "/auth?plan=free");
  const ctaLabel = user ? "Go to Workouts" : "Get Started Free";

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal-Based Programming",
      description: "Workouts tailored to your specific fitness goals - weight loss, muscle gain, endurance, or strength."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Flexible Scheduling",
      description: "Plans that adapt to your schedule with options for 3, 4, 5, or 6 days per week."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Progressive Overload",
      description: "Scientifically designed progression to continuously challenge your body and drive results."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Equipment Flexibility",
      description: "Plans for home workouts, gym access, or minimal equipment scenarios."
    }
  ];

  const workoutTypes = [
    { name: "Strength Training", duration: "45-60 min", intensity: "High" },
    { name: "HIIT Cardio", duration: "20-30 min", intensity: "Very High" },
    { name: "Yoga & Flexibility", duration: "30-45 min", intensity: "Low" },
    { name: "Endurance Cardio", duration: "30-60 min", intensity: "Medium" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Workout Planning — Programs Built Around Your Goals"
        description="Pick a program for weight loss, muscle gain, endurance or strength, training three to six days a week, at home or in the gym. Track every set and rep."
        path="/features/workout-planning"
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
                <Dumbbell className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Free Feature</Badge>
                <h1 className="text-4xl md:text-5xl font-bold">Smart Workout Planning</h1>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              Get workout plans that adapt to your fitness level, goals, and available equipment.
              Routines that evolve with your progress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={startHere}>
                <Play className="w-5 h-5 mr-2" />
                {user ? "Go to Workouts" : "Start Planning Workouts"}
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
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
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

        {/* Workout Types */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Workout Types Available</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workoutTypes.map((workout, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-2">{workout.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">Duration: {workout.duration}</p>
                    <Badge variant={workout.intensity === "Very High" ? "destructive" : 
                                  workout.intensity === "High" ? "default" : 
                                  workout.intensity === "Medium" ? "secondary" : "outline"}>
                      {workout.intensity} Intensity
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Product Recommendations */}
        {user && (
          <section className="py-16 bg-background">
            <div className="max-w-6xl mx-auto px-6">
              <PersonalizedRecommendations
                context="workout_planning"
                limit={4}
                title="Recommended Workout Equipment"
                autoGenerate={true}
              />
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Workouts?
              </h3>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Join FitMatePro today and get your first personalized workout plan in minutes.
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

export default WorkoutPlanning;