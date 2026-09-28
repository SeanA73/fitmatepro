import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Play, 
  Calendar, 
  Clock, 
  Target,
  Users,
  Dumbbell,
  TrendingUp
} from "lucide-react";
import { preBuiltPrograms, workoutDayMinutes } from "@/data/workoutPrograms";
import FitMateHeader from "@/components/FitMateHeader";

const ProgramDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const program = preBuiltPrograms.find(p => p.id === id);
  
  if (!program) {
    return (
      <div className="min-h-screen bg-background">
        <FitMateHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Program Not Found</h2>
            <Button onClick={() => navigate("/workouts")}>
              Back to Workouts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedWorkouts = 0; // This would come from user data
  const totalWorkouts = program.workout_days.length * program.duration_weeks;
  const progressPercent = (completedWorkouts / totalWorkouts) * 100;

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      {/* Page context bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/workouts")}>
              <ArrowLeft className="w-4 h-4" />
              Back to Programs
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{program.name}</h1>
                <Badge className="bg-primary text-primary-foreground">
                  {program.category}
                </Badge>
                <Badge variant="outline">
                  {program.difficulty}
                </Badge>
              </div>
              <p className="text-muted-foreground">{program.description}</p>
            </div>
            <Button size="lg" onClick={() => navigate(`/workout/program/${program.id}/day/0`)}>
              <Play className="w-5 h-5 mr-2" />
              Start Program
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Program Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* No rating or user count: nothing measures either. */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{program.duration_weeks}</div>
                    <div className="text-sm text-muted-foreground">Weeks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{program.days_per_week}</div>
                    <div className="text-sm text-muted-foreground">Days/Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-wellness">{program.workout_days.length}</div>
                    <div className="text-sm text-muted-foreground">Workout Days</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Goals</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.goals.map((goal, index) => (
                        <Badge key={index} variant="secondary">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Equipment Needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.equipment_needed.map((equipment, index) => (
                        <Badge key={index} variant="outline">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workout Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Workout Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="week1">
                  <TabsList className="grid w-full grid-cols-4">
                    {Array.from({ length: Math.min(4, program.duration_weeks) }, (_, i) => (
                      <TabsTrigger key={i} value={`week${i + 1}`}>
                        Week {i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Array.from({ length: Math.min(4, program.duration_weeks) }, (_, weekIndex) => (
                    <TabsContent key={weekIndex} value={`week${weekIndex + 1}`} className="space-y-4">
                      {program.workout_days.map((day, dayIndex) => (
                        <div key={dayIndex} className="border rounded-lg p-4 hover:shadow-card transition-smooth">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{day.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {workoutDayMinutes(day)} min
                                  </div>
                                  <div>{day.exercises.length} exercises</div>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/workout/program/${program.id}/day/${dayIndex}`)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {day.focus.map((focus, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Exercises:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {day.exercises.map((exercise, index) => (
                                <div key={index} className="text-sm bg-muted/50 rounded p-2">
                                  <div className="font-medium">{exercise.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {exercise.sets && exercise.reps ? 
                                      `${exercise.sets} sets × ${exercise.reps}` :
                                      exercise.duration ? 
                                        `${exercise.duration}s` :
                                        'Follow instructions'
                                    }
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-success">{completedWorkouts}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{totalWorkouts - completedWorkouts}</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => navigate(`/workout/program/${program.id}/day/0`)}>
                    <Play className="w-4 h-4 mr-2" />
                    Continue Program
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* The old "Program Stats" card is gone: its rating, participant
                count and 87% completion rate were all hardcoded. */}

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold">{program.created_by}</h4>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;