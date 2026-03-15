// replacing old code with this

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'

// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       manifest: {
//         name: 'Nairobi Transit',
//         short_name: 'NBO Transit',
//         description: 'Real-time bus tracking for Nairobi',
//         theme_color: '#080D18',
//         background_color: '#080D18',
//         display: 'standalone',
//         orientation: 'portrait',
//         icons: [
//           { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
//           { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
//         ],
//       },
//     }),
//   ],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Pre-cache these files so the app works offline
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Cache API calls for 1 hour so passengers get stale data
        // rather than a blank screen on flaky connections
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      manifest: {
        name: 'Nairobi Transit',
        short_name: 'NBO Transit',
        description: 'Real-time bus tracking for Nairobi — know before you go.',
        theme_color: '#080D18',
        background_color: '#080D18',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        categories: ['travel', 'utilities'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/home.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Home screen — live bus tracking',
          },
        ],
      },
    }),
  ],

  // So absolute imports like /src/components/... resolve correctly
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})