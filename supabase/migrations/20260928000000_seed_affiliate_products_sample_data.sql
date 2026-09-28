-- =============================================================================
-- Sample affiliate_products data
-- =============================================================================
-- affiliate_products has no seed data anywhere: the table exists but every row
-- had to come from a real affiliate integration that was never wired up. Every
-- consumer of it — recommend-products (see supabase/functions/recommend-products),
-- useProductRecommendations.tsx, CoachPicks.tsx, Shop.tsx — always returns empty.
--
-- These are placeholder products so those code paths have something real to
-- work with. affiliate_url points at '#' and is_featured is left false: this
-- is sample data, not a live catalog. Replace with real affiliate links before
-- launch, or delete these rows once real products exist.
-- =============================================================================

INSERT INTO public.affiliate_products
  (name, description, short_description, category, subcategory, price_cents,
   affiliate_url, brand, rating, review_count, tags, is_featured, is_active)
VALUES
  ('Adjustable Dumbbell Set',
   'A pair of dumbbells that adjust from 5 to 52.5 lbs each, replacing a full rack in a fraction of the space. Good for progressive overload at home.',
   'Space-saving dumbbells that adjust from 5 to 52.5 lbs.',
   'fitness-equipment', 'strength', 34900,
   '#', 'IronCore', 4.6, 1280,
   ARRAY['strength', 'home-gym', 'weights', 'progressive-overload'],
   true, true),

  ('Resistance Band Set (5-Piece)',
   'Five bands of increasing resistance with door anchor, ankle straps, and carry bag. Packs flat for travel workouts.',
   'Portable resistance bands for strength and mobility work.',
   'fitness-equipment', 'resistance-training', 2499,
   '#', 'FlexFit', 4.4, 3420,
   ARRAY['strength', 'mobility', 'travel', 'recovery', 'beginner-friendly'],
   false, true),

  ('Foam Roller (High-Density)',
   '18-inch high-density foam roller for myofascial release after leg day or long runs.',
   'High-density foam roller for post-workout recovery.',
   'recovery', 'self-massage', 1999,
   '#', 'RecoverPro', 4.5, 2150,
   ARRAY['recovery', 'mobility', 'post-workout', 'soreness'],
   false, true),

  ('Whey Protein Isolate (2 lb, Chocolate)',
   '25g protein per scoop, low sugar, mixes without a blender. Standard post-workout recovery shake.',
   'Fast-absorbing whey isolate, 25g protein per scoop.',
   'supplements', 'protein', 4499,
   '#', 'PureFuel', 4.3, 5890,
   ARRAY['protein', 'muscle-recovery', 'post-workout', 'strength-goals'],
   true, true),

  ('Creatine Monohydrate (Unflavored, 300g)',
   'Micronized creatine monohydrate, the most-studied supplement for strength and power output.',
   'Micronized creatine for strength and power.',
   'supplements', 'performance', 1899,
   '#', 'PureFuel', 4.7, 4310,
   ARRAY['strength', 'performance', 'muscle-gain'],
   false, true),

  ('Moisture-Wicking Training Shirt',
   'Lightweight, breathable shirt built for HIIT and cardio sessions. Machine washable, holds shape after repeated washes.',
   'Breathable training shirt for high-intensity workouts.',
   'apparel', 'tops', 2899,
   '#', 'MotionWear', 4.2, 960,
   ARRAY['cardio', 'hiit', 'apparel', 'breathable'],
   false, true),

  ('Compression Leggings',
   'Squat-proof compression leggings with a phone pocket, built for strength training and yoga alike.',
   'Squat-proof compression leggings with phone pocket.',
   'apparel', 'bottoms', 3999,
   '#', 'MotionWear', 4.5, 2040,
   ARRAY['strength', 'yoga', 'apparel', 'mobility'],
   false, true),

  ('Fitness Tracker Watch',
   'Tracks heart rate, sleep, steps and workouts, syncs to a phone app. 7-day battery life.',
   'Heart-rate and sleep tracker with 7-day battery life.',
   'accessories', 'wearables', 7999,
   '#', 'PulseTrack', 4.1, 6720,
   ARRAY['tracking', 'sleep', 'cardio', 'goal-setting'],
   true, true),

  ('Yoga Mat (Extra Thick)',
   '6mm thick non-slip mat for yoga, stretching, and floor work. Includes carry strap.',
   'Extra-thick non-slip mat for yoga and stretching.',
   'fitness-equipment', 'yoga', 2299,
   '#', 'FlexFit', 4.6, 3980,
   ARRAY['yoga', 'flexibility', 'recovery', 'mobility', 'beginner-friendly'],
   false, true),

  ('Electrolyte Hydration Mix (30 servings)',
   'Sugar-free electrolyte powder for hydration during long or hot workouts.',
   'Sugar-free electrolyte mix for workout hydration.',
   'nutrition', 'hydration', 2199,
   '#', 'PureFuel', 4.4, 1870,
   ARRAY['hydration', 'endurance', 'cardio', 'recovery'],
   false, true)
ON CONFLICT DO NOTHING;
