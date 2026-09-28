import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Heart, User, LogOut, LogIn, Crown, Sparkles, ShoppingBag, BookOpen, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useHasProducts } from "@/hooks/useHasProducts";

const FitMateHeader = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, actualTheme } = useTheme();
  // Shop, Coach's Picks and AI Recommendations all read affiliate_products.
  // Hidden while that catalogue is empty rather than promoting blank pages.
  const { hasProducts } = useHasProducts();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="w-full bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          aria-label="FitMatePro home"
          className="flex items-center gap-4 rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="w-10 h-10 bg-wellness-gradient rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">FitMatePro</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Your Personal Wellness Coach</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/guide">
            <Button variant="ghost" size="sm" className="flex gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Guide</span>
            </Button>
          </Link>
          
          {/* /coach-picks is a protected route, so this must not show to
              signed-out visitors on the public landing page. */}
          {user && hasProducts && (
            <Link to="/coach-picks">
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
                <Award className="w-4 h-4" />
                Coach's Picks
              </Button>
            </Link>
          )}

          {!user && (
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                Pricing
              </Button>
            </Link>
          )}

          {user ? (
            <>
              {/* Notifications */}
              <NotificationCenter />

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'FM'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {hasProducts && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/recommendations")}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Recommendations
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/shop")}>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Shop
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/guide")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    User Guide
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/premium")}>
                    <Crown className="w-4 h-4 mr-2" />
                    Premium Features
                  </DropdownMenuItem>
                  {/* No Admin Dashboard link: there is no admin UI (see src/App.tsx) */}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="wellness" onClick={() => navigate("/auth")}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default FitMateHeader;