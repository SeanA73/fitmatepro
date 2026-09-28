import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Filter, Star, ShoppingCart, ExternalLink, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AIProductRecommendations } from "@/components/AIProductRecommendations";
import FitMateHeader from "@/components/FitMateHeader";

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  category: string;
  subcategory: string;
  price_cents: number;
  original_price_cents: number | null;
  currency: string;
  affiliate_url: string;
  image_url: string | null;
  brand: string | null;
  rating: number | null;
  review_count: number;
  tags: string[];
  features: any;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

const Shop = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from("product_categories")
        .select("*")
        .order("display_order");
      
      if (categoriesData) setCategories(categoriesData);

      // Load products
      let query = supabase
        .from("affiliate_products")
        .select("*")
        .eq("is_active", true);

      const { data: productsData } = await query;
      if (productsData) setProducts(productsData);
    } catch (error) {
      toast({
        title: "Error loading products",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product: Product) => {
    // Track click
    try {
      await supabase.from("affiliate_clicks").insert({
        user_id: user?.id || null,
        product_id: product.id,
        session_id: crypto.randomUUID(),
        referrer_page: window.location.pathname
      });
    } catch (error) {
      // Silent fail
    }

    // Open affiliate link
    window.open(product.affiliate_url, "_blank");
    
    toast({
      title: "Opening product page",
      description: `Redirecting to ${product.brand || "store"}...`
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = searchTerm === "" || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "featured") return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      if (sortBy === "price-low") return a.price_cents - b.price_cents;
      if (sortBy === "price-high") return b.price_cents - a.price_cents;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <div className="min-h-screen bg-background">
      <FitMateHeader />
      {/* Page context bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Fitness Shop</h1>
              <p className="text-sm text-muted-foreground">Premium gear for your fitness journey</p>
            </div>
            {/* The cart icon here had no handler and there is no cart — this is
                an affiliate catalogue that hands off to external stores. */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* AI Recommendations */}
        {user && (
          <div className="mb-8">
            <AIProductRecommendations />
          </div>
        )}

        {/* Featured Banner */}
        {featuredProducts.length > 0 && (
          <Card className="mb-8 overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Featured Products</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="cursor-pointer group"
                  >
                    <div className="relative aspect-square bg-background rounded-lg overflow-hidden mb-2">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      {product.original_price_cents && (
                        <Badge className="absolute top-2 right-2 bg-destructive">
                          Save {Math.round((1 - product.price_cents / product.original_price_cents) * 100)}%
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{formatPrice(product.price_cents)}</span>
                      {product.original_price_cents && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.original_price_cents)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-input bg-background rounded-md"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">All Products</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.icon} {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleProductClick(product)}
              >
                <CardContent className="p-4">
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                    {product.original_price_cents && (
                      <Badge className="absolute top-2 right-2 bg-destructive">
                        -{Math.round((1 - product.price_cents / product.original_price_cents) * 100)}%
                      </Badge>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-primary">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {product.brand && (
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                    )}
                    <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                    
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({product.review_count})
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.short_description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price_cents)}
                        </span>
                        {product.original_price_cents && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {formatPrice(product.original_price_cents)}
                          </span>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {product.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Distinguish "your filter matched nothing" from "the catalogue is
            empty" — telling someone to adjust filters when there are no
            products at all just sends them in circles. */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            {products.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">The shop isn't stocked yet</h3>
                <p className="text-muted-foreground">
                  No products have been added. Check back later.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
