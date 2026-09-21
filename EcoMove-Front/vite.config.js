import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA: manifesto + service worker para o app ser instalável no celular
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "EcoMove",
        short_name: "EcoMove",
        description: "Caronas e corridas sustentáveis em Sorocaba e região",
        lang: "pt-BR",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#036141",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Cacheia a casca do app; as ilustrações grandes da landing ficam de fora
        globPatterns: ["**/*.{js,css,html,png,webp,woff2}"],
        navigateFallback: "/index.html",
        // Chamadas à API nunca devem cair no fallback do SPA
        navigateFallbackDenylist: [/^\/(usuarios|veiculos|caronas|avaliacoes|corridas|motoristas)/],
        runtimeCaching: [
          {
            // Mapas do OpenStreetMap: cache para navegação repetida e uso offline parcial
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles",
              expiration: { maxEntries: 400, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["ecomove-grupo-8.onrender.com"],
  },
});
