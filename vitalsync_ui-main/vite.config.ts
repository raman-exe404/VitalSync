import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.png", "fevicon.png"],
      manifest: {
        name: "VitalSync — AI Healthcare",
        short_name: "VitalSync",
        description: "AI-powered sickle cell healthcare platform",
        theme_color: "#7c3aed",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/logo.png", sizes: "192x192", type: "image/png" },
          { src: "/logo.png", sizes: "512x512", type: "image/png" },
          { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ],
        shortcuts: [
          { name: "Emergency SOS", short_name: "SOS", url: "/sos", icons: [{ src: "/logo.png", sizes: "96x96" }] },
          { name: "Log Health",    short_name: "Log",  url: "/digital-twin", icons: [{ src: "/logo.png", sizes: "96x96" }] }
        ],
        categories: ["health", "medical"]
      },
      workbox: {
        // Cache app shell and static assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Cache API responses for offline fallback
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          },
          {
            urlPattern: /\/api\/(health-logs|alerts)/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 }
            }
          }
        ]
      },
      devOptions: {
        enabled: true  // show PWA in dev mode too
      }
    })
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
