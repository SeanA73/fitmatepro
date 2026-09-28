import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Compass, ArrowLeft } from "lucide-react";
import FitMateHeader from "@/components/FitMateHeader";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";

// Previously a bare page with hardcoded bg-gray-100 (unreadable in dark mode),
// no header, and a raw <a href="/"> that forced a full document reload.
const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* noindex, and the canonical points at the URL that was actually
          requested rather than at "/", so a 404 can never present itself as the
          canonical version of the homepage. */}
      <Seo
        title="Page Not Found — FitMatePro Workout and Meal Tracker"
        description="We couldn't find anything at this address. Head back to the FitMatePro home page, or open the user guide to track down what you were looking for."
        path={location.pathname}
        noindex
      />
      <FitMateHeader />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center py-12 px-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <Compass className="w-8 h-8 text-muted-foreground" />
            </div>

            <p className="text-5xl font-bold mb-2">404</p>
            <h1 className="text-xl font-semibold mb-2">Page not found</h1>
            <p className="text-sm text-muted-foreground mb-2">
              We couldn't find anything at this address.
            </p>
            <p className="text-xs text-muted-foreground/80 mb-8 break-all">
              {location.pathname}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button asChild className="flex-1">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go home
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/guide">User guide</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
