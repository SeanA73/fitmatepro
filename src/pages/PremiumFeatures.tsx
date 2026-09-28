import FitMateHeader from "@/components/FitMateHeader";
import { AdvancedMealPlanning } from "@/components/nutrition/AdvancedMealPlanning";
import { CustomWorkoutBuilder } from "@/components/workout/CustomWorkoutBuilder";
import { HealthDataExport } from "@/components/export/HealthDataExport";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dumbbell, 
  ChefHat, 
  Download, 
  Palette,
  CheckCircle2,
  Crown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

const PremiumFeatures = () => {
  const { hasPremiumAccess } = useSubscription();
  const navigate = useNavigate();

  const features = [
    {
      id: 'workouts',
      name: 'Unlimited Workouts & Custom Plans',
      icon: Dumbbell,
      description: 'Track unlimited workouts and create custom workout plans'
    },
    {
      id: 'nutrition',
      name: 'Advanced Meal Planning',
      icon: ChefHat,
      description: 'Weekly meal plans with shopping lists and macro targets'
    },
    {
      id: 'export',
      name: 'Export Health Data',
      icon: Download,
      description: 'Download your complete fitness data in multiple formats'
    },
    {
      id: 'themes',
      name: 'Dark Mode & Themes',
      icon: Palette,
      description: 'Customize your app appearance with themes and colors'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Premium Features</h1>
              <p className="text-muted-foreground">
                Unlock the full potential of FitMatePro with premium features
              </p>
            </div>
          </div>
          
          {hasPremiumAccess() ? (
            <Badge variant="default" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              You have Premium access
            </Badge>
          ) : (
            /* This card had no CTA and no link, which made /premium a dead end
               for the header Crown menu, the footer link, CheckoutCancel and
               PremiumRoute's fallback redirect — all of which land here. */
            <Card className="mt-4 border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-sm text-muted-foreground flex-1">
                  Upgrade to Premium to unlock all these features and more.
                </p>
                <Button onClick={() => navigate('/pricing')} className="gap-2 shrink-0">
                  <Crown className="w-4 h-4" />
                  View plans &amp; upgrade
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.id} className={hasPremiumAccess() ? 'border-primary/20' : ''}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${hasPremiumAccess() ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon className={`w-5 h-5 ${hasPremiumAccess() ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasPremiumAccess() ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="w-3 h-3" />
                          Premium
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6 mt-6">
            <CustomWorkoutBuilder />
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6 mt-6">
            <AdvancedMealPlanning />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <HealthDataExport />
          </TabsContent>
        </Tabs>

        {/* Additional Premium Features */}
        <div className="mt-8 space-y-6">
          <ThemeSettings />
        </div>
      </main>
    </div>
  );
};

export default PremiumFeatures;
