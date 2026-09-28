import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FitMateHeader from "@/components/FitMateHeader";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from '@/components/Seo';
import {
  Users,
  Trophy, 
  Share2, 
  MessageSquare,
  ArrowLeft,
  Calendar,
  Target,
  Heart,
  Zap,
  Star,
  UserPlus
} from "lucide-react";

const CommunityFeatures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Public marketing page. Nothing here is built yet, so a signed-in user is
  // sent back to the dashboard rather than to the login screen.
  const startHere = () => navigate(user ? "/" : "/auth?plan=free");

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Group Workouts",
      description: "Join live virtual group workout sessions with other community members"
    },
    {
      icon: <Share2 className="w-6 h-6 text-primary" />,
      title: "Achievement Sharing",
      description: "Share your fitness milestones and celebrate successes with the community"
    },
    {
      icon: <Trophy className="w-6 h-6 text-primary" />,
      title: "Community Challenges",
      description: "Participate in monthly challenges and compete with friends"
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
      title: "Discussion Forums",
      description: "Connect with like-minded individuals and share tips and advice"
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: "Goal Buddies",
      description: "Find accountability partners with similar fitness goals"
    },
    {
      icon: <Star className="w-6 h-6 text-primary" />,
      title: "Expert Q&A",
      description: "Get answers from certified trainers and nutrition experts"
    }
  ];

  const communityTypes = [
    {
      name: "Beginner's Circle",
      description: "Supportive community for fitness newcomers",
      members: "2.5K+ members",
      badge: "Free"
    },
    {
      name: "Strength Athletes",
      description: "For serious lifters and strength training enthusiasts",
      members: "Active community",
      badge: "Premium"
    },
    {
      name: "Cardio Warriors",
      description: "Running, cycling, and cardio enthusiasts unite",
      members: "Active community",
      badge: "Premium"
    },
    {
      name: "Elite Performance",
      description: "Advanced athletes and competitive fitness",
      members: "Active community",
      badge: "Premium"
    }
  ];

  const testimonials: { name: string; role: string; text: string; rating: number }[] = [];

  // Free and Premium are the only tiers. There is no Pro tier.
  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "Free": return "secondary";
      case "Premium": return "default";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Community — Train Alongside Other FitMatePro Members"
        description="Share milestones, join monthly challenges, find an accountability partner and swap advice with other members working toward similar fitness goals."
        path="/features/community-features"
        noindex
      />
      <FitMateHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-8 hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Community Features</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block">Fitness is Better</span>
            <span className="block text-primary">Together</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join a thriving community of fitness enthusiasts. Share your journey, find motivation, 
            and achieve your goals together with thousands of like-minded individuals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={startHere}>
              <UserPlus className="w-4 h-4 mr-2" />
              {user ? "Go to Dashboard" : "Create an Account"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/chat")}>
              <Zap className="w-4 h-4 mr-2" />
              Try Coaching
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Connect, Share, and Grow Together
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Community Groups */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Find Your Fitness Tribe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityTypes.map((community, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{community.name}</CardTitle>
                    <Badge variant={getBadgeVariant(community.badge)}>
                      {community.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{community.members}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{community.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            What Our Community Says
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Community Matters */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Why Community Matters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Stay Motivated</h3>
                    <p className="text-muted-foreground">
                      Draw inspiration from others' success stories and maintain momentum in your fitness journey.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Learn Together</h3>
                    <p className="text-muted-foreground">
                      Share knowledge, tips, and experiences with fellow fitness enthusiasts and experts.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Stay Accountable</h3>
                    <p className="text-muted-foreground">
                      Find workout partners and accountability buddies to help you stay consistent with your goals.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary to-secondary text-white">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Join Our Community?
              </h2>
              <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                Connect with thousands of fitness enthusiasts and start your journey toward better health together.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={startHere}
                className="bg-white text-primary hover:bg-white/90"
              >
                {user ? "Go to Dashboard" : "Create an Account"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeatures;