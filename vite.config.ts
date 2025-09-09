import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only add componentTagger in development and if available
    ...(mode === 'development' ? (() => {
      try {
        const { componentTagger } = require("lovable-tagger");
        return [componentTagger()];
      } catch {
        return [];
      }
    })() : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'pg'],
  },
  define: {
    global: 'globalThis',
  },
}));
