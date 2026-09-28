import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

// Two different builders write to workout_plans — the premium CustomWorkoutBuilder
// (a flat list of days) and the Workouts page CreateWorkoutForm (a full
// WorkoutProgram). workout_plans.exercises is a single JSONB column, so each
// payload is tagged with its format and each surface reads back only its own.
export type WorkoutPlanFormat = 'builder_days' | 'workout_program';

export interface WorkoutPlanRow {
  id: string;
  name: string;
  description: string | null;
  difficulty_level: string | null;
  duration_minutes: number | null;
  workout_type: string[] | null;
  exercises: Json;
  created_at: string | null;
}

export interface WorkoutPlanInput {
  /** Present when editing an existing row; omitted to insert a new one. */
  id?: string;
  name: string;
  description?: string | null;
  difficulty_level?: string | null;
  duration_minutes?: number | null;
  workout_type?: string[] | null;
  exercises: Json;
}

// workout_plans.difficulty_level has a CHECK (beginner|intermediate|advanced).
// The UI labels are capitalised ("Beginner"), so they have to be lowered before
// they hit the constraint.
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const toDifficultyLevel = (value?: string | null): string | null =>
  DIFFICULTY_LEVELS.find(level => level === value?.toLowerCase()) ?? null;

export const readPlanFormat = (exercises: Json): WorkoutPlanFormat | null => {
  if (!exercises || typeof exercises !== 'object' || Array.isArray(exercises)) return null;
  const format = (exercises as Record<string, unknown>).format;
  return format === 'builder_days' || format === 'workout_program' ? format : null;
};

export const useWorkoutPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<WorkoutPlanRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    if (!user) {
      setPlans([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_plans')
        .select('id, name, description, difficulty_level, duration_minutes, workout_type, exercises, created_at')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load workout plans';
      toast({
        title: 'Error loading workout plans',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlans();
    } else {
      setPlans([]);
    }
  }, [user]);

  const savePlan = async (input: WorkoutPlanInput) => {
    if (!user) {
      toast({
        title: 'Sign in to save workouts',
        description: 'Your workout plans are saved to your account.',
        variant: 'destructive',
      });
      return { data: null, error: 'Not authenticated' };
    }

    try {
      const payload = {
        user_id: user.id,
        name: input.name,
        description: input.description ?? null,
        difficulty_level: input.difficulty_level ?? null,
        duration_minutes: input.duration_minutes ?? null,
        workout_type: input.workout_type ?? null,
        exercises: input.exercises,
        is_template: false,
        is_active: true,
      };

      const query = input.id
        ? supabase.from('workout_plans').update(payload).eq('id', input.id).eq('user_id', user.id)
        : supabase.from('workout_plans').insert(payload);

      const { data, error } = await query.select().single();
      if (error) throw error;

      await fetchPlans();

      toast({
        title: input.id ? 'Workout updated' : 'Workout saved',
        description: `"${input.name}" is saved to your account.`,
      });

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save workout plan';
      toast({
        title: 'Error saving workout',
        description: message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const deletePlan = async (planId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchPlans();
      toast({ title: 'Workout deleted' });
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete workout plan';
      toast({
        title: 'Error deleting workout',
        description: message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  return { plans, loading, savePlan, deletePlan, refreshPlans: fetchPlans };
};
