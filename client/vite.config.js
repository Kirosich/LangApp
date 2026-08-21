import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: '/',
        lang: 'ru',
        name: 'LangApp — KZ/EN карточки',
        short_name: 'LangApp',
        description: 'Карточки, квизы и теория для казахского и английского',
        theme_color: '#4f46e5',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // The whole server (server/middleware/basicAuth.js) sits behind
        // Basic Auth -- there is no publicly-reachable static asset, not
        // even the manifest or icons. That means nothing can be safely
        // precached at service-worker-install time: a precache fetch
        // firing before the browser has ever presented credentials would
        // just 401. So precaching is switched off entirely and every
        // cache entry is populated at runtime, only from requests that
        // have already succeeded (i.e. already carried valid Basic Auth).
        globPatterns: [],
        navigateFallback: undefined,
        runtimeCaching: [
          {
            // The SPA shell itself. NetworkFirst so a normal online visit
            // always gets the freshest build; falls back to whatever was
            // last cached if the network is down or slow.
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-shell',
              networkTimeoutSeconds: 4,
              cacheableResponse: { statuses: [200] }
            }
          },
          {
            // JS/CSS/icons/fonts -- content-hashed and immutable per
            // build, safe to serve from cache first and refresh in the
            // background.
            urlPattern: ({ request, url }) =>
              !url.pathname.startsWith('/api/') && ['script', 'style', 'image', 'font'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-assets',
              cacheableResponse: { statuses: [200] }
            }
          }
          // Deliberately no rule for /api/** -- API traffic stays
          // network-only. Caching Basic-Auth-gated API responses risks
          // serving stale or 401 bodies from cache; simplest safe choice
          // is to never cache them at all.
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
