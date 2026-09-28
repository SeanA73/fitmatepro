import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Dumbbell, Pencil } from 'lucide-react';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutPlans, readPlanFormat } from '@/hooks/useWorkoutPlans';
import { Skeleton } from '@/components/ui/skeleton';
import type { Json } from '@/integrations/supabase/types';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest: number;
  notes?: string;
}

interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

const emptyDays = (): WorkoutDay[] => [{ id: 'day-1', name: 'Day 1', exercises: [] }];

export const CustomWorkoutBuilder = () => {
  const { hasPremiumAccess } = useSubscription();
  const { toast } = useToast();
  const { plans, loading, savePlan, deletePlan } = useWorkoutPlans();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [days, setDays] = useState<WorkoutDay[]>(emptyDays);

  // Only rows this builder wrote — the Workouts page stores a different shape
  // in the same table.
  const savedPlans = plans.filter(plan => readPlanFormat(plan.exercises) === 'builder_days');

  const readDays = (exercises: Json): WorkoutDay[] => {
    if (!exercises || typeof exercises !== 'object' || Array.isArray(exercises)) return [];
    const stored = (exercises as Record<string, unknown>).days;
    return Array.isArray(stored) ? (stored as WorkoutDay[]) : [];
  };

  const exerciseLibrary = [
    'Barbell Squat', 'Bench Press', 'Deadlift', 'Overhead Press',
    'Pull-ups', 'Dumbbell Rows', 'Leg Press', 'Bicep Curls',
    'Tricep Extensions', 'Lunges', 'Calf Raises', 'Shoulder Press'
  ];

  const addDay = () => {
    setDays([...days, { id: `day-${days.length + 1}`, name: `Day ${days.length + 1}`, exercises: [] }]);
  };

  const removeDay = (dayId: string) => {
    if (days.length > 1) {
      setDays(days.filter(d => d.id !== dayId));
    }
  };

  const addExercise = (dayId: string) => {
    setDays(days.map(day => 
      day.id === dayId 
        ? {
            ...day,
            exercises: [
              ...day.exercises,
              { id: `ex-${Date.now()}`, name: '', sets: 3, reps: 10, rest: 60 }
            ]
          }
        : day
    ));
  };

  const removeExercise = (dayId: string, exerciseId: string) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
        : day
    ));
  };

  const updateExercise = (dayId: string, exerciseId: string, updates: Partial<Exercise>) => {
    setDays(days.map(day =>
      day.id === dayId
        ? {
            ...day,
            exercises: day.exercises.map(ex =>
              ex.id === exerciseId ? { ...ex, ...updates } : ex
            )
          }
        : day
    ));
  };

  const resetBuilder = () => {
    setWorkoutName('');
    setWorkoutDescription('');
    setDays(emptyDays());
    setEditingPlanId(null);
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workout name",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    // savePlan raises its own success/error toast and refetches the list.
    const { error } = await savePlan({
      id: editingPlanId ?? undefined,
      name: workoutName.trim(),
      description: workoutDescription.trim() || null,
      // duration_minutes and difficulty_level stay null: this builder collects
      // neither, and estimating them would be inventing data.
      exercises: { format: 'builder_days', days } as unknown as Json,
    });
    setSaving(false);

    if (!error) resetBuilder();
  };

  const loadPlan = (planId: string) => {
    const plan = savedPlans.find(candidate => candidate.id === planId);
    if (!plan) return;

    const storedDays = readDays(plan.exercises);
    setEditingPlanId(plan.id);
    setWorkoutName(plan.name);
    setWorkoutDescription(plan.description ?? '');
    setDays(storedDays.length > 0 ? storedDays : emptyDays());
  };

  if (!hasPremiumAccess()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Custom Workout Builder
            <Badge variant="secondary" className="ml-2">Premium</Badge>
          </CardTitle>
          <CardDescription>
            Create and save your own personalized workout plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpgradePrompt 
            trigger="premium_feature_access"
            featureName="Custom Workout Plans"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          Custom Workout Builder
          <Badge variant="default" className="ml-2">Premium</Badge>
        </CardTitle>
        <CardDescription>
          Build your own workout program with unlimited exercises and days
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Workout Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="workout-name">Workout Name *</Label>
            <Input
              id="workout-name"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Push/Pull/Legs Split"
            />
          </div>
          <div>
            <Label htmlFor="workout-description">Description</Label>
            <Textarea
              id="workout-description"
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              placeholder="Describe your workout program..."
              rows={3}
            />
          </div>
        </div>

        {/* Workout Days */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Workout Days</Label>
            <Button variant="outline" size="sm" onClick={addDay}>
              <Plus className="w-4 h-4 mr-2" />
              Add Day
            </Button>
          </div>

          {days.map((day, dayIdx) => (
            <Card key={day.id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={day.name}
                    onChange={(e) => setDays(days.map(d => d.id === day.id ? { ...d, name: e.target.value } : d))}
                    className="w-auto max-w-xs font-semibold"
                  />
                  {days.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDay(day.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.exercises.map((exercise) => (
                  <div key={exercise.id} className="p-4 rounded-lg border bg-card space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="md:col-span-2">
                        <Label className="text-xs">Exercise</Label>
                        <Select
                          value={exercise.name}
                          onValueChange={(value) => updateExercise(day.id, exercise.id, { name: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {exerciseLibrary.map((ex) => (
                              <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Sets</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(day.id, exercise.id, { sets: parseInt(e.target.value) || 0 })}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(day.id, exercise.id, { reps: parseInt(e.target.value) || 0 })}
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Weight (kg)</Label>
                        <Input
                          type="number"
                          value={exercise.weight || ''}
                          onChange={(e) => updateExercise(day.id, exercise.id, { weight: parseFloat(e.target.value) || undefined })}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Rest (sec)</Label>
                        <Input
                          type="number"
                          value={exercise.rest}
                          onChange={(e) => updateExercise(day.id, exercise.id, { rest: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExercise(day.id, exercise.id)}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Exercise
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => addExercise(day.id)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {editingPlanId && (
            <Button variant="outline" onClick={resetBuilder} disabled={saving}>
              Cancel Edit
            </Button>
          )}
          <Button onClick={saveWorkout} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : editingPlanId ? 'Update Workout' : 'Save Workout'}
          </Button>
        </div>

        {/* Saved plans, read back from workout_plans */}
        <div className="space-y-3 pt-6 border-t">
          <Label className="text-base font-semibold">Your Saved Workouts</Label>

          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : savedPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved workouts yet. Build one above and save it.
            </p>
          ) : (
            savedPlans.map((plan) => {
              const planDays = readDays(plan.exercises);
              const exerciseCount = planDays.reduce((total, day) => total + (day.exercises?.length ?? 0), 0);

              return (
                <div
                  key={plan.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{plan.name}</div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground truncate">{plan.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {planDays.length} {planDays.length === 1 ? 'day' : 'days'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                      </Badge>
                      {plan.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => loadPlan(plan.id)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};


