import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface UserWorkoutAnalysis {
  primaryWorkoutTypes: string[];
  averageDuration: number;
  averageFrequency: number;
  preferredDifficulty: string;
  totalWorkouts: number;
  lastWorkoutDate: string | null;
  equipmentUsed: string[];
  intensityLevel: "low" | "medium" | "high";
}

export interface UserGoalAnalysis {
  activeGoals: string[];
  primaryGoal: string | null;
  goalProgress: Record<string, number>;
}

export interface ProductRecommendation {
  id: string;
  product_id: string;
  recommendation_reason: string;
  confidence_score: number;
  recommendation_context: string;
  priority: number;
  // Product details from join
  product_name?: string;
  product_description?: string;
  price_cents?: number;
  image_url?: string;
  brand?: string;
  rating?: number;
  review_count?: number;
  affiliate_url?: string;
  category?: string;
  subcategory?: string;
}

interface UseProductRecommendationsOptions {
  context?: string;
  limit?: number;
  autoGenerate?: boolean;
}

export const useProductRecommendations = (
  options: UseProductRecommendationsOptions = {}
) => {
  const { context = "general", limit = 8, autoGenerate = true } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [workoutAnalysis, setWorkoutAnalysis] = useState<UserWorkoutAnalysis | null>(null);
  const [goalAnalysis, setGoalAnalysis] = useState<UserGoalAnalysis | null>(null);

  // Analyze user's workout history
  const analyzeWorkoutHistory = useCallback(async (userId: string): Promise<UserWorkoutAnalysis | null> => {
    try {
      // Get recent workout sessions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessions, error } = await supabase
        .from("workout_sessions")
        .select("*, workout_plans(*)")
        .eq("user_id", userId)
        .gte("start_time", thirtyDaysAgo.toISOString())
        .eq("completed", true)
        .order("start_time", { ascending: false });

      if (error) throw error;
      if (!sessions || sessions.length === 0) return null;

      // Analyze workout patterns
      const workoutTypes: Record<string, number> = {};
      let totalDuration = 0;
      let totalIntensity = 0;
      const equipmentUsed = new Set<string>();
      const difficulties: Record<string, number> = {};

      sessions.forEach((session) => {
        const plan = session.workout_plans;
        if (plan && typeof plan === "object" && !Array.isArray(plan)) {
          // Extract workout types
          const types = (plan.workout_type as string[]) || [];
          types.forEach((type) => {
            workoutTypes[type] = (workoutTypes[type] || 0) + 1;
          });

          // Track difficulty
          const difficulty = plan.difficulty_level as string;
          if (difficulty) {
            difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;
          }

          // Track duration
          if (plan.duration_minutes) {
            totalDuration += plan.duration_minutes;
          }
        }

        // Track intensity
        if (session.perceived_exertion) {
          totalIntensity += session.perceived_exertion;
        }

        // Extract equipment from exercises
        const exercises = session.exercises_completed;
        if (exercises && typeof exercises === "object") {
          // Parse exercise data to find equipment
          const exerciseData = Array.isArray(exercises) ? exercises : [exercises];
          exerciseData.forEach((exercise: any) => {
            if (exercise?.equipment) {
              equipmentUsed.add(exercise.equipment);
            }
          });
        }
      });

      const primaryWorkoutTypes = Object.entries(workoutTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type);

      const preferredDifficulty = Object.entries(difficulties)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "intermediate";

      const averageDuration = totalDuration / sessions.length;
      const avgIntensity = totalIntensity / sessions.length;
      
      let intensityLevel: "low" | "medium" | "high" = "medium";
      if (avgIntensity >= 7) intensityLevel = "high";
      else if (avgIntensity <= 4) intensityLevel = "low";

      // Calculate frequency (workouts per week)
      const daysDiff = Math.ceil(
        (new Date().getTime() - new Date(sessions[sessions.length - 1].start_time).getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      const averageFrequency = (sessions.length / Math.max(daysDiff / 7, 1));

      const analysis: UserWorkoutAnalysis = {
        primaryWorkoutTypes,
        averageDuration,
        averageFrequency,
        preferredDifficulty,
        totalWorkouts: sessions.length,
        lastWorkoutDate: sessions[0]?.start_time || null,
        equipmentUsed: Array.from(equipmentUsed),
        intensityLevel,
      };

      return analysis;
    } catch (error) {
      console.error("Error analyzing workout history:", error);
      return null;
    }
  }, []);

  // Analyze user goals
  const analyzeUserGoals = useCallback(async (userId: string): Promise<UserGoalAnalysis | null> => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("fitness_goals")
        .eq("id", userId)
        .single();

      if (!profile?.fitness_goals || !Array.isArray(profile.fitness_goals)) {
        return null;
      }

      const { data: goals } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active");

      const goalProgress: Record<string, number> = {};
      if (goals) {
        goals.forEach((goal) => {
          if (goal.current_value && goal.target_value) {
            goalProgress[goal.goal_type] = (goal.current_value / goal.target_value) * 100;
          }
        });
      }

      const analysis: UserGoalAnalysis = {
        activeGoals: profile.fitness_goals as string[],
        primaryGoal: profile.fitness_goals[0] || null,
        goalProgress,
      };

      return analysis;
    } catch (error) {
      console.error("Error analyzing user goals:", error);
      return null;
    }
  }, []);

  // Generate recommendations
  const generateRecommendations = useCallback(async (forceRegenerate = false) => {
    if (!user?.id) return;

    setGenerating(true);
    try {
      // Check if we have recent recommendations (within last 24 hours)
      if (!forceRegenerate) {
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const { data: recentRecs } = await supabase
          .from("product_recommendations")
          .select("*")
          .eq("user_id", user.id)
          .eq("recommendation_context", context)
          .gte("created_at", oneDayAgo.toISOString())
          .eq("dismissed", false)
          .eq("purchased", false)
          .limit(limit);

        if (recentRecs && recentRecs.length >= limit) {
          // Load existing recommendations with product details
          await loadRecommendations();
          setGenerating(false);
          return;
        }
      }

      // Analyze user data
      const workoutAnalysisResult = await analyzeWorkoutHistory(user.id);
      const goalAnalysisResult = await analyzeUserGoals(user.id);

      setWorkoutAnalysis(workoutAnalysisResult);
      setGoalAnalysis(goalAnalysisResult);

      // Generate recommendations using AI service
      const newRecommendations = await generateAIRecommendations(
        user.id,
        workoutAnalysisResult,
        goalAnalysisResult,
        context
      );

      if (newRecommendations && newRecommendations.length > 0) {
        // Load recommendations (they should be in the database now)
        await loadRecommendations();
        
        toast({
          title: "Recommendations ready",
          description: `Found ${newRecommendations.length} personalized product recommendations for you!`,
        });
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  }, [user, context, limit, analyzeWorkoutHistory, analyzeUserGoals, toast]);

  // Load recommendations from database
  const loadRecommendations = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Query recommendations with product details via join
      const { data: recsData, error: recsError } = await supabase
        .from("product_recommendations")
        .select(`
          *,
          affiliate_products (
            name,
            short_description,
            price_cents,
            original_price_cents,
            image_url,
            brand,
            rating,
            review_count,
            affiliate_url,
            category,
            subcategory
          )
        `)
        .eq("user_id", user.id)
        .eq("recommendation_context", context)
        .eq("dismissed", false)
        .eq("purchased", false)
        .order("priority", { ascending: false })
        .order("display_order", { ascending: true })
        .limit(limit);

      if (recsError) throw recsError;

      if (recsData) {
        // Transform the data to match ProductRecommendation interface
        const transformedRecs: ProductRecommendation[] = recsData.map((rec: any) => ({
          id: rec.id,
          product_id: rec.product_id,
          recommendation_reason: rec.recommendation_reason,
          confidence_score: rec.confidence_score,
          recommendation_context: rec.recommendation_context,
          priority: rec.priority,
          // Extract product details from joined data
          product_name: rec.affiliate_products?.name,
          product_description: rec.affiliate_products?.short_description,
          price_cents: rec.affiliate_products?.price_cents,
          image_url: rec.affiliate_products?.image_url,
          brand: rec.affiliate_products?.brand,
          rating: rec.affiliate_products?.rating,
          review_count: rec.affiliate_products?.review_count || 0,
          affiliate_url: rec.affiliate_products?.affiliate_url,
          category: rec.affiliate_products?.category,
          subcategory: rec.affiliate_products?.subcategory,
        })).filter((rec: ProductRecommendation) => rec.product_name); // Only include valid products

        setRecommendations(transformedRecs);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  }, [user, context, limit]);

  // Track recommendation interaction
  const trackInteraction = useCallback(async (
    recommendationId: string,
    interaction: "click" | "dismiss" | "purchase"
  ) => {
    if (!user?.id) return;

    try {
      const updateData: any = {};
      if (interaction === "click") updateData.clicked = true;
      if (interaction === "dismiss") updateData.dismissed = true;
      if (interaction === "purchase") updateData.purchased = true;

      await supabase
        .from("product_recommendations")
        .update(updateData)
        .eq("id", recommendationId)
        .eq("user_id", user.id);

      // Reload recommendations to remove dismissed ones
      if (interaction === "dismiss") {
        await loadRecommendations();
      }
    } catch (error) {
      console.error("Error tracking interaction:", error);
    }
  }, [user, loadRecommendations]);

  // Provide feedback on recommendation
  const provideFeedback = useCallback(async (
    recommendationId: string,
    feedbackType: "helpful" | "not_helpful" | "already_own" | "wrong_category" | "too_expensive" | "other",
    feedbackText?: string
  ) => {
    if (!user?.id) return;

    try {
      await supabase.from("recommendation_feedback").insert({
        user_id: user.id,
        recommendation_id: recommendationId,
        feedback_type: feedbackType,
        feedback_text: feedbackText,
      });

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve recommendations.",
      });
    } catch (error) {
      console.error("Error providing feedback:", error);
    }
  }, [user, toast]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      loadRecommendations();
      
      if (autoGenerate && recommendations.length === 0) {
        // Auto-generate if no recommendations exist
        setTimeout(() => generateRecommendations(), 1000);
      }
    }
  }, [user?.id, context]);

  return {
    recommendations,
    loading,
    generating,
    workoutAnalysis,
    goalAnalysis,
    generateRecommendations,
    loadRecommendations,
    trackInteraction,
    provideFeedback,
    refresh: () => generateRecommendations(true),
  };
};

// AI Recommendation Generation Service
async function generateAIRecommendations(
  userId: string,
  workoutAnalysis: UserWorkoutAnalysis | null,
  goalAnalysis: UserGoalAnalysis | null,
  context: string
): Promise<ProductRecommendation[]> {
  try {
    // Get all active products
    const { data: products, error: productsError } = await supabase
      .from("affiliate_products")
      .select("*")
      .eq("is_active", true)
      .limit(100);

    if (productsError || !products) {
      throw productsError || new Error("Failed to fetch products");
    }

    // Use AI service to generate recommendations
    const recommendations = await generateRecommendationsWithAI(
      userId,
      products,
      workoutAnalysis,
      goalAnalysis,
      context
    );

    // Save recommendations to database
    if (recommendations.length > 0) {
      const { error: insertError } = await supabase
        .from("product_recommendations")
        .insert(
          recommendations.map((rec) => ({
            user_id: userId,
            product_id: rec.product_id,
            recommendation_reason: rec.recommendation_reason,
            confidence_score: rec.confidence_score,
            recommendation_context: context,
            priority: rec.priority,
            user_workout_patterns: workoutAnalysis || {},
            user_goals_alignment: goalAnalysis || {},
            displayed_at: new Date().toISOString(),
          }))
        );

      if (insertError) {
        console.error("Error saving recommendations:", insertError);
      }
    }

    return recommendations;
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return [];
  }
}

// Recommendation logic
async function generateRecommendationsWithAI(
  userId: string,
  products: any[],
  workoutAnalysis: UserWorkoutAnalysis | null,
  goalAnalysis: UserGoalAnalysis | null,
  context: string
): Promise<ProductRecommendation[]> {
  // Build user profile summary
  const userProfile = buildUserProfile(workoutAnalysis, goalAnalysis, context);

  // Score each product based on user profile
  const scoredProducts = products
    .map((product) => ({
      product,
      score: scoreProduct(product, userProfile, workoutAnalysis, goalAnalysis),
      reason: generateRecommendationReason(product, userProfile, workoutAnalysis, goalAnalysis),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8); // Top 8 recommendations

  return scoredProducts.map((item, index) => ({
    id: crypto.randomUUID(),
    product_id: item.product.id,
    recommendation_reason: item.reason,
    confidence_score: Math.min(item.score / 100, 1), // Normalize to 0-1
    recommendation_context: context,
    priority: scoredProducts.length - index, // Higher priority for better matches
  }));
}

// Build user profile for recommendation matching
function buildUserProfile(
  workoutAnalysis: UserWorkoutAnalysis | null,
  goalAnalysis: UserGoalAnalysis | null,
  context: string
): Record<string, any> {
  const profile: Record<string, any> = {
    context,
    hasWorkoutHistory: !!workoutAnalysis && workoutAnalysis.totalWorkouts > 0,
    primaryGoal: goalAnalysis?.primaryGoal || null,
    goals: goalAnalysis?.activeGoals || [],
  };

  if (workoutAnalysis) {
    profile.workoutTypes = workoutAnalysis.primaryWorkoutTypes;
    profile.intensity = workoutAnalysis.intensityLevel;
    profile.frequency = workoutAnalysis.averageFrequency;
    profile.equipment = workoutAnalysis.equipmentUsed;
    profile.difficulty = workoutAnalysis.preferredDifficulty;
  }

  return profile;
}

// Score a product based on user profile
function scoreProduct(
  product: any,
  userProfile: Record<string, any>,
  workoutAnalysis: UserWorkoutAnalysis | null,
  goalAnalysis: UserGoalAnalysis | null
): number {
  let score = 0;

  // Category matching
  const category = (product.category || "").toLowerCase();
  const tags = (product.tags || []) as string[];

  // Goal-based scoring
  if (goalAnalysis?.primaryGoal) {
    const goal = goalAnalysis.primaryGoal.toLowerCase();
    
    if (goal.includes("strength") || goal.includes("muscle")) {
      if (category.includes("equipment") || tags.some((t) => t.includes("strength") || t.includes("weight"))) {
        score += 30;
      }
      if (category.includes("supplement") && tags.some((t) => t.includes("protein") || t.includes("muscle"))) {
        score += 25;
      }
    }

    if (goal.includes("weight") || goal.includes("loss")) {
      if (category.includes("cardio") || tags.some((t) => t.includes("cardio"))) {
        score += 30;
      }
      if (category.includes("supplement") && tags.some((t) => t.includes("fat") || t.includes("metabolism"))) {
        score += 20;
      }
    }

    if (goal.includes("endurance")) {
      if (tags.some((t) => t.includes("cardio") || t.includes("endurance"))) {
        score += 25;
      }
    }

    if (goal.includes("flexibility")) {
      if (category.includes("yoga") || tags.some((t) => t.includes("yoga") || t.includes("flexibility"))) {
        score += 30;
      }
    }
  }

  // Workout-based scoring
  if (workoutAnalysis) {
    const workoutTypes = workoutAnalysis.primaryWorkoutTypes.map((t) => t.toLowerCase());

    if (workoutTypes.some((type) => type.includes("strength") || type.includes("weight"))) {
      if (category.includes("equipment") && tags.some((t) => t.includes("weight") || t.includes("resistance"))) {
        score += 25;
      }
    }

    if (workoutTypes.some((type) => type.includes("cardio"))) {
      if (category.includes("cardio") || tags.some((t) => t.includes("cardio"))) {
        score += 20;
      }
    }

    if (workoutTypes.some((type) => type.includes("yoga"))) {
      if (category.includes("yoga") || tags.some((t) => t.includes("yoga"))) {
        score += 25;
      }
    }

    // Home workout scoring
    if (workoutAnalysis.averageFrequency > 3) {
      if (tags.some((t) => t.includes("home") || t.includes("portable"))) {
        score += 15;
      }
    }
  }

  // Context-based scoring
  if (userProfile.context === "post_workout") {
    if (category.includes("recovery") || category.includes("supplement")) {
      score += 20;
    }
  }

  if (userProfile.context === "workout_planning") {
    if (category.includes("equipment")) {
      score += 25;
    }
  }

  // Quality indicators
  if (product.rating && product.rating >= 4.5) {
    score += 10;
  }
  if (product.is_featured) {
    score += 5;
  }

  // Boost score for products aligned with multiple factors
  if (score > 40) {
    score += 10; // Bonus for high-relevance items
  }

  return Math.min(score, 100); // Cap at 100
}

// Generate human-readable recommendation reason
function generateRecommendationReason(
  product: any,
  userProfile: Record<string, any>,
  workoutAnalysis: UserWorkoutAnalysis | null,
  goalAnalysis: UserGoalAnalysis | null
): string {
  const reasons: string[] = [];

  if (goalAnalysis?.primaryGoal) {
    const goal = goalAnalysis.primaryGoal.toLowerCase();
    if (goal.includes("strength") || goal.includes("muscle")) {
      reasons.push("perfect for building strength and muscle");
    }
    if (goal.includes("weight") || goal.includes("loss")) {
      reasons.push("supports your weight loss goals");
    }
    if (goal.includes("flexibility")) {
      reasons.push("great for improving flexibility");
    }
  }

  if (workoutAnalysis) {
    const types = workoutAnalysis.primaryWorkoutTypes;
    if (types.some((t) => t.toLowerCase().includes("strength"))) {
      reasons.push("complements your strength training");
    }
    if (types.some((t) => t.toLowerCase().includes("cardio"))) {
      reasons.push("enhances your cardio workouts");
    }
  }


  if (reasons.length === 0) {
    return "A great addition to your fitness journey";
  }

  return reasons[0].charAt(0).toUpperCase() + reasons[0].slice(1);
}



