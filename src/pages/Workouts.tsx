import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Clock, Play, Plus, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { preBuiltPrograms, standaloneWorkouts, standaloneWorkoutDuration, WorkoutProgram } from "@/data/workoutPrograms";
import WorkoutProgramCard from "@/components/workout/WorkoutProgramCard";
import CreateWorkoutForm from "@/components/workout/CreateWorkoutForm";
import { ProductRecommendations } from "@/components/shop/ProductRecommendations";
import FitMateHeader from "@/components/FitMateHeader";
import { useWorkoutPlans, readPlanFormat, toDifficultyLevel } from "@/hooks/useWorkoutPlans";
import type { Json } from "@/integrations/supabase/types";

// Rehydrate a WorkoutProgram from the JSONB payload, forcing the program id to
// the workout_plans row id so edits update the right row.
const readProgram = (exercises: Json, rowId: string): WorkoutProgram | null => {
  if (!exercises || typeof exercises !== 'object' || Array.isArray(exercises)) return null;
  const stored = (exercises as Record<string, unknown>).program;
  if (!stored || typeof stored !== 'object') return null;
  return { ...(stored as WorkoutProgram), id: rowId };
};

const Workouts = () => {
  const navigate = useNavigate();
  const { plans, savePlan } = useWorkoutPlans();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("programs");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);

  // Persisted in workout_plans rather than component state, so they survive a
  // refresh. Only rows written by this page — CustomWorkoutBuilder stores a
  // different shape in the same table.
  const customPrograms = plans
    .filter(plan => readPlanFormat(plan.exercises) === 'workout_program')
    .map(plan => readProgram(plan.exercises, plan.id))
    .filter((program): program is WorkoutProgram => program !== null);

  const allPrograms = [...preBuiltPrograms, ...customPrograms];

  const filteredPrograms = allPrograms.filter(program => {
    const matchesCategory = selectedCategory === 'All' || program.category === selectedCategory;
    const matchesSearch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.goals.some(goal => goal.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleStartProgram = (programId: string) => {
    navigate(`/program/${programId}`);
  };

  const handleCustomizeProgram = (programId: string) => {
    const program = allPrograms.find(p => p.id === programId);
    if (program) {
      setEditingProgram(program);
      setShowCreateForm(true);
    }
  };

  const handleSaveProgram = async (program: WorkoutProgram) => {
    // Only update in place when editing a row we actually persisted.
    // "Customizing" a pre-built program saves a new copy instead.
    const existingRowId = plans.some(plan => plan.id === editingProgram?.id)
      ? editingProgram?.id
      : undefined;

    // savePlan raises its own success/error toast and refetches the list.
    const { error } = await savePlan({
      id: existingRowId,
      name: program.name,
      description: program.description,
      difficulty_level: toDifficultyLevel(program.difficulty),
      workout_type: [program.category],
      // duration_minutes stays null: the program is measured in weeks and
      // days per week, not minutes.
      exercises: { format: 'workout_program', program } as unknown as Json,
    });

    // Keep the form open on failure so the user's work isn't thrown away.
    if (error) return;

    setEditingProgram(null);
    setShowCreateForm(false);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingProgram(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      {/* Page context bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Browse Workouts</h1>
              <p className="text-sm text-muted-foreground">Find the perfect workout for your goals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showCreateForm ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={handleCancelForm}>
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h2 className="text-2xl font-bold">
                {editingProgram ? 'Customize Program' : 'Create New Program'}
              </h2>
            </div>
            <CreateWorkoutForm
              initialProgram={editingProgram || undefined}
              onSave={handleSaveProgram}
              onCancel={handleCancelForm}
            />
          </div>
        ) : (
          <>
            {/* Search & Filters */}
            <div className="flex gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search programs and workouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* The old "Filters" button had no handler and no filter model
                  behind it. Search plus the category row below are the filters. */}
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Program
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="programs">Workout Programs</TabsTrigger>
                <TabsTrigger value="individual">Individual Workouts</TabsTrigger>
              </TabsList>

              <TabsContent value="programs" className="space-y-8">
                {/* Program Categories */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Categories</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {['All', 'Weightlifting', 'Bodybuilding', 'General Fitness', 'Cardio', 'Strength', 'Powerlifting'].map((category) => {
                      const count = category === 'All'
                        ? allPrograms.length
                        : allPrograms.filter(program => program.category === category).length;

                      return (
                        <Card
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`cursor-pointer hover:shadow-card-hover transition-smooth ${
                            selectedCategory === category ? 'border-primary ring-1 ring-primary' : ''
                          }`}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                              <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-sm">{category}</h3>
                            {/* Counted from the actual program list, not a fixed number. */}
                            <p className="text-xs text-muted-foreground">{count}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Workout Programs */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Available Programs ({filteredPrograms.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrograms.map((program) => (
                      <WorkoutProgramCard
                        key={program.id}
                        program={program}
                        onStart={handleStartProgram}
                        onCustomize={handleCustomizeProgram}
                      />
                    ))}
                  </div>
                  {filteredPrograms.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No programs found matching your search.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="individual" className="space-y-8">
                {/* One card per real standalone session. This list used to hold
                    six invented workouts with invented instructors, ratings and
                    "joined" counts, all six of which opened the same session. */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Quick Workouts ({standaloneWorkouts.length})
                  </h2>
                  <div className="grid gap-4">
                    {standaloneWorkouts.map((workout) => (
                      <Card key={workout.id} className="hover:shadow-card-hover transition-smooth">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{workout.title}</h3>
                                <Badge variant="secondary">{workout.difficulty}</Badge>
                              </div>

                              <p className="text-muted-foreground mb-3">{workout.description}</p>

                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {Math.round(standaloneWorkoutDuration(workout) / 60)} min
                                </div>
                                <span>{workout.exercises.length} exercises</span>
                              </div>
                            </div>

                            <Button variant="wellness" onClick={() => navigate(`/workout/${workout.id}`)}>
                              <Play className="w-4 h-4" />
                              Start Workout
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Product Recommendations */}
            <div className="mt-12">
              <ProductRecommendations
                category="Fitness Equipment"
                tags={["workout", "strength", "home gym"]}
                title="Recommended Workout Gear"
                limit={4}
                context="workouts"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Workouts;
