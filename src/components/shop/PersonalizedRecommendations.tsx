import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ShoppingBag, Sparkles, RefreshCw, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { useProductRecommendations, ProductRecommendation } from "@/hooks/useProductRecommendations";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { useHasProducts } from "@/hooks/useHasProducts";

interface PersonalizedRecommendationsProps {
  context?: string;
  limit?: number;
  title?: string;
  showHeader?: boolean;
  autoGenerate?: boolean;
}

export const PersonalizedRecommendations = ({
  context = "general",
  limit = 4,
  title = "Recommended for You",
  showHeader = true,
  autoGenerate = true,
}: PersonalizedRecommendationsProps) => {
  const {
    recommendations,
    loading,
    generating,
    generateRecommendations,
    trackInteraction,
    provideFeedback,
    refresh,
  } = useProductRecommendations({ context, limit, autoGenerate });
  
  const { toast } = useToast();
  const { hasProducts } = useHasProducts();
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);

  const handleProductClick = async (recommendation: ProductRecommendation) => {
    await trackInteraction(recommendation.id, "click");
    
    if (recommendation.affiliate_url) {
      window.open(recommendation.affiliate_url, "_blank");
      
      toast({
        title: "Opening product",
        description: `Redirecting to ${recommendation.brand || "store"}...`,
      });
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    await trackInteraction(recommendationId, "dismiss");
    toast({
      title: "Recommendation dismissed",
      description: "We'll use this to improve future suggestions.",
    });
  };

  const handleFeedback = async (
    recommendationId: string,
    feedbackType: "helpful" | "not_helpful" | "already_own" | "wrong_category" | "too_expensive" | "other"
  ) => {
    await provideFeedback(recommendationId, feedbackType);
    setFeedbackOpen(null);
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && !generating) {
    // Recommendations are drawn from affiliate_products. With an empty
    // catalogue there is nothing to recommend, so don't offer a Generate
    // button that cannot succeed.
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            {hasProducts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateRecommendations(true)}
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Recommendations
              </Button>
            )}
          </div>
        )}
        {hasProducts ? (
          <EmptyState
            icon={ShoppingBag}
            title="No recommendations yet"
            description="Generate personalized product recommendations based on your workout history and goals."
            actionLabel="Get Recommendations"
            onAction={() => generateRecommendations(true)}
          />
        ) : (
          <EmptyState
            icon={ShoppingBag}
            title="No products available"
            description="The product catalogue is empty, so there's nothing to recommend yet."
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{title}</h3>
            {recommendations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                Personalised
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refresh()}
              disabled={generating}
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      )}

      {generating && recommendations.length === 0 && (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Analyzing your workout history and goals to generate personalized recommendations...
          </p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((recommendation) => (
            <Card
              key={recommendation.id}
              className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden relative"
            >
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  {recommendation.image_url && (
                    <img
                      src={recommendation.image_url}
                      alt={recommendation.product_name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  
                  {/* Match score badge (rule-based scoring, not a model) */}
                  {recommendation.confidence_score && recommendation.confidence_score > 0.7 && (
                    <Badge className="absolute top-2 left-2 bg-primary flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Match
                    </Badge>
                  )}

                  {recommendation.price_cents && recommendation.price_cents < (recommendation.price_cents * 1.5) && (
                    <Badge className="absolute top-2 right-2 bg-destructive">
                      {recommendation.category === "Supplements" ? "Popular" : "Trending"}
                    </Badge>
                  )}

                  {/* Dismiss button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(recommendation.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-4 space-y-2">
                  {recommendation.brand && (
                    <p className="text-xs text-muted-foreground">{recommendation.brand}</p>
                  )}
                  
                  <h4 className="font-semibold line-clamp-2 min-h-[2.5rem] text-sm">
                    {recommendation.product_name}
                  </h4>

                  {/* Recommendation reason */}
                  {recommendation.recommendation_reason && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">
                      {recommendation.recommendation_reason}
                    </p>
                  )}

                  {recommendation.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-medium">{recommendation.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({recommendation.review_count || 0})
                      </span>
                    </div>
                  )}

                  {/* Confidence score indicator */}
                  {recommendation.confidence_score && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden relative">
                        <div
                          className="bg-primary h-full transition-all absolute top-0 left-0"
                          style={{ width: `${recommendation.confidence_score * 100}%` } as React.CSSProperties}
                        />
                      </div>
                      <span className="text-muted-foreground">
                        {Math.round(recommendation.confidence_score * 100)}% match
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      {recommendation.price_cents && (
                        <span className="text-base font-bold text-primary">
                          {formatPrice(recommendation.price_cents)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Feedback menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleFeedback(recommendation.id, "helpful")}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Helpful
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleFeedback(recommendation.id, "not_helpful")}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Not Helpful
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleFeedback(recommendation.id, "already_own")}
                          >
                            Already Own
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleFeedback(recommendation.id, "wrong_category")}
                          >
                            Wrong Category
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleFeedback(recommendation.id, "too_expensive")}
                          >
                            Too Expensive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="group-hover:bg-primary group-hover:text-primary-foreground"
                        onClick={() => handleProductClick(recommendation)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Recommendations personalized based on your workout history, goals, and preferences.
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 ml-1 text-xs"
            onClick={() => refresh()}
            disabled={generating}
          >
            Refresh recommendations
          </Button>
        </p>
      )}
    </div>
  );
};



