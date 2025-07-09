import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Import VitePWA

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // PWA configuration
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        // Example caching strategies - adjust as needed
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-cache',
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'), // Cache API responses (optional, be careful with dynamic data)
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'AI To-Do List',
        short_name: 'AI ToDo',
        theme_color: '#007bff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        description: "Your smart, AI-powered to-do list with voice input."
      },
      devOptions: {
        enabled: true // Set to false for production to disable dev prompts
      }
    })
  ],
  server: { // This is the added block
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,      // Ensure it uses the desired port
    hmr: {
      host: 'localhost', // For HMR to work correctly in browser
    },
  }
})
