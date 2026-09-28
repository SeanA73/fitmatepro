import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// affiliate_products ships empty (see the schema header comment), which makes
// /shop, /coach-picks and /recommendations permanently blank. Rather than
// promoting empty pages in the nav, the links are hidden until the catalogue
// actually has something in it — so seeding products restores the nav with no
// code change.
//
// The count is fetched once per page load and shared, so the header and footer
// don't each issue a query. `is_active = true` matches the read policy on the
// table, so this works for signed-out visitors too.
let cachedCount: Promise<number> | null = null;

const fetchActiveProductCount = (): Promise<number> => {
  if (!cachedCount) {
    // Wrapped in an async function: the Supabase query builder is only
    // PromiseLike, so its .then() does not produce a real Promise.
    cachedCount = (async () => {
      const { count, error } = await supabase
        .from('affiliate_products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      return error ? 0 : count ?? 0;
    })();
  }
  return cachedCount;
};

/** Resets the cache. Exported for tests and for post-seed refreshes. */
export const resetProductCountCache = () => {
  cachedCount = null;
};

export const useHasProducts = () => {
  const [hasProducts, setHasProducts] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    fetchActiveProductCount().then(count => {
      if (!active) return;
      setHasProducts(count > 0);
      setChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  return { hasProducts, checked };
};
