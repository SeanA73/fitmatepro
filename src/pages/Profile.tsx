import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar, 
  Ruler, 
  Weight, 
  Activity, 
  Target, 
  Crown,
  ArrowLeft,
  Save,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import FitMateHeader from "@/components/FitMateHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionSettings } from "@/components/subscription/SubscriptionSettings";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { AIProductRecommendations } from "@/components/AIProductRecommendations";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { subscription, getCurrentPlan, hasPremiumAccess, cancelSubscription, createCheckoutSession } = useSubscription();
  // isAdmin is used for the plan badge label only — it must never feed an
  // entitlement decision. Gating stays on getCurrentPlan()/hasPremiumAccess().
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profileData, setProfileData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    activity_level: "",
    fitness_goals: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        date_of_birth: profile.date_of_birth || "",
        gender: profile.gender || "",
        height_cm: profile.height_cm?.toString() || "",
        weight_kg: profile.weight_kg?.toString() || "",
        activity_level: profile.activity_level || "",
        fitness_goals: profile.fitness_goals || [],
      });
    } else if (user && !profile) {
      // If user exists but no profile, create empty profile data with user's email
      setProfileData({
        full_name: user.user_metadata?.full_name || "",
        date_of_birth: "",
        gender: "",
        height_cm: "",
        weight_kg: "",
        activity_level: "",
        fitness_goals: [],
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: profileData.full_name,
        date_of_birth: profileData.date_of_birth || null,
        gender: profileData.gender || null,
        height_cm: profileData.height_cm ? parseInt(profileData.height_cm) : null,
        weight_kg: profileData.weight_kg ? parseFloat(profileData.weight_kg) : null,
        activity_level: profileData.activity_level || null,
        fitness_goals: profileData.fitness_goals,
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFitnessGoal = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      fitness_goals: prev.fitness_goals.includes(goal)
        ? prev.fitness_goals.filter(g => g !== goal)
        : [...prev.fitness_goals, goal]
    }));
  };

  const fitnessGoals = [
    "weight_loss",
    "muscle_gain", 
    "endurance",
    "flexibility",
    "strength",
    "general_health"
  ];

  const planBadgeVariant = (plan: string) => {
    if (isAdmin) return 'destructive';
    switch (plan) {
      case 'premium': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getPlanDisplay = () => {
    if (isAdmin) return 'ADMIN';
    return getCurrentPlan().toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <FitMateHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Profile Overview */}
              <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-xl">{profile?.full_name || "User"}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant={planBadgeVariant(getCurrentPlan())}>
                    {isAdmin && <Settings className="w-3 h-3 mr-1" />}
                    {!isAdmin && getCurrentPlan() === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                    {getPlanDisplay()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  {profile?.date_of_birth && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(profile.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {profile?.activity_level && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground capitalize">
                        {profile.activity_level.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {profile?.fitness_goals && profile.fitness_goals.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Fitness Goals</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {profile.fitness_goals.map(goal => (
                        <Badge key={goal} variant="outline" className="text-xs">
                          {goal.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profileData.date_of_birth}
                      onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={profileData.gender} 
                      onValueChange={(value) => setProfileData({...profileData, gender: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="activity_level">Activity Level</Label>
                    <Select 
                      value={profileData.activity_level} 
                      onValueChange={(value) => setProfileData({...profileData, activity_level: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="lightly_active">Lightly Active</SelectItem>
                        <SelectItem value="moderately_active">Moderately Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                        <SelectItem value="extremely_active">Extremely Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="height_cm"
                        type="number"
                        value={profileData.height_cm}
                        onChange={(e) => setProfileData({...profileData, height_cm: e.target.value})}
                        placeholder="170"
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="weight_kg"
                        type="number"
                        value={profileData.weight_kg}
                        onChange={(e) => setProfileData({...profileData, weight_kg: e.target.value})}
                        placeholder="70"
                        className="pl-10"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Fitness Goals</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {fitnessGoals.map(goal => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={`goal-${goal}`}
                            checked={profileData.fitness_goals.includes(goal)}
                            onCheckedChange={() => toggleFitnessGoal(goal)}
                            disabled={!isEditing}
                          />
                          <Label htmlFor={`goal-${goal}`} className="text-sm capitalize">
                            {goal.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>

          {/* AI Recommendations */}
          <div className="mt-8">
            <AIProductRecommendations />
          </div>
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionSettings />
        </TabsContent>

        {/* Pause and delete live on their own tab, away from the fields a user
            edits routinely, so neither is adjacent to a Save button. */}
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default Profile;