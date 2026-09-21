import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Content Security Policy aplicada só no build de produção (em desenvolvimento o
 * Vite injeta scripts e WebSocket próprios que a política bloquearia).
 * Limita de onde a página pode carregar scripts, estilos, imagens e a quem pode
 * fazer requisições: só o próprio site, a API e os serviços do OpenStreetMap.
 */
function politicaDeSeguranca(apiUrl) {
  const diretivas = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self'",
    `connect-src 'self' ${apiUrl} https://nominatim.openstreetmap.org https://router.project-osrm.org https://*.tile.openstreetmap.org`,
    "manifest-src 'self'",
    "worker-src 'self'",
  ];
  return {
    name: "ecomove-csp",
    apply: "build",
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${diretivas.join("; ")}" />`;
      return html.replace("<head>", `<head>\n    ${meta}`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = (env.VITE_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

  return {
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
          globPatterns: ["**/*.{js,css,html,png,webp,svg,woff2}"],
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
      politicaDeSeguranca(apiUrl),
    ],
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: ["ecomove-grupo-8.onrender.com"],
    },
  };
});
