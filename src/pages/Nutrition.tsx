import { useState } from "react";
import { ProductRecommendations } from "@/components/shop/ProductRecommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNutrition, buildMealFromFoodForm, type FoodFormValues } from "@/hooks/useNutrition";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import FitMateHeader from "@/components/FitMateHeader";

const EMPTY_FOOD_FORM: FoodFormValues = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fats: "",
  fiber: "",
  servingSize: "",
  mealType: "",
  notes: "",
};

const Nutrition = () => {
  const navigate = useNavigate();
  const { todaysMeals, loading, getTodaysNutrition, addMeal } = useNutrition();
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [savingFood, setSavingFood] = useState(false);
  const [newFood, setNewFood] = useState<FoodFormValues>(EMPTY_FOOD_FORM);

  // Same meals rows the dashboard card reads, so a meal logged on either
  // surface shows up on both.
  const todaysNutrition = getTodaysNutrition();
  const nutritionData = {
    calories: { current: todaysNutrition.calories, target: 2000 },
    protein: { current: todaysNutrition.protein, target: 120 },
    carbs: { current: todaysNutrition.carbs, target: 250 },
    fats: { current: todaysNutrition.fat, target: 65 },
  };

  const handleAddFood = async () => {
    if (!newFood.name || !newFood.calories) return;

    setSavingFood(true);
    // addMeal raises its own success/error toast and refetches todaysMeals.
    const { error } = await addMeal(buildMealFromFoodForm(newFood));
    setSavingFood(false);

    // Leave the dialog open on failure so the entry isn't silently lost.
    if (error) return;

    setNewFood(EMPTY_FOOD_FORM);
    setAddFoodOpen(false);
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
              <h1 className="text-2xl font-bold">Nutrition Center</h1>
              <p className="text-sm text-muted-foreground">Log your meals and track your macros</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={addFoodOpen} onOpenChange={setAddFoodOpen}>
                <DialogTrigger asChild>
                  <Button variant="wellness">
                    <Plus className="w-4 h-4" />
                    Add Food
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Food to Log</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="food-name">Food Name *</Label>
                        <Input
                          id="food-name"
                          value={newFood.name}
                          onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                          placeholder="e.g., Greek Yogurt with Berries"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="meal-type">Meal Type</Label>
                        <Select value={newFood.mealType} onValueChange={(value) => setNewFood({...newFood, mealType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select meal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="serving-size">Serving Size</Label>
                        <Input
                          id="serving-size"
                          value={newFood.servingSize}
                          onChange={(e) => setNewFood({...newFood, servingSize: e.target.value})}
                          placeholder="e.g., 1 cup, 100g"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="food-calories">Calories *</Label>
                        <Input
                          id="food-calories"
                          type="number"
                          value={newFood.calories}
                          onChange={(e) => setNewFood({...newFood, calories: e.target.value})}
                          placeholder="150"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="food-protein">Protein (g)</Label>
                        <Input
                          id="food-protein"
                          type="number"
                          value={newFood.protein}
                          onChange={(e) => setNewFood({...newFood, protein: e.target.value})}
                          placeholder="12"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="food-carbs">Carbs (g)</Label>
                        <Input
                          id="food-carbs"
                          type="number"
                          value={newFood.carbs}
                          onChange={(e) => setNewFood({...newFood, carbs: e.target.value})}
                          placeholder="20"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="food-fats">Fats (g)</Label>
                        <Input
                          id="food-fats"
                          type="number"
                          value={newFood.fats}
                          onChange={(e) => setNewFood({...newFood, fats: e.target.value})}
                          placeholder="5"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="food-fiber">Fiber (g)</Label>
                        <Input
                          id="food-fiber"
                          type="number"
                          value={newFood.fiber}
                          onChange={(e) => setNewFood({...newFood, fiber: e.target.value})}
                          placeholder="3"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="food-notes">Notes (optional)</Label>
                      <Textarea
                        id="food-notes"
                        value={newFood.notes}
                        onChange={(e) => setNewFood({...newFood, notes: e.target.value})}
                        placeholder="Any additional notes about preparation, brand, etc."
                        rows={2}
                      />
                    </div>
                    
                    <Button
                      onClick={handleAddFood}
                      className="w-full"
                      variant="wellness"
                      disabled={!newFood.name || !newFood.calories || savingFood}
                    >
                      {savingFood ? "Saving..." : "Add to Log"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Daily Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : (
                  Object.entries(nutritionData).map(([key, data]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{key}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(data.current)}/{data.target}{key === 'calories' ? '' : 'g'}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, (data.current / data.target) * 100)}
                        className="h-2"
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Today's Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : todaysMeals.length > 0 ? (
                  todaysMeals.map((meal) => (
                    <div key={meal.id} className="p-3 bg-calm-gradient rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {meal.meal_type || 'meal'}
                          </Badge>
                          <span className="text-sm font-medium">{meal.description || 'Meal'}</span>
                        </div>
                        <span className="text-sm font-semibold">{meal.total_calories || 0} cal</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    iconEmoji="🍽️"
                    title="No meals logged today"
                    description="Use Add Food above to log your first meal."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Self-hides when the affiliate catalogue is empty. */}
        <div className="mt-8">
          <ProductRecommendations
            category="Supplements"
            tags={["nutrition", "protein", "supplements"]}
            title="Recommended Supplements & Nutrition Products"
            limit={4}
            context="nutrition"
          />
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
