import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkoutProgram, workoutDayMinutes } from "@/data/workoutPrograms";
import { Clock, Calendar, Target, Play } from "lucide-react";

interface WorkoutProgramCardProps {
  program: WorkoutProgram;
  onStart: (programId: string) => void;
  onCustomize: (programId: string) => void;
}

const WorkoutProgramCard = ({ program, onStart, onCustomize }: WorkoutProgramCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success';
      case 'Intermediate': return 'bg-warning';
      case 'Advanced': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Weightlifting': return 'bg-primary';
      case 'Bodybuilding': return 'bg-secondary';
      case 'General Fitness': return 'bg-success';
      case 'Cardio': return 'bg-motivation-gradient';
      case 'Strength': return 'bg-wellness-gradient';
      case 'Powerlifting': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="hover:shadow-card-hover transition-smooth">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-white ${getCategoryColor(program.category)}`}>
                {program.category}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(program.difficulty)}>
                {program.difficulty}
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">{program.name}</CardTitle>
            <p className="text-sm text-muted-foreground mb-3">{program.description}</p>
            <div className="text-xs text-muted-foreground">Created by {program.created_by}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Program Stats. No user count or rating: there is no userbase to
              count and no review mechanism to average. */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{program.duration_weeks} weeks</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{program.days_per_week} days/week</span>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h4 className="text-sm font-medium mb-2">Goals:</h4>
            <div className="flex flex-wrap gap-1">
              {program.goals.map((goal, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h4 className="text-sm font-medium mb-2">Equipment needed:</h4>
            <div className="flex flex-wrap gap-1">
              {program.equipment_needed.map((equipment, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {equipment}
                </Badge>
              ))}
            </div>
          </div>

          {/* Workout Days Preview */}
          <div>
            <h4 className="text-sm font-medium mb-2">Workout Schedule:</h4>
            <div className="space-y-1">
              {program.workout_days.slice(0, 3).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-muted/50 rounded p-2">
                  <span className="font-medium">{day.name}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{workoutDayMinutes(day)}min</span>
                  </div>
                </div>
              ))}
              {program.workout_days.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{program.workout_days.length - 3} more workout days
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="wellness" 
              className="flex-1"
              onClick={() => onStart(program.id)}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Program
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onCustomize(program.id)}
            >
              <Target className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutProgramCard;