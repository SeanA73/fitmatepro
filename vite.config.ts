import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendor code is split from app code so that a deploy touching only app
        // code doesn't invalidate ~430 kB of unchanged dependencies in every
        // returning visitor's cache.
        //
        // Worth being explicit about what this does NOT do: splitting does not
        // reduce the bytes needed for first paint. react, the router and the
        // Supabase client are all imported by the app shell, so the browser
        // still fetches them before rendering anything — in parallel requests
        // now rather than one serial one. The initial-payload reduction comes
        // from the route-level React.lazy in App.tsx and from dropping
        // framer-motion, not from this.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;

          // React and the router: only changes when React itself is upgraded.
          if (
            id.includes("/react-dom/") ||
            id.includes("/react/") ||
            id.includes("/scheduler/") ||
            id.includes("react-router")
          ) {
            return "vendor-react";
          }

          // Large and entirely independent of the UI layer.
          if (id.includes("@supabase")) return "vendor-supabase";

          // Radix primitives plus the icon set — the design-system layer.
          if (id.includes("@radix-ui") || id.includes("lucide-react")) {
            return "vendor-ui";
          }

          return "vendor";
        },
      },
    },
  },
}));
