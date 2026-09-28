import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import FitMateHeader from "@/components/FitMateHeader";
import WelcomeSection from "@/components/WelcomeSection";
import DailyCheckIn from "@/components/DailyCheckIn";
import WorkoutPlanning from "@/components/WorkoutPlanning";
import NutritionTracking from "@/components/NutritionTracking";
import ProgressVisualization from "@/components/ProgressVisualization";
import LandingHero from "@/components/landing/LandingHero";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/subscription/PricingSection";
import { PersonalizedRecommendations } from "@/components/shop/PersonalizedRecommendations";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // hasCompletedOnboarding checks the per-user cache first, then the database.
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user || loading) {
        setCheckingOnboarding(false);
        return;
      }

      const complete = await hasCompletedOnboarding(user.id);
      if (!complete) {
        navigate("/onboarding");
      }
      setCheckingOnboarding(false);
    };

    checkOnboarding();
  }, [user, loading, navigate]);

  // Declared once and rendered in all three branches below. A crawler can be
  // served any of them — the auth check resolves asynchronously, so the spinner
  // is the first thing that renders — and "/" needs its title and canonical in
  // every case, not just the signed-out landing page.
  const seo = (
    <Seo
      title="FitMatePro — Track Workouts, Meals and Daily Wellness"
      description="Follow structured workout programs, log meals and macros, and record daily mood, energy and sleep check-ins. Track your progress over time, free."
      path="/"
    />
  );

  if (loading || checkingOnboarding) {
    return (
      <>
        {seo}
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <>
        {seo}
        <div className="min-h-screen bg-background flex flex-col">
          <FitMateHeader />
          <main className="flex-1">
            <LandingHero />
            <FeaturesSection />
            <PricingSection />
          </main>
          <Footer />
        </div>
      </>
    );
  }

  // Show dashboard for authenticated users
  return (
    <>
      {seo}
      <div className="min-h-screen bg-background flex flex-col">
      <FitMateHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        <div className="space-y-8">
          {/* Welcome Section */}
          <WelcomeSection />
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <WorkoutPlanning />
              <NutritionTracking />
            </div>
            
            {/* Right Column. The MentalWellness card was removed: it duplicated
                DailyCheckIn with a hardcoded streak, mood and "89 active"
                participant counts, and its buttons had no handlers. DailyCheckIn
                shows the same wellness data, read from wellness_checkins. */}
            <div className="space-y-6">
              <DailyCheckIn />
            </div>
          </div>
          
          {/* Progress Section */}
          <ProgressVisualization />
          
          {/* Personalised product recommendations */}
          <PersonalizedRecommendations
            title="Recommended for You"
            limit={4}
            context="general"
            autoGenerate={true}
          />
        </div>
      </main>
      
      <Footer />
      </div>
    </>
  );
};

export default Index;
