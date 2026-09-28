import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { preBuiltPrograms } from "@/data/workoutPrograms";
import ProductRecommendation from "@/components/affiliate/ProductRecommendation";

// This card used to list three hardcoded workouts with "247 joined" style
// social proof and a dead "Customize" button. It now previews the real bundled
// programs. The heading is no longer "Today's Workouts" because nothing in the
// app schedules a workout for today.
const WorkoutPlanning = () => {
  const navigate = useNavigate();

  const featuredPrograms = preBuiltPrograms.slice(0, 3);

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-smooth">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Workout Programs</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {featuredPrograms.map((program) => (
          <div
            key={program.id}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-card transition-smooth"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{program.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{program.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {program.duration_weeks} weeks
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {program.days_per_week} days/week
                  </div>
                  <span>{program.workout_days.length} workout days</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="text-xs">
                  {program.difficulty}
                </Badge>
                <Button
                  variant="wellness"
                  size="sm"
                  onClick={() => navigate(`/program/${program.id}`)}
                >
                  View Program
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="text-center pt-4">
          <Button variant="outline" className="w-full" onClick={() => navigate("/workouts")}>
            Browse All Workouts
          </Button>
        </div>
      </CardContent>

      {/* The old description read "Tools that helped users like you reach their
          goals" — an outcome claim about other users that nothing measures. */}
      <CardContent className="pt-0">
        <ProductRecommendation
          context="workout"
          title="Gear Up for Better Workouts"
          description="Equipment matched to the workouts you're doing"
          limit={3}
        />
      </CardContent>
    </Card>
  );
};

export default WorkoutPlanning;
