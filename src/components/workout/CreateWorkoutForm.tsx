import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { exerciseDatabase, Exercise, WorkoutProgram, workoutDayMinutes } from "@/data/workoutPrograms";
import { Plus, X, Save, Search } from "lucide-react";
import { toast } from "sonner";

interface CreateWorkoutFormProps {
  initialProgram?: WorkoutProgram;
  onSave: (program: WorkoutProgram) => void;
  onCancel: () => void;
}

const CreateWorkoutForm = ({ initialProgram, onSave, onCancel }: CreateWorkoutFormProps) => {
  const [programData, setProgramData] = useState<Partial<WorkoutProgram>>({
    name: initialProgram?.name || "",
    category: initialProgram?.category || "General Fitness",
    difficulty: initialProgram?.difficulty || "Beginner",
    duration_weeks: initialProgram?.duration_weeks || 8,
    days_per_week: initialProgram?.days_per_week || 3,
    description: initialProgram?.description || "",
    goals: initialProgram?.goals || [],
    equipment_needed: initialProgram?.equipment_needed || [],
    workout_days: initialProgram?.workout_days || []
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [currentGoal, setCurrentGoal] = useState("");
  const [currentEquipment, setCurrentEquipment] = useState("");

  const filteredExercises = exerciseDatabase.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscle_groups.some(muscle => muscle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addGoal = () => {
    if (currentGoal.trim() && !programData.goals?.includes(currentGoal.trim())) {
      setProgramData(prev => ({
        ...prev,
        goals: [...(prev.goals || []), currentGoal.trim()]
      }));
      setCurrentGoal("");
    }
  };

  const removeGoal = (goal: string) => {
    setProgramData(prev => ({
      ...prev,
      goals: prev.goals?.filter(g => g !== goal) || []
    }));
  };

  const addEquipment = () => {
    if (currentEquipment.trim() && !programData.equipment_needed?.includes(currentEquipment.trim())) {
      setProgramData(prev => ({
        ...prev,
        equipment_needed: [...(prev.equipment_needed || []), currentEquipment.trim()]
      }));
      setCurrentEquipment("");
    }
  };

  const removeEquipment = (equipment: string) => {
    setProgramData(prev => ({
      ...prev,
      equipment_needed: prev.equipment_needed?.filter(e => e !== equipment) || []
    }));
  };

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, exercise];
      }
    });
  };

  const createWorkoutDay = () => {
    if (selectedExercises.length === 0) {
      toast.error("Please select at least one exercise");
      return;
    }

    // No stored duration: this formula moved to workoutDayDuration() in
    // workoutPrograms.ts and every surface now derives from the exercise list.
    const workoutDay = {
      id: `day_${Date.now()}`,
      name: `Workout Day ${(programData.workout_days?.length || 0) + 1}`,
      focus: [...new Set(selectedExercises.flatMap(e => e.muscle_groups))],
      exercises: [...selectedExercises]
    };

    setProgramData(prev => ({
      ...prev,
      workout_days: [...(prev.workout_days || []), workoutDay]
    }));

    setSelectedExercises([]);
    toast.success("Workout day added!");
  };

  const removeWorkoutDay = (dayId: string) => {
    setProgramData(prev => ({
      ...prev,
      workout_days: prev.workout_days?.filter(day => day.id !== dayId) || []
    }));
  };

  const handleSave = () => {
    if (!programData.name || !programData.description || (programData.workout_days?.length || 0) === 0) {
      toast.error("Please fill in all required fields and add at least one workout day");
      return;
    }

    const newProgram: WorkoutProgram = {
      id: initialProgram?.id || `custom_${Date.now()}`,
      name: programData.name!,
      category: programData.category!,
      difficulty: programData.difficulty!,
      duration_weeks: programData.duration_weeks!,
      days_per_week: programData.days_per_week!,
      description: programData.description!,
      goals: programData.goals!,
      equipment_needed: programData.equipment_needed!,
      workout_days: programData.workout_days!,
      created_by: 'You',
      is_template: false
    };

    // The caller persists this and raises the success/failure toast. This form
    // must not announce a save it cannot confirm.
    onSave(newProgram);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                value={programData.name}
                onChange={(e) => setProgramData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Custom Workout"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={programData.category} 
                onValueChange={(value) => setProgramData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Fitness">General Fitness</SelectItem>
                  <SelectItem value="Weightlifting">Weightlifting</SelectItem>
                  <SelectItem value="Bodybuilding">Bodybuilding</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Strength">Strength</SelectItem>
                  <SelectItem value="Powerlifting">Powerlifting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={programData.difficulty} 
                onValueChange={(value) => setProgramData(prev => ({ ...prev, difficulty: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Duration (weeks)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="52"
                value={programData.duration_weeks}
                onChange={(e) => setProgramData(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="days">Days per week</Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="7"
                value={programData.days_per_week}
                onChange={(e) => setProgramData(prev => ({ ...prev, days_per_week: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={programData.description}
              onChange={(e) => setProgramData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your workout program..."
              rows={3}
            />
          </div>

          {/* Goals */}
          <div>
            <Label>Goals</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                placeholder="Add a goal..."
                onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              />
              <Button type="button" onClick={addGoal}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {programData.goals?.map((goal, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {goal}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeGoal(goal)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <Label>Equipment Needed</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={currentEquipment}
                onChange={(e) => setCurrentEquipment(e.target.value)}
                placeholder="Add equipment..."
                onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
              />
              <Button type="button" onClick={addEquipment}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {programData.equipment_needed?.map((equipment, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {equipment}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeEquipment(equipment)} />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedExercises.find(e => e.id === exercise.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleExercise(exercise)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{exercise.name}</h4>
                    <Checkbox
                      checked={!!selectedExercises.find(e => e.id === exercise.id)}
                      onChange={() => toggleExercise(exercise)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {exercise.muscle_groups.map((muscle, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {exercise.difficulty}
                  </Badge>
                </div>
              ))}
            </div>

            {selectedExercises.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Selected Exercises ({selectedExercises.length})</h4>
                  <Button onClick={createWorkoutDay}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workout Day
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedExercises.map((exercise) => (
                    <Badge key={exercise.id} variant="secondary" className="flex items-center gap-1">
                      {exercise.name}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => toggleExercise(exercise)} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workout Days */}
      {(programData.workout_days?.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Days ({programData.workout_days?.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {programData.workout_days?.map((day, index) => (
                <div key={day.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{day.name}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeWorkoutDay(day.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {day.focus.map((focus, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {focus}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {workoutDayMinutes(day)} minutes
                  </div>
                  <div className="text-sm">
                    <strong>Exercises:</strong> {day.exercises.map(e => e.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {initialProgram ? 'Update Program' : 'Save Program'}
        </Button>
        <Button variant="outline" onClick={onCancel} size="lg">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CreateWorkoutForm;