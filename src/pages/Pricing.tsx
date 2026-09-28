import FitMateHeader from "@/components/FitMateHeader";
import Footer from "@/components/Footer";
import PricingSection from "@/components/subscription/PricingSection";
import { Seo } from '@/components/Seo';

// PricingSection previously only rendered inside Index's signed-out branch, so
// once you were logged in there was no route to pricing anywhere in the app.
// This page is public: signed-out visitors get the sign-up path, signed-in
// users get "Current Plan" / "Start Free Trial" from the same component.
const Pricing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="FitMatePro Pricing — Free and Premium Plans Compared"
        description="Compare the Free and Premium plans side by side: weekly workout limits, nutrition logging, the custom workout builder and health data export."
        path="/pricing"
      />
      <FitMateHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
