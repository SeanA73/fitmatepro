import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
// PremiumRoute is intentionally not imported: the only four routes that used it
// were the marketing pages deleted below. The component remains in
// components/PremiumRoute.tsx, fixed and ready, for the first route that gates
// real premium functionality.
// Index and NotFound load eagerly: Index is the entry route for every visitor,
// so lazying it would only add a spinner to the critical path, and NotFound is
// the catch-all that must render without another round trip.
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Every other route is split out of the initial bundle. None of them is
// reachable on first paint — most sit behind ProtectedRoute, and the public ones
// (/pricing, /guide, /features/*) are navigated to, not landed on by default.
const Auth = lazy(() => import("./pages/Auth"));
const Workouts = lazy(() => import("./pages/Workouts"));
const WorkoutSession = lazy(() => import("./pages/WorkoutSession"));
const ProgramDetails = lazy(() => import("./pages/ProgramDetails"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Chat = lazy(() => import("./pages/Chat"));
const Shop = lazy(() => import("./pages/Shop"));
const Profile = lazy(() => import("./pages/Profile"));
const CoachPicks = lazy(() => import("./pages/CoachPicks"));
const WorkoutPlanning = lazy(() => import("./pages/features/WorkoutPlanning"));
const NutritionTracking = lazy(() => import("./pages/features/NutritionTracking"));
const MentalWellness = lazy(() => import("./pages/features/MentalWellness"));
const AICoaching = lazy(() => import("./pages/features/AICoaching"));
const CommunityFeatures = lazy(() => import("./pages/features/CommunityFeatures"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PremiumFeatures = lazy(() => import("./pages/PremiumFeatures"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("./pages/CheckoutCancel"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const Guide = lazy(() => import("./pages/Guide"));
// There is no admin UI. AdminDashboard and AdminUsers were deleted: they were
// unrouted, linked only to each other, and the admin RLS policies they needed
// are not in the applied schema. AdminSetup was deleted earlier because it
// granted premium and self-assigned the admin role from the browser. Recover
// any of them from git history if an admin surface is built.

const queryClient = new QueryClient();

// Matches the spinner ProtectedRoute and PremiumRoute already show, so a lazy
// chunk arriving looks the same as an auth check resolving rather than
// introducing a second, different loading state.
const RouteFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      {/* Checkout is only reachable from inside the app, and this page reads the
          signed-in user's subscription row to decide what to show. It needs auth.
          The gate lives here, like every other protected route — CheckoutSuccess
          used to wrap itself in ProtectedRoute as well. */}
      <Route
        path="/checkout/success"
        element={
          <ProtectedRoute>
            <CheckoutSuccess />
          </ProtectedRoute>
        }
      />
      {/* Same as /checkout/success: only reachable from an in-app checkout, and
          it renders PricingSection, which needs a signed-in user to start one. */}
      <Route
        path="/checkout/cancel"
        element={
          <ProtectedRoute>
            <CheckoutCancel />
          </ProtectedRoute>
        }
      />
      <Route path="/guide" element={<Guide />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workouts" 
        element={
          <ProtectedRoute>
            <Workouts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workout/:id" 
        element={
          <ProtectedRoute>
            <WorkoutSession />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workout/program/:programId/day/:dayId" 
        element={
          <ProtectedRoute>
            <WorkoutSession />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/program/:id" 
        element={
          <ProtectedRoute>
            <ProgramDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/nutrition" 
        element={
          <ProtectedRoute>
            <Nutrition />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/shop" 
        element={
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coach-picks"
        element={
          <ProtectedRoute>
            <CoachPicks />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      {/* The /features/* pages are marketing copy with no user data in them.
          They were behind ProtectedRoute, which meant the public landing page
          and footer linked to pages that bounced anonymous visitors to /auth,
          while every CTA on them told already-signed-in users to sign up.
          Public is the correct gating for marketing. */}
      <Route path="/features/workout-planning" element={<WorkoutPlanning />} />
      <Route path="/features/nutrition-tracking" element={<NutritionTracking />} />
      <Route path="/features/mental-wellness" element={<MentalWellness />} />
      <Route path="/features/ai-coaching" element={<AICoaching />} />
      <Route path="/features/community-features" element={<CommunityFeatures />} />
      {/* /features/advanced-analytics, goal-setting, wearable-integration and
          personal-coaching are gone. They were marketing pages behind
          PremiumRoute — only premium users could reach copy selling them
          Premium, while free users hit the upgrade gate instead. All four
          described features that do not exist; wearable-integration in
          particular needed biometric_data, which the schema squash dropped. */}
      <Route
        path="/premium" 
        element={
          <ProtectedRoute>
            <PremiumFeatures />
          </ProtectedRoute>
        } 
      />
      {/* No /admin, /admin/users or /admin-setup route exists — the pages that
          served them are gone (see the import block above). profiles,
          subscriptions, revenue_events and usage_tracking are all self-row-only
          under RLS, so an admin dashboard needs new policies before it can show
          anything but the admin's own row. */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    {/* Outermost so that a page's <Seo> still applies if an inner provider
        throws and ErrorBoundary takes over the subtree. */}
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                {/* One boundary around the whole route tree: each lazy route
                    resolves independently, and a single fallback avoids nesting a
                    spinner inside ProtectedRoute's spinner. */}
                <Suspense fallback={<RouteFallback />}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
