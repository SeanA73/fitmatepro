import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Fetching user data for recommendations:', user.id);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Fetch recent goals
    const { data: goals } = await supabase
      .from('user_goals')
      .select('goal_type, target_value, unit, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(5);

    // Fetch recent workouts
    const { data: recentWorkouts } = await supabase
      .from('workout_sessions')
      .select('workout_plan_id, exercises_completed, calories_burned, start_time')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(10);

    // Fetch recent meals
    const { data: recentMeals } = await supabase
      .from('meals')
      .select('meal_type, total_calories, macros, food_items, consumed_at')
      .eq('user_id', user.id)
      .order('consumed_at', { ascending: false })
      .limit(10);

    // Fetch available products
    const { data: products } = await supabase
      .from('affiliate_products')
      .select('id, name, category, subcategory, tags, short_description, price_cents')
      .eq('is_active', true);

    // Build context for AI
    const userContext = {
      profile: {
        fitness_goals: profile?.fitness_goals || [],
        activity_level: profile?.activity_level,
        health_conditions: profile?.health_conditions || [],
      },
      goals: goals || [],
      workoutSummary: {
        totalSessions: recentWorkouts?.length || 0,
        averageCalories: recentWorkouts?.length 
          ? Math.round(recentWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0) / recentWorkouts.length)
          : 0,
      },
      nutritionSummary: {
        mealTypes: [...new Set(recentMeals?.map(m => m.meal_type) || [])],
        averageCalories: recentMeals?.length
          ? Math.round(recentMeals.reduce((sum, m) => sum + (m.total_calories || 0), 0) / recentMeals.length)
          : 0,
      },
      availableProductIds: products?.map(p => p.id) || [],
    };

    const prompt = `You are a fitness product recommendation AI. Based on the user's profile, goals, workout history, and nutrition patterns, recommend the 6 most relevant products from the available list.

User Profile:
- Fitness Goals: ${userContext.profile.fitness_goals.join(', ') || 'not specified'}
- Activity Level: ${userContext.profile.activity_level || 'not specified'}
- Health Conditions: ${userContext.profile.health_conditions.join(', ') || 'none'}

Active Goals:
${userContext.goals.map(g => `- ${g.goal_type}: ${g.target_value} ${g.unit}`).join('\n') || 'No active goals'}

Workout Summary (last 10 sessions):
- Total Sessions: ${userContext.workoutSummary.totalSessions}
- Average Calories Burned: ${userContext.workoutSummary.averageCalories}

Nutrition Summary (last 10 meals):
- Common Meal Types: ${userContext.nutritionSummary.mealTypes.join(', ') || 'none'}
- Average Calories: ${userContext.nutritionSummary.averageCalories}

Available Products (${products?.length || 0} total):
${products?.map(p => `- ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Tags: ${p.tags.join(', ')}`).join('\n') || 'None'}

Return exactly 6 product IDs that would be most beneficial for this user. Consider:
1. Alignment with fitness goals
2. Support for workout intensity
3. Nutritional needs
4. Recovery and wellness
5. Equipment gaps based on activity

Respond ONLY with a JSON array of product IDs, like: ["id1", "id2", "id3", "id4", "id5", "id6"]`;

    console.log('Calling OpenAI for recommendations...');

    // Call OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI response:', aiContent);

    // Parse product IDs from AI response
    let recommendedIds: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = aiContent.match(/\[([^\]]+)\]/);
      if (jsonMatch) {
        recommendedIds = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback: return random products
      recommendedIds = products?.slice(0, 6).map(p => p.id) || [];
    }

    // Fetch full product details
    const { data: recommendedProducts } = await supabase
      .from('affiliate_products')
      .select('*')
      .in('id', recommendedIds);

    // Preserve the order from AI recommendations
    const orderedProducts = recommendedIds
      .map(id => recommendedProducts?.find(p => p.id === id))
      .filter(p => p !== undefined);

    console.log('Returning recommendations:', orderedProducts?.length);

    return new Response(
      JSON.stringify({ 
        products: orderedProducts,
        reasoning: 'Personalized based on your fitness goals, workout intensity, and nutrition patterns'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in recommend-products:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        products: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
