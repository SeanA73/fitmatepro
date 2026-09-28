import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, RotateCcw, Clock, Check } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  preBuiltPrograms,
  standaloneWorkouts,
  standaloneWorkoutDuration,
  workoutDayDuration,
  exerciseBlockSeconds,
} from "@/data/workoutPrograms";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FitMateHeader from "@/components/FitMateHeader";

const WorkoutSession = () => {
  const navigate = useNavigate();
  const { id, programId, dayId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // Set on the first Start press, not on mount — opening the page is not
  // starting a workout.
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const savedRef = useRef(false);

  // Resolve the session from the route. Both branches look up a real record —
  // :id is no longer ignored, so each standalone workout opens its own session.
  const getWorkoutData = () => {
    if (programId && dayId) {
      const program = preBuiltPrograms.find(p => p.id === programId);
      const dayIndex = parseInt(dayId);

      if (program && program.workout_days[dayIndex]) {
        const workoutDay = program.workout_days[dayIndex];
        // Total and parts come from the same helper, so the countdown always
        // ends exactly when the last exercise does. The total used to be the
        // day's asserted estimated_duration (45:00) while the parts summed to
        // 5:00, so the clock ran for forty minutes past the final exercise and
        // completion — the only thing that saved a session — was unreachable.
        return {
          title: workoutDay.name,
          duration: workoutDayDuration(workoutDay),
          difficulty: program.difficulty,
          exercises: workoutDay.exercises.map(exercise => ({
            name: exercise.name,
            duration: exerciseBlockSeconds(exercise),
            description: exercise.description,
          }))
        };
      }
      return null;
    }

    const standalone = standaloneWorkouts.find(workout => workout.id === id);
    if (standalone) {
      return {
        title: standalone.title,
        duration: standaloneWorkoutDuration(standalone),
        difficulty: standalone.difficulty,
        exercises: standalone.exercises.map(exercise => ({
          name: exercise.name,
          duration: exercise.duration,
          description: exercise.description,
        }))
      };
    }

    return null;
  };

  const workout = getWorkoutData();

  // Which exercise is on at a given elapsed time. This is a pure function of
  // currentTime, so it is derived rather than held in state. It used to be a
  // useState written from inside the setCurrentTime updater, with the guard
  // `newTime <= timeSum && currentExercise !== i`. That guard made the loop skip
  // the exercise that was already current and fall through to the next one: on
  // the first tick it jumped to exercise 2, on the second tick the same skip
  // sent it back to exercise 1, and the indicator oscillated once a second for
  // the whole workout.
  const exerciseIndexAt = (time: number) => {
    if (!workout) return 0;
    let elapsed = 0;
    for (let i = 0; i < workout.exercises.length; i++) {
      elapsed += workout.exercises[i].duration;
      if (time < elapsed) return i;
    }
    return workout.exercises.length - 1;
  };

  const currentExercise = exerciseIndexAt(currentTime);
  const currentExerciseData = workout?.exercises[currentExercise];

  // Elapsed within the current exercise, measured from where it starts in the
  // sequence. The big on-screen countdown is this exercise's remaining time, not
  // the whole workout's — it sits directly under "Exercise 1 of 3", so showing
  // 44:44 of 45:00 there read as an exercise timer and was simply wrong.
  const exerciseStart = workout
    ? workout.exercises.slice(0, currentExercise).reduce((sum, ex) => sum + ex.duration, 0)
    : 0;
  const exerciseElapsed = currentTime - exerciseStart;
  const exerciseRemaining = currentExerciseData
    ? Math.max(0, currentExerciseData.duration - exerciseElapsed)
    : 0;

  const totalRemaining = workout ? Math.max(0, workout.duration - currentTime) : 0;
  const totalProgress = workout ? (currentTime / workout.duration) * 100 : 0;
  const exerciseProgress = currentExerciseData
    ? (exerciseElapsed / currentExerciseData.duration) * 100
    : 100;

  // Deps are only isPlaying and duration. currentTime and currentExercise used
  // to be deps too, which tore the interval down and rebuilt it on every tick —
  // so each displayed second actually took 1000ms plus a render, and the counter
  // ran measurably slow over a 30-minute session. The updater no longer calls
  // another setter either; a state updater has to stay pure.
  const duration = workout?.duration;

  useEffect(() => {
    if (!isPlaying || duration === undefined) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => Math.min(prev + 1, duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Stop at the end instead of leaving a clamped interval running forever.
  useEffect(() => {
    if (isPlaying && duration !== undefined && currentTime >= duration) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentTime, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (!startedAt) setStartedAt(new Date());
    setIsPlaying(!isPlaying);
  };

  const resetWorkout = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setStartedAt(null);
    savedRef.current = false;
  };

  const isCompleted = workout ? currentTime >= workout.duration : false;

  // Persist the session. Two callers: the timer reaching the end, and the
  // explicit Finish button. savedRef guards against a second insert — `workout`
  // is rebuilt every render, so it can't be a dep of the effect below.
  //
  // `elapsed` is the counted time, so a session finished early records what was
  // actually done rather than the full programme. Exercises are truncated to the
  // ones actually reached, and the one in progress is recorded with the seconds
  // completed rather than its full block.
  const saveSession = async (elapsed: number, completed: boolean) => {
    if (!workout || !user || !startedAt || savedRef.current) return;
    savedRef.current = true;

    const exercisesCompleted = workout.exercises
      .map((exercise, index) => {
        const start = workout.exercises
          .slice(0, index)
          .reduce((sum, ex) => sum + ex.duration, 0);
        const done = Math.max(0, Math.min(exercise.duration, elapsed - start));
        return { name: exercise.name, duration_seconds: done };
      })
      .filter(exercise => exercise.duration_seconds > 0);

    const { error } = await supabase.from("workout_sessions").insert({
      user_id: user.id,
      start_time: startedAt.toISOString(),
      end_time: new Date().toISOString(),
      completed,
      exercises_completed: exercisesCompleted,
      // workout_plan_id stays null: these sessions come from the static
      // preBuiltPrograms data, whose ids are not workout_plans rows.
      // calories_burned and heart_rate_data stay null — nothing measures them.
    });

    if (error) {
      savedRef.current = false;
      toast({
        title: "Could not save workout",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (!isCompleted) return;
    saveSession(currentTime, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, user, startedAt]);

  // Explicit finish. Completion can no longer depend solely on the clock running
  // out — nobody sits through a timer to the second, and that was the only path
  // to a saved row. `completed` records whether the full programme was reached,
  // so an early finish is stored honestly rather than as a full session.
  const finishWorkout = async () => {
    if (!startedAt) {
      toast({
        title: "Workout not started",
        description: "Press Start before finishing, so there is something to record.",
      });
      return;
    }

    setIsPlaying(false);
    const saved = await saveSession(currentTime, isCompleted);

    if (saved) {
      toast({
        title: "Workout saved",
        description: `Recorded ${formatTime(currentTime)} of ${workout ? formatTime(workout.duration) : ""}.`,
      });
      navigate(programId ? `/program/${programId}` : "/workouts");
    }
  };

  // Every hook above runs unconditionally; only the render bails out.
  if (!workout) {
    return (
      <div className="min-h-screen bg-background">
        <FitMateHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Workout Not Found</h2>
            <Button onClick={() => navigate("/workouts")}>Back to Workouts</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      {/* Page context bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(programId ? `/program/${programId}` : "/workouts")}>
              <ArrowLeft className="w-4 h-4" />
              {programId ? "Back to Program" : "Back to Workouts"}
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{workout.title}</h1>
              <p className="text-sm text-muted-foreground">
                {workout.exercises.length} exercises · {formatTime(workout.duration)}
              </p>
            </div>
            <Badge variant="outline">{workout.difficulty}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!isCompleted ? (
          <div className="space-y-8">
            {/* Current Exercise */}
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">{currentExerciseData.name}</h2>
                  <p className="text-muted-foreground mb-4">{currentExerciseData.description}</p>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Exercise {currentExercise + 1} of {workout.exercises.length}
                  </Badge>
                </div>

                {/* Current-exercise countdown */}
                <div className="text-6xl font-bold text-primary mb-1">
                  {formatTime(exerciseRemaining)}
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  left in this exercise
                </p>

                {/* Exercise Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Exercise Progress</span>
                    <span>{Math.round(Math.max(0, Math.min(100, exerciseProgress)))}%</span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, exerciseProgress))} className="h-3 mb-4" />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" size="lg" onClick={resetWorkout}>
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </Button>
                  <Button variant="wellness" size="lg" onClick={togglePlayPause}>
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isPlaying ? "Pause" : "Start"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={finishWorkout}
                    disabled={!startedAt}
                  >
                    <Check className="w-5 h-5" />
                    Finish workout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Overall Progress */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Workout Progress</span>
                  <span>{Math.round(totalProgress)}% Complete</span>
                </div>
                <Progress value={totalProgress} className="h-2 mb-4" />
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(currentTime)} / {formatTime(workout.duration)}</span>
                    </div>
                  </div>
                  {/* Whole-workout remaining lives here, next to the workout
                      totals, rather than under "Exercise 1 of 3". */}
                  <span className="text-muted-foreground">
                    {formatTime(totalRemaining)} left
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Exercise List */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Workout Plan</h3>
                <div className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        index === currentExercise ? 'bg-wellness-gradient/10 border-primary' : 
                        index < currentExercise ? 'bg-success/10 border-success/20' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === currentExercise ? 'bg-primary text-primary-foreground' :
                          index < currentExercise ? 'bg-success text-success-foreground' : 'bg-muted'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium">{exercise.name}</span>
                          <p className="text-xs text-muted-foreground">{exercise.description}</p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(exercise.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Completion Screen */
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4">Workout Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Amazing work! You've completed your {workout.title} session.
              </p>
              
              {/* Only figures we actually have. Calories and heart rate are not
                  measured by anything, so they are not shown. */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatTime(currentTime)}</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{workout.exercises.length}</div>
                  <div className="text-sm text-muted-foreground">Exercises Completed</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate(programId ? `/program/${programId}` : "/workouts")}>
                  {programId ? "Back to Program" : "Browse More Workouts"}
                </Button>
                <Button variant="wellness" onClick={() => navigate("/")}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkoutSession;