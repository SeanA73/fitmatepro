import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface Meal {
  id: string;
  user_id: string;
  meal_type?: string | null;
  consumed_at: string;
  image_url?: string | null;
  description?: string | null;
  total_calories?: number | null;
  macros?: Json;
  food_items: Json;
  created_at: string;
  updated_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string | null;
  serving_size?: string | null;
  calories_per_serving?: number | null;
  macros?: Json;
  categories?: string[] | null;
}

// Both Add Food surfaces (the dashboard card and /nutrition) collect the same
// free-text form, so the mapping to a meals row lives here rather than being
// duplicated — and getting it wrong is silent:
//   * meals.meal_type has a CHECK (breakfast|lunch|dinner|snack). The Select
//     defaults to '', which the constraint rejects, so a blank must become
//     undefined rather than ''.
//   * the form field is "fats" but getTodaysNutrition below aggregates
//     macros.fat. Writing "fats" would store fine and read back as 0.
//   * meals.food_items is NOT NULL, and meals has no notes column, so the note
//     rides along on the food item instead of being dropped.
export interface FoodFormValues {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  fiber: string;
  servingSize: string;
  mealType: string;
  notes: string;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export const buildMealFromFoodForm = (form: FoodFormValues) => {
  const num = (value: string) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const name = form.name.trim();
  const calories = Math.round(num(form.calories));
  const macros = {
    protein: num(form.protein),
    carbs: num(form.carbs),
    fat: num(form.fats),
    fiber: num(form.fiber),
  };
  const notes = form.notes.trim();
  const servingSize = form.servingSize.trim();

  return {
    meal_type: MEAL_TYPES.find(type => type === form.mealType),
    description: name,
    total_calories: calories,
    macros,
    food_items: [{
      name,
      serving_size: servingSize || null,
      calories,
      macros,
      ...(notes ? { notes } : {}),
    }],
  };
};

export const useNutrition = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMeals();
      fetchFoodDatabase();
    }
  }, [user]);

  const fetchMeals = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('consumed_at', { ascending: false });

      if (error) throw error;

      setMeals(data || []);
      
      // Filter today's meals
      const today = new Date().toISOString().split('T')[0];
      const todaysData = data?.filter(meal => 
        meal.consumed_at.startsWith(today)
      ) || [];
      setTodaysMeals(todaysData);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load meals';
      toast({
        title: "Error loading meals",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('food_database')
        .select('*')
        .order('name');

      if (error) throw error;
      setFoodDatabase(data || []);
    } catch (error) {
      // Silent fail for food database - not critical for app functionality
      console.debug('Food database fetch failed:', error);
    }
  };

  const addMeal = async (mealData: {
    meal_type?: string;
    description?: string;
    total_calories?: number;
    macros?: any;
    food_items: any[];
    image_url?: string;
  }) => {
    if (!user) return { data: null, error: 'No user authenticated' };

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert([{
          user_id: user.id,
          consumed_at: new Date().toISOString(),
          ...mealData
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh meals
      await fetchMeals();

      toast({
        title: "Meal added!",
        description: `Successfully logged your ${mealData.meal_type || 'meal'}.`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error adding meal",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateMeal = async (mealId: string, updates: Partial<Meal>) => {
    if (!user) return { data: null, error: 'No user authenticated' };

    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', mealId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Refresh meals
      await fetchMeals();

      toast({
        title: "Meal updated",
        description: "Your meal has been updated successfully.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating meal",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!user) return { data: null, error: 'No user authenticated' };

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh meals
      await fetchMeals();

      toast({
        title: "Meal deleted",
        description: "Your meal has been removed from your log.",
      });

      return { data: true, error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting meal",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const searchFood = (query: string) => {
    if (!query.trim()) return foodDatabase;
    
    return foodDatabase.filter(food =>
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      food.brand?.toLowerCase().includes(query.toLowerCase()) ||
      food.categories?.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const getTodaysNutrition = () => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    todaysMeals.forEach(meal => {
      if (meal.total_calories) {
        totals.calories += meal.total_calories;
      }
      
      if (meal.macros && typeof meal.macros === 'object' && meal.macros !== null) {
        const macros = meal.macros as any;
        totals.protein += macros.protein || 0;
        totals.carbs += macros.carbs || 0;
        totals.fat += macros.fat || 0;
        totals.fiber += macros.fiber || 0;
      }
    });

    return totals;
  };

  const getMealsByType = (mealType: string) => {
    return todaysMeals.filter(meal => meal.meal_type === mealType);
  };

  return {
    meals,
    todaysMeals,
    foodDatabase,
    loading,
    addMeal,
    updateMeal,
    deleteMeal,
    searchFood,
    getTodaysNutrition,
    getMealsByType,
    refreshMeals: fetchMeals,
  };
};