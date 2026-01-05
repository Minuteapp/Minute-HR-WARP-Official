
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // OOM-Fix: Dev-Build ohne Sourcemaps/Minify (reduziert RAM massiv)
    sourcemap: false,
    minify: mode === "production" ? "esbuild" : false,
    reportCompressedSize: false,

    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"],
        },
      },
    },
  },
  optimizeDeps: {
    // Exclude large type files from optimization
    exclude: [],
  },
  plugins: [
    react(),
    // Tagger nur im Dev-Server, nicht im Build (sonst hoher RAM-Verbrauch)
    command === "serve" && mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
