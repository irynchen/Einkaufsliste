import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Bei Deployment auf GitHub Pages liegt die App unter /Einkaufsliste/ statt /.
const base = process.env.GH_PAGES ? '/Einkaufsliste/' : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'splash/*.png'],
      manifest: {
        id: base,
        name: 'Einkaufsliste',
        short_name: 'Einkaufsliste',
        description: 'Deine Einkaufsliste mit Kassenbon-Foto, Statistik und Budget – alles lokal auf deinem iPhone.',
        theme_color: '#34C759',
        background_color: '#F2F2F7',
        display: 'standalone',
        display_override: ['standalone'],
        orientation: 'portrait',
        start_url: base,
        scope: base,
        lang: 'de',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
