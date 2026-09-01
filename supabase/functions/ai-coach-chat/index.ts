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
    const dashscopeKey = Deno.env.get('DASHSCOPE_API_KEY');
    const workspaceId = Deno.env.get('DASHSCOPE_WORKSPACE_ID');

    if (!dashscopeKey) {
      throw new Error('DASHSCOPE_API_KEY not configured');
    }

    if (!workspaceId) {
      throw new Error('DASHSCOPE_WORKSPACE_ID not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { messages: conversationHistory } = await req.json();

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile for context
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, fitness_goals, activity_level, health_conditions, height_cm, weight_kg, date_of_birth, gender')
      .eq('id', user.id)
      .single();

    // Fetch recent workout sessions for context
    const { data: recentWorkouts } = await supabase
      .from('workout_sessions')
      .select('exercises_completed, calories_burned, perceived_exertion, start_time')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })
      .limit(5);

    // Fetch recent wellness check-ins
    const { data: recentCheckins } = await supabase
      .from('wellness_checkins')
      .select('mood_rating, energy_level, stress_level, sleep_quality, checkin_date')
      .eq('user_id', user.id)
      .order('checkin_date', { ascending: false })
      .limit(5);

    // Fetch active goals
    const { data: activeGoals } = await supabase
      .from('user_goals')
      .select('goal_type, target_value, current_value, unit, target_date')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(5);

    // Build user context string
    const userContextParts: string[] = [];

    if (profile) {
      if (profile.full_name) userContextParts.push(`Name: ${profile.full_name}`);
      if (profile.fitness_goals?.length) userContextParts.push(`Fitness goals: ${profile.fitness_goals.join(', ')}`);
      if (profile.activity_level) userContextParts.push(`Activity level: ${profile.activity_level}`);
      if (profile.health_conditions?.length) userContextParts.push(`Health conditions: ${profile.health_conditions.join(', ')}`);
      if (profile.height_cm) userContextParts.push(`Height: ${profile.height_cm}cm`);
      if (profile.weight_kg) userContextParts.push(`Weight: ${profile.weight_kg}kg`);
      if (profile.gender && profile.gender !== 'prefer_not_to_say') userContextParts.push(`Gender: ${profile.gender}`);
    }

    if (recentWorkouts?.length) {
      const totalCals = recentWorkouts.reduce((s, w) => s + (w.calories_burned || 0), 0);
      userContextParts.push(`Recent workouts: ${recentWorkouts.length} sessions, ~${Math.round(totalCals / recentWorkouts.length)} cal avg`);
    }

    if (recentCheckins?.length) {
      const latest = recentCheckins[0];
      userContextParts.push(`Latest check-in: mood ${latest.mood_rating}/10, energy ${latest.energy_level}/10, stress ${latest.stress_level}/10, sleep ${latest.sleep_quality}/10`);
    }

    if (activeGoals?.length) {
      userContextParts.push(`Active goals: ${activeGoals.map(g => `${g.goal_type} (${g.target_value}${g.unit || ''})`).join(', ')}`);
    }

    const userContext = userContextParts.length
      ? userContextParts.join('\n')
      : 'No profile data yet — user is new.';

    // Build system prompt
    const systemPrompt = `You are FitMatePro, a friendly and supportive personal fitness and wellness coach AI. You are warm, encouraging, and knowledgeable about:

- Workout programming (strength, cardio, HIIT, flexibility, recovery)
- Nutrition and macronutrients (general guidance, NOT medical diet prescriptions)
- Mental wellness (stress management, sleep hygiene, mindfulness)
- Goal setting and habit formation
- Motivation and accountability

IMPORTANT RULES:
1. You are NOT a doctor. Never diagnose conditions, prescribe medications, or give medical advice. If a user describes symptoms or asks medical questions, gently redirect them to consult a healthcare professional.
2. Never suggest exercises that could be dangerous given the user's stated health conditions. If they mention pain or injury, recommend they see a professional.
3. Keep responses concise and actionable — 2-4 short paragraphs max unless the user asks for detail.
4. Use the user's name if you know it.
5. Reference their actual data (goals, recent workouts, check-ins) when relevant to make responses personal.
6. Be encouraging but honest. Don't over-praise — be genuine.
7. If you don't know something, say so.
8. Never make up statistics, studies, or scientific claims you can't verify.

USER CONTEXT:
${userContext}

Respond in a conversational, coaching tone. Use occasional emojis sparingly (1-2 per message max).`;

    // Build messages array for the LLM
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      // Include last 10 messages from conversation history for context
      ...conversationHistory.slice(-10).map((msg: { type: string; content: string }) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ];

    // Call Qwen via DashScope (Singapore region, OpenAI-compatible API)
    const aiResponse = await fetch(`https://${workspaceId}.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dashscopeKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: llmMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('No response from AI model');
    }

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in ai-coach-chat:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        reply: "I'm having a bit of trouble right now — could you try again in a moment?"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
