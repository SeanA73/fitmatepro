import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, UtensilsCrossed, ShoppingCart, ChefHat, Sparkles, Lock } from 'lucide-react';
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt';

interface MealPlan {
  id: string;
  date: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
  };
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime?: string;
  difficulty?: string;
}

export const AdvancedMealPlanning = () => {
  const { hasPremiumAccess } = useSubscription();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  // Generate meal plan for the week
  const generateMealPlan = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const plans: MealPlan[] = days.map((day, index) => ({
      id: `day-${index}`,
      date: day,
      meals: {
        breakfast: {
          name: 'Overnight Oats with Berries',
          calories: 320,
          protein: 12,
          carbs: 45,
          fats: 8,
          prepTime: '5 min',
          difficulty: 'Easy'
        },
        lunch: {
          name: 'Quinoa Power Bowl',
          calories: 450,
          protein: 28,
          carbs: 55,
          fats: 12,
          prepTime: '20 min',
          difficulty: 'Medium'
        },
        dinner: {
          name: 'Grilled Chicken with Vegetables',
          calories: 480,
          protein: 42,
          carbs: 30,
          fats: 18,
          prepTime: '30 min',
          difficulty: 'Easy'
        },
        snacks: [
          { name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 8, fats: 2 },
          { name: 'Apple with Almonds', calories: 180, protein: 4, carbs: 25, fats: 9 }
        ]
      },
      totalCalories: 1550,
      macros: {
        protein: 101,
        carbs: 163,
        fats: 49
      }
    }));
    setMealPlans(plans);
  };

  if (!hasPremiumAccess()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Advanced Meal Planning
            <Badge variant="secondary" className="ml-2">Premium</Badge>
          </CardTitle>
          <CardDescription>
            Weekly meal planning with shopping lists and macro tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpgradePrompt 
            trigger="premium_feature_access"
            featureName="Advanced Meal Planning"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Advanced Meal Planning
              <Badge variant="default" className="ml-2">Premium</Badge>
            </CardTitle>
            <CardDescription>
              Weekly meal plans tailored to your goals and preferences
            </CardDescription>
          </div>
          <Button onClick={generateMealPlan} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generate Plan
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Weekly Calendar</TabsTrigger>
            <TabsTrigger value="shopping">Shopping List</TabsTrigger>
            <TabsTrigger value="macros">Macro Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4 mt-4">
            {mealPlans.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Meal Plan Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Generate Plan" to create your personalized weekly meal plan
                </p>
                <Button onClick={generateMealPlan}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Meal Plan
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {mealPlans.map((plan) => (
                  <Card key={plan.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.date}</CardTitle>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            {plan.totalCalories} cal
                          </Badge>
                          <Badge variant="secondary">
                            P: {plan.macros.protein}g | C: {plan.macros.carbs}g | F: {plan.macros.fats}g
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <MealCard meal={plan.meals.breakfast} type="Breakfast" />
                        <MealCard meal={plan.meals.lunch} type="Lunch" />
                        <MealCard meal={plan.meals.dinner} type="Dinner" />
                      </div>
                      {plan.meals.snacks.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Snacks</h4>
                          <div className="flex gap-2">
                            {plan.meals.snacks.map((snack, idx) => (
                              <Badge key={idx} variant="outline">
                                {snack.name} ({snack.calories} cal)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shopping" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Quinoa (2 cups)',
                    'Chicken Breast (1.5 lbs)',
                    'Mixed Vegetables (3 bags)',
                    'Greek Yogurt (32 oz)',
                    'Berries (2 containers)',
                    'Almonds (1 bag)',
                    'Oats (1 container)',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded border">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="flex-1">{item}</span>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Export Shopping List
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="macros" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Macro Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <div className="text-2xl font-bold text-primary">707g</div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <div className="text-2xl font-bold text-success">1,141g</div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent/10">
                    <div className="text-2xl font-bold text-accent">343g</div>
                    <div className="text-sm text-muted-foreground">Fats</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold mb-1">10,850</div>
                  <div className="text-sm text-muted-foreground">Total Calories / Week</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const MealCard = ({ meal, type }: { meal: Meal; type: string }) => (
  <div className="p-3 rounded-lg border bg-card">
    <div className="flex items-start justify-between mb-2">
      <div>
        <div className="text-xs font-medium text-muted-foreground mb-1">{type}</div>
        <div className="font-semibold">{meal.name}</div>
      </div>
      <Badge variant="outline" className="text-xs">
        {meal.calories} cal
      </Badge>
    </div>
    {meal.prepTime && (
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Clock className="w-3 h-3" />
        {meal.prepTime}
      </div>
    )}
    <div className="text-xs text-muted-foreground">
      P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g
    </div>
  </div>
);


